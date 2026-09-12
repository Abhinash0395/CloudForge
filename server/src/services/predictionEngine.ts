export interface ForecastTimelineItem {
  period: string;
  historical?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
  confidence: number;
}

export class PredictionEngine {
  /**
   * Generates a multi-step forecasting curve with uncertainty envelopes
   */
  public static generateForecastTimeline(currentRisk: number, horizon: string = '30 Days'): ForecastTimelineItem[] {
    const points: ForecastTimelineItem[] = [];
    const periods = ['T-30d', 'T-21d', 'T-14d', 'T-7d', 'T-1d', 'Now', 'T+7d', 'T+14d', 'T+21d', 'T+30d', 'T+60d', 'T+90d'];
    
    // Historical trajectory leading to current
    const baseHistorical = Math.max(15, currentRisk * 0.7);
    const stepHistorical = (currentRisk - baseHistorical) / 5;

    points.push({ period: 'T-30d', historical: Math.round(baseHistorical), confidence: 0.95 });
    points.push({ period: 'T-21d', historical: Math.round(baseHistorical + stepHistorical * 1.5), confidence: 0.94 });
    points.push({ period: 'T-14d', historical: Math.round(baseHistorical + stepHistorical * 2.8), confidence: 0.92 });
    points.push({ period: 'T-7d', historical: Math.round(baseHistorical + stepHistorical * 4.0), confidence: 0.91 });
    points.push({ period: 'T-1d', historical: Math.round(currentRisk * 0.97), confidence: 0.90 });

    // Current point
    points.push({
      period: 'Now',
      historical: Math.round(currentRisk),
      predicted: Math.round(currentRisk),
      lowerBound: Math.round(currentRisk * 0.95),
      upperBound: Math.round(currentRisk * 1.05),
      confidence: 0.88,
    });

    // Future forecast projection with expanding confidence cone
    const growthRate = currentRisk > 60 ? 1.04 : 1.01;
    let runningVal = currentRisk;

    const futurePeriods = ['T+7d', 'T+14d', 'T+21d', 'T+30d', 'T+60d', 'T+90d'];
    const varianceMultiplier = [0.06, 0.09, 0.12, 0.16, 0.22, 0.28];

    futurePeriods.forEach((period, idx) => {
      runningVal = Math.min(99, Math.round(runningVal * growthRate * 10) / 10);
      const margin = runningVal * varianceMultiplier[idx];
      points.push({
        period,
        predicted: Math.round(runningVal),
        lowerBound: Math.max(5, Math.round(runningVal - margin)),
        upperBound: Math.min(100, Math.round(runningVal + margin)),
        confidence: Math.round((0.88 - (idx * 0.04)) * 100) / 100,
      });
    });

    return points;
  }
}
