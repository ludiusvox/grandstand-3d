import React, { useState, useRef } from 'react';
import { CameraPreset, CalculatedSpecs, BleacherConfig } from '../types/bleacher';
import {
  Eye,
  Layers,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  Grid,
  Ruler,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Camera,
} from 'lucide-react';

interface HUDOverlayProps {
  config: BleacherConfig;
  specs: CalculatedSpecs;
  stats: { fps: number; drawCalls: number; triangles: number; vertices: number };
  onCameraPreset: (preset: CameraPreset) => void;
  currentPreset: CameraPreset;
  onExplodedChange: (value: number) => void;
  onToggleDimensions: () => void;
  onToggleWireframe: () => void;
  onSpectatorRowChange: (row: number) => void;
}

const CAMERA_PRESET_ITEMS: { id: CameraPreset; label: string; short: string }[] = [
  { id: 'iso', label: 'Isometric 3D', short: 'Isometric' },
  { id: 'front', label: 'Front Elevation', short: 'Front Elevation' },
  { id: 'side', label: 'Side Profile', short: 'Side Profile' },
  { id: 'top', label: 'Plan (Top)', short: 'Plan Top' },
  { id: 'spectator', label: 'Spectator POV', short: 'Spectator POV' },
  { id: 'understructure', label: 'Understructure', short: 'Understructure' },
];

export const HUDOverlay: React.FC<HUDOverlayProps> = ({
  config,
  specs,
  stats,
  onCameraPreset,
  currentPreset,
  onExplodedChange,
  onToggleDimensions,
  onToggleWireframe,
  onSpectatorRowChange,
}) => {
  const [isBottomToolsVisible, setIsBottomToolsVisible] = useState(true);
  const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
  const hasWarning = specs.codeCompliances.some((c) => c.status === 'warning');

  // Mouse and Touch Drag-to-Slide State & Handlers
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragStartScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartXRef.current = e.pageX - scrollRef.current.offsetLeft;
    dragStartScrollLeftRef.current = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - dragStartXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
      e.preventDefault();
    }
    scrollRef.current.scrollLeft = dragStartScrollLeftRef.current - walk;
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasMovedRef.current = false;
    }, 50);
  };

  const handleScrollStep = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const offset = direction === 'left' ? -150 : 150;
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none p-2 sm:p-4 flex flex-col justify-between overflow-hidden">
      {/* Top Left: Key Engineering Metrics */}
      <div className="flex flex-wrap items-start gap-2 sm:gap-3 pointer-events-auto">
        {/* Capacity Stat */}
        <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2 sm:p-3 shadow-lg">
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Seating Capacity
          </div>
          <div className="flex items-baseline gap-1.5 sm:gap-2 mt-0.5">
            <span className="text-lg sm:text-2xl font-bold font-mono text-white tabular-nums">
              {specs.totalCapacity}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400">
              ({specs.standardCapacity} bench · {specs.adaCapacity} ADA)
            </span>
          </div>
          <div className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5 sm:mt-1 flex items-center gap-1.5 font-mono">
            <span>{specs.widthFeet}' W</span>
            <span aria-hidden="true">×</span>
            <span>{specs.depthFeet}' D</span>
            <span aria-hidden="true">×</span>
            <span>{specs.overallHeightFeet}' H</span>
          </div>
        </div>

        {/* Code Compliance Status */}
        <div className="hidden sm:flex bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2.5 shadow-lg items-center gap-2">
          {hasWarning ? (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          <div>
            <div className="text-[11px] font-semibold text-slate-200">
              {hasWarning ? 'Review Code Flags' : 'IBC 1029 / ICC 300'}
            </div>
            <div className="text-[10px] text-slate-400">
              {hasWarning ? 'Guardrail or aisle notice' : 'All standard checks passed'}
            </div>
          </div>
        </div>

        {/* WebGL Rendering Pipeline Stats */}
        <div className="hidden md:flex bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg px-3 py-2 shadow-lg items-center gap-3 text-[11px] font-mono text-slate-400">
          <div>
            <span className="text-slate-500">FPS:</span>{' '}
            <span className="text-emerald-400 font-semibold">{stats.fps}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-slate-500">Draws:</span>{' '}
            <span className="text-slate-200">{stats.drawCalls}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div>
            <span className="text-slate-500">Tris:</span>{' '}
            <span className="text-slate-200">{(stats.triangles / 1000).toFixed(1)}k</span>
          </div>
        </div>
      </div>

      {/* Center Floating Prompt if in Spectator POV */}
      {currentPreset === 'spectator' && (
        <div className="self-center bg-slate-950/90 backdrop-blur-md border border-blue-500/40 rounded-lg px-4 py-2 pointer-events-auto flex items-center gap-3 shadow-xl">
          <Eye className="w-4 h-4 text-blue-400" />
          <span className="text-xs text-slate-300 font-medium">Spectator Row Sightline:</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(config.rows, 10) }, (_, i) => i + 1).map((r) => (
              <button
                key={r}
                onClick={() => onSpectatorRowChange(r)}
                className={`w-6 h-6 rounded text-xs font-mono font-medium transition-colors ${
                  config.spectatorRow === r
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Floating Toolbar: Exploded Assembly + Ruler + Grid + Camera Controls */}
      <div className="pointer-events-auto">
        {!isBottomToolsVisible ? (
          /* Minimized Floating Action Button (Tapping re-brings up ruler, grid, and camera tools) */
          <div className="flex items-center justify-start sm:justify-center">
            <button
              onClick={() => setIsBottomToolsVisible(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 border border-slate-700/80 text-slate-200 rounded-full shadow-2xl text-xs font-medium backdrop-blur-md transition-all active:scale-95 group"
              title="Show bottom tools (Ruler, Wireframe Grid, Camera Views)"
            >
              <div className="flex items-center gap-1 text-blue-400">
                <Ruler className="w-3.5 h-3.5" />
                <Grid className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-semibold text-slate-200 text-[11px] capitalize">
                {currentPreset === 'iso'
                  ? 'Isometric'
                  : currentPreset === 'front'
                  ? 'Front Elevation'
                  : currentPreset === 'side'
                  ? 'Side Profile'
                  : currentPreset === 'top'
                  ? 'Plan Top'
                  : currentPreset}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-mono flex items-center gap-0.5">
                <span>Tools</span>
                <ChevronUp className="w-3 h-3" />
              </span>
            </button>
          </div>
        ) : (
          /* Expanded Bottom Floating Toolbar */
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-slate-950/60 sm:bg-transparent backdrop-blur-sm sm:backdrop-blur-none p-1.5 sm:p-0 rounded-xl border border-slate-800/80 sm:border-0 shadow-2xl sm:shadow-none">
            {/* Exploded BIM Assembly Slider */}
            <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-2 sm:p-2.5 shadow-lg flex items-center justify-between sm:justify-start gap-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span className="whitespace-nowrap">BIM Exploded:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={config.explodedViewOffset}
                  onChange={(e) => onExplodedChange(parseFloat(e.target.value))}
                  className="w-24 sm:w-36 accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                />
                <span className="text-[11px] font-mono text-slate-400 w-7 tabular-nums">
                  {Math.round(config.explodedViewOffset * 100)}%
                </span>
              </div>
            </div>

            {/* Bottom Ruler System, Grid Icon, Camera Views, and Minimize Action Button */}
            <div className="flex items-center gap-1.5 w-full max-w-full">
              {/* Ruler & Grid Viewport Toggles */}
              <div className="flex items-center gap-1 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg shrink-0">
                <button
                  onClick={onToggleDimensions}
                  className={`p-1.5 sm:p-2 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    config.dimensionOverlay
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title="Toggle 3D Dimension Leaders (Ruler System)"
                >
                  <Ruler className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden xs:inline">Dims</span>
                </button>
                <button
                  onClick={onToggleWireframe}
                  className={`p-1.5 sm:p-2 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                    config.wireframeMode
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                  title="Toggle CAD Wireframe Grid"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden xs:inline">Grid</span>
                </button>
              </div>

              {/* Draggable & Slideable Camera Preset Segmented Switcher */}
              <div className="relative flex-1 min-w-0 flex items-center bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg">
                {/* Scroll Left Button */}
                <button
                  onClick={() => handleScrollStep('left')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 z-10"
                  title="Slide left"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                {/* Draggable Horizontal Track */}
                <div
                  ref={scrollRef}
                  onMouseDown={handleMouseDown}
                  onMouseMove={handleMouseMove}
                  onMouseUp={handleMouseUpOrLeave}
                  onMouseLeave={handleMouseUpOrLeave}
                  className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-1 touch-pan-x cursor-grab active:cursor-grabbing select-none py-0.5 px-1 scroll-smooth"
                  title="Drag or swipe horizontally to view all camera angles"
                >
                  {CAMERA_PRESET_ITEMS.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        if (hasMovedRef.current) return;
                        onCameraPreset(item.id);
                      }}
                      className={`px-2.5 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-colors select-none shrink-0 ${
                        currentPreset === item.id
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      }`}
                    >
                      {item.short}
                    </button>
                  ))}
                </div>

                {/* Scroll Right Button */}
                <button
                  onClick={() => handleScrollStep('right')}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0 z-10"
                  title="Slide right"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                {/* Quick Camera View Dropdown Popover Button */}
                <button
                  onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                  className={`p-1.5 ml-0.5 rounded text-xs font-medium border transition-colors flex items-center gap-1 shrink-0 ${
                    isViewMenuOpen
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                  title="Open Camera Angles Menu"
                >
                  <Camera className="w-3.5 h-3.5 text-blue-400" />
                  <ChevronUp className="w-3 h-3" />
                </button>

                {/* Camera Angles Popover Menu */}
                {isViewMenuOpen && (
                  <div className="absolute bottom-full mb-2 left-0 sm:left-auto sm:right-0 bg-slate-950 border border-slate-700/90 rounded-lg p-1.5 shadow-2xl z-30 min-w-[190px] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2">
                    <div className="px-2 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 mb-1">
                      Camera Projection Views
                    </div>
                    {CAMERA_PRESET_ITEMS.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          onCameraPreset(item.id);
                          setIsViewMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center justify-between ${
                          currentPreset === item.id
                            ? 'bg-blue-600 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span>{item.label}</span>
                        {currentPreset === item.id && <span className="text-[10px]">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Minimize / Collapse Button directly attached to toolbar */}
              <div className="bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-lg p-1 shadow-lg shrink-0">
                <button
                  onClick={() => {
                    setIsBottomToolsVisible(false);
                    setIsViewMenuOpen(false);
                  }}
                  className="px-2 py-1.5 rounded text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors flex items-center gap-1"
                  title="Minimize bottom ruler, grid, and camera view tools"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[11px] font-medium hidden xs:inline">Hide</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
