# RiskLens AI — Frequently Asked Questions (FAQ)

### Q: What is RiskLens AI Copilot?
A: RiskLens AI Copilot is an intelligent assistant built specifically for the RiskLens platform. It answers questions regarding your risk scores, contributing factors, data freshness, provenance citations, mathematical formulas, and what-if simulations using grounded data from the database and live APIs.

### Q: How is the risk score calculated?
A: The risk score is evaluated deterministically using documented factor weights:
- 35% Current & 24h Rainfall Intensity
- 25% 72-Hour Cumulative Forecast Precipitation
- 20% Atmospheric Saturation & Pressure Anomaly
- 20% Topographical Elevation Vulnerability
Formula: $\text{Composite Risk} = (0.35 \times F_1) + (0.25 \times F_2) + (0.20 \times F_3) + (0.20 \times F_4)$.

### Q: Where does the live meteorological data come from?
A: Real-world weather data is retrieved live from Open-Meteo GmbH and the European Centre for Medium-Range Weather Forecasts (ECMWF) under an open ODbL / CC BY 4.0 license.

### Q: What does a score of 72/100 mean?
A: A score of 72/100 falls into the **HIGH** risk tier (55–74). It indicates an elevated probability of surface water accumulation or operational disruption within 24–72 hours, requiring precautionary mitigation such as drainage clearing or emergency team readiness.

### Q: How do I know if data is Live or Demo?
A: Look for the status badge:
- **`● LIVE DATA` (Emerald)**: Real live measurements from Open-Meteo or Copernicus APIs.
- **`● DEMO SANDBOX` (Amber)**: Synthetic or simulated values for testing what-if scenarios.

### Q: What happens if live weather APIs are unreachable?
A: RiskLens automatically activates deterministic regional fallback baselines with a reduced data quality rating and explicit citation notice.

### Q: What is the difference between Prediction Confidence and Risk Score?
A: **Risk Score (0–100)** measures the severity/likelihood of hazard, whereas **Prediction Confidence (0%–100%)** measures the completeness and statistical certainty of the underlying sensor data.
