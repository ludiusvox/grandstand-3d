/**
 * Type definitions for Grandstand 3D Bleachers Visualizer & Pipeline
 * Grounded in DOTec Professional Engineering / North Carolina Welding Architectural Drawings
 */

export type AllowedRows = 5 | 10 | 15 | 20;
export type AllowedElevation = 0 | 2 | 4 | 8 | 10; // in feet
export type AllowedRiserHeight = 8 | 12; // in inches
export type AllowedFloorDepth = 24 | 26 | 30; // in inches
export type AllowedLength = 42 | 78 | 120 | 180; // in feet
export type PressBoxSize = '20x8' | '40x8';
export type AccessStairsOption = 'left' | 'right' | 'both' | 'none';

export type FrameType = 'angle-frame' | 'i-beam-structural' | 'transportable';
export type DeckType = 'single-foot' | 'double-foot' | 'interlocking-deck';
export type RiserType = 'open' | 'semi-closed' | 'fully-closed';
export type SeatType = 'bench' | 'bench-with-back' | 'stadium-chair' | 'vip-cushioned';
export type GuardrailStyle = 'vertical-pickets' | 'chain-link-mesh' | 'multi-rail';
export type FieldEnvironment = 'football' | 'basketball' | 'baseball' | 'track' | 'architectural-studio';
export type CameraPreset = 'iso' | 'front' | 'side' | 'top' | 'spectator' | 'understructure';

export interface PressBoxConfig {
  enabled: boolean;
  size: PressBoxSize; // '20x8' or '40x8'
  widthFt: number; // 20 or 40
  depthFt: number; // 8
  heightFt: number; // 8 (from drawing S7/S8)
  hasRoofDeck: boolean;
  color: string;
}

export interface ShadeCanopyConfig {
  enabled: boolean;
  type: 'cantilever' | 'arch-barrel' | 'tension-sail';
  fabricColor: string;
}

export interface WindSkirtingConfig {
  enabled: boolean;
  bannerText: string;
  color: string;
}

export interface SponsorshipConfig {
  enabled: boolean;
  sponsorName: string;
  sponsorSub: string;
}

export interface BleacherConfig {
  // Core Architectural Drawing Inputs
  rows: AllowedRows; // {5, 10, 15, 20}
  elevation: AllowedElevation; // {2, 4, 8, 10} ft
  rowRiseInches: AllowedRiserHeight; // {8, 12} inches
  rowRunInches: AllowedFloorDepth; // {26, 30} inches (horizontal floor depth)
  lengthFt: AllowedLength; // {42, 78, 120, 180} ft

  // Architectural Drawing Specific Toggles
  pressBox: PressBoxConfig; // {20ft x 8ft, 40ft x 8ft}
  sideBarricades: boolean; // side barricades toggle (galvanized chain link)
  accessStairs: AccessStairsOption; // {left side, right side, both sides}
  frontXBraceMode: 'modular-tiered' | 'full-height' | 'double-x'; // Adjustable X-bracing for front elevation presets
  frontXBraceProfile?: 'flat-bar' | 'angle-iron' | 'pipe'; // Structural cross member profile

  // Structural & Deck Properties
  frameType: FrameType;
  frameSpacingFt: number; // 6ft on-center typical
  deckType: DeckType;
  riserType: RiserType;
  seatType: SeatType;

  // Finishes
  seatColor: string;
  frameColor: string;
  backrestColor: string;
  deckColor: string;

  // Aisles & Egress (from Drawings: 6ft wide aisles with 20 seats @ 18" = 30ft bays)
  hasAisle: boolean;
  aisleCount: number;
  aisleWidthInches: number;
  aisleHandrail: boolean;
  contrastAisleStep: boolean;

  // Guardrails & Safety
  backGuardrail: boolean;
  sideGuardrails: boolean;
  guardrailStyle: GuardrailStyle;
  railColor: string;

  // ADA Accessibility
  adaEnabled: boolean;
  adaSpaces: number;
  hasAdaRamp: boolean;

  // Add-ons
  shadeCanopy: ShadeCanopyConfig;
  windSkirting: WindSkirtingConfig;
  sponsorship: SponsorshipConfig;
  fieldEnvironment: FieldEnvironment;
  lightPoles: boolean;

  // Inspection & Viewport Controls
  explodedViewOffset: number; // 0 to 1
  dimensionOverlay: boolean;
  wireframeMode: boolean;
  spectatorRow: number;
}

export interface StructuralPartItem {
  partId: string;
  partName: string;
  material: string;
  quantity: number;
  unit: string;
  description: string;
  drawingRef: string;
}

export interface CalculatedSpecs {
  standardCapacity: number;
  adaCapacity: number;
  companionCapacity: number;
  totalCapacity: number;
  widthFeet: number;
  depthFeet: number;
  topSeatHeightFeet: number;
  overallHeightFeet: number;
  aluminumLinearFeet: number;
  steelWeightLbs: number;
  
  // Cost breakdown requested
  isElevated: boolean;
  costPerSeat: number; // $150 if elevated, $100 if non-elevated
  seatingCostUsd: number;
  optionsCostUsd: number;
  totalCostUsd: number;

  // Itemized Structural Parts List from Architectural Drawings
  structuralParts: StructuralPartItem[];

  codeCompliances: {
    rule: string;
    status: 'pass' | 'warning' | 'info';
    detail: string;
  }[];
}

export interface PipelineComponentStats {
  id: string;
  name: string;
  category: 'structure' | 'deck' | 'seating' | 'safety' | 'accessory' | 'environment';
  enabled: boolean;
  vertexCount: number;
  triangleCount: number;
  drawCalls: number;
  materialName: string;
  description: string;
}
