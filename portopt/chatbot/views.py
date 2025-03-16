# views.py

import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

from .utils import get_chatbot_instance

# Instantiate a global chatbot (ALL users share conversation history).
# If you prefer user-specific history, handle it with sessions or DB.
chatbot = get_chatbot_instance()

@csrf_exempt
def chat_view(request):
    """
    A simple endpoint to handle chat requests from your Next.js frontend.
    Expects a JSON body with a 'message' field.
    Returns the chatbot's answer as JSON.
    """
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            user_message = body.get('message', '').strip()

            if not user_message:
                return JsonResponse({'error': 'No message provided.'}, status=400)

            # Get response from the chatbot
            assistant_response = chatbot.process_query(user_message)

            # Return JSON response
            return JsonResponse({'assistant': assistant_response}, status=200)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON.'}, status=400)

    return JsonResponse({'error': 'Only POST requests are allowed.'}, status=405)
