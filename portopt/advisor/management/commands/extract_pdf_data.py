import os
import pdfplumber
import pandas as pd
import re
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings

# Define directories
PDF_DIR = os.path.join(settings.MEDIA_ROOT, "weekly_reports")
EXTRACTED_DIR = os.path.join(settings.MEDIA_ROOT, "extracted")

class Command(BaseCommand):
    help = "Extracts financial data from PDF reports and saves each file's data separately."

    def handle(self, *args, **kwargs):
        if not os.path.exists(PDF_DIR):
            self.stdout.write(self.style.ERROR(f"Directory {PDF_DIR} not found!"))
            return

        if not os.path.exists(EXTRACTED_DIR):
            os.makedirs(EXTRACTED_DIR)  # Ensure the output directory exists

        for pdf_file in os.listdir(PDF_DIR):
            if pdf_file.endswith(".pdf"):
                self.stdout.write(self.style.NOTICE(f"Processing file: {pdf_file}"))
                pdf_path = os.path.join(PDF_DIR, pdf_file)

                try:
                    text = self.extract_text_from_pdf(pdf_path)
                    extracted_data = self.extract_financial_data(text, pdf_file)

                    if extracted_data:
                        df = pd.DataFrame(extracted_data)

                        # Extract date from filename
                        date_match = re.search(r"\d{2}_\d{2}_\d{4}", pdf_file)
                        if date_match:
                            date_str = date_match.group(0).replace("_", "-")
                        else:
                            date_str = datetime.now().strftime("%Y-%m-%d")

                        output_filename = f"financial_data_{date_str}.xlsx"
                        output_path = os.path.join(EXTRACTED_DIR, output_filename)

                        with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                            df.to_excel(writer, sheet_name="Financial Data", index=False)

                        self.stdout.write(self.style.SUCCESS(f"✅ Data saved to {output_path}"))
                    else:
                        self.stdout.write(self.style.WARNING(f"⚠️ No valid data extracted from {pdf_file}."))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ Error processing {pdf_file}: {str(e)}"))

    def extract_text_from_pdf(self, pdf_path):
        """Extracts text from a given PDF file."""
        text = ""
        with pdfplumber.open(pdf_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text

    def extract_financial_data(self, text, filename):
        """Extracts structured financial data and ensures alignment with correct years."""
        lines = text.split("\n")
        data = []

        # Extract available years dynamically
        year_pattern = re.compile(r"\b(20\d{2}p?)\b")
        detected_years = []
        for line in lines:
            if "Indic. financiers" in line or "Indicateurs boursiers" in line:
                detected_years = sorted(set(year_pattern.findall(line)))
                break

        if not detected_years:
            return []

        company_data = None

        for i, line in enumerate(lines):
            # Detect company names (allow uppercase letters, digits and punctuation)
            company_match = re.match(r"^([A-Z0-9\s\-\_\(\)\.'\,]+)$", line.strip())
            prev_line = lines[i - 1] if i - 1 >= 0 else ""

            if company_match and "Cours du" not in line and "Code ISIN" in prev_line:
                company_name = company_match.group(1).strip()
                company_data = {"Company": company_name, "Sector": "", "Stock Price": None}
                data.append(company_data)
                continue

            # Capture stock price
            stock_price_match = re.search(r"Part\. étrangère\s+[\d,.%]+\s+([\d,.]+)\s*DT", line)
            if stock_price_match and company_data:
                company_data["Stock Price"] = stock_price_match.group(1)

            # Capture sector with improved regex to allow punctuation and accented letters
            sector_match = re.search(r"Secteur:\s*([A-Za-zÀ-ÖØ-öø-ÿ\.\-\s]+)(?!\s*\d)", line)

            if sector_match and company_data:
                company_data["Sector"] = sector_match.group(1).strip()

            # Capture financial indicators for the detected years
            if company_data:
                financial_patterns = {
                    "P/E": r"P/E\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
                    "EBIT": r"EBIT\s*\(en MDT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
                    "Résultat net": r"Résultat net\s*\(en MDT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
                    "Div Yield": r"Div Yield\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
                    "ROE": r"ROE\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
                    "Pay out": r"Pay out\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
                    "TCC": r"TCC\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
                    "TCCC": r"TCCC\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
                    "Coef. d'exp": r"Coef\. d'exp\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
                    "R. solvabilité": r"R\.?\s*solvabilité\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
                    "PNB": r"PNB\s*\(en MDT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
                    "BPA": r"BPA\s*\(en DT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
                    "DPA": r"DPA\s*\(en DT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
                }

                for key, pattern in financial_patterns.items():
                    match = re.search(pattern, line)
                    if match:
                        values = match.group(1).split()  # Split values for correct alignment
                        for j, year in enumerate(detected_years):
                            column_name = f"{key} ({year})"
                            company_data[column_name] = values[j] if j < len(values) else None

        return data
