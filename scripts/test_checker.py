import urllib.request
import json

req = urllib.request.Request(
    'http://localhost:3000/api/symptom-checker',
    data=json.dumps({
        'messages': [{'role': 'user', 'content': "I've had a persistent cough for 5 days"}]
    }).encode('utf-8'),
    headers={'Content-Type': 'application/json'}
)
try:
    with urllib.request.urlopen(req, timeout=15) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print('Symptom Checker Response Status:', resp.status)
        print('Urgency Level (Conversational/Gemini):', data.get('urgencyLevel'))
        print('Triage Category:', data.get('triageCategory'))
        print('ML Prediction:', json.dumps(data.get('mlPrediction'), indent=2))
        print('Summary:', data.get('summary'))
except Exception as e:
    print('Error testing symptom checker:', e)
