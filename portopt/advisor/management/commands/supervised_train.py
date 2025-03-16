import os
import re
import pandas as pd
import numpy as np
import joblib
import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor

logger = logging.getLogger(__name__)

# Directories
MODELS_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/models/")
RESULTS_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/results/")
DATA_DIR = os.path.join(settings.MEDIA_ROOT, "extracted_companies_testRL/")
FEATURES_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/features/")


os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(FEATURES_DIR, exist_ok=True)


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
    Convert 'EBIT (2023p)' or 'EBIT (2023f)' -> 'EBIT (2023)'.
    Adjust the regex if needed for your patterns.
    """
    return re.sub(r"\((20\d{2})[^)]*\)", r"(\1)", col_name)


class Command(BaseCommand):
    help = "Train a supervised regression model for financial forecasting"


    def handle(self, *args, **options):
        logger.info("Starting supervised regression model training...")


        for filename in os.listdir(DATA_DIR):
            if not filename.endswith(".xlsx"):
                continue


            file_path = os.path.join(DATA_DIR, filename)
            try:
                # 1) Read the Excel file
                df = pd.read_excel(file_path)


                # 2) Fix column encoding if needed
                df.columns = fix_column_encoding(df.columns)


                # 3) Convert 'Date' column to datetime (if present), then sort by date
                if "Date" in df.columns:
                    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
                    df.sort_values(by="Date", inplace=True)
                    df.reset_index(drop=True, inplace=True)


                # 4) Unify columns like (2023p) -> (2023)
                df.rename(columns=unify_year_substring, inplace=True)


                # 5) Remove any exact duplicate column names (post-unify)
                df = df.loc[:, ~df.columns.duplicated()]


                # 6) Convert all cells to numeric using apply+map
                df = df.apply(lambda col: col.map(clean_numeric) if col.dtype == "object" else col)


                # 7) Drop columns that are fully NaN
                df.dropna(axis=1, how="all", inplace=True)


                # 8) Fill remaining NaNs with column mean, then 0 if any remain
                df.fillna(df.mean(), inplace=True)
                df.fillna(0, inplace=True)


                # (Optional) If you do NOT want 'Company' and 'Sector' as features, drop them:
                # df.drop(columns=["Company", "Sector"], errors="ignore", inplace=True)


                # If there's not enough rows, skip
                if df.shape[0] < 2:
                    logger.warning(f"Not enough data in {filename} for supervised training.")
                    continue


                # 9) Prepare features (X) and labels (y) by shifting one row
                feature_cols = [c for c in df.columns if c not in ["Date", "Company", "Sector"]]
                X = df[feature_cols].iloc[:-1].values  # all but last row
                y = df[feature_cols].iloc[1:].values   # all but first row


                # 10) Train the model (MultiOutputRegressor for multiple columns)
                model = MultiOutputRegressor(
                    RandomForestRegressor(n_estimators=100, random_state=42)
                )
                model.fit(X, y)


                # 11) Save the feature list and the trained model
                company_name = filename.replace(".xlsx", "")
                feature_file = os.path.join(FEATURES_DIR, f"{company_name}_features.pkl")
                joblib.dump(feature_cols, feature_file)


                model_path = os.path.join(MODELS_DIR, f"financial_prediction_supervised_{company_name}.pkl")
                joblib.dump(model, model_path)


                logger.info(f"Model saved for {company_name}: {model_path}")


            except Exception as e:
                logger.error(f"Error processing {filename}: {e}")