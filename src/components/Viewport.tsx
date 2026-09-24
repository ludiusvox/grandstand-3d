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
    <div className="relative flex-1 w-full h-full overflow-hidden bg-slate-950">
      {/* 3D WebGL Canvas Mount Node */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

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
