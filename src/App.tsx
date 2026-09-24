/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import { Header } from './components/Header';
import { Viewport } from './components/Viewport';
import { ConfigSidebar } from './components/ConfigSidebar';
import { SpecModal } from './components/SpecModal';
import { Bleacher3DGenerator } from './engine/Bleacher3DGenerator';
import { BleacherConfig } from './types/bleacher';
import { DEFAULT_CONFIG, PRESETS, calculateSpecs } from './utils/bleacherCalculations';
import { Sliders } from 'lucide-react';

export default function App() {
  const [config, setConfig] = useState<BleacherConfig>(DEFAULT_CONFIG);
  const [activePreset, setActivePreset] = useState<string>('custom');
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Mobile viewport auto-detection and layout state
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < 768;
  });
  const [mobilePlacement, setMobilePlacement] = useState<'panel-top' | 'panel-bottom'>('panel-top');
  const [mobilePanelHeight, setMobilePanelHeight] = useState<'split' | 'fullscreen-3d' | 'fullscreen-panel'>('split');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const generatorRef = useRef<Bleacher3DGenerator | null>(null);

  // Memoized engineering specs calculation
  const specs = useMemo(() => calculateSpecs(config), [config]);

  // Handle Preset Quick Load
  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (preset) {
      setConfig((prev) => ({
        ...prev,
        ...preset,
      }));
      setActivePreset(presetKey);
    }
  };

  // Handle custom config update
  const handleUpdateConfig = (updater: (prev: BleacherConfig) => BleacherConfig) => {
    setActivePreset('custom');
    setConfig(updater);
  };

  // Reset to default
  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setActivePreset('custom');
    if (generatorRef.current) {
      generatorRef.current.setCameraPreset('iso');
    }
  };

  // Screenshot capture
  const handleTakeScreenshot = () => {
    if (!generatorRef.current) return;
    const dataUrl = generatorRef.current.takeScreenshot(2);
    const link = document.createElement('a');
    link.download = `Grandstand_3D_Render_${config.rows}Row_${config.lengthFt}Ft.png`;
    link.href = dataUrl;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-950 text-slate-100 overflow-hidden font-sans">
      {/* 3-Zone Top Bar */}
      <Header
        config={config}
        onApplyPreset={handleApplyPreset}
        onOpenSpecs={() => setIsSpecModalOpen(true)}
        onTakeScreenshot={handleTakeScreenshot}
        onReset={handleReset}
        activePreset={activePreset}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => {
          setIsSidebarOpen(!isSidebarOpen);
          if (isMobile) {
            setMobilePanelHeight('split');
          }
        }}
      />

      {/* Main Interactive Stage */}
      <main
        className={`relative flex-1 flex w-full h-[calc(100vh-3.5rem)] overflow-hidden ${
          isMobile
            ? mobilePlacement === 'panel-top'
              ? 'flex-col'
              : 'flex-col-reverse'
            : 'flex-row'
        }`}
      >
        {/* Mobile Viewport: Grandstand 3D drawing window below panel */}
        {isMobile ? (
          <>
            {/* Top Panel on Mobile */}
            {isSidebarOpen && mobilePanelHeight !== 'fullscreen-3d' && (
              <div
                className={`w-full shrink-0 transition-all duration-300 overflow-hidden ${
                  mobilePanelHeight === 'fullscreen-panel' ? 'h-full' : 'h-[46vh]'
                }`}
              >
                <ConfigSidebar
                  config={config}
                  onChange={handleUpdateConfig}
                  isOpen={isSidebarOpen}
                  onToggleOpen={() => setIsSidebarOpen(false)}
                  isMobile={true}
                  mobilePlacement={mobilePlacement}
                  onToggleMobilePlacement={() =>
                    setMobilePlacement((prev) => (prev === 'panel-top' ? 'panel-bottom' : 'panel-top'))
                  }
                  mobilePanelHeight={mobilePanelHeight}
                  onSetMobilePanelHeight={setMobilePanelHeight}
                />
              </div>
            )}

            {/* Grandstand 3D Drawing Window Below Panel on Mobile */}
            {mobilePanelHeight !== 'fullscreen-panel' && (
              <div className="relative w-full flex-1 min-h-[35vh] h-full overflow-hidden bg-slate-950">
                <Viewport
                  config={config}
                  specs={specs}
                  onChangeConfig={handleUpdateConfig}
                  generatorRef={generatorRef}
                />

                {/* Mobile Floating Action Controls on 3D Drawing Window */}
                <div className="absolute top-2 right-2 z-20 flex items-center gap-1.5 pointer-events-auto">
                  {mobilePanelHeight === 'fullscreen-3d' || !isSidebarOpen ? (
                    <button
                      onClick={() => {
                        setIsSidebarOpen(true);
                        setMobilePanelHeight('split');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-2xl text-xs font-semibold"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>CAD Controls</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setMobilePanelHeight('fullscreen-3d')}
                      className="px-2 py-1 bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700 rounded text-[11px] font-mono shadow-lg"
                      title="Maximize 3D Drawing Window"
                    >
                      ⛶ Maximize 3D
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Desktop & Tablet Viewport Stage (Preserved layout) */
          <>
            {/* 3D WebGL Canvas Viewport */}
            <Viewport
              config={config}
              specs={specs}
              onChangeConfig={handleUpdateConfig}
              generatorRef={generatorRef}
            />

            {/* CAD / Engineering Multi-Tab Config Sidebar */}
            <ConfigSidebar
              config={config}
              onChange={handleUpdateConfig}
              isOpen={isSidebarOpen}
              onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
              isMobile={false}
            />
          </>
        )}
      </main>

      {/* Engineering Specification & Bill of Materials Modal */}
      <SpecModal
        isOpen={isSpecModalOpen}
        onClose={() => setIsSpecModalOpen(false)}
        config={config}
        specs={specs}
      />
    </div>
  );
}
