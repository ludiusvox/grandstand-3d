import React from 'react';
import { Camera, FileText, RotateCcw, Sliders } from 'lucide-react';
import { BleacherConfig } from '../types/bleacher';

interface HeaderProps {
  config: BleacherConfig;
  onApplyPreset: (presetKey: string) => void;
  onOpenSpecs: () => void;
  onTakeScreenshot: () => void;
  onReset: () => void;
  activePreset: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  onApplyPreset,
  onOpenSpecs,
  onTakeScreenshot,
  onReset,
  activePreset,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header className="h-14 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Zone 1: Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-blue-500 rounded-sm" />
          <span className="text-base font-bold tracking-tight text-white font-sans">
            GRANDSTAND <span className="text-blue-400 font-light">3D</span>
          </span>
        </div>
        <span className="text-slate-600 font-mono text-xs hidden sm:inline" aria-hidden="true">|</span>
        <span className="text-xs text-slate-400 hidden sm:inline font-mono">
          Structural CAD Engine
        </span>
      </div>

      {/* Zone 2: Drawing Presets */}
      <nav className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-medium">
        <button
          onClick={() => onApplyPreset('drawing-5row-42ft')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activePreset === 'drawing-5row-42ft'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          5-Row · 42' (2' Elev)
        </button>
        <button
          onClick={() => onApplyPreset('drawing-10row-78ft')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activePreset === 'drawing-10row-78ft'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          10-Row · 78' (4' Elev)
        </button>
        <button
          onClick={() => onApplyPreset('drawing-15row-120ft')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activePreset === 'drawing-15row-120ft'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          15-Row · 120' (8' Elev)
        </button>
        <button
          onClick={() => onApplyPreset('drawing-20row-180ft')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activePreset === 'drawing-20row-180ft'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          20-Row · 180' (10' Elev)
        </button>
      </nav>

      {/* Zone 3: Primary Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onTakeScreenshot}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
          title="Capture High-Res 3D Render"
        >
          <Camera className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">Render PNG</span>
        </button>

        <button
          onClick={onOpenSpecs}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md shadow-sm transition-colors"
          title="Open Engineering BOM & Cost Script"
        >
          <FileText className="w-3.5 h-3.5 text-blue-400" />
          <span>BOM & Costing</span>
        </button>

        <button
          onClick={onToggleSidebar}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
            isSidebarOpen
              ? 'bg-slate-800 text-white border-slate-700'
              : 'bg-blue-600 text-white border-blue-500 hover:bg-blue-500 shadow-sm'
          }`}
          title={isSidebarOpen ? 'Hide CAD Parameters Sidebar' : 'Open CAD Parameters Sidebar'}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isSidebarOpen ? 'Hide CAD' : 'CAD Parameters'}</span>
        </button>

        <button
          onClick={onReset}
          className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-md transition-colors"
          title="Reset to Default Configuration"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
