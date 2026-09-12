import { FallbackEngine } from '../ai/fallbackEngine';

export interface FactorAdjustment {
  name: string;
  originalContribution: number; // e.g. 35%
  deltaPercent: number;          // e.g. +10 (meaning +10% relative change)
}

export interface SimulationResult {
  baselineRisk: number;
  simulatedRisk: number;
  delta: number;
  deltaSign: string;
  baselineLevel: string;
  simulatedLevel: string;
  primaryDrivingFactor: string;
  explanation: string;
  updatedFactors: Array<{
    name: string;
    originalContribution: number;
    newContribution: number;
    deltaPercent: number;
    severity: string;
  }>;
  forecastPoints: Array<{
    period: string;
    baseline: number;
    simulated: number;
  }>;
  simulatedRecommendations: Array<{
    title: string;
    priority: string;
    impact: string;
    actionRequired: string;
  }>;
}

export class SimulationEngine {
  public static runWhatIfSimulation(
    baselineRisk: number,
    factors: FactorAdjustment[]
  ): SimulationResult {
    let accumulatedDelta = 0;
    let maxFactorDelta = -999;
    let primaryDrivingFactor = '';

    const updatedFactors = factors.map((factor) => {
      // Calculate individual impact of this factor's % adjustment on total risk
      // Factor contribution is weighted (e.g. factor has 35% weight, changed by +20% -> impact is 0.35 * 0.20 * baseline)
      const factorWeight = factor.originalContribution / 100;
      const factorImpact = factorWeight * (factor.deltaPercent / 100) * baselineRisk;

      accumulatedDelta += factorImpact;

      if (Math.abs(factorImpact) > maxFactorDelta) {
        maxFactorDelta = Math.abs(factorImpact);
        primaryDrivingFactor = factor.name;
      }

      // New normalized factor contribution
      const newWeight = Math.max(5, factor.originalContribution * (1 + factor.deltaPercent / 100));

      return {
        name: factor.name,
        originalContribution: factor.originalContribution,
        newContribution: Math.round(newWeight * 10) / 10,
        deltaPercent: factor.deltaPercent,
        severity: newWeight > 35 ? 'CRITICAL' : newWeight > 22 ? 'HIGH' : newWeight > 12 ? 'MEDIUM' : 'LOW',
      };
    });

    const rawSimulated = baselineRisk + accumulatedDelta;
    const simulatedRisk = Math.min(99, Math.max(5, Math.round(rawSimulated * 10) / 10));
    const delta = Math.round((simulatedRisk - baselineRisk) * 10) / 10;
    const deltaSign = delta >= 0 ? `+${delta}` : `${delta}`;

    const baselineLevel = FallbackEngine.calculateRiskLevel(baselineRisk);
    const simulatedLevel = FallbackEngine.calculateRiskLevel(simulatedRisk);

    const isRiskWorse = delta > 0;
    const explanation = isRiskWorse
      ? `Simulated conditions elevate system risk by ${deltaSign} points from ${baselineRisk} (${baselineLevel}) to ${simulatedRisk} (${simulatedLevel}). The increase in "${primaryDrivingFactor}" exerts the strongest upward pressure on systemic vulnerability.`
      : `Simulated mitigation dampens overall risk by ${deltaSign} points from ${baselineRisk} (${baselineLevel}) to ${simulatedRisk} (${simulatedLevel}). Proactive constraint on "${primaryDrivingFactor}" drives the majority of the risk reduction.`;

    const simulatedRecommendations = isRiskWorse
      ? [
          {
            title: `Preemptive Throttle on ${primaryDrivingFactor}`,
            priority: 'CRITICAL PRIORITY',
            impact: `-8.5 pts Risk Buffer`,
            actionRequired: 'Immediately reverse the simulated condition drift before production baseline is compromised.',
          },
          {
            title: 'Expand Redundancy & Load Balancing Buffer',
            priority: 'HIGH PRIORITY',
            impact: `+14% Fault Absorption`,
            actionRequired: 'Reallocate secondary capacity to shield vulnerable nodes from heightened stress.',
          },
        ]
      : [
          {
            title: `Institutionalize Parameter Lock for ${primaryDrivingFactor}`,
            priority: 'STANDARD PRIORITY',
            impact: 'Stabilizes Target Risk Range',
            actionRequired: 'Adopt tested parameter configurations as permanent operating standard.',
          },
        ];

    const forecastPoints = [
      { period: 'Current', baseline: baselineRisk, simulated: simulatedRisk },
      { period: '+7 Days', baseline: Math.min(100, Math.round(baselineRisk * 1.04)), simulated: Math.min(100, Math.round(simulatedRisk * 1.03)) },
      { period: '+14 Days', baseline: Math.min(100, Math.round(baselineRisk * 1.08)), simulated: Math.min(100, Math.round(simulatedRisk * 1.05)) },
      { period: '+30 Days', baseline: Math.min(100, Math.round(baselineRisk * 1.15)), simulated: Math.min(100, Math.round(simulatedRisk * 1.08)) },
    ];

    return {
      baselineRisk,
      simulatedRisk,
      delta,
      deltaSign,
      baselineLevel,
      simulatedLevel,
      primaryDrivingFactor: primaryDrivingFactor || 'Operational Stress Rate',
      explanation,
      updatedFactors,
      forecastPoints,
      simulatedRecommendations,
    };
  }
}
