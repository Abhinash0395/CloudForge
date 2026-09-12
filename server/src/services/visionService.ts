export interface DetectedObject {
  label: string;
  confidence: number;
  box: { x: number; y: number; width: number; height: number }; // Percentage coords 0-100
  riskContribution: number;
  status: 'NORMAL' | 'WARNING' | 'ANOMALOUS';
  description: string;
}

export interface VisionAnalysisResult {
  imageUrl: string;
  imageName: string;
  visualRiskScore: number;
  confidence: number;
  detectedObjects: DetectedObject[];
  anomalies: Array<{
    type: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    location: string;
    impact: string;
  }>;
  insights: string;
  recommendedNextStep: string;
}

export class VisionService {
  /**
   * Pre-configured rich computer vision analysis scenarios
   */
  public static analyzeImage(imageUrl: string, imageName: string = 'Asset_Scan.jpg'): VisionAnalysisResult {
    // Generate realistic object detection & anomaly bounding boxes
    const detectedObjects: DetectedObject[] = [
      {
        label: 'Structural Weld Seam & Support Strut',
        confidence: 0.94,
        box: { x: 22, y: 35, width: 38, height: 42 },
        riskContribution: 28,
        status: 'ANOMALOUS',
        description: 'Micro-fracture propagation signature along secondary load-bearing gusset weld.',
      },
      {
        label: 'Thermal Distribution Envelope',
        confidence: 0.91,
        box: { x: 62, y: 18, width: 28, height: 36 },
        riskContribution: 22,
        status: 'WARNING',
        description: 'Localized thermal hotspot exceeding baseline dissipation threshold by +14.6°C.',
      },
      {
        label: 'Hydraulic Flange & Pressure Seal',
        confidence: 0.96,
        box: { x: 12, y: 68, width: 32, height: 24 },
        riskContribution: 16,
        status: 'WARNING',
        description: 'Surface weeping and early elastomer degradation detected at gasket perimeter.',
      },
      {
        label: 'Primary Chassis Enclosure',
        confidence: 0.98,
        box: { x: 5, y: 5, width: 90, height: 90 },
        riskContribution: 6,
        status: 'NORMAL',
        description: 'Overall structural framing within nominal integrity tolerances.',
      },
    ];

    const anomalies = [
      {
        type: 'Stress Fracturing (Class-B)',
        severity: 'HIGH' as const,
        location: 'Quadrant B-2 (Support Strut)',
        impact: 'Elevates structural failure risk by +28 points under dynamic load.',
      },
      {
        type: 'Localized Thermal Hotspot',
        severity: 'MEDIUM' as const,
        location: 'Quadrant C-1 (Thermal Envelope)',
        impact: 'Accelerates component fatigue cycle by estimated 2.4x.',
      },
      {
        type: 'Seal Deterioration',
        severity: 'MEDIUM' as const,
        location: 'Quadrant A-4 (Hydraulic Flange)',
        impact: 'Potential pressure loss risk within 14-21 operational days.',
      },
    ];

    const visualRiskScore = 72;
    const confidence = 0.93;
    const insights = `Computer Vision scan identified 3 localized anomalies across key mechanical sub-assemblies. The most severe visual defect is a Class-B structural stress fracture on Quadrant B-2, contributing +28 points to overall asset risk. Visual confidence is 93%.`;
    const recommendedNextStep = 'Feed visual risk metrics directly into RiskLens Multi-Factor Decision Engine for prioritized remediation dispatch.';

    return {
      imageUrl,
      imageName,
      visualRiskScore,
      confidence,
      detectedObjects,
      anomalies,
      insights,
      recommendedNextStep,
    };
  }
}
