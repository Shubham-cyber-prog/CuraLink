"""
Train Diabetes Risk Prediction Model (Real PIMA Indians Diabetes Dataset)
Using Logistic Regression with StandardScaler for interpretable clinical risk assessment.
Uses the genuine, publicly published PIMA dataset from National Institute of Diabetes
and Digestive and Kidney Diseases (NIDDK), NOT synthetic approximations.
"""
import io
import os
import sys
import urllib.request
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    confusion_matrix,
    classification_report,
)
import joblib

FEATURE_NAMES = [
    "pregnancies",
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "bmi",
    "diabetes_pedigree_function",
    "age",
]

TARGET_NAME = "outcome"

# Known reliable public raw CSV sources for genuine PIMA Indians Diabetes dataset
PIMA_DATASET_URLS = [
    "https://raw.githubusercontent.com/jbrownlee/Datasets/master/pima-indians-diabetes.data.csv",
    "https://raw.githubusercontent.com/plotly/datasets/master/diabetes.csv",
]

ZERO_ANOMALY_COLUMNS = [
    "glucose",
    "blood_pressure",
    "skin_thickness",
    "insulin",
    "bmi",
]


def download_real_pima_dataset() -> pd.DataFrame:
    """Download the genuine PIMA Indians Diabetes dataset from verified public URLs."""
    errors = []
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) CuraLink-ML/1.0"}

    for url in PIMA_DATASET_URLS:
        try:
            print(f"Attempting to download genuine PIMA dataset from: {url}", flush=True)
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=15) as response:
                content = response.read()

            if "plotly" in url:
                df = pd.read_csv(io.BytesIO(content))
                df.columns = [c.lower() for c in df.columns]
                col_rename = {
                    "bloodpressure": "blood_pressure",
                    "skinthickness": "skin_thickness",
                    "diabetespedigreefunction": "diabetes_pedigree_function",
                }
                df.rename(columns=col_rename, inplace=True)
            else:
                cols = FEATURE_NAMES + [TARGET_NAME]
                df = pd.read_csv(io.BytesIO(content), names=cols, header=None)

            if len(df) == 768 and len(df.columns) == 9:
                print(f"Successfully downloaded genuine PIMA dataset ({len(df)} records) from {url}", flush=True)
                return df
            else:
                errors.append(f"{url}: unexpected dimensions ({len(df)} rows, {len(df.columns)} cols)")
        except Exception as e:
            errors.append(f"{url}: {e}")

    error_msg = (
        "\n" + "=" * 70 + "\n"
        "ERROR: Genuine PIMA Indians Diabetes dataset could not be downloaded.\n"
        "Network access may be restricted or URLs are temporarily unreachable.\n"
        "Attempted sources:\n" + "\n".join(f"  - {err}" for err in errors) + "\n\n"
        "PER INSTRUCTIONS: Synthetic data generation is strictly prohibited.\n"
        "Please download the dataset manually and place it at:\n"
        "  ml-service/training/pima_diabetes_dataset.csv\n"
        "=" * 70
    )
    raise RuntimeError(error_msg)


def is_genuine_pima_cache(cache_path: str) -> bool:
    """Validate that cached file is the genuine PIMA dataset and not synthetic data."""
    if not os.path.exists(cache_path):
        return False
    try:
        df = pd.read_csv(cache_path)
        if len(df) != 768 or len(df.columns) != 9:
            return False
        # The fake synthetic data had non-zero continuous floats for glucose (e.g. 102.068816)
        # and 0 zero-values for insulin. The real PIMA dataset has exact integer zeros in insulin (>300).
        if "insulin" in df.columns and (df["insulin"] == 0).sum() > 200:
            return True
        # If float values or 0 zeros in insulin, it's the old synthetic cache
        return False
    except Exception:
        return False


def get_pima_dataset(cache_path: str) -> pd.DataFrame:
    """Fetch cached real dataset or download from genuine public sources."""
    if is_genuine_pima_cache(cache_path):
        print(f"Loading cached genuine PIMA dataset from {cache_path}", flush=True)
        return pd.read_csv(cache_path)

    if os.path.exists(cache_path):
        print(f"Notice: Existing cache at {cache_path} is synthetic/invalid. Replacing with genuine dataset...", flush=True)

    df = download_real_pima_dataset()
    df.to_csv(cache_path, index=False)
    print(f"Cached genuine PIMA dataset ({len(df)} records) to {cache_path}", flush=True)
    return df


def train_and_evaluate():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    models_dir = os.path.join(current_dir, "..", "models")
    os.makedirs(models_dir, exist_ok=True)

    cache_file = os.path.join(current_dir, "pima_diabetes_dataset.csv")
    df = get_pima_dataset(cache_file)

    # ═══════════════════════════════════════════════════════════════════════
    # PREPROCESSING: ZERO-VALUE ANOMALIES IN REAL CLINICAL DATA
    # In genuine PIMA data, 0 in glucose, blood pressure, skin thickness,
    # insulin, and BMI represents missing clinical measurements (biologically
    # impossible in living individuals). Impute with median of valid values.
    # ═══════════════════════════════════════════════════════════════════════
    print("\nDetecting and handling zero-value anomalies in physiological features...", flush=True)
    df_clean = df.copy()
    for col in ZERO_ANOMALY_COLUMNS:
        zero_count = int((df_clean[col] == 0).sum())
        pct = (zero_count / len(df_clean)) * 100
        print(f"  - {col:18s}: {zero_count:3d} zeros ({pct:4.1f}% missing)", flush=True)
        df_clean[col] = df_clean[col].replace(0, np.nan)

    X = df_clean[FEATURE_NAMES]
    y = df_clean[TARGET_NAME]

    print(f"\nDataset shape: {X.shape}, Outcome distribution: {dict(y.value_counts())}", flush=True)

    # Train / Test split (80/20 stratified)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    # Impute missing values using medians computed strictly from training split (prevents data leakage)
    train_medians = {}
    X_train_imputed = X_train.copy()
    X_test_imputed = X_test.copy()

    for col in ZERO_ANOMALY_COLUMNS:
        med = float(X_train[col].median())
        train_medians[col] = med
        X_train_imputed[col] = X_train_imputed[col].fillna(med)
        X_test_imputed[col] = X_test_imputed[col].fillna(med)

    print("\nClinical Imputation Medians (from Training Set):", flush=True)
    for col, med in train_medians.items():
        print(f"  - {col:18s}: {med:.2f}", flush=True)

    # Standardize features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train_imputed)
    X_test_scaled = scaler.transform(X_test_imputed)

    # Train regularized Logistic Regression
    clf = LogisticRegression(max_iter=1000, random_state=42, C=1.0)
    clf.fit(X_train_scaled, y_train)

    y_pred = clf.predict(X_test_scaled)
    y_prob = clf.predict_proba(X_test_scaled)[:, 1]

    acc = float(accuracy_score(y_test, y_pred))
    prec = float(precision_score(y_test, y_pred))
    rec = float(recall_score(y_test, y_pred))
    f1 = float(f1_score(y_test, y_pred))
    cm = confusion_matrix(y_test, y_pred)

    print("\n" + "=" * 65, flush=True)
    print("  GENUINE PIMA DIABETES MODEL EVALUATION METRICS (Test Set 20%)", flush=True)
    print("=" * 65, flush=True)
    print(f"  Accuracy : {acc:.4f} ({acc*100:.2f}%)", flush=True)
    print(f"  Precision: {prec:.4f} ({prec*100:.2f}%)", flush=True)
    print(f"  Recall   : {rec:.4f} ({rec*100:.2f}%)", flush=True)
    print(f"  F1 Score : {f1:.4f} ({f1*100:.2f}%)", flush=True)
    print("\nConfusion Matrix:", flush=True)
    print(f"  TN: {cm[0][0]:3d} | FP: {cm[0][1]:3d}", flush=True)
    print(f"  FN: {cm[1][0]:3d} | TP: {cm[1][1]:3d}", flush=True)

    print("\nClassification Report:\n", classification_report(y_test, y_pred), flush=True)

    print("Feature Coefficients (Real Explainability Weights):", flush=True)
    for feat, coef in zip(FEATURE_NAMES, clf.coef_[0]):
        direction = "+" if coef > 0 else "-"
        print(f"  {feat:28s}: {direction}{abs(coef):.4f}", flush=True)

    model_path = os.path.join(models_dir, "diabetes_model.joblib")
    scaler_path = os.path.join(models_dir, "diabetes_scaler.joblib")
    metadata_path = os.path.join(models_dir, "diabetes_metadata.joblib")

    joblib.dump(clf, model_path)
    joblib.dump(scaler, scaler_path)
    joblib.dump({
        "features": FEATURE_NAMES,
        "metrics": {"accuracy": acc, "precision": prec, "recall": rec, "f1": f1},
        "intercept": float(clf.intercept_[0]),
        "coefficients": dict(zip(FEATURE_NAMES, clf.coef_[0].tolist())),
        "means": dict(zip(FEATURE_NAMES, scaler.mean_.tolist())),
        "scales": dict(zip(FEATURE_NAMES, scaler.scale_.tolist())),
        "impute_medians": train_medians,
    }, metadata_path)

    print(f"\nSaved model to: {model_path}", flush=True)
    print(f"Saved scaler to: {scaler_path}", flush=True)
    print(f"Saved metadata to: {metadata_path}", flush=True)
    return acc, prec, rec, f1


if __name__ == "__main__":
    train_and_evaluate()
