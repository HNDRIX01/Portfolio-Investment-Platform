from django.urls import path
from .views import get_companies

urlpatterns = [
    path("get-companies/", get_companies, name="get_companies"),
]
