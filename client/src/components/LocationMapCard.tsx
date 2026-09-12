import React, { useState } from 'react';
import {
  MapPin,
  Maximize2,
  Minimize2,
  Layers,
  ZoomIn,
  ZoomOut,
  Navigation,
  Compass,
  Radio,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { GeocodedLocation, RiskLevel } from '../types';

interface LocationMapCardProps {
  location: GeocodedLocation;
  riskScore: number;
  riskLevel: RiskLevel;
  className?: string;
}

export const LocationMapCard: React.FC<LocationMapCardProps> = ({
  location,
  riskScore,
  riskLevel,
  className = '',
}) => {
  const [zoom, setZoom] = useState(11);
  const [showRiskOverlay, setShowRiskOverlay] = useState(true);

  const getRiskColor = (level: RiskLevel) => {
    switch (level) {
      case 'CRITICAL':
        return {
          stroke: '#EF4444',
          fill: 'rgba(239, 68, 68, 0.25)',
          glow: 'rgba(239, 68, 68, 0.4)',
          text: 'text-red-400',
        };
      case 'HIGH':
        return {
          stroke: '#F97316',
          fill: 'rgba(249, 115, 22, 0.25)',
          glow: 'rgba(249, 115, 22, 0.4)',
          text: 'text-orange-400',
        };
      case 'MODERATE':
        return {
          stroke: '#EAB308',
          fill: 'rgba(234, 179, 8, 0.25)',
          glow: 'rgba(234, 179, 8, 0.4)',
          text: 'text-amber-400',
        };
      default:
        return {
          stroke: '#10B981',
          fill: 'rgba(16, 185, 129, 0.25)',
          glow: 'rgba(16, 185, 129, 0.4)',
          text: 'text-emerald-400',
        };
    }
  };

  const colors = getRiskColor(riskLevel);

  // OpenStreetMap static or web tile link
  const osmUrl = `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=${zoom}/${location.latitude}/${location.longitude}`;

  return (
    <div
      className={`rounded-2xl border border-white/10 bg-[#081B30]/90 backdrop-blur-xl p-5 shadow-2xl relative overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3 z-10">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Geospatial & Topographical Map
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRiskOverlay(!showRiskOverlay)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
              showRiskOverlay
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-white/5 border-white/10 text-slate-400'
            }`}
          >
            Risk Zone
          </button>
          <a
            href={osmUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            title="Open in OpenStreetMap"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Interactive Synthetic Map Visual Canvas */}
      <div className="relative w-full h-48 sm:h-56 rounded-xl border border-white/10 bg-[#040C17] overflow-hidden group">
        {/* Stylized Grid & Terrain Lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#1E3A5F_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* Contour lines simulation */}
        <svg className="absolute inset-0 w-full h-full opacity-30" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50%" cy="50%" r={40 * (zoom / 10)} fill="none" stroke="#0EA5E9" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50%" cy="50%" r={75 * (zoom / 10)} fill="none" stroke="#0EA5E9" strokeWidth="1" strokeOpacity="0.5" />
          <circle cx="50%" cy="50%" r={110 * (zoom / 10)} fill="none" stroke="#0EA5E9" strokeWidth="0.8" strokeOpacity="0.3" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* Dynamic Risk Buffer Envelope Circle */}
          {showRiskOverlay && (
            <circle
              cx="50%"
              cy="50%"
              r={Math.min(90, Math.max(30, (riskScore * 0.9) * (zoom / 10)))}
              fill={colors.fill}
              stroke={colors.stroke}
              strokeWidth="2"
              className="transition-all duration-500 animate-pulse"
            />
          )}
        </svg>

        {/* Center Location Pinpoint Marker */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none z-10">
          <div className="relative">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2"
              style={{
                backgroundColor: colors.stroke,
                borderColor: '#ffffff',
                boxShadow: `0 0 15px ${colors.glow}`,
              }}
            >
              <MapPin className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white animate-ping" />
          </div>
          <div className="mt-1 px-2.5 py-0.5 rounded-full bg-[#06111F]/90 border border-white/20 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
            {location.name}
          </div>
        </div>

        {/* Top-Right Map Controls */}
        <div className="absolute top-3 right-3 flex flex-col gap-1 z-20">
          <button
            onClick={() => setZoom((prev) => Math.min(prev + 1, 16))}
            className="p-1.5 rounded-lg bg-[#06111F]/80 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow"
            title="Zoom in"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setZoom((prev) => Math.max(prev - 1, 5))}
            className="p-1.5 rounded-lg bg-[#06111F]/80 border border-white/10 hover:bg-white/10 text-slate-300 hover:text-white transition-all shadow"
            title="Zoom out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Left Coordinate Badge */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-[#06111F]/85 border border-white/10 text-[10px] font-mono text-slate-300 flex items-center gap-2 backdrop-blur-sm z-20">
          <Compass className="w-3 h-3 text-cyan-400" />
          <span>{location.latitude.toFixed(4)}°N, {location.longitude.toFixed(4)}°E</span>
          <span className="text-slate-500">|</span>
          <span>{location.elevation ?? 84}m ASL</span>
        </div>

        {/* Bottom Right Zoom Level Badge */}
        <div className="absolute bottom-2.5 right-2.5 px-2 py-1 rounded-lg bg-[#06111F]/85 border border-white/10 text-[10px] font-mono text-slate-400 backdrop-blur-sm z-20">
          Zoom: {zoom}x
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          Coordinates locked to Open-Meteo & Nominatim GIS
        </span>
        <span className="font-semibold text-white">
          Zone Risk: <span className={colors.text}>{riskScore}/100</span>
        </span>
      </div>
    </div>
  );
};
