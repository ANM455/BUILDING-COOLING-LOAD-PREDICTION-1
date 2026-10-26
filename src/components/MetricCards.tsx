import React from 'react';
import type { PredictionResult } from '../utils/mlEngine';
import { Snowflake, Flame, Cpu, Gauge, Zap, ShieldCheck } from 'lucide-react';

interface MetricCardsProps {
  prediction: PredictionResult;
}

export const MetricCards: React.FC<MetricCardsProps> = ({ prediction }) => {
  const {
    coolingLoad,
    heatingLoad,
    chillerTons,
    peakCoolingKw,
    annualCoolingKwh,
    annualCarbonKg,
    estimatedFloorArea,
    energyClass,
    modelConfidence,
  } = prediction;

  // Baseline comparison (dataset average cooling load is ~24.6 kWh/m²)
  const deltaVsAvg = coolingLoad - 24.58;
  const deltaPct = (deltaVsAvg / 24.58) * 100;

  return (
    <div className="space-y-3">
      {/* Primary Hero Result Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 rounded-2xl p-5 text-white shadow-md relative overflow-hidden border border-slate-700/60">
        {/* Background glow decoration */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-300 text-xs font-semibold uppercase tracking-wider mb-1">
              <Snowflake className="w-4 h-4 animate-spin-slow" />
              <span>Predicted Building Cooling Load (Y2)</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold tracking-tight font-mono text-white">
                {coolingLoad.toFixed(2)}
              </span>
              <span className="text-lg text-cyan-200/80 font-medium">kWh/m²</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-xs">
              <span
                className={`font-semibold px-2 py-0.5 rounded-full ${
                  deltaVsAvg <= 0
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                }`}
              >
                {deltaVsAvg <= 0 ? `${deltaPct.toFixed(1)}%` : `+${deltaPct.toFixed(1)}%`} vs average
              </span>
              <span className="text-slate-400">
                UCI dataset baseline: 24.6 kWh/m²
              </span>
            </div>
          </div>

          {/* Energy Rating Badge */}
          <div className="flex flex-col sm:items-end">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              ASHRAE Thermal Rating
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <span className="text-2xl font-black font-mono text-cyan-300">
                {energyClass.grade}
              </span>
              <div className="text-left">
                <div className="font-semibold text-xs text-white">{energyClass.label}</div>
                <div className="text-[10px] text-slate-300 max-w-[150px] leading-tight">
                  {energyClass.grade === 'A+' || energyClass.grade === 'A'
                    ? 'Net-Zero Ready / Low Gain'
                    : energyClass.grade === 'B'
                    ? 'Standard Code Compliance'
                    : 'High Heat Penetration'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linear Thermal Meter Bar */}
        <div className="mt-4 pt-3 border-t border-slate-700/60 relative z-10">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
            <span>10 kWh/m² (Ultra Low)</span>
            <span className="text-cyan-300 font-semibold">{coolingLoad.toFixed(2)} kWh/m²</span>
            <span>48 kWh/m² (Extreme)</span>
          </div>
          <div className="w-full h-2.5 bg-slate-700/70 rounded-full overflow-hidden p-0.5 border border-slate-600/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 via-cyan-400 via-amber-400 to-rose-500 transition-all duration-700 ease-out"
              style={{
                width: `${Math.min(100, Math.max(0, ((coolingLoad - 10) / 38) * 100))}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid of Secondary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Metric 1: HVAC Chiller Capacity */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Chiller Capacity</span>
            <Cpu className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-800">
            {chillerTons.toFixed(1)} <span className="text-xs font-normal text-slate-500">TR</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {peakCoolingKw.toFixed(1)} kW Peak Load
          </div>
        </div>

        {/* Metric 2: Estimated Floor Area */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Conditioned Floor</span>
            <Gauge className="w-3.5 h-3.5 text-cyan-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-800">
            {estimatedFloorArea} <span className="text-xs font-normal text-slate-500">m²</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Internal footprint
          </div>
        </div>

        {/* Metric 3: Winter Heating Load */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Heating Load (Y1)</span>
            <Flame className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-800">
            {heatingLoad.toFixed(2)} <span className="text-xs font-normal text-slate-500">kWh/m²</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Winter thermal need
          </div>
        </div>

        {/* Metric 4: Annual Carbon */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-3.5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-medium">Annual Carbon</span>
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold font-mono text-slate-800">
            {annualCarbonKg.toLocaleString()} <span className="text-xs font-normal text-slate-500">kg</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {Math.round(annualCoolingKwh).toLocaleString()} kWh/yr cooling
          </div>
        </div>
      </div>
    </div>
  );
};
