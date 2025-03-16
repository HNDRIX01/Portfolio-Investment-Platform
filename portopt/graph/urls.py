from django.urls import path
from .views import analytics_data, get_stock_data

urlpatterns = [
    path("stocks/", get_stock_data, name="get_stock_data"),
    path("analytics/", analytics_data, name="analytics_data" ),
]