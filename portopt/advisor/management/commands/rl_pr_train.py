import os
import pandas as pd
import numpy as np
import joblib
import logging
from django.core.management.base import BaseCommand
from django.conf import settings
from stable_baselines3 import PPO
from gym import spaces
import gym

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
    """Convert values like '4x' -> 4, '5.5%' -> 5.5, '6,6' -> 6.6, otherwise keep numbers."""
    if isinstance(value, str):
        value = value.replace("x", "").replace("%", "").replace(",", ".")
        try:
            return float(value)
        except ValueError:
            return np.nan
    return value

class PortfolioEnv(gym.Env):
    def __init__(self, data):
        super(PortfolioEnv, self).__init__()
        self.data = data.reset_index(drop=True)
        self.current_step = 0

        # Ensure no NaNs remain and drop completely empty columns
        self.data.fillna(0, inplace=True)
        self.data = self.data.dropna(axis=1, how="all")

        n_features = self.data.shape[1]
        if n_features == 0:
            raise ValueError("No valid numeric features found after preprocessing.")

        # Define observation space (each observation is a row of data)
        self.observation_space = spaces.Box(low=-np.inf, high=np.inf, shape=(n_features,), dtype=np.float32)
        
        # Define action space using min and max from the dataset
        lower_bound = self.data.min().values.astype(np.float32)
        upper_bound = self.data.max().values.astype(np.float32)
        for i in range(len(lower_bound)):
            if lower_bound[i] == upper_bound[i]:
                lower_bound[i] -= 1.0
                upper_bound[i] += 1.0
        self.action_space = spaces.Box(low=lower_bound, high=upper_bound, shape=(n_features,), dtype=np.float32)

    def reset(self):
        self.current_step = 0
        return self.data.iloc[self.current_step].values.astype(np.float32)

    def step(self, action):
        # If at the end of data, return a terminal state.
        if self.current_step + 1 >= len(self.data):
            done = True
            # Use the current row as a fallback for reward calculation
            reward = -np.mean((action - self.data.iloc[self.current_step].values.astype(np.float32))**2)
            obs = np.zeros(self.data.shape[1], dtype=np.float32)
        else:
            true_next = self.data.iloc[self.current_step + 1].values.astype(np.float32)
            reward = -np.mean((action - true_next) ** 2)  # Negative MSE (higher reward for better predictions)
            obs = true_next
            done = False

        self.current_step += 1
        return obs, reward, done, {}

class Command(BaseCommand):
    help = "Train RL model for financial forecasting"

    def handle(self, *args, **options):
        logger.info("🔄 Starting RL model training...")
        for filename in os.listdir(DATA_DIR):
            if filename.startswith("~$") or not filename.endswith(".xlsx"):
                continue

            file_path = os.path.join(DATA_DIR, filename)
            try:
                df = pd.read_excel(file_path)

                # Drop non-feature columns if they exist
                df.drop(columns=["Date", "Company", "Sector"], errors="ignore", inplace=True)

                # Convert all cells to numeric values
                df = df.applymap(clean_numeric)
                
                # Drop columns that are completely NaN and fill missing values
                df.dropna(axis=1, how="all", inplace=True)
                df.fillna(df.mean(), inplace=True)
                df.fillna(0, inplace=True)

                if df.empty or df.isnull().all().all():
                    logger.warning(f"🚨 Skipping {filename}: No valid numeric data.")
                    continue

                company_name = filename.replace(".xlsx", "")

                # Save feature names for consistent ordering during prediction
                feature_file = os.path.join(FEATURES_DIR, f"{company_name}_features.pkl")
                joblib.dump(df.columns.tolist(), feature_file)

                self.train_rl_model(company_name, df)

            except Exception as e:
                logger.error(f"❌ Error processing {filename}: {e}")

    def train_rl_model(self, company, df):
        logger.info(f"🔄 Training RL Model for {company}...")
        try:
            env = PortfolioEnv(df)
            model = PPO("MlpPolicy", env, verbose=1)
            model.learn(total_timesteps=50000)

            model_path = os.path.join(MODELS_DIR, f"financial_prediction_rl_{company}.zip")
            model.save(model_path)
            logger.info(f"✅ Model saved: {model_path}")
        except Exception as e:
            logger.error(f"❌ Training error for {company}: {e}")
