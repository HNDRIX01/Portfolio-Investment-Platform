import os
import pdfplumber
import pandas as pd
import re
from datetime import datetime
from django.core.management.base import BaseCommand
from django.conf import settings

# Define directories
PDF_DIR = os.path.join(settings.MEDIA_ROOT, "weekly_reports")
EXTRACTED_DIR = os.path.join(settings.MEDIA_ROOT, "extracted_companies")

class Command(BaseCommand):
    help = "Extracts financial data from PDF reports and saves them in separate Excel files by company name."

    def handle(self, *args, **kwargs):
        if not os.path.exists(PDF_DIR):
            self.stdout.write(self.style.ERROR(f"Directory {PDF_DIR} not found!"))
            return

        if not os.path.exists(EXTRACTED_DIR):
            os.makedirs(EXTRACTED_DIR)

        all_data = {}
        somme = 0

        for pdf_file in os.listdir(PDF_DIR):
            if pdf_file.endswith(".pdf"):
                self.stdout.write(self.style.NOTICE(f"Processing file: {pdf_file}"))
                pdf_path = os.path.join(PDF_DIR, pdf_file)

                try:
                    text = self.extract_text_from_pdf(pdf_path)
                    extracted_data = self.extract_financial_data(text, pdf_file)

                    for company, data in extracted_data.items():
                        if company not in all_data:
                            all_data[company] = []
                        all_data[company].extend(data)

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f"❌ Error processing {pdf_file}: {str(e)}"))

        self.save_to_excel(all_data)
        self.stdout.write(self.style.SUCCESS(f"✅ All data saved successfully! Processed {somme} PDF(s)."))

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
        """Extracts structured financial data and organizes it by company."""
        lines = text.split("\n")
        data = {}

        # Extract date from filename (format DD_MM_YYYY if present)
        date_match = re.search(r"\d{2}_\d{2}_\d{4}", filename)
        if date_match:
            date_str = date_match.group(0).replace("_", "-")
        else:
            date_str = datetime.now().strftime("%Y-%m-%d")

        # Identify available years dynamically
        year_pattern = re.compile(r"\b(20\d{2}p?)\b")
        detected_years = []
        for line in lines:
            if "Indic. financiers" in line or "Indicateurs boursiers" in line:
                detected_years = sorted(set(year_pattern.findall(line)))
                break  # Stop after finding the first instance

        company_data = None
        current_company = None
        current_years = detected_years  # Keep the same years for relevant lines

        # Regex patterns for financial indicators
        financial_patterns = {
            "P/E":              r"P/E\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
            "EBIT":             r"EBIT\s*\(en MDT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
            "Résultat net":     r"Résultat net\s*\(en MDT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
            "Div Yield":        r"Div Yield\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
            "ROE":              r"ROE\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
            "Pay out":          r"Pay out\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
            "TCC":              r"TCC\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
            "TCCC":             r"TCCC\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
            "Coef. d'exp":      r"Coef\. d'exp\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
            "R. solvabilité":   r"R\.?\s*solvabilité\s+([\d,.%\-−]+(?:\s[\d,.%\-−]+)*)",
            "PNB":              r"PNB\s*\(en MDT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
            "BPA":              r"BPA\s*\(en DT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
            "DPA":              r"DPA\s*\(en DT\)\s+([\d,.x\-−]+(?:\s[\d,.x\-−]+)*)",
        }

        for i, line in enumerate(lines):
            line_stripped = line.strip()
            prev_line = lines[i - 1] if i - 1 >= 0 else ""

            # 1) Detect company name
            #    (uppercase letters + some punctuation/spaces, but ignoring lines with "Cours du" or not preceded by "Code ISIN")
            company_match = re.match(r"^([A-Z0-9\s\-\_\(\)\.'\,]+)$", line_stripped)
            if company_match and "Cours du" not in line and "Code ISIN" in prev_line:
                current_company = company_match.group(1).strip()
                if current_company not in data:
                    data[current_company] = []
                company_data = {
                    "Date": date_str,
                    "Company": current_company,
                    "Sector": "",
                    "Stock Price": None
                }
                data[current_company].append(company_data)
                continue

            # 2) Capture stock price if it appears
            #    Example pattern: "Part. étrangère  12,34%  23,45 DT" or similar
            stock_price_match = re.search(r"Part\. étrangère\s+[\d,.%]+\s+([\d,.]+)\s*DT", line)
            if stock_price_match and company_data:
                company_data["Stock Price"] = stock_price_match.group(1)

            # 3) Capture sector (allow punctuation/hyphens/dots/etc.)
            #    Example line might be: "Secteur: IND. AGRO-ALIMENTAIRES"
            sector_match = re.search(r"Secteur:\s*([A-Za-zÀ-ÖØ-öø-ÿ\.\-\s]+)(?!\s*\d)", line)

            if sector_match and company_data:
                company_data["Sector"] = sector_match.group(1).strip()

            # 4) Capture each of the known financial indicators for the current line
            if company_data and current_years:
                for key, pattern in financial_patterns.items():
                    match = re.search(pattern, line)
                    if match:
                        # The pattern may return multiple values (one per year).
                        # We split them to align with detected_years
                        values = match.group(1).split()
                        for j, year in enumerate(current_years):
                            column_name = f"{key} ({year})"
                            company_data[column_name] = values[j] if j < len(values) else None

        return data

    def save_to_excel(self, all_data):
        """Saves extracted data into separate Excel files per company."""
        for company, records in all_data.items():
            df = pd.DataFrame(records)

            # Ensure the company name is a valid filename
            safe_company_name = re.sub(r"[^\w\s-]", "", company).replace(" ", "_")
            output_filename = f"{safe_company_name}.xlsx"
            output_path = os.path.join(EXTRACTED_DIR, output_filename)

            # If the file exists, append new data
            if os.path.exists(output_path):
                existing_df = pd.read_excel(output_path, engine='openpyxl')
                df = pd.concat([existing_df, df], ignore_index=True)

            with pd.ExcelWriter(output_path, engine='openpyxl') as writer:
                df.to_excel(writer, sheet_name="Financial Data", index=False)

            self.stdout.write(self.style.SUCCESS(f"✅ Data saved to {output_path}"))
