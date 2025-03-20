import json
from decimal import Decimal
from django.utils import timezone
from advisor.models import Portfolio, PortfolioAsset, Asset  # adjust to your app name
from recommendations.utils import get_most_recent_price  # or wherever you defined it

def create_portfolio_from_json(
    json_file_path: str, 
    portfolio_choice: int, 
    portfolio_name: str, 
    user
):
    """
    Creates a Portfolio (and its PortfolioAsset records) from a JSON file
    containing weights. 
    
    Parameters:
    -----------
    json_file_path : str
        Path to the JSON file with the structure:
        {
            "portfolios": {
                "monte_carlo_best": {...},
                "max_sharpe": {...},
                "risk_constrained": {...}
            },
            "blended_portfolios": {
                "blend1": {...},
                "blend2": {...},
                "blend3": {...}
            },
            "estimated_portfolio_value": ...
        }
        
    portfolio_choice : int
        An integer that tells us *which* set of weights to pick.
        For example:
            1 = "monte_carlo_best"
            2 = "max_sharpe"
            3 = "risk_constrained"
            4 = "blend1"
            5 = "blend2"
            6 = "blend3"
        Adjust as you like.
        
    portfolio_name : str
        The desired name for the newly created Portfolio.
        
    user : User (Django auth user or your custom user model)
        The user who will own this newly created Portfolio.
    
    Returns:
    --------
    Portfolio
        The newly created Portfolio object (already saved to DB).
    """
    
    # 1) Load the JSON data
    with open(json_file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    
    # 2) Decide which section to use based on 'portfolio_choice'
    #    This is just a mapping, you can do it however you like.
    #    For instance:
    if portfolio_choice == 1:
        chosen_data = data["blended_portfolios"]["blend1"]
    elif portfolio_choice == 2:
        chosen_data = data["blended_portfolios"]["blend2"]
    elif portfolio_choice == 3:
        chosen_data = data["blended_portfolios"]["blend3"]
    elif portfolio_choice == 4:
        chosen_data = data["blended_portfolios"]["blend1"]
    elif portfolio_choice == 5:
        chosen_data = data["blended_portfolios"]["blend2"]
    elif portfolio_choice == 6:
        chosen_data = data["blended_portfolios"]["blend3"]
    else:
        raise ValueError(f"Invalid portfolio_choice = {portfolio_choice}")
    
    # Extract the weights sub-dict, e.g.:
    # {
    #   "BH ASSURANCE": 0.15612555578775456,
    #   "SIAME": 0.8438744442122454,
    #   ...
    # }
    weights = chosen_data.get("weights", {})
    
    # 3) Create a new Portfolio for this user
    new_portfolio = Portfolio.objects.create(
        user=user,
        name=portfolio_name
        # created_at will be auto-set if you have auto_now_add=True
    )
    
    # 4) For each <AssetName, Weight> in the chosen weights
    #    we will treat that Weight as the *quantity* 
    #    and fetch the purchase_price from get_most_recent_price().
    for asset_name, quantity_float in weights.items():
        # If quantity is zero, you might choose to skip. 
        # (But you could also store it as 0. Up to your business logic.)
        if quantity_float <= 0:
            continue
        
        # Retrieve the Asset instance by name
        # (Assuming names match EXACTLY between JSON and your DB)
        try:
            asset_obj = Asset.objects.get(name=asset_name)
        except Asset.DoesNotExist:
            # If the asset isn't found in DB, skip or handle as needed:
            continue
        
        # Call your utility to fetch the current price
        purchase_price = get_most_recent_price(asset_name)
        if purchase_price is None or purchase_price <= 0:
            # If we can't get a price, decide whether to skip or fail
            continue
        
        # Now create the PortfolioAsset record
        # The `save()` method in your model will auto-set total_purchase
        # to quantity * purchase_price.  (As you indicated in your code.)
        PortfolioAsset.objects.create(
            portfolio=new_portfolio,
            asset=asset_obj,
            quantity=Decimal(str(quantity_float)),
            purchase_price=Decimal(str(purchase_price)),
            purchase_date=timezone.now()  # or datetime.now(), your preference
        )
    
    return new_portfolio
