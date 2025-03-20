from django.urls import path
from .views import get_companies
from .views import save_generated_portfolio

urlpatterns = [
    path("get-companies/", get_companies, name="get_companies"),
    path("save-generated-portfolio/", save_generated_portfolio, name="save_generated_portfolio"),
]
