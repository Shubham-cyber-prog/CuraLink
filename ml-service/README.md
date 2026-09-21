# CuraLink Clinical Machine Learning Microservice

A dedicated Python microservice providing clinical predictive risk models and free-text symptom urgency triage for the CuraLink healthcare platform.

Runs alongside the Node/Express backend (`port 5000`) and Next.js frontend (`port 3000`) on **`http://localhost:8000`**.

---

## 1. Clinical Models Overview & Performance Metrics

All models were evaluated using an **80/20 train/test split** with stratified sampling.

### Model 1: Type 2 Diabetes Risk Model
- **Dataset**: PIMA Indians Diabetes Dataset (768 patient records, 8 clinical features).
- **Features**: `pregnancies`, `glucose`, `blood_pressure`, `skin_thickness`, `insulin`, `bmi`, `diabetes_pedigree_function`, `age`.
- **Algorithm**: `StandardScaler` + `LogisticRegression(max_iter=1000, random_state=42)`.
- **Evaluation Metrics (20% Test Set)**:
  - **Accuracy**: **89.61%**
  - **Precision**: **91.30%**
  - **Recall**: **77.78%**
  - **F1 Score**: **84.00%**
  - **Confusion Matrix**: TN: 96 | FP: 4 | FN: 12 | TP: 42
- **Top Risk Factors**: Fasting Glucose (+1.35), Serum Insulin (+1.54), BMI (+0.89), Pregnancies (+0.98), Age (+0.57).

---

### Model 2: Cardiovascular Heart Disease Risk Model
- **Dataset**: UCI Cleveland Heart Disease Dataset (303 patient records, 13 clinical features).
- **Features**: `age`, `sex`, `cp` (chest pain type), `trestbps` (resting BP), `chol` (serum cholesterol), `fbs` (fasting blood sugar), `restecg`, `thalach` (max heart rate), `exang` (exercise angina), `oldpeak`, `slope`, `ca` (fluoroscopy vessels), `thal`.
- **Algorithm**: `StandardScaler` + `LogisticRegression(max_iter=1000, random_state=42)`.
- **Evaluation Metrics (20% Test Set)**:
  - **Accuracy**: **90.16%**
  - **Precision**: **89.66%**
  - **Recall**: **89.66%**
  - **F1 Score**: **89.66%**
  - **Confusion Matrix**: TN: 29 | FP: 3 | FN: 3 | TP: 26
- **Top Risk Factors**: Exercise ST Depression / Oldpeak (+1.58), Exercise-Induced Angina (+1.27), Major Fluoroscopy Vessels / CA (+0.75), Thalassemia (+0.81), Age (+0.65).

---

### Model 3: Clinical Symptom Urgency Text Classifier
- **Dataset**: Curated clinical dataset of 180 realistic patient complaints balanced across `LOW` (60), `MEDIUM` (60), and `HIGH` (60) urgency categories.
- **Representation**: `TfidfVectorizer(ngram_range=(1, 2), sublinear_tf=True, stop_words="english")`.
- **Model Comparison**:
  - **Logistic Regression (TF-IDF)**: **88.89% Accuracy** | **0.8887 Weighted F1** *(Selected)*
  - **Multinomial Naive Bayes**: **75.00% Accuracy** | **0.7525 Weighted F1**
- **Evaluation Metrics (20% Test Set - Logistic Regression)**:
  - **Accuracy**: **88.89%**
  - **Weighted F1 Score**: **88.87%**
  - **Per-Class F1 Scores**:
    - `LOW`: Precision: **0.9167** | Recall: **0.9167** | F1: **0.9167**
    - `MEDIUM`: Precision: **0.9091** | Recall: **0.8333** | F1: **0.8696**
    - `HIGH`: Precision: **0.8462** | Recall: **0.9167** | F1: **0.8800**

---

## 2. Clinical & Technical Rationale: Why Logistic Regression?

In safety-critical healthcare applications, "black box" models (deep neural networks or opaque ensembles) present severe regulatory and clinical adoption risks. We selected regularized **Logistic Regression** paired with `StandardScaler` for the following reasons:

1. **Direct Mathematical Interpretability**:
   Every prediction has a transparent linear attribution:
   $$\text{logit}(P) = \beta_0 + \sum_{i=1}^n w_i \cdot z_i$$
   where $w_i$ is the trained model coefficient and $z_i = \frac{x_i - \mu_i}{\sigma_i}$ is the standardized biomarker input.
   This allows CuraLink to instantly compute and display exact feature contribution percentages to both doctors and patients without the computational overhead of sampling-based explainers (like KernelSHAP).

2. **Calibrated Probabilities**:
   Logistic regression outputs well-calibrated probabilities via the sigmoid function, allowing continuous risk score percentiles (0% to 100%) and clear risk classification thresholds (`LOW` < 35%, `MEDIUM` 35%–65%, `HIGH` > 65%).

3. **High Clinical Generalizability**:
   With $L_2$ regularization, Logistic Regression avoids overfitting on small-to-moderate clinical sample sizes ($N \approx 300 - 800$), maintaining high test-set generalizability.

---

## 3. Microservice API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service uptime and list of loaded `.joblib` model artifacts. |
| `POST` | `/predict/diabetes-risk` | Predicts diabetes risk score (0–1), risk tier, and feature importance. |
| `POST` | `/predict/heart-risk` | Predicts cardiovascular heart disease risk with feature contribution bars. |
| `POST` | `/predict/urgency` | Classifies free-text patient symptom into `LOW`, `MEDIUM`, or `HIGH`. |

---

## 4. How to Run & Retrain

### Running the Microservice
```powershell
# From CuraLink root directory
python -m uvicorn main:app --app-dir ml-service --host 0.0.0.0 --port 8000 --reload
```

### Retraining the Models
```powershell
# Retrain Diabetes Model
python ml-service/training/train_diabetes_model.py

# Retrain Heart Disease Model
python ml-service/training/train_heart_model.py

# Retrain Symptom Urgency Classifier
python ml-service/training/train_urgency_classifier.py
```
Trained artifacts are automatically saved into `ml-service/models/` in `.joblib` format.
