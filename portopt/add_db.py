import os
import django
import uuid
from decimal import Decimal
from portopt.advisor.models import Asset  # Replace 'your_app' with your actual app name

# Setup Django if running this script independently
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "portopt.settings")  # Replace 'your_project' with your Django project name
django.setup()

# Asset names (same as ticker_symbol)
asset_names = [
    "AETECH", "AIR LIQUIDE TSIE", "ALKIMIA", "AMEN BANK", "AMS", "ARTES", "ASSAD", 
    "ASSU MAGHREBIA VIE", "ASSUR MAGHREBIA", "ASTREE", "ATB", "ATELIER MEUBLE INT", 
    "ATL", "ATTIJARI BANK", "ATTIJARI LEASING", "BEST LEASE", "BH ASSURANCE", "BH BANK", 
    "BH LEASING", "BIAT", "BNA", "BT", "BTE (ADP)", "CARTHAGE CEMENT", "CELLCOM", "CIL", 
    "CIMENTS DE BIZERTE", "CITY CARS", "DELICE HOLDING", "ELECTROSTAR", "ENNAKL AUTOMOBILES", 
    "ESSOUKNA", "EURO-CYCLES", "GIF-FILTER", "HANNIBAL LEASE", "ICF", "LAND OR", 
    "MAGASIN GENERAL", "MAGHREB INTERN PUB", "MONOPRIX", "MPBS", "NEW BODY LINE", 
    "OFFICEPLAST", "ONE TECH HOLDING", "PLAC. TSIE-SICAF", "POULINA GP HOLDING", "SAH", 
    "SANIMED", "SERVICOM", "SFBT", "SIAME", "SIMPAR", "SIPHAT", "SITS", "SMART TUNISIE", 
    "SOMOCER", "SOPAT", "SOTEMAIL", "SOTETEL", "SOTIPAPIER", "SOTRAPIL", "SOTUMAG", 
    "SOTUVER", "SPDIT - SICAF", "STA", "STAR", "STB", "STIP", "TAWASOL GP HOLDING", 
    "TELNET HOLDING", "TPR", "TUNINVEST-SICAR", "TUNIS RE", "TUNISAIR", "TUNISIE LEASING F", 
    "UADH", "UBCI", "UIB", "UNIMED", "WIFACK INT BANK", "TUNINDEX", "TUNINDEX20"
]

# Corresponding current prices (if missing, set to 0)
prices = [
    0.27, 101.00, 14.75, 38.38, None, 10.42, 1.41, 5.82, 51.50, 46.00, 3.07, 6.53, 
    4.60, 72.30, 27.43, 2.30, 51.20, 12.80, 4.11, 101.90, 8.70, 5.03, 4.25, 2.20, 
    2.05, 26.51, 0.39, 15.40, 20.43, None, 11.58, 1.60, 14.65, None, 7.40, 127.20, 
    10.91, 6.77, None, 3.70, 11.01, 4.63, 1.54, 8.95, 46.01, 9.57, 11.39, 0.92, 
    None, 11.89, 3.28, 34.40, 4.49, 2.10, 13.80, 0.41, None, 3.38, 7.12, 4.35, 
    17.36, 6.20, 14.24, 13.16, 22.45, 193.76, 3.00, 2.30, 0.73, 7.43, 7.58, 9.00, 
    7.80, 0.36, 19.15, 0.45, 20.49, 22.62, 7.34, 8.53, None
]

# List to store asset objects
assets = []

# Create Asset objects
for name, price in zip(asset_names, prices):
    asset = Asset(
        id=uuid.uuid4(),
        name=name,
        type=Asset.AssetType.STOCK,  # Setting type to "Stock"
        ticker_symbol=name,  # Same as name
        market=None,  # Market is empty
        current_price=Decimal(price) if price is not None else Decimal(0)  # Default to 0 if price is missing
    )
    assets.append(asset)

# Bulk insert all assets
Asset.objects.bulk_create(assets)

print(f"Inserted {len(assets)} assets successfully!")


