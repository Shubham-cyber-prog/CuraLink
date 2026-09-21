/**
 * CuraLink ML Microservice Client
 * Connects the Node.js / Express backend to the Python FastAPI ML microservice.
 * Provides typesafe methods for Diabetes risk, Heart disease risk, and Symptom Urgency triage.
 */

export interface FeatureContribution {
  feature: string;
  displayName: string;
  rawValue: number;
  contribution: number;
  direction: 'increases_risk' | 'protective';
}

export interface RiskPredictionResult {
  riskScore: number;
  riskPercentage: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  featureImportance: FeatureContribution[];
  disclaimer: string;
}

export interface UrgencyPredictionResult {
  urgencyLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  confidence: number;
  confidencePercentage: number;
  probabilities: Record<string, number>;
  modelType: string;
}

export interface DiabetesRiskInput {
  pregnancies?: number;
  glucose: number;
  bloodPressure?: number;
  skinThickness?: number;
  insulin?: number;
  bmi: number;
  diabetesPedigreeFunction?: number;
  age: number;
}

export interface HeartRiskInput {
  age: number;
  sex: number; // 1 = male; 0 = female
  cp: number; // 0-3
  trestbps: number;
  chol: number;
  fbs?: number;
  restecg?: number;
  thalach: number;
  exang?: number;
  oldpeak: number;
  slope?: number;
  ca?: number;
  thal?: number;
}

export class MLServiceClient {
  private baseUrl: string;
  private timeoutMs: number;

  constructor(baseUrl?: string, timeoutMs: number = 3000) {
    this.baseUrl = baseUrl || process.env.ML_SERVICE_URL || 'http://localhost:8000';
    this.timeoutMs = timeoutMs;
  }

  /**
   * Health check to verify Python ML service uptime.
   */
  async checkHealth(): Promise<{ healthy: boolean; details?: any }> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/health`, {
        signal: controller.signal,
      });
      clearTimeout(id);

      if (res.ok) {
        const data = await res.json();
        return { healthy: true, details: data };
      }
      return { healthy: false };
    } catch (err: any) {
      console.warn(`[ML Service Client] Health check failed: ${err?.message || err}`);
      return { healthy: false };
    }
  }

  /**
   * Predicts Type 2 Diabetes risk and returns linear feature contribution explainability.
   */
  async predictDiabetesRisk(input: DiabetesRiskInput): Promise<RiskPredictionResult | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/predict/diabetes-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`ML Service responded with HTTP ${res.status}`);
      }

      return (await res.json()) as RiskPredictionResult;
    } catch (err: any) {
      console.error(`[ML Service Client] Diabetes risk prediction error: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Predicts Cardiovascular Heart Disease risk with feature importance breakdown.
   */
  async predictHeartRisk(input: HeartRiskInput): Promise<RiskPredictionResult | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/predict/heart-risk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`ML Service responded with HTTP ${res.status}`);
      }

      return (await res.json()) as RiskPredictionResult;
    } catch (err: any) {
      console.error(`[ML Service Client] Heart disease prediction error: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Classifies free-text patient symptom into LOW, MEDIUM, or HIGH clinical urgency.
   */
  async predictUrgency(symptomText: string): Promise<UrgencyPredictionResult | null> {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), this.timeoutMs);

      const res = await fetch(`${this.baseUrl}/predict/urgency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptomText }),
        signal: controller.signal,
      });
      clearTimeout(id);

      if (!res.ok) {
        throw new Error(`ML Service responded with HTTP ${res.status}`);
      }

      return (await res.json()) as UrgencyPredictionResult;
    } catch (err: any) {
      console.warn(`[ML Service Client] Urgency classification call skipped: ${err?.message || err}`);
      return null;
    }
  }
}

export const mlServiceClient = new MLServiceClient();
