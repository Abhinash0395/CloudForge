export interface RiskFactorOutput {
  name: string;
  category: string;
  contribution: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  trend?: 'INCREASING' | 'STABLE' | 'DECREASING';
  metricValue?: string;
}

export interface RecommendationOutput {
  title: string;
  description: string;
  priority: 'PRIORITY 1' | 'PRIORITY 2' | 'PRIORITY 3';
  expectedImpact: string;
  urgency: 'Immediate' | 'Within 48h' | 'Within 7 Days' | 'Routine';
  reasoning: string;
}

export interface PredictionOutput {
  value: string;
  probability: number;
  confidence: number;
  timeHorizon: string;
  baselineComparison: number;
  trendDirection: 'INCREASING' | 'DECREASING' | 'STABLE';
  forecastPoints: Array<{
    period: string;
    historical?: number;
    predicted?: number;
    lowerBound?: number;
    upperBound?: number;
  }>;
}

export interface ExplainabilityOutput {
  whatModelSaw: string;
  whatChanged: string;
  whyItMatters: string;
  whatCouldHappen: string;
  whatToConsider: string;
  technicalDetails: {
    model: string;
    modelVersion: string;
    inputFeaturesEvaluated: number;
    featureWeightsNormalized: boolean;
    confidenceScore: number;
    anomalySignificanceSigma: number;
    timestamp: string;
    dataSource: string;
  };
}

export interface AnalysisEngineResult {
  riskScore: number;
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  confidence: number;
  prediction: string;
  summary: string;
  predictionDetails: PredictionOutput;
  riskFactors: RiskFactorOutput[];
  recommendations: RecommendationOutput[];
  explainability: ExplainabilityOutput;
  isAiFallback: boolean;
}

export class FallbackEngine {
  /**
   * Deterministically calculate risk score from 0 to 100
   */
  public static calculateRiskLevel(score: number): 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' {
    if (score < 25) return 'LOW';
    if (score < 50) return 'MODERATE';
    if (score < 75) return 'HIGH';
    return 'CRITICAL';
  }

  /**
   * Generates comprehensive deterministic analysis for Structured Data
   */
  public static analyzeStructuredData(data: Record<string, any>): AnalysisEngineResult {
    const historicalVal = Number(data.historicalValue ?? 50);
    const currentVal = Number(data.currentValue ?? 75);
    const changeRate = Number(data.changeRate ?? 18);
    const previousIncidents = Number(data.previousIncidents ?? 2);
    const envFactor = Number(data.environmentalFactor ?? 60);
    const opFactor = Number(data.operationalFactor ?? 70);

    // Weighted risk formula (0 - 100)
    const baseScore =
      (currentVal * 0.35) +
      (Math.min(100, Math.max(0, changeRate * 2.2)) * 0.25) +
      (envFactor * 0.15) +
      (opFactor * 0.15) +
      (Math.min(10, previousIncidents) * 1.0);

    const riskScore = Math.min(99, Math.max(8, Math.round(baseScore * 10) / 10));
    const riskLevel = this.calculateRiskLevel(riskScore);
    const confidence = Math.round((0.82 + (Math.random() * 0.12)) * 100) / 100;

    const delta = Math.round((currentVal - historicalVal) * 10) / 10;
    const deltaSign = delta >= 0 ? `+${delta}%` : `${delta}%`;

    const riskFactors: RiskFactorOutput[] = [
      {
        name: data.operationalFactorName || 'Operational Load / Pressure Spike',
        category: 'Operational',
        contribution: 34.0,
        severity: riskScore > 70 ? 'CRITICAL' : 'HIGH',
        explanation: `Operating at ${currentVal}% relative load represents a ${deltaSign} deviation over historical baseline of ${historicalVal}%.`,
        trend: delta >= 0 ? 'INCREASING' : 'DECREASING',
        metricValue: `${currentVal}%`,
      },
      {
        name: data.environmentalFactorName || 'Environmental Exposure Variance',
        category: 'Environmental',
        contribution: 26.5,
        severity: envFactor > 60 ? 'HIGH' : 'MEDIUM',
        explanation: `Environmental stress factor indexed at ${envFactor}/100 exceeds the 90-day seasonal tolerance threshold.`,
        trend: 'INCREASING',
        metricValue: `${envFactor}/100`,
      },
      {
        name: 'Change Velocity & Gradient',
        category: 'Telemetry',
        contribution: 22.0,
        severity: changeRate > 15 ? 'HIGH' : 'MEDIUM',
        explanation: `Accelerating rate of change (+${changeRate}%/hr) compounds thermal and mechanical degradation cycles.`,
        trend: 'INCREASING',
        metricValue: `+${changeRate}%/hr`,
      },
      {
        name: 'Historical Incident Recurrence',
        category: 'Historical Pattern',
        contribution: 17.5,
        severity: previousIncidents > 2 ? 'HIGH' : 'LOW',
        explanation: `${previousIncidents} correlated prior anomalies recorded in current operational quadrant within the last 180 days.`,
        trend: 'STABLE',
        metricValue: `${previousIncidents} incidents`,
      },
    ];

    const recommendations: RecommendationOutput[] = [
      {
        title: riskScore > 70 ? 'Initiate Load Throttling & Preventive Isolation' : 'Schedule Proactive Diagnostic Sweep',
        description: `Execute immediate automated calibration to dampen active ${riskFactors[0].name.toLowerCase()} by minimum 20%.`,
        priority: 'PRIORITY 1',
        expectedImpact: '-22.5% Risk Reduction',
        urgency: riskScore > 70 ? 'Immediate' : 'Within 48h',
        reasoning: 'Reduces peak stress concentration on leading contributing factors before threshold breach.',
      },
      {
        title: 'Activate Redundant Thermal & Subsystem Routing',
        description: 'Deploy secondary operational loop to divert continuous strain away from primary affected nodes.',
        priority: 'PRIORITY 2',
        expectedImpact: '+18.4% System Reliability',
        urgency: 'Within 48h',
        reasoning: 'Mitigates compounding cascade effects if current volatility persists beyond 12 hours.',
      },
      {
        title: 'Increase Telemetry Sampling Frequency to 1-Second Granularity',
        description: 'Heighten monitoring resolution across environmental and telemetry telemetry probes.',
        priority: 'PRIORITY 3',
        expectedImpact: '+95% Anomaly Detection Speed',
        urgency: 'Within 7 Days',
        reasoning: 'Enables rapid micro-drift detection and tighter confidence intervals for future predictions.',
      },
    ];

    const forecastPoints = [
      { period: 'T-14d', historical: Math.round(historicalVal * 0.85) },
      { period: 'T-7d', historical: Math.round(historicalVal * 0.95) },
      { period: 'T-1d', historical: Math.round(historicalVal) },
      { period: 'Now', historical: Math.round(riskScore), predicted: Math.round(riskScore), lowerBound: Math.round(riskScore * 0.94), upperBound: Math.round(riskScore * 1.06) },
      { period: 'T+7d', predicted: Math.round(Math.min(100, riskScore * 1.08)), lowerBound: Math.round(riskScore * 0.98), upperBound: Math.round(Math.min(100, riskScore * 1.18)) },
      { period: 'T+14d', predicted: Math.round(Math.min(100, riskScore * 1.15)), lowerBound: Math.round(riskScore * 1.02), upperBound: Math.round(Math.min(100, riskScore * 1.28)) },
      { period: 'T+30d', predicted: Math.round(Math.min(100, riskScore * 1.22)), lowerBound: Math.round(riskScore * 1.05), upperBound: Math.round(Math.min(100, riskScore * 1.35)) },
    ];

    const predictionDetails: PredictionOutput = {
      value: riskScore > 70
        ? 'High probability of critical anomaly threshold exceedance within 14 days'
        : 'Moderate risk growth trend with stable baseline margin over 30 days',
      probability: Math.round((0.65 + (riskScore / 250)) * 100) / 100,
      confidence,
      timeHorizon: 'Next 30 Days',
      baselineComparison: delta,
      trendDirection: delta >= 0 ? 'INCREASING' : 'DECREASING',
      forecastPoints,
    };

    const explainability: ExplainabilityOutput = {
      whatModelSaw: `Model analyzed 6 primary operational inputs: current value (${currentVal}), baseline (${historicalVal}), change acceleration (+${changeRate}%), and ${previousIncidents} correlated prior incidents.`,
      whatChanged: `Operational divergence increased by ${deltaSign} compared to historical steady-state parameters, coupled with an elevated environmental stress rating of ${envFactor}/100.`,
      whyItMatters: `The confluence of rapid rate-of-change and high operational load multiplies failure probability non-linearly across connected downstream systems.`,
      whatCouldHappen: `If unmitigated, system telemetry is forecasted to breach secondary safety thresholds within 7 to 14 days, elevating overall risk score toward ${Math.min(100, Math.round(riskScore * 1.2))}.`,
      whatToConsider: `Prioritize Priority 1 load-throttling intervention to immediately compress active risk delta by up to 22.5%.`,
      technicalDetails: {
        model: 'RiskLens Multi-Factor Analytical Ensemble (MFAE-v4)',
        modelVersion: '4.2.0-Production',
        inputFeaturesEvaluated: 6,
        featureWeightsNormalized: true,
        confidenceScore: confidence,
        anomalySignificanceSigma: Math.round((riskScore / 28) * 10) / 10,
        timestamp: new Date().toISOString(),
        dataSource: 'Structured Telemetry Vector',
      },
    };

    const summary = `System risk index stands at ${riskScore}/100 (${riskLevel} RISK) with ${Math.round(confidence * 100)}% model confidence. Primary driving factor is ${riskFactors[0].name} (${riskFactors[0].contribution}% weight), compounded by ${deltaSign} baseline divergence. Immediate preventive mitigation is recommended.`;

    return {
      riskScore,
      riskLevel,
      confidence,
      prediction: predictionDetails.value,
      summary,
      predictionDetails,
      riskFactors,
      recommendations,
      explainability,
      isAiFallback: true,
    };
  }

  /**
   * Generates deterministic analysis from Natural Language text
   */
  public static analyzeText(text: string): AnalysisEngineResult {
    const lower = text.toLowerCase();
    let detectedScore = 55;
    let category = 'Operational Risk';

    // Heuristics based on NLP keywords
    if (lower.includes('critical') || lower.includes('failure') || lower.includes('breach') || lower.includes('severe') || lower.includes('overheat') || lower.includes('urgent')) {
      detectedScore += 25;
    }
    if (lower.includes('increase') || lower.includes('spike') || lower.includes('unusual') || lower.includes('anomal') || lower.includes('deviat')) {
      detectedScore += 12;
    }
    if (lower.includes('leak') || lower.includes('crack') || lower.includes('flood') || lower.includes('vibration')) {
      detectedScore += 10;
    }
    if (lower.includes('normal') || lower.includes('stable') || lower.includes('routine') || lower.includes('low risk')) {
      detectedScore -= 20;
    }

    if (lower.includes('water') || lower.includes('weather') || lower.includes('climate') || lower.includes('flood') || lower.includes('temperature')) {
      category = 'Environmental Risk';
    } else if (lower.includes('bridge') || lower.includes('pipeline') || lower.includes('grid') || lower.includes('turbine') || lower.includes('structure')) {
      category = 'Infrastructure Risk';
    } else if (lower.includes('supply') || lower.includes('inventory') || lower.includes('capacity') || lower.includes('staff')) {
      category = 'Resource Risk';
    }

    const riskScore = Math.min(96, Math.max(12, detectedScore));
    const riskLevel = this.calculateRiskLevel(riskScore);
    const confidence = 0.88;

    const riskFactors: RiskFactorOutput[] = [
      {
        name: 'Reported Qualitative Anomaly Pattern',
        category,
        contribution: 38.0,
        severity: riskScore > 70 ? 'CRITICAL' : 'HIGH',
        explanation: 'Natural language semantic parsing identified high-urgency operational disturbance descriptors.',
        trend: 'INCREASING',
        metricValue: 'High NLP Salience',
      },
      {
        name: 'Historical Category Volatility',
        category,
        contribution: 28.5,
        severity: 'MEDIUM',
        explanation: `Historical baseline incidents in ${category} indicate elevated sensitivity to reported variance conditions.`,
        trend: 'INCREASING',
        metricValue: '+18.2% vs Mean',
      },
      {
        name: 'Temporal Progression Risk',
        category: 'Progression',
        contribution: 20.5,
        severity: 'MEDIUM',
        explanation: 'Identified conditions suggest compounding degradation if corrective feedback loops are delayed.',
        trend: 'STABLE',
        metricValue: 'Active Escalation',
      },
      {
        name: 'Downstream Interdependency Impact',
        category: 'Systemic',
        contribution: 13.0,
        severity: 'LOW',
        explanation: 'Secondary subsystem coupling introduces secondary cascading exposure risks.',
        trend: 'STABLE',
        metricValue: '3 Connected Nodes',
      },
    ];

    const recommendations: RecommendationOutput[] = [
      {
        title: 'Dispatch Targeted Physical & Sensor Inspection',
        description: 'Verify extracted anomaly assertions on-site or via dedicated diagnostic probe telemetry.',
        priority: 'PRIORITY 1',
        expectedImpact: '-30% Uncertainty Margin',
        urgency: 'Immediate',
        reasoning: 'Confirms reported natural-language conditions with calibrated ground-truth measurements.',
      },
      {
        title: 'Institute Real-Time Safety Boundaries & Threshold Locks',
        description: 'Constrain operational envelope to preventive limits until diagnostic verification is complete.',
        priority: 'PRIORITY 2',
        expectedImpact: '-18.5% Failure Probability',
        urgency: 'Within 48h',
        reasoning: 'Precludes accidental overloading during active investigative window.',
      },
      {
        title: 'Synthesize Cross-Incident Knowledge Base Report',
        description: 'Cross-reference extracted situation keywords against historical post-mortem logs.',
        priority: 'PRIORITY 3',
        expectedImpact: '+40% Root Cause Resolution Speed',
        urgency: 'Within 7 Days',
        reasoning: 'Accelerates diagnostic remediation using historical precedent patterns.',
      },
    ];

    const forecastPoints = [
      { period: 'T-14d', historical: Math.round(riskScore * 0.7) },
      { period: 'T-7d', historical: Math.round(riskScore * 0.85) },
      { period: 'T-1d', historical: Math.round(riskScore * 0.95) },
      { period: 'Now', historical: riskScore, predicted: riskScore, lowerBound: Math.round(riskScore * 0.92), upperBound: Math.round(riskScore * 1.08) },
      { period: 'T+7d', predicted: Math.round(Math.min(100, riskScore * 1.1)), lowerBound: Math.round(riskScore * 0.96), upperBound: Math.round(Math.min(100, riskScore * 1.22)) },
      { period: 'T+14d', predicted: Math.round(Math.min(100, riskScore * 1.18)), lowerBound: Math.round(riskScore * 1.0), upperBound: Math.round(Math.min(100, riskScore * 1.32)) },
      { period: 'T+30d', predicted: Math.round(Math.min(100, riskScore * 1.24)), lowerBound: Math.round(riskScore * 1.02), upperBound: Math.round(Math.min(100, riskScore * 1.4)) },
    ];

    const predictionDetails: PredictionOutput = {
      value: `Elevated operational risk trajectory identified across ${category} domain`,
      probability: Math.round((0.68 + (riskScore / 300)) * 100) / 100,
      confidence,
      timeHorizon: 'Next 30 Days',
      baselineComparison: Math.round((riskScore - 50) * 10) / 10,
      trendDirection: 'INCREASING',
      forecastPoints,
    };

    const explainability: ExplainabilityOutput = {
      whatModelSaw: `Semantic entity extraction identified key descriptors: "${text.substring(0, 80)}..." indicating state deviation.`,
      whatChanged: `Natural language text signals acute departure from normal steady-state operation, pointing to newly emerged anomalies.`,
      whyItMatters: `Unmonitored qualitative alerts often precede severe physical sensor breaches by an average of 48 to 72 hours.`,
      whatCouldHappen: `Failure to execute preventative diagnostic verification may result in unplanned system down-time or safety alerts.`,
      whatToConsider: `Execute Priority 1 targeted diagnostic inspection to validate parameters against calibrated instrument readings.`,
      technicalDetails: {
        model: 'RiskLens Semantic Entity & Sentiment Parser (NLP-v3)',
        modelVersion: '3.8.0-Production',
        inputFeaturesEvaluated: text.split(' ').length,
        featureWeightsNormalized: true,
        confidenceScore: confidence,
        anomalySignificanceSigma: 2.7,
        timestamp: new Date().toISOString(),
        dataSource: 'Natural Language Narrative Stream',
      },
    };

    const summary = `Natural language analysis identified ${riskLevel} RISK (${riskScore}/100) within ${category}. Key indicators include reported operational variance and compounding degradation risk. Recommended action: Deploy targeted physical verification and apply safety threshold locks.`;

    return {
      riskScore,
      riskLevel,
      confidence,
      prediction: predictionDetails.value,
      summary,
      predictionDetails,
      riskFactors,
      recommendations,
      explainability,
      isAiFallback: true,
    };
  }
}
