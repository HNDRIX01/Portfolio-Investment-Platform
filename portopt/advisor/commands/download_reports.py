import requests
import os
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.conf import settings
class Command(BaseCommand):
    help = 'Download reports every 4 weeks for the past 52 weeks and extract stock data.'

    def handle(self, *args, **kwargs):
        # Folder to store reports
        os.makedirs("weekly_reports", exist_ok=True)

        # Generate past Fridays (every 4th week)
        num_weeks = 52
        today = datetime.today()

        for i in range(0, num_weeks, 4):  # Start at 0, increment by 4 weeks
            past_friday = today - timedelta(weeks=i, days=(today.weekday() - 4) % 7)  # Adjust for Friday
            year_month = past_friday.strftime("%Y-%m")  # YYYY-MM format
            file_name = f"SGH_{past_friday.strftime('%d_%m_%Y')}_fr.pdf"
            file_url = f"https://www.afc.com.tn/sites/default/files/{year_month}/{file_name}"

            # Download the PDF
            response = requests.get(file_url)

            if response.status_code == 200:
                file_path = os.path.join(settings.MEDIA_ROOT, "weekly_reports", file_name)

                with open(file_path, "wb") as file:
                    file.write(response.content)
                self.stdout.write(f"✅ Downloaded: {file_name}")
            else:
                self.stdout.write(f"❌ File not found: {file_name}")

        self.stdout.write("✅ Finished downloading all available reports!✅")


