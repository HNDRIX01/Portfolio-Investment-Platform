# file: build_vector_store.py

from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import FAISS
import os

# 1) Load and chunk documents
def load_and_chunk_texts(folder_path, chunk_size=1000, chunk_overlap=100):
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size, 
        chunk_overlap=chunk_overlap
    )
    docs = []
    for file_name in os.listdir(folder_path):
        if file_name.endswith(".txt"):
            with open(os.path.join(folder_path, file_name), "r", encoding="utf-8") as f:
                raw_text = f.read()
                # Split text
                chunks = text_splitter.split_text(raw_text)
                for chunk in chunks:
                    docs.append(chunk)
    return docs

def build_faiss_index(docs):
    # Initialize embeddings
    embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
    
    # Create a list of metadata dictionaries + the chunk
    metadatas = [{"source": f"chunk_{i}"} for i in range(len(docs))]
    
    # Convert doc list into LangChain Document object (optional convenience)
    from langchain.docstore.document import Document
    doc_objects = [Document(page_content=text, metadata=meta) for text, meta in zip(docs, metadatas)]
    
    # Build the vector store
    vector_store = FAISS.from_documents(doc_objects, embedder)
    return vector_store

if __name__ == "__main__":
    folder_path = r"C:\Users\USER\Desktop\Investment Platform\docs for chat"  # where your .txt files are
    docs = load_and_chunk_texts(folder_path)
    vector_store = build_faiss_index(docs)
    
    # Save FAISS index to disk
    vector_store.save_local(r"C:\Users\USER\Desktop\Investment Platform\portopt\chatbot\chat_db\index.faiss")  # creates faiss_index folder with index and pickled store
    print("FAISS index built and saved successfully.")
