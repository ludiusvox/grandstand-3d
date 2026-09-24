import React, { useState } from 'react';
import { BleacherConfig } from '../types/bleacher';
import { generateComponentPipelineStats, calculateSpecs } from '../utils/bleacherCalculations';
import { Cpu, PlusCircle, FileText } from 'lucide-react';

interface PipelineInspectorProps {
  config: BleacherConfig;
  onUpdateConfig: (updater: (prev: BleacherConfig) => BleacherConfig) => void;
}

export const PipelineInspector: React.FC<PipelineInspectorProps> = ({
  config,
  onUpdateConfig,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'bom' | 'pipeline'>('bom');
  const [bomDisplayMode, setBomDisplayMode] = useState<'cards' | 'table'>('cards');

  const components = generateComponentPipelineStats(config);
  const specs = calculateSpecs(config);

  const totalVertices = components.reduce((acc, c) => acc + (c.enabled ? c.vertexCount : 0), 0);
  const totalTriangles = components.reduce((acc, c) => acc + (c.enabled ? c.triangleCount : 0), 0);
  const totalDrawCalls = components.reduce((acc, c) => acc + (c.enabled ? c.drawCalls : 0), 0);

  return (
    <div className="space-y-4">
      {/* Sub-Tab Navigation Switcher */}
      <div className="grid grid-cols-2 gap-1 p-1 bg-slate-900 border border-slate-800 rounded-lg">
        <button
          onClick={() => setActiveSubTab('bom')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${
            activeSubTab === 'bom'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>BOM & Costing</span>
        </button>
        <button
          onClick={() => setActiveSubTab('pipeline')}
          className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-semibold transition-colors ${
            activeSubTab === 'pipeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Pipeline Telemetry</span>
        </button>
      </div>

      {/* VIEW 1: ITEMIZED BOM & COSTING */}
      {activeSubTab === 'bom' && (
        <div className="space-y-4">
          {/* Costing Summary Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-lg">
            <div className="p-1">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Pricing Rate</span>
              <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                ${specs.costPerSeat} <span className="text-[11px] text-slate-400">/ seat</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {specs.isElevated ? 'Elevated ($150)' : 'Bleacher ($100)'}
              </span>
            </div>

            <div className="p-1 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-1.5 sm:pt-1 sm:pl-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Seating Capacity</span>
              <div className="text-lg font-bold font-mono text-white mt-0.5">
                {specs.totalCapacity} <span className="text-[11px] text-slate-400">seats</span>
              </div>
              <span className="text-[10px] text-slate-500">
                {specs.standardCapacity} bench · {specs.adaCapacity} ADA
              </span>
            </div>

            <div className="p-1 border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-1.5 sm:pt-1 sm:pl-2.5">
              <span className="text-[10px] text-slate-400 uppercase font-mono block">Estimated Cost</span>
              <div className="text-lg font-bold font-mono text-blue-400 mt-0.5">
                ${specs.totalCostUsd.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500">
                Base: ${specs.seatingCostUsd.toLocaleString()}
              </span>
            </div>
          </div>

          {/* BOM Itemized Parts Section */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Itemized Parts Take-Off
              </h4>

              {/* Mobile View Toggle */}
              <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5 text-[10px]">
                <button
                  onClick={() => setBomDisplayMode(bomDisplayMode === 'cards' ? 'table' : 'cards')}
                  className="px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors"
                >
                  {bomDisplayMode === 'cards' ? 'Show Table' : 'Show Cards'}
                </button>
              </div>
            </div>

            {/* Mobile Responsive Cards View */}
            <div className={`space-y-2 ${bomDisplayMode === 'table' ? 'hidden' : 'block'}`}>
              {specs.structuralParts.map((part, i) => (
                <div
                  key={i}
                  className="p-2.5 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1.5 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800/80 font-mono font-bold text-blue-400 text-[11px] shrink-0">
                        {part.partId}
                      </span>
                      <span className="font-semibold text-slate-200 text-xs truncate">
                        {part.partName}
                      </span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/70 font-mono font-bold text-emerald-300 text-xs shrink-0">
                      {part.quantity} {part.unit}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-1 pt-1 border-t border-slate-800/70">
                    <span className="truncate max-w-[200px]">{part.material}</span>
                    <span className="font-mono text-slate-500 text-[10px]">
                      Ref: {part.drawingRef}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Horizontal Scroll Table View with Sticky Part ID */}
            <div className={`border border-slate-800 rounded-lg overflow-x-auto scrollbar-thin touch-pan-x ${
              bomDisplayMode === 'cards' ? 'hidden' : 'block'
            }`}>
              <table className="w-full min-w-[540px] text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[10px]">
                    <th className="p-2 sticky left-0 bg-slate-950 z-10 shadow-[1px_0_0_0_rgba(51,65,85,0.8)]">
                      Part ID
                    </th>
                    <th className="p-2">Part Name</th>
                    <th className="p-2">Material</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Ref</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                  {specs.structuralParts.map((part, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="p-2 font-bold text-blue-400 whitespace-nowrap sticky left-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-[1px_0_0_0_rgba(51,65,85,0.8)]">
                        {part.partId}
                      </td>
                      <td className="p-2 font-sans font-medium text-slate-200">
                        {part.partName}
                      </td>
                      <td className="p-2 text-slate-400">{part.material}</td>
                      <td className="p-2 font-bold text-white whitespace-nowrap">
                        {part.quantity} {part.unit}
                      </td>
                      <td className="p-2 text-slate-500 text-[10px] whitespace-nowrap">
                        {part.drawingRef}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: PIPELINE MESH & INJECTED MODULES */}
      {activeSubTab === 'pipeline' && (
        <div className="space-y-4">
          {/* Reverse-Engineered Rendering Pipeline Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-lg p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <Cpu className="w-4 h-4 text-blue-400" />
              <h3 className="text-xs sm:text-sm font-semibold text-slate-100">
                Client-Side Rendering Pipeline (Three.js WebGL)
              </h3>
            </div>

            {/* 4-Stage Architectural Flow */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-950 p-2 sm:p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-blue-400 font-mono font-semibold block">STAGE 1</span>
                <div className="font-medium text-slate-200 mt-0.5 text-[11px]">State Update</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {config.rows} rows, {config.lengthFt}ft
                </div>
              </div>

              <div className="bg-slate-950 p-2 sm:p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-blue-400 font-mono font-semibold block">STAGE 2</span>
                <div className="font-medium text-slate-200 mt-0.5 text-[11px]">Geometry Math</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Procedural vertex mesh
                </div>
              </div>

              <div className="bg-slate-950 p-2 sm:p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-blue-400 font-mono font-semibold block">STAGE 3</span>
                <div className="font-medium text-slate-200 mt-0.5 text-[11px]">Draw Package</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  PBR shader materials
                </div>
              </div>

              <div className="bg-slate-950 p-2 sm:p-2.5 rounded border border-slate-800/80">
                <span className="text-[10px] text-blue-400 font-mono font-semibold block">STAGE 4</span>
                <div className="font-medium text-slate-200 mt-0.5 text-[11px]">GPU Execution</div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  60 FPS WebGL raster
                </div>
              </div>
            </div>

            {/* Aggregate Pipeline Telemetry - Responsive Grid */}
            <div className="mt-3 pt-3 border-t border-slate-800 grid grid-cols-2 sm:flex sm:items-center sm:justify-between gap-2 text-xs font-mono text-slate-400">
              <div>
                Layers: <span className="text-white font-semibold">{components.filter((c) => c.enabled).length}</span>
              </div>
              <div>
                Triangles: <span className="text-blue-400 font-semibold">{totalTriangles.toLocaleString()}</span>
              </div>
              <div>
                Vertices: <span className="text-blue-400 font-semibold">{totalVertices.toLocaleString()}</span>
              </div>
              <div>
                Batch: <span className="text-slate-200 font-semibold">{totalDrawCalls}</span>
              </div>
            </div>
          </div>

          {/* Injected Components Inventory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Injected Pipeline Components
              </h4>
              <span className="text-xs text-slate-500 font-mono">
                {components.filter((c) => c.enabled).length} / {components.length} Active
              </span>
            </div>

            <div className="space-y-2">
              {components.map((comp) => (
                <div
                  key={comp.id}
                  className={`p-2.5 sm:p-3 rounded-lg border transition-all ${
                    comp.enabled
                      ? 'bg-slate-900/60 border-slate-800'
                      : 'bg-slate-950/40 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            comp.enabled ? 'bg-emerald-400' : 'bg-slate-600'
                          }`}
                        ></span>
                        <span className="text-xs font-semibold text-slate-200 truncate">
                          {comp.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                        {comp.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-500 mt-2">
                        <span>{comp.materialName}</span>
                        <span aria-hidden="true">·</span>
                        <span>{comp.triangleCount.toLocaleString()} tris</span>
                        <span aria-hidden="true">·</span>
                        <span>{comp.drawCalls} call(s)</span>
                      </div>
                    </div>

                    {/* Component toggles */}
                    {comp.id === 'comp_press_box' && (
                      <button
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            pressBox: { ...prev.pressBox, enabled: !prev.pressBox.enabled },
                          }))
                        }
                        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors shrink-0 ${
                          config.pressBox.enabled
                            ? 'bg-rose-950/70 border border-rose-800/80 text-rose-300 hover:bg-rose-900/80'
                            : 'bg-blue-600 text-white hover:bg-blue-500'
                        }`}
                      >
                        {config.pressBox.enabled ? 'Remove' : '+ Add'}
                      </button>
                    )}

                    {comp.id === 'comp_shade_canopy' && (
                      <button
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            shadeCanopy: { ...prev.shadeCanopy, enabled: !prev.shadeCanopy.enabled },
                          }))
                        }
                        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors shrink-0 ${
                          config.shadeCanopy.enabled
                            ? 'bg-rose-950/70 border border-rose-800/80 text-rose-300 hover:bg-rose-900/80'
                            : 'bg-blue-600 text-white hover:bg-blue-500'
                        }`}
                      >
                        {config.shadeCanopy.enabled ? 'Remove' : '+ Add'}
                      </button>
                    )}

                    {comp.id === 'comp_ada_platform' && (
                      <button
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            adaEnabled: !prev.adaEnabled,
                          }))
                        }
                        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors shrink-0 ${
                          config.adaEnabled
                            ? 'bg-rose-950/70 border border-rose-800/80 text-rose-300 hover:bg-rose-900/80'
                            : 'bg-blue-600 text-white hover:bg-blue-500'
                        }`}
                      >
                        {config.adaEnabled ? 'Remove' : '+ Add'}
                      </button>
                    )}

                    {comp.id === 'comp_wind_skirting' && (
                      <button
                        onClick={() =>
                          onUpdateConfig((prev) => ({
                            ...prev,
                            windSkirting: {
                              ...prev.windSkirting,
                              enabled: !prev.windSkirting.enabled,
                            },
                          }))
                        }
                        className={`px-2.5 py-1 text-xs rounded font-medium transition-colors shrink-0 ${
                          config.windSkirting.enabled
                            ? 'bg-rose-950/70 border border-rose-800/80 text-rose-300 hover:bg-rose-900/80'
                            : 'bg-blue-600 text-white hover:bg-blue-500'
                        }`}
                      >
                        {config.windSkirting.enabled ? 'Remove' : '+ Add'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Modular Pipeline Expansion Suggestions */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-lg p-3 sm:p-4">
            <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
              <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
              Injectable Component Pipeline Modules
            </h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              The procedural generator computes parametric meshes dynamically. Select modules below to inject or remove them from the active GPU scene graph.
            </p>

            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    pressBox: { ...prev.pressBox, enabled: !prev.pressBox.enabled },
                  }))
                }
                className={`p-2 sm:p-2.5 rounded text-left transition-colors border ${
                  config.pressBox.enabled
                    ? 'bg-blue-950/40 border-blue-600/80 hover:bg-rose-950/40 hover:border-rose-600'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs truncate">
                    {config.pressBox.enabled ? '✓ Press Box' : '+ Press Box'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    config.pressBox.enabled ? 'bg-rose-900/50 text-rose-300' : 'bg-blue-900/50 text-blue-300'
                  }`}>
                    {config.pressBox.enabled ? 'Remove' : 'Add'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">Panoramic booth</div>
              </button>

              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    shadeCanopy: { ...prev.shadeCanopy, enabled: !prev.shadeCanopy.enabled },
                  }))
                }
                className={`p-2 sm:p-2.5 rounded text-left transition-colors border ${
                  config.shadeCanopy.enabled
                    ? 'bg-blue-950/40 border-blue-600/80 hover:bg-rose-950/40 hover:border-rose-600'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs truncate">
                    {config.shadeCanopy.enabled ? '✓ Canopy' : '+ Canopy'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    config.shadeCanopy.enabled ? 'bg-rose-900/50 text-rose-300' : 'bg-blue-900/50 text-blue-300'
                  }`}>
                    {config.shadeCanopy.enabled ? 'Remove' : 'Add'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">Fabric roof</div>
              </button>

              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    adaEnabled: !prev.adaEnabled,
                    adaSpaces: prev.adaSpaces || 4,
                    hasAdaRamp: true,
                  }))
                }
                className={`p-2 sm:p-2.5 rounded text-left transition-colors border ${
                  config.adaEnabled
                    ? 'bg-blue-950/40 border-blue-600/80 hover:bg-rose-950/40 hover:border-rose-600'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs truncate">
                    {config.adaEnabled ? '✓ ADA Ramp' : '+ ADA Ramp'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    config.adaEnabled ? 'bg-rose-900/50 text-rose-300' : 'bg-blue-900/50 text-blue-300'
                  }`}>
                    {config.adaEnabled ? 'Remove' : 'Add'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">4 bays + ramp</div>
              </button>

              <button
                onClick={() =>
                  onUpdateConfig((prev) => ({
                    ...prev,
                    lightPoles: !prev.lightPoles,
                  }))
                }
                className={`p-2 sm:p-2.5 rounded text-left transition-colors border ${
                  config.lightPoles
                    ? 'bg-blue-950/40 border-blue-600/80 hover:bg-rose-950/40 hover:border-rose-600'
                    : 'bg-slate-950 hover:bg-slate-800 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200 text-xs truncate">
                    {config.lightPoles ? '✓ Lights' : '+ Lights'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 ${
                    config.lightPoles ? 'bg-rose-900/50 text-rose-300' : 'bg-blue-900/50 text-blue-300'
                  }`}>
                    {config.lightPoles ? 'Remove' : 'Add'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">45ft towers</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
