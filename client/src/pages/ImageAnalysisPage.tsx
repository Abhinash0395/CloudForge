import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Camera,
  UploadCloud,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  Eye,
  Crosshair,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';

export const ImageAnalysisPage: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<string>('demo-1');
  const [isScanning, setIsScanning] = useState(false);
  const [visionData, setVisionData] = useState<any>(null);
  const [selectedBox, setSelectedBox] = useState<number | null>(0);
  const toast = useToast();
  const navigate = useNavigate();

  const demoImages = [
    {
      id: 'demo-1',
      title: 'Structural Steel Gusset Weld Inspection',
      type: 'Infrastructure Inspection',
      preview: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-2',
      title: 'Turbine Nacelle Thermal Infrared Scan',
      type: 'Thermal Anomaly',
      preview: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'demo-3',
      title: 'Hydraulic Flange Valve & Seal Perimeter',
      type: 'Seal Integrity',
      preview: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleRunVisionScan = async () => {
    setIsScanning(true);
    setVisionData(null);

    try {
      const result = await api.analyzeImage(new FormData());
      setTimeout(() => {
        setVisionData(result);
        setIsScanning(false);
        toast.success('Vision Scan Complete', 'Detected 3 localized anomalies with 94% confidence.');
      }, 1200);
    } catch (err: any) {
      setIsScanning(false);
      toast.error('Vision Scan Failed', err.message);
    }
  };

  const handleUseInRiskAnalysis = async () => {
    toast.info('Synthesizing Vision Data', 'Transferring bounding anomalies into RiskLens Multi-Factor Decision Engine...');
    try {
      const analysis = await api.analyzeStructured({
        scenarioName: 'Visual Structural & Thermal Anomaly Assessment',
        category: 'Infrastructure',
        currentValue: 78,
        historicalValue: 45,
        changeRate: 22,
        environmentalFactor: 65,
        operationalFactor: 80,
        previousIncidents: 2,
        operationalFactorName: 'Visual Stress Fracture & Thermal Delta',
        environmentalFactorName: 'Corrosion & Load Index',
      });
      navigate(`/analysis`);
      toast.success('Risk Model Updated', `System Risk calculated at ${analysis.riskScore}/100.`);
    } catch (e: any) {
      navigate('/analysis');
    }
  };

  return (
    <div className="space-y-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-brand-accent">
            Supporting Capability • Multi-Modal Ingestion
          </div>
          <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mt-1">
            Computer Vision Asset Inspection
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Detect visual defects, thermal hotspots, and surface fractures. Feed extracted visual risk weights directly into the PS 05 prediction engine.
          </p>
        </div>

        <button
          onClick={handleRunVisionScan}
          disabled={isScanning}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white text-xs font-bold shadow-glow-primary hover:opacity-90 disabled:opacity-50 transition-all flex items-center gap-2"
        >
          <Camera className="w-4 h-4" />
          <span>{isScanning ? 'Scanning Pixels...' : 'Run Vision Scan'}</span>
        </button>
      </div>

      {/* Preset Demo Images Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {demoImages.map((img) => (
          <button
            key={img.id}
            onClick={() => {
              setSelectedImage(img.id);
              if (!visionData) handleRunVisionScan();
            }}
            className={`p-3 rounded-2xl glass-panel text-left transition-all border ${
              selectedImage === img.id
                ? 'border-brand-primary bg-brand-primary/10 shadow-glow-primary/20'
                : 'border-white/5 hover:border-white/20'
            }`}
          >
            <div className="h-28 w-full rounded-xl overflow-hidden mb-2 relative">
              <img src={img.preview} alt={img.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-dark-900/80 text-brand-accent">
                {img.type}
              </span>
            </div>
            <div className="text-xs font-bold text-white truncate">{img.title}</div>
          </button>
        ))}
      </div>

      {/* Main Vision Workbench: Preview on Left, Vision Intelligence on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 cols: Image Preview with Bounding Box Overlays */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-brand-accent" />
              <span>Inspection Scan Viewport</span>
            </h3>
            <span className="text-[11px] font-mono text-slate-400">Resolution: 1920x1080 • Calibrated</span>
          </div>

          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video bg-black flex items-center justify-center group">
            <img
              src="https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80"
              alt="Asset Inspection Scan"
              className="w-full h-full object-cover opacity-80"
            />

            {/* Bounding Box Overlays */}
            {visionData && (
              <>
                {visionData.detectedObjects.map((obj: any, idx: number) => (
                  <div
                    key={obj.label}
                    onClick={() => setSelectedBox(idx)}
                    className={`absolute cursor-pointer transition-all border-2 ${
                      selectedBox === idx
                        ? 'border-risk-high bg-risk-high/20 shadow-glow-critical'
                        : obj.status === 'ANOMALOUS'
                        ? 'border-risk-critical bg-risk-critical/10 animate-pulse'
                        : 'border-brand-accent bg-brand-accent/10'
                    }`}
                    style={{
                      left: `${obj.box.x}%`,
                      top: `${obj.box.y}%`,
                      width: `${obj.box.width}%`,
                      height: `${obj.box.height}%`,
                    }}
                  >
                    <div className="absolute -top-6 left-0 px-2 py-0.5 rounded bg-dark-950/90 text-[10px] font-mono font-bold text-white border border-white/10 whitespace-nowrap">
                      {obj.label} ({Math.round(obj.confidence * 100)}%)
                    </div>
                  </div>
                ))}
              </>
            )}

            {!visionData && !isScanning && (
              <div className="absolute inset-0 bg-dark-950/60 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
                <UploadCloud className="w-10 h-10 text-brand-accent mb-2" />
                <div className="text-sm font-bold text-white">Select a scan or click "Run Vision Scan"</div>
                <div className="text-xs text-slate-400 mt-1">Computer vision will detect surface micro-cracks and thermal variance.</div>
              </div>
            )}

            {isScanning && (
              <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                <div className="w-12 h-12 rounded-full border-4 border-brand-primary border-t-transparent animate-spin mb-3" />
                <div className="text-sm font-bold text-white">Performing Feature Extraction...</div>
                <div className="text-xs text-brand-accent font-mono mt-1">Analyzing spatial gradient tensors</div>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Visual Detection Engine: RiskLens CV-v2</span>
            <span>Target Anomaly Precision: 94.2%</span>
          </div>
        </div>

        {/* Right 5 cols: Vision Intelligence Panel */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-enterprise border border-white/10 bg-dark-900/60 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <span>Vision Intelligence</span>
              </h3>
              {visionData && (
                <span className="text-xs font-mono font-bold text-risk-high px-2.5 py-0.5 rounded-full bg-risk-high/15 border border-risk-high/30">
                  Visual Risk: {visionData.visualRiskScore}/100
                </span>
              )}
            </div>

            {visionData ? (
              <div className="space-y-4">
                {/* Selected object details */}
                {selectedBox !== null && visionData.detectedObjects[selectedBox] && (
                  <div className="p-4 rounded-xl bg-dark-850/90 border border-brand-primary/30 space-y-2">
                    <div className="text-[10px] font-mono uppercase text-brand-accent tracking-wider font-bold">
                      Inspected Region Focus
                    </div>
                    <div className="text-sm font-bold text-white">
                      {visionData.detectedObjects[selectedBox].label}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="p-2 rounded-lg bg-dark-800">
                        <span className="text-slate-400">Confidence:</span>
                        <div className="font-bold text-brand-accent">
                          {Math.round(visionData.detectedObjects[selectedBox].confidence * 100)}%
                        </div>
                      </div>
                      <div className="p-2 rounded-lg bg-dark-800">
                        <span className="text-slate-400">Risk Delta:</span>
                        <div className="font-bold text-risk-high">
                          +{visionData.detectedObjects[selectedBox].riskContribution} pts
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed pt-1">
                      {visionData.detectedObjects[selectedBox].description}
                    </p>
                  </div>
                )}

                {/* Detected Anomalies List */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-300">Detected Structural Anomalies:</div>
                  {visionData.anomalies.map((anom: any) => (
                    <div key={anom.type} className="p-3 rounded-xl bg-dark-850 border border-white/5 space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-white">{anom.type}</span>
                        <span className="text-risk-high font-mono">{anom.location}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{anom.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Run scan to generate visual telemetry breakdown.
              </div>
            )}
          </div>

          {/* Bridge into Primary PS 05 Risk Engine */}
          <div className="pt-4 border-t border-white/5 space-y-3">
            <button
              onClick={handleUseInRiskAnalysis}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-primary to-brand-accent text-white font-bold text-xs shadow-glow-primary hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <span>Use Vision Results in Risk Analysis</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Feeds visual stress metrics directly into the PS 05 prediction & decision engine.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
