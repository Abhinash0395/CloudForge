# RiskLens AI — Feature Guide & Modules

## 1. Overview Dashboard
- Provides a centralized panoramic executive summary.
- Displays real-time KPIs (Current Risk, Prediction Confidence, Active Alerts, Decisions Today).
- Houses the Live Data Environmental Radar for querying real telemetry from any city worldwide.
- Features Recharts Risk Trend lines and Risk Distribution donuts.

## 2. Interactive Analysis Workbench (`/analysis`)
- Multi-modal ingestion support:
  - **Live Real-World Data**: Instant city coordinate lookup and physical telemetry fetching.
  - **Parameter Sandbox**: Manual slider tuning for stress-testing.
  - **Natural Language (NLP)**: Ingests narrative anomaly reports.
  - **Computer Vision (`/analysis/image`)**: Uploads visual inspection scans for automated anomaly detection.

## 3. Decision Center (`/decisions`)
- Prioritized action queue organized into Priority 1 (Immediate), Priority 2 (Tactical 48h), and Priority 3 (Routine).
- Allows accepting, dismissing, or saving recommendations with real-time audit logging.
- Calculates projected risk reduction metrics (e.g. "-32% Inundation Severity").

## 4. Scenario Simulator (`/simulator`)
- What-If perturbation modeling: Adjust individual risk factors by -50% to +50% to evaluate non-linear impacts on composite risk before committing resources.

## 5. History & Comparison (`/history`)
- Chronological archive of all past analysis runs.
- Filterable by `● LIVE DATA` (real APIs) vs `● DEMO SANDBOX`.
- Side-by-side comparative analysis of two runs to evaluate drift and mitigation efficacy.

## 6. Executive Reports (`/reports`)
- Automated PDF-ready audit reports compiling factor contributions, data citations, and strategic decisions.
