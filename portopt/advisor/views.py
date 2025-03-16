# views.py
from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.permissions import IsAuthenticated

# Captcha
from captcha.models import CaptchaStore
from captcha.helpers import captcha_image_url

# Models & serializers
from .models import User
from .serializers import (
    UserSerializer,
    StepOneAuthSerializer,
    StepTwoAuthSerializer,
)

import logging

logger = logging.getLogger(__name__)

############################
# USER VIEWSET (CRUD)
############################
class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

############################
# CAPTCHA IMAGE ENDPOINT
############################
class CaptchaImage(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, key=None):
        if key is None:
            new_captcha = CaptchaStore.objects.create()
            key = new_captcha.hashkey
            logger.debug(f"Generated CAPTCHA with key: {key}")

        image_url = captcha_image_url(key)
        absolute_image_url = request.build_absolute_uri(image_url)
        logger.debug(f"Captcha image URL: {absolute_image_url}")

        return Response({
            "key": key,
            "image_url": absolute_image_url
        })

############################
# STEP 1: Identifiant + CAPTCHA
############################
class StepOneAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StepOneAuthSerializer(data=request.data)
        if serializer.is_valid():
            # Return a flow token (customize as needed)
            flow_token = "valid-step1-token"
            return Response({
                "message": "Step 1 valid",
                "flow_token": flow_token
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

############################
# STEP 2: Password + flow_token
############################
class StepTwoAuthView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StepTwoAuthSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data["user"]
            # Generate JWT tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            refresh_token = str(refresh)

            # Create response and set tokens as HttpOnly cookies
            response = Response({
                "message": "Login successful",
                "user": UserSerializer(user).data
            }, status=status.HTTP_200_OK)
            response.set_cookie(
                key="access",
                value=access_token,
                httponly=True,
                secure=False,       # Set to True in production (with HTTPS)
                samesite="Lax"
            )
            response.set_cookie(
                key="refresh",
                value=refresh_token,
                httponly=True,
                secure=False,       # Set to True in production
                samesite="Lax"
            )
            return response

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

############################
# LOGOUT ENDPOINT
############################


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        # This log will only show if the view is called, which means the permission check passed.
        logger.info("Logout request received for user: %s", request.user)

        # If for some reason the user is not authenticated, log and return a detailed message.
        if not request.user or not request.user.is_authenticated:
            logger.error("Logout failed: User is not authenticated. Request data: %s", request.data)
            return Response({"message": "Unauthorized: User not authenticated"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh_token = request.COOKIES.get("refresh")
        if refresh_token:
            try:
                token = RefreshToken(refresh_token)
                token.blacklist()  # Ensure the blacklist app is enabled if you are using it
                logger.info("Refresh token blacklisted successfully for user: %s", request.user)
            except Exception as e:
                logger.error("Error blacklisting token for user %s: %s", request.user, str(e))
        else:
            logger.warning("No refresh token found in cookies for user: %s", request.user)

        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie("access")
        response.delete_cookie("refresh")
        logger.info("Logout process completed for user: %s", request.user)
        return response
