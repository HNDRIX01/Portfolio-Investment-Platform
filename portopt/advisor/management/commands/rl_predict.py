import os
import pandas as pd
import numpy as np
import joblib
from stable_baselines3 import PPO
from django.core.management.base import BaseCommand
from django.conf import settings

# Directories
MODELS_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/models/")
RESULTS_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/results/")
EXTRACTED_DIR = os.path.join(settings.MEDIA_ROOT, "extracted_companies_testRL/")
FEATURES_DIR = os.path.join(settings.MEDIA_ROOT, "predictions/features/")

os.makedirs(RESULTS_DIR, exist_ok=True)

def clean_numeric(value):
    """Convert values like '4x' -> 4, '5.5%' -> 5.5, '6,6' -> 6.6, otherwise keep numbers."""
    if isinstance(value, str):
        value = value.replace("x", "").replace("%", "").replace(",", ".")
        try:
            return float(value)
        except ValueError:
            return np.nan
    return value

class Command(BaseCommand):
    help = "Predict next year's financial values using RL models"

    def handle(self, *args, **kwargs):
        for filename in os.listdir(EXTRACTED_DIR):
            if not filename.endswith(".xlsx"):
                continue

            company_name = filename.replace(".xlsx", "")
            file_path = os.path.join(EXTRACTED_DIR, filename)

            try:
                df = pd.read_excel(file_path)
                df.drop(columns=["Date", "Company", "Sector"], errors="ignore", inplace=True)
                df = df.applymap(clean_numeric)
                df.fillna(df.mean(), inplace=True)
                df.fillna(0, inplace=True)

                # Ensure consistent feature order using saved feature names
                feature_file = os.path.join(FEATURES_DIR, f"{company_name}_features.pkl")
                if os.path.exists(feature_file):
                    expected_features = joblib.load(feature_file)
                    df = df.reindex(columns=expected_features, fill_value=0)
                else:
                    self.stdout.write(self.style.WARNING(f"⚠ No feature file found for {company_name}"))
                    continue

                # Load the trained model
                model_path = os.path.join(MODELS_DIR, f"financial_prediction_rl_{company_name}.zip")
                if not os.path.exists(model_path):
                    self.stdout.write(self.style.WARNING(f"⚠ Model for {company_name} not found"))
                    continue
                
                model = PPO.load(model_path)

                # Use the last known year's data (as a 1D array) for prediction
                last_obs = df.iloc[-1].values.astype(np.float32)
                predicted_values, _ = model.predict(last_obs)

                # Save predictions to CSV
                prediction_df = pd.DataFrame([predicted_values.flatten()], columns=df.columns)
                results_path = os.path.join(RESULTS_DIR, f"predictions_{company_name}.csv")
                prediction_df.to_csv(results_path, index=False)

                self.stdout.write(self.style.SUCCESS(f"✅ Predictions saved to {results_path}"))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f"❌ Error processing {company_name}: {e}"))
