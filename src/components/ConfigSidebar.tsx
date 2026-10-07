import React, { useState } from 'react';
import {
  BleacherConfig,
  AllowedRows,
  AllowedElevation,
  AllowedRiserHeight,
  AllowedFloorDepth,
  AllowedLength,
  PressBoxSize,
  AccessStairsOption,
  SeatType,
  GuardrailStyle,
  FieldEnvironment,
} from '../types/bleacher';
import { PipelineInspector } from './PipelineInspector';
import {
  Sliders,
  Palette,
  Shield,
  PlusSquare,
  Cpu,
  ChevronRight,
  DollarSign,
  FileCheck,
  ArrowUpDown,
  Maximize2,
} from 'lucide-react';

interface ConfigSidebarProps {
  config: BleacherConfig;
  onChange: (updater: (prev: BleacherConfig) => BleacherConfig) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
  isMobile?: boolean;
  mobilePlacement?: 'panel-top' | 'panel-bottom';
  onToggleMobilePlacement?: () => void;
  mobilePanelHeight?: 'split' | 'fullscreen-3d' | 'fullscreen-panel';
  onSetMobilePanelHeight?: (mode: 'split' | 'fullscreen-3d' | 'fullscreen-panel') => void;
}

type TabType = 'drawings' | 'seating' | 'safety' | 'addons' | 'pipeline';

export const ConfigSidebar: React.FC<ConfigSidebarProps> = ({
  config,
  onChange,
  isOpen,
  onToggleOpen,
  isMobile = false,
  mobilePlacement = 'panel-top',
  onToggleMobilePlacement,
  mobilePanelHeight = 'split',
  onSetMobilePanelHeight,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('drawings');

  const isElevated = config.elevation > 0;
  const costPerSeat = isElevated ? 150 : 100;

  const ROWS_OPTIONS: AllowedRows[] = [5, 10, 15, 20];
  const ELEVATION_OPTIONS: AllowedElevation[] = [0, 2, 4, 8, 10];
  const RISER_OPTIONS: AllowedRiserHeight[] = [8, 12];
  const DEPTH_OPTIONS: AllowedFloorDepth[] = [24, 26, 30];
  const LENGTH_OPTIONS: AllowedLength[] = [42, 78, 120, 180];

  const TEAM_PALETTES = [
    { name: 'Royal & Gold', seat: '#1d4ed8', back: '#1e40af', frame: '#cbd5e1' },
    { name: 'Crimson & Black', seat: '#b91c1c', back: '#991b1b', frame: '#1e293b' },
    { name: 'Forest & Gold', seat: '#047857', back: '#065f46', frame: '#cbd5e1' },
    { name: 'Navy & Silver', seat: '#1e3a8a', back: '#172554', frame: '#cbd5e1' },
    { name: 'Mill Aluminum', seat: '#64748b', back: '#475569', frame: '#cbd5e1' },
    { name: 'Stealth Dark', seat: '#334155', back: '#1e293b', frame: '#0f172a' },
  ];

  // Mobile layout rendering (when isMobile is true)
  if (isMobile) {
    if (!isOpen || mobilePanelHeight === 'fullscreen-3d') return null;

    return (
      <div className="w-full h-full flex flex-col bg-slate-950/98 border-b border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Cost / Pricing & Width Header with Mobile Tools */}
        <div className="px-3 py-2 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-xs font-semibold text-slate-200 truncate">
              {isElevated ? 'Elevated' : 'Bleacher'}
            </span>
            {/* Display Grandstand Width prominently in the mobile margin header */}
            <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-600/70 text-blue-300 font-mono text-[11px] font-bold shrink-0">
              {config.lengthFt}' W
            </span>
            <span className="text-[11px] text-slate-400 font-mono hidden xs:inline shrink-0">
              {config.rows}R
            </span>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs shrink-0">
            {onToggleMobilePlacement && (
              <button
                onClick={onToggleMobilePlacement}
                className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition-colors"
                title="Toggle whether 3D window is below or above the panel"
              >
                <ArrowUpDown className="w-3 h-3 text-blue-400" />
                <span className="hidden xs:inline">
                  {mobilePlacement === 'panel-top' ? '3D Below' : '3D Top'}
                </span>
              </button>
            )}

            {onSetMobilePanelHeight && (
              <button
                onClick={() => onSetMobilePanelHeight('fullscreen-3d')}
                className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                title="Maximize 3D Drawing Window"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onToggleOpen}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close panel"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation - Fully fitted across 100% width within phone margins */}
        <div className="w-full grid grid-cols-5 border-b border-slate-800 bg-slate-900/80 shrink-0 p-1 gap-1">
          <button
            onClick={() => setActiveTab('drawings')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1.5 px-0.5 rounded transition-colors text-center ${
              activeTab === 'drawings'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="CAD Drawings & Dimensions"
          >
            <Sliders className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs truncate w-full text-center">Drawings</span>
          </button>

          <button
            onClick={() => setActiveTab('seating')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1.5 px-0.5 rounded transition-colors text-center ${
              activeTab === 'seating'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Seating & Colors"
          >
            <Palette className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs truncate w-full text-center">Seating</span>
          </button>

          <button
            onClick={() => setActiveTab('safety')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1.5 px-0.5 rounded transition-colors text-center ${
              activeTab === 'safety'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Safety & Aisles"
          >
            <Shield className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs truncate w-full text-center">Safety</span>
          </button>

          <button
            onClick={() => setActiveTab('addons')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1.5 px-0.5 rounded transition-colors text-center ${
              activeTab === 'addons'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Add-ons"
          >
            <PlusSquare className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs truncate w-full text-center">Add-ons</span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1.5 px-0.5 rounded transition-colors text-center ${
              activeTab === 'pipeline'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
            title="Pipeline & BOM"
          >
            <Cpu className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[10px] sm:text-xs truncate w-full text-center">BOM</span>
          </button>
        </div>

        {/* Tab Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
          {activeTab === 'drawings' && (
            <div className="space-y-4">
              {/* Rows */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Rows <span className="text-slate-500 font-mono">{"{5, 10, 15, 20}"}</span>
                  </label>
                  <span className="font-mono text-xs font-bold text-blue-400">{config.rows} Rows</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {ROWS_OPTIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => onChange((prev) => ({ ...prev, rows: r }))}
                      className={`py-1.5 text-center text-xs font-mono font-semibold rounded border ${
                        config.rows === r
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Elevation */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Front Elevation <span className="text-slate-500 font-mono">{"{2, 4, 8, 10}"} ft</span>
                  </label>
                  <span className="font-mono text-xs font-bold text-emerald-400">
                    {config.elevation === 0 ? 'Ground (0ft)' : `${config.elevation}ft ($150)`}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1">
                  {ELEVATION_OPTIONS.map((elev) => (
                    <button
                      key={elev}
                      onClick={() => onChange((prev) => ({ ...prev, elevation: elev }))}
                      className={`py-1.5 text-center text-xs font-mono font-semibold rounded border ${
                        config.elevation === elev
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {elev === 0 ? '0ft' : `${elev}'`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-medium text-slate-300">
                    Grandstand Length <span className="text-slate-500 font-mono">{"{42, 78, 120, 180}"} ft</span>
                  </label>
                  <span className="font-mono text-xs font-bold text-blue-400">{config.lengthFt} ft</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {LENGTH_OPTIONS.map((len) => (
                    <button
                      key={len}
                      onClick={() => onChange((prev) => ({ ...prev, lengthFt: len }))}
                      className={`py-1.5 text-center text-xs font-mono font-semibold rounded border ${
                        config.lengthFt === len
                          ? 'bg-blue-600 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {len}'
                    </button>
                  ))}
                </div>
              </div>

              {/* Riser & Depth Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Riser: {"{8, 12}\""}</label>
                  <div className="grid grid-cols-2 gap-1">
                    {RISER_OPTIONS.map((rise) => (
                      <button
                        key={rise}
                        onClick={() => onChange((prev) => ({ ...prev, rowRiseInches: rise }))}
                        className={`py-1 text-xs font-mono rounded border ${
                          config.rowRiseInches === rise
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        {rise}"
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Floor Depth: {"{24, 26, 30}\""}</label>
                  <div className="grid grid-cols-3 gap-1">
                    {DEPTH_OPTIONS.map((depth) => (
                      <button
                        key={depth}
                        onClick={() => onChange((prev) => ({ ...prev, rowRunInches: depth }))}
                        className={`py-1 text-xs font-mono rounded border ${
                          config.rowRunInches === depth
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                      }`}
                    >
                      {depth}"
                    </button>
                  ))}
                  </div>
                </div>
              </div>

              {/* Press Box & Stairs */}
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-200">Press Box Booth</span>
                  <input
                    type="checkbox"
                    checked={config.pressBox.enabled}
                    onChange={(e) =>
                      onChange((prev) => ({
                        ...prev,
                        pressBox: { ...prev.pressBox, enabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-blue-500 rounded"
                  />
                </div>
                {config.pressBox.enabled && (
<<<<<<< HEAD
                  <div className="grid grid-cols-2 gap-1.5 pt-1 border-t border-slate-800 text-xs">
                    {(['20x8', '40x8'] as PressBoxSize[]).map((sz) => (
                      <button
                        key={sz}
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            pressBox: { ...prev.pressBox, size: sz, widthFt: sz === '40x8' ? 40 : 20 },
                          }))
                        }
                        className={`py-1 text-xs font-mono rounded border ${
                          config.pressBox.size === sz
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {sz === '20x8' ? '20×8ft' : '40×8ft'}
                      </button>
                    ))}
=======
                  <div className="space-y-2 pt-1 border-t border-slate-800 text-xs">
                    <div className="grid grid-cols-2 gap-1.5">
                      {(['20x8', '40x8'] as PressBoxSize[]).map((sz) => (
                        <button
                          key={sz}
                          onClick={() =>
                            onChange((prev) => ({
                              ...prev,
                              pressBox: { ...prev.pressBox, size: sz, widthFt: sz === '40x8' ? 40 : 20 },
                            }))
                          }
                          className={`py-1 text-xs font-mono rounded border ${
                            config.pressBox.size === sz
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {sz === '20x8' ? '20×8ft' : '40×8ft'}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-slate-300 text-[11px]">Press Box Color</span>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3.5 h-3.5 rounded border border-white/20" style={{ backgroundColor: config.pressBox.color || '#dc2626' }} />
                        <input
                          type="color"
                          value={config.pressBox.color || '#dc2626'}
                          onChange={(e) =>
                            onChange((prev) => ({
                              ...prev,
                              pressBox: { ...prev.pressBox, color: e.target.value },
                            }))
                          }
                          className="w-5 h-5 bg-transparent border-0 rounded cursor-pointer"
                        />
                      </div>
                    </div>
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                  </div>
                )}
              </div>

              {/* Platform Stairs & Barricades */}
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">Side Barricades</span>
                  <input
                    type="checkbox"
                    checked={config.sideBarricades}
                    onChange={(e) => onChange((prev) => ({ ...prev, sideBarricades: e.target.checked }))}
                    className="w-4 h-4 accent-blue-500 rounded"
                  />
                </div>

                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">Access Stairs:</label>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'left', label: 'Left' },
                      { id: 'right', label: 'Right' },
                      { id: 'both', label: 'Both' },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() =>
                          onChange((prev) => ({ ...prev, accessStairs: opt.id as AccessStairsOption }))
                        }
                        className={`py-1 text-xs rounded border ${
                          config.accessStairs === opt.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

<<<<<<< HEAD
=======
              {/* Front Walkway & Column Depth Controls (Mobile) */}
              <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-slate-200">Front Walkway & Columns</span>
                  <span className="font-mono text-[10px] text-blue-400 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-800/60 font-bold">
                    {config.walkwayWidthFt ?? 6}' ({config.walkwayColumns ?? 3} Cols Deep)
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { w: 6, c: 3 as const, label: '6\' (3 Cols)' },
                    { w: 8, c: 3 as const, label: '8\' (3 Cols)' },
                  ].map((item) => (
                    <button
                      key={`${item.w}-${item.c}`}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          walkwayWidthFt: item.w,
                          walkwayColumns: item.c,
                        }))
                      }
                      className={`py-1 text-[11px] rounded border font-medium ${
                        (config.walkwayWidthFt ?? 6) === item.w && (config.walkwayColumns ?? 3) === item.c
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
              {/* Front Platform X-Bracing */}
              {config.elevation > 0 && (
                <div className="p-2.5 bg-slate-900/80 border border-slate-800 rounded space-y-1.5 text-xs">
                  <span className="font-semibold text-slate-200 block">Front Platform "X" Cross Members</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'modular-tiered', label: 'Modular' },
                      { id: 'full-height', label: 'Full X' },
                      { id: 'double-x', label: 'Double' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            frontXBraceMode: m.id as 'modular-tiered' | 'full-height' | 'double-x',
                          }))
                        }
                        className={`py-1 text-xs rounded border ${
                          config.frontXBraceMode === m.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'seating' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">Seating System</label>
<<<<<<< HEAD
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'bench', name: '2" x 10" Aluminum Planks' },
                    { id: 'bench-with-back', name: 'Bench with Ergonomic Backrest' },
                    { id: 'stadium-chair', name: 'Molded Flip-Up Stadium Chairs' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onChange((prev) => ({ ...prev, seatType: s.id as SeatType }))}
                      className={`p-2 rounded border text-left text-xs ${
                        config.seatType === s.id
                          ? 'bg-blue-600/20 border-blue-500 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {s.name}
                    </button>
                  ))}
=======
                <div className="p-2.5 bg-slate-900 border border-slate-800 rounded text-xs space-y-1">
                  <div className="font-semibold text-white">2" x 10" Clear Anodized Aluminum Bench Planks</div>
                  <div className="text-[11px] text-slate-400">Fixed architectural aluminum seating (no color changes).</div>
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                </div>
              </div>

              <div>
<<<<<<< HEAD
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">Team Color Presets</label>
=======
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-slate-200 block">Riser / Kickboard Color</label>
                  <input
                    type="color"
                    value={config.riserColor || config.seatColor || '#1d4ed8'}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, riserColor: e.target.value }))
                    }
                    className="w-5 h-5 bg-transparent border-0 rounded cursor-pointer"
                  />
                </div>
                <div className="text-[11px] text-slate-400 mb-2">Vertical kickboard behind each seat row.</div>
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                <div className="grid grid-cols-2 gap-1.5">
                  {TEAM_PALETTES.map((tp) => (
                    <button
                      key={tp.name}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
<<<<<<< HEAD
                          seatColor: tp.seat,
                          backrestColor: tp.back,
=======
                          riserColor: tp.seat,
                          seatColor: '#d1d5db',
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                          frameColor: tp.frame,
                        }))
                      }
                      className="p-1.5 bg-slate-900 border border-slate-800 rounded flex items-center gap-2 text-xs"
                    >
                      <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: tp.seat }} />
                      <span className="text-slate-300 truncate text-[11px]">{tp.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'safety' && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded flex items-center justify-between text-xs">
                <span className="text-slate-200">6ft Designated Aisles</span>
                <input
                  type="checkbox"
                  checked={config.hasAisle}
                  onChange={(e) => onChange((prev) => ({ ...prev, hasAisle: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500 rounded"
                />
              </div>

              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded flex items-center justify-between text-xs">
                <span className="text-slate-200">ADA Wheelchair Staging</span>
                <input
                  type="checkbox"
                  checked={config.adaEnabled}
                  onChange={(e) => onChange((prev) => ({ ...prev, adaEnabled: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500 rounded"
                />
              </div>
            </div>
          )}

          {activeTab === 'addons' && (
            <div className="space-y-3">
<<<<<<< HEAD
=======
              <div>
                <label className="text-xs font-semibold text-slate-200 block mb-1.5">Field Environment Terrain</label>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  {[
                    { id: 'soccer', label: 'Soccer Pitch' },
                    { id: 'football', label: 'Football Turf' },
                    { id: 'racetrack', label: 'Racetrack' },
                    { id: 'dirt-track', label: 'Dirt Track' },
                    { id: 'track', label: 'Athletics Track' },
                    { id: 'basketball', label: 'Hardwood Court' },
                    { id: 'architectural-studio', label: 'CAD Studio' },
                  ].map((env) => (
                    <button
                      key={env.id}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          fieldEnvironment: env.id as FieldEnvironment,
                        }))
                      }
                      className={`p-2 text-center rounded border transition-colors ${
                        config.fieldEnvironment === env.id
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      {env.label}
                    </button>
                  ))}
                </div>
              </div>

>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-200 font-semibold block">Cantilever Shade Canopy</span>
                  <span className="text-[10px] text-slate-400">Weather protective fabric roof</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.shadeCanopy.enabled}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      shadeCanopy: { ...prev.shadeCanopy, enabled: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>

              <div className="p-3 bg-slate-900/70 border border-slate-800 rounded flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-200 font-semibold block">Stadium Floodlights</span>
                  <span className="text-[10px] text-slate-400">Dual 45ft lighting towers</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.lightPoles}
                  onChange={(e) => onChange((prev) => ({ ...prev, lightPoles: e.target.checked }))}
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'pipeline' && (
            <PipelineInspector config={config} onUpdateConfig={onChange} />
          )}
        </div>
      </div>
    );
  }

  // Desktop & Tablet Viewport Layout (Preserved exactly as requested)

  return (
    <>
      {/* Floating Toggle Button (Always visible on screen edge, never clipped) */}
      <button
        onClick={onToggleOpen}
        className={`fixed top-18 z-30 flex items-center gap-2 px-3 py-2 bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white rounded-l-lg shadow-2xl transition-all duration-300 cursor-pointer ${
          isOpen ? 'right-full sm:right-[440px] border-r-0' : 'right-0'
        }`}
        title={isOpen ? 'Collapse CAD Sidebar' : 'Open CAD Sidebar'}
        aria-label={isOpen ? 'Collapse CAD Sidebar' : 'Open CAD Sidebar'}
      >
        <Sliders className="w-4 h-4 text-blue-400" />
        <span className="text-xs font-semibold whitespace-nowrap">
          {isOpen ? 'Hide Panel' : 'CAD Parameters'}
        </span>
        <ChevronRight
          className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`}
        />
      </button>

      {/* Main Sidebar Drawer */}
      <aside
        className={`fixed top-14 bottom-0 right-0 z-20 flex flex-col bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 transition-all duration-300 ${
          isOpen ? 'w-full sm:w-[440px]' : 'w-0 border-l-0 overflow-hidden pointer-events-none'
        }`}
      >
        {/* Top Cost / Pricing Header & Close Button */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              {isElevated ? 'Elevated Grandstand' : 'Non-Elevated Bleacher'}
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <div>
              <span className="text-slate-400">Rate: </span>
              <span className="font-bold text-emerald-400">${costPerSeat}/seat</span>
            </div>
            <button
              onClick={onToggleOpen}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close sidebar"
            >
              ✕
            </button>
          </div>
        </div>

      {/* Tab Navigation */}
      <div className="flex items-center border-b border-slate-800 bg-slate-900/50 shrink-0 overflow-x-auto p-1.5 gap-1">
        <button
          onClick={() => setActiveTab('drawings')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'drawings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>CAD Inputs</span>
        </button>

        <button
          onClick={() => setActiveTab('seating')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'seating'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Palette className="w-3.5 h-3.5" />
          <span>Seats & Colors</span>
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'safety'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Aisles & Stairs</span>
        </button>

        <button
          onClick={() => setActiveTab('addons')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'addons'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <PlusSquare className="w-3.5 h-3.5" />
          <span>Add-ons</span>
        </button>

        <button
          onClick={() => setActiveTab('pipeline')}
          className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'pipeline'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" />
          <span>Pipeline & BOM</span>
        </button>
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm">
        {/* TAB 1: ARCHITECTURAL DRAWINGS INPUTS */}
        {activeTab === 'drawings' && (
          <div className="space-y-5">
            {/* Rows Selection: {5, 10, 15, 20} */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Rows <span className="text-slate-500 font-mono">{"{5, 10, 15, 20}"}</span>
                </label>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {config.rows} Rows
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {ROWS_OPTIONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => onChange((prev) => ({ ...prev, rows: r }))}
                    className={`py-2 text-center text-xs font-mono font-semibold rounded-md border transition-colors ${
                      config.rows === r
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {r} Rows
                  </button>
                ))}
              </div>
            </div>

            {/* Elevation Selection: {2, 4, 8, 10} */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Front Elevation <span className="text-slate-500 font-mono">{"{2, 4, 8, 10}"} ft</span>
                </label>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {config.elevation === 0 ? 'Ground (0ft)' : `${config.elevation}ft Elevated ($150/seat)`}
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {ELEVATION_OPTIONS.map((elev) => (
                  <button
                    key={elev}
                    onClick={() => onChange((prev) => ({ ...prev, elevation: elev }))}
                    className={`py-2 text-center text-xs font-mono font-semibold rounded-md border transition-colors ${
                      config.elevation === elev
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {elev === 0 ? '0ft' : `${elev}ft`}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-slate-500 mt-1.5 leading-tight">
                {config.elevation > 0
                  ? 'Includes modular stacked 40" box frame towers (Sheet S6) and front walkway.'
                  : 'Non-elevated ground bleacher system ($100 per seat).'}
              </div>
            </div>

            {/* Riser Height (vertical): {8, 12} */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Vertical Riser Height <span className="text-slate-500 font-mono">{"{8, 12}"} in</span>
                </label>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {config.rowRiseInches}" Vertical Rise
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {RISER_OPTIONS.map((rise) => (
                  <button
                    key={rise}
                    onClick={() => onChange((prev) => ({ ...prev, rowRiseInches: rise }))}
                    className={`py-2 text-center text-xs font-mono font-semibold rounded-md border transition-colors ${
                      config.rowRiseInches === rise
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {rise}" Rise {rise === 8 ? '(Typical Standard)' : '(High Sightline)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Horizontal Floor Depth: {26, 30} */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Horizontal Floor Depth (Run) <span className="text-slate-500 font-mono">{"{26, 30}"} in</span>
                </label>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {config.rowRunInches}" Tread Depth
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {DEPTH_OPTIONS.map((depth) => (
                  <button
                    key={depth}
                    onClick={() => onChange((prev) => ({ ...prev, rowRunInches: depth }))}
                    className={`py-2 text-center text-xs font-mono font-semibold rounded-md border transition-colors ${
                      config.rowRunInches === depth
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {depth}" Depth
                  </button>
                ))}
              </div>
            </div>

            {/* Grandstand Length: {42, 78, 120, 180} */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Grandstand Length <span className="text-slate-500 font-mono">{"{42, 78, 120, 180}"} ft</span>
                </label>
                <span className="font-mono text-xs font-bold text-blue-400">
                  {config.lengthFt}'-0" Length
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {LENGTH_OPTIONS.map((len) => (
                  <button
                    key={len}
                    onClick={() => onChange((prev) => ({ ...prev, lengthFt: len }))}
                    className={`py-2 text-center text-xs font-mono font-semibold rounded-md border transition-colors ${
                      config.lengthFt === len
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {len} ft
                  </button>
                ))}
              </div>
            </div>

            {/* Press Box Toggle & Booth Size: {20ft x 8ft, 40ft x 8ft} */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block">
                    Media Press Box & Announcer Booth
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Sheet S7/S8: 1.5"x4" Channel & .040 Sheet Metal
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={config.pressBox.enabled}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      pressBox: { ...prev.pressBox, enabled: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>

              {config.pressBox.enabled && (
<<<<<<< HEAD
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <label className="text-slate-400 block mb-1">
                    Booth Size: <span className="text-blue-400 font-mono">{"{20ft x 8ft, 40ft x 8ft}"}</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['20x8', '40x8'] as PressBoxSize[]).map((size) => (
                      <button
                        key={size}
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            pressBox: {
                              ...prev.pressBox,
                              size,
                              widthFt: size === '40x8' ? 40 : 20,
                            },
                          }))
                        }
                        className={`py-2 text-center rounded font-mono font-semibold border transition-colors ${
                          config.pressBox.size === size
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {size === '20x8' ? '20ft × 8ft Booth' : '40ft × 8ft Booth'}
                      </button>
                    ))}
=======
                <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">
                      Booth Size: <span className="text-blue-400 font-mono">{"{20ft x 8ft, 40ft x 8ft}"}</span>
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {(['20x8', '40x8'] as PressBoxSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() =>
                            onChange((prev) => ({
                              ...prev,
                              pressBox: {
                                ...prev.pressBox,
                                size,
                                widthFt: size === '40x8' ? 40 : 20,
                              },
                            }))
                          }
                          className={`py-2 text-center rounded font-mono font-semibold border transition-colors ${
                            config.pressBox.size === size
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {size === '20x8' ? '20ft × 8ft Booth' : '40ft × 8ft Booth'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Press Box Color Selection */}
                  <div className="p-2.5 bg-slate-950/70 border border-slate-800 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-slate-200 block text-xs">Press Box Exterior Color</span>
                        <span className="text-[11px] text-slate-400">Architectural cladding with white roof fascia & black window frames</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-4 h-4 rounded border border-white/20 shadow-sm"
                          style={{ backgroundColor: config.pressBox.color || '#dc2626' }}
                        />
                        <input
                          type="color"
                          value={config.pressBox.color || '#dc2626'}
                          onChange={(e) =>
                            onChange((prev) => ({
                              ...prev,
                              pressBox: { ...prev.pressBox, color: e.target.value },
                            }))
                          }
                          className="w-6 h-6 bg-transparent border-0 rounded cursor-pointer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5 pt-1">
                      {[
                        { name: 'Crimson Red', hex: '#dc2626' },
                        { name: 'Navy Blue', hex: '#1e3a8a' },
                        { name: 'Royal Blue', hex: '#1d4ed8' },
                        { name: 'Forest Green', hex: '#15803d' },
                        { name: 'Charcoal', hex: '#334155' },
                        { name: 'Arctic White', hex: '#f8fafc' },
                        { name: 'Jet Black', hex: '#0f172a' },
                        { name: 'Athletic Gold', hex: '#eab308' },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          onClick={() =>
                            onChange((prev) => ({
                              ...prev,
                              pressBox: { ...prev.pressBox, color: c.hex },
                            }))
                          }
                          className={`p-1 rounded border text-[10px] flex items-center gap-1.5 ${
                            (config.pressBox.color || '#dc2626') === c.hex
                              ? 'bg-blue-950 border-blue-500 text-white'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.hex }} />
                          <span className="truncate">{c.name}</span>
                        </button>
                      ))}
                    </div>
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                  </div>
                </div>
              )}
            </div>

            {/* Side Barricades Toggle */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-slate-200 block">
                  Side Barricades & Galvanized Mesh
                </label>
                <span className="text-[11px] text-slate-400">
                  Parts RSP, LSP & Galvanized Chain-Link Fence
                </span>
              </div>
              <input
                type="checkbox"
                checked={config.sideBarricades}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, sideBarricades: e.target.checked }))
                }
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </div>

            {/* Platform Access Stairs: {left side, right side, both sides} */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-2">
              <label className="text-xs font-semibold text-slate-200 block">
                Platform Access Stairs: <span className="text-blue-400 font-mono">{"{left side, right side, both sides}"}</span>
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: 'left', label: 'Left Side' },
                  { id: 'right', label: 'Right Side' },
                  { id: 'both', label: 'Both Sides' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        accessStairs: opt.id as AccessStairsOption,
                      }))
                    }
                    className={`py-2 text-center rounded font-medium border transition-colors ${
                      config.accessStairs === opt.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <div className="text-[11px] text-slate-500">
                Ground-to-walkway welded aluminum stair flights with handrails.
              </div>
            </div>

<<<<<<< HEAD
=======
            {/* Front Walkway & Column Support Depth (User CAD Engineering Requirement) */}
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-semibold text-slate-200 block">
                    Front Walkway & Column Support Depth
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Modular frame bent understructure with diagonal cross members
                  </span>
                </div>
                <span className="font-mono text-xs font-bold text-emerald-400 px-2 py-0.5 bg-emerald-950/60 border border-emerald-800/60 rounded">
                  {config.walkwayWidthFt ?? 6}' Walkway · {config.walkwayColumns ?? 3} Columns Deep
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  {
                    id: '6ft-3col',
                    width: 6,
                    cols: 3 as const,
                    label: "6ft — 3 Columns Deep",
                    sub: "2 Bays @ 3.0'",
                  },
                  {
                    id: '8ft-3col',
                    width: 8,
                    cols: 3 as const,
                    label: "8ft — 3 Columns Deep",
                    sub: "2 Bays @ 4.0'",
                  },
                ].map((item) => {
                  const isSelected =
                    (config.walkwayWidthFt ?? 6) === item.width &&
                    (config.walkwayColumns ?? 3) === item.cols;
                  return (
                    <button
                      key={item.id}
                      onClick={() =>
                        onChange((prev) => ({
                          ...prev,
                          walkwayWidthFt: item.width,
                          walkwayColumns: item.cols,
                        }))
                      }
                      className={`py-2 px-2 text-center rounded border transition-colors ${
                        isSelected
                          ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                      }`}
                    >
                      <div className="font-semibold text-xs leading-tight">{item.label}</div>
                      <div className="text-[10px] opacity-75 mt-0.5 font-mono">{item.sub}</div>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded border border-slate-800/80 leading-relaxed font-mono flex items-center justify-between">
                <span>
                  Walkway Depth: <span className="text-white font-bold">{config.walkwayWidthFt ?? 6}'-0"</span> | Columns: <span className="text-emerald-400 font-bold">{config.walkwayColumns ?? 3} posts deep</span>
                </span>
                <span className="text-blue-400 text-[10px]">
                  {(config.walkwayColumns ?? 3) - 1} Cross-braced Bays
                </span>
              </div>
            </div>

>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
            {/* Front Platform X-Pattern Cross Members (Adjustable for Front Elevation Presets {2, 4, 8, 10} ft) */}
            {config.elevation > 0 && (
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-slate-200 block">
                      Front Platform "X" Cross Members
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Adjustable for {config.elevation}ft Front Elevation Preset
                    </span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-blue-400 px-2 py-0.5 bg-blue-950/60 border border-blue-800/60 rounded">
                    {config.elevation}ft Front Platform
                  </span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs block">
                    X-Pattern Bracing Geometry:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: 'modular-tiered', label: 'Modular Box', desc: 'Sheet S6 40"/48"' },
                      { id: 'full-height', label: 'Full Height X', desc: `Single ${config.elevation}ft X` },
                      { id: 'double-x', label: 'Double Diamond', desc: 'Dual lattice' },
                    ].map((m) => (
                      <button
                        key={m.id}
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            frontXBraceMode: m.id as 'modular-tiered' | 'full-height' | 'double-x',
                          }))
                        }
                        className={`py-2 px-1.5 text-center rounded border transition-colors ${
                          config.frontXBraceMode === m.id
                            ? 'bg-blue-600 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-semibold text-[11px] leading-tight">{m.label}</div>
                        <div className="text-[10px] opacity-75">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 text-xs block">
                    Cross Member Structural Profile:
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {[
                      { id: 'flat-bar', label: 'Flat Bar', spec: '2"x3/16" J4/J5' },
                      { id: 'angle-iron', label: 'Angle Iron', spec: '2"x2" H1' },
                      { id: 'pipe', label: 'Pipe Tube', spec: '1.5" OD' },
                    ].map((p) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          onChange((prev) => ({
                            ...prev,
                            frontXBraceProfile: p.id as 'flat-bar' | 'angle-iron' | 'pipe',
                          }))
                        }
                        className={`py-1.5 text-center rounded border transition-colors ${
                          (config.frontXBraceProfile || 'flat-bar') === p.id
                            ? 'bg-blue-600/80 border-blue-500 text-white'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className="font-medium text-[11px]">{p.label}</div>
                        <div className="text-[9px] text-slate-400">{p.spec}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 leading-relaxed font-mono">
                  Bay Width: 6.0ft | Height: {config.elevation}.0ft | Diag: {Math.sqrt(36 + config.elevation ** 2).toFixed(2)}ft
                  <span className="block text-emerald-400 text-[10px] mt-0.5">
                    ✓ Fits corner-to-corner into {config.elevation}ft elevation platform
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SEATING & COLORS */}
        {activeTab === 'seating' && (
          <div className="space-y-5">
            <div>
<<<<<<< HEAD
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Seating System
              </label>
              <div className="grid grid-cols-1 gap-2">
                {[
                  {
                    id: 'bench',
                    name: '2" x 10" Anodized Aluminum Seat Board',
                    desc: 'Sheet S1/S2: Continuous clear anodized aluminum planks.',
                  },
                  {
                    id: 'bench-with-back',
                    name: 'Bench Board w/ Ergonomic Backrest',
                    desc: 'Added lumbar support stanchions on aluminum seating.',
                  },
                  {
                    id: 'stadium-chair',
                    name: 'Molded Flip-Up Stadium Chairs',
                    desc: 'Individual high-density polyethylene stadium seats.',
                  },
                ].map((seat) => (
                  <button
                    key={seat.id}
                    onClick={() =>
                      onChange((prev) => ({ ...prev, seatType: seat.id as SeatType }))
                    }
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      config.seatType === seat.id
                        ? 'bg-blue-600/10 border-blue-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">{seat.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{seat.desc}</div>
                  </button>
                ))}
=======
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                Seating Planks
              </label>
              <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-lg space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">2" × 10" Clear Anodized Aluminum Bench Planks</span>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800">IBC / ICC 300 Standard</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Natural serrated clear anodized aluminum planks with non-skid flutes. Seat planks are fixed natural aluminum (no color changes).
                </p>
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
              </div>
            </div>

            <div>
<<<<<<< HEAD
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Team Color Palette
              </label>
              <div className="grid grid-cols-2 gap-2">
=======
              <div className="flex items-center justify-between mb-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-200">
                    Riser / Kickboard Color
                  </label>
                  <span className="text-[11px] text-slate-400">
                    The vertical kickboard behind each seat that goes up to the next level
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="w-4 h-4 rounded border border-white/20 shadow-sm"
                    style={{ backgroundColor: config.riserColor || config.seatColor || '#1d4ed8' }}
                  />
                  <input
                    type="color"
                    value={config.riserColor || config.seatColor || '#1d4ed8'}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, riserColor: e.target.value }))
                    }
                    className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2.5">
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                {TEAM_PALETTES.map((tp) => (
                  <button
                    key={tp.name}
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
<<<<<<< HEAD
                        seatColor: tp.seat,
                        backrestColor: tp.back,
=======
                        riserColor: tp.seat,
                        seatColor: '#d1d5db',
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                        frameColor: tp.frame,
                      }))
                    }
                    className="p-2 bg-slate-900 border border-slate-800 rounded-md text-left flex items-center gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex gap-1">
                      <span
                        className="w-3.5 h-3.5 rounded-sm border border-black/30"
                        style={{ backgroundColor: tp.seat }}
                      />
                      <span
                        className="w-3.5 h-3.5 rounded-sm border border-black/30"
                        style={{ backgroundColor: tp.frame }}
                      />
                    </div>
                    <span className="text-xs text-slate-300 font-medium truncate">
                      {tp.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
<<<<<<< HEAD
                <span className="text-xs text-slate-300">Seat Finish Color</span>
                <input
                  type="color"
                  value={config.seatColor}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, seatColor: e.target.value }))
                  }
                  className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-300">Understructure Frame Finish</span>
=======
                <div>
                  <span className="text-xs text-slate-300 block">Understructure Frame Finish</span>
                  <span className="text-[10px] text-slate-400">Steel columns, stringers & cross braces</span>
                </div>
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                <input
                  type="color"
                  value={config.frameColor}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, frameColor: e.target.value }))
                  }
                  className="w-7 h-7 bg-transparent border-0 rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: AISLES & SAFETY */}
        {activeTab === 'safety' && (
          <div className="space-y-5">
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Designated Egress Aisles (6ft Wide on Drawings)
                </label>
                <input
                  type="checkbox"
                  checked={config.hasAisle}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, hasAisle: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>

              {config.hasAisle && (
                <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
                  <div>
                    <label className="text-slate-400 block mb-1">Aisle Count</label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((num) => (
                        <button
                          key={num}
                          onClick={() =>
                            onChange((prev) => ({ ...prev, aisleCount: num }))
                          }
                          className={`py-1.5 rounded font-medium border ${
                            config.aisleCount === num
                              ? 'bg-blue-600 border-blue-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400'
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Center Handrail with Loop Returns</span>
                    <input
                      type="checkbox"
                      checked={config.aisleHandrail}
                      onChange={(e) =>
                        onChange((prev) => ({ ...prev, aisleHandrail: e.target.checked }))
                      }
                      className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  ADA Wheelchair Staging
                </label>
                <input
                  type="checkbox"
                  checked={config.adaEnabled}
                  onChange={(e) =>
                    onChange((prev) => ({ ...prev, adaEnabled: e.target.checked }))
                  }
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>

              {config.adaEnabled && (
                <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Wheelchair Locations</span>
                    <span className="font-mono text-blue-400 font-bold">
                      {config.adaSpaces} Spaces
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    value={config.adaSpaces}
                    onChange={(e) =>
                      onChange((prev) => ({ ...prev, adaSpaces: parseInt(e.target.value) }))
                    }
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ADD-ONS */}
        {activeTab === 'addons' && (
          <div className="space-y-5">
            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Cantilever Shade Canopy
                </label>
                <input
                  type="checkbox"
                  checked={config.shadeCanopy.enabled}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      shadeCanopy: { ...prev.shadeCanopy, enabled: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-200">
                  Team Wind Skirting Banner
                </label>
                <input
                  type="checkbox"
                  checked={config.windSkirting.enabled}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      windSkirting: { ...prev.windSkirting, enabled: e.target.checked },
                    }))
                  }
                  className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
                />
              </div>
              {config.windSkirting.enabled && (
                <input
                  type="text"
                  value={config.windSkirting.bannerText}
                  onChange={(e) =>
                    onChange((prev) => ({
                      ...prev,
                      windSkirting: { ...prev.windSkirting, bannerText: e.target.value },
                    }))
                  }
                  placeholder="Team Name..."
                  className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-white text-xs outline-none"
                />
              )}
            </div>

            <div>
<<<<<<< HEAD
              <label className="block text-xs font-medium text-slate-300 mb-2">
                Field Environment
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {[
                  { id: 'football', label: 'Football Turf' },
                  { id: 'basketball', label: 'Hardwood Court' },
                  { id: 'track', label: 'Running Track' },
                  { id: 'architectural-studio', label: 'CAD Studio Grid' },
=======
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-200">
                  Field Environment Terrain
                </label>
                <span className="text-[11px] text-blue-400 font-mono capitalize">
                  {config.fieldEnvironment?.replace('-', ' ') || 'Football'}
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 text-xs">
                {[
                  { id: 'soccer', label: 'Soccer Pitch', desc: 'Regulation grass' },
                  { id: 'football', label: 'Football Turf', desc: '100-yd gridiron' },
                  { id: 'racetrack', label: 'Racetrack', desc: 'Asphalt & kerbs' },
                  { id: 'dirt-track', label: 'Dirt Track', desc: 'Clay speedway' },
                  { id: 'track', label: 'Athletics Track', desc: '8-lane track' },
                  { id: 'basketball', label: 'Hardwood Court', desc: 'Maple parquet' },
                  { id: 'architectural-studio', label: 'CAD Studio', desc: 'Precision grid' },
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                ].map((env) => (
                  <button
                    key={env.id}
                    onClick={() =>
                      onChange((prev) => ({
                        ...prev,
                        fieldEnvironment: env.id as FieldEnvironment,
                      }))
                    }
<<<<<<< HEAD
                    className={`py-2 px-2 text-center rounded border transition-colors ${
                      config.fieldEnvironment === env.id
                        ? 'bg-blue-600 border-blue-500 text-white font-medium'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {env.label}
=======
                    className={`p-2.5 text-left rounded-lg border transition-all ${
                      config.fieldEnvironment === env.id
                        ? 'bg-blue-600/20 border-blue-500 text-white shadow-sm ring-1 ring-blue-500'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <div className="font-semibold text-xs text-slate-200">{env.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{env.desc}</div>
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-900/70 border border-slate-800 rounded-lg text-xs">
              <span className="text-slate-200 font-medium">Dual 45ft Stadium Floodlights</span>
              <input
                type="checkbox"
                checked={config.lightPoles}
                onChange={(e) =>
                  onChange((prev) => ({ ...prev, lightPoles: e.target.checked }))
                }
                className="w-4 h-4 accent-blue-500 rounded cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* TAB 5: PIPELINE INSPECTOR */}
        {activeTab === 'pipeline' && (
          <PipelineInspector config={config} onUpdateConfig={onChange} />
        )}
      </div>
    </aside>
  </>
);
};
