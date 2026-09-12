# RiskLens AI — Risk Definitions & Thresholds

## 1. Risk Level Classification

RiskLens AI categorizes calculated risk scores (0–100) into four standardized operational tiers:

| Tier | Score Range | Operational Meaning | Recommended Response |
| :--- | :--- | :--- | :--- |
| **LOW** | 0 – 29 | Nominal operating envelope; normal environmental variance. | Routine monitoring; maintain standard baseline checks. |
| **MODERATE** | 30 – 54 | Measurable anomaly or elevated precipitation trend; capacity near standard threshold. | Advisory alerts active; verify stormwater channels & equipment status. |
| **HIGH** | 55 – 74 | Significant probability of disruption or localized inundation within 24–72 hours. | Precautionary intervention; mobilize field teams & notify operations. |
| **CRITICAL** | 75 – 100 | Severe impending hazard; infrastructure or environmental thresholds breached. | Immediate triage (< 2h); activate emergency response & automated mitigation. |

## 2. Time Horizons
- **24 Hours**: Immediate triage and rapid-reaction operational scheduling.
- **72 Hours (3 Days)**: Multi-model atmospheric forecast window for proactive resource staging.
- **7 Days**: Medium-term meteorological trend tracking.
- **30 Days**: Strategic baseline reliability and wear-and-tear projections.

## 3. Data Quality Ratings
- **HIGH**: All required physical sensors online, verified timestamp freshness $< 30$ minutes, zero null fields.
- **MODERATE**: Partial sensor coverage or regional centroid approximation active.
- **LOW**: Offline mode or missing telemetry requiring synthetic fallback.
