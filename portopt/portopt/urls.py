
from django.contrib import admin
from django.urls import path,include
from advisor.views import StepOneAuthView, StepTwoAuthView, CaptchaImage, LogoutView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

#from advisor.views import get_predicted_values

urlpatterns = [
    path('admin/', admin.site.urls),

    path("api/", include("graph.urls")),  
    path("chatbot/", include("chatbot.urls")),
    path("recommendations/", include("recommendations.urls")),
    path('captcha-image/', CaptchaImage.as_view(), name='captcha-image'),  # No key needed for first request
    
    path('captcha/', include('captcha.urls')),

    path('step-one-auth/', StepOneAuthView.as_view(), name='step_one_auth'),
    path('step-two-auth/', StepTwoAuthView.as_view(), name='step_two_auth'),
    

    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),  # Login endpoint
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),  # Refresh token endpoint
    path('logout/', LogoutView.as_view(), name='logout'),
    #path('predict/<str:company_name>/', get_predicted_values, name='predict'),  # Predict endpoint
]


