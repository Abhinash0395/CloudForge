import { RiskLevel } from '../types';

export interface RiskCategoryConfig {
  min: number;
  max: number;
  level: RiskLevel;
  label: string;
  badgeText: string;
  colorHex: string;
  textColor: string;
  bgColor: string;
  borderColor: string;
  dotEmoji: string;
}

export const RISK_ZONES: RiskCategoryConfig[] = [
  {
    min: 0,
    max: 24,
    level: 'LOW',
    label: 'Low Risk',
    badgeText: '🟢 LOW RISK',
    colorHex: '#10B981', // Emerald Green
    textColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/30',
    dotEmoji: '🟢',
  },
  {
    min: 25,
    max: 49,
    level: 'MODERATE',
    label: 'Moderate Risk',
    badgeText: '🟡 MODERATE RISK',
    colorHex: '#F59E0B', // Amber Yellow
    textColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    dotEmoji: '🟡',
  },
  {
    min: 50,
    max: 74,
    level: 'HIGH',
    label: 'High Risk',
    badgeText: '🟠 HIGH RISK',
    colorHex: '#F97316', // Orange
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    dotEmoji: '🟠',
  },
  {
    min: 75,
    max: 100,
    level: 'CRITICAL',
    label: 'Critical Risk',
    badgeText: '🔴 CRITICAL RISK',
    colorHex: '#EF4444', // Red
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    dotEmoji: '🔴',
  },
];

/**
 * Get semantic risk configuration from numerical score (0-100)
 */
export function getRiskZone(score: number): RiskCategoryConfig {
  const clamped = Math.max(0, Math.min(100, score || 0));
  for (const zone of RISK_ZONES) {
    if (clamped >= zone.min && clamped <= zone.max) {
      return zone;
    }
  }
  return RISK_ZONES[0];
}

/**
 * Get semantic risk color hex
 */
export function getRiskColorHex(score: number): string {
  return getRiskZone(score).colorHex;
}

/**
 * Get semantic risk badge text with emoji and level
 */
export function getRiskBadge(score: number): { text: string; dot: string; textColor: string; bgColor: string; borderColor: string } {
  const zone = getRiskZone(score);
  return {
    text: zone.badgeText,
    dot: zone.dotEmoji,
    textColor: zone.textColor,
    bgColor: zone.bgColor,
    borderColor: zone.borderColor,
  };
}

/**
 * Get color for temperature (°C)
 */
export function getTemperatureColor(celsius: number): { hex: string; label: string; textClass: string } {
  if (celsius < 10) return { hex: '#38BDF8', label: 'Cold', textClass: 'text-sky-400' };
  if (celsius < 22) return { hex: '#06B6D4', label: 'Cool', textClass: 'text-cyan-400' };
  if (celsius < 32) return { hex: '#10B981', label: 'Optimal', textClass: 'text-emerald-400' };
  if (celsius < 38) return { hex: '#F59E0B', label: 'Warm', textClass: 'text-amber-400' };
  return { hex: '#EF4444', label: 'Heatwave', textClass: 'text-red-400' };
}

/**
 * Get color for AQI rating (Copernicus / US standard)
 */
export function getAQICategory(aqi: number): { hex: string; label: string; badge: string; textClass: string; bgClass: string } {
  if (aqi <= 50) return { hex: '#10B981', label: 'Good', badge: '🟢 GOOD (0-50)', textClass: 'text-emerald-400', bgClass: 'bg-emerald-500/10' };
  if (aqi <= 100) return { hex: '#F59E0B', label: 'Moderate', badge: '🟡 MODERATE (51-100)', textClass: 'text-amber-400', bgClass: 'bg-amber-500/10' };
  if (aqi <= 150) return { hex: '#F97316', label: 'Unhealthy for Sensitive', badge: '🟠 UNHEALTHY SENSITIVE (101-150)', textClass: 'text-orange-400', bgClass: 'bg-orange-500/10' };
  if (aqi <= 200) return { hex: '#EF4444', label: 'Unhealthy', badge: '🔴 UNHEALTHY (151-200)', textClass: 'text-red-400', bgClass: 'bg-red-500/10' };
  return { hex: '#881337', label: 'Hazardous', badge: '🟣 HAZARDOUS (200+)', textClass: 'text-rose-400', bgClass: 'bg-rose-500/10' };
}
