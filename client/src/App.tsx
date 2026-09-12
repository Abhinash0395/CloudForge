import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { LocationProvider } from './context/LocationContext';
import { AppLayout } from './layouts/AppLayout';

// Page Imports
import { LandingPage } from './pages/LandingPage';
import { OverviewPage } from './pages/OverviewPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { NaturalLanguagePage } from './pages/NaturalLanguagePage';
import { ImageAnalysisPage } from './pages/ImageAnalysisPage';
import { PredictionsPage } from './pages/PredictionsPage';
import { DecisionCenterPage } from './pages/DecisionCenterPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { InsightsPage } from './pages/InsightsPage';
import { ScenarioSimulatorPage } from './pages/ScenarioSimulatorPage';
import { DemoScenariosPage } from './pages/DemoScenariosPage';
import { HistoryPage } from './pages/HistoryPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LocationIntelligencePage } from './pages/LocationIntelligencePage';

export function App() {
  return (
    <ToastProvider>
      <LocationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<AppLayout />}>
            {/* Primary Specified Routes */}
            <Route index element={<OverviewPage />} />
            <Route path="overview" element={<OverviewPage />} />
            <Route path="risk-analysis" element={<RiskAnalysisPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="decision-center" element={<DecisionCenterPage />} />
            <Route path="ai-insights" element={<InsightsPage />} />
            <Route path="location-intelligence" element={<LocationIntelligencePage />} />
            <Route path="location" element={<LocationIntelligencePage />} />
            <Route path="image-analysis" element={<ImageAnalysisPage />} />
            <Route path="history" element={<HistoryPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="settings" element={<SettingsPage />} />

            {/* Seamless Aliases & Sub-feature routes */}
            <Route path="analysis" element={<RiskAnalysisPage />} />
            <Route path="analysis/natural-language" element={<NaturalLanguagePage />} />
            <Route path="analysis/image" element={<ImageAnalysisPage />} />
            <Route path="decisions" element={<DecisionCenterPage />} />
            <Route path="insights" element={<InsightsPage />} />
            <Route path="explainability" element={<ExplainabilityPage />} />
            <Route path="simulator" element={<ScenarioSimulatorPage />} />
            <Route path="scenarios" element={<DemoScenariosPage />} />
            <Route path="landing" element={<LandingPage />} />

            {/* Fallback to Overview */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </LocationProvider>
    </ToastProvider>
  );
}

export default App;
