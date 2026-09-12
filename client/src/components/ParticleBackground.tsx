import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useLocationContext } from '../context/LocationContext';

/**
 * Maps each route to its specialized high-resolution photorealistic / 3D theme background.
 * Strictly preserves the Start Screen background (risklens_3d_spatial_mesh.jpg).
 */
const getBackgroundImage = (pathname: string, hasStarted: boolean): string => {
  // If user has not started yet or on explicit start/landing routes, preserve Start Screen mesh
  if (!hasStarted || pathname === '/landing' || pathname === '/start') {
    return '/images/risklens_3d_spatial_mesh.jpg';
  }

  const p = pathname.toLowerCase();

  // 1. Location Intelligence (Geospatial satellite telemetry & coordinate grids)
  if (p.includes('/location')) {
    return '/images/bg_location_satellite.jpg';
  }

  // 2. Predictions & Multi-Horizon Risk Forecasts (Atmospheric storm tracking & probabilistic trajectories)
  if (p.includes('/prediction')) {
    return '/images/bg_predictions_forecast.jpg';
  }

  // 3. Decision Center & Strategic Action Playbooks (Crisis command ops & infrastructure matrix)
  if (p.includes('/decision')) {
    return '/images/bg_decision_ops.jpg';
  }

  // 4. Computer Vision / Satellite Image Analysis (Aerial satellite flood detection & bounding scans)
  if (p.includes('/analysis/image') || p.includes('/image-analysis')) {
    return '/images/scenario_flood_city.jpg';
  }

  // 5. Risk Analysis & Neural Explainability (Command room analytical HUDs)
  if (p.includes('/analysis') || p.includes('/risk-analysis') || p.includes('/explainability')) {
    return '/images/risklens_3d_command_room.jpg';
  }

  // 6. AI Insights & Planetary Anomalies (Orbital earth telemetry & biosphere patterns)
  if (p.includes('/insight') || p.includes('/ai-insights')) {
    return '/images/sustainability_earth.jpg';
  }

  // 7. Scenario Simulator & Demo Sandbox (Clean energy resilience & simulation matrices)
  if (p.includes('/simulator') || p.includes('/scenario')) {
    return '/images/scenario_wind_turbines.jpg';
  }

  // 8. Historical Audit & Certified Export Dossiers (Topographic mountain baseline terrain)
  if (p.includes('/history') || p.includes('/report')) {
    return '/images/sidebar_mountains.jpg';
  }

  // 9. Enterprise Settings & API Configurations
  if (p.includes('/setting')) {
    return '/images/risklens_3d_command_room.jpg';
  }

  // 10. Default Overview / Live Telemetry Dashboard (Digital Earth Planetary Radar)
  return '/images/risklens_3d_earth_digital.jpg';
};

export const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const bgImageRef = useRef<HTMLDivElement | null>(null);
  const location = useLocation();
  const { hasStarted } = useLocationContext();

  const currentBgImage = getBackgroundImage(location.pathname, hasStarted);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // High-DPI screen support
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', handleResize);

    // 3D Mouse Parallax
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const normX = (e.clientX / width) * 2 - 1;
      const normY = (e.clientY / height) * 2 - 1;
      targetX = normX * 18; // Max tilt deg / px
      targetY = normY * 14;

      if (bgImageRef.current) {
        bgImageRef.current.style.transform = `scale(1.08) translate3d(${-normX * 22}px, ${-normY * 18}px, 0) rotateX(${normY * 3}deg) rotateY(${-normX * 4}deg)`;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    // 3D Spatial Particles Configuration
    const particleCount = Math.min(65, Math.max(30, Math.floor(width / 26)));
    const particles: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      radius: number;
      baseColor: string;
      glowColor: string;
      pulseSpeed: number;
      phase: number;
    }> = [];

    const colors = [
      { base: '#06B6D4', glow: 'rgba(6, 182, 212, 0.7)' },  // Neon Cyan
      { base: '#38BDF8', glow: 'rgba(56, 189, 248, 0.6)' },  // Sky Azure
      { base: '#10B981', glow: 'rgba(16, 185, 129, 0.65)' }, // Emerald
      { base: '#818CF8', glow: 'rgba(129, 140, 248, 0.5)' }, // Indigo
    ];

    for (let i = 0; i < particleCount; i++) {
      const c = colors[Math.floor(Math.random() * colors.length)];
      particles.push({
        x: (Math.random() - 0.5) * width * 1.3,
        y: (Math.random() - 0.5) * height * 1.3,
        z: Math.random() * 600 - 300,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2.2 + 1.2,
        baseColor: c.base,
        glowColor: c.glow,
        pulseSpeed: Math.random() * 0.025 + 0.015,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // 3D Camera Projection Math
    const focalLength = 650;
    const cameraZ = 550;
    let time = 0;
    let sweepAngle = 0;

    const render = () => {
      time += 0.015;
      sweepAngle += 0.008;

      // Smooth parallax interpolation
      currentX += (targetX - currentX) * 0.05;
      currentY += (targetY - currentY) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Camera rotation angles
      const rotY = (currentX / width) * 0.4;
      const rotX = -(currentY / height) * 0.35;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      // Project particles to 2D screen with 3D perspective
      const projected = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Bounding box bounce/wrap
        const boundX = width * 0.7;
        const boundY = height * 0.7;
        if (p.x < -boundX) p.x = boundX;
        if (p.x > boundX) p.x = -boundX;
        if (p.y < -boundY) p.y = boundY;
        if (p.y > boundY) p.y = -boundY;
        if (p.z < -300) p.z = 300;
        if (p.z > 300) p.z = -300;

        // 3D Rotation
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const totalZ = z2 + cameraZ;
        if (totalZ > 20) {
          const scale = focalLength / totalZ;
          const screenX = width / 2 + x1 * scale;
          const screenY = height / 2 + y2 * scale;
          projected.push({
            p,
            screenX,
            screenY,
            scale,
            depth: totalZ,
          });
        }
      }

      // Sort by depth (back to front)
      projected.sort((a, b) => b.depth - a.depth);

      // 1. Draw 3D Connection Lines between nearby spatial nodes
      for (let i = 0; i < projected.length; i++) {
        const pA = projected[i];
        for (let j = i + 1; j < projected.length; j++) {
          const pB = projected[j];

          const dx = pA.p.x - pB.p.x;
          const dy = pA.p.y - pB.p.y;
          const dz = pA.p.z - pB.p.z;
          const dist3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist3D < 190) {
            const alpha = ((190 - dist3D) / 190) * 0.28 * Math.min(pA.scale, pB.scale);
            ctx.beginPath();
            ctx.moveTo(pA.screenX, pA.screenY);
            ctx.lineTo(pB.screenX, pB.screenY);
            ctx.strokeStyle = pA.p.baseColor;
            ctx.globalAlpha = alpha;
            ctx.lineWidth = 1 * Math.min(pA.scale, 1.4);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // 2. Draw 3D Glowing Risk Nodes
      for (let i = 0; i < projected.length; i++) {
        const { p, screenX, screenY, scale, depth } = projected[i];
        const pulse = Math.sin(time * 2.5 + p.phase) * 0.35 + 0.65;
        const radius = p.radius * scale * pulse;
        const alpha = Math.max(0.2, Math.min(0.9, (900 - depth) / 650));

        // Outer Neon Glow
        const glowRad = radius * 3.8;
        const glowGrad = ctx.createRadialGradient(
          screenX,
          screenY,
          0,
          screenX,
          screenY,
          glowRad
        );
        glowGrad.addColorStop(0, p.glowColor);
        glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.arc(screenX, screenY, glowRad, 0, Math.PI * 2);
        ctx.fillStyle = glowGrad;
        ctx.globalAlpha = alpha * 0.85;
        ctx.fill();

        // Core Sparkle
        ctx.beginPath();
        ctx.arc(screenX, screenY, radius, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // 3. Subtle Holographic Radar Sweep Line
      const sweepX = (Math.sin(sweepAngle) * 0.5 + 0.5) * width;
      const sweepGrad = ctx.createLinearGradient(sweepX - 120, 0, sweepX + 120, 0);
      sweepGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      sweepGrad.addColorStop(0.5, 'rgba(6, 182, 212, 0.05)');
      sweepGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');
      ctx.fillStyle = sweepGrad;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#030914]">
      {/* Layer 1: High-Res Real Background Image with Dynamic Per-Page Routing & 3D Parallax */}
      <div
        ref={bgImageRef}
        key={currentBgImage}
        className="absolute -inset-10 bg-cover bg-center bg-no-repeat transition-all duration-700 ease-out will-change-transform opacity-85"
        style={{
          backgroundImage: `url(${currentBgImage})`,
          filter: 'brightness(0.95) contrast(1.2) saturate(1.25)',
        }}
      />

      {/* Layer 2: Ambient Glowing Nebula Orbs for Depth */}
      <div className="absolute top-1/4 left-1/4 w-[550px] h-[550px] rounded-full bg-cyan-500/15 blur-[130px] pointer-events-none animate-pulse duration-[8000ms]" />
      <div className="absolute bottom-1/3 right-1/4 w-[650px] h-[650px] rounded-full bg-blue-600/15 blur-[150px] pointer-events-none animate-pulse duration-[10000ms]" />
      <div className="absolute top-2/3 left-1/3 w-[450px] h-[450px] rounded-full bg-emerald-500/10 blur-[110px] pointer-events-none" />

      {/* Layer 3: Interactive 3D Holographic Particle & Constellation Depth Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Layer 4: Soft Frosted Dark Glass Vignette (Permits rich real background image to shine through cleanly) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#06111F]/50 via-[#040C18]/30 to-[#030914]/80 pointer-events-none" />
    </div>
  );
};
