import {
  BleacherConfig,
  CalculatedSpecs,
  PipelineComponentStats,
  StructuralPartItem,
} from '../types/bleacher';

export const DEFAULT_CONFIG: BleacherConfig = {
  // Input parameters specified by user & drawings
  rows: 10, // {5, 10, 15, 20}
  elevation: 4, // {2, 4, 8, 10} ft
  rowRiseInches: 8, // {8, 12} inches
  rowRunInches: 26, // {26, 30} inches
  lengthFt: 78, // {42, 78, 120, 180} ft

  pressBox: {
    enabled: true,
    size: '20x8',
    widthFt: 20,
    depthFt: 8,
    heightFt: 8,
    hasRoofDeck: true,
    color: '#1e293b',
  },
  sideBarricades: true,
  accessStairs: 'both', // {left side, right side, both sides}
  frontXBraceMode: 'modular-tiered', // {modular-tiered, full-height} adjustable front cross members

  frameType: 'angle-frame',
  frameSpacingFt: 6, // 6ft on-center typical
  deckType: 'double-foot',
  riserType: 'semi-closed',
  seatType: 'bench',

  seatColor: '#1d4ed8', // Royal Blue
  frameColor: '#cbd5e1', // Galvanized Zinc
  backrestColor: '#1e40af',
  deckColor: '#94a3b8',

  hasAisle: true,
  aisleCount: 2,
  aisleWidthInches: 72, // 6ft aisle from drawings (Page 2 & 3: 6' stairs & aisles)
  aisleHandrail: true,
  contrastAisleStep: true,

  backGuardrail: true,
  sideGuardrails: true,
  guardrailStyle: 'chain-link-mesh', // Galvanized chain link from drawings
  railColor: '#64748b',

  adaEnabled: true,
  adaSpaces: 4,
  hasAdaRamp: true,

  shadeCanopy: {
    enabled: false,
    type: 'cantilever',
    fabricColor: '#2563eb',
  },
  windSkirting: {
    enabled: true,
    bannerText: 'WILDCATS STADIUM',
    color: '#1e3a8a',
  },
  sponsorship: {
    enabled: true,
    sponsorName: 'WILDCATS ATHLETICS',
    sponsorSub: 'CERTIFIED STRUCTURAL BLEACHERS',
  },
  fieldEnvironment: 'football',
  lightPoles: true,

  explodedViewOffset: 0,
  dimensionOverlay: true,
  wireframeMode: false,
  spectatorRow: 4,
};

export const PRESETS: Record<string, Partial<BleacherConfig>> = {
  'drawing-5row-42ft': {
    rows: 5,
    elevation: 2,
    rowRiseInches: 8,
    rowRunInches: 26,
    lengthFt: 42,
    pressBox: { enabled: false, size: '20x8', widthFt: 20, depthFt: 8, heightFt: 8, hasRoofDeck: false, color: '#1e293b' },
    sideBarricades: true,
    accessStairs: 'left',
    aisleCount: 1,
    adaEnabled: false,
  },
  'drawing-10row-78ft': {
    rows: 10,
    elevation: 4,
    rowRiseInches: 8,
    rowRunInches: 26,
    lengthFt: 78,
    pressBox: { enabled: true, size: '20x8', widthFt: 20, depthFt: 8, heightFt: 8, hasRoofDeck: true, color: '#1e293b' },
    sideBarricades: true,
    accessStairs: 'both',
    aisleCount: 2,
    adaEnabled: true,
    adaSpaces: 4,
  },
  'drawing-15row-120ft': {
    rows: 15,
    elevation: 8,
    rowRiseInches: 8,
    rowRunInches: 30,
    lengthFt: 120,
    pressBox: { enabled: true, size: '40x8', widthFt: 40, depthFt: 8, heightFt: 8, hasRoofDeck: true, color: '#1e293b' },
    sideBarricades: true,
    accessStairs: 'both',
    aisleCount: 3,
    adaEnabled: true,
    adaSpaces: 6,
  },
  'drawing-20row-180ft': {
    rows: 20,
    elevation: 10,
    rowRiseInches: 12,
    rowRunInches: 30,
    lengthFt: 180,
    pressBox: { enabled: true, size: '40x8', widthFt: 40, depthFt: 8, heightFt: 8, hasRoofDeck: true, color: '#1e293b' },
    sideBarricades: true,
    accessStairs: 'both',
    aisleCount: 4,
    adaEnabled: true,
    adaSpaces: 8,
  },
};

/**
 * Calculates complete engineering quantities, capacity, costs,
 * and generates the itemized Structural Parts List matching DOTec Engineering drawings.
 */
export function calculateSpecs(config: BleacherConfig): CalculatedSpecs {
  const seatWidthFeet = 1.5; // 18 inches standard per seat as on drawings: "20 SEATS @ 18\" = 30'"
  const totalLength = config.lengthFt;

  // Aisle deductions (each aisle is 6ft = 72" as on drawings)
  const aisleWidthFeet = config.hasAisle ? config.aisleWidthInches / 12 : 0;
  const aisleDeductionFeet = config.hasAisle ? config.aisleCount * aisleWidthFeet : 0;
  const usableLengthPerRow = Math.max(0, totalLength - aisleDeductionFeet);

  const seatsPerRow = Math.floor(usableLengthPerRow / seatWidthFeet);
  let standardCapacity = seatsPerRow * config.rows;

  let adaCapacity = 0;
  let companionCapacity = 0;
  if (config.adaEnabled) {
    adaCapacity = config.adaSpaces;
    companionCapacity = config.adaSpaces;
    standardCapacity = Math.max(0, standardCapacity - config.adaSpaces * 2);
  }

  const totalCapacity = standardCapacity + adaCapacity;

  // Pricing model requested:
  // $150 per seat for elevated seat, $100 per seat for non-elevated seat
  const isElevated = config.elevation > 0;
  const costPerSeat = isElevated ? 150 : 100;
  const seatingCostUsd = totalCapacity * costPerSeat;

  let optionsCostUsd = 0;
  if (config.pressBox.enabled) {
    optionsCostUsd += config.pressBox.size === '40x8' ? 24000 : 14000;
  }
  if (config.accessStairs === 'both') {
    optionsCostUsd += 4800;
  } else if (config.accessStairs === 'left' || config.accessStairs === 'right') {
    optionsCostUsd += 2400;
  }
  if (config.sideBarricades) {
    optionsCostUsd += 1800;
  }

  const totalCostUsd = seatingCostUsd + optionsCostUsd;

  // Structural Dimensions
  const frontWalkwayDepth = isElevated ? 5.0 : 2.0; // 5ft front walkway when elevated
  const depthFeet = parseFloat(((config.rows * config.rowRunInches) / 12 + frontWalkwayDepth).toFixed(1));
  const topSeatHeightFeet = parseFloat((config.elevation + (config.rows * config.rowRiseInches) / 12).toFixed(1));
  const overallHeightFeet = parseFloat(
    (topSeatHeightFeet + (config.pressBox.enabled ? 8.5 : 3.5)).toFixed(1)
  );

  // Structural Framing Counts
  const baysCount = Math.ceil(config.lengthFt / config.frameSpacingFt);
  const frameCount = baysCount + 1; // Frames spaced at 6' O.C.

  // Material Take-Offs
  const footboardPlanksPerRow = config.deckType === 'single-foot' ? 1 : 2;
  const seatPlanksPerRow = 1;
  const riserPlanksPerRow = config.riserType === 'open' ? 0 : 1;
  const aluminumLinearFeet =
    (footboardPlanksPerRow + seatPlanksPerRow + riserPlanksPerRow) * config.rows * totalLength +
    (isElevated ? 3 * totalLength : 0); // front walkway planks

  // Steel Weight Estimation
  const frameTierCount = Math.max(1, Math.round(config.elevation / 3.33));
  const weightPerFrame = (config.rows * 45) + (isElevated ? frameTierCount * 85 : 0);
  const steelWeightLbs = Math.round(frameCount * weightPerFrame);

  // Generate Itemized Part List matching DOTec Sheet S0 / S1 / S6
  const structuralParts: StructuralPartItem[] = [
    {
      partId: 'Part SRC',
      partName: 'Five Row Frame Seat Raker Angle',
      material: '2" x 2" x 3/16" Aluminum / Steel Angle',
      quantity: Math.ceil(config.rows / 5) * frameCount,
      unit: 'Pieces',
      description: 'Primary sloped seat raker support angle connecting row treads.',
      drawingRef: 'Sheet S0 / S3 Detail',
    },
    {
      partId: 'Part A & A1',
      partName: 'Seat & Foot Bracket Angles',
      material: '2" x 2" x 3/16" Angle (1\'-11 1/2" & 2\'-1 7/16")',
      quantity: config.rows * frameCount,
      unit: 'Pieces',
      description: 'Horizontal step brackets supporting 2x10 seat and footboard planks.',
      drawingRef: 'Sheet S3 Details A & A1',
    },
    {
      partId: 'Part C, D, E, F, G',
      partName: 'Vertical Column Upright Posts',
      material: '2" x 2" x 3/16" Angle (1\'-2" to 3\'-10")',
      quantity: Math.ceil(config.rows / 2) * frameCount,
      unit: 'Pieces',
      description: 'Graduated vertical angle columns supporting raker stringer beam.',
      drawingRef: 'Sheet S4 Details',
    },
    {
      partId: 'Part H',
      partName: 'Frame Diagonal Support Strut',
      material: '2" x 2" x 3/16" Angle (3\'-1 3/16")',
      quantity: frameCount * 2,
      unit: 'Pieces',
      description: 'Internal diagonal compression brace stiffening frame bay.',
      drawingRef: 'Sheet S3 Detail H',
    },
  ];

  // If Elevated: Include Box Frame Assembly Parts from Sheet S6
  if (isElevated) {
    const boxFrameUnits = frameCount * frameTierCount;
    structuralParts.push(
      {
        partId: 'Part A2',
        partName: 'Box Frame Vertical Column (Front/Rear)',
        material: '2" x 2" x 3/16" Angle (3\'-3")',
        quantity: boxFrameUnits * 2,
        unit: 'Pieces',
        description: 'Vertical box frame leg supporting elevated grandstand deck.',
        drawingRef: 'Sheet S6 Typical 40" Box Frame',
      },
      {
        partId: 'Part B1',
        partName: 'Box Frame Middle Vertical Column',
        material: '2" x 2" x 3/16" Angle (3\'-3")',
        quantity: boxFrameUnits * 2,
        unit: 'Pieces',
        description: 'Intermediate vertical stiffener in 40" box frame unit.',
        drawingRef: 'Sheet S6 Detail B1',
      },
      {
        partId: 'Part H1',
        partName: 'Box Frame Diagonal Angle Brace',
        material: '2" x 2" x 3/16" Angle (3\'-9 5/8")',
        quantity: boxFrameUnits * 2,
        unit: 'Pieces',
        description: 'Internal shear brace inside elevated box frame assembly.',
        drawingRef: 'Sheet S6 Detail H1',
      },
      {
        partId: 'Part I & I1',
        partName: 'Box Frame Top & Bottom Runners',
        material: '2" x 2" x 3/16" Angle (8\'-2")',
        quantity: boxFrameUnits * 2,
        unit: 'Pieces',
        description: 'Continuous horizontal ledger angle linking box column tiers.',
        drawingRef: 'Sheet S6 Details I & I1',
      },
      {
        partId: 'Part J4 & J5',
        partName: 'Front & Rear Box Frame Adjustable X-Brace Cross Members',
        material: `2" x 3/16" Flat Bar (${(Math.sqrt(36 + Math.pow(config.elevation / (config.frontXBraceMode === 'full-height' ? 1 : frameTierCount), 2))).toFixed(2)}ft / ${(Math.sqrt(36 + Math.pow(config.elevation / (config.frontXBraceMode === 'full-height' ? 1 : frameTierCount), 2)) * 12).toFixed(1)}" Long)`,
        quantity: baysCount * (config.frontXBraceMode === 'full-height' ? 1 : frameTierCount) * 4,
        unit: 'Pieces',
        description: `Adjustable front platform sway cross members sized to fit ${config.elevation}ft elevation (${config.frontXBraceMode === 'full-height' ? 'full-height' : `${frameTierCount} tier(s)`}).`,
        drawingRef: 'Sheet S6 Details J4 & J5',
      },
      {
        partId: 'Part BFC',
        partName: 'Box Frame Connection Angle',
        material: '2" x 2" x 3/16" Angle Clips',
        quantity: boxFrameUnits * 4,
        unit: 'Pieces',
        description: 'Bolted splice clips connecting stacked 40" elevation box frames.',
        drawingRef: 'Sheet S0 / S6 Part List',
      }
    );
  }

  // Continuous Bracing
  structuralParts.push({
    partId: 'Part CB',
    partName: 'Continuous Bracing Angle',
    material: '2" x 2" x 3/16" Angle (6\'-1 1/2")',
    quantity: baysCount * Math.ceil(config.rows / 3),
    unit: 'Pieces',
    description: 'Longitudinal horizontal sway angle connecting frames along full length.',
    drawingRef: 'Sheet S4 Detail CB',
  });

  // Guardrail Posts & Enclosure from Sheet S5
  if (config.backGuardrail || config.sideGuardrails || config.sideBarricades) {
    structuralParts.push(
      {
        partId: 'Part RGP',
        partName: 'Rear Guard Post',
        material: '2" x 2" x 3/16" Steel (5\'-2 5/16")',
        quantity: Math.ceil(config.lengthFt / 6) + 1,
        unit: 'Pieces',
        description: 'Upright post along rear supporting 42" safety fence and top rail.',
        drawingRef: 'Sheet S5 Detail RGP',
      },
      {
        partId: 'Part RSP & LSP',
        partName: 'Side Guard Posts (Right & Left)',
        material: '2" x 2" x 3/16" Steel (4\'-11 5/16")',
        quantity: config.rows * 2,
        unit: 'Pieces',
        description: 'Sloped side barricade guard posts along stepped perimeter.',
        drawingRef: 'Sheet S5 Details RSP & LSP',
      },
      {
        partId: 'Part RCT & LCT',
        partName: 'Corner Trim Aluminum Angles',
        material: '2" x 2" x 3/16" Aluminum Angle (4\'-9")',
        quantity: 4,
        unit: 'Pieces',
        description: 'Protective corner transitions enclosing side-to-rear guard junctions.',
        drawingRef: 'Sheet S5 Details RCT & LCT',
      },
      {
        partId: 'Galvanized Fence',
        partName: 'Galvanized Chain Link Fence',
        material: '9-Gauge Galvanized Steel Fabric',
        quantity: Math.round(config.lengthFt + config.rows * (config.rowRunInches / 12) * 2),
        unit: 'Lin. Ft',
        description: 'Safety infill mesh on sides and rear (Sheet S1/S2 typical).',
        drawingRef: 'Sheet S1 / S2 Elevation',
      }
    );
  }

  // Aluminum Boards (Sheet S1/S2)
  structuralParts.push(
    {
      partId: 'Seat Boards',
      partName: 'Anodized Aluminum Seat Boards',
      material: '2" x 10" 6063-T6 Fluted Aluminum Planks',
      quantity: Math.ceil(config.lengthFt / 20) * config.rows,
      unit: 'Planks',
      description: 'Clear anodized smooth seat boards with fluted non-skid surface.',
      drawingRef: 'Sheet S1/S2/S3 Detail',
    },
    {
      partId: 'Foot Boards',
      partName: 'Mill Finish Aisle & Foot Boards',
      material: '2" x 10" / 2" x 5" Mill Finish Aluminum',
      quantity: Math.ceil(config.lengthFt / 20) * config.rows * (config.deckType === 'single-foot' ? 1 : 2),
      unit: 'Planks',
      description: 'Slip-resistant tread decking planks spanning frame bays.',
      drawingRef: 'Sheet S1/S2/S3 Detail',
    }
  );

  // Hardware and Anchors
  structuralParts.push(
    {
      partId: 'Anchors',
      partName: 'Hilti Kwik-TZ Anchor Bolts',
      material: '3/8" Ø Steel Anchor Bolts w/ 2.5" Min Embedment',
      quantity: frameCount * 2,
      unit: 'Bolts',
      description: 'Foundation hold-down anchors securing frame base to concrete sill.',
      drawingRef: 'Sheet S2 / S3 Detail A',
    },
    {
      partId: 'Clips & Fasteners',
      partName: 'Plank Hold Down Clips & Bolts',
      material: '3/8" x 1-1/4" Carriage Bolts & Flange Nuts',
      quantity: config.rows * frameCount * 6,
      unit: 'Kits',
      description: 'Aluminum hold-down clips clamping planks to angle brackets.',
      drawingRef: 'Sheet S3 Plank Attachment Detail',
    }
  );

  // Access Stairs
  if (config.accessStairs !== 'none') {
    const stairFlights = config.accessStairs === 'both' ? 2 : 1;
    structuralParts.push({
      partId: 'Access Stairs',
      partName: `Platform Access Stairways (${config.accessStairs})`,
      material: 'Welded Aluminum Stringers with Non-Skid Treads & 1.5" Pipe Railings',
      quantity: stairFlights,
      unit: 'Flight Assemblies',
      description: `Ground-to-walkway egress stairs installed on ${config.accessStairs} of grandstand.`,
      drawingRef: 'Sheet S1 Seating Plan (Stairs)',
    });
  }

  // Press Box
  if (config.pressBox.enabled) {
    structuralParts.push({
      partId: 'Press Box',
      partName: `Modular Press Box & Media Cabin (${config.pressBox.size})`,
      material: '1.5" x 4" x 1/4" Steel Channel Frame, .040 Sheet Metal, Tinted Glazing',
      quantity: 1,
      unit: 'Complete Booth',
      description: `${config.pressBox.size} announcer booth with observation windows & roof deck.`,
      drawingRef: 'Sheet S7 / S8 Press Box Details',
    });
  }

  // Code Compliance Audit
  const codeCompliances: CalculatedSpecs['codeCompliances'] = [
    {
      rule: 'IBC 1029.16.2 / Guardrail Standard',
      status: topSeatHeightFeet > 2.5 && !config.backGuardrail ? 'warning' : 'pass',
      detail: topSeatHeightFeet > 2.5
        ? (config.backGuardrail ? 'Passed: Top deck > 30" equipped with 42" safety guardrail.' : 'Warning: Bleachers over 30" require guardrails.')
        : 'Passed: Low-rise bleacher under 30" above grade.',
    },
    {
      rule: 'ICC 300 Section 403 / Infill Safety',
      status: config.guardrailStyle === 'chain-link-mesh' || config.guardrailStyle === 'vertical-pickets' ? 'pass' : 'warning',
      detail: 'Passed: Galvanized chain-link mesh and corner trims prevent passage of a 4" sphere.',
    },
    {
      rule: 'ADA Accessibility Standards / Chapter 8',
      status: config.rows > 5 && !config.adaEnabled ? 'warning' : 'pass',
      detail: config.adaEnabled
        ? `Passed: ${adaCapacity} designated wheelchair locations with companion seating.`
        : (config.rows > 5 ? 'Warning: Bleachers with >50 capacity require designated wheelchair locations.' : 'Notice: Small community bleacher.'),
    },
    {
      rule: 'IBC 1029.13 / Egress Aisle Width',
      status: config.hasAisle ? 'pass' : 'warning',
      detail: config.hasAisle
        ? `Passed: ${config.aisleCount} designated ${config.aisleWidthInches}" aisle(s) with stairs and center handrail.`
        : 'Warning: Bleachers over 6 rows require designated clear aisles.',
    },
  ];

  return {
    standardCapacity,
    adaCapacity,
    companionCapacity,
    totalCapacity,
    widthFeet: totalLength,
    depthFeet,
    topSeatHeightFeet,
    overallHeightFeet,
    aluminumLinearFeet: Math.round(aluminumLinearFeet),
    steelWeightLbs,
    isElevated,
    costPerSeat,
    seatingCostUsd,
    optionsCostUsd,
    totalCostUsd,
    structuralParts,
    codeCompliances,
  };
}

export function generateComponentPipelineStats(config: BleacherConfig): PipelineComponentStats[] {
  const baysCount = Math.ceil(config.lengthFt / config.frameSpacingFt);
  const frameCount = baysCount + 1;
  const rows = config.rows;
  const isElevated = config.elevation > 0;

  return [
    {
      id: 'comp_understructure_frames',
      name: isElevated ? `Elevated Box Frame Understructure (${config.elevation}ft)` : 'Angle Frame Rakers (Sheet S3/S4)',
      category: 'structure',
      enabled: true,
      vertexCount: frameCount * rows * 64 + (isElevated ? frameCount * 128 : 0),
      triangleCount: frameCount * rows * 42 + (isElevated ? frameCount * 96 : 0),
      drawCalls: isElevated ? 4 : 2,
      materialName: '2"x2"x3/16" Structural Steel Angle (A36 / ASTM A992)',
      description: 'Primary load-bearing understructure, Parts A2, B1, H1, I, I1 box frame tiers and cross braces.',
    },
    {
      id: 'comp_sway_braces',
      name: 'Continuous & X-Bracing (Parts CB, J4, J5)',
      category: 'structure',
      enabled: true,
      vertexCount: baysCount * 96,
      triangleCount: baysCount * 64,
      drawCalls: 1,
      materialName: '2"x3/16" Flat Bar & 2"x2"x3/16" Angle',
      description: 'Longitudinal X-bracing linking adjacent 6ft frame bays to resist wind and seismic loads.',
    },
    {
      id: 'comp_deck_planks',
      name: '2" x 10" Anodized Aluminum Seat & Foot Boards',
      category: 'deck',
      enabled: true,
      vertexCount: rows * 2 * 128 + (isElevated ? 256 : 0),
      triangleCount: rows * 2 * 96 + (isElevated ? 192 : 0),
      drawCalls: 2,
      materialName: '6063-T6 Extruded Aluminum (Anodized & Mill Finish)',
      description: '2x10 seat boards, 2x5 aisle boards, and 2x10 double footboards with fluted non-skid ribs.',
    },
    {
      id: 'comp_riser_closures',
      name: `6" Vertical Seat Board Risers (Typ)`,
      category: 'deck',
      enabled: config.riserType !== 'open',
      vertexCount: config.riserType === 'open' ? 0 : rows * 64,
      triangleCount: config.riserType === 'open' ? 0 : rows * 48,
      drawCalls: config.riserType === 'open' ? 0 : 1,
      materialName: 'Clear Anodized Aluminum Riser Closures',
      description: 'Vertical closure boards preventing child fall hazards beneath seating deck.',
    },
    {
      id: 'comp_guardrail_fence',
      name: 'Galvanized Chain Link Fence & Posts (Parts RGP, RSP, LSP)',
      category: 'safety',
      enabled: config.backGuardrail || config.sideGuardrails || config.sideBarricades,
      vertexCount: 680,
      triangleCount: 480,
      drawCalls: 3,
      materialName: 'Galvanized 9-Gauge Chain Link & 2" Steel Angle Posts',
      description: '42" perimeter safety enclosure with corner trims RCT/LCT as specified on Sheet S1/S2/S5.',
    },
    {
      id: 'comp_access_stairs',
      name: `Platform Access Stairways (${config.accessStairs})`,
      category: 'safety',
      enabled: config.accessStairs !== 'none',
      vertexCount: config.accessStairs === 'both' ? 480 : 240,
      triangleCount: config.accessStairs === 'both' ? 360 : 180,
      drawCalls: 2,
      materialName: 'Welded Aluminum Stringers & Safety Handrails',
      description: `Egress stair flights providing code-compliant access to elevated walkway.`,
    },
    {
      id: 'comp_press_box',
      name: `Media Press Box (${config.pressBox.size})`,
      category: 'accessory',
      enabled: config.pressBox.enabled,
      vertexCount: config.pressBox.enabled ? 960 : 0,
      triangleCount: config.pressBox.enabled ? 720 : 0,
      drawCalls: config.pressBox.enabled ? 4 : 0,
      materialName: '1.5"x4"x1/4" Steel Channel & .040 Sheet Metal',
      description: 'Rear-mounted announcer booth with tinted windows and roof filming deck (Sheet S7/S8).',
    },
  ];
}

/**
 * Returns a standalone runnable script string that computes the BOM and components
 */
export function getStandaloneBomScript(): string {
  return `/**
 * GRANDSTAND 3D STRUCTURAL BILL OF MATERIALS & COST SCRIPT
 * Compatible with DOTec Engineering / North Carolina Welding Architectural Standards
 */

interface BleacherInput {
  rows: 5 | 10 | 15 | 20;
  elevation: 0 | 2 | 4 | 8 | 10; // feet
  riserHeight: 8 | 12; // inches
  floorDepth: 24 | 26 | 30; // inches
  lengthFt: 42 | 78 | 120 | 180; // feet
  pressBox: boolean;
  pressBoxSize?: '20x8' | '40x8';
  accessStairs: 'left' | 'right' | 'both' | 'none';
  sideBarricades: boolean;
}

function calculateBleacherBOM(input: BleacherInput) {
  const seatWidthFt = 1.5; // 18" standard seat spacing
  const aisleWidthFt = 6.0; // 6ft designated aisles from drawings
  const aisleCount = input.lengthFt <= 42 ? 1 : input.lengthFt <= 78 ? 2 : input.lengthFt <= 120 ? 3 : 4;
  
  const usableLength = input.lengthFt - (aisleCount * aisleWidthFt);
  const seatsPerRow = Math.floor(usableLength / seatWidthFt);
  const totalCapacity = seatsPerRow * input.rows;
  
  // Cost rule: $150 for elevated seat, $100 for non-elevated seat
  const isElevated = input.elevation > 0;
  const costPerSeat = isElevated ? 150 : 100;
  const seatingCost = totalCapacity * costPerSeat;
  
  // Frame bay calculation (6ft on-center typical)
  const baysCount = Math.ceil(input.lengthFt / 6);
  const frameCount = baysCount + 1;
  const frameTierCount = Math.max(1, Math.round(input.elevation / 3.33));
  
  // Component take-offs
  const parts = {
    seatRakers_SRC: Math.ceil(input.rows / 5) * frameCount,
    seatBrackets_A_A1: input.rows * frameCount,
    columnPosts_C_D_E_F_G: Math.ceil(input.rows / 2) * frameCount,
    strutAngles_H: frameCount * 2,
    continuousBracing_CB: baysCount * Math.ceil(input.rows / 3),
    // Elevated Box Frame Assembly (Sheet S6)
    boxFrameLegs_A2: isElevated ? frameCount * frameTierCount * 2 : 0,
    boxFrameMiddles_B1: isElevated ? frameCount * frameTierCount * 2 : 0,
    boxFrameBraces_H1: isElevated ? frameCount * frameTierCount * 2 : 0,
    boxFrameRunners_I_I1: isElevated ? frameCount * frameTierCount * 2 : 0,
    boxFrameXBrace_J4_J5: isElevated ? baysCount * frameTierCount * 4 : 0,
    // Aluminum Planks
    seatPlanks2x10_linFt: input.rows * input.lengthFt,
    footPlanks2x10_linFt: input.rows * 2 * input.lengthFt,
    riserPlanks6in_linFt: input.rows * input.lengthFt,
    // Guardrails & Fence
    rearPosts_RGP: Math.ceil(input.lengthFt / 6) + 1,
    sidePosts_RSP_LSP: input.rows * 2,
    chainLinkFence_linFt: input.lengthFt + (input.rows * (input.floorDepth / 12) * 2),
    // Anchor bolts & clips
    hiltiKwikTzAnchors: frameCount * 2,
    holdDownClips: input.rows * frameCount * 6,
  };
  
  return {
    input,
    capacity: totalCapacity,
    isElevated,
    costPerSeat,
    seatingCost,
    parts,
  };
}

// Example execution:
const result = calculateBleacherBOM({
  rows: 10,
  elevation: 4,
  riserHeight: 8,
  floorDepth: 26,
  lengthFt: 78,
  pressBox: true,
  pressBoxSize: '20x8',
  accessStairs: 'both',
  sideBarricades: true
});

console.log('Total Capacity:', result.capacity, 'seats');
console.log('Seating Cost ($150/elevated seat):', '$' + result.seatingCost.toLocaleString());
console.log('BOM Parts:', result.parts);
`;
}
