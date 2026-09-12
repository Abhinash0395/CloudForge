# RiskLens AI — Supported Data Sources & Provenance

RiskLens AI integrates exclusively with verified public gateways, open scientific models, and local edge computer vision pipelines:

## 1. Open-Meteo High-Resolution Weather Model Ensemble
- **Provider**: Open-Meteo GmbH & European Centre for Medium-Range Weather Forecasts (ECMWF).
- **Category**: Meteorological Telemetry.
- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **License**: Open Database License (ODbL) / Creative Commons BY 4.0.
- **Cadence**: Hourly updates with 15-minute model runs.
- **Parameters**: Current temperature (°C), apparent temperature, relative humidity (%), surface barometric pressure (hPa), wind speed (km/h), precipitation rate (mm/h), 24-hour precipitation accumulation (mm), and 7-day multi-model forecast sums.

## 2. Open-Meteo Geospatial Coordinates & Elevation Engine
- **Provider**: Open-Meteo & OpenStreetMap Contributors.
- **Category**: Geospatial.
- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
- **License**: ODbL / CC BY-SA 2.0.
- **Cadence**: Real-time on-demand resolution.
- **Parameters**: Spatial centroid coordinates (latitude, longitude), administrative hierarchy (city, state, country), elevation above sea level (meters ASL), and population estimates.

## 3. Copernicus Atmosphere Monitoring Service (CAMS)
- **Provider**: European Union Copernicus Earth Observation Programme & Open-Meteo.
- **Category**: Air Quality & Atmosphere.
- **Endpoint**: `https://air-quality-api.open-meteo.com/v1/air-quality`
- **License**: Copernicus Open Access / CC BY 4.0.
- **Cadence**: Hourly telemetry.
- **Parameters**: US AQI, European AQI, PM2.5, PM10, Carbon Monoxide (CO), Nitrogen Dioxide (NO2), Sulphur Dioxide (SO2), and Ozone (O3).

## 4. RiskLens Edge Computer Vision Inspection Pipeline
- **Provider**: RiskLens Local Vision Model & Gemini 1.5/2.0 Vision.
- **Category**: Vision Inspection.
- **Endpoint**: `/api/analyze/image`
- **License**: Track 01 Open Architecture.
- **Cadence**: Per-upload scan inference.
- **Parameters**: Structural crack bounding boxes, thermal hotspot detections, surface corrosion indices, and water pooling anomalies.

## 5. RiskLens Monte Carlo Simulation Sandbox
- **Provider**: RiskLens Internal Mathematical Simulation Engine.
- **Category**: Synthetic Simulation.
- **Endpoint**: `/api/simulate`
- **Parameters**: What-if factor perturbation matrices, baseline vs simulated deltas.
