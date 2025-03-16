import csv
from datetime import datetime, timedelta, date
from decimal import Decimal
from advisor.models import Portfolio, Asset, PortfolioAsset

from rest_framework_simplejwt.backends import TokenBackend

CSV_FILEPATH=r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock.csv"

def get_user_from_token(token):
    """
    Decode the JWT token and return the user_id.
    This can be used in views to avoid rechecking the token in every endpoint.
    """
    token_backend = TokenBackend(algorithm="HS256")
    try:
        validated_data = token_backend.decode(token, verify=True)
        return validated_data.get("user_id")
    except Exception:
        return None


def fetch_portfolios(user):
    """
    Return all portfolios associated with the given user.
    """
    return user.portfolios.all()

import csv
from decimal import Decimal

def get_current_prices(csv_filepath=r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock.csv"):
    """
    Reads the CSV file and returns a dictionary mapping each ticker symbol
    to its most recent price. The CSV is expected to have a header like:
    Date,AAPL,AMZN,GLD,GOOG,MSFT,SLV, and the last row contains the latest prices.
    """
    with open(csv_filepath, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        last_row = None
        for row in reader:
            last_row = row  # iterate to the last row
        if not last_row:
            raise ValueError("CSV file is empty or not properly formatted.")
        
        # Build a dictionary with ticker symbols as keys and their current price as Decimal.
        current_prices = {}
        for key, value in last_row.items():
            if key == "Date":
                continue
            current_prices[key] = Decimal(value)
    return current_prices

def calculate_portfolio_value(portfolio, csv_filepath=r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock.csv"):
    """
    Calculates the current value of a single portfolio.
    
    For each investment (PortfolioAsset) in the portfolio, it multiplies the
    quantity held by the current price of the asset. The asset's ticker_symbol is
    used to lookup the price from the CSV file. If a ticker symbol is not found in the CSV,
    that asset is skipped.
    """
    current_prices = get_current_prices(csv_filepath)
    total_value = Decimal("0.0")
    for investment in portfolio.investments.all():
        ticker = investment.asset.ticker_symbol
        if ticker and ticker in current_prices:
            total_value += investment.quantity * current_prices[ticker]
    return total_value

def calculate_total_portfolios_value(user, csv_filepath=r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock.csv"):
    """
    Calculates the total current value of all portfolios associated with the given user.
    
    It uses the fetch_portfolios(user) function (assumed available) to get all portfolios,
    then sums their individual calculated values.
    """
    portfolios = fetch_portfolios(user)
    total_value = Decimal("0.0")
    for portfolio in portfolios:
        total_value += calculate_portfolio_value(portfolio, csv_filepath)
    return total_value


def portfolio_initial_value(portfolio):
    """
    Calculates the initial invested value of a portfolio by summing the total_purchase
    for each investment in the portfolio.
    
    Args:
        portfolio: A Portfolio instance.
        
    Returns:
        Decimal: The total initial value.
    """
    initial_value = Decimal("0.0")
    for investment in portfolio.investments.all():
        initial_value += investment.total_purchase
    return initial_value

def calculate_portfolio_gain(portfolio, csv_filepath="prices.csv"):
    """
    Calculates the gain for a single portfolio.
    
    Gain is computed as:
        current portfolio value (using latest CSV prices) - initial investment value.
    
    Args:
        portfolio: A Portfolio instance.
        csv_filepath: Path to the CSV file with the latest prices.
        
    Returns:
        Decimal: The gain (or loss) for the portfolio.
    """
    current_value = calculate_portfolio_value(portfolio, csv_filepath)
    initial_value = portfolio_initial_value(portfolio)
    return current_value - initial_value

def calculate_total_portfolios_gain(user, csv_filepath="prices.csv"):
    """
    Calculates the total gain across all portfolios associated with the given user.
    
    It fetches all portfolios for the user using fetch_portfolios(user) and sums the gain
    from each portfolio.
    
    Args:
        user: A User instance.
        csv_filepath: Path to the CSV file with the latest prices.
        
    Returns:
        Decimal: The total gain (or loss) across all portfolios.
    """
    portfolios = fetch_portfolios(user)
    total_gain = Decimal("0.0")
    for portfolio in portfolios:
        total_gain += calculate_portfolio_gain(portfolio, csv_filepath)
    return total_gain


import csv
from decimal import Decimal

def parse_prices_from_row(row):
    """
    Converts a CSV row (a dict) into a dictionary mapping ticker symbols to Decimal prices.
    Assumes the CSV header includes a "Date" column and one column per ticker.
    """
    prices = {}
    for key, value in row.items():
        if key == "Date":
            continue
        prices[key] = Decimal(value)
    return prices

def calculate_value_with_prices(portfolio, prices):
    """
    Calculates the value of a portfolio using the provided prices dictionary.
    
    Args:
        portfolio: A Portfolio instance.
        prices: A dict mapping ticker symbols to Decimal prices.
        
    Returns:
        Decimal: The computed portfolio value.
    """
    total_value = Decimal("0.0")
    for investment in portfolio.investments.all():
        ticker = investment.asset.ticker_symbol
        if ticker and ticker in prices:
            total_value += investment.quantity * prices[ticker]
    return total_value

def calculate_portfolio_weekly_growth(portfolio, csv_filepath="prices.csv"):
    """
    Calculates the weekly growth rate (in percentage) for a single portfolio.
    
    It does so by:
      - Reading the CSV file to retrieve all rows.
      - Using the last row as current prices.
      - Using the third-to-last row as the prices from a previous week.
      - Calculating the portfolio value at both time points.
      - Computing the percentage change as:
            ((current_value - previous_value) / previous_value) * 100.
    
    Args:
        portfolio: A Portfolio instance.
        csv_filepath: Path to the CSV file with price data.
        
    Returns:
        Decimal: The weekly growth rate in percentage.
    """
    rows = []
    with open(csv_filepath, newline='') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            rows.append(row)
    
    if len(rows) < 3:
        raise ValueError("Not enough data in CSV file to calculate weekly growth (requires at least 3 rows).")
    
    # Last row is the most recent data; third-to-last row represents a previous week.
    current_row = rows[-1]
    previous_row = rows[-3]
    
    current_prices = parse_prices_from_row(current_row)
    previous_prices = parse_prices_from_row(previous_row)
    
    current_value = calculate_value_with_prices(portfolio, current_prices)
    previous_value = calculate_value_with_prices(portfolio, previous_prices)
    
    if previous_value == 0:
        return Decimal("0.0")
    
    growth_rate = ((current_value - previous_value) / previous_value) * 100
    return growth_rate

def calculate_total_portfolios_weekly_growth(user, csv_filepath="prices.csv"):
    """
    Calculates the average weekly growth rate (in percentage) across all portfolios associated with the given user.
    
    It does so by:
      - Fetching all portfolios using the provided fetch_portfolios(user) function.
      - Calculating each portfolio's weekly growth using calculate_portfolio_weekly_growth.
      - Returning the mean of these growth rates.
    
    Args:
        user: A User instance.
        csv_filepath: Path to the CSV file with price data.
        
    Returns:
        Decimal: The average weekly growth rate in percentage.
    """
    portfolios = fetch_portfolios(user)
    if not portfolios:
        return Decimal("0.0")
    
    total_growth = Decimal("0.0")
    count = 0
    for portfolio in portfolios:
        growth = calculate_portfolio_weekly_growth(portfolio, csv_filepath)
        total_growth += growth
        count += 1
        
    return total_growth / count if count > 0 else Decimal("0.0")




from django.http import JsonResponse
import csv
from decimal import Decimal
from datetime import datetime
from advisor.models import Portfolio


import csv
from datetime import datetime
from decimal import Decimal

def parse_csv_prices(csv_filepath):
    """
    Parses a CSV file containing stock prices.

    Expected format:
    Date,AAPL,AMZN,GLD,GOOG,MSFT,SLV
    2021-02-26,118.62,154.64,161.81,101.47,224.68,24.65
    2021-03-01,125.00,157.30,161.52,103.70,229.09,24.60
    
    Returns:
        A list of dictionaries, each containing:
        - "date" (datetime object)
        - "prices" (dictionary of {ticker: Decimal(price)})
    """
    prices_data = []

    try:
        with open(csv_filepath, newline='') as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                if not row:  # Skip empty rows
                    continue

                # Convert date to datetime object
                try:
                    date = datetime.strptime(row["Date"], "%Y-%m-%d").date()
                except ValueError:
                    continue  # Skip rows with incorrect date format

                # Convert prices to Decimal for accuracy
                prices = {}
                for key, value in row.items():
                    if key == "Date":
                        continue
                    try:
                        prices[key] = Decimal(value)  # Convert to Decimal
                    except (ValueError, TypeError):
                        prices[key] = Decimal("0.0")  # Default to 0 if invalid

                prices_data.append({"date": date, "prices": prices})

    except FileNotFoundError:
        print(f"Error: File not found -> {csv_filepath}")
    except Exception as e:
        print(f"Error parsing CSV: {e}")

    return prices_data


def get_portfolio_value_over_time(portfolio, csv_filepath, step=5):
    """Gets portfolio value over time, sampling every `step` lines (default: every 5 lines)."""
    prices_data = parse_csv_prices(csv_filepath)  # Ensure this function reads the CSV correctly
    portfolio_history = []

    # Process every `step`th line to reduce data points
    for i in range(0, len(prices_data), step):
        entry = prices_data[i]
        date = entry["date"]
        prices = entry["prices"]

        total_value = Decimal("0.0")
        for investment in portfolio.investments.all():
            ticker = investment.asset.ticker_symbol
            if ticker in prices:
                total_value += investment.quantity * prices[ticker]

        # Prevent negative values
        portfolio_history.append({"date": date.strftime("%Y-%m-%d"), "value": max(0, float(total_value))})

    return portfolio_history


def portfolio_value_chart(request, portfolio_id):
    """
    API view that returns portfolio value over time for frontend visualization.
    """
    csv_filepath = r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock.csv"
    try:
        portfolio = Portfolio.objects.get(id=portfolio_id)
        data = get_portfolio_value_over_time(portfolio, csv_filepath)
        return JsonResponse({"portfolio_id": str(portfolio.id), "name": portfolio.name, "data": data})
    except Portfolio.DoesNotExist:
        return JsonResponse({"error": "Portfolio not found"}, status=404)

def all_portfolios_chart(request, user_id):
    """
    API view that returns value over time for all portfolios of a user.
    """
    csv_filepath = r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock.csv"
    portfolios = Portfolio.objects.filter(user_id=user_id)
    all_data = []
    for portfolio in portfolios:
        portfolio_data = get_portfolio_value_over_time(portfolio, csv_filepath)
        all_data.append({"portfolio_id": str(portfolio.id), "name": portfolio.name, "data": portfolio_data})
    return JsonResponse({"portfolios": all_data})






























"""
def calculate_total_gain(portfolios):
    
    Computes total gain for all portfolios by comparing each asset's current price
    against its purchase price (multiplied by quantity).
    
    total_gain = Decimal("0")
    for portfolio in portfolios:
        for investment in portfolio.investments.all():
            current_price = investment.asset.current_price
            purchase_price = investment.purchase_price
            gain = (current_price - purchase_price) * investment.quantity
            total_gain += gain
    return total_gain
"""