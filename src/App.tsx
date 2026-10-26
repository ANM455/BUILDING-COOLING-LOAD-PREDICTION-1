import React, { useState } from 'react';
import type { BuildingFeatures, ModelType } from './utils/mlEngine';
import { predictLoads, BUILDING_PRESETS } from './utils/mlEngine';
import { InputControls } from './components/InputControls';
import { MetricCards } from './components/MetricCards';
import { BuildingVisualizer } from './components/BuildingVisualizer';
import { DataCharts } from './components/DataCharts';
import { WhatIfComparator } from './components/WhatIfComparator';
import { PythonCodeViewer } from './components/PythonCodeViewer';
import {
  Snowflake,
  Activity,
  Layers,
  Code2,
  FileSpreadsheet,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';

export default function App() {
  // Current active features initialized to default preset (Suburban Two-Story)
  const [features, setFeatures] = useState<BuildingFeatures>(
    BUILDING_PRESETS[2].features
  );
  const [modelType, setModelType] = useState<ModelType>('random_forest');
  const [activeView, setActiveView] = useState<'studio' | 'whatif' | 'python' | 'dataset'>('studio');
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionVersion, setPredictionVersion] = useState<number>(1);

  // Compute prediction results
  const currentPrediction = predictLoads(features, modelType);

  const handlePredict = () => {
    setIsPredicting(true);
    setTimeout(() => {
      setIsPredicting(false);
      setPredictionVersion((v) => v + 1);
    }, 280);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-sky-500 flex items-center justify-center text-white shadow-xs">
              <Snowflake className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  Cooling Load ML Predictor
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-cyan-100 text-cyan-800 border border-cyan-200">
                  UCI Energy Efficiency
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Architectural thermal load regression & HVAC chiller sizing
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-medium" aria-label="Main Navigation">
            <button
              type="button"
              onClick={() => setActiveView('studio')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeView === 'studio'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-cyan-600" />
              <span>Prediction Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('whatif')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeView === 'whatif'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-cyan-600" />
              <span>What-If Analysis</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('python')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeView === 'python'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-cyan-600" />
              <span>Python & Streamlit</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('dataset')}
              className={`hidden md:flex px-3 py-1.5 rounded-lg items-center gap-1.5 transition-all ${
                activeView === 'dataset'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-600" />
              <span>Dataset & Specs</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Banner Alert with Quick Information */}
        <div className="bg-gradient-to-r from-cyan-900 to-slate-900 rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>Machine Learning for Sustainable Architecture</span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
              Instant Thermodynamic Cooling Load Forecasting
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Adjust building compactness, surface areas, height, fenestration glazing ratio, and orientation to calculate peak thermal cooling demands in real time. Backed by Random Forest and Gradient Boosted regression.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/80 px-2.5 py-1 rounded-lg border border-cyan-800">
              Model R² Score: 0.978
            </span>
            <span className="text-[11px] text-slate-400">
              768 Validated Geometries
            </span>
          </div>
        </div>

        {/* View 1: Prediction Studio */}
        {activeView === 'studio' && (
          <div className="space-y-6">
            {/* Top Grid: Input Controls (Left) & Visualizer + Hero Result (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: 8 Key Parameters */}
              <div className="lg:col-span-7">
                <InputControls
                  features={features}
                  onChange={setFeatures}
                  modelType={modelType}
                  onModelChange={setModelType}
                  onPredict={handlePredict}
                  isPredicting={isPredicting}
                />
              </div>

              {/* Right Column: 3D Geometry Visualizer + Metric Cards */}
              <div className="lg:col-span-5 space-y-6">
                <MetricCards prediction={currentPrediction} />
                <BuildingVisualizer
                  features={features}
                  coolingLoad={currentPrediction.coolingLoad}
                />
              </div>
            </div>

            {/* Bottom Grid: Feature Importance & Sensitivity Charts */}
            <DataCharts
              features={features}
              currentCoolingLoad={currentPrediction.coolingLoad}
              currentHeatingLoad={currentPrediction.heatingLoad}
              modelType={modelType}
            />
          </div>
        )}

        {/* View 2: What-If Comparison & Optimization */}
        {activeView === 'whatif' && (
          <div className="space-y-6">
            <WhatIfComparator
              currentFeatures={features}
              currentPrediction={currentPrediction}
              onApplyPreset={setFeatures}
            />
            {/* Embedded Visualizer & Controls for fast tweaking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7">
                <InputControls
                  features={features}
                  onChange={setFeatures}
                  modelType={modelType}
                  onModelChange={setModelType}
                  onPredict={handlePredict}
                  isPredicting={isPredicting}
                />
              </div>
              <div className="lg:col-span-5">
                <BuildingVisualizer
                  features={features}
                  coolingLoad={currentPrediction.coolingLoad}
                />
              </div>
            </div>
          </div>
        )}

        {/* View 3: Python & Streamlit Code View */}
        {activeView === 'python' && (
          <div className="space-y-6">
            <PythonCodeViewer />
          </div>
        )}

        {/* View 4: Dataset & Methodology */}
        {activeView === 'dataset' && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-6 space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Dataset Methodology & Features Definition
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Based on the Energy Efficiency dataset created by Angeliki Xifara and Athanasios Tsanas (Oxford / Bath Universities, 2012).
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Variable</th>
                    <th className="py-2.5 px-3">Parameter Name</th>
                    <th className="py-2.5 px-3">Range</th>
                    <th className="py-2.5 px-3">Unit</th>
                    <th className="py-2.5 px-3">Physical Influence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">X1</td>
                    <td className="py-2.5 px-3 font-medium">Relative Compactness</td>
                    <td className="py-2.5 px-3 font-mono">0.62 – 0.98</td>
                    <td className="py-2.5 px-3">ratio</td>
                    <td className="py-2.5 px-3 text-slate-500">Volume to surface ratio. Lower compactness exposes more envelope to ambient thermal radiation.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">X2</td>
                    <td className="py-2.5 px-3 font-medium">Surface Area</td>
                    <td className="py-2.5 px-3 font-mono">514.5 – 808.5</td>
                    <td className="py-2.5 px-3">m²</td>
                    <td className="py-2.5 px-3 text-slate-500">Total exterior envelope skin transmitting conductive heat gains.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">X3</td>
                    <td className="py-2.5 px-3 font-medium">Wall Area</td>
                    <td className="py-2.5 px-3 font-mono">245.0 – 416.5</td>
                    <td className="py-2.5 px-3">m²</td>
                    <td className="py-2.5 px-3 text-slate-500">Vertical opaque boundary transferring convective and solar heat.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">X4</td>
                    <td className="py-2.5 px-3 font-medium">Roof Area</td>
                    <td className="py-2.5 px-3 font-mono">110.25 – 220.5</td>
                    <td className="py-2.5 px-3">m²</td>
                    <td className="py-2.5 px-3 text-slate-500">Top horizontal boundary absorbing direct solar irradiance at noon.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">X5</td>
                    <td className="py-2.5 px-3 font-medium">Overall Height</td>
                    <td className="py-2.5 px-3 font-mono">3.5, 7.0</td>
                    <td className="py-2.5 px-3">m</td>
                    <td className="py-2.5 px-3 text-slate-500">1-story (3.5m) vs 2-story (7.0m). Dominant driver of stack thermal effect.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">X6</td>
                    <td className="py-2.5 px-3 font-medium">Orientation</td>
                    <td className="py-2.5 px-3 font-mono">2, 3, 4, 5</td>
                    <td className="py-2.5 px-3">facing</td>
                    <td className="py-2.5 px-3 text-slate-500">North (2), East (3), South (4), West (5). West exposure has peak thermal gains.</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">X7</td>
                    <td className="py-2.5 px-3 font-medium">Glazing Area</td>
                    <td className="py-2.5 px-3 font-mono">0.00 – 0.40</td>
                    <td className="py-2.5 px-3">ratio</td>
                    <td className="py-2.5 px-3 text-slate-500">Window fenestration ratio. Principal driver of solar heat gain coefficient (SHGC).</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-mono font-bold text-cyan-700">X8</td>
                    <td className="py-2.5 px-3 font-medium">Glazing Distribution</td>
                    <td className="py-2.5 px-3 font-mono">0 – 5</td>
                    <td className="py-2.5 px-3">scheme</td>
                    <td className="py-2.5 px-3 text-slate-500">None (0), Uniform (1), North (2), East (3), South (4), West (5).</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 flex items-start gap-3">
              <Info className="w-5 h-5 text-cyan-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-600 space-y-1">
                <p className="font-semibold text-slate-800">
                  Target Variables: Y1 Heating Load & Y2 Cooling Load
                </p>
                <p>
                  Cooling Load (Y2) represents the sensible and latent heat removal rate required to maintain conditioned thermal comfort (24°C indoor setpoint) according to ASHRAE standards. Machine learning ensemble models (Random Forest, Gradient Boosting, XGBoost) capture the strong non-linear interactions between building height and glazing area with R² &gt; 0.97.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200/80 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Building Energy ML Studio</span>
            <span>•</span>
            <span>Cooling Load Prediction</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setActiveView('python')}
              className="hover:text-cyan-700 transition-colors font-medium flex items-center gap-1"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Python Streamlit Source</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveView('dataset')}
              className="hover:text-cyan-700 transition-colors font-medium flex items-center gap-1"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>UCI Energy Efficiency Dataset</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
