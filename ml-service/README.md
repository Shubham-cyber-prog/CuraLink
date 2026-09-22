# CuraLink Clinical Machine Learning Microservice

A dedicated Python microservice providing clinical predictive risk models and free-text symptom urgency triage for the CuraLink healthcare platform.

Runs alongside the Node/Express backend (`port 5000`) and Next.js frontend (`port 3000`) on **`http://localhost:8000`**.

---

## 1. Clinical Models Overview & Performance Metrics

All models were evaluated using an **80/20 train/test split** with stratified sampling on genuine, published clinical datasets (no synthetic generation).

### Model 1: Type 2 Diabetes Risk Model
- **Dataset**: Genuine PIMA Indians Diabetes Dataset (National Institute of Diabetes and Digestive and Kidney Diseases, 768 patient records, 8 clinical features).
- **Features**: `pregnancies`, `glucose`, `blood_pressure`, `skin_thickness`, `insulin`, `bmi`, `diabetes_pedigree_function`, `age`.
- **Data Preprocessing**: Zero-value biological anomalies (invalid 0s in glucose, blood pressure, skin thickness, insulin, BMI) detected and imputed using median values computed on the training split to prevent data leakage.
- **Algorithm**: `StandardScaler` + `LogisticRegression(max_iter=1000, random_state=42)`.
- **Evaluation Metrics (20% Test Set - Real Data)**:
  - **Accuracy**: **70.78%**
  - **Precision**: **60.00%**
  - **Recall**: **50.00%**
  - **F1 Score**: **54.55%**
  - **Confusion Matrix**: TN: 82 | FP: 18 | FN: 27 | TP: 27
- **Top Risk Factors**: Blood Glucose (+1.18), BMI (+0.69), Pregnancies (+0.38), Diabetes Pedigree Function (+0.23), Age (+0.15).

---

### Model 2: Cardiovascular Heart Disease Risk Model
- **Dataset**: Genuine UCI Cleveland Heart Disease Dataset (Cleveland Clinic Foundation via UCI ML Repository, 303 patient records, 13 clinical features).
- **Features**: `age`, `sex`, `cp` (chest pain type), `trestbps` (resting BP), `chol` (serum cholesterol), `fbs` (fasting blood sugar), `restecg`, `thalach` (max heart rate), `exang` (exercise angina), `oldpeak`, `slope`, `ca` (fluoroscopy vessels), `thal`.
- **Data Preprocessing**: Target binarized (0 = absence of disease <50% narrowing, 1 = presence of disease >50% narrowing); missing values in fluoroscopy vessels (`ca`) and thalassemia (`thal`) imputed using training split medians.
- **Algorithm**: `StandardScaler` + `LogisticRegression(max_iter=1000, random_state=42)`.
- **Evaluation Metrics (20% Test Set - Real Data)**:
  - **Accuracy**: **86.89%**
  - **Precision**: **81.25%**
  - **Recall**: **92.86%**
  - **F1 Score**: **86.67%**
  - **Confusion Matrix**: TN: 27 | FP: 6 | FN: 2 | TP: 26
- **Top Risk Factors**: Major Fluoroscopy Vessels / CA (+1.11), Thalassemia (+0.68), Biological Sex (+0.66), Chest Pain / CP (+0.54), Exercise Angina (+0.38), Peak ST Slope (+0.35). Max Heart Rate Capacity / Thalach (-0.35, protective).

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
