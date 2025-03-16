# utils.py

import random
import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_huggingface import HuggingFaceEmbeddings


class RAGChatbot:
    def __init__(self, index_folder, api_key, gemini_model="gemini-2.0-flash"):
        """
        Initialize the chatbot with:
          - A loaded FAISS vector store (for knowledge retrieval).
          - A configured generative AI model (Gemini).
          - A system prompt for context and conversation style.
        """
        self.vector_store = self.load_vector_store(index_folder)
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel(gemini_model)
        self.system_prompt = (
            "You are an expert virtual assistant dedicated to the Investment Portfolio Management Platform of the Arab Tunisian Bank (ATB). "
            "This platform provides portfolio recommendations, detailed analytical dashboards, and investment performance insights. "
            "if and only if the provided context is not enough. Do a small research online, and answer with confidence ofc if data is available, "
            "specially when it comes to overall investements stuff, but if the information is insufficient or unclear in the context, "
            "or search online didnt help. explicitly state that you cannot confidently answer based on available data. "
            "You may also briefly complement your response with concise, accurate insights from reliable external financial sources if necessary. "
            "Do not mention that you are provided with context information. "
            "For the rest of the conversation, never start with 'based on provided text' or 'based on document'. "
            "Suppose that the provided 'CONTEXT' is your knowledge."
        )
        # Maintain conversation history (list of tuples of user query and assistant answer)
        self.conversation_history = []

    def load_vector_store(self, index_folder):
        """
        Load the FAISS vector store from disk.
        """
        embedder = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")
        vector_store = FAISS.load_local(
            index_folder, 
            embeddings=embedder, 
            allow_dangerous_deserialization=True  # Required for older pickled indexes
        )
        return vector_store

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
          - Retrieved documents as the 'CONTEXT'
          - User query
        """
        combined_context = "\n\n".join([doc.page_content for doc in docs])

        if self.conversation_history:
            history_text = "\n".join(
                [f"USER: {q}\nASSISTANT: {a}" for q, a in self.conversation_history]
            )
            conversation_section = f"CONVERSATION HISTORY:\n{history_text}\n---\n"
        else:
            conversation_section = ""

        final_prompt = f"""
{self.system_prompt}

{conversation_section}
CONTEXT:
{combined_context}
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
        docs = self.retrieve_relevant_docs(query, k=k)
        prompt = self.construct_prompt(query, docs)
        response_obj = self.model.generate_content(prompt)

        # Safely extract the response text
        try:
            response_text = response_obj.text
        except AttributeError:
            response_text = "[No response text]"

        # Update conversation history
        self.conversation_history.append((query, response_text))
        return response_text


def get_chatbot_instance():
    """
    Returns an instance of RAGChatbot.
    If you want the same instance for all requests (sharing conversation),
    you can instantiate once at module level. Otherwise, create a new instance each time.
    """
    # Adjust path and API key as needed
    index_folder = r"C:\Users\USER\Desktop\Investment Platform\portopt\chatbot\chat_db\index.faiss"
    api_key = "AIzaSyDA1yOBjhsz1LAFPuPE0xHMURgv3uzqUeg"
    return RAGChatbot(index_folder=index_folder, api_key=api_key)
