# serializers.py
from rest_framework import serializers
from django.contrib.auth import authenticate
from captcha.models import CaptchaStore
from .models import User
from django.conf import settings
import requests
from captcha.fields import CaptchaField



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "identifiant", "role", "preferences", "date_joined", "last_login"]
        read_only_fields = ["id", "date_joined", "last_login"]


class StepOneAuthSerializer(serializers.Serializer):
    identifiant = serializers.CharField(required=True)
    recaptcha = serializers.CharField(required=True)

    def validate(self, data):
        identifiant = data.get("identifiant")
        recaptcha_token = data.get("recaptcha")

        # 1) Check user existence by identifiant
        if not User.objects.filter(identifiant=identifiant).exists():
            raise serializers.ValidationError("No account found with this identifiant.")

        # 2) Verify Google reCAPTCHA
        secret_key = settings.RECAPTCHA_PRIVATE_KEY  # Replace with your secret key
        response = requests.post(
            "https://www.google.com/recaptcha/api/siteverify",
            data={"secret": secret_key, "response": recaptcha_token},
        )
        result = response.json()
        if not result.get("success"):
            raise serializers.ValidationError("Invalid reCAPTCHA. Please try again.")

        return data
    



class StepTwoAuthSerializer(serializers.Serializer):
    flow_token = serializers.CharField(required=True)
    identifiant = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True)

    user = serializers.HiddenField(default=None)

    def validate(self, data):
        flow_token = data.get("flow_token")
        identifiant = data.get("identifiant")
        password = data.get("password")

        # 1) Validate flow_token
        if flow_token != "valid-step1-token":
            raise serializers.ValidationError("Invalid flow token. Please repeat Step 1.")

        # 2) Authenticate user (identifiant + password)
        user = authenticate(username=identifiant, password=password)
        if not user:        
            raise serializers.ValidationError("Incorrect identifiant or password.")

        # 3) Provide user for further steps
        data["user"] = user
        return data
