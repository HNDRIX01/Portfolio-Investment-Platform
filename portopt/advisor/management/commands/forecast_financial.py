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
DATA_DIR = os.path.join(settings.MEDIA_ROOT, "extracted_companies/")
FEATURES_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/features/")

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)
os.makedirs(FEATURES_DIR, exist_ok=True)

def clean_numeric(value):
    """
    Convert strings like '4x', '5.5%', or '6,6' to float.
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
    Attempt to re-interpret column names from latin-1 to utf-8.
    """
    fixed = []
    for col in columns:
        try:
            col_bytes = col.encode("latin-1", errors="replace")
            col_utf8 = col_bytes.decode("utf-8", errors="replace")
            fixed.append(col_utf8)
        except Exception:
            fixed.append(col)
    return fixed

def unify_year_substring(col_name):
    """
    Example:
      'EBIT (2023p)' -> 'EBIT(2023)',
      'Something (2022f)' -> 'Something(2022)',
    removing trailing letters after the year and spaces before parentheses.
    """
    # 1) Remove trailing 'p/f/etc.' after the year:
    col_name = re.sub(r"\((20\d{2})[^)]*\)", r"(\1)", col_name)

    # 2) Remove space between variable and (year), e.g. "EBIT (2023)" -> "EBIT(2023)"
    col_name = re.sub(r"\s*\((20\d{2})\)", r"(\1)", col_name)

    return col_name

def parse_variable_and_year(col_name):
    """
    Attempt to parse columns named like 'Stock Price(2021)' or 'StockPrice(2021)'.
    Returns (variable, year) if successful, else (None, None).
    """
    # Regex that captures "anything(20xx)" at the end
    pattern = r"^(.*)\((20\d{2})\)$"
    match = re.match(pattern, col_name.strip())
    if match:
        variable = match.group(1).strip()
        year_str = match.group(2)
        if year_str:
            year = int(year_str)
            return (variable, year)
    return (None, None)

class Command(BaseCommand):
    help = (
        "For each .xlsx file in 'extracted_companies_testRL', produce ONE Excel row with columns "
        "like 'Stock Price(2021)', 'EBIT(2022)', etc., plus a predicted column for the next year."
    )

    def handle(self, *args, **options):
        for filename in os.listdir(DATA_DIR):
            if not filename.endswith(".xlsx"):
                continue

            company_name = filename.replace(".xlsx", "")
            file_path = os.path.join(DATA_DIR, filename)

            try:
                # 1) Read the data
                df = pd.read_excel(file_path)
                df.columns = fix_column_encoding(df.columns)

                # 2) If "Date" column exists, sort by date
                if "Date" in df.columns:
                    df["Date"] = pd.to_datetime(df["Date"], dayfirst=True, errors="coerce")
                    df.sort_values(by="Date", inplace=True)
                    df.reset_index(drop=True, inplace=True)

                # --- ADDED FOR STOCK PRICE ---
                # If there's a "Stock Price" column with no year, pivot it into multiple columns "Stock Price(YYYY)".
                if "Stock Price" in df.columns and "Date" in df.columns:
                    for i in df.index:
                        date_val = df.at[i, "Date"]
                        if pd.notna(date_val):
                            y = date_val.year
                            colname = f"Stock Price({y})"
                            df.at[i, colname] = df.at[i, "Stock Price"]
                    # Drop the original "Stock Price" column
                    df.drop(columns=["Stock Price"], inplace=True, errors="ignore")
                # --- END STOCK PRICE PIVOT ---

                # 3) Unify columns (remove trailing p/f, remove spaces)
                df.rename(columns=unify_year_substring, inplace=True)

                # 4) Drop exact duplicate column names
                df = df.loc[:, ~df.columns.duplicated()]

                # 5) Convert numeric cells
                df = df.apply(lambda col: col.map(clean_numeric) if col.dtype == "object" else col)

                # 6) Drop columns that are fully NaN
                df.dropna(axis=1, how="all", inplace=True)

                # 7) Fill partial NaNs with mean, then 0
                df.fillna(df.mean(), inplace=True)
                df.fillna(0, inplace=True)

                # If fewer than 2 rows, we can't do a time-shift
                if df.shape[0] < 2:
                    logger.warning(f"Not enough data in {filename} to train a shift model. Skipping.")
                    continue

                # 8) Identify columns named like 'Variable(2021)'
                parsed_features = []
                for c in df.columns:
                    if c not in ["Date", "Company", "Sector"]:
                        var, yr = parse_variable_and_year(c)
                        if var is not None and yr is not None:
                            parsed_features.append((var, yr, c))

                if not parsed_features:
                    logger.warning(f"No recognized 'Variable(Year)' columns in {filename}. Skipping.")
                    continue

                # 9) Ensure these columns actually exist
                df_cols = set(df.columns)
                parsed_features = [(v, y, c) for (v, y, c) in parsed_features if c in df_cols]
                if not parsed_features:
                    logger.warning(f"After cleaning, no valid 'Variable(Year)' columns remain in {filename}.")
                    continue

                # Sort by (variable, year)
                parsed_features.sort(key=lambda x: (x[0], x[1]))
                feature_cols = [info[2] for info in parsed_features]

                logger.info(f"{company_name}: final recognized columns => {feature_cols}")

                # 10) Build training set (time shift: row t -> row t+1)
                X = df[feature_cols].iloc[:-1].values  # shape: (n-1, #features)
                y = df[feature_cols].iloc[1:].values   # shape: (n-1, #features)

                if X.shape[0] == 0:
                    logger.warning(f"{company_name}: Not enough rows after slicing. Skipping.")
                    continue

                # 11) Train the multioutput model
                model = MultiOutputRegressor(
                    RandomForestRegressor(n_estimators=100, random_state=42)
                )
                model.fit(X, y)

                # Save model & features
                joblib.dump(feature_cols, os.path.join(FEATURES_DIR, f"{company_name}_features.pkl"))
                joblib.dump(model, os.path.join(MODELS_DIR, f"financial_prediction_supervised_{company_name}.pkl"))

                # 12) Predict from the last row
                last_row_vals = df[feature_cols].iloc[-1].values.reshape(1, -1)
                predicted_vals = model.predict(last_row_vals)[0]  # shape: (#features,)
                predicted_series = pd.Series(predicted_vals, index=feature_cols)

                # 13) Build single-row output
                from collections import defaultdict
                var_to_years = defaultdict(list)
                for (var, yr, colname) in parsed_features:
                    var_to_years[var].append((yr, colname))

                # Sort each variable's years
                for var in var_to_years:
                    var_to_years[var].sort(key=lambda x: x[0])

                combined_data = {}

                for var in sorted(var_to_years.keys()):
                    # Largest historical year
                    year_col_list = var_to_years[var]
                    max_hist_year = max(yr for (yr, _) in year_col_list)
                    next_year = max_hist_year + 1

                    # For each historical year, store the LAST ROW's actual value
                    for (yr, colname) in year_col_list:
                        final_col_name = f"{var} {yr}"
                        combined_data[final_col_name] = df[colname].iloc[-1]

                    # For the predicted next year
                    predicted_col_name = f"{var} {next_year}"
                    # We'll use the predicted value from the column whose year == max_hist_year
                    max_year_col = None
                    for (yr2, col2) in year_col_list:
                        if yr2 == max_hist_year:
                            max_year_col = col2
                            break

                    if max_year_col:
                        combined_data[predicted_col_name] = predicted_series[max_year_col]
                    else:
                        combined_data[predicted_col_name] = np.nan

                # Create a 1-row DataFrame
                final_df = pd.DataFrame([combined_data])

                # 14) Save to Excel
                results_path = os.path.join(RESULTS_DIR, f"forecast_single_line_{company_name}.xlsx")
                final_df.to_excel(results_path, index=False, sheet_name="Forecast")

                logger.info(f"Forecast saved for {company_name} at {results_path}")

            except Exception as e:
                logger.error(f"Error processing {filename}: {e}")
