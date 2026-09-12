import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config';

let genAIInstance: GoogleGenerativeAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI | null {
  if (!config.geminiApiKey || config.geminiApiKey.trim() === '') {
    return null;
  }
  if (!genAIInstance) {
    try {
      genAIInstance = new GoogleGenerativeAI(config.geminiApiKey);
    } catch (e) {
      console.warn('[RiskLens AI] Failed to initialize Gemini client:', e);
      return null;
    }
  }
  return genAIInstance;
}

export function isGeminiAvailable(): boolean {
  return Boolean(config.geminiApiKey && config.geminiApiKey.trim().length > 5);
}
