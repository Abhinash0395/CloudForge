import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';
import { RiskLevel } from '../types';

interface StatusBadgeProps {
  level: RiskLevel | string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  level,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  const normLevel = (level || 'LOW').toUpperCase();

  const getStyle = () => {
    switch (normLevel) {
      case 'CRITICAL':
        return {
          bg: 'bg-risk-critical/15 border-risk-critical/40 text-risk-critical shadow-glow-critical/20',
          dot: 'bg-risk-critical',
          icon: ShieldAlert,
          label: 'CRITICAL RISK',
        };
      case 'HIGH':
        return {
          bg: 'bg-risk-high/15 border-risk-high/40 text-risk-high',
          dot: 'bg-risk-high',
          icon: AlertTriangle,
          label: 'HIGH RISK',
        };
      case 'MODERATE':
      case 'MEDIUM':
        return {
          bg: 'bg-risk-moderate/15 border-risk-moderate/40 text-risk-moderate',
          dot: 'bg-risk-moderate',
          icon: AlertCircle,
          label: 'MODERATE RISK',
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-risk-low/15 border-risk-low/40 text-risk-low shadow-glow-low/20',
          dot: 'bg-risk-low',
          icon: ShieldCheck,
          label: 'LOW RISK',
        };
    }
  };

  const config = getStyle();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
    lg: 'text-sm px-3.5 py-1.5 gap-2.5 font-semibold',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border tracking-wide uppercase shadow-sm ${config.bg} ${sizeClasses[size]} ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes[size]} flex-shrink-0`} />}
      <span>{config.label}</span>
    </span>
  );
};
