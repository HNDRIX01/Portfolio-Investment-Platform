import pandas as pd

def get_companies_by_sectors(sectors):
    """
    Given a list of sector names, return a list of companies 
    that belong to any of those sectors.
    
    Parameters:
        sectors (list): A list of sector names to filter by.
        
    Returns:
        list: A list of company names in the given sectors.
    """     
    # Read the Excel file
    df = pd.read_excel(r"C:\Users\khali\Documents\PFE\chatbot\back\chat\data\all_80_companies_with_sectors.xlsx")
    
    # Filter rows where the 'Sector' column is in the provided list
    filtered_df = df[df['Sector'].isin(sectors)]
    
    # Convert the 'Company' column of the filtered DataFrame to a list
    companies = filtered_df['Company'].tolist()
    return companies 

import numpy as np
import scipy.optimize as opt
import json
import logging
from fredapi import Fred

# ------------------------------------------------------------------------
# 1) LOGGING CONFIGURATION
# ------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# ------------------------------------------------------------------------
# 2) FRED RISK-FREE SETUP
# ------------------------------------------------------------------------
FRED_API_KEY = "094a1d4e791e4356bb011069ee27654b"
fred = Fred(api_key=FRED_API_KEY)

def get_risk_free_rate():
    """
    Fetches the latest U.S. 3-Month Treasury Bill rate (DGS3MO) from FRED 
    as a proxy for the risk-free rate. Converts from percentage to decimal.
    If unavailable, defaults to 2% (0.02).
    """
    try:
        series = fred.get_series_latest_release('DGS3MO')
        if series is not None and not series.empty:
            return float(series.iloc[-1]) / 100.0
    except Exception as e:
        logging.warning(f"FRED risk-free fetch failed: {e}")
    return 0.02  # fallback if data is missing or API fails

# ------------------------------------------------------------------------
# 3) DATA LOADING AND LOG RETURNS
# ------------------------------------------------------------------------
def load_data(csv_path: str) -> pd.DataFrame:
    """
    Loads a CSV with shape like:
        Date,AAPL,AMZN,GLD,GOOG,MSFT,SLV
        2021-02-26,118.62,154.64,161.80,101.47,224.68,24.66
        ...
    """
    data = pd.read_csv(csv_path, parse_dates=["Date"], index_col="Date")
    data.sort_index(inplace=True)  # sort by date, if not already
    return data

def compute_log_returns(price_data: pd.DataFrame) -> pd.DataFrame:
    """
    Computes daily log returns from price data:
        r(t) = log(Price(t)/Price(t-1))
    and drops the initial row of NaNs.
    """
    log_ret = np.log(price_data / price_data.shift(1))
    return log_ret.dropna()

# ------------------------------------------------------------------------
# 4) PORTFOLIO PERFORMANCE
# ------------------------------------------------------------------------
def portfolio_performance(weights, mean_returns, cov_matrix, risk_free_rate=0.0):
    """
    Calculate annualized (return, volatility, Sharpe ratio):
      - return = weights dot mean_returns
      - volatility = sqrt(weights^T * cov_matrix * weights)
      - sharpe = (return - risk_free_rate) / volatility
    """
    port_ret = np.dot(weights, mean_returns)
    port_vol = np.sqrt(weights @ cov_matrix @ weights.T)
    if port_vol < 1e-12:
        sharpe = np.nan
    else:
        sharpe = (port_ret - risk_free_rate) / port_vol
    return port_ret, port_vol, sharpe

# ------------------------------------------------------------------------
# 5) MONTE CARLO SIMULATION
# ------------------------------------------------------------------------
def monte_carlo_simulation(mean_returns, cov_matrix, risk_free_rate, num_assets, num_portfolios=10000):
    """
    Randomly generate 'num_portfolios' portfolios. For each:
      - Create random weights (Dirichlet ensures sum=1)
      - Compute return, vol, and Sharpe
    Returns arrays (return, volatility, sharpe) and a list of the weight vectors.
    """
    ret_arr = np.zeros(num_portfolios)
    vol_arr = np.zeros(num_portfolios)
    sharpe_arr = np.zeros(num_portfolios)
    weights_record = []

    np.random.seed(42)  # for reproducibility

    for i in range(num_portfolios):
        # Dirichlet random weights that sum to 1
        w = np.random.dirichlet(np.ones(num_assets))
        port_ret, port_vol, sr = portfolio_performance(w, mean_returns, cov_matrix, risk_free_rate)

        ret_arr[i] = port_ret
        vol_arr[i] = port_vol
        sharpe_arr[i] = sr
        weights_record.append(w)

    return ret_arr, vol_arr, sharpe_arr, weights_record

# ------------------------------------------------------------------------
# 6) CONSTRAINT FUNCTIONS
# ------------------------------------------------------------------------
def weight_sum_constraint(weights):
    """Constraint: sum of weights must be exactly 1."""
    return np.sum(weights) - 1.0

# ------------------------------------------------------------------------
# 7) MAX SHARPE (SLSQP) OPTIMIZATION
# ------------------------------------------------------------------------
def neg_sharpe_ratio(weights, mean_returns, cov_matrix, risk_free_rate):
    """
    Objective function: minimize negative Sharpe ratio => maximize Sharpe.
    """
    _, _, sr = portfolio_performance(weights, mean_returns, cov_matrix, risk_free_rate)
    # If SR is NaN, give a big penalty:
    return -sr if np.isfinite(sr) else 1e6

def optimize_portfolio_max_sharpe(mean_returns, cov_matrix, risk_free_rate):
    """
    Uses SLSQP to find weights that maximize Sharpe, subject to:
      - sum(weights)=1
      - no short positions => weights >= 0
    """
    num_assets = len(mean_returns)
    init_guess = np.ones(num_assets) / num_assets
    bounds = [(0, 1) for _ in range(num_assets)]
    constraints = [{"type": "eq", "fun": weight_sum_constraint}]

    result = opt.minimize(
        fun=neg_sharpe_ratio,
        x0=init_guess,
        args=(mean_returns, cov_matrix, risk_free_rate),
        method="SLSQP",
        bounds=bounds,
        constraints=constraints
    )

    if not result.success:
        logging.error(f"Max Sharpe optimization failed: {result.message}")
        return None

    # Clip tiny negatives due to floating precision, re-normalize
    w = np.clip(result.x, 0, 1)
    w /= w.sum()
    return w

# ------------------------------------------------------------------------
# 8) RISK-CONSTRAINED OPTIMIZATION (VOL <= target_vol)
# ------------------------------------------------------------------------
def portfolio_vol(weights, cov_matrix):
    return np.sqrt(weights @ cov_matrix @ weights.T)

def neg_portfolio_return(weights, mean_returns):
    return -np.dot(weights, mean_returns)

def optimize_risk_constrained(mean_returns, cov_matrix, target_vol):
    """
    Maximize the portfolio's return subject to:
      - sum(weights)=1
      - no short positions => weights >= 0
      - portfolio_volatility(weights) <= target_vol
    """
    num_assets = len(mean_returns)
    init_guess = np.ones(num_assets) / num_assets
    bounds = [(0,1) for _ in range(num_assets)]

    def vol_constraint(w):
        return target_vol - portfolio_vol(w, cov_matrix)

    constraints = [
        {"type": "eq", "fun": weight_sum_constraint},
        {"type": "ineq", "fun": vol_constraint},
    ]

    result = opt.minimize(
        fun=neg_portfolio_return,
        x0=init_guess,
        args=(mean_returns,),
        method="SLSQP",
        bounds=bounds,
        constraints=constraints
    )

    if not result.success:
        logging.error(f"Risk-Constrained optimization failed: {result.message}")
        return None

    w = np.clip(result.x, 0, 1)
    w /= w.sum()
    return w

# ------------------------------------------------------------------------
# 9) BLENDING MULTIPLE PORTFOLIOS
# ------------------------------------------------------------------------
def blend_portfolios(weights_dict, blend_ratio):
    """
    Given a dictionary of { 'key': weight_vector } and a dictionary of { 'key': ratio },
    returns a single blended weight vector.
    Example usage:
        weights_dict = {
           'ms': w_max_sharpe,
           'mc': w_monte_carlo,
           'rc': w_risk_constrained
        }
        blend_ratio = {
           'ms': 0.50,
           'mc': 0.25,
           'rc': 0.25
        }
    """
    w_total = None
    for k, w_vec in weights_dict.items():
        if w_vec is None:
            continue  # skip any missing solutions
        if w_total is None:
            w_total = blend_ratio.get(k, 0) * w_vec
        else:
            w_total += blend_ratio.get(k, 0) * w_vec

    if w_total is None:
        return None

    w_total = np.clip(w_total, 0, 1)
    total_sum = w_total.sum()
    if total_sum < 1e-12:
        logging.error("Blended weights sum to nearly zero! Check ratios or weight vectors.")
        return None
    return w_total / total_sum

# ------------------------------------------------------------------------
# UTILITY: Convert a portfolio into a JSON-friendly dictionary
# ------------------------------------------------------------------------
def portfolio_to_json(weights, mean_returns_array, cov_matrix_array, rf_rate):
    """
    Given portfolio weights, compute (annual_return, volatility, sharpe),
    and return a dict storing ticker->weight plus these metrics.
    If weights is None, return an empty dict.
    """
    if weights is None:
        return {}

    port_ret, port_vol, port_sr = portfolio_performance(
        weights, mean_returns_array, cov_matrix_array, rf_rate
    )
    return {
        "weights": [float(w) for w in weights],       # raw list
        "annual_return": float(port_ret),
        "volatility": float(port_vol),
        "sharpe_ratio": float(port_sr),
    }

# ------------------------------------------------------------------------
# 10) MAIN FUNCTION (WITH JSON OUTPUT)
# ------------------------------------------------------------------------
def run_portfolio_analysis(
    tickers_list,
    risk_amount,
    capital_invested,
    csv_path="data/stock_data.csv",
    json_output_path="portfolio_results.json"
):
    """
    1) Loads and filters the CSV to keep only the tickers in 'tickers_list'.
    2) Computes log returns, then uses that to get annual mean returns and cov matrix.
    3) Fetches the current risk-free rate from FRED (fallback=2%).
    4) Runs Monte Carlo simulation to find best Sharpe.
    5) Runs analytical Max Sharpe optimization.
    6) Runs a risk-constrained optimization using 'risk_amount' as target_vol.
    7) Prints results.
    8) Creates three blended portfolios.
    9) Saves all results to JSON file (json_output_path).
    """
    # ================ Step A: Load the CSV & Filter Tickers ==============
    data = load_data(csv_path)
    data = data[tickers_list].dropna(axis=0, how='any')
    logging.info(f"Loaded data with shape {data.shape} for tickers {tickers_list}")

    # ================ Step B: Compute Log Returns ========================
    log_returns = compute_log_returns(data)
    mean_returns_annual = log_returns.mean() * 252
    cov_matrix_annual = log_returns.cov() * 252

    tickers = mean_returns_annual.index.tolist()
    mean_ret_array = mean_returns_annual.values
    cov_matrix_array = cov_matrix_annual.values

    # ================ Step C: Get Risk-Free Rate =========================
    rf_rate = get_risk_free_rate()
    logging.info(f"Fetched risk-free rate: {rf_rate:.4%}")

    # ================ Step D: Monte Carlo (MC) Simulation ===============
    num_portfolios = 5000
    mc_ret, mc_vol, mc_sr, mc_weights = monte_carlo_simulation(
        mean_ret_array, cov_matrix_array, rf_rate, len(tickers), num_portfolios
    )
    mc_best_idx = np.nanargmax(mc_sr)
    w_monte_carlo = mc_weights[mc_best_idx]
    mc_best_return = mc_ret[mc_best_idx]
    mc_best_vol = mc_vol[mc_best_idx]
    mc_best_sr = mc_sr[mc_best_idx]

    # ================ Step E: Max Sharpe (SLSQP) =========================
    w_max_sharpe = optimize_portfolio_max_sharpe(mean_ret_array, cov_matrix_array, rf_rate)
    ms_return, ms_vol, ms_sr = (None, None, None)
    if w_max_sharpe is not None:
        ms_return, ms_vol, ms_sr = portfolio_performance(w_max_sharpe, mean_ret_array, cov_matrix_array, rf_rate)

    # ================ Step F: Risk-Constrained ===========================
    w_risk_constrained = optimize_risk_constrained(mean_ret_array, cov_matrix_array, risk_amount)
    rc_return, rc_vol, rc_sr = (None, None, None)
    if w_risk_constrained is not None:
        rc_return, rc_vol, rc_sr = portfolio_performance(w_risk_constrained, mean_ret_array, cov_matrix_array, rf_rate)

    # ================ Step G: Print / Save Single Results ===============
    print("\n=== [1] MONTE CARLO BEST SHARPE ===")
    print(f"Index: {mc_best_idx}")
    for t, wval in zip(tickers, w_monte_carlo):
        print(f"  {t}: {wval:.2%}")
    print(f"Return: {mc_best_return:.2%}, Vol: {mc_best_vol:.2%}, Sharpe: {mc_best_sr:.2f}")

    print("\n=== [2] ANALYTICAL MAX SHARPE (SLSQP) ===")
    if w_max_sharpe is not None:
        for t, wval in zip(tickers, w_max_sharpe):
            print(f"  {t}: {wval:.2%}")
        print(f"Return: {ms_return:.2%}, Vol: {ms_vol:.2%}, Sharpe: {ms_sr:.2f}")
    else:
        print("Failed to optimize for Max Sharpe")

    print(f"\n=== [3] RISK-CONSTRAINED (Vol <= {risk_amount:.2%}) ===")
    if w_risk_constrained is not None:
        for t, wval in zip(tickers, w_risk_constrained):
            print(f"  {t}: {wval:.2%}")
        print(f"Return: {rc_return:.2%}, Vol: {rc_vol:.2%}, Sharpe: {rc_sr:.2f}")
    else:
        print("Failed to optimize for Risk-Constrained")

    # Prepare a dict to feed the blend function
    weights_dict = {
        'ms': w_max_sharpe,
        'mc': w_monte_carlo,
        'rc': w_risk_constrained
    }

    # ================ Step H: Create Blended Portfolios ==================
    print("\n=== [4] BLENDED PORTFOLIOS (3-solution combos) ===")

    # (A) Blend #1: 0.50 MS + 0.25 MC + 0.25 RC
    blend_ratio_1 = {'ms': 0.50, 'mc': 0.25, 'rc': 0.25}
    w_blend1 = blend_portfolios(weights_dict, blend_ratio_1)
    br1_return = br1_vol = br1_sr = None
    if w_blend1 is not None:
        br1_return, br1_vol, br1_sr = portfolio_performance(w_blend1, mean_ret_array, cov_matrix_array, rf_rate)
        print("\n--- Blend #1: 50% MS + 25% MC + 25% RC ---")
        for t, wval in zip(tickers, w_blend1):
            print(f"  {t}: {wval:.2%}")
        print(f"Return: {br1_return:.2%}, Vol: {br1_vol:.2%}, Sharpe: {br1_sr:.2f}")

    # (B) Blend #2: 0.33 MS + 0.33 MC + 0.33 RC
    blend_ratio_2 = {'ms': 0.33, 'mc': 0.33, 'rc': 0.33}
    w_blend2 = blend_portfolios(weights_dict, blend_ratio_2)
    br2_return = br2_vol = br2_sr = None
    if w_blend2 is not None:
        br2_return, br2_vol, br2_sr = portfolio_performance(w_blend2, mean_ret_array, cov_matrix_array, rf_rate)
        print("\n--- Blend #2: 33% MS + 33% MC + 33% RC ---")
        for t, wval in zip(tickers, w_blend2):
            print(f"  {t}: {wval:.2%}")
        print(f"Return: {br2_return:.2%}, Vol: {br2_vol:.2%}, Sharpe: {br2_sr:.2f}")

    # (C) Blend #3: 0.60 RC + 0.20 MC + 0.20 MS
    blend_ratio_3 = {'ms': 0.20, 'mc': 0.20, 'rc': 0.60}
    w_blend3 = blend_portfolios(weights_dict, blend_ratio_3)
    br3_return = br3_vol = br3_sr = None
    if w_blend3 is not None:
        br3_return, br3_vol, br3_sr = portfolio_performance(w_blend3, mean_ret_array, cov_matrix_array, rf_rate)
        print("\n--- Blend #3: 60% RC + 20% MC + 20% MS ---")
        for t, wval in zip(tickers, w_blend3):
            print(f"  {t}: {wval:.2%}")
        print(f"Return: {br3_return:.2%}, Vol: {br3_vol:.2%}, Sharpe: {br3_sr:.2f}")

    print("\n=== Process Complete! ===\n")

    # --------------------------------------------------------------------
    # Assemble a single dictionary to save to JSON
    # --------------------------------------------------------------------
    # We'll store each major result as a sub-dict with:
    #    { "weights": [...], "annual_return": float, "volatility": float, "sharpe_ratio": float }

    # 1) "Pure" solutions
    mc_dict = {
        "weights": {t: float(w) for t, w in zip(tickers, w_monte_carlo)},
        "annual_return": float(mc_best_return),
        "volatility": float(mc_best_vol),
        "sharpe_ratio": float(mc_best_sr)
    }

    ms_dict = {}
    if w_max_sharpe is not None:
        ms_dict = {
            "weights": {t: float(w) for t, w in zip(tickers, w_max_sharpe)},
            "annual_return": float(ms_return),
            "volatility": float(ms_vol),
            "sharpe_ratio": float(ms_sr)
        }

    rc_dict = {}
    if w_risk_constrained is not None:
        rc_dict = {
            "weights": {t: float(w) for t, w in zip(tickers, w_risk_constrained)},
            "annual_return": float(rc_return),
            "volatility": float(rc_vol),
            "sharpe_ratio": float(rc_sr)
        }

    # 2) Blended solutions
    blend1_dict = {}
    if w_blend1 is not None:
        blend1_dict = {
            "weights": {t: float(w) for t, w in zip(tickers, w_blend1)},
            "annual_return": float(br1_return),
            "volatility": float(br1_vol),
            "sharpe_ratio": float(br1_sr)
        }

    blend2_dict = {}
    if w_blend2 is not None:
        blend2_dict = {
            "weights": {t: float(w) for t, w in zip(tickers, w_blend2)},
            "annual_return": float(br2_return),
            "volatility": float(br2_vol),
            "sharpe_ratio": float(br2_sr)
        }

    blend3_dict = {}
    if w_blend3 is not None:
        blend3_dict = {
            "weights": {t: float(w) for t, w in zip(tickers, w_blend3)},
            "annual_return": float(br3_return),
            "volatility": float(br3_vol),
            "sharpe_ratio": float(br3_sr)
        }

    # Compose final JSON object
    json_output = {
        "portfolios": {
            "monte_carlo_best": mc_dict,
            "max_sharpe": ms_dict,
            "risk_constrained": rc_dict
        },
        "blended_portfolios": {
            "blend1": blend1_dict,
            "blend2": blend2_dict,
            "blend3": blend3_dict
        }
    }

    # --------------------------------------------------------------------
    # SAVE TO JSON FILE
    # --------------------------------------------------------------------
    with open(json_output_path, "w", encoding="utf-8") as outfile:
        json.dump(json_output, outfile, indent=4)

    # Also return it if you want to capture the structure in code
    return json_output


# ------------------------------------------------------------------------
# Example usage
# ------------------------------------------------------------------------
def get_companies_by_sectors(sectors):
    """
    Given a list of sector names, return a list of companies 
    that belong to any of those sectors.
    """
    df = pd.read_excel(r"C:\Users\USER\Desktop\Investment Platform\portopt\media\all_80_companies_with_sectors.xlsx")
    filtered_df = df[df['Sector'].isin(sectors)]
    companies = filtered_df['Company'].tolist()
    return companies
