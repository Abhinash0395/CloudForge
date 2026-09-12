import { getGeminiClient, isGeminiAvailable } from './geminiClient';
import { FallbackEngine, AnalysisEngineResult } from './fallbackEngine';

export class AIService {
  /**
   * Returns current AI status (ONLINE with Gemini API vs DEMO INTELLIGENCE MODE)
   */
  public static getStatus(): {
    mode: 'ONLINE' | 'DEMO_INTELLIGENCE';
    provider: string;
    model: string;
    isFallback: boolean;
    geminiConfigured: boolean;
  } {
    const available = isGeminiAvailable();
    return {
      mode: available ? 'ONLINE' : 'DEMO_INTELLIGENCE',
      provider: available ? 'Google Gemini 2.5 / 2.0 Pro API' : 'RiskLens Autonomous Decision Engine',
      model: available ? 'gemini-1.5-pro-latest' : 'RiskLens-MFAE-v4 (Deterministic)',
      isFallback: !available,
      geminiConfigured: available,
    };
  }

  /**
   * Performs end-to-end Risk & Prediction Analysis on Structured Data
   */
  public static async analyzeStructured(data: Record<string, any>): Promise<AnalysisEngineResult> {
    const fallback = FallbackEngine.analyzeStructuredData(data);
    const gemini = getGeminiClient();

    if (!gemini) {
      return fallback;
    }

    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
You are the AI Intelligence Layer for RiskLens AI (Track 01 — AI, ML & Emerging Technologies, PS 05 — AI for Prediction & Decision Support).
Analyze this structured risk scenario and return ONLY valid JSON matching this schema:
{
  "summary": "2-3 sentence executive summary of risk and key driver",
  "prediction": "1 sentence precise future prediction outcome with timeline",
  "whatModelSaw": "Description of input features and patterns detected",
  "whatChanged": "Description of deviation from historical baseline",
  "whyItMatters": "Why this specific risk propagation is critical",
  "whatCouldHappen": "Concrete forecasted impact if unmitigated",
  "whatToConsider": "Primary decision recommendation",
  "riskFactors": [
    { "name": "Factor Name", "category": "Operational|Environmental|Telemetry|Historical", "contribution": 35.0, "severity": "HIGH|CRITICAL|MEDIUM|LOW", "explanation": "Detailed explanation", "trend": "INCREASING|DECREASING|STABLE", "metricValue": "value string" }
  ],
  "recommendations": [
    { "title": "Action Title", "description": "Action details", "priority": "PRIORITY 1|PRIORITY 2|PRIORITY 3", "expectedImpact": "-20% Risk", "urgency": "Immediate|Within 48h|Within 7 Days|Routine", "reasoning": "Strategic rationale" }
  ]
}

Input Data:
${JSON.stringify(data, null, 2)}
Computed Baseline Risk Score: ${fallback.riskScore} (${fallback.riskLevel} RISK)
Confidence: ${fallback.confidence}
`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const cleanedJson = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      return {
        ...fallback,
        summary: parsed.summary || fallback.summary,
        prediction: parsed.prediction || fallback.prediction,
        predictionDetails: {
          ...fallback.predictionDetails,
          value: parsed.prediction || fallback.predictionDetails.value,
        },
        riskFactors: parsed.riskFactors && parsed.riskFactors.length > 0 ? parsed.riskFactors : fallback.riskFactors,
        recommendations: parsed.recommendations && parsed.recommendations.length > 0 ? parsed.recommendations : fallback.recommendations,
        explainability: {
          ...fallback.explainability,
          whatModelSaw: parsed.whatModelSaw || fallback.explainability.whatModelSaw,
          whatChanged: parsed.whatChanged || fallback.explainability.whatChanged,
          whyItMatters: parsed.whyItMatters || fallback.explainability.whyItMatters,
          whatCouldHappen: parsed.whatCouldHappen || fallback.explainability.whatCouldHappen,
          whatToConsider: parsed.whatToConsider || fallback.explainability.whatToConsider,
          technicalDetails: {
            ...fallback.explainability.technicalDetails,
            model: 'Google Gemini 2.5 / 2.0 Flash + RiskLens MFAE-v4',
            dataSource: 'Structured Telemetry + Gemini Generative Reasoning',
          },
        },
        isAiFallback: false,
      };
    } catch (err) {
      console.warn('[RiskLens AI] Gemini API call error, using deterministic fallback:', err);
      return fallback;
    }
  }

  /**
   * Performs end-to-end Risk & Prediction Analysis on Natural Language Text
   */
  public static async analyzeText(text: string): Promise<AnalysisEngineResult> {
    const fallback = FallbackEngine.analyzeText(text);
    const gemini = getGeminiClient();

    if (!gemini) {
      return fallback;
    }

    try {
      const model = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
You are the NLP Decision-Support Intelligence Engine for RiskLens AI.
Analyze the following natural language risk report and extract:
1. Numerical risk score (0-100)
2. Risk level (LOW if <25, MODERATE if 25-49, HIGH if 50-74, CRITICAL if 75-100)
3. Confidence (0.75 - 0.98)
4. Prediction statement
5. Executive summary
6. 3-4 key Risk Factors with % contributions summing to ~100%
7. 3 Prioritized Recommendations (Priority 1, 2, 3)
8. Multi-part Explainability breakdown

Text:
"${text}"

Return ONLY valid JSON matching this schema:
{
  "riskScore": 76,
  "riskLevel": "CRITICAL",
  "confidence": 0.89,
  "prediction": "...",
  "summary": "...",
  "whatModelSaw": "...",
  "whatChanged": "...",
  "whyItMatters": "...",
  "whatCouldHappen": "...",
  "whatToConsider": "...",
  "riskFactors": [
    { "name": "...", "category": "...", "contribution": 35.0, "severity": "CRITICAL", "explanation": "...", "trend": "INCREASING", "metricValue": "..." }
  ],
  "recommendations": [
    { "title": "...", "description": "...", "priority": "PRIORITY 1", "expectedImpact": "...", "urgency": "Immediate", "reasoning": "..." }
  ]
}
`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      const cleanedJson = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson);

      const score = Number(parsed.riskScore) || fallback.riskScore;
      const level = FallbackEngine.calculateRiskLevel(score);

      return {
        ...fallback,
        riskScore: score,
        riskLevel: level,
        confidence: Number(parsed.confidence) || fallback.confidence,
        prediction: parsed.prediction || fallback.prediction,
        summary: parsed.summary || fallback.summary,
        predictionDetails: {
          ...fallback.predictionDetails,
          value: parsed.prediction || fallback.predictionDetails.value,
        },
        riskFactors: parsed.riskFactors && parsed.riskFactors.length > 0 ? parsed.riskFactors : fallback.riskFactors,
        recommendations: parsed.recommendations && parsed.recommendations.length > 0 ? parsed.recommendations : fallback.recommendations,
        explainability: {
          ...fallback.explainability,
          whatModelSaw: parsed.whatModelSaw || fallback.explainability.whatModelSaw,
          whatChanged: parsed.whatChanged || fallback.explainability.whatChanged,
          whyItMatters: parsed.whyItMatters || fallback.explainability.whyItMatters,
          whatCouldHappen: parsed.whatCouldHappen || fallback.explainability.whatCouldHappen,
          whatToConsider: parsed.whatToConsider || fallback.explainability.whatToConsider,
          technicalDetails: {
            ...fallback.explainability.technicalDetails,
            model: 'Google Gemini 2.5 / 2.0 Flash (NLP Reasoning)',
            dataSource: 'Natural Language Input Stream',
          },
        },
        isAiFallback: false,
      };
    } catch (err) {
      console.warn('[RiskLens AI] Gemini API text parsing failed, using fallback:', err);
      return fallback;
    }
  }
}
