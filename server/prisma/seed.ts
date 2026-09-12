import { PrismaClient } from '@prisma/client';
import { PredictionEngine } from '../src/services/predictionEngine';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 [RiskLens AI] Starting database seed...');

  // Clean existing records
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.report.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.recommendation.deleteMany();
  await prisma.prediction.deleteMany();
  await prisma.riskFactor.deleteMany();
  await prisma.inputData.deleteMany();
  await prisma.imageAnalysis.deleteMany();
  await prisma.analysis.deleteMany();
  await prisma.scenario.deleteMany();
  await prisma.user.deleteMany();

  // 1. Seed Lead User
  const user = await prisma.user.create({
    data: {
      name: 'Dr. Elena Rostova',
      email: 'elena.rostova@risklens.ai',
      role: 'Principal Decision Intelligence Architect',
    },
  });

  // 2. Seed 5 Live Demo Scenarios
  const scenariosData = [
    {
      key: 'infrastructure-risk',
      name: 'Grid Substation Thermal Overload & Transformer Stress',
      category: 'Infrastructure Risk',
      description: 'Regional grid power distribution transformer experiencing high load demand and cooling circulation variance.',
      icon: 'Zap',
      baselineRisk: 74,
      tags: JSON.stringify(['Grid', 'High Voltage', 'Thermal Failure']),
      demoData: JSON.stringify({
        historicalValue: 48,
        currentValue: 82,
        changeRate: 24,
        environmentalFactor: 68,
        operationalFactor: 85,
        previousIncidents: 3,
        operationalFactorName: 'Peak Grid Harmonic Load',
        environmentalFactorName: 'Ambient Heatwave Index',
      }),
    },
    {
      key: 'environmental-monitoring',
      name: 'Coastal Reservoir Flash-Flood & Chemical Runoff',
      category: 'Environmental Monitoring',
      description: 'Precipitation surge and upstream industrial watershed telemetry exhibiting sudden salinity and turbidity delta.',
      icon: 'Droplets',
      baselineRisk: 68,
      tags: JSON.stringify(['Hydrology', 'Watershed', 'Flood Alert']),
      demoData: JSON.stringify({
        historicalValue: 35,
        currentValue: 74,
        changeRate: 31,
        environmentalFactor: 88,
        operationalFactor: 52,
        previousIncidents: 1,
        operationalFactorName: 'Reservoir Inflow Volume',
        environmentalFactorName: 'Rainfall Inundation Coefficient',
      }),
    },
    {
      key: 'operational-risk',
      name: 'Semiconductor Cleanroom Gas Pressure & Vibration Drift',
      category: 'Operational Risk',
      description: 'Extreme-ultraviolet (EUV) photolithography chamber gas regulator showing harmonic vibrational oscillation.',
      icon: 'Cpu',
      baselineRisk: 81,
      tags: JSON.stringify(['Semiconductor', 'Cleanroom', 'Vibration']),
      demoData: JSON.stringify({
        historicalValue: 42,
        currentValue: 89,
        changeRate: 19,
        environmentalFactor: 45,
        operationalFactor: 92,
        previousIncidents: 4,
        operationalFactorName: 'EUV Chamber Gas Fluctuations',
        environmentalFactorName: 'Sub-Fab Seismic Vibration Floor',
      }),
    },
    {
      key: 'resource-management',
      name: 'Cold-Chain Pharmaceutical Logistics Temperature Variance',
      category: 'Resource Management',
      description: 'Biologics distribution reefer transport network telemetry showing localized compressor cooling anomalies.',
      icon: 'Truck',
      baselineRisk: 59,
      tags: JSON.stringify(['Cold Chain', 'Pharma', 'Spoilage Risk']),
      demoData: JSON.stringify({
        historicalValue: 28,
        currentValue: 64,
        changeRate: 15,
        environmentalFactor: 72,
        operationalFactor: 58,
        previousIncidents: 2,
        operationalFactorName: 'Reefer Compressor Duty Cycle',
        environmentalFactorName: 'Ambient Ambient Route Heat',
      }),
    },
    {
      key: 'custom-ai-scenario',
      name: 'Autonomous Fleet Telemetry & Battery Cell Degradation',
      category: 'Custom AI Analysis',
      description: 'Electric autonomous transit fleet battery thermal runaway risk model across fast-charging cycles.',
      icon: 'Activity',
      baselineRisk: 63,
      tags: JSON.stringify(['EV Battery', 'Degradation', 'Fleet AI']),
      demoData: JSON.stringify({
        historicalValue: 38,
        currentValue: 69,
        changeRate: 17,
        environmentalFactor: 60,
        operationalFactor: 74,
        previousIncidents: 2,
        operationalFactorName: 'Fast-Charge C-Rate Voltage Delta',
        environmentalFactorName: 'Cell Temperature Gradient',
      }),
    },
  ];

  for (const scen of scenariosData) {
    await prisma.scenario.create({ data: scen });
  }

  // 3. Seed 20+ Realistic Historical Analyses
  const historicalAnalyses = [
    {
      title: 'Regional Power Grid Substation Alpha-9 Telemetry',
      category: 'Infrastructure',
      inputType: 'STRUCTURED',
      riskScore: 78.4,
      riskLevel: 'CRITICAL',
      confidence: 0.91,
      prediction: 'Phase-2 transformer insulation breakdown predicted within 9 days if peak harmonic load continues.',
      summary: 'Critical thermal and harmonic stress detected on transformer core. System risk elevated to 78.4/100 (+14 pts over baseline). Urgent load diversion required.',
      timeHorizon: '14 Days',
      daysAgo: 1,
      factors: [
        { name: 'Core Transformer Temperature', contribution: 38.0, severity: 'CRITICAL', metricValue: '96.2°C', explanation: 'Operating 18°C above optimal thermal dissipation threshold.' },
        { name: 'Harmonic Distortion Load', contribution: 27.5, severity: 'HIGH', metricValue: '8.4% THD', explanation: 'Non-linear industrial load feedback generating harmonic resonance.' },
        { name: 'Coolant Pump Flow Rate', contribution: 21.0, severity: 'HIGH', metricValue: '62% Norm', explanation: 'Coolant circulation cavitation restricting primary heat exchanger.' },
        { name: 'Historical Baseline Drift', contribution: 13.5, severity: 'MEDIUM', metricValue: '+22.4%', explanation: 'Steadily increasing 30-day thermal drift curve.' },
      ],
      recommendations: [
        { title: 'Divert 30% Load to Substation Delta Backup', priority: 'PRIORITY 1', expectedImpact: '-26% Thermal Stress', urgency: 'Immediate', reasoning: 'Immediately removes critical core overheating vector.' },
        { title: 'Deploy Emergency Coolant Flush & Degas Unit', priority: 'PRIORITY 2', expectedImpact: '+15% Cooling Efficiency', urgency: 'Within 48h', reasoning: 'Clears suspected vapor locks in secondary heat exchanger loop.' },
        { title: 'Institute 10-Second High-Precision Telemetry Lock', priority: 'PRIORITY 3', expectedImpact: '+90% Early Warning Resolution', urgency: 'Routine', reasoning: 'Enables rapid anomaly detection before physical breaker trip.' },
      ],
    },
    {
      title: 'Watershed Basin Chemical Sensor Telemetry (Station 4)',
      category: 'Environmental',
      inputType: 'TEXT',
      riskScore: 64.2,
      riskLevel: 'HIGH',
      confidence: 0.88,
      prediction: 'Runoff turbidity surge projected to reach downstream municipal intake in 36-48 hours.',
      summary: 'Heavy upstream precipitation coupled with sediment displacement elevated environmental risk index to 64.2/100. Proactive filtration lock recommended.',
      timeHorizon: '7 Days',
      daysAgo: 2,
      factors: [
        { name: 'Turbidity & Suspended Solids', contribution: 35.0, severity: 'HIGH', metricValue: '142 NTU', explanation: 'Turbidity exceeds safe gravity-settling tolerance limits.' },
        { name: 'Precipitation Inflow Velocity', contribution: 28.0, severity: 'HIGH', metricValue: '4.2 m/s', explanation: 'Flash precipitation accelerating soil erosion.' },
        { name: 'Dissolved Oxygen Variance', contribution: 22.0, severity: 'MEDIUM', metricValue: '5.8 mg/L', explanation: 'Hypoxic zones expanding in low-velocity tributaries.' },
        { name: 'Seasonal Basins Precedent', contribution: 15.0, severity: 'LOW', metricValue: '1 Incident', explanation: 'Similar historical event in 2024 took 5 days to normalize.' },
      ],
      recommendations: [
        { title: 'Activate Pre-Treatment Coagulant Injection', priority: 'PRIORITY 1', expectedImpact: '-40% Suspended Particulates', urgency: 'Immediate', reasoning: 'Agglomerates fine silt before reaching membrane filters.' },
        { title: 'Open Retention Diversion Gate Bravo', priority: 'PRIORITY 2', expectedImpact: '-18% Peak Inundation', urgency: 'Within 48h', reasoning: 'Channels high-velocity surge into secondary flood basin.' },
      ],
    },
    {
      title: 'High-Precision EUV Lithography Vacuum Chamber',
      category: 'Operational',
      inputType: 'STRUCTURED',
      riskScore: 82.5,
      riskLevel: 'CRITICAL',
      confidence: 0.94,
      prediction: 'Wafer alignment aberration probability exceeds 92% within 72 hours without active recalibration.',
      summary: 'Sub-fab harmonic vibrations combined with thermal drift create extreme risk of nanometer-scale wafer yield degradation.',
      timeHorizon: '72 Hours',
      daysAgo: 3,
      factors: [
        { name: 'Harmonic Vibration Drift', contribution: 42.0, severity: 'CRITICAL', metricValue: '12.8 µm/s²', explanation: 'Resonant oscillation matches wafer stage natural frequency.' },
        { name: 'Thermal Expansion Variance', contribution: 28.5, severity: 'HIGH', metricValue: '+0.042°C', explanation: 'Chamber temperature drift causes optical lens displacement.' },
        { name: 'Vacuum Seal Integrity', contribution: 18.5, severity: 'MEDIUM', metricValue: '1.2e-7 Torr', explanation: 'Micro-leak detected along load lock gateway.' },
        { name: 'Laser Mirror Reflectivity', contribution: 11.0, severity: 'LOW', metricValue: '99.1%', explanation: 'Minor debris accumulation on collectors.' },
      ],
      recommendations: [
        { title: 'Engage Active Piezoelectric Vibration Cancellation', priority: 'PRIORITY 1', expectedImpact: '-85% Resonant Amplitude', urgency: 'Immediate', reasoning: 'Cancels sub-fab harmonic vibrations in real-time.' },
        { title: 'Pause Production Lot #4029 for Optical Realignment', priority: 'PRIORITY 2', expectedImpact: 'Prevents $1.4M Wafer Scrap', urgency: 'Immediate', reasoning: 'Mitigates yield defect propagation across current batch.' },
      ],
    },
    {
      title: 'Offshore Wind Turbine Nacelle Gearbox Health',
      category: 'Infrastructure',
      inputType: 'STRUCTURED',
      riskScore: 71.0,
      riskLevel: 'HIGH',
      confidence: 0.89,
      prediction: 'High-speed bearing pitting progression forecasted to trigger automatic shutdown within 21 days.',
      summary: 'Vibration acoustic signature indicates stage-2 spalling on planet gear bearing. High risk of forced downtime during peak gust window.',
      timeHorizon: '30 Days',
      daysAgo: 4,
      factors: [
        { name: 'High-Speed Bearing Vibration', contribution: 36.5, severity: 'HIGH', metricValue: '4.8 mm/s RMS', explanation: 'Vibration energy concentrated at outer race defect frequency.' },
        { name: 'Lube Oil Ferrous Debris', contribution: 29.0, severity: 'HIGH', metricValue: '185 ppm', explanation: 'Metallic particulate concentration increased by 3.2x.' },
        { name: 'Wind Gust Stress Index', contribution: 20.5, severity: 'MEDIUM', metricValue: '48 knots', explanation: 'Sustained offshore gale creating cyclic bending moments.' },
        { name: 'Operating Hours vs Overhaul', contribution: 14.0, severity: 'LOW', metricValue: '18,400 hrs', explanation: 'Approaching scheduled 20,000 hr maintenance cycle.' },
      ],
      recommendations: [
        { title: 'Limit Rotor Pitch to 75% Peak Generation', priority: 'PRIORITY 1', expectedImpact: '-32% Mechanical Bearing Load', urgency: 'Within 48h', reasoning: 'Extends bearing life until maintenance vessel window.' },
        { title: 'Schedule Offshore Service Crew Dispatch', priority: 'PRIORITY 2', expectedImpact: 'Avoids Complete Gearbox Replacement', urgency: 'Within 7 Days', reasoning: 'Performs on-tower bearing swap before catastrophic tooth failure.' },
      ],
    },
    {
      title: 'Cold-Chain Biologics Freight Transport #812',
      category: 'Resource',
      inputType: 'STRUCTURED',
      riskScore: 56.4,
      riskLevel: 'HIGH',
      confidence: 0.87,
      prediction: 'Container internal temperature projected to breach +6°C safety ceiling in 6 hours if door cycling rate persists.',
      summary: 'Frequent delivery access cycles in high-ambient transit corridor elevated temperature spoilage risk. Action required.',
      timeHorizon: '24 Hours',
      daysAgo: 5,
      factors: [
        { name: 'Reefer Unit Compressor Duty', contribution: 38.0, severity: 'HIGH', metricValue: '96% Max', explanation: 'Compressor operating continuously without thermal recharge.' },
        { name: 'Door Open Cumulative Duration', contribution: 28.0, severity: 'MEDIUM', metricValue: '42 mins', explanation: 'Exceeded recommended 15-minute door cycle budget.' },
        { name: 'External Ambient Temperature', contribution: 20.0, severity: 'MEDIUM', metricValue: '39.5°C', explanation: 'Desert highway transit corridor.' },
        { name: 'Thermal Insulation Degradation', contribution: 14.0, severity: 'LOW', metricValue: '0.038 W/mK', explanation: 'Normal seal wear.' },
      ],
      recommendations: [
        { title: 'Route Transport to Cold-Storage Transfer Depot', priority: 'PRIORITY 1', expectedImpact: '-4.2°C Internal Temperature', urgency: 'Immediate', reasoning: 'Replenishes active refrigerant before vaccine degradation threshold.' },
      ],
    },
  ];

  // Generate 15 additional varied records to satisfy 20+ historical analyses requirement
  const domains = ['Infrastructure', 'Environmental', 'Operational', 'Resource', 'Financial', 'Healthcare'];
  const titles = [
    'Subsea Gas Pipeline Cathodic Protection Voltage',
    'Hospital Backup Generator Fuel Supply & Viscosity',
    'Railway Track Geometry & Thermal Buckling Risk',
    'Datacenter Liquid Cooling Chiller Plant Delta-T',
    'Aviation Turbofan Titanium Blade Acoustic Fatigue',
    'Municipal Water Treatment Chlorination Residuals',
    'Chemical Synthesis Reactor Exothermic Runaway Metric',
    'Automated Port Container Crane Wire Rope Tension',
    'Mining Tailings Dam Pore Pressure Hydrostatic Load',
    'Smart City Traffic Congestion Cascade Probability',
    'High-Frequency Trading Algorithm Latency Jitter',
    'Cardiovascular ICU Patient Stability Metric',
    'Agricultural Soil Salinity & Moisture Depletion',
    'Satellite Solar Array Pointing & Thermal Cycling',
    'Cryogenic LNG Storage Tank Boil-Off Rate Delta',
  ];

  for (let i = 0; i < titles.length; i++) {
    const riskScore = Math.round((28 + (i * 4.3) + (Math.sin(i) * 15)) * 10) / 10;
    const boundedScore = Math.min(94, Math.max(18, riskScore));
    const riskLevel = boundedScore < 25 ? 'LOW' : boundedScore < 50 ? 'MODERATE' : boundedScore < 75 ? 'HIGH' : 'CRITICAL';
    const category = domains[i % domains.length];

    historicalAnalyses.push({
      title: titles[i],
      category,
      inputType: i % 2 === 0 ? 'STRUCTURED' : 'TEXT',
      riskScore: boundedScore,
      riskLevel,
      confidence: Math.round((0.83 + ((i % 5) * 0.03)) * 100) / 100,
      prediction: `Model projects ${riskLevel.toLowerCase()} probability of baseline operational variance over the next 30 days.`,
      summary: `System analysis for ${titles[i]} evaluated at ${boundedScore}/100 (${riskLevel} RISK). Primary factors analyzed across sensor telemetry.`,
      timeHorizon: '30 Days',
      daysAgo: 6 + i,
      factors: [
        { name: 'Telemetry Anomaly Deviation', contribution: 36.0, severity: boundedScore > 70 ? 'CRITICAL' : 'HIGH', metricValue: '+18.4%', explanation: 'Sensor variance exceeds 90-day standard deviation.' },
        { name: 'Operational Capacity Strain', contribution: 29.0, severity: boundedScore > 50 ? 'HIGH' : 'MEDIUM', metricValue: '84.2%', explanation: 'High sustained throughput limits maintenance buffer.' },
        { name: 'Environmental Cross-Correlation', contribution: 21.0, severity: 'MEDIUM', metricValue: 'Indexed 62', explanation: 'Ambient temperature and humidity variance.' },
        { name: 'Historical Failure Signature', contribution: 14.0, severity: 'LOW', metricValue: 'Matched 89%', explanation: 'Pattern correlates with prior quarter event log.' },
      ],
      recommendations: [
        { title: 'Execute Targeted Calibration & Diagnostic Sweep', priority: 'PRIORITY 1', expectedImpact: '-18.5% Risk Factor Weight', urgency: 'Within 48h', reasoning: 'Recalibrates sensor drift and confirms physical state.' },
        { title: 'Deploy Preventive Maintenance Action Plan', priority: 'PRIORITY 2', expectedImpact: '+12% System Longevity', urgency: 'Within 7 Days', reasoning: 'Standard preventive servicing sequence.' },
      ],
    });
  }

  // Insert all historical analyses
  for (const item of historicalAnalyses) {
    const forecastTimeline = PredictionEngine.generateForecastTimeline(item.riskScore);
    const createdAt = new Date(Date.now() - item.daysAgo * 86400000);

    await prisma.analysis.create({
      data: {
        userId: user.id,
        title: item.title,
        category: item.category,
        inputType: item.inputType,
        status: 'COMPLETED',
        riskScore: item.riskScore,
        riskLevel: item.riskLevel,
        confidence: item.confidence,
        prediction: item.prediction,
        summary: item.summary,
        timeHorizon: item.timeHorizon,
        tags: JSON.stringify([item.category, `${item.riskLevel} RISK`]),
        createdAt,
        updatedAt: createdAt,
        inputData: {
          create: {
            rawInput: item.summary,
            structuredData: JSON.stringify({ category: item.category, score: item.riskScore }),
            source: 'Historical Analysis Archive',
            createdAt,
          },
        },
        riskFactors: {
          create: item.factors.map((f) => ({
            name: f.name,
            category: item.category,
            contribution: f.contribution,
            severity: f.severity,
            explanation: f.explanation,
            trend: 'INCREASING',
            metricValue: f.metricValue,
          })),
        },
        predictions: {
          create: [
            {
              value: item.prediction,
              probability: Math.round((0.65 + (item.riskScore / 300)) * 100) / 100,
              confidence: item.confidence,
              timeHorizon: item.timeHorizon,
              baselineComparison: Math.round((item.riskScore - 50) * 10) / 10,
              trendDirection: item.riskScore > 50 ? 'INCREASING' : 'STABLE',
              forecastPoints: JSON.stringify(forecastTimeline),
            },
          ],
        },
        recommendations: {
          create: item.recommendations.map((r, idx) => ({
            title: r.title,
            description: `Automated recommendation derived from multi-factor analysis of ${item.title}.`,
            priority: r.priority,
            expectedImpact: r.expectedImpact,
            urgency: r.urgency,
            reasoning: r.reasoning,
            status: idx === 0 && item.riskScore > 75 ? 'ACCEPTED' : 'PENDING',
            orderIndex: idx,
          })),
        },
        insights: {
          create: [
            {
              type: item.riskScore > 75 ? 'ANOMALY' : 'TREND',
              severity: item.riskLevel,
              title: `${item.riskLevel} Risk Detected: ${item.title}`,
              description: item.summary,
              affectedFactor: item.factors[0]?.name,
              recommendedAction: item.recommendations[0]?.title,
              createdAt,
            },
          ],
        },
      },
    });
  }

  // 4. Seed Real-Time Notifications
  const notificationsData = [
    {
      title: 'Critical Risk Threshold Exceeded',
      message: 'Substation Alpha-9 transformer temperature rose to 96.2°C (Risk Score: 78.4/100). Immediate load diversion advised.',
      type: 'RISK_ALERT',
      severity: 'CRITICAL',
      isRead: false,
    },
    {
      title: 'EUV Cleanroom Vibration Drift Detected',
      message: 'Harmonic vibration oscillation increased +19% in Photolithography Chamber 2. Action required.',
      type: 'PREDICTION_UPDATE',
      severity: 'WARNING',
      isRead: false,
    },
    {
      title: 'Decision Action Executed',
      message: 'Recommendation "Divert 30% Load to Substation Delta Backup" marked as ACCEPTED by Dr. Elena Rostova.',
      type: 'DECISION_ACTION',
      severity: 'SUCCESS',
      isRead: true,
    },
    {
      title: 'Daily AI Intelligence Digest Ready',
      message: '24 active telemetry streams analyzed. 4 high-priority alerts identified across regional infrastructure.',
      type: 'SYSTEM',
      severity: 'INFO',
      isRead: true,
    },
  ];

  for (const notif of notificationsData) {
    await prisma.notification.create({ data: notif });
  }

  console.log(`✅ [RiskLens AI] Database seeded successfully with 5 scenarios, 20+ historical analyses, and live feeds!`);
}

main()
  .catch((e) => {
    console.error('❌ [RiskLens AI] Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
