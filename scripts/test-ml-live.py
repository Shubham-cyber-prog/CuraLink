import urllib.request
import json

def test_api(url, payload=None):
    headers = {'Content-Type': 'application/json'}
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read())

print("=== ML SERVICE DIRECT TEST ===")
print("Health:", test_api("http://127.0.0.1:8000/health"))

diabetes_payload = {
    "pregnancies": 2,
    "glucose": 140,
    "blood_pressure": 80,
    "skin_thickness": 25,
    "insulin": 100,
    "bmi": 32,
    "diabetes_pedigree_function": 0.5,
    "age": 45
}
d_res = test_api("http://127.0.0.1:8000/predict/diabetes-risk", diabetes_payload)
print("\n--- Diabetes Risk Prediction ---")
print("Risk Level:", d_res["riskLevel"])
print("Risk Percentage:", d_res["riskPercentage"], "%")
print("Recommendation:", d_res["recommendation"])
print("Top 4 Feature Importance:")
for f in d_res["featureImportance"][:4]:
    print(f"  {f['displayName']:30s}: {f['contribution']:+.2f} ({f['direction']})")

heart_payload = {
    "age": 58,
    "sex": 1,
    "cp": 1,
    "trestbps": 135,
    "chol": 245,
    "fbs": 0,
    "restecg": 0,
    "thalach": 140,
    "exang": 1,
    "oldpeak": 1.5,
    "slope": 1,
    "ca": 1,
    "thal": 2
}
h_res = test_api("http://127.0.0.1:8000/predict/heart-risk", heart_payload)
print("\n--- Heart Disease Risk Prediction ---")
print("Risk Level:", h_res["riskLevel"])
print("Risk Percentage:", h_res["riskPercentage"], "%")
print("Recommendation:", h_res["recommendation"])
print("Top 4 Feature Importance:")
for f in h_res["featureImportance"][:4]:
    print(f"  {f['displayName']:30s}: {f['contribution']:+.2f} ({f['direction']})")

urgency_payload = {"symptomText": "I've had a persistent cough for 5 days"}
u_res = test_api("http://127.0.0.1:8000/predict/urgency", urgency_payload)
print("\n--- Urgency Classification ---")
print("Urgency Level:", u_res["urgencyLevel"])
print("Confidence:", u_res["confidencePercentage"], "%")
print("Model Type:", u_res["modelType"])
