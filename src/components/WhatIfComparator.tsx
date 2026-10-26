import React, { useState } from 'react';
import type { BuildingFeatures, PredictionResult } from '../utils/mlEngine';
import { Bookmark, ArrowRight, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';

interface WhatIfComparatorProps {
  currentFeatures: BuildingFeatures;
  currentPrediction: PredictionResult;
  onApplyPreset: (features: BuildingFeatures) => void;
}

export const WhatIfComparator: React.FC<WhatIfComparatorProps> = ({
  currentFeatures,
  currentPrediction,
  onApplyPreset,
}) => {
  const [baselineFeatures, setBaselineFeatures] = useState<BuildingFeatures | null>(null);
  const [baselinePrediction, setBaselinePrediction] = useState<PredictionResult | null>(null);

  const handlePinBaseline = () => {
    setBaselineFeatures({ ...currentFeatures });
    setBaselinePrediction({ ...currentPrediction });
  };

  const handleResetBaseline = () => {
    setBaselineFeatures(null);
    setBaselinePrediction(null);
  };

  // Compute differences if baseline exists
  let deltaCooling = 0;
  let deltaPct = 0;
  let deltaTons = 0;
  let deltaAnnualKwh = 0;
  let deltaAnnualCost = 0; // assuming $0.14 per kWh electric cooling
  let deltaCarbonKg = 0;

  if (baselinePrediction) {
    deltaCooling = currentPrediction.coolingLoad - baselinePrediction.coolingLoad;
    deltaPct = ((currentPrediction.coolingLoad - baselinePrediction.coolingLoad) / baselinePrediction.coolingLoad) * 100;
    deltaTons = currentPrediction.chillerTons - baselinePrediction.chillerTons;
    deltaAnnualKwh = currentPrediction.annualCoolingKwh - baselinePrediction.annualCoolingKwh;
    deltaAnnualCost = deltaAnnualKwh * 0.14;
    deltaCarbonKg = currentPrediction.annualCarbonKg - baselinePrediction.annualCarbonKg;
  }

  // Generate architectural optimization recommendations
  const recommendations: string[] = [];
  if (currentFeatures.glazingArea > 0.25) {
    recommendations.push(
      'Window-to-envelope ratio is high (>25%). Installing exterior automated louver shading or dynamic electrochromic glass can cut summer peak load by up to 18%.'
    );
  }
  if (currentFeatures.orientation === 5 && currentFeatures.glazingArea > 0.15) {
    recommendations.push(
      'West-facing orientation receives peak late-afternoon solar irradiation at max ambient outdoor temperatures. Consider vertical architectural fins or shifting fenestration toward North.'
    );
  }
  if (currentFeatures.relativeCompactness < 0.70) {
    recommendations.push(
      'Low compactness index indicates a sprawling building footprint with high surface-to-volume ratio. Enhancing envelope R-values (wall & roof insulation) will reduce conductive heat migration.'
    );
  }
  if (currentFeatures.overallHeight > 4.0 && currentFeatures.glazingArea > 0.20) {
    recommendations.push(
      'Two-story envelope experiences thermal buoyancy and stack effect. Incorporating floor-to-floor thermal breaks and high-performance Low-E double glazing stabilizes multi-zone cooling.'
    );
  }
  if (recommendations.length === 0) {
    recommendations.push(
      'Current building geometry exhibits well-balanced thermal mass and passive orientation. This design qualifies for high-efficiency green building certifications.'
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-800 text-sm flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-cyan-600" />
            What-If Scenario & Architectural Optimization
          </h3>
          <p className="text-xs text-slate-500">
            Pin your current building geometry as a baseline, test modifications, and track efficiency gains.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!baselineFeatures ? (
            <button
              type="button"
              onClick={handlePinBaseline}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-semibold hover:bg-cyan-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              Pin Current as Baseline
            </button>
          ) : (
            <button
              type="button"
              onClick={handleResetBaseline}
              className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Baseline
            </button>
          )}
        </div>
      </div>

      {/* Comparison Delta Cards */}
      {baselinePrediction ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className={`p-3 rounded-xl border ${deltaCooling <= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
              <div className="text-[11px] font-medium text-slate-600">Cooling Load Delta</div>
              <div className={`text-lg font-bold font-mono ${deltaCooling <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {deltaCooling > 0 ? `+${deltaCooling.toFixed(2)}` : deltaCooling.toFixed(2)}
                <span className="text-xs font-normal ml-1">kWh/m²</span>
              </div>
              <div className={`text-[11px] font-semibold ${deltaCooling <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {deltaPct > 0 ? `+${deltaPct.toFixed(1)}%` : `${deltaPct.toFixed(1)}%`}
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${deltaTons <= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
              <div className="text-[11px] font-medium text-slate-600">HVAC Chiller Size</div>
              <div className={`text-lg font-bold font-mono ${deltaTons <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {deltaTons > 0 ? `+${deltaTons.toFixed(1)}` : deltaTons.toFixed(1)}
                <span className="text-xs font-normal ml-1">Tons (TR)</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Current: {currentPrediction.chillerTons} TR
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${deltaAnnualCost <= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
              <div className="text-[11px] font-medium text-slate-600">Annual Electric Cost</div>
              <div className={`text-lg font-bold font-mono ${deltaAnnualCost <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {deltaAnnualCost <= 0 ? `-$${Math.abs(Math.round(deltaAnnualCost))}` : `+$${Math.round(deltaAnnualCost)}`}
                <span className="text-xs font-normal ml-1">/yr</span>
              </div>
              <div className="text-[11px] text-slate-500">
                {Math.abs(deltaAnnualKwh).toLocaleString()} kWh/yr
              </div>
            </div>

            <div className={`p-3 rounded-xl border ${deltaCarbonKg <= 0 ? 'bg-emerald-50/70 border-emerald-200' : 'bg-rose-50/70 border-rose-200'}`}>
              <div className="text-[11px] font-medium text-slate-600">Carbon Footprint</div>
              <div className={`text-lg font-bold font-mono ${deltaCarbonKg <= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {deltaCarbonKg <= 0 ? `-${Math.abs(Math.round(deltaCarbonKg))}` : `+${Math.round(deltaCarbonKg)}`}
                <span className="text-xs font-normal ml-1">kg CO2e</span>
              </div>
              <div className="text-[11px] text-slate-500">
                Scope 2 emissions
              </div>
            </div>
          </div>

          {/* Quick Side-by-Side Spec Comparison */}
          <div className="border border-slate-200/80 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 font-medium">
                <tr>
                  <th className="py-2 px-3">Parameter</th>
                  <th className="py-2 px-3">Baseline</th>
                  <th className="py-2 px-3">Active Design</th>
                  <th className="py-2 px-3">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="py-2 px-3 font-medium">Glazing Area</td>
                  <td className="py-2 px-3 font-mono">{((baselineFeatures?.glazingArea ?? 0) * 100).toFixed(0)}%</td>
                  <td className="py-2 px-3 font-mono font-semibold text-cyan-700">{(currentFeatures.glazingArea * 100).toFixed(0)}%</td>
                  <td className="py-2 px-3 font-mono text-slate-500">{((currentFeatures.glazingArea - (baselineFeatures?.glazingArea ?? 0)) * 100).toFixed(0)}%</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Overall Height</td>
                  <td className="py-2 px-3 font-mono">{baselineFeatures?.overallHeight}m</td>
                  <td className="py-2 px-3 font-mono font-semibold text-cyan-700">{currentFeatures.overallHeight}m</td>
                  <td className="py-2 px-3 font-mono text-slate-500">{(currentFeatures.overallHeight - (baselineFeatures?.overallHeight ?? 0)).toFixed(1)}m</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-medium">Cooling Load</td>
                  <td className="py-2 px-3 font-mono font-semibold text-slate-800">{baselinePrediction.coolingLoad.toFixed(2)} kWh/m²</td>
                  <td className="py-2 px-3 font-mono font-bold text-cyan-700">{currentPrediction.coolingLoad.toFixed(2)} kWh/m²</td>
                  <td className={`py-2 px-3 font-mono font-bold ${deltaCooling <= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {deltaCooling > 0 ? `+${deltaCooling.toFixed(2)}` : deltaCooling.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-slate-50/80 border border-dashed border-slate-200 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-600">
            Click <strong>"Pin Current as Baseline"</strong> above to lock in your building geometry. As you tweak parameters, see instant live cost, tonnage, and cooling load deltas!
          </p>
        </div>
      )}

      {/* AI Architectural Insights */}
      <div className="bg-gradient-to-br from-cyan-50/60 to-blue-50/60 rounded-xl p-3.5 border border-cyan-100/80">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-900 mb-2">
          <Sparkles className="w-4 h-4 text-cyan-600" />
          <span>Architectural Passive Cooling Recommendations</span>
        </div>
        <ul className="space-y-1.5 text-xs text-slate-700">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 shrink-0 mt-1.5" />
              <span>{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
