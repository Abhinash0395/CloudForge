import {
  Analysis,
  OverviewStats,
  AIStatus,
  Scenario,
  Insight,
  NotificationItem,
  Recommendation,
} from '../types';

const API_BASE = '/api';

export async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ message: 'Network request failed' }));
    throw new Error(errorData.message || `Request failed with status ${res.status}`);
  }

  const data = await res.json();
  return data.data !== undefined ? data.data : data;
}

export const api = {
  // System & Overview
  getAIStatus: () => fetchJson<AIStatus>('/status/ai'),
  getOverviewStats: () => fetchJson<OverviewStats>('/stats/overview'),
  getNotifications: () => fetchJson<NotificationItem[]>('/notifications'),
  markNotificationsRead: () => fetchJson<{ success: boolean }>('/notifications/read-all', { method: 'POST' }),

  // Analyses
  getAllAnalyses: (params?: { category?: string; riskLevel?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.riskLevel) query.append('riskLevel', params.riskLevel);
    if (params?.search) query.append('search', params.search);
    return fetchJson<Analysis[]>(`/analyses?${query.toString()}`);
  },
  getAnalysisById: (id: string) => fetchJson<Analysis>(`/analyses/${id}`),
  deleteAnalysis: (id: string) => fetchJson<{ success: boolean }>(`/analyses/${id}`, { method: 'DELETE' }),

  // Analysis Workbenches
  analyzeStructured: (payload: Record<string, any>) =>
    fetchJson<Analysis>('/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzeText: (payload: { text: string; title?: string; category?: string }) =>
    fetchJson<Analysis>('/analyze/text', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  analyzeImage: async (formData: FormData) => {
    const res = await fetch(`${API_BASE}/analyze/image`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Image analysis failed');
    const data = await res.json();
    return data.data;
  },

  // Predictions & Forecasting
  getLatestPrediction: () => fetchJson<any>('/predictions/latest'),
  runPrediction: (payload: { riskScore: number; horizon?: string; category?: string }) =>
    fetchJson<any>('/predict', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // What-If Simulation
  simulateWhatIf: (payload: { baselineRisk: number; factors: Array<{ name: string; originalContribution: number; deltaPercent: number }> }) =>
    fetchJson<any>('/simulate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Scenarios
  getScenarios: () => fetchJson<Scenario[]>('/scenarios'),
  getScenarioByKey: (key: string) => fetchJson<Scenario>(`/scenarios/${key}`),
  runScenario: (id: string) =>
    fetchJson<Analysis>(`/scenarios/${id}/run`, {
      method: 'POST',
    }),

  // Decisions
  getDecisionQueue: () =>
    fetchJson<{
      totalActions: number;
      priority1: Recommendation[];
      priority2: Recommendation[];
      priority3: Recommendation[];
      allRecommendations: Recommendation[];
    }>('/decisions'),
  updateDecisionStatus: (id: string, status: 'ACCEPTED' | 'DISMISSED' | 'SAVED' | 'PENDING') =>
    fetchJson<Recommendation>(`/decisions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Insights
  getInsights: (params?: { severity?: string; type?: string }) => {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.type) query.append('type', params.type);
    return fetchJson<Insight[]>(`/insights?${query.toString()}`);
  },

  // Reports
  generateReport: (analysisId: string, title?: string) =>
    fetchJson<any>('/reports', {
      method: 'POST',
      body: JSON.stringify({ analysisId, title }),
    }),
  getReportById: (id: string) => fetchJson<any>(`/reports/${id}`),

  // Live Data & Transparent Architecture
  getSystemDataStatus: () => fetchJson<any>('/data/status'),
  getDataSources: () => fetchJson<any[]>('/data/sources'),
  searchLocation: (query: string) =>
    fetchJson<{ results: any[]; validation: any; sources: any[] }>(`/data/location/search?q=${encodeURIComponent(query)}`),
  getLiveWeather: (lat: number, lon: number, name?: string) =>
    fetchJson<{ metrics: any; validation: any; sources: any[] }>(
      `/data/live/weather?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || '')}`
    ),
  // Location Intelligence System Endpoints
  getCurrentLocation: (latitude: number, longitude: number) =>
    fetchJson<import('../types').GeocodedLocation>('/location/current', {
      method: 'POST',
      body: JSON.stringify({ latitude, longitude }),
    }),

  searchLocations: (query: string) =>
    fetchJson<{ results: import('../types').GeocodedLocation[]; count: number }>('/location/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  analyzeLocation: (payload: { locationName?: string; latitude?: number; longitude?: number; mode?: 'LIVE' | 'DEMO' }) =>
    fetchJson<import('../types').LocationAnalysisData>('/location/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Alias for backward compatibility
  analyzeLiveLocation: (payload: { locationName?: string; latitude?: number; longitude?: number; mode?: 'LIVE' | 'DEMO' }) =>
    fetchJson<any>('/location/analyze', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  compareLocations: (locationA: any, locationB: any) =>
    fetchJson<import('../types').LocationComparisonData>('/location/compare', {
      method: 'POST',
      body: JSON.stringify({ locationA, locationB }),
    }),

  // Grounded AI Copilot
  sendChatMessage: (payload: {
    message: string;
    analysisId?: string;
    currentPage?: string;
    currentLocation?: string;
    history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) =>
    fetchJson<import('../types').ChatResponse>('/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};


