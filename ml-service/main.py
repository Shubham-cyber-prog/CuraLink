"""
CuraLink Clinical Machine Learning Microservice
FastAPI Application providing:
1. PIMA Diabetes Risk Prediction with Linear Explainability
2. UCI Cleveland Cardiovascular Heart Disease Risk Prediction
3. Curated TF-IDF Clinical Symptom Urgency Text Classifier
"""
import os
import sys
from typing import List, Dict, Any, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import numpy as np
import pandas as pd
import joblib

app = FastAPI(
    title="CuraLink ML Microservice",
    description="Custom clinical predictive models for CuraLink healthcare platform",
    version="1.0.0",
)

# CORS Middleware to support requests from Next.js (port 3000) and Express (port 5000)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

# Loaded Model Containers
models: Dict[str, Any] = {}

def load_artifacts():
    """Load pre-trained models, scalers, and vectorizers into memory."""
    try:
        models["diabetes_model"] = joblib.load(os.path.join(MODELS_DIR, "diabetes_model.joblib"))
        models["diabetes_scaler"] = joblib.load(os.path.join(MODELS_DIR, "diabetes_scaler.joblib"))
        models["diabetes_metadata"] = joblib.load(os.path.join(MODELS_DIR, "diabetes_metadata.joblib"))

        models["heart_model"] = joblib.load(os.path.join(MODELS_DIR, "heart_model.joblib"))
        models["heart_scaler"] = joblib.load(os.path.join(MODELS_DIR, "heart_scaler.joblib"))
        models["heart_metadata"] = joblib.load(os.path.join(MODELS_DIR, "heart_metadata.joblib"))

        models["urgency_model"] = joblib.load(os.path.join(MODELS_DIR, "urgency_model.joblib"))
        models["urgency_vectorizer"] = joblib.load(os.path.join(MODELS_DIR, "urgency_vectorizer.joblib"))
        models["urgency_metadata"] = joblib.load(os.path.join(MODELS_DIR, "urgency_metadata.joblib"))
        print("[ML Service] All clinical models and vectorizers loaded successfully.", flush=True)
    except Exception as e:
        print(f"[ML Service] Error loading model artifacts: {e}", file=sys.stderr, flush=True)

# Load artifacts on module import
load_artifacts()

# ═══════════════════════════════════════════════════════════════════════════
# SCHEMAS
# ═══════════════════════════════════════════════════════════════════════════

class DiabetesInput(BaseModel):
    pregnancies: float = Field(default=0, ge=0, description="Number of pregnancies")
    glucose: float = Field(default=100, ge=0, description="Plasma glucose concentration (mg/dL)")
    bloodPressure: Optional[float] = Field(default=70, alias="blood_pressure", description="Diastolic blood pressure (mm Hg)")
    skinThickness: Optional[float] = Field(default=20, alias="skin_thickness", description="Triceps skin fold thickness (mm)")
    insulin: Optional[float] = Field(default=80, ge=0, description="2-Hour serum insulin (mu U/ml)")
    bmi: float = Field(default=25.0, ge=10, le=70, description="Body Mass Index (kg/m^2)")
    diabetesPedigreeFunction: Optional[float] = Field(
        default=0.45, alias="diabetes_pedigree_function", description="Diabetes pedigree function score"
    )
    age: float = Field(default=35, ge=1, le=120, description="Age in years")

    class Config:
        populate_by_name = True

class HeartInput(BaseModel):
    age: float = Field(default=50, ge=1, le=120, description="Age in years")
    sex: int = Field(default=1, ge=0, le=1, description="1 = male; 0 = female")
    cp: int = Field(default=0, ge=0, le=3, description="Chest pain type (0: typical, 1: atypical, 2: non-anginal, 3: asymptomatic)")
    trestbps: float = Field(default=125, ge=50, le=250, description="Resting blood pressure (mm Hg)")
    chol: float = Field(default=210, ge=80, le=600, description="Serum cholesterol (mg/dl)")
    fbs: int = Field(default=0, ge=0, le=1, description="Fasting blood sugar > 120 mg/dl (1 = true; 0 = false)")
    restecg: int = Field(default=0, ge=0, le=2, description="Resting ECG results (0-2)")
    thalach: float = Field(default=150, ge=50, le=230, description="Maximum heart rate achieved")
    exang: int = Field(default=0, ge=0, le=1, description="Exercise induced angina (1 = yes; 0 = no)")
    oldpeak: float = Field(default=0.0, ge=0.0, le=10.0, description="ST depression induced by exercise relative to rest")
    slope: int = Field(default=1, ge=0, le=2, description="Slope of peak exercise ST segment (0-2)")
    ca: int = Field(default=0, ge=0, le=3, description="Number of major vessels colored by fluoroscopy (0-3)")
    thal: int = Field(default=2, ge=1, le=3, description="Thalassemia (1: normal, 2: fixed, 3: reversible)")

    class Config:
        populate_by_name = True

class UrgencyInput(BaseModel):
    symptomText: Optional[str] = Field(default=None, alias="symptom_text")
    symptoms: Optional[str] = None
    message: Optional[str] = None

    class Config:
        populate_by_name = True

# Friendly display names for explainability
DIABETES_FEATURE_LABELS = {
    "pregnancies": "Pregnancies History",
    "glucose": "Blood Glucose Level",
    "blood_pressure": "Diastolic Blood Pressure",
    "skin_thickness": "Skin Fold Thickness",
    "insulin": "Serum Insulin Level",
    "bmi": "Body Mass Index (BMI)",
    "diabetes_pedigree_function": "Family Genetic Predisposition",
    "age": "Patient Age",
}

HEART_FEATURE_LABELS = {
    "age": "Patient Age",
    "sex": "Biological Sex",
    "cp": "Chest Pain Pattern",
    "trestbps": "Resting Blood Pressure",
    "chol": "Serum Cholesterol",
    "fbs": "Fasting Blood Sugar",
    "restecg": "Resting Electrocardiogram",
    "thalach": "Max Heart Rate Capacity",
    "exang": "Exercise-Induced Angina",
    "oldpeak": "Exercise ST Depression",
    "slope": "Peak ST Slope",
    "ca": "Major Fluoroscopy Vessels",
    "thal": "Thalassemia Flow Status",
}

# ═══════════════════════════════════════════════════════════════════════════
# ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/health")
def health_check():
    """Service health and loaded models status."""
    return {
        "status": "healthy",
        "service": "CuraLink ML Microservice",
        "version": "1.0.0",
        "modelsLoaded": list(models.keys()),
        "endpoints": [
            "/health",
            "/predict/diabetes-risk",
            "/predict/heart-risk",
            "/predict/urgency",
        ],
    }

@app.post("/predict/diabetes-risk")
def predict_diabetes_risk(data: DiabetesInput):
    """Predict Type 2 Diabetes risk with linear feature contribution explainability."""
    if "diabetes_model" not in models or "diabetes_scaler" not in models:
        raise HTTPException(status_code=503, detail="Diabetes model artifacts not loaded")

    clf = models["diabetes_model"]
    scaler = models["diabetes_scaler"]
    feature_names = models["diabetes_metadata"]["features"]

    # Assemble feature vector
    raw_vals = [
        data.pregnancies,
        data.glucose,
        data.bloodPressure if data.bloodPressure is not None else 70,
        data.skinThickness if data.skinThickness is not None else 20,
        data.insulin if data.insulin is not None else 80,
        data.bmi,
        data.diabetesPedigreeFunction if data.diabetesPedigreeFunction is not None else 0.45,
        data.age,
    ]

    x_df = pd.DataFrame([raw_vals], columns=feature_names)
    x_scaled = scaler.transform(x_df)

    # Risk Probability
    prob = float(clf.predict_proba(x_scaled)[0, 1])

    # Determine clinical risk tier
    if prob >= 0.65:
        risk_level = "HIGH"
        recommendation = "High risk detected. We strongly recommend scheduling a clinical metabolic panel and consulting an endocrinologist."
    elif prob >= 0.35:
        risk_level = "MEDIUM"
        recommendation = "Moderate risk. Lifestyle modifications (dietary optimization, physical activity) and routine blood sugar monitoring are advised."
    else:
        risk_level = "LOW"
        recommendation = "Low estimated risk. Continue maintaining balanced nutrition, regular exercise, and healthy weight."

    # Compute Feature Contributions (w_i * z_i) for explainability
    coefs = clf.coef_[0]
    scaled_vals = x_scaled[0]
    contributions = []

    for name, raw, z, w in zip(feature_names, raw_vals, scaled_vals, coefs):
        contrib = float(w * z)
        contributions.append({
            "feature": name,
            "displayName": DIABETES_FEATURE_LABELS.get(name, name),
            "rawValue": round(raw, 2),
            "contribution": round(contrib, 3),
            "direction": "increases_risk" if contrib > 0 else "protective",
        })

    # Sort by absolute impact descending
    contributions.sort(key=lambda item: abs(item["contribution"]), reverse=True)

    return {
        "riskScore": round(prob, 4),
        "riskPercentage": round(prob * 100, 1),
        "riskLevel": risk_level,
        "recommendation": recommendation,
        "featureImportance": contributions,
        "disclaimer": "This ML assessment provides informational risk estimation based on population statistics and is not a clinical diagnosis.",
    }

@app.post("/predict/heart-risk")
def predict_heart_risk(data: HeartInput):
    """Predict Cardiovascular Heart Disease risk with linear feature contribution explainability."""
    if "heart_model" not in models or "heart_scaler" not in models:
        raise HTTPException(status_code=503, detail="Heart disease model artifacts not loaded")

    clf = models["heart_model"]
    scaler = models["heart_scaler"]
    feature_names = models["heart_metadata"]["features"]

    raw_vals = [
        data.age,
        float(data.sex),
        float(data.cp),
        data.trestbps,
        data.chol,
        float(data.fbs),
        float(data.restecg),
        data.thalach,
        float(data.exang),
        data.oldpeak,
        float(data.slope),
        float(data.ca),
        float(data.thal),
    ]

    x_df = pd.DataFrame([raw_vals], columns=feature_names)
    x_scaled = scaler.transform(x_df)

    # Risk Probability
    prob = float(clf.predict_proba(x_scaled)[0, 1])

    if prob >= 0.65:
        risk_level = "HIGH"
        recommendation = "Elevated cardiovascular risk profile. An outpatient cardiology consultation with ECG and lipid follow-up is recommended."
    elif prob >= 0.35:
        risk_level = "MEDIUM"
        recommendation = "Moderate cardiovascular risk. Monitor resting blood pressure, manage stress, and consider a routine cardiovascular checkup."
    else:
        risk_level = "LOW"
        recommendation = "Optimal cardiovascular risk profile. Maintain heart-healthy cardiovascular exercise and balanced lipid intake."

    coefs = clf.coef_[0]
    scaled_vals = x_scaled[0]
    contributions = []

    for name, raw, z, w in zip(feature_names, raw_vals, scaled_vals, coefs):
        contrib = float(w * z)
        contributions.append({
            "feature": name,
            "displayName": HEART_FEATURE_LABELS.get(name, name),
            "rawValue": round(raw, 2),
            "contribution": round(contrib, 3),
            "direction": "increases_risk" if contrib > 0 else "protective",
        })

    contributions.sort(key=lambda item: abs(item["contribution"]), reverse=True)

    return {
        "riskScore": round(prob, 4),
        "riskPercentage": round(prob * 100, 1),
        "riskLevel": risk_level,
        "recommendation": recommendation,
        "featureImportance": contributions,
        "disclaimer": "This ML assessment provides informational cardiovascular risk estimation and is not a medical diagnosis.",
    }

@app.post("/predict/urgency")
def predict_urgency(data: UrgencyInput):
    """Classify free-text symptom description into LOW, MEDIUM, or HIGH clinical urgency."""
    if "urgency_model" not in models or "urgency_vectorizer" not in models:
        raise HTTPException(status_code=503, detail="Urgency classifier artifacts not loaded")

    text = (data.symptomText or data.symptoms or data.message or "").strip()
    if not text:
        raise HTTPException(status_code=400, detail="Please provide a non-empty symptomText string.")

    clf = models["urgency_model"]
    vectorizer = models["urgency_vectorizer"]

    vec = vectorizer.transform([text])
    pred_label = str(clf.predict(vec)[0])
    probs = clf.predict_proba(vec)[0]

    prob_dict = {
        cls_name: round(float(p), 4) for cls_name, p in zip(clf.classes_, probs)
    }
    confidence = float(max(probs))

    return {
        "urgencyLevel": pred_label,
        "confidence": round(confidence, 4),
        "confidencePercentage": round(confidence * 100, 1),
        "probabilities": prob_dict,
        "modelType": models["urgency_metadata"].get("model_type", "Logistic Regression (TF-IDF)"),
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
