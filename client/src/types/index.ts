export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface RiskFactor {
  id?: string;
  name: string;
  category: string;
  contribution: number; // e.g. 35.0
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  explanation: string;
  trend?: 'INCREASING' | 'STABLE' | 'DECREASING';
  metricValue?: string;
}

export interface Recommendation {
  id?: string;
  analysisId?: string;
  title: string;
  description: string;
  priority: 'PRIORITY 1' | 'PRIORITY 2' | 'PRIORITY 3';
  expectedImpact: string;
  urgency: 'Immediate' | 'Within 48h' | 'Within 7 Days' | 'Routine';
  status: 'PENDING' | 'ACCEPTED' | 'DISMISSED' | 'SAVED' | 'EXECUTING';
  reasoning?: string;
  orderIndex?: number;
}

export interface ForecastPoint {
  period: string;
  historical?: number;
  predicted?: number;
  lowerBound?: number;
  upperBound?: number;
  confidence?: number;
}

export interface Prediction {
  id?: string;
  value: string;
  probability: number;
  confidence: number;
  timeHorizon: string;
  baselineComparison?: number;
  trendDirection: 'INCREASING' | 'DECREASING' | 'STABLE';
  forecastPoints?: string;
}

export interface ExplainabilityDetails {
  whatModelSaw: string;
  whatChanged: string;
  whyItMatters: string;
  whatCouldHappen: string;
  whatToConsider: string;
  technicalDetails?: {
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

export interface Analysis {
  id: string;
  userId?: string;
  title: string;
  category: string;
  inputType: 'STRUCTURED' | 'TEXT' | 'IMAGE' | 'SCENARIO';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  mode?: 'LIVE' | 'DEMO';
  location?: string;
  latitude?: number;
  longitude?: number;
  dataQuality?: 'HIGH' | 'MODERATE' | 'LOW';
  dataFreshness?: string;
  calculationMethod?: string;
  sourcesCited?: string;
  limitations?: string;
  riskScore: number;
  riskLevel: RiskLevel;
  confidence: number;
  prediction: string;
  summary: string;
  timeHorizon: string;
  tags?: string;
  createdAt: string;
  updatedAt?: string;
  riskFactors: RiskFactor[];
  predictions: Prediction[];
  recommendations: Recommendation[];
  explainability?: ExplainabilityDetails;
  isAiFallback?: boolean;
}

export interface Scenario {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  demoData: string;
  baselineRisk: number;
  tags?: string;
  createdAt?: string;
}

export interface Insight {
  id: string;
  analysisId?: string;
  analysis?: {
    id: string;
    title: string;
    category: string;
    riskScore: number;
    riskLevel: RiskLevel;
  };
  type: 'ANOMALY' | 'TREND' | 'RISK_CHANGE' | 'PATTERN' | 'RECOMMENDATION';
  severity: RiskLevel;
  title: string;
  description: string;
  affectedFactor?: string;
  recommendedAction?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'RISK_ALERT' | 'PREDICTION_UPDATE' | 'DECISION_ACTION' | 'SYSTEM';
  severity: 'CRITICAL' | 'WARNING' | 'INFO' | 'SUCCESS';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface OverviewStats {
  currentRisk: number;
  riskLevel: RiskLevel;
  confidence: number;
  activeAlerts: number;
  decisionsToday: number;
  totalAnalyses: number;
  latestAnalysis?: Analysis;
  riskDistribution: Array<{ name: string; value: number; color: string }>;
}

export interface AIStatus {
  mode: 'ONLINE' | 'DEMO_INTELLIGENCE';
  provider: string;
  model: string;
  isFallback: boolean;
  geminiConfigured: boolean;
}

export interface CitationPayload {
  key: string;
  name: string;
  provider: string;
  category: string;
  endpoint: string;
  license: string;
  updateFrequency: string;
  retrievedAt: string;
  dataFreshness: string;
  quality: 'HIGH' | 'MODERATE' | 'LOW';
  rawMetricCount?: number;
  sampleMetrics?: Record<string, any>;
}

export interface DataSourceItem {
  id?: string;
  key: string;
  name: string;
  provider?: string;
  category: string;
  endpoint: string;
  license: string;
  updateFrequency: string;
  status: 'ACTIVE' | 'DEGRADED' | 'OFFLINE';
  latencyMs: number;
  dataFreshness?: string;
  description?: string;
  reliabilityScore?: number;
  lastChecked?: string;
}

export interface SystemDataStatus {
  overallStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
  liveModeAvailable: boolean;
  activeProvidersCount: number;
  totalProvidersCount: number;
  stats: {
    liveAnalysesCount: number;
    demoAnalysesCount: number;
  };
  providers: DataSourceItem[];
  aiStatus: {
    provider: string;
    online: boolean;
    mode: string;
    latencyMs: number;
  };
}

export interface GeocodedLocation {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  countryCode: string;
  admin1?: string;
  elevation?: number;
  timezone?: string;
  population?: number;
  formattedName: string;
}

export interface HourlyForecastPoint {
  time: string;
  temperature: number;
  precipitation: number;
  rain: number;
  humidity: number;
}

export interface DailyForecastPoint {
  date: string;
  precipitationSum: number;
  precipitationHours: number;
  precipitationProbabilityMax: number;
  temperatureMax?: number;
  temperatureMin?: number;
}

export interface HistoricalDayPoint {
  date: string;
  precipitationSum: number;
  temperatureMax: number;
  temperatureMin: number;
  temperatureMean: number;
  precipitationHours: number;
  condition: string;
}

export interface MeteorologicalMetrics {
  locationName: string;
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  retrievalTimestamp: string;
  currentTemperatureC: number;
  apparentTemperatureC: number;
  relativeHumidityPct: number;
  currentPrecipitationMm: number;
  currentRainMm: number;
  weatherCode: number;
  weatherDescription: string;
  surfacePressureHpa: number;
  windSpeedKmh: number;
  past24hPrecipitationMm: number;
  forecast72hSumMm: number;
  forecast7DaySumMm: number;
  peakHourlyPrecipitationMm: number;
  highRainfallHoursCount: number;
  hourlySeries: HourlyForecastPoint[];
  dailySeries: DailyForecastPoint[];
  historicalDays?: HistoricalDayPoint[];
}

export interface EnvironmentalMetrics {
  usAqi: number;
  europeanAqi: number;
  pm2_5: number;
  pm10: number;
  carbonMonoxide: number;
  nitrogenDioxide: number;
  sulphurDioxide: number;
  ozone: number;
  airQualityRating: 'EXCELLENT' | 'GOOD' | 'MODERATE' | 'POOR' | 'UNHEALTHY' | 'HAZARDOUS';
}

export interface LocationAnalysisData {
  analysisId?: string;
  location: GeocodedLocation;
  weather: MeteorologicalMetrics;
  forecast: {
    forecast72hSumMm: number;
    forecast7DaySumMm: number;
    hourlySeries: HourlyForecastPoint[];
    dailySeries: DailyForecastPoint[];
  };
  historical: {
    historicalDays: HistoricalDayPoint[];
    past24hPrecipitationMm: number;
  };
  airQuality: EnvironmentalMetrics;
  risk: {
    compositeRiskScore: number;
    riskLevel: RiskLevel;
    confidence: number;
    dataQuality: 'HIGH' | 'MODERATE' | 'LOW';
    dataFreshness: string;
    prediction: string;
    summary: string;
    calculationMethod: string;
    mathematicalFormula: string;
    limitations: string;
    factorBreakdowns: Array<{
      name: string;
      category: string;
      weight: number;
      rawValue: string;
      normalizedScore: number;
      weightedContribution: number;
      severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      trend: 'INCREASING' | 'STABLE' | 'DECREASING';
      formulaExplanation: string;
    }>;
    recommendations: Array<{
      title: string;
      description: string;
      priority: string;
      expectedImpact: string;
      urgency: string;
      reasoning: string;
    }>;
    forecastPoints: Array<{
      period?: string;
      time: string;
      predictedRisk?: number;
      historical?: number;
      predicted?: number;
      lowerBound?: number;
      upperBound?: number;
      confidence?: number;
      rainfallMm?: number;
      temperatureC?: number;
    }>;
  };
  dataQuality: 'HIGH' | 'MODERATE' | 'LOW';
  dataFreshness: string;
  sources: CitationPayload[];
  aiSummary: string;
  retrievedAt: string;
}

export interface LocationComparisonData {
  locationA: {
    location: GeocodedLocation;
    weather: MeteorologicalMetrics;
    airQuality: EnvironmentalMetrics;
    risk: any;
  };
  locationB: {
    location: GeocodedLocation;
    weather: MeteorologicalMetrics;
    airQuality: EnvironmentalMetrics;
    risk: any;
  };
  comparison: {
    tempDelta: number;
    rainfallDelta: number;
    aqiDelta: number;
    riskScoreDelta: number;
    higherRiskLocation: string;
    summary: string;
  };
}

export interface ChatSource {
  name: string;
  endpoint?: string;
  type?: string;
  updatedAt?: string;
  confidence?: number;
  url?: string;
  doc?: string;
  section?: string;
  metricsUsed?: string[];
}

export interface ChatMessagePayload {
  message: string;
  analysisId?: string;
  currentPage?: string;
  currentLocation?: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ChatResponse {
  answer: string;
  sources: ChatSource[];
  suggestedActions: string[];
  meta: {
    analysisId?: string;
    location?: string;
    isLive: boolean;
    confidence: number;
    timestamp: string;
    model?: string;
    mode?: string;
  };
}


