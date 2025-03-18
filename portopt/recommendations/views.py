import os
import json
import pandas as pd
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from .utils import run_portfolio_analysis, get_companies_by_sectors
@csrf_exempt
def get_companies(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            # Extract parameters sent from the frontend
            selected_sectors = data.get("sectors", [])
            risk_amount = float(data.get("risk_amount", 0.60))
            investment_amount = float(data.get("investment_amount", 10000))
            
            # Get companies based on the selected sectors (sector names must match the Excel file)
            companies_list = get_companies_by_sectors(selected_sectors)
            
            # File paths (adjust as needed)
            csv_path = r"C:\Users\USER\Desktop\Investment Platform\portopt\media\stock_tn.csv"
            json_output_path = r"C:\Users\USER\Desktop\Investment Platform\portopt\media\portfolios.json"
            
            # Run the optimization analysis
            results = run_portfolio_analysis(
                tickers_list=companies_list,
                risk_amount=risk_amount,
                capital_invested=investment_amount,
                csv_path=csv_path,
                json_output_path=json_output_path
            )
            return JsonResponse(results, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)
    else:
        return JsonResponse({"error": "Only POST requests allowed."}, status=405)





    '''
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            sectors = data.get("sectors", [])
            if not sectors:
                return JsonResponse({"error": "No sectors provided."}, status=400)

            # Construct the path to your Excel file.
            file_path = os.path.join(settings.MEDIA_ROOT, "all_80_companies_with_sectors.xlsx")
            if not os.path.exists(file_path):
                return JsonResponse({"error": "Companies file not found."}, status=404)

            # Read the Excel file.
            df = pd.read_excel(file_path)

            # Assume the Excel file has a column named "Sector" that contains the sector name.
            # You might need to adjust the column name if it differs.
            filtered_df = df[df["Sector"].isin(sectors)]

            # Convert the filtered DataFrame to a list of dictionaries.
            companies = filtered_df.to_dict(orient="records")

            print("Filtered companies:", companies)

            return JsonResponse({"companies": companies}, safe=False)
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=500)
    else:
        return JsonResponse({"error": "Invalid HTTP method."}, status=405)'
        '''
    
