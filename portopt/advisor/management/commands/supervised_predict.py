import os
import re
import pandas as pd
import numpy as np
import joblib
from django.core.management.base import BaseCommand
from django.conf import settings
from openpyxl import Workbook


# Directories
MODELS_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/models/")
RESULTS_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/results/")
EXTRACTED_DIR = os.path.join(settings.MEDIA_ROOT, "extracted_companies_testRL/")
FEATURES_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/features/")


os.makedirs(RESULTS_DIR, exist_ok=True)


def clean_numeric(value):
    """
    Convert strings like '4x' -> 4, '5.5%' -> 5.5, '6,6' -> 6.6, etc.
    Return float or np.nan if conversion fails.
    """
    if isinstance(value, str):
        value = value.replace("x", "").replace("%", "").replace(",", ".")
        try:
            return float(value)
        except ValueError:
            return np.nan
    return value


def fix_column_encoding(columns):
    """
    Attempt to re-interpret column names from latin-1 to utf-8 if needed.
    """
    fixed = []
    for col in columns:
        try:
            col_bytes = col.encode("latin-1", errors="replace")
            col_utf8 = col_bytes.decode("utf-8", errors="replace")
            fixed.append(col_utf8)
        except:
            fixed.append(col)
    return fixed


def unify_year_substring(col_name):
    """
    Convert 'EBIT (2023p)' -> 'EBIT (2023)' if desired.
    """
    return re.sub(r"\((20\d{2})[^)]*\)", r"(\1)", col_name)


def shift_year_in_colname(col, from_year=2025, to_year=2026):
    """
    Example: rename columns from '(2025)' to '(2026)' if you want to highlight future predictions.
    Adjust or remove as needed.
    """
    pattern = rf"\({from_year}\)"
    replacement = f"({to_year})"
    return re.sub(pattern, replacement, col)


class Command(BaseCommand):
    help = "Predict next year's financial values using the trained supervised regression model"


    def handle(self, *args, **kwargs):
        for filename in os.listdir(EXTRACTED_DIR):
            if not filename.endswith(".xlsx"):
                continue


            company_name = filename.replace(".xlsx", "")
            file_path = os.path.join(EXTRACTED_DIR, filename)


            try:
                # 1) Read the Excel file
                df = pd.read_excel(file_path)


                # 2) Fix encoding in column names
                df.columns = fix_column_encoding(df.columns)


                # 3) Convert 'Date' to datetime (if present), then sort
                if "Date" in df.columns:
                    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
                    df.sort_values(by="Date", inplace=True)
                    df.reset_index(drop=True, inplace=True)


                # 4) Unify columns like (2023p) -> (2023)
                df.rename(columns=unify_year_substring, inplace=True)


                # 5) Remove any exact duplicate column names
                df = df.loc[:, ~df.columns.duplicated()]


                # 6) Convert to numeric (element-wise)
                df = df.apply(lambda col: col.map(clean_numeric) if col.dtype == "object" else col)


                # 7) Drop columns fully NaN, fill missing
                df.dropna(axis=1, how="all", inplace=True)
                df.fillna(df.mean(), inplace=True)
                df.fillna(0, inplace=True)


                # (Optional) Drop columns if you don't want them as features
                # df.drop(columns=["Company", "Sector"], errors="ignore", inplace=True)


                # 8) Load the expected feature list from training
                feature_file = os.path.join(FEATURES_DIR, f"{company_name}_features.pkl")
                if not os.path.exists(feature_file):
                    self.stdout.write(self.style.WARNING(f"No feature file found for {company_name}."))
                    continue
                expected_features = joblib.load(feature_file)


                # 9) Reindex the current DataFrame to match the training columns
                df = df.reindex(columns=expected_features, fill_value=0)


                # 10) Load the trained model
                model_path = os.path.join(MODELS_DIR, f"financial_prediction_supervised_{company_name}.pkl")
                if not os.path.exists(model_path):
                    self.stdout.write(self.style.WARNING(f"Model for {company_name} not found."))
                    continue
                model = joblib.load(model_path)


                # If no rows remain, skip
                if df.empty:
                    self.stdout.write(self.style.WARNING(f"No data found for {company_name} after cleaning."))
                    continue


                # 11) Predict using the last row
                last_obs = df.iloc[-1].values.reshape(1, -1)
                predicted_values = model.predict(last_obs)


                # 12) Create a DataFrame for the prediction
                prediction_df = pd.DataFrame(predicted_values, columns=df.columns)


                # (Optional) Round the predictions
                prediction_df = prediction_df.round(2)


                # (Optional) Rename columns from (2025) -> (2026)
                prediction_df.columns = [
                    shift_year_in_colname(col, from_year=2025, to_year=2026)
                    for col in prediction_df.columns
                ]


                # 13) Save the prediction to Excel
                results_path = os.path.join(RESULTS_DIR, f"predictions_supervised_{company_name}.xlsx")
                with pd.ExcelWriter(results_path, engine="openpyxl") as writer:
                    prediction_df.to_excel(writer, index=False, sheet_name="Prediction")


                self.stdout.write(self.style.SUCCESS(f"Predictions saved to {results_path}"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Error processing {company_name}: {e}"))