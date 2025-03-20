import os
import re
import requests
import fitz  # PyMuPDF
import pandas as pd
from datetime import datetime, timedelta

# For your RAG retrieval
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings

####################################################################################
# CONFIG / GLOBALS
####################################################################################

# Directories
REPORTS_DIR = "chatbot/chat_db/RH/PDFs"
TXT_OUTPUT_FOLDER = "chatbot/chat_db/RH/Texts"
TABLE_OUTPUT_FOLDER = "chatbot/chat_db/RH/Tables"
CSV_FOLDER = TABLE_OUTPUT_FOLDER  # used in ranking
RANK_OUTPUT_FOLDER = "chatbot/chat_db/RH/Rank"
RANK_TXT_FOLDER = os.path.join(RANK_OUTPUT_FOLDER, "txt")

# Date cutoff for new PDF naming format
CUTOFF_DATE = datetime(2024, 2, 23)

# Column Mappings and Desired Columns for Ranking
COLUMN_MAPPING = {
    'Valeur': 'Stock',
    'Cours': 'Price',
    'Capi.': 'Market_Cap',
    'Performance Semaine': 'Weekly_Performance',
    "Performance Déb. de l'année": 'YTD_Performance',
    'Volumes échangés': 'Volume',
    'P/E 2024': 'PE_2024',
    'P/E 2025p': 'PE_2025',
    'Dividende En DT': 'Dividend_2025_DT',
    'Dividende En %': 'Dividend_2025_Perc',
    'Date dist.': 'Date_Dist',
    'P/B': 'PB_Ratio',
    'Participation': 'Foreign_Participation',
    'Recommandation': 'Recommendation'
}
DESIRED_COLUMNS_YTD = ['Stock', 'YTD_Performance', 'Recommendation', 'PE_2024', 'PE_2025', 'PB_Ratio']
DESIRED_COLUMNS_4WEEKS = ['Stock', 'Last_4_Weeks_Performance', 'Recommendation', 'PE_2024', 'PE_2025', 'PB_Ratio']


####################################################################################
# RAGChatbot Class: Vector Store + Gemini Model + Pipeline
####################################################################################

class RAGChatbot:
    def __init__(self, index_folder, api_key, gemini_model="gemini-2.0-flash"):
        """
        Initialize the chatbot with:
          - A loaded FAISS vector store (for knowledge retrieval).
          - A configured generative AI model (Gemini).
          - A system prompt for context and conversation style.
          - Storage for conversation history and for the newly loaded (weekly text + ranking data).
        """
        self.vector_store = self.load_vector_store(index_folder)
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(gemini_model)

        self.system_prompt = (
            "You are an expert virtual assistant dedicated to the Investment Portfolio Management Platform "
            "of the Arab Tunisian Bank (ATB). This platform provides portfolio recommendations, detailed analytical "
            "dashboards, and investment performance insights. If and only if the provided context is not enough, "
            "do a small research online (where possible) and answer confidently if data is available. If the information "
            "is insufficient or unclear, explicitly state that you cannot confidently answer based on available data. "
            "You may also briefly complement your response with concise, accurate insights from reliable external financial "
            "sources if necessary. Do not mention that you are provided with context information. For the rest of the "
            "conversation, never start with phrases like 'based on provided text' or 'based on document'. Suppose that "
            "the provided CONTEXT is your knowledge."
        )

        # Maintain conversation history (list of tuples of (user_query, assistant_answer))
        self.conversation_history = []

        # Will hold the last weekly text + the ranking texts
        self.recent_weekly_text = ""
        self.ranking_texts_combined = ""

    def load_vector_store(self, index_folder):
        """
        Load the FAISS vector store from disk.
        """
        embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-mpnet-base-v2")
        vector_store = FAISS.load_local(
            index_folder, 
            embeddings=embedder, 
            allow_dangerous_deserialization=True  # Required for older pickled indexes
        )
        return vector_store

    def load_recent_data(self):
        """
        Loads the most recent text from the weekly reports (TXT_OUTPUT_FOLDER) plus
        the latest ranking text files (RANK_TXT_FOLDER). Concatenates ranking texts
        and stores them in self.ranking_texts_combined.
        """
        recent_file_path = get_most_recent_text_file(TXT_OUTPUT_FOLDER)
        if recent_file_path:
            self.recent_weekly_text = load_text_file(recent_file_path) or ""
        else:
            self.recent_weekly_text = ""

        rank_texts = load_all_text_files(RANK_TXT_FOLDER)  # returns list of contents
        if rank_texts:
            self.ranking_texts_combined = "\n\n".join(rank_texts)
        else:
            self.ranking_texts_combined = ""

    def retrieve_relevant_docs(self, query, k=3):
        """
        Retrieve the top-k documents relevant to the query from the vector store.
        """
        return self.vector_store.similarity_search(query, k=k)

    def construct_prompt(self, query, docs):
        """
        Build the final prompt to send to the Gemini API, including:
          - System prompt
          - Conversation history
          - Retrieved documents as 'CONTEXT'
          - The most recent weekly text
          - The ranking texts (YTD + last 4 weeks)
          - User query
        """
        # Documents from vector store
        combined_docs = "\n\n".join([doc.page_content for doc in docs])

        # Combine everything into the context chunk
        context_parts = []
        if combined_docs.strip():
            context_parts.append(combined_docs)

        if self.recent_weekly_text.strip():
            context_parts.append(self.recent_weekly_text.strip())

        if self.ranking_texts_combined.strip():
            context_parts.append(self.ranking_texts_combined.strip())

        final_context = "\n\n".join(context_parts)

        # Build up conversation history
        if self.conversation_history:
            history_text = "\n".join([
                f"USER: {q}\nASSISTANT: {a}"
                for q, a in self.conversation_history
            ])
            conversation_section = f"CONVERSATION HISTORY:\n{history_text}\n---\n"
        else:
            conversation_section = ""

        # Final prompt
        final_prompt = f"""
{self.system_prompt}

{conversation_section}
CONTEXT:
{final_context}
---
USER QUESTION:
{query}
YOUR ANSWER:
"""
        return final_prompt.strip()

    def process_query(self, query, k=3):
        """
        Process a single user query:
          - Retrieve relevant documents
          - Construct the full prompt
          - Generate an answer via the model
          - Update conversation history
        """
        # Make sure we have the up-to-date ranking + weekly text
        self.load_recent_data()

        # Retrieve docs from vector store
        docs = self.retrieve_relevant_docs(query, k=k)

        # Build full prompt
        prompt = self.construct_prompt(query, docs)

        # Generate answer
        response_obj = self.model.generate_content(prompt)
        try:
            response_text = response_obj.text
        except AttributeError:
            response_text = "[No response text]"

        # Update conversation history
        self.conversation_history.append((query, response_text))
        return response_text


####################################################################################
# Helper function to get or create a chatbot instance
####################################################################################

def get_chatbot_instance():
    """
    Returns an instance of RAGChatbot.
    If you want the same instance for all requests (sharing conversation),
    you can instantiate once at module level. Otherwise, create a new instance each time.
    """
    index_folder = r"C:\Users\USER\Desktop\Investment Platform\portopt\chatbot\chat_db\index.faiss"
    api_key = "AIzaSyDA1yOBjhsz1LAFPuPE0xHMURgv3uzqUeg"  # Replace with your actual key or environment variable
    return RAGChatbot(index_folder=index_folder, api_key=api_key)


####################################################################################
# 1. Downloading Weekly Reports
####################################################################################

def download_file(url, file_path):
    """Downloads a file from URL and saves it to file_path."""
    try:
        response = requests.get(url, timeout=10)
        if response.status_code == 200:
            with open(file_path, "wb") as file:
                file.write(response.content)
            print(f"✅ Downloaded: {os.path.basename(file_path)}")
            return True
        else:
            print(f"❌ File not found: {os.path.basename(file_path)} ({url})")
            return False
    except requests.RequestException as e:
        print(f"⚠️ Request failed for {url}: {e}")
        return False


def download_reports(num_weeks=10):
    """
    Downloads weekly reports from the target URL using the appropriate URL format based on date.
    """
    os.makedirs(REPORTS_DIR, exist_ok=True)
    today = datetime.today()

    for i in range(num_weeks):
        past_friday = today - timedelta(weeks=i)
        # Adjust to Friday (weekday()=4 for Friday)
        past_friday = past_friday - timedelta(days=(past_friday.weekday() - 4) % 7)
        year_month = past_friday.strftime("%Y-%m")
        file_name_base = f"RH_{past_friday.strftime('%d_%m_%Y')}_fr"

        if past_friday >= CUTOFF_DATE:
            # New format: Try _fr_1.pdf, then _fr_0.pdf, then no suffix
            for suffix in ["_1", "_0", ""]:
                file_name = f"{file_name_base}{suffix}.pdf"
                file_url = f"https://www.afc.com.tn/sites/default/files/{year_month}/{file_name}"
                file_path = os.path.join(REPORTS_DIR, file_name)

                if os.path.exists(file_path):
                    print(f"✅ File already exists: {file_name}")
                    break

                if download_file(file_url, file_path):
                    break  # Stop once a file is successfully downloaded
        else:
            # Old format: no suffix
            file_name = f"{file_name_base}.pdf"
            file_url = f"https://www.afc.com.tn/sites/default/files/{year_month}/{file_name}"
            file_path = os.path.join(REPORTS_DIR, file_name)

            if os.path.exists(file_path):
                print(f"✅ File already exists: {file_name}")
                continue

            download_file(file_url, file_path)

    print("✅ Finished downloading all available reports! ✅")


# ============================
# 2. Extract Text & Tables from PDFs
# ============================
def extract_text_and_tables(pdf_path):
    """
    Extracts text and tables from a PDF file using PyMuPDF.
    
    Returns:
        tuple: (extracted_text, tables_data) where tables_data is a list of DataFrames.
    """
    try:
        doc = fitz.open(pdf_path)
        extracted_text = []
        tables_data = []

        for page_num, page in enumerate(doc, start=1):
            # Extract plain text
            text = page.get_text("text")
            extracted_text.append(f"Page {page_num}:\n{text}")

            # Extract tables as Pandas DataFrames
            try:
                tables_on_page = page.find_tables()
                if tables_on_page:
                    for table_num, table in enumerate(tables_on_page, start=1):
                        df = table.to_pandas()
                        if not df.empty:
                            tables_data.append(df)
            except Exception as te:
                print(f"Error extracting tables from page {page_num} of {pdf_path}: {te}")

        return "\n\n".join(extracted_text), tables_data

    except Exception as e:
        print(f"Error processing {pdf_path}: {str(e)}")
        return None, None


def extract_date_from_filename(filename):
    """
    Extracts a date (dd_mm_yyyy) from a filename matching 'RH_dd_mm_yyyy_fr'.
    """
    match = re.search(r"RH_(\d{2}_\d{2}_\d{4})_fr", filename)
    if match:
        return match.group(1)
    return None


def process_pdfs(input_folder=REPORTS_DIR, txt_folder=TXT_OUTPUT_FOLDER, tables_folder=TABLE_OUTPUT_FOLDER):
    """
    Processes all PDFs in input_folder by extracting text and the third table.
    Saves text files to txt_folder and third tables as CSV files to tables_folder.
    """
    os.makedirs(txt_folder, exist_ok=True)
    os.makedirs(tables_folder, exist_ok=True)

    pdf_files = [f for f in os.listdir(input_folder) if f.lower().endswith(".pdf")]

    if not pdf_files:
        print(f"No PDF files found in '{input_folder}'.")
        return

    print(f"Found {len(pdf_files)} PDFs. Processing...")

    for pdf_file in pdf_files:
        pdf_path = os.path.join(input_folder, pdf_file)
        base_name = os.path.splitext(pdf_file)[0]

        # Extract date if the file starts with 'RH'
        date = extract_date_from_filename(base_name) if base_name.startswith("RH") else None

        text, tables = extract_text_and_tables(pdf_path)

        # Save extracted text
        if text:
            text_file = os.path.join(txt_folder, f"{base_name}.txt")
            try:
                with open(text_file, "w", encoding="utf-8") as f:
                    f.write(text)
                print(f"Saved text to {text_file}")
            except Exception as e:
                print(f"Error saving text for {pdf_file}: {e}")

        # Save only the 3rd table (if exists)
        if tables and len(tables) >= 3:
            third_table = tables[2]
            csv_filename = f"stockguide_{date}.csv" if date else f"stockguide_{base_name}.csv"
            csv_file_path = os.path.join(tables_folder, csv_filename)
            try:
                third_table.to_csv(csv_file_path, index=False, encoding="utf-8")
                print(f"Saved 3rd table to {csv_file_path}")
            except Exception as e:
                print(f"Error saving 3rd table for {pdf_file}: {e}")


# ============================
# 3. Ranking Data from Tables
# ============================
# Manually Defined Column Mapping and desired columns
COLUMN_MAPPING = {
    'Valeur': 'Stock',
    'Cours': 'Price',
    'Capi.': 'Market_Cap',
    'Performance Semaine': 'Weekly_Performance',
    "Performance Déb. de l'année": 'YTD_Performance',
    'Volumes échangés': 'Volume',
    'P/E 2024': 'PE_2024',
    'P/E 2025p': 'PE_2025',
    'Dividende En DT': 'Dividend_2025_DT',
    'Dividende En %': 'Dividend_2025_Perc',
    'Date dist.': 'Date_Dist',
    'P/B': 'PB_Ratio',
    'Participation': 'Foreign_Participation',
    'Recommandation': 'Recommendation'
}

DESIRED_COLUMNS_YTD = ['Stock', 'YTD_Performance', 'Recommendation', 'PE_2024', 'PE_2025', 'PB_Ratio']
DESIRED_COLUMNS_4WEEKS = ['Stock', 'Last_4_Weeks_Performance', 'Recommendation', 'PE_2024', 'PE_2025', 'PB_Ratio']


def load_and_clean_csv(filepath):
    """
    Loads a CSV file and cleans it starting from the row where 'AETECH' appears.
    """
    df = pd.read_csv(filepath, encoding='latin1', header=None)
    df.columns = ['Col0', 'Stock', 'Price', 'Market_Cap', 'Performance Semaine', "Performance Déb. de l'année",
                  'Volume', 'P/E 2024', 'P/E 2025p', 'Dividende En DT', 'Dividende En %', 'Date dist.', 'P/B',
                  'Participation', 'Recommandation']
    stock_start_idx = df[df['Stock'].astype(str).str.strip().str.upper() == 'AETECH'].index[0]
    df = df[stock_start_idx:].reset_index(drop=True)
    df.rename(columns=COLUMN_MAPPING, inplace=True)

    percentage_cols = ['Weekly_Performance', 'YTD_Performance', 'Foreign_Participation', 'Dividend_2025_Perc']
    ratio_cols = ['PE_2024', 'PE_2025', 'PB_Ratio']
    numeric_cols = ['Price', 'Market_Cap', 'Volume', 'Dividend_2025_DT']

    for col in percentage_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace('%', '').str.replace(',', '.').apply(pd.to_numeric, errors='coerce') / 100

    for col in ratio_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace('x', '').str.replace(',', '.').apply(pd.to_numeric, errors='coerce')

    for col in numeric_cols:
        if col in df.columns:
            df[col] = df[col].astype(str).str.replace(',', '.').apply(pd.to_numeric, errors='coerce')

    return df


def get_last_4_weeks_files(folder=CSV_FOLDER):
    """
    Returns the paths of the last 4 weekly stock guide CSV files based on the date in the filename.
    """
    files = [f for f in os.listdir(folder) if f.startswith('stockguide_') and f.endswith('.csv')]
    files_with_dates = []

    for file in files:
        try:
            date_str = re.search(r'\d{2}_\d{2}_\d{4}', file).group()
            file_date = datetime.strptime(date_str, '%d_%m_%Y')
            files_with_dates.append((file_date, os.path.join(folder, file)))
        except Exception:
            continue

    files_with_dates.sort(key=lambda x: x[0], reverse=True)
    return [f[1] for f in files_with_dates[:4]]


def save_ranking_to_csv(df, ranking_type, date, output_folder=RANK_OUTPUT_FOLDER):
    """
    Saves the ranking DataFrame to a CSV file.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    filename = os.path.join(output_folder, f"{ranking_type}_ranking_{date}.csv")
    df.to_csv(filename, index=False)
    print(f"Saved {ranking_type} ranking to: {filename}")


def rank_stock_data():
    """
    Processes the latest CSV files to rank stocks based on Year-To-Date and Last 4 Weeks Performance.
    """
    latest_files = get_last_4_weeks_files()
    if not latest_files:
        print("No stock guide CSV files found.")
        return

    # Sum the weekly performance for the last 4 weeks
    weekly_performance_data = {}
    for file in latest_files:
        df = load_and_clean_csv(file)
        for _, row in df.iterrows():
            stock = row['Stock']
            weekly_performance_data[stock] = weekly_performance_data.get(stock, 0) + row['Weekly_Performance']

    weekly_performance_df = pd.DataFrame(list(weekly_performance_data.items()), columns=['Stock', 'Last_4_Weeks_Performance'])
    latest_df = load_and_clean_csv(latest_files[0])
    latest_date_str = re.search(r'\d{2}_\d{2}_\d{4}', latest_files[0]).group()
    final_df = latest_df.merge(weekly_performance_df, on='Stock', how='left')

    # Year-To-Date Performance Ranking
    ytd_ranking = final_df.sort_values(by='YTD_Performance', ascending=False, na_position='last')
    ytd_ranking_output = ytd_ranking[DESIRED_COLUMNS_YTD]
    save_ranking_to_csv(ytd_ranking_output, "year_to_date", latest_date_str)

    # Last 4 Weeks Performance Ranking
    last_4_weeks_ranking = final_df.sort_values(by='Last_4_Weeks_Performance', ascending=False, na_position='last')
    last_4_weeks_output = last_4_weeks_ranking[DESIRED_COLUMNS_4WEEKS]
    save_ranking_to_csv(last_4_weeks_output, "last_4_weeks", latest_date_str)

    print("Ranking processing complete.")


# ============================
# 4. Update Text Files from Ranking CSVs
# ============================
def create_txt_from_recent_csv(csv_folder=RANK_OUTPUT_FOLDER, txt_folder=RANK_TXT_FOLDER):
    """
    Finds the most recent ranking CSV files for both last 4 weeks and YTD, and copies their content
    to corresponding text files in txt_folder.
    """
    def get_most_recent_file(prefix):
        files = [f for f in os.listdir(csv_folder)
                 if f.startswith(prefix) and f.endswith(".csv")]
        files_with_dates = []
        for file in files:
            match = re.search(r'\d{2}_\d{2}_\d{4}', file)
            if not match:
                continue
            date_str = match.group()
            try:
                file_date = datetime.strptime(date_str, '%d_%m_%Y')
                files_with_dates.append((file_date, file))
            except ValueError:
                continue
        if not files_with_dates:
            return None
        files_with_dates.sort(key=lambda x: x[0], reverse=True)
        return files_with_dates[0][1]

    def extract_date(filename):
        if filename is None:
            return None
        match = re.search(r'\d{2}_\d{2}_\d{4}', filename)
        return match.group() if match else None

    last4w_file = get_most_recent_file("last_4_weeks_ranking")
    ytd_file = get_most_recent_file("year_to_date_ranking")
    last4w_date = extract_date(last4w_file)
    ytd_date = extract_date(ytd_file)
    last4w_txt_name = f"last_4_weeks_ranking_{last4w_date}.txt" if last4w_date else None
    ytd_txt_name = f"year_to_date_ranking_{ytd_date}.txt" if ytd_date else None

    # Check if txt files already exist
    files_are_current = False
    if last4w_txt_name and ytd_txt_name:
        path1 = os.path.join(txt_folder, last4w_txt_name)
        path2 = os.path.join(txt_folder, ytd_txt_name)
        if os.path.exists(path1) and os.path.exists(path2):
            files_are_current = True

    if files_are_current:
        print("Text files already up-to-date in the txt folder. No action taken.")
        return

    os.makedirs(txt_folder, exist_ok=True)
    # Remove old txt files
    for f in os.listdir(txt_folder):
        if f.endswith(".txt"):
            os.remove(os.path.join(txt_folder, f))

    # Copy content from CSVs to new txt files
    if last4w_file and last4w_txt_name:
        csv_path = os.path.join(csv_folder, last4w_file)
        txt_path = os.path.join(txt_folder, last4w_txt_name)
        with open(csv_path, "r", encoding="utf-8") as infile, open(txt_path, "w", encoding="utf-8") as outfile:
            outfile.write(infile.read())
    if ytd_file and ytd_txt_name:
        csv_path = os.path.join(csv_folder, ytd_file)
        txt_path = os.path.join(txt_folder, ytd_txt_name)
        with open(csv_path, "r", encoding="utf-8") as infile, open(txt_path, "w", encoding="utf-8") as outfile:
            outfile.write(infile.read())

    print("Text files have been updated in the txt folder.")


# ============================
# 5. Load Text Files for Further Processing
# ============================
def get_most_recent_text_file(directory):
    """
    Returns the full path of the most recent text file in the given directory based on filename date.
    """
    pattern = re.compile(r"RH_(\d{2})_(\d{2})_(\d{4})_.*\.txt")
    files = []
    for filename in os.listdir(directory):
        match = pattern.match(filename)
        if match:
            day, month, year = map(int, match.groups())
            date = datetime(year, month, day)
            files.append((date, filename))
    if not files:
        print("No valid text files found.")
        return None
    most_recent_file = max(files, key=lambda x: x[0])[1]
    return os.path.join(directory, most_recent_file)


def load_text_file(file_path):
    """
    Loads and returns the content of a text file.
    """
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read()
    except FileNotFoundError:
        print(f"Error: The file '{file_path}' was not found.")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None


def load_all_text_files(directory):
    """
    Loads all .txt files from a directory and returns a list of their contents.
    """
    texts = []
    for filename in os.listdir(directory):
        if filename.endswith(".txt"):
            file_path = os.path.join(directory, filename)
            content = load_text_file(file_path)
            if content is not None:
                texts.append(content)
    return texts


def load_recent_texts(texts_dir=TXT_OUTPUT_FOLDER, rank_txt_dir=RANK_TXT_FOLDER):
    """
    Loads the most recent text file from the texts_dir and all text files from the rank_txt_dir.
    """
    recent_file_path = get_most_recent_text_file(texts_dir)
    recent_text_content = None
    if recent_file_path:
        recent_text_content = load_text_file(recent_file_path)
        print("Most recent text file loaded successfully.")
    rank_texts = load_all_text_files(rank_txt_dir)
    print(f"Loaded {len(rank_texts)} files from the Rank/txt folder.")
    return recent_text_content, rank_texts

def weekly_rag_pipeline():
    """
    Ensures the last 10 weeks' PDFs are downloaded, text & tables are extracted,
    rankings are calculated, and ranking texts are up to date.
    """
    print("\n🚀 Running Weekly RAG Pipeline...")

    today = datetime.today()
    missing_pdfs = []

    # 1) Check if the last 10 weekly PDFs exist locally
    for i in range(10):
        past_friday = today - timedelta(weeks=i)
        # Adjust to Friday
        past_friday = past_friday - timedelta(days=(past_friday.weekday() - 4) % 7)
        report_date_str = past_friday.strftime("%d_%m_%Y")
        pdf_name = f"RH_{report_date_str}_fr.pdf"
        pdf_path = os.path.join(REPORTS_DIR, pdf_name)

        if not os.path.exists(pdf_path):
            missing_pdfs.append(pdf_name)

    # 2) Download missing PDFs if necessary
    if missing_pdfs:
        print(f"📂 Missing {len(missing_pdfs)} report(s). Downloading now...")
        # This calls your existing download_reports() which checks up to num_weeks=10
        download_reports(num_weeks=10)
    else:
        print("✅ All last 10 weekly reports are already downloaded.")

    # 3) Process all PDFs in the REPORTS_DIR to extract text and 3rd table
    #    This ensures newly downloaded PDFs also get processed.
    process_pdfs(REPORTS_DIR, TXT_OUTPUT_FOLDER, TABLE_OUTPUT_FOLDER)

    # 4) Check if ranking data is up to date; if not, run the ranking pipeline
    recent_rank_files = get_last_4_weeks_files()
    if not recent_rank_files or not os.path.exists(recent_rank_files[0]):
        print("📊 Ranking data is outdated. Recalculating now...")
        rank_stock_data()
    else:
        print("✅ Ranking data is already up-to-date.")

    # 5) Check if the text files for rankings exist; if not, create them
    if not os.path.isdir(RANK_TXT_FOLDER):
        os.makedirs(RANK_TXT_FOLDER, exist_ok=True)

    rank_txt_contents = os.listdir(RANK_TXT_FOLDER)
    if not rank_txt_contents:
        print("📄 Ranking text files missing. Generating now...")
        create_txt_from_recent_csv()
    else:
        print("✅ Ranking text files are already up-to-date.")
    rank_stock_data()
    print("\n🎯 Weekly RAG pipeline completed successfully! 🚀")
