import React from 'react';
import type { BuildingFeatures, ModelType } from '../utils/mlEngine';
import {
  FEATURE_METADATA,
  ORIENTATION_OPTIONS,
  GLAZING_DIST_OPTIONS,
  BUILDING_PRESETS,
} from '../utils/mlEngine';
import { Sliders, Sparkles, Building2, HelpCircle } from 'lucide-react';

interface InputControlsProps {
  features: BuildingFeatures;
  onChange: (updated: BuildingFeatures) => void;
  modelType: ModelType;
  onModelChange: (model: ModelType) => void;
  onPredict: () => void;
  isPredicting: boolean;
}

export const InputControls: React.FC<InputControlsProps> = ({
  features,
  onChange,
  modelType,
  onModelChange,
  onPredict,
  isPredicting,
}) => {
  const updateField = (key: keyof BuildingFeatures, value: number) => {
    onChange({
      ...features,
      [key]: value,
    });
  };

  const handlePresetSelect = (presetId: string) => {
    const found = BUILDING_PRESETS.find((p) => p.id === presetId);
    if (found) {
      onChange({ ...found.features });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 sm:p-5 flex flex-col space-y-5">
      {/* Top Header & Presets */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-cyan-50 text-cyan-700">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-800 text-sm">
              Architectural & Envelope Parameters
            </h2>
            <p className="text-xs text-slate-500">
              Tune building geometry and fenestration or load a standard archetype
            </p>
          </div>
        </div>

        {/* Presets dropdown */}
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
          <label htmlFor="preset-select" className="sr-only">Load Architectural Preset</label>
          <select
            id="preset-select"
            onChange={(e) => handlePresetSelect(e.target.value)}
            defaultValue=""
            className="text-xs font-medium border border-slate-200 rounded-xl px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            <option value="" disabled>
              📐 Load Archetype Preset...
            </option>
            {BUILDING_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Model Selection Tabs */}
      <div>
        <label className="text-xs font-semibold text-slate-600 block mb-1.5 uppercase tracking-wider text-[11px]">
          ML Regression Algorithm
        </label>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onModelChange('random_forest')}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex flex-col ${
              modelType === 'random_forest'
                ? 'bg-cyan-50/80 border-cyan-400 text-cyan-900 shadow-xs'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="font-semibold flex items-center justify-between">
              Random Forest
              <span className="text-[10px] bg-cyan-200/70 text-cyan-800 px-1.5 py-0.2 rounded font-mono">
                R² 0.98
              </span>
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">150 decision trees</span>
          </button>

          <button
            type="button"
            onClick={() => onModelChange('gradient_boosting')}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex flex-col ${
              modelType === 'gradient_boosting'
                ? 'bg-cyan-50/80 border-cyan-400 text-cyan-900 shadow-xs'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="font-semibold flex items-center justify-between">
              Gradient Boost
              <span className="text-[10px] bg-cyan-200/70 text-cyan-800 px-1.5 py-0.2 rounded font-mono">
                R² 0.98
              </span>
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">Shrinkage rate η=0.1</span>
          </button>

          <button
            type="button"
            onClick={() => onModelChange('ridge_regression')}
            className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all text-left flex flex-col ${
              modelType === 'ridge_regression'
                ? 'bg-cyan-50/80 border-cyan-400 text-cyan-900 shadow-xs'
                : 'border-slate-200 text-slate-600 hover:border-slate-300'
            }`}
          >
            <span className="font-semibold flex items-center justify-between">
              Ridge Linear
              <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded font-mono">
                R² 0.91
              </span>
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">L2 regularized baseline</span>
          </button>
        </div>
      </div>

      {/* Grid of Sliders and Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 pt-1">
        {/* X1: Relative Compactness */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-rc" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Relative Compactness (X1)</span>
              <span className="text-[10px] font-mono text-cyan-700 font-normal">[ratio]</span>
            </label>
            <input
              id="input-rc"
              type="number"
              min={FEATURE_METADATA.relativeCompactness.min}
              max={FEATURE_METADATA.relativeCompactness.max}
              step={FEATURE_METADATA.relativeCompactness.step}
              value={features.relativeCompactness}
              onChange={(e) => updateField('relativeCompactness', parseFloat(e.target.value) || 0.62)}
              className="w-18 text-right font-mono text-xs font-semibold px-2 py-0.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
            />
          </div>
          <input
            type="range"
            aria-label="Relative Compactness"
            min={FEATURE_METADATA.relativeCompactness.min}
            max={FEATURE_METADATA.relativeCompactness.max}
            step={FEATURE_METADATA.relativeCompactness.step}
            value={features.relativeCompactness}
            onChange={(e) => updateField('relativeCompactness', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0.62 (Sprawling)</span>
            <span>0.98 (Cubical)</span>
          </div>
        </div>

        {/* X2: Surface Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-sa" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Surface Area (X2)</span>
              <span className="text-[10px] font-mono text-cyan-700 font-normal">[m²]</span>
            </label>
            <input
              id="input-sa"
              type="number"
              min={FEATURE_METADATA.surfaceArea.min}
              max={FEATURE_METADATA.surfaceArea.max}
              step={FEATURE_METADATA.surfaceArea.step}
              value={features.surfaceArea}
              onChange={(e) => updateField('surfaceArea', parseFloat(e.target.value) || 514.5)}
              className="w-20 text-right font-mono text-xs font-semibold px-2 py-0.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
            />
          </div>
          <input
            type="range"
            aria-label="Surface Area"
            min={FEATURE_METADATA.surfaceArea.min}
            max={FEATURE_METADATA.surfaceArea.max}
            step={FEATURE_METADATA.surfaceArea.step}
            value={features.surfaceArea}
            onChange={(e) => updateField('surfaceArea', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>514.5 m²</span>
            <span>808.5 m²</span>
          </div>
        </div>

        {/* X3: Wall Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-wa" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Wall Area (X3)</span>
              <span className="text-[10px] font-mono text-cyan-700 font-normal">[m²]</span>
            </label>
            <input
              id="input-wa"
              type="number"
              min={FEATURE_METADATA.wallArea.min}
              max={FEATURE_METADATA.wallArea.max}
              step={FEATURE_METADATA.wallArea.step}
              value={features.wallArea}
              onChange={(e) => updateField('wallArea', parseFloat(e.target.value) || 245.0)}
              className="w-20 text-right font-mono text-xs font-semibold px-2 py-0.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
            />
          </div>
          <input
            type="range"
            aria-label="Wall Area"
            min={FEATURE_METADATA.wallArea.min}
            max={FEATURE_METADATA.wallArea.max}
            step={FEATURE_METADATA.wallArea.step}
            value={features.wallArea}
            onChange={(e) => updateField('wallArea', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>245.0 m²</span>
            <span>416.5 m²</span>
          </div>
        </div>

        {/* X4: Roof Area */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-ra" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Roof Area (X4)</span>
              <span className="text-[10px] font-mono text-cyan-700 font-normal">[m²]</span>
            </label>
            <input
              id="input-ra"
              type="number"
              min={FEATURE_METADATA.roofArea.min}
              max={FEATURE_METADATA.roofArea.max}
              step={FEATURE_METADATA.roofArea.step}
              value={features.roofArea}
              onChange={(e) => updateField('roofArea', parseFloat(e.target.value) || 110.25)}
              className="w-20 text-right font-mono text-xs font-semibold px-2 py-0.5 border border-slate-200 rounded-lg bg-slate-50 text-slate-800"
            />
          </div>
          <input
            type="range"
            aria-label="Roof Area"
            min={FEATURE_METADATA.roofArea.min}
            max={FEATURE_METADATA.roofArea.max}
            step={FEATURE_METADATA.roofArea.step}
            value={features.roofArea}
            onChange={(e) => updateField('roofArea', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>110.25 m²</span>
            <span>220.50 m²</span>
          </div>
        </div>

        {/* X5: Overall Height */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-height" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Overall Height (X5)</span>
              <span className="text-[10px] font-mono text-cyan-700 font-normal">[m]</span>
            </label>
            <span className="font-mono text-xs font-bold text-cyan-700 px-2 py-0.5 bg-cyan-50 rounded-md border border-cyan-200">
              {features.overallHeight}m ({features.overallHeight > 4 ? 'Two-Story' : 'Single-Story'})
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              id="input-height"
              onClick={() => updateField('overallHeight', 3.5)}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                features.overallHeight <= 4.0
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🏠 3.5m (1-Story)
            </button>
            <button
              type="button"
              onClick={() => updateField('overallHeight', 7.0)}
              className={`py-1.5 px-3 rounded-xl text-xs font-medium border transition-colors ${
                features.overallHeight > 4.0
                  ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              🏢 7.0m (2-Story)
            </button>
          </div>
        </div>

        {/* X6: Orientation */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-orient" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Orientation (X6)</span>
              <span className="text-[10px] font-mono text-cyan-700 font-normal">[azimuth]</span>
            </label>
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-0.5" id="input-orient">
            {ORIENTATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateField('orientation', opt.value)}
                className={`py-1.5 rounded-xl text-xs font-medium border transition-colors text-center ${
                  features.orientation === opt.value
                    ? 'bg-cyan-600 text-white border-cyan-600 shadow-xs font-semibold'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span>{opt.icon} {opt.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* X7: Glazing Area Ratio */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-glazing" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Glazing Area Ratio (X7)</span>
              <span className="text-[10px] font-mono text-cyan-700 font-normal">[fraction]</span>
            </label>
            <span className="font-mono text-xs font-bold text-cyan-700">
              {(features.glazingArea * 100).toFixed(0)}%
            </span>
          </div>
          <input
            id="input-glazing"
            type="range"
            aria-label="Glazing Area Ratio"
            min={FEATURE_METADATA.glazingArea.min}
            max={FEATURE_METADATA.glazingArea.max}
            step={FEATURE_METADATA.glazingArea.step}
            value={features.glazingArea}
            onChange={(e) => updateField('glazingArea', parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-cyan-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>0% (Windowless)</span>
            <span>10%</span>
            <span>25%</span>
            <span>40% (Max Glazing)</span>
          </div>
        </div>

        {/* X8: Glazing Distribution */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <label htmlFor="input-dist" className="font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Glazing Distribution (X8)</span>
            </label>
          </div>
          <select
            id="input-dist"
            value={features.glazingAreaDistribution}
            onChange={(e) => updateField('glazingAreaDistribution', parseInt(e.target.value, 10))}
            className="w-full text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
          >
            {GLAZING_DIST_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Prominent Predict Button */}
      <div className="pt-2 border-t border-slate-100">
        <button
          type="button"
          onClick={onPredict}
          disabled={isPredicting}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-cyan-600 via-sky-600 to-blue-600 hover:from-cyan-700 hover:via-sky-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-wait"
        >
          {isPredicting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Running Machine Learning Inference...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Predict Cooling Load (Y2)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
