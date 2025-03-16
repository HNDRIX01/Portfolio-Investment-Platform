from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from datetime import datetime
from decimal import Decimal
import csv
from rest_framework.decorators import api_view

from advisor.models import Portfolio
from .utils import (
    calculate_total_portfolios_gain,
    calculate_total_portfolios_value,
    calculate_total_portfolios_weekly_growth,
    get_portfolio_value_over_time
)

CSV_FILEPATH = r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock.csv"



@api_view(["GET"])
@login_required
def analytics_data(request):
    """API endpoint for portfolio analytics and historical values."""
    user = request.user
    total_gain = calculate_total_portfolios_gain(user, CSV_FILEPATH)
    total_value = calculate_total_portfolios_value(user, CSV_FILEPATH)
    weekly_growth = calculate_total_portfolios_weekly_growth(user, CSV_FILEPATH)
    active_portfolios = user.portfolios.count()

    # Fetch historical values for each portfolio with reduced data points (every 5th row)
    portfolios_data = [
        {
            "id": str(portfolio.id),
            "name": portfolio.name,
            "history": get_portfolio_value_over_time(portfolio, CSV_FILEPATH, step=5),  # 👈 Optimized
        }
        for portfolio in user.portfolios.all()
    ]

    response_data = {
        "total_gain": float(total_gain),
        "total_value": float(total_value),
        "weekly_growth": float(weekly_growth),
        "active_portfolios": active_portfolios,
        "portfolios": portfolios_data,  # 🔥 Single calculation (no redundant calls)
    }

    return JsonResponse(response_data, safe=False)

# Create your views here.
import pandas as pd
import os
from django.conf import settings
from rest_framework.response import Response
from rest_framework.decorators import api_view
from advisor.models import Portfolio

@api_view(["GET"])
def get_stock_data(request):
    # Load CSV file
    file_path = os.path.join(settings.BASE_DIR, r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock.csv")
    df = pd.read_csv(file_path)

    # Convert DataFrame to JSON
    stock_data = df.to_dict(orient="records")

    return Response(stock_data)

