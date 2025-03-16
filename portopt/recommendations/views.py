import os
import json
import pandas as pd
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt

@csrf_exempt
def get_companies(request):
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
        return JsonResponse({"error": "Invalid HTTP method."}, status=405)
