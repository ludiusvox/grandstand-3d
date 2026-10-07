import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Bleacher3DGenerator } from '../engine/Bleacher3DGenerator';
import { BleacherConfig, CameraPreset, CalculatedSpecs } from '../types/bleacher';
import { HUDOverlay } from './HUDOverlay';

interface ViewportProps {
  config: BleacherConfig;
  specs: CalculatedSpecs;
  onChangeConfig: (updater: (prev: BleacherConfig) => BleacherConfig) => void;
  generatorRef: React.MutableRefObject<Bleacher3DGenerator | null>;
}

export const Viewport: React.FC<ViewportProps> = ({
  config,
  specs,
  onChangeConfig,
  generatorRef,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stats, setStats] = useState({
    fps: 60,
    drawCalls: 12,
    triangles: 4800,
    vertices: 9600,
  });
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>('iso');
<<<<<<< HEAD

  // Initialize Three.js Generator
  useEffect(() => {
    if (!containerRef.current) return;

    const generator = new Bleacher3DGenerator(containerRef.current);
    generatorRef.current = generator;

    generator.onStatsUpdate = (newStats) => {
      setStats(newStats);
    };

    generator.updateBleacher(config);

    return () => {
      generator.dispose();
      generatorRef.current = null;
    };
  }, []); // Run once on mount
=======
  const [webglError, setWebglError] = useState<string | null>(null);
  const [isContextLost, setIsContextLost] = useState<boolean>(false);
  const [mountKey, setMountKey] = useState(0);

  // Initialize Three.js Generator with error guard and context recovery
  useEffect(() => {
    if (!containerRef.current) return;
    setWebglError(null);
    setIsContextLost(false);

    let generator: Bleacher3DGenerator | null = null;
    try {
      generator = new Bleacher3DGenerator(containerRef.current);
      generatorRef.current = generator;

      generator.onStatsUpdate = (newStats) => {
        setStats(newStats);
      };

      generator.onContextLost = () => {
        setIsContextLost(true);
      };

      generator.onContextRestored = () => {
        setIsContextLost(false);
      };

      generator.updateBleacher(config);
    } catch (err: any) {
      console.error('Failed to initialize 3D WebGL viewport:', err);
      setWebglError(err?.message || 'WebGL initialization failed');
    }

    return () => {
      if (generator) {
        generator.dispose();
      }
      generatorRef.current = null;
    };
  }, [mountKey]); // Re-mount if user clicks reload
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)

  // Update Bleacher geometry whenever config changes
  useEffect(() => {
    if (generatorRef.current) {
      generatorRef.current.updateBleacher(config);
    }
  }, [config]);

  const handleCameraPreset = useCallback(
    (preset: CameraPreset) => {
      setCurrentPreset(preset);
      if (generatorRef.current) {
        generatorRef.current.setCameraPreset(preset, config.spectatorRow);
      }
    },
    [config.spectatorRow]
  );

  const handleExplodedChange = (value: number) => {
    onChangeConfig((prev) => ({ ...prev, explodedViewOffset: value }));
    if (generatorRef.current) {
      generatorRef.current.applyExplodedOffset(value);
    }
  };

  const handleToggleDimensions = () => {
    onChangeConfig((prev) => ({ ...prev, dimensionOverlay: !prev.dimensionOverlay }));
  };

  const handleToggleWireframe = () => {
    onChangeConfig((prev) => ({ ...prev, wireframeMode: !prev.wireframeMode }));
  };

  const handleSpectatorRowChange = (row: number) => {
    onChangeConfig((prev) => ({ ...prev, spectatorRow: row }));
    if (generatorRef.current) {
      generatorRef.current.setCameraPreset('spectator', row);
    }
  };

  return (
<<<<<<< HEAD
    <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas Mount Node */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
=======
    <div className="relative flex-1 w-full h-full min-h-[240px] overflow-hidden bg-[#0a0f1d]">
      {/* 3D WebGL Canvas Mount Node */}
      <div ref={containerRef} className="w-full h-full min-h-[240px] bg-[#0a0f1d] cursor-grab active:cursor-grabbing" />

      {/* WebGL Memory / Context Recovery Prompt */}
      {(webglError || isContextLost) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-slate-950/95 p-6 text-center backdrop-blur-sm">
          <div className="max-w-md p-6 bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl font-bold">
              ⚡
            </div>
            <h3 className="text-base font-semibold text-slate-100">
              {isContextLost ? 'Mobile GPU Temporarily Paused' : '3D Graphics Initialization'}
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isContextLost
                ? "Your device's GPU paused WebGL to conserve memory. Tap below to restore the 3D model."
                : 'WebGL context was interrupted. Tap below to reload the 3D viewport in memory-safe mode.'}
            </p>
            <button
              onClick={() => {
                setMountKey((prev) => prev + 1);
              }}
              className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              ↻ Reload 3D Canvas
            </button>
          </div>
        </div>
      )}
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)

      {/* Semantic HUD & Controls Layer */}
      <HUDOverlay
        config={config}
        specs={specs}
        stats={stats}
        onCameraPreset={handleCameraPreset}
        currentPreset={currentPreset}
        onExplodedChange={handleExplodedChange}
        onToggleDimensions={handleToggleDimensions}
        onToggleWireframe={handleToggleWireframe}
        onSpectatorRowChange={handleSpectatorRowChange}
      />
    </div>
  );
};
