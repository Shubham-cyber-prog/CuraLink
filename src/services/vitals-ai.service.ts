/**
 * CuraLink AI Vitals Pattern & Deterioration Early Warning Engine
 * 
 * Analyzes longitudinal patient vitals (Blood Glucose, Blood Pressure, Weight, Heart Rate)
 * to detect subtle, gradual deterioration drifts (e.g., rising sugar over 14 days)
 * before acute clinical emergencies occur.
 */

export interface VitalRecord {
  id: string;
  userId: string;
  systolicBp?: number | null;
  diastolicBp?: number | null;
  bloodGlucose?: number | null;
  glucoseType?: string | null;
  weight?: number | null;
  heartRate?: number | null;
  spO2?: number | null;
  temperature?: number | null;
  notes?: string | null;
  recordedAt: Date | string;
}

export interface MetricTrendAnalysis {
  metric: 'glucose' | 'bloodPressure' | 'weight' | 'heartRate';
  displayName: string;
  unit: string;
  currentValue: number | null;
  baselineValue: number | null;
  sevenDayAvg: number | null;
  fourteenDayAvg: number | null;
  deltaFromBaseline: number | null;
  slope: number; // rate of change per day
  trajectory: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  severity: 'NORMAL' | 'MILD_CONCERN' | 'MODERATE_WARNING' | 'CRITICAL';
  statusDescription: string;
}

export interface ClinicalAlert {
  id: string;
  metric: 'glucose' | 'bloodPressure' | 'weight' | 'heartRate' | 'overall';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  titleHindi?: string;
  message: string;
  messageHindi?: string;
  clinicalRationale: string;
  recommendedAction: string;
  suggestDoctorConsultation: boolean;
  detectedAt: string;
}

export interface LongitudinalHealthReport {
  overallTrajectory: 'IMPROVING' | 'STABLE' | 'DETERIORATING';
  totalLogsAnalyzed: number;
  dateRange: { start: string; end: string };
  alerts: ClinicalAlert[];
  metricInsights: {
    glucose?: MetricTrendAnalysis;
    bloodPressure?: MetricTrendAnalysis;
    weight?: MetricTrendAnalysis;
    heartRate?: MetricTrendAnalysis;
  };
  summaryText: string;
  summaryTextHindi: string;
}

/**
 * Calculates linear regression slope: m = (N*sum(xy) - sum(x)*sum(y)) / (N*sum(x^2) - (sum(x))^2)
 */
function calculateSlope(points: Array<{ x: number; y: number }>): number {
  if (points.length < 2) return 0;
  const n = points.length;
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;

  for (const p of points) {
    sumX += p.x;
    sumY += p.y;
    sumXY += p.x * p.y;
    sumXX += p.x * p.x;
  }

  const denominator = n * sumXX - sumX * sumX;
  if (denominator === 0) return 0;
  return (n * sumXY - sumX * sumY) / denominator;
}

/**
 * Helper to compute average of array of numbers
 */
function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  const sum = nums.reduce((a, b) => a + b, 0);
  return Math.round((sum / nums.length) * 10) / 10;
}

export class VitalsAiService {
  /**
   * Analyzes longitudinal vital records and synthesizes clinical deterioration warnings.
   */
  public static analyzeVitals(records: VitalRecord[]): LongitudinalHealthReport {
    if (!records || records.length === 0) {
      return {
        overallTrajectory: 'STABLE',
        totalLogsAnalyzed: 0,
        dateRange: { start: new Date().toISOString(), end: new Date().toISOString() },
        alerts: [],
        metricInsights: {},
        summaryText: 'No vital logs recorded yet. Start logging your daily vitals to enable AI pattern detection.',
        summaryTextHindi: 'Abhi tak koi vitals log nahi kiye gaye hain. AI trend analysis shuru karne ke liye roz apne vitals log karein.',
      };
    }

    // Sort chronologically ascending
    const sorted = [...records].sort(
      (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
    );

    const firstDate = new Date(sorted[0].recordedAt);
    const lastDate = new Date(sorted[sorted.length - 1].recordedAt);
    const alerts: ClinicalAlert[] = [];

    // ─────────────────────────────────────────────────────────────
    // 1. BLOOD GLUCOSE ANALYSIS
    // ─────────────────────────────────────────────────────────────
    const glucosePoints: Array<{ x: number; y: number; val: number; date: Date }> = [];
    for (const r of sorted) {
      if (typeof r.bloodGlucose === 'number' && !isNaN(r.bloodGlucose) && r.bloodGlucose > 0) {
        const d = new Date(r.recordedAt);
        const dayDiff = (d.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
        glucosePoints.push({ x: dayDiff, y: r.bloodGlucose, val: r.bloodGlucose, date: d });
      }
    }

    let glucoseAnalysis: MetricTrendAnalysis | undefined;

    if (glucosePoints.length >= 3) {
      const glucoseVals = glucosePoints.map((p) => p.val);
      const slope = calculateSlope(glucosePoints);
      const latestVal = glucoseVals[glucoseVals.length - 1];

      // Recent 7 days vs initial baseline
      const lastWeekCutoff = lastDate.getTime() - 7 * 24 * 60 * 60 * 1000;
      const recent7Vals = glucosePoints
        .filter((p) => p.date.getTime() >= lastWeekCutoff)
        .map((p) => p.val);
      const baselineVals = glucoseVals.slice(0, Math.min(5, Math.ceil(glucoseVals.length / 2)));

      const sevenDayAvg = average(recent7Vals) ?? latestVal;
      const baselineAvg = average(baselineVals) ?? glucoseVals[0];
      const delta = Math.round((sevenDayAvg - baselineAvg) * 10) / 10;

      let trajectory: MetricTrendAnalysis['trajectory'] = 'STABLE';
      let severity: MetricTrendAnalysis['severity'] = 'NORMAL';
      let statusDesc = 'Blood sugar levels are stable within normal physiological boundaries.';

      // Deterioration criteria: positive drift > 0.8 mg/dL/day OR delta > 15 mg/dL OR recent avg > 126
      if (slope > 0.6 || delta >= 15 || sevenDayAvg >= 130) {
        trajectory = 'DETERIORATING';
        if (sevenDayAvg >= 150 || delta >= 30) {
          severity = 'CRITICAL';
          statusDesc = `Significant upward trajectory (+${delta} mg/dL rise). Average blood glucose is persistently elevated at ${sevenDayAvg} mg/dL.`;
        } else {
          severity = 'MODERATE_WARNING';
          statusDesc = `Steady rising blood glucose trend detected (+${delta} mg/dL over baseline). Glycemic control is drifting upwards.`;
        }

        alerts.push({
          id: 'alert_glucose_rising',
          metric: 'glucose',
          severity: severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          title: 'Rising Blood Glucose Trend (Deterioration)',
          titleHindi: 'Blood Sugar Mein Rising Trend (Deterioration)',
          message: `Your fasting blood glucose has shown a consistent rising trend (+${delta} mg/dL average increase over baseline, currently averaging ${sevenDayAvg} mg/dL). This steady upward drift may indicate declining glycemic control.`,
          messageHindi: `Aapke blood sugar levels mein pichhle readings se consistently rising trend (+${delta} mg/dL badhotari, current average ${sevenDayAvg} mg/dL) dekha gaya hai. Yeh glycemic control loose hone ka sanket ho sakta hai.`,
          clinicalRationale: 'Sustained positive glycemic drift over 10-14 days indicates potential insulin resistance progression or inadequate pharmacotherapy.',
          recommendedAction: 'Schedule a clinical consultation with your physician or endocrinologist to review diet, lifestyle, or adjust medication dosage.',
          suggestDoctorConsultation: true,
          detectedAt: lastDate.toISOString(),
        });
      } else if (slope < -0.6 && delta <= -12) {
        trajectory = 'IMPROVING';
        severity = 'NORMAL';
        statusDesc = `Blood sugar levels are improving (-${Math.abs(delta)} mg/dL drop toward optimal glycemic target).`;
      }

      glucoseAnalysis = {
        metric: 'glucose',
        displayName: 'Blood Glucose',
        unit: 'mg/dL',
        currentValue: latestVal,
        baselineValue: baselineAvg,
        sevenDayAvg,
        fourteenDayAvg: average(glucoseVals.slice(-14)),
        deltaFromBaseline: delta,
        slope: Math.round(slope * 100) / 100,
        trajectory,
        severity,
        statusDescription: statusDesc,
      };
    }

    // ─────────────────────────────────────────────────────────────
    // 2. BLOOD PRESSURE ANALYSIS (Systolic & Diastolic)
    // ─────────────────────────────────────────────────────────────
    const bpPoints: Array<{ x: number; ySys: number; yDia: number; date: Date }> = [];
    for (const r of sorted) {
      if (r.systolicBp && r.diastolicBp) {
        const d = new Date(r.recordedAt);
        const dayDiff = (d.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
        bpPoints.push({ x: dayDiff, ySys: r.systolicBp, yDia: r.diastolicBp, date: d });
      }
    }

    let bpAnalysis: MetricTrendAnalysis | undefined;

    if (bpPoints.length >= 3) {
      const sysVals = bpPoints.map((p) => p.ySys);
      const diaVals = bpPoints.map((p) => p.yDia);
      const sysSlope = calculateSlope(bpPoints.map((p) => ({ x: p.x, y: p.ySys })));

      const latestSys = sysVals[sysVals.length - 1];
      const latestDia = diaVals[diaVals.length - 1];

      const baselineSys = average(sysVals.slice(0, Math.min(5, Math.ceil(sysVals.length / 2)))) ?? sysVals[0];
      const sevenDaySys = average(sysVals.slice(-7)) ?? latestSys;
      const deltaSys = Math.round((sevenDaySys - baselineSys) * 10) / 10;

      let trajectory: MetricTrendAnalysis['trajectory'] = 'STABLE';
      let severity: MetricTrendAnalysis['severity'] = 'NORMAL';
      let statusDesc = `Resting BP is within acceptable limits (${latestSys}/${latestDia} mmHg).`;

      if (sysSlope > 0.5 || deltaSys >= 10 || sevenDaySys >= 135) {
        trajectory = 'DETERIORATING';
        if (sevenDaySys >= 145 || latestSys >= 150) {
          severity = 'CRITICAL';
          statusDesc = `Hypertensive upward drift (+${deltaSys} mmHg). Average systolic pressure has risen to ${sevenDaySys} mmHg (Stage 2 Hypertension range).`;
        } else {
          severity = 'MODERATE_WARNING';
          statusDesc = `Gradual systolic BP creep detected (+${deltaSys} mmHg increase over baseline).`;
        }

        alerts.push({
          id: 'alert_bp_creeping',
          metric: 'bloodPressure',
          severity: severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
          title: 'Hypertensive Drift (Rising Blood Pressure)',
          titleHindi: 'Blood Pressure Mein Badhotari (Hypertensive Drift)',
          message: `Your blood pressure readings indicate an upward trajectory (+${deltaSys} mmHg systolic rise, recent average ${sevenDaySys}/${Math.round(average(diaVals.slice(-7)) || latestDia)} mmHg).`,
          messageHindi: `Aapke blood pressure mein lagataar badhotari (+${deltaSys} mmHg systolic drift) dekhi gayi hai. Current average ${sevenDaySys} mmHg hai.`,
          clinicalRationale: 'Persistent elevation in resting systolic pressure over multiple weeks increases cardiovascular afterload and arterial stress.',
          recommendedAction: 'Monitor sodium intake, reduce stress, and book an appointment with a doctor for a cardiovascular checkup.',
          suggestDoctorConsultation: true,
          detectedAt: lastDate.toISOString(),
        });
      } else if (sysSlope < -0.5 && deltaSys <= -8) {
        trajectory = 'IMPROVING';
        statusDesc = `Blood pressure is trending lower (-${Math.abs(deltaSys)} mmHg systolic improvement).`;
      }

      bpAnalysis = {
        metric: 'bloodPressure',
        displayName: 'Blood Pressure (Systolic)',
        unit: 'mmHg',
        currentValue: latestSys,
        baselineValue: baselineSys,
        sevenDayAvg: sevenDaySys,
        fourteenDayAvg: average(sysVals.slice(-14)),
        deltaFromBaseline: deltaSys,
        slope: Math.round(sysSlope * 100) / 100,
        trajectory,
        severity,
        statusDescription: statusDesc,
      };
    }

    // ─────────────────────────────────────────────────────────────
    // 3. WEIGHT & FLUID RETENTION ANALYSIS
    // ─────────────────────────────────────────────────────────────
    const weightPoints: Array<{ x: number; y: number; val: number; date: Date }> = [];
    for (const r of sorted) {
      if (r.weight && r.weight > 0) {
        const d = new Date(r.recordedAt);
        const dayDiff = (d.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
        weightPoints.push({ x: dayDiff, y: r.weight, val: r.weight, date: d });
      }
    }

    let weightAnalysis: MetricTrendAnalysis | undefined;

    if (weightPoints.length >= 3) {
      const weightVals = weightPoints.map((p) => p.val);
      const slope = calculateSlope(weightPoints);
      const latestWeight = weightVals[weightVals.length - 1];
      const baselineWeight = average(weightVals.slice(0, 3)) ?? weightVals[0];
      const deltaWeight = Math.round((latestWeight - baselineWeight) * 10) / 10;

      // Check for rapid fluid retention spike (>2.0 kg in <5 days)
      const last5Days = weightPoints.slice(-5);
      const rapidGain = last5Days.length >= 2 && (last5Days[last5Days.length - 1].val - last5Days[0].val >= 2.0);

      let trajectory: MetricTrendAnalysis['trajectory'] = 'STABLE';
      let severity: MetricTrendAnalysis['severity'] = 'NORMAL';
      let statusDesc = `Weight is stable (${latestWeight} kg).`;

      if (rapidGain) {
        trajectory = 'DETERIORATING';
        severity = 'CRITICAL';
        statusDesc = `Rapid weight increase detected (+${deltaWeight} kg in under 5 days), which may indicate fluid retention.`;

        alerts.push({
          id: 'alert_weight_spike',
          metric: 'weight',
          severity: 'CRITICAL',
          title: 'Rapid Weight Spike (Possible Fluid Retention)',
          titleHindi: 'Achanak Wazan Badhna (Fluid Retention)',
          message: `Your weight increased rapidly by +${deltaWeight} kg within recent days. In cardiovascular and metabolic patients, sudden weight gain often indicates fluid retention rather than body fat.`,
          messageHindi: `Aapke wazan mein achanak tezi se badhotari (+${deltaWeight} kg) dekhi gayi hai. Yeh shareer mein paani jama hone (fluid retention) ka sanket ho sakta hai.`,
          clinicalRationale: 'Acute weight increases over 2-3 days are a classical hallmark of acute decompensated heart failure or renal sodium/water retention.',
          recommendedAction: 'Check for swelling in ankles or feet, and promptly consult your physician for evaluation.',
          suggestDoctorConsultation: true,
          detectedAt: lastDate.toISOString(),
        });
      } else if (Math.abs(deltaWeight) >= 3.0 && slope > 0.1) {
        trajectory = 'DETERIORATING';
        severity = 'MILD_CONCERN';
        statusDesc = `Gradual weight gain (+${deltaWeight} kg over baseline).`;
      } else if (deltaWeight <= -2.0 && slope < -0.1) {
        trajectory = 'IMPROVING';
        statusDesc = `Steady, healthy weight reduction (-${Math.abs(deltaWeight)} kg from baseline).`;
      }

      weightAnalysis = {
        metric: 'weight',
        displayName: 'Body Weight',
        unit: 'kg',
        currentValue: latestWeight,
        baselineValue: baselineWeight,
        sevenDayAvg: average(weightVals.slice(-7)),
        fourteenDayAvg: average(weightVals.slice(-14)),
        deltaFromBaseline: deltaWeight,
        slope: Math.round(slope * 100) / 100,
        trajectory,
        severity,
        statusDescription: statusDesc,
      };
    }

    // Determine overall health trajectory
    const hasDeterioration =
      glucoseAnalysis?.trajectory === 'DETERIORATING' ||
      bpAnalysis?.trajectory === 'DETERIORATING' ||
      weightAnalysis?.trajectory === 'DETERIORATING';

    const hasImprovement =
      glucoseAnalysis?.trajectory === 'IMPROVING' ||
      bpAnalysis?.trajectory === 'IMPROVING' ||
      weightAnalysis?.trajectory === 'IMPROVING';

    const overallTrajectory: LongitudinalHealthReport['overallTrajectory'] = hasDeterioration
      ? 'DETERIORATING'
      : hasImprovement
      ? 'IMPROVING'
      : 'STABLE';

    // Summary texts
    let summaryText = 'Your physiological vitals have remained consistent and stable across recent recordings.';
    let summaryTextHindi = 'Aapke vitals pichhle recordings ke dauraan stable aur santulit rahe hain.';

    if (overallTrajectory === 'DETERIORATING') {
      const deterioratingMetrics: string[] = [];
      if (glucoseAnalysis?.trajectory === 'DETERIORATING') deterioratingMetrics.push('blood glucose');
      if (bpAnalysis?.trajectory === 'DETERIORATING') deterioratingMetrics.push('blood pressure');
      if (weightAnalysis?.trajectory === 'DETERIORATING') deterioratingMetrics.push('weight');

      summaryText = `AI Early Warning: Consistent upward drift detected in ${deterioratingMetrics.join(' and ')}. Proactive clinical review is recommended to prevent chronic complications.`;
      summaryTextHindi = `AI Early Warning: Aapke ${deterioratingMetrics.join(' aur ')} mein badhta hua trend dekha gaya hai. Kripya samay rehte doctor se paramarsh lein.`;
    } else if (overallTrajectory === 'IMPROVING') {
      summaryText = 'Positive clinical progress: Your vital metrics indicate healthy improvement and stabilization toward target ranges.';
      summaryTextHindi = 'Positive progress: Aapke health vitals mein achha sudhaar dekha ja raha hai.';
    }

    return {
      overallTrajectory,
      totalLogsAnalyzed: sorted.length,
      dateRange: {
        start: firstDate.toISOString(),
        end: lastDate.toISOString(),
      },
      alerts,
      metricInsights: {
        glucose: glucoseAnalysis,
        bloodPressure: bpAnalysis,
        weight: weightAnalysis,
      },
      summaryText,
      summaryTextHindi,
    };
  }
}
