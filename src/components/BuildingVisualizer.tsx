import React, { useEffect, useRef, useState } from 'react';
import type { BuildingFeatures } from '../utils/mlEngine';
import { Compass, RotateCw, Sun, Eye, Layers } from 'lucide-react';

interface BuildingVisualizerProps {
  features: BuildingFeatures;
  coolingLoad: number;
}

export const BuildingVisualizer: React.FC<BuildingVisualizerProps> = ({
  features,
  coolingLoad,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [rotationAngle, setRotationAngle] = useState(35); // degrees
  const [isAutoRotating, setIsAutoRotating] = useState(false);
  const [showSunRay, setShowSunRay] = useState(true);
  const [wireframeMode, setWireframeMode] = useState(false);

  // Auto-rotation animation loop
  useEffect(() => {
    if (!isAutoRotating) return;
    const interval = setInterval(() => {
      setRotationAngle((prev) => (prev + 0.8) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, [isAutoRotating]);

  // Canvas drawing effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Thermal color scale based on cooling load (10 to 45 kWh/m²)
    // Low load (<=16): cool cyan/teal (#0d9488)
    // Moderate (16-28): sky/blue (#0284c7)
    // Elevated (28-36): amber/orange (#f59e0b)
    // High (>36): intense crimson (#e11d48)
    const normalizedHeat = Math.min(1.0, Math.max(0, (coolingLoad - 11) / 34));
    
    // Draw subtle architectural ground grid
    const centerX = width / 2;
    const centerY = height / 2 + 50;

    // Draw grid
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1;
    const gridSize = 160;
    const gridStep = 25;
    for (let x = -gridSize; x <= gridSize; x += gridStep) {
      const p1 = projectIso(x, -gridSize, 0, rotationAngle, centerX, centerY);
      const p2 = projectIso(x, gridSize, 0, rotationAngle, centerX, centerY);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    for (let y = -gridSize; y <= gridSize; y += gridStep) {
      const p1 = projectIso(-gridSize, y, 0, rotationAngle, centerX, centerY);
      const p2 = projectIso(gridSize, y, 0, rotationAngle, centerX, centerY);
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
    ctx.restore();

    // Geometric dimensions derived from parameters
    // Height: 3.5m -> 50px, 7.0m -> 100px
    const bHeight = (features.overallHeight / 3.5) * 55;
    // Base footprint influenced by compactness (higher compactness = squarer, lower = more elongated)
    const footprintRatio = 0.5 + (0.98 - features.relativeCompactness) * 1.8;
    const bWidth = 75 * (1 / Math.sqrt(footprintRatio));
    const bDepth = 75 * Math.sqrt(footprintRatio);

    // 8 Vertices of the 3D building box
    const hw = bWidth / 2;
    const hd = bDepth / 2;

    const v0 = projectIso(-hw, -hd, 0, rotationAngle, centerX, centerY); // bottom-back-left
    const v1 = projectIso(hw, -hd, 0, rotationAngle, centerX, centerY);  // bottom-back-right
    const v2 = projectIso(hw, hd, 0, rotationAngle, centerX, centerY);   // bottom-front-right
    const v3 = projectIso(-hw, hd, 0, rotationAngle, centerX, centerY);  // bottom-front-left

    const v4 = projectIso(-hw, -hd, bHeight, rotationAngle, centerX, centerY); // top-back-left
    const v5 = projectIso(hw, -hd, bHeight, rotationAngle, centerX, centerY);  // top-back-right
    const v6 = projectIso(hw, hd, bHeight, rotationAngle, centerX, centerY);   // top-front-right
    const v7 = projectIso(-hw, hd, bHeight, rotationAngle, centerX, centerY);  // top-front-left

    // Sun & Solar Angle Calculation
    // Orientation: 2: North (0°), 3: East (90°), 4: South (180°), 5: West (270°)
    const orientAngles: Record<number, number> = { 2: 0, 3: 90, 4: 180, 5: 270 };
    const sunRad = ((orientAngles[features.orientation] || 90) * Math.PI) / 180;
    const sunDist = 180;
    const sunX = Math.cos(sunRad) * sunDist;
    const sunY = Math.sin(sunRad) * sunDist;
    const sunPos = projectIso(sunX, sunY, bHeight + 90, rotationAngle, centerX, centerY);

    // Draw Sun Ray if enabled
    if (showSunRay) {
      ctx.save();
      // Sun sphere
      const sunGrad = ctx.createRadialGradient(sunPos.x, sunPos.y, 4, sunPos.x, sunPos.y, 24);
      sunGrad.addColorStop(0, '#fef08a');
      sunGrad.addColorStop(0.5, '#f59e0b');
      sunGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.fillStyle = sunGrad;
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, 24, 0, Math.PI * 2);
      ctx.fill();

      // Sun core
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(sunPos.x, sunPos.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Solar ray toward roof
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(sunPos.x, sunPos.y);
      ctx.lineTo(v6.x, v6.y);
      ctx.stroke();
      ctx.restore();
    }

    // Colors
    // Facade colors blended with thermal heat
    const baseWallR = Math.round(230 + normalizedHeat * 25);
    const baseWallG = Math.round(235 - normalizedHeat * 120);
    const baseWallB = Math.round(245 - normalizedHeat * 150);

    const roofColor = `rgb(${Math.round(210 + normalizedHeat * 40)}, ${Math.round(220 - normalizedHeat * 110)}, ${Math.round(235 - normalizedHeat * 140)})`;
    const frontWallColor = `rgb(${baseWallR}, ${baseWallG}, ${baseWallB})`;
    const rightWallColor = `rgb(${Math.round(baseWallR * 0.88)}, ${Math.round(baseWallG * 0.88)}, ${Math.round(baseWallB * 0.88)})`;
    const strokeColor = wireframeMode ? '#0284c7' : '#94a3b8';

    // Draw South / Front face (v3 -> v2 -> v6 -> v7)
    drawQuad(ctx, v3, v2, v6, v7, wireframeMode ? 'rgba(255,255,255,0.2)' : frontWallColor, strokeColor);

    // Draw East / Right face (v2 -> v1 -> v5 -> v6)
    drawQuad(ctx, v2, v1, v5, v6, wireframeMode ? 'rgba(255,255,255,0.2)' : rightWallColor, strokeColor);

    // Draw Roof face (v7 -> v6 -> v5 -> v4)
    drawQuad(ctx, v7, v6, v5, v4, wireframeMode ? 'rgba(255,255,255,0.3)' : roofColor, strokeColor);

    // Draw Floor divider line for 2-story buildings
    if (features.overallHeight > 4.0 && !wireframeMode) {
      const midLeft = projectIso(-hw, hd, bHeight / 2, rotationAngle, centerX, centerY);
      const midCenter = projectIso(hw, hd, bHeight / 2, rotationAngle, centerX, centerY);
      const midRight = projectIso(hw, -hd, bHeight / 2, rotationAngle, centerX, centerY);

      ctx.save();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(midLeft.x, midLeft.y);
      ctx.lineTo(midCenter.x, midCenter.y);
      ctx.lineTo(midRight.x, midRight.y);
      ctx.stroke();
      ctx.restore();
    }

    // Draw Windows based on glazing area and distribution
    if (features.glazingArea > 0 && !wireframeMode) {
      drawGlazingWindows(
        ctx,
        features,
        hw,
        hd,
        bHeight,
        rotationAngle,
        centerX,
        centerY,
        normalizedHeat
      );
    }

    // Compass Rose in bottom left
    drawCompass(ctx, 50, height - 50, rotationAngle, features.orientation);
  }, [features, coolingLoad, rotationAngle, showSunRay, wireframeMode]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 relative overflow-hidden flex flex-col">
      {/* Header controls bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <h3 className="font-semibold text-slate-800 text-sm tracking-tight">
            3D Building Envelope & Thermal Geometry
          </h3>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsAutoRotating(!isAutoRotating)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              isAutoRotating
                ? 'bg-cyan-100 text-cyan-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Auto-rotate 3D model"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Rotate</span>
          </button>
          <button
            type="button"
            onClick={() => setShowSunRay(!showSunRay)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              showSunRay
                ? 'bg-amber-100 text-amber-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Toggle Solar Radiation Vector"
          >
            <Sun className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sun</span>
          </button>
          <button
            type="button"
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
              wireframeMode
                ? 'bg-indigo-100 text-indigo-800'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            title="Wireframe view"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Wireframe</span>
          </button>
        </div>
      </div>

      {/* Isometric Canvas */}
      <div className="relative w-full flex items-center justify-center bg-gradient-to-b from-slate-50/70 to-slate-100/50 rounded-xl overflow-hidden border border-slate-100">
        <canvas
          ref={canvasRef}
          width={520}
          height={320}
          className="w-full max-w-[520px] h-[280px] sm:h-[320px] cursor-grab active:cursor-grabbing"
          onMouseDown={(e) => {
            const startX = e.clientX;
            const startAngle = rotationAngle;
            const onMouseMove = (moveEvent: MouseEvent) => {
              const deltaX = moveEvent.clientX - startX;
              setRotationAngle((startAngle + deltaX * 0.5 + 360) % 360);
            };
            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };
            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}
        />

        {/* Floating Quick Stats Overlay */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-xs text-xs text-slate-600 space-y-0.5 pointer-events-none">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Height:</span>
            <span>{features.overallHeight}m ({features.overallHeight > 4 ? '2 Floors' : '1 Floor'})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Glazing:</span>
            <span>{(features.glazingArea * 100).toFixed(0)}% Area</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-700">Envelope:</span>
            <span>{features.surfaceArea} m²</span>
          </div>
        </div>

        {/* Thermal Intensity Legend */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200/60 shadow-xs text-[11px] text-slate-600 pointer-events-none">
          <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
            Thermal Heat Gain
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-teal-600 font-medium">Low</span>
            <div className="w-20 h-2 rounded-full bg-gradient-to-r from-teal-400 via-amber-400 to-rose-500" />
            <span className="text-rose-600 font-medium">High</span>
          </div>
        </div>
      </div>

      {/* Manual Rotation Slider */}
      <div className="mt-3 flex items-center gap-3 px-1 text-xs text-slate-500">
        <span className="whitespace-nowrap font-medium text-slate-600">Rotate View:</span>
        <input
          type="range"
          min="0"
          max="360"
          value={Math.round(rotationAngle)}
          onChange={(e) => setRotationAngle(Number(e.target.value))}
          className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          aria-label="Rotate building view angle"
        />
        <span className="w-9 text-right font-mono text-[11px] text-slate-600">{Math.round(rotationAngle)}°</span>
      </div>
    </div>
  );
};

// Isometric projection helper
function projectIso(
  x: number,
  y: number,
  z: number,
  angleDeg: number,
  centerX: number,
  centerY: number
) {
  const rad = (angleDeg * Math.PI) / 180;
  // Rotate around Z-axis
  const rx = x * Math.cos(rad) - y * Math.sin(rad);
  const ry = x * Math.sin(rad) + y * Math.cos(rad);

  // 2:1 isometric projection angle
  const isoX = (rx - ry) * Math.cos(Math.PI / 6);
  const isoY = (rx + ry) * Math.sin(Math.PI / 6) - z;

  return {
    x: centerX + isoX,
    y: centerY + isoY,
  };
}

// Draw Quad Face
function drawQuad(
  ctx: CanvasRenderingContext2D,
  p1: { x: number; y: number },
  p2: { x: number; y: number },
  p3: { x: number; y: number },
  p4: { x: number; y: number },
  fillStyle: string,
  strokeStyle: string
) {
  ctx.save();
  ctx.fillStyle = fillStyle;
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.lineTo(p3.x, p3.y);
  ctx.lineTo(p4.x, p4.y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

// Draw Glazing Window Fenestration
function drawGlazingWindows(
  ctx: CanvasRenderingContext2D,
  features: BuildingFeatures,
  hw: number,
  hd: number,
  bHeight: number,
  rotationAngle: number,
  centerX: number,
  centerY: number,
  normalizedHeat: number
) {
  const numFloors = features.overallHeight > 4.0 ? 2 : 1;
  const numPanels = Math.max(2, Math.round(features.glazingArea * 12));

  // Glazing tint: reflective blue-cyan or warm glare depending on thermal load
  const glassFill = `rgba(${Math.round(56 + normalizedHeat * 180)}, ${Math.round(189 - normalizedHeat * 60)}, ${Math.round(248 - normalizedHeat * 120)}, 0.65)`;
  const glassBorder = `rgba(${Math.round(2 + normalizedHeat * 150)}, ${Math.round(132 - normalizedHeat * 40)}, ${Math.round(199 - normalizedHeat * 100)}, 0.8)`;

  // Draw on front face (South)
  for (let floor = 0; floor < numFloors; floor++) {
    const floorZ = (floor * bHeight) / numFloors + 8;
    const windowH = (bHeight / numFloors) * (0.35 + features.glazingArea * 0.7);

    for (let p = 0; p < numPanels; p++) {
      const segWidth = (hw * 1.7) / numPanels;
      const xStart = -hw * 0.85 + p * segWidth + 2;
      const xEnd = xStart + segWidth - 4;

      const wp1 = projectIso(xStart, hd + 0.5, floorZ, rotationAngle, centerX, centerY);
      const wp2 = projectIso(xEnd, hd + 0.5, floorZ, rotationAngle, centerX, centerY);
      const wp3 = projectIso(xEnd, hd + 0.5, floorZ + windowH, rotationAngle, centerX, centerY);
      const wp4 = projectIso(xStart, hd + 0.5, floorZ + windowH, rotationAngle, centerX, centerY);

      drawQuad(ctx, wp1, wp2, wp3, wp4, glassFill, glassBorder);
    }
  }

  // Draw on right face (East)
  for (let floor = 0; floor < numFloors; floor++) {
    const floorZ = (floor * bHeight) / numFloors + 8;
    const windowH = (bHeight / numFloors) * (0.35 + features.glazingArea * 0.7);

    for (let p = 0; p < numPanels; p++) {
      const segDepth = (hd * 1.7) / numPanels;
      const yStart = hd * 0.85 - p * segDepth - 2;
      const yEnd = yStart - segDepth + 4;

      const wp1 = projectIso(hw + 0.5, yStart, floorZ, rotationAngle, centerX, centerY);
      const wp2 = projectIso(hw + 0.5, yEnd, floorZ, rotationAngle, centerX, centerY);
      const wp3 = projectIso(hw + 0.5, yEnd, floorZ + windowH, rotationAngle, centerX, centerY);
      const wp4 = projectIso(hw + 0.5, yStart, floorZ + windowH, rotationAngle, centerX, centerY);

      drawQuad(ctx, wp1, wp2, wp3, wp4, glassFill, glassBorder);
    }
  }
}

// Compass Indicator in Canvas
function drawCompass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rotationAngle: number,
  buildingOrient: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Background disk
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Rotation applied
  ctx.rotate((-rotationAngle * Math.PI) / 180);

  // North arrow
  ctx.fillStyle = '#ef4444';
  ctx.beginPath();
  ctx.moveTo(0, -18);
  ctx.lineTo(4, 0);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  ctx.fill();

  // South arrow
  ctx.fillStyle = '#64748b';
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(4, 0);
  ctx.lineTo(-4, 0);
  ctx.closePath();
  ctx.fill();

  // Labels
  ctx.font = 'bold 9px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#b91c1c';
  ctx.fillText('N', 0, -10);

  ctx.restore();
}
