
###############################
import requests
import os
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.conf import settings

class Command(BaseCommand):
    help = 'Download reports every 4 weeks for the past 52 weeks, handling different URL formats.'

    def handle(self, *args, **kwargs):
        # Folder to store reports
        reports_dir = os.path.join(os.getcwd(), "weekly_reports")
        os.makedirs(reports_dir, exist_ok=True)

        # Generate past Fridays (every 4 weeks)
        num_weeks = 100
        today = datetime.today()
        cutoff_date = datetime(2024, 2, 23)  # Date when URL format changed

        for i in range(0, num_weeks, 4):  # Every 4 weeks
            past_friday = today - timedelta(weeks=i, days=(today.weekday() - 4) % 7)  # Adjust for Friday
            year_month = past_friday.strftime("%Y-%m")  # YYYY-MM format
            file_name_base = f"SGH_{past_friday.strftime('%d_%m_%Y')}_fr"
            
            if past_friday >= cutoff_date:
                # New format: Try _fr_1.pdf first, then _fr_0.pdf
                for suffix in ["_1", "_0",""]:
                    file_name = f"{file_name_base}{suffix}.pdf"
                    file_url = f"https://www.afc.com.tn/sites/default/files/{year_month}/{file_name}"
                    
                    if self.download_file(file_url, reports_dir, file_name):
                        break  # Stop trying once a file is downloaded
            else:
                # Old format: _fr.pdf
                file_name = f"{file_name_base}.pdf"
                file_url = f"https://www.afc.com.tn/sites/default/files/{year_month}/{file_name}"
                self.download_file(file_url, reports_dir, file_name)

        self.stdout.write("✅ Finished downloading all available reports! ✅")

    def download_file(self, url, save_dir, file_name):
        """ Helper function to download a file and save it. Returns True if successful. """
        response = requests.get(url)

        if response.status_code == 200:
            file_path = os.path.join(settings.MEDIA_ROOT, "weekly_reports", file_name)
            with open(file_path, "wb") as file:
                file.write(response.content)
            self.stdout.write(f"✅ Downloaded: {file_name}")
            return True
        else:
            self.stdout.write(f"❌ File not found: {file_name} ({url})")
            return False
