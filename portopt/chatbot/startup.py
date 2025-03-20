import threading
import time
from django.core.management.base import BaseCommand
from chatbot.utils import weekly_rag_pipeline  # Import the function

def run_weekly_check():
    """Runs the weekly RAG pipeline once when the server starts."""
    print("\n🔄 Checking weekly RAG pipeline on server start...")
    weekly_rag_pipeline()

# Run the function in a separate thread to avoid blocking Django startup
thread = threading.Thread(target=run_weekly_check)
thread.daemon = True  # Ensures it runs in the background
thread.start()
