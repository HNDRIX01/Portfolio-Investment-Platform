import os
import json
import pandas as pd

from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Extract data from Excel files and save them into one JSON file, replacing \\ufffd with é"

    def handle(self, *args, **options):
        results_dir = os.path.join(settings.MEDIA_ROOT, "predictions/results/")
        combined_data = {}

        # Process only Excel files starting with "forecast_single_line_"
        for file_name in os.listdir(results_dir):
            if file_name.endswith(".xlsx") and file_name.startswith("forecast_single_line_"):
                file_path = os.path.join(results_dir, file_name)
                # Derive company name from the file name
                company_name = file_name.replace("forecast_single_line_", "").replace(".xlsx", "")
                try:
                    # Read the Excel file into a DataFrame
                    df = pd.read_excel(file_path)

                    # Fix column names: replace occurrences of \ufffd with "é"
                    df.columns = [col.replace("\ufffd", "é") if isinstance(col, str) else col for col in df.columns]

                    # For each object-type column, replace occurrences of \ufffd with "é" in the cell values
                    for col in df.select_dtypes(include=[object]).columns:
                        df[col] = df[col].apply(lambda x: x.replace("\ufffd", "é") if isinstance(x, str) else x)
                    
                    # Convert DataFrame to a list of dictionaries
                    data = df.to_dict(orient="records")
                    combined_data[company_name] = data
                    self.stdout.write(self.style.SUCCESS(f"Processed {file_name}"))
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"Error processing {file_name}: {e}"))

        # Write the combined data to JSON using UTF-8 and ensure_ascii=False
        output_file = os.path.join(results_dir, "combined_data.json")
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(combined_data, f, indent=4, ensure_ascii=False)
            self.stdout.write(self.style.SUCCESS(f"Combined data saved to {output_file}"))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Error saving combined data to JSON: {e}"))
