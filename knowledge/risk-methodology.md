# RiskLens AI — Risk Calculation Methodology

## 1. Overview
RiskLens AI computes objective, traceable, and deterministic risk scores on a standardized scale from **0 to 100**. The engine combines verified physical telemetry, multi-model ensemble forecasts, geospatial topographies, and neural calibration matrices.

## 2. Core Mathematical Formulation
For meteorological and environmental risk assessments, the composite risk score is evaluated via the following weighted formulation:

$$\text{Composite Risk Score} = (0.35 \times F_1) + (0.25 \times F_2) + (0.20 \times F_3) + (0.20 \times F_4)$$

### Factor Definitions & Weights:
1. **Factor 1: Current & 24-Hour Precipitation Intensity ($F_1$ — 35% Weight)**
   - Normalized score evaluating immediate ground water accumulation.
   - Formula: $F_1 = \min\left(100, \frac{\text{rain}_{24\text{h}} \times 0.7 + \text{rain}_{\text{current}} \times 1.5}{80} \times 100\right)$
   - Baseline benchmarks: $0\text{ mm} = 0\text{ pts}$, $25\text{ mm} = 35\text{ pts}$, $60\text{ mm} = 70\text{ pts}$, $\ge 120\text{ mm} = 100\text{ pts}$.

2. **Factor 2: 72-Hour Cumulative Forecast Precipitation ($F_2$ — 25% Weight)**
   - Evaluates multi-model predictive accumulation from the European Centre for Medium-Range Weather Forecasts (ECMWF) and GFS ensembles.
   - Formula: $F_2 = \min\left(100, \frac{\text{forecast}_{72\text{h}}}{120} \times 100\right)$.

3. **Factor 3: Atmospheric Saturation & Barometric Depressive Anomaly ($F_3$ — 20% Weight)**
   - Assesses convective instability through high relative humidity ($> 80\%$) and barometric pressure drops below standard atmospheric baseline ($1013.25\text{ hPa}$).
   - Formula: $F_3 = \min\left(100, 0.60 \times (\text{RH}\% - 40) \times 1.6 + 0.40 \times (1013 - \text{Pressure}) \times 4\right)$.

4. **Factor 4: Geospatial Topography & Hydrological Elevation Vulnerability ($F_4$ — 20% Weight)**
   - Low-elevation river basin terrain and alluvial floodplains ($< 50\text{m ASL}$) possess significantly higher natural water retention and inundation susceptibility.
   - Elevation $< 15\text{m}$: $85\text{ pts}$ (Coastal / Delta Basin)
   - Elevation $15\text{m} - 50\text{m}$: $65\text{ pts}$ (Alluvial Floodplain, e.g., Gorakhpur, Patna)
   - Elevation $50\text{m} - 150\text{m}$: $40\text{ pts}$
   - Elevation $> 150\text{m}$: $20\text{ pts}$ (High Plateau / Hilly Terrain)

## 3. Confidence Calculation
Confidence is scored from **0.0 to 1.0** (0% to 100%). It represents data integrity, sensor completeness, and provider latency:
- Complete 8-sensor physical telemetry with low latency ($< 1500\text{ms}$): **94% - 99% Confidence**.
- Partial sensor telemetry or regional fallback: **80% - 88% Confidence**.
