import React, { useState } from 'react';
import type { BuildingFeatures, ModelType } from '../utils/mlEngine';
import { generateSensitivitySweep, FEATURE_METADATA } from '../utils/mlEngine';
import { BarChart3, TrendingUp, Info } from 'lucide-react';

interface DataChartsProps {
  features: BuildingFeatures;
  currentCoolingLoad: number;
  currentHeatingLoad: number;
  modelType: ModelType;
}

export const DataCharts: React.FC<DataChartsProps> = ({
  features,
  currentCoolingLoad,
  currentHeatingLoad,
  modelType,
}) => {
  const [activeTab, setActiveTab] = useState<'importance' | 'sensitivity' | 'balance'>('importance');
  const [sweepKey, setSweepKey] = useState<keyof BuildingFeatures>('glazingArea');
  const [hoveredSweepPoint, setHoveredSweepPoint] = useState<{ value: number; cooling: number } | null>(null);

  // Generate sweep points for selected parameter
  const sweepData = generateSensitivitySweep(features, sweepKey, 16, modelType);
  const sweepMeta = FEATURE_METADATA[sweepKey];

  // Feature Importance Data ranked descending
  const importanceData = [
    {
      code: 'X5',
      name: 'Overall Height',
      percent: 39.5,
      impact: 'Strongest driver. Governs multi-story stack effects and total volume heat gain.',
      color: '#0284c7',
    },
    {
      code: 'X7',
      name: 'Glazing Area Ratio',
      percent: 18.2,
      impact: 'Direct solar transmittance & SHGC heat penetration into conditioned zones.',
      color: '#0ea5e9',
    },
    {
      code: 'X1',
      name: 'Relative Compactness',
      percent: 15.8,
      impact: 'Surface area per unit volume. Less compact shapes expose more skin to ambient air.',
      color: '#38bdf8',
    },
    {
      code: 'X2',
      name: 'Surface Area',
      percent: 11.4,
      impact: 'Total exterior boundary conductive heat transfer.',
      color: '#60a5fa',
    },
    {
      code: 'X4',
      name: 'Roof Area',
      percent: 8.1,
      impact: 'Horizontal envelope receiving peak midday overhead solar radiation.',
      color: '#818cf8',
    },
    {
      code: 'X3',
      name: 'Wall Area',
      percent: 4.2,
      impact: 'Vertical opaque wall conduction based on U-value thermal resistance.',
      color: '#a78bfa',
    },
    {
      code: 'X8',
      name: 'Glazing Distribution',
      percent: 1.8,
      impact: 'Concentration of glazing on East/West vs shaded North elevations.',
      color: '#c084fc',
    },
    {
      code: 'X6',
      name: 'Orientation',
      percent: 1.0,
      impact: 'Facade facing azimuth relative to peak diurnal solar trajectory.',
      color: '#e879f9',
    },
  ];

  // Calculate SVG bounds for sensitivity chart
  const minSweepVal = sweepData[0]?.value ?? 0;
  const maxSweepVal = sweepData[sweepData.length - 1]?.value ?? 1;
  const minLoad = Math.min(...sweepData.map((d) => d.coolingLoad), currentCoolingLoad) - 1;
  const maxLoad = Math.max(...sweepData.map((d) => d.coolingLoad), currentCoolingLoad) + 1;

  const chartW = 500;
  const chartH = 220;
  const padL = 45;
  const padR = 25;
  const padT = 20;
  const padB = 35;

  const mapX = (val: number) => {
    return padL + ((val - minSweepVal) / (maxSweepVal - minSweepVal || 1)) * (chartW - padL - padR);
  };
  const mapY = (load: number) => {
    return chartH - padB - ((load - minLoad) / (maxLoad - minLoad || 1)) * (chartH - padT - padB);
  };

  const currentX = mapX(features[sweepKey]);
  const currentY = mapY(currentCoolingLoad);

  // SVG path for line
  const linePoints = sweepData.map((d) => `${mapX(d.value)},${mapY(d.coolingLoad)}`).join(' ');
  const areaPoints = `${mapX(minSweepVal)},${chartH - padB} ${linePoints} ${mapX(maxSweepVal)},${chartH - padB}`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 flex flex-col">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 mb-3">
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('importance')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'importance'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Feature Importance (MDI)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sensitivity')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'sensitivity'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sensitivity Sweep Curve
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('balance')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'balance'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cooling vs Heating Balance
          </button>
        </div>
      </div>

      {/* Tab 1: Feature Importance Bar Chart */}
      {activeTab === 'importance' && (
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-cyan-600" />
                Random Forest Feature Importance Breakdown
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Mean Decrease in Impurity (MDI) across 150 regression trees on 768 building geometries.
              </p>
            </div>
          </div>

          <div className="space-y-2 mt-2">
            {importanceData.map((item, idx) => (
              <div key={item.code} className="group relative">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-5 text-center font-mono font-semibold text-slate-400 text-[11px]">
                      #{idx + 1}
                    </span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                      {item.code}
                    </span>
                  </div>
                  <span className="font-semibold text-slate-700 font-mono">{item.percent.toFixed(1)}%</span>
                </div>
                {/* Bar */}
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${(item.percent / 42) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
                {/* Subtle tooltip text */}
                <p className="text-[11px] text-slate-400 group-hover:text-slate-600 transition-colors mt-0.5 pl-7">
                  {item.impact}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Parameter Sensitivity Sweep */}
      {activeTab === 'sensitivity' && (
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-600" />
                Continuous Parameter Response Curve
              </h4>
              <p className="text-xs text-slate-500">
                Sweeping {sweepMeta.label} ({sweepMeta.min} to {sweepMeta.max} {sweepMeta.unit}) while holding other parameters fixed.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label htmlFor="sweep-select" className="text-xs font-medium text-slate-600 whitespace-nowrap">
                Parameter:
              </label>
              <select
                id="sweep-select"
                value={sweepKey}
                onChange={(e) => setSweepKey(e.target.value as keyof BuildingFeatures)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="glazingArea">Glazing Area Ratio (X7)</option>
                <option value="relativeCompactness">Relative Compactness (X1)</option>
                <option value="overallHeight">Overall Height (X5)</option>
                <option value="surfaceArea">Surface Area (X2)</option>
                <option value="roofArea">Roof Area (X4)</option>
                <option value="wallArea">Wall Area (X3)</option>
                <option value="orientation">Orientation (X6)</option>
              </select>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full overflow-hidden bg-slate-50/60 rounded-xl p-2 border border-slate-100">
            <svg
              viewBox={`0 0 ${chartW} ${chartH}`}
              className="w-full h-[220px] overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0284c7" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#0284c7" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const yVal = minLoad + pct * (maxLoad - minLoad);
                const yPos = mapY(yVal);
                return (
                  <g key={pct}>
                    <line
                      x1={padL}
                      y1={yPos}
                      x2={chartW - padR}
                      y2={yPos}
                      stroke="#e2e8f0"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={padL - 8}
                      y={yPos + 4}
                      textAnchor="end"
                      fontSize="9"
                      fill="#94a3b8"
                      className="font-mono font-medium"
                    >
                      {yVal.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Area Fill */}
              <polygon points={areaPoints} fill="url(#areaGrad)" />

              {/* Line */}
              <polyline
                points={linePoints}
                fill="none"
                stroke="#0284c7"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data points */}
              {sweepData.map((pt, i) => (
                <circle
                  key={i}
                  cx={mapX(pt.value)}
                  cy={mapY(pt.coolingLoad)}
                  r="3"
                  fill="#ffffff"
                  stroke="#0284c7"
                  strokeWidth="2"
                  className="cursor-pointer hover:r-5 transition-all"
                  onMouseEnter={() => setHoveredSweepPoint({ value: pt.value, cooling: pt.coolingLoad })}
                  onMouseLeave={() => setHoveredSweepPoint(null)}
                />
              ))}

              {/* Current Active Parameter Marker */}
              <g>
                <line
                  x1={currentX}
                  y1={padT}
                  x2={currentX}
                  y2={chartH - padB}
                  stroke="#ef4444"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                />
                <circle
                  cx={currentX}
                  cy={currentY}
                  r="6"
                  fill="#ef4444"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                />
                <text
                  x={currentX}
                  y={padT - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#b91c1c"
                  fontWeight="bold"
                >
                  Current ({features[sweepKey]})
                </text>
              </g>

              {/* X-axis labels */}
              <text x={padL} y={chartH - 12} fontSize="9" fill="#64748b" textAnchor="start" className="font-mono">
                {minSweepVal} {sweepMeta.unit}
              </text>
              <text
                x={chartW - padR}
                y={chartH - 12}
                fontSize="9"
                fill="#64748b"
                textAnchor="end"
                className="font-mono"
              >
                {maxSweepVal} {sweepMeta.unit}
              </text>
              <text
                x={chartW / 2}
                y={chartH - 8}
                fontSize="10"
                fill="#475569"
                textAnchor="middle"
                fontWeight="600"
              >
                {sweepMeta.label} ({sweepMeta.unit})
              </text>
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredSweepPoint && (
              <div className="absolute top-3 right-3 bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-md">
                <div>
                  {sweepMeta.label}: <span className="font-mono font-semibold">{hoveredSweepPoint.value}</span>
                </div>
                <div>
                  Cooling Load: <span className="font-mono font-semibold text-cyan-300">{hoveredSweepPoint.cooling} kWh/m²</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Cooling vs Heating Balance */}
      {activeTab === 'balance' && (
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-slate-800">
              Dual Thermal Envelope Balance: Cooling (Summer) vs Heating (Winter)
            </h4>
            <p className="text-xs text-slate-500">
              The UCI Energy Efficiency dataset provides concurrent simulations for both sensible heating and cooling demand.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-900 mb-1">
                <span>❄️ Summer Cooling Load</span>
                <span className="font-mono text-base text-blue-700">{currentCoolingLoad.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-blue-700/80">kWh/m² sensible heat extraction required</p>
              <div className="w-full bg-blue-200/70 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentCoolingLoad / 48) * 100)}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200/70 rounded-xl">
              <div className="flex items-center justify-between text-xs font-semibold text-amber-900 mb-1">
                <span>🔥 Winter Heating Load</span>
                <span className="font-mono text-base text-amber-700">{currentHeatingLoad.toFixed(2)}</span>
              </div>
              <p className="text-[11px] text-amber-700/80">kWh/m² winter thermal addition required</p>
              <div className="w-full bg-amber-200/70 h-2 rounded-full mt-2.5 overflow-hidden">
                <div
                  className="bg-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (currentHeatingLoad / 45) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
            <Info className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-800">Architectural Trade-Off:</strong> Increasing window glazing area raises passive solar heat gain during winter (lowering heating load), but can significantly spike summer cooling demand if unprotected by exterior shading, overhangs, or low-E glass coatings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
