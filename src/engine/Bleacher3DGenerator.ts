import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { BleacherConfig, CameraPreset } from '../types/bleacher';

export class Bleacher3DGenerator {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private animationFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // Geometry Groups for Exploded BIM Layering
  private masterGroup: THREE.Group;
  private layerGround: THREE.Group;
  private layerUnderstructureBox: THREE.Group; // Elevated Box Frames (Sheet S6)
  private layerFrames: THREE.Group;
  private layerDeck: THREE.Group;
  private layerRisers: THREE.Group;
  private layerSeats: THREE.Group;
  private layerRails: THREE.Group;
  private layerAisles: THREE.Group;
  private layerStairs: THREE.Group; // Left / Right / Both Access Stairs
  private layerAda: THREE.Group;
  private layerPressBox: THREE.Group; // 20x8 or 40x8 Booth
  private layerCanopy: THREE.Group;
  private layerAccessories: THREE.Group;
  private layerDimensions: THREE.Group;

  // Lights
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private groundMesh: THREE.Mesh | null = null;

  // Reusable materials cache
  private materialsCache: Map<string, THREE.Material> = new Map();
  private currentConfig: BleacherConfig | null = null;

  // Telemetry callback
  public onStatsUpdate?: (stats: { fps: number; drawCalls: number; triangles: number; vertices: number }) => void;
  private frameCount = 0;
  private lastFpsTime = performance.now();
  private currentFps = 60;

  constructor(container: HTMLElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0f1d);
    this.scene.fog = new THREE.FogExp2(0x0a0f1d, 0.005);

    // 2. Camera & Safe Fallback Dimensions
    const width = container.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 360);
    const height = container.clientHeight || (typeof window !== 'undefined' ? Math.round(window.innerHeight * 0.45) : 260);
    const aspect = width / (height || 1);
    this.camera = new THREE.PerspectiveCamera(45, Math.max(0.1, aspect), 0.1, 1500);
    this.camera.position.set(55, 35, 75);

    // 3. Renderer with robust fallback and guaranteed dark slate background
    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: false,
        preserveDrawingBuffer: true,
        powerPreference: 'high-performance',
      });
    } catch (e) {
      console.warn('Falling back to basic WebGLRenderer:', e);
      this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    }

    this.renderer.setClearColor(0x0a0f1d, 1.0);
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Guarantee canvas style prevents white flashes or mobile background leakage
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.backgroundColor = '#0a0f1d';
    this.renderer.domElement.style.outline = 'none';
    container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 450;
    this.controls.target.set(10, 8, 0);

    // 5. Lighting
    this.hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 0.85);
    this.hemiLight.position.set(0, 100, 0);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.dirLight.position.set(80, 100, 60);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
    this.dirLight.shadow.camera.near = 0.5;
    this.dirLight.shadow.camera.far = 400;
    const shadowD = 120;
    this.dirLight.shadow.camera.left = -shadowD;
    this.dirLight.shadow.camera.right = shadowD;
    this.dirLight.shadow.camera.top = shadowD;
    this.dirLight.shadow.camera.bottom = -shadowD;
    this.dirLight.shadow.bias = -0.0005;
    this.scene.add(this.dirLight);

    const rimLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    rimLight.position.set(-60, 45, -70);
    this.scene.add(rimLight);

    // 6. Master Groups
    this.masterGroup = new THREE.Group();
    this.scene.add(this.masterGroup);

    this.layerGround = new THREE.Group();
    this.layerUnderstructureBox = new THREE.Group();
    this.layerFrames = new THREE.Group();
    this.layerDeck = new THREE.Group();
    this.layerRisers = new THREE.Group();
    this.layerSeats = new THREE.Group();
    this.layerRails = new THREE.Group();
    this.layerAisles = new THREE.Group();
    this.layerStairs = new THREE.Group();
    this.layerAda = new THREE.Group();
    this.layerPressBox = new THREE.Group();
    this.layerCanopy = new THREE.Group();
    this.layerAccessories = new THREE.Group();
    this.layerDimensions = new THREE.Group();

    this.masterGroup.add(
      this.layerGround,
      this.layerUnderstructureBox,
      this.layerFrames,
      this.layerDeck,
      this.layerRisers,
      this.layerSeats,
      this.layerRails,
      this.layerAisles,
      this.layerStairs,
      this.layerAda,
      this.layerPressBox,
      this.layerCanopy,
      this.layerAccessories,
      this.layerDimensions
    );

    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    this.animate();
  }

  private handleResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    if (width === 0 || height === 0) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private animate = () => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();

    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsTime >= 1000) {
      this.currentFps = Math.round((this.frameCount * 1000) / (now - this.lastFpsTime));
      this.frameCount = 0;
      this.lastFpsTime = now;

      if (this.onStatsUpdate && this.renderer) {
        const info = this.renderer.info;
        this.onStatsUpdate({
          fps: this.currentFps,
          drawCalls: info.render.calls,
          triangles: info.render.triangles,
          vertices: info.render.points + info.render.triangles * 3,
        });
      }
    }

    this.renderer.render(this.scene, this.camera);
  };

  /**
   * Procedural Geometry Update based on architectural drawing inputs
   */
  public updateBleacher(config: BleacherConfig) {
    this.currentConfig = config;

    // Clear previous geometries
    this.clearGroup(this.layerGround);
    this.clearGroup(this.layerUnderstructureBox);
    this.clearGroup(this.layerFrames);
    this.clearGroup(this.layerDeck);
    this.clearGroup(this.layerRisers);
    this.clearGroup(this.layerSeats);
    this.clearGroup(this.layerRails);
    this.clearGroup(this.layerAisles);
    this.clearGroup(this.layerStairs);
    this.clearGroup(this.layerAda);
    this.clearGroup(this.layerPressBox);
    this.clearGroup(this.layerCanopy);
    this.clearGroup(this.layerAccessories);
    this.clearGroup(this.layerDimensions);

    // Build Ground
    this.buildGroundEnvironment(config);

    const rows = config.rows;
    const lengthFt = config.lengthFt;
    const riseFt = config.rowRiseInches / 12; // 8" = 0.667ft, 12" = 1ft
    const runFt = config.rowRunInches / 12; // 26" = 2.167ft, 30" = 2.5ft
    const elevationFt = config.elevation; // 0, 2, 4, 8, 10 ft
    const halfLen = lengthFt / 2;
    const isElevated = elevationFt > 0;
    const frontWalkwayWidth = isElevated ? 5.0 : 2.0;

    // Materials
    const steelMat = this.getStandardMaterial(config.frameColor, 0.45, 0.6, config.wireframeMode);
    const boxFrameMat = this.getStandardMaterial('#475569', 0.5, 0.5, config.wireframeMode);
    const deckMat = this.getStandardMaterial(config.deckColor, 0.5, 0.35, config.wireframeMode);
    const riserMat = this.getStandardMaterial('#64748b', 0.5, 0.4, config.wireframeMode);
    const seatMat = this.getStandardMaterial(config.seatColor, 0.35, 0.2, config.wireframeMode);
    const railMat = this.getStandardMaterial(config.railColor, 0.3, 0.7, config.wireframeMode);
    const chainLinkMat = this.getStandardMaterial('#94a3b8', 0.7, 0.3, true);
    const yellowStripeMat = this.getStandardMaterial('#eab308', 0.4, 0.1, config.wireframeMode);

    // 1. ELEVATED BOX FRAME UNDERSTRUCTURE (Sheet S6: Parts A2, B1, H1, I, I1, J4, J5)
    const frameSpacing = config.frameSpacingFt; // 6ft O.C.
    const frameCount = Math.max(2, Math.floor(lengthFt / frameSpacing) + 1);
    const actualSpacing = lengthFt / (frameCount - 1);
    const totalDepth = rows * runFt + frontWalkwayWidth;

    if (isElevated) {
      this.buildElevatedBoxUnderstructure(
        frameCount,
        actualSpacing,
        halfLen,
        totalDepth,
        elevationFt,
        config,
        boxFrameMat
      );
    }

    // 2. PRIMARY SEAT RAKER FRAMES (Sheet S3/S4: Parts SRC, A, A1, C, D, E, F, G, H)
    for (let f = 0; f < frameCount; f++) {
      const zPos = -halfLen + f * actualSpacing;
      this.buildRakerFrame(zPos, rows, riseFt, runFt, elevationFt, frontWalkwayWidth, config, steelMat);
    }

    // Longitudinal sway bracing (Parts J4, J5, CB)
    this.buildSwayBracing(frameCount, actualSpacing, halfLen, rows, riseFt, runFt, elevationFt, frontWalkwayWidth, steelMat);

    // 3. AISLE LOCATIONS (Drawings show 6ft aisles: 20 seats @ 18" = 30ft bays)
    const aisleWidthFt = config.hasAisle ? config.aisleWidthInches / 12 : 0;
    const aislePositionsFt: number[] = [];
    if (config.hasAisle) {
      if (config.aisleCount === 1) {
        aislePositionsFt.push(0);
      } else if (config.aisleCount === 2) {
        aislePositionsFt.push(-lengthFt / 4, lengthFt / 4);
      } else if (config.aisleCount === 3) {
        aislePositionsFt.push(-lengthFt / 3, 0, lengthFt / 3);
      } else {
        aislePositionsFt.push(-lengthFt * 0.35, -lengthFt * 0.12, lengthFt * 0.12, lengthFt * 0.35);
      }
    }

    // 4. FRONT WALKWAY (Sheet S1/S2: 4ft to 6ft elevated front walkway deck)
    if (isElevated) {
      const walkwayX = frontWalkwayWidth / 2;
      const walkwayY = elevationFt;
      this.buildPlankWithAisles(walkwayX, walkwayY, lengthFt, [], 0, frontWalkwayWidth, 0.15, deckMat, this.layerDeck);

      // Front Walkway Safety Railing (42" IBC) along front edge (X = 0.1)
      const fRailGeo = new THREE.CylinderGeometry(0.07, 0.07, lengthFt, 12);
      fRailGeo.rotateX(Math.PI / 2);
      const fRail = new THREE.Mesh(fRailGeo, railMat);
      fRail.position.set(0.1, elevationFt + 3.5, 0);
      fRail.castShadow = true;
      this.layerRails.add(fRail);

      // Front Mid-rail (21" IBC)
      const fMidRailGeo = new THREE.CylinderGeometry(0.05, 0.05, lengthFt, 10);
      fMidRailGeo.rotateX(Math.PI / 2);
      const fMidRail = new THREE.Mesh(fMidRailGeo, railMat);
      fMidRail.position.set(0.1, elevationFt + 1.75, 0);
      this.layerRails.add(fMidRail);

      // Front posts every 6ft along walkway
      for (let f = 0; f < frameCount; f++) {
        const pz = -halfLen + f * actualSpacing;
        const pGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
        const post = new THREE.Mesh(pGeo, railMat);
        post.position.set(0.1, elevationFt + 1.75, pz);
        post.castShadow = true;
        this.layerRails.add(post);
      }

      // End Guardrails on Front Walkway if no stair access on that side
      if (config.accessStairs !== 'left' && config.accessStairs !== 'both') {
        const endRailGeo = new THREE.CylinderGeometry(0.06, 0.06, frontWalkwayWidth, 8);
        endRailGeo.rotateZ(Math.PI / 2);
        const endRail = new THREE.Mesh(endRailGeo, railMat);
        endRail.position.set(frontWalkwayWidth / 2, elevationFt + 3.5, -halfLen);
        this.layerRails.add(endRail);

        const endPostGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.5, 8);
        const endPost = new THREE.Mesh(endPostGeo, railMat);
        endPost.position.set(frontWalkwayWidth, elevationFt + 1.75, -halfLen);
        this.layerRails.add(endPost);
      }

      if (config.accessStairs !== 'right' && config.accessStairs !== 'both') {
        const endRailGeo = new THREE.CylinderGeometry(0.06, 0.06, frontWalkwayWidth, 8);
        endRailGeo.rotateZ(Math.PI / 2);
        const endRail = new THREE.Mesh(endRailGeo, railMat);
        endRail.position.set(frontWalkwayWidth / 2, elevationFt + 3.5, halfLen);
        this.layerRails.add(endRail);

        const endPostGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.5, 8);
        const endPost = new THREE.Mesh(endPostGeo, railMat);
        endPost.position.set(frontWalkwayWidth, elevationFt + 1.75, halfLen);
        this.layerRails.add(endPost);
      }
    }

    // 5. FOOTBOARDS & RISERS (Sheet S1/S2: 2x10 Anodized Seat Boards & 2x5 / 2x10 Footboards)
    const footboardCount = config.deckType === 'single-foot' ? 1 : 2;
    const footboardWidth = 0.82;

    for (let r = 0; r < rows; r++) {
      const rowX = frontWalkwayWidth + (r + 1) * runFt;
      const rowY = elevationFt + (r + 1) * riseFt;

      for (let p = 0; p < footboardCount; p++) {
        const offset = (p - (footboardCount - 1) / 2) * (footboardWidth + 0.06);
        const plankX = rowX - runFt * 0.5 + offset;
        const plankY = rowY - riseFt + 0.1;

        this.buildPlankWithAisles(
          plankX,
          plankY,
          lengthFt,
          aislePositionsFt,
          aisleWidthFt,
          footboardWidth,
          0.12,
          deckMat,
          this.layerDeck
        );
      }

      // 6" Vertical Seat Board Risers (Typ on Drawing Sheet S1/S2)
      if (config.riserType !== 'open') {
        const riserH = riseFt - 0.15;
        const riserX = rowX - runFt + 0.05;
        const riserY = rowY - riseFt / 2;
        this.buildVerticalPlank(
          riserX,
          riserY,
          lengthFt,
          aislePositionsFt,
          aisleWidthFt,
          riserH,
          0.08,
          riserMat,
          this.layerRisers
        );
      }
    }

    // 6. SEATING PLANK / CHAIRS (Sheet S1: 2" x 10" Anodized Aluminum Seat Board)
    for (let r = 0; r < rows; r++) {
      const rowX = frontWalkwayWidth + (r + 1) * runFt;
      const rowY = elevationFt + (r + 1) * riseFt;
      const seatX = rowX;
      const seatY = rowY;

      let adaCutoutRange: { minZ: number; maxZ: number } | null = null;
      if (config.adaEnabled && r === 0) {
        const adaWidth = config.adaSpaces * 3.5;
        adaCutoutRange = { minZ: -adaWidth / 2, maxZ: adaWidth / 2 };
      }

      if (config.seatType === 'bench' || config.seatType === 'bench-with-back') {
        this.buildSeatPlanks(seatX, seatY, lengthFt, aislePositionsFt, aisleWidthFt, adaCutoutRange, config, seatMat);
      } else {
        this.buildStadiumChairs(seatX, seatY, lengthFt, aislePositionsFt, aisleWidthFt, adaCutoutRange, config, seatMat);
      }
    }

    // 7. AISLES & CENTER HANDRAILS (6ft designated stairs & aisles with loop handrails)
    if (config.hasAisle) {
      this.buildAisles(rows, riseFt, runFt, elevationFt, frontWalkwayWidth, aislePositionsFt, aisleWidthFt, config, deckMat, railMat, yellowStripeMat);
    }

    // 8. ACCESS STAIRS: {left side, right side, both sides} (Sheet S1 Seating Plan)
    if (isElevated && config.accessStairs !== 'none') {
      this.buildAccessStairs(elevationFt, frontWalkwayWidth, halfLen, config.accessStairs, deckMat, railMat);
    }

    // 9. GUARDRAILS & SIDE BARRICADES (Sheet S1/S2/S5: RGP, RSP, LSP, Galvanized Chain Link Fence)
    this.buildGuardrailsAndBarricades(
      rows,
      riseFt,
      runFt,
      lengthFt,
      elevationFt,
      frontWalkwayWidth,
      config,
      railMat,
      chainLinkMat
    );

    // 10. ADA WHEELCHAIR BAY & RAMP
    if (config.adaEnabled) {
      this.buildAdaPlatform(elevationFt, runFt, frontWalkwayWidth, config, deckMat, railMat, yellowStripeMat);
    }

    // 11. PRESS BOX ({20ft x 8ft, 40ft x 8ft}) (Sheet S7 & S8)
    if (config.pressBox.enabled) {
      this.buildPressBox(rows, riseFt, runFt, elevationFt, frontWalkwayWidth, lengthFt, config);
    }

    // 12. SHADE CANOPY & ACCESSORIES
    if (config.shadeCanopy.enabled) {
      this.buildShadeCanopy(rows, riseFt, runFt, elevationFt, frontWalkwayWidth, lengthFt, config);
    }

    if (config.windSkirting.enabled || config.sponsorship.enabled) {
      this.buildWindSkirtingAndSponsors(rows, riseFt, runFt, elevationFt, frontWalkwayWidth, lengthFt, config);
    }

    if (config.lightPoles) {
      this.buildStadiumLightPoles(lengthFt, rows, runFt, frontWalkwayWidth);
    }

    // 13. 3D DIMENSION CALLOUTS
    if (config.dimensionOverlay) {
      this.buildDimensionMarkers(rows, riseFt, runFt, lengthFt, elevationFt, frontWalkwayWidth);
    }

    // 14. APPLY BIM EXPLODED OFFSET
    this.applyExplodedOffset(config.explodedViewOffset);
  }

  /**
   * Builds the stacked 40" / 48" box frame towers underneath for elevated bleachers
   * Grounded in Sheet S6: Typical 40" Box Frame Assembly & X-Brace Detail (Parts A2, B1, H1, I, I1, J4, J5)
   * The front cross members of the "X" pattern dynamically adjust to fit all front elevation presets {2, 4, 8, 10} ft.
   */
  private buildElevatedBoxUnderstructure(
    frameCount: number,
    actualSpacing: number,
    halfLen: number,
    totalDepth: number,
    elevationFt: number,
    config: BleacherConfig,
    mat: THREE.Material
  ) {
    const boxDepth = totalDepth;
    const colThickness = 0.3;

    // Calculate vertical tier count based on user frontXBraceMode and elevation preset {2, 4, 8, 10} ft
    let tiers = 1;
    if (config.frontXBraceMode === 'full-height') {
      tiers = 1;
    } else if (config.frontXBraceMode === 'double-x') {
      tiers = 2;
    } else {
      // modular-tiered (Sheet S6: standard 40" to 48" modular panels)
      if (elevationFt <= 4) {
        tiers = 1; // 2ft and 4ft are single modular box tiers
      } else if (elevationFt === 8) {
        tiers = 2; // 8ft is two stacked 4ft (48") box frame tiers with mid-runner
      } else if (elevationFt === 10) {
        tiers = 2; // 10ft is two stacked 5ft box frame tiers
      } else {
        tiers = Math.max(1, Math.round(elevationFt / 3.33));
      }
    }
    const tierHeight = elevationFt / tiers;

    const hardwareMat = this.getStandardMaterial('#94a3b8', 0.3, 0.8, config.wireframeMode);
    const gussetMat = this.getStandardMaterial('#64748b', 0.4, 0.6, config.wireframeMode);

    // 1. Column lines and runners across depth
    for (let f = 0; f < frameCount; f++) {
      const z = -halfLen + f * actualSpacing;

      // Base concrete / wood sill runner (Sheet S1/S2: 2"x8" pressure treated sill)
      const sillGeo = new THREE.BoxGeometry(boxDepth + 1, 0.25, 1.2);
      const sill = new THREE.Mesh(sillGeo, this.getStandardMaterial('#334155', 0.8, 0.2));
      sill.position.set(boxDepth / 2, 0.12, z);
      sill.receiveShadow = true;
      this.layerUnderstructureBox.add(sill);

      // Stacked Box Frame Columns & Diagonals across tiers (Sheet S6: Parts A2, B1, H1)
      for (let t = 0; t < tiers; t++) {
        const bottomY = t * tierHeight;
        const midY = bottomY + tierHeight / 2;
        const topY = bottomY + tierHeight;

        // Front column (Part A2) at X = 0.2
        const frontColGeo = new THREE.BoxGeometry(colThickness, tierHeight, colThickness);
        const frontCol = new THREE.Mesh(frontColGeo, mat);
        frontCol.position.set(0.2, midY, z);
        frontCol.castShadow = true;
        this.layerUnderstructureBox.add(frontCol);

        // Rear column (Part A2)
        const rearCol = new THREE.Mesh(frontColGeo, mat);
        rearCol.position.set(boxDepth - 0.2, midY, z);
        rearCol.castShadow = true;
        this.layerUnderstructureBox.add(rearCol);

        // Middle Columns (Part B1) spaced every 4-6ft
        const colSteps = Math.max(2, Math.floor(boxDepth / 5));
        for (let c = 1; c < colSteps; c++) {
          const cx = (c * boxDepth) / colSteps;
          const midCol = new THREE.Mesh(frontColGeo, mat);
          midCol.position.set(cx, midY, z);
          midCol.castShadow = true;
          this.layerUnderstructureBox.add(midCol);

          // Internal diagonal angle brace (Part H1: 2"x2"x3/16" Angle)
          const spanX = boxDepth / colSteps;
          const diagLen = Math.sqrt(spanX * spanX + tierHeight * tierHeight);
          const diagAngle = Math.atan2(tierHeight, spanX);
          const diagGeo = new THREE.BoxGeometry(diagLen, 0.15, 0.15);
          const diag = new THREE.Mesh(diagGeo, mat);
          diag.position.set(cx - spanX / 2, midY, z);
          diag.rotation.z = diagAngle;
          this.layerUnderstructureBox.add(diag);
        }

        // Horizontal runners across depth (Parts I & I1: 2"x2"x3/16" Angle)
        const runnerGeo = new THREE.BoxGeometry(boxDepth, 0.18, 0.18);
        const topRunner = new THREE.Mesh(runnerGeo, mat);
        topRunner.position.set(boxDepth / 2, topY, z);
        this.layerUnderstructureBox.add(topRunner);
      }
    }

    // 2. FRONT PLATFORM X-PATTERN CROSS MEMBERS & HORIZONTAL RUNNERS (Sheet S6: Parts J4 & J5 Flat Bars)
    // Dynamically scaled to fit front elevation presets {2, 4, 8, 10} ft
    const braceRadius = config.frontXBraceProfile === 'pipe' ? 0.08 : 0.065;

    for (let f = 0; f < frameCount - 1; f++) {
      const z1 = -halfLen + f * actualSpacing;
      const z2 = -halfLen + (f + 1) * actualSpacing;
      const zMid = (z1 + z2) / 2;
      const dz = z2 - z1; // bay width

      // Continuous front bottom runner sill along ground
      const fBottomRunnerGeo = new THREE.BoxGeometry(0.18, 0.18, dz);
      const fBottomRunner = new THREE.Mesh(fBottomRunnerGeo, mat);
      fBottomRunner.position.set(0.2, 0.12, zMid);
      this.layerUnderstructureBox.add(fBottomRunner);

      for (let t = 0; t < tiers; t++) {
        const bottomY = t * tierHeight;
        const midY = bottomY + tierHeight / 2;
        const topY = bottomY + tierHeight;

        // Front horizontal runner beam at top of tier
        const fTopRunnerGeo = new THREE.BoxGeometry(0.18, 0.18, dz);
        const fTopRunner = new THREE.Mesh(fTopRunnerGeo, mat);
        fTopRunner.position.set(0.2, topY, zMid);
        this.layerUnderstructureBox.add(fTopRunner);

        // Exact geometric calculation for diagonal cross members
        // Vector from (bottomY, z1) to (topY, z2): dY = tierHeight, dZ = dz
        const braceLen = Math.sqrt(dz * dz + tierHeight * tierHeight);
        // Cylinder is along Y. Angle phi to rotate vector (0, 1, 0) into (dY, dZ) around X:
        const phi = Math.atan2(dz, tierHeight);

        // Diagonal 1: (bottomY, z1) -> (topY, z2)
        const xGeo1 = new THREE.CylinderGeometry(braceRadius, braceRadius, braceLen, 8);
        xGeo1.rotateX(phi);
        const fb1 = new THREE.Mesh(xGeo1, mat);
        fb1.position.set(0.2, midY, zMid);
        fb1.castShadow = true;

        // Diagonal 2: (bottomY, z2) -> (topY, z1)
        const xGeo2 = new THREE.CylinderGeometry(braceRadius, braceRadius, braceLen, 8);
        xGeo2.rotateX(-phi);
        const fb2 = new THREE.Mesh(xGeo2, mat);
        fb2.position.set(0.2, midY, zMid);
        fb2.castShadow = true;

        this.layerUnderstructureBox.add(fb1, fb2);

        // Center X-Intersection Disc / Bolt Hardware (Sheet S6 Part J4/J5 detail)
        const centerDiscGeo = new THREE.CylinderGeometry(0.22, 0.22, 0.12, 12);
        centerDiscGeo.rotateZ(Math.PI / 2);
        const centerDisc = new THREE.Mesh(centerDiscGeo, hardwareMat);
        centerDisc.position.set(0.2, midY, zMid);
        this.layerUnderstructureBox.add(centerDisc);

        // Four Corner Gusset Connection Brackets on Front Platform
        const gussetGeo = new THREE.BoxGeometry(0.14, 0.35, 0.35);
        const g1 = new THREE.Mesh(gussetGeo, gussetMat);
        g1.position.set(0.2, bottomY + 0.2, z1 + 0.2);
        const g2 = new THREE.Mesh(gussetGeo, gussetMat);
        g2.position.set(0.2, bottomY + 0.2, z2 - 0.2);
        const g3 = new THREE.Mesh(gussetGeo, gussetMat);
        g3.position.set(0.2, topY - 0.2, z1 + 0.2);
        const g4 = new THREE.Mesh(gussetGeo, gussetMat);
        g4.position.set(0.2, topY - 0.2, z2 - 0.2);
        this.layerUnderstructureBox.add(g1, g2, g3, g4);

        // Rear box frame sway X-braces at boxDepth - 0.2
        const rb1 = new THREE.Mesh(xGeo1, mat);
        rb1.position.set(boxDepth - 0.2, midY, zMid);
        const rb2 = new THREE.Mesh(xGeo2, mat);
        rb2.position.set(boxDepth - 0.2, midY, zMid);
        this.layerUnderstructureBox.add(rb1, rb2);

        const rTopRunner = new THREE.Mesh(fTopRunnerGeo, mat);
        rTopRunner.position.set(boxDepth - 0.2, topY, zMid);
        this.layerUnderstructureBox.add(rTopRunner);
      }
    }
  }

  /**
   * Primary Seating Raker Frames (Sheet S3/S4)
   */
  private buildRakerFrame(
    z: number,
    rows: number,
    riseFt: number,
    runFt: number,
    elevationFt: number,
    frontWalkwayWidth: number,
    config: BleacherConfig,
    mat: THREE.Material
  ) {
    const colSize = 0.25;
    const startX = frontWalkwayWidth;
    const seatSlopeDepth = rows * runFt;
    const seatSlopeRise = rows * riseFt;

    // Sloped raker beam (Part SRC: 2"x2"x3/16" Angle)
    const rakerLen = Math.sqrt(seatSlopeDepth * seatSlopeDepth + seatSlopeRise * seatSlopeRise);
    const rakerAngle = Math.atan2(seatSlopeRise, seatSlopeDepth);
    const rakerGeo = new THREE.BoxGeometry(rakerLen, colSize, colSize);
    const raker = new THREE.Mesh(rakerGeo, mat);
    raker.position.set(startX + seatSlopeDepth / 2, elevationFt + seatSlopeRise / 2 - 0.1, z);
    raker.rotation.z = rakerAngle;
    raker.castShadow = true;
    this.layerFrames.add(raker);

    // Vertical Columns (Parts C, D, E, F, G)
    for (let r = 1; r <= rows; r += 2) {
      const colX = startX + r * runFt;
      const colH = r * riseFt;
      const colGeo = new THREE.BoxGeometry(colSize, colH, colSize);
      const col = new THREE.Mesh(colGeo, mat);
      col.position.set(colX, elevationFt + colH / 2, z);
      col.castShadow = true;
      this.layerFrames.add(col);
    }

    // Rear High Column (Part G)
    const rearX = startX + seatSlopeDepth;
    const rearH = seatSlopeRise;
    const rearColGeo = new THREE.BoxGeometry(colSize * 1.3, rearH, colSize * 1.3);
    const rearCol = new THREE.Mesh(rearColGeo, mat);
    rearCol.position.set(rearX, elevationFt + rearH / 2, z);
    rearCol.castShadow = true;
    this.layerFrames.add(rearCol);

    // Tread & Riser Seat Brackets (Parts A & A1)
    for (let r = 0; r < rows; r++) {
      const bx = startX + (r + 1) * runFt - runFt * 0.5;
      const by = elevationFt + (r + 1) * riseFt;
      const bGeo = new THREE.BoxGeometry(runFt * 0.95, 0.12, 0.18);
      const b = new THREE.Mesh(bGeo, mat);
      b.position.set(bx, by - riseFt + 0.06, z);
      this.layerFrames.add(b);
    }
  }

  private buildSwayBracing(
    frameCount: number,
    spacing: number,
    halfLen: number,
    rows: number,
    riseFt: number,
    runFt: number,
    elevationFt: number,
    frontWalkwayWidth: number,
    mat: THREE.Material
  ) {
    const rearX = frontWalkwayWidth + rows * runFt;
    const rearH = rows * riseFt;

    for (let f = 0; f < frameCount - 1; f++) {
      const z1 = -halfLen + f * spacing;
      const z2 = -halfLen + (f + 1) * spacing;
      const zMid = (z1 + z2) / 2;
      const dz = z2 - z1;

      // X-Braces (Part J: 2"x3/16" Flat Bar)
      // Corrected rotation angle around X axis: phi = atan2(dz, rearH)
      const braceLen = Math.sqrt(dz * dz + rearH * rearH);
      const phi = Math.atan2(dz, rearH);

      const bGeo1 = new THREE.CylinderGeometry(0.06, 0.06, braceLen, 6);
      bGeo1.rotateX(phi);
      const b1 = new THREE.Mesh(bGeo1, mat);
      b1.position.set(rearX, elevationFt + rearH / 2, zMid);
      this.layerFrames.add(b1);

      const bGeo2 = new THREE.CylinderGeometry(0.06, 0.06, braceLen, 6);
      bGeo2.rotateX(-phi);
      const b2 = new THREE.Mesh(bGeo2, mat);
      b2.position.set(rearX, elevationFt + rearH / 2, zMid);
      this.layerFrames.add(b2);

      // Continuous Bracing (Part CB: 2"x2"x3/16" Angle)
      const cbGeo = new THREE.BoxGeometry(0.15, 0.15, dz);
      const cb = new THREE.Mesh(cbGeo, mat);
      cb.position.set(rearX, elevationFt + rearH - 0.2, zMid);
      this.layerFrames.add(cb);
    }
  }

  /**
   * Builds Platform Access Stairs on Left, Right, or Both sides
   * Grounded in Sheet S1: Seating Plan Stairs Detail
   * Corrected handrails, guardrails, and stringer orientation (no reversed geometry).
   */
  private buildAccessStairs(
    elevationFt: number,
    frontWalkwayWidth: number,
    halfLen: number,
    option: 'left' | 'right' | 'both',
    deckMat: THREE.Material,
    railMat: THREE.Material
  ) {
    const stairWidth = 4.5; // 4.5ft clear width
    const stairSides: { centerZ: number; isLeft: boolean }[] = [];
    if (option === 'left' || option === 'both') stairSides.push({ centerZ: -halfLen - stairWidth / 2, isLeft: true });
    if (option === 'right' || option === 'both') stairSides.push({ centerZ: halfLen + stairWidth / 2, isLeft: false });

    const stepRise = 7 / 12; // 7" IBC max stair rise
    const stepRun = 11 / 12; // 11" IBC min stair tread run
    const stepsCount = Math.max(2, Math.round(elevationFt / stepRise));
    const stairLen = stepsCount * stepRun;
    const postMat = railMat;

    for (const { centerZ: sz, isLeft } of stairSides) {
      // 1. Landing platform at top (connects seamlessly to front walkway)
      const landingGeo = new THREE.BoxGeometry(frontWalkwayWidth, 0.2, stairWidth);
      const landing = new THREE.Mesh(landingGeo, deckMat);
      landing.position.set(frontWalkwayWidth / 2, elevationFt, sz);
      landing.castShadow = true;
      landing.receiveShadow = true;
      this.layerStairs.add(landing);

      // Support columns under landing platform
      const landingLegGeo = new THREE.BoxGeometry(0.25, elevationFt, 0.25);
      const leg1 = new THREE.Mesh(landingLegGeo, deckMat);
      leg1.position.set(0.2, elevationFt / 2, sz - stairWidth / 2 + 0.2);
      const leg2 = new THREE.Mesh(landingLegGeo, deckMat);
      leg2.position.set(0.2, elevationFt / 2, sz + stairWidth / 2 - 0.2);
      const leg3 = new THREE.Mesh(landingLegGeo, deckMat);
      leg3.position.set(frontWalkwayWidth - 0.2, elevationFt / 2, sz - stairWidth / 2 + 0.2);
      const leg4 = new THREE.Mesh(landingLegGeo, deckMat);
      leg4.position.set(frontWalkwayWidth - 0.2, elevationFt / 2, sz + stairWidth / 2 - 0.2);
      this.layerStairs.add(leg1, leg2, leg3, leg4);

      // 2. Stringer angles (diagonal supporting beams)
      // Vector from ground (x = -stairLen, y = 0) to platform (x = 0, y = elevationFt)
      // dX = +stairLen > 0, dY = +elevationFt > 0. Positive slope!
      const stringerLen = Math.sqrt(stairLen * stairLen + elevationFt * elevationFt);
      const stairAngle = Math.atan2(elevationFt, stairLen);

      const stringerGeo = new THREE.BoxGeometry(stringerLen, 0.5, 0.15);
      const s1 = new THREE.Mesh(stringerGeo, deckMat);
      s1.position.set(-stairLen / 2, elevationFt / 2, sz - stairWidth / 2);
      s1.rotation.z = stairAngle; // Corrected: positive angle slopes UPWARDS to platform
      s1.castShadow = true;

      const s2 = new THREE.Mesh(stringerGeo, deckMat);
      s2.position.set(-stairLen / 2, elevationFt / 2, sz + stairWidth / 2);
      s2.rotation.z = stairAngle; // Corrected: positive angle slopes UPWARDS to platform
      s2.castShadow = true;
      this.layerStairs.add(s1, s2);

      // 3. Step Treads
      for (let s = 0; s < stepsCount; s++) {
        const stepX = -s * stepRun;
        const stepY = elevationFt - s * (elevationFt / stepsCount);
        const treadGeo = new THREE.BoxGeometry(stepRun * 1.02, 0.15, stairWidth);
        const tread = new THREE.Mesh(treadGeo, deckMat);
        tread.position.set(stepX - stepRun / 2, stepY - 0.05, sz);
        tread.castShadow = true;
        tread.receiveShadow = true;
        this.layerStairs.add(tread);
      }

      // 4. Continuous Stair Handrails & Guardrails (dual sides of stair flight)
      // Corrected rotation around Z for +Y cylinder: stairAngle - Math.PI / 2
      const railRotZ = stairAngle - Math.PI / 2;

      for (const sideOffset of [-stairWidth / 2, stairWidth / 2]) {
        const railZ = sz + sideOffset;

        // Top Guardrail (42" / 3.5 ft above nosing)
        const topRailGeo = new THREE.CylinderGeometry(0.065, 0.065, stringerLen, 10);
        topRailGeo.rotateZ(railRotZ);
        const topRail = new THREE.Mesh(topRailGeo, railMat);
        topRail.position.set(-stairLen / 2, elevationFt / 2 + 3.5, railZ);
        topRail.castShadow = true;
        this.layerStairs.add(topRail);

        // ADA Handrail (34" / 2.83 ft above nosing)
        const adaRailGeo = new THREE.CylinderGeometry(0.055, 0.055, stringerLen, 10);
        adaRailGeo.rotateZ(railRotZ);
        const adaRail = new THREE.Mesh(adaRailGeo, railMat);
        adaRail.position.set(-stairLen / 2, elevationFt / 2 + 2.83, railZ);
        adaRail.castShadow = true;
        this.layerStairs.add(adaRail);

        // Intermediate Rail (21" / 1.75 ft)
        const midRailGeo = new THREE.CylinderGeometry(0.045, 0.045, stringerLen, 8);
        midRailGeo.rotateZ(railRotZ);
        const midRail = new THREE.Mesh(midRailGeo, railMat);
        midRail.position.set(-stairLen / 2, elevationFt / 2 + 1.75, railZ);
        this.layerStairs.add(midRail);

        // Vertical stanchion posts along stair incline
        const postSteps = [0, Math.floor(stepsCount / 2), stepsCount];
        for (const ps of postSteps) {
          const px = -ps * stepRun;
          const py = elevationFt - ps * (elevationFt / stepsCount);
          const pGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.5, 8);
          const post = new THREE.Mesh(pGeo, postMat);
          post.position.set(px, py + 1.75, railZ);
          post.castShadow = true;
          this.layerStairs.add(post);
        }

        // Bottom ADA 12-inch horizontal extension loop
        const bottomExtGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.0, 8);
        bottomExtGeo.rotateZ(Math.PI / 2);
        const bExt = new THREE.Mesh(bottomExtGeo, railMat);
        bExt.position.set(-stairLen - 0.5, 2.83, railZ);
        this.layerStairs.add(bExt);
      }

      // 5. Landing Guardrails (Surrounding the perimeter of the elevated landing platform)
      // Rear railing along X = frontWalkwayWidth
      const landingRearRailGeo = new THREE.CylinderGeometry(0.065, 0.065, stairWidth, 8);
      landingRearRailGeo.rotateX(Math.PI / 2);
      const lRearRail = new THREE.Mesh(landingRearRailGeo, railMat);
      lRearRail.position.set(frontWalkwayWidth - 0.1, elevationFt + 3.5, sz);
      this.layerStairs.add(lRearRail);

      // Outer side railing (facing outside world, opposite the walkway entrance)
      const outerSideZ = isLeft ? sz - stairWidth / 2 : sz + stairWidth / 2;
      const landingSideRailGeo = new THREE.CylinderGeometry(0.065, 0.065, frontWalkwayWidth, 8);
      landingSideRailGeo.rotateZ(Math.PI / 2);
      const lSideRail = new THREE.Mesh(landingSideRailGeo, railMat);
      lSideRail.position.set(frontWalkwayWidth / 2, elevationFt + 3.5, outerSideZ);
      this.layerStairs.add(lSideRail);

      // Corner posts for landing
      const lpGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
      const lp1 = new THREE.Mesh(lpGeo, postMat);
      lp1.position.set(frontWalkwayWidth - 0.1, elevationFt + 1.75, outerSideZ);
      const lp2 = new THREE.Mesh(lpGeo, postMat);
      lp2.position.set(0.1, elevationFt + 1.75, outerSideZ);
      this.layerStairs.add(lp1, lp2);
    }
  }

  /**
   * Perimeter Guardrails and Side Barricades (Sheet S1/S2/S5)
   * Corrected sloped rail orientations and alignment.
   */
  private buildGuardrailsAndBarricades(
    rows: number,
    riseFt: number,
    runFt: number,
    lengthFt: number,
    elevationFt: number,
    frontWalkwayWidth: number,
    config: BleacherConfig,
    railMat: THREE.Material,
    chainLinkMat: THREE.Material
  ) {
    const halfLen = lengthFt / 2;
    const topX = frontWalkwayWidth + rows * runFt;
    const topY = elevationFt + rows * riseFt;
    const railHeight = 3.5; // 42" standard

    // 1. REAR GUARDRAIL (Sheet S5: Part RGP & Chain Link)
    if (config.backGuardrail) {
      const topRailGeo = new THREE.CylinderGeometry(0.07, 0.07, lengthFt, 12);
      topRailGeo.rotateX(Math.PI / 2);
      const topRail = new THREE.Mesh(topRailGeo, railMat);
      topRail.position.set(topX + 0.1, topY + railHeight, 0);
      topRail.castShadow = true;
      this.layerRails.add(topRail);

      // Rear Mid-rail
      const midRailGeo = new THREE.CylinderGeometry(0.05, 0.05, lengthFt, 10);
      midRailGeo.rotateX(Math.PI / 2);
      const midRail = new THREE.Mesh(midRailGeo, railMat);
      midRail.position.set(topX + 0.1, topY + railHeight / 2, 0);
      this.layerRails.add(midRail);

      // Support Posts (Part RGP: 2"x2"x3/16" Steel)
      const postCount = Math.max(3, Math.floor(lengthFt / 6) + 1);
      const postSpacing = lengthFt / (postCount - 1);
      for (let p = 0; p < postCount; p++) {
        const pz = -halfLen + p * postSpacing;
        const pGeo = new THREE.CylinderGeometry(0.08, 0.08, railHeight + 0.4, 8);
        const post = new THREE.Mesh(pGeo, railMat);
        post.position.set(topX + 0.1, topY + railHeight / 2, pz);
        post.castShadow = true;
        this.layerRails.add(post);
      }

      // Chain Link Mesh Infill (Sheet S1/S2: Galvanized Chain Link Fence)
      const meshGeo = new THREE.PlaneGeometry(lengthFt, railHeight - 0.4);
      const meshPlane = new THREE.Mesh(meshGeo, chainLinkMat);
      meshPlane.rotation.y = Math.PI / 2;
      meshPlane.position.set(topX + 0.1, topY + railHeight / 2, 0);
      this.layerRails.add(meshPlane);
    }

    // 2. SIDE BARRICADES & GUARD POSTS (Sheet S5: Parts RSP, LSP, RCT, LCT)
    if (config.sideGuardrails || config.sideBarricades) {
      const totalSlopeDepth = rows * runFt;
      const totalSlopeRise = rows * riseFt;
      const slopeLen = Math.sqrt(totalSlopeDepth * totalSlopeDepth + totalSlopeRise * totalSlopeRise);
      const slopeAngle = Math.atan2(totalSlopeRise, totalSlopeDepth);
      // Corrected rotation around Z for +Y cylinder: slopeAngle - Math.PI / 2 (positive upward slope)
      const sideRailRotZ = slopeAngle - Math.PI / 2;

      for (const sideZ of [-halfLen, halfLen]) {
        // Sloped Top Rail
        const sRailGeo = new THREE.CylinderGeometry(0.07, 0.07, slopeLen, 12);
        sRailGeo.rotateZ(sideRailRotZ);
        const sRail = new THREE.Mesh(sRailGeo, railMat);
        sRail.position.set(frontWalkwayWidth + totalSlopeDepth / 2, elevationFt + totalSlopeRise / 2 + railHeight, sideZ);
        sRail.castShadow = true;
        this.layerRails.add(sRail);

        // Sloped Intermediate Mid-Rail
        const sMidRailGeo = new THREE.CylinderGeometry(0.05, 0.05, slopeLen, 10);
        sMidRailGeo.rotateZ(sideRailRotZ);
        const sMidRail = new THREE.Mesh(sMidRailGeo, railMat);
        sMidRail.position.set(frontWalkwayWidth + totalSlopeDepth / 2, elevationFt + totalSlopeRise / 2 + railHeight / 2, sideZ);
        this.layerRails.add(sMidRail);

        // Side Guard Posts (Part RSP/LSP: 2"x2"x3/16" Steel)
        for (let r = 0; r <= rows; r++) {
          const rx = frontWalkwayWidth + r * runFt;
          const ry = elevationFt + r * riseFt;
          const postGeo = new THREE.CylinderGeometry(0.07, 0.07, railHeight, 8);
          const post = new THREE.Mesh(postGeo, railMat);
          post.position.set(rx, ry + railHeight / 2, sideZ);
          post.castShadow = true;
          this.layerRails.add(post);
        }

        // Galvanized Chain Link Mesh Side Barricade Infill
        if (config.sideBarricades) {
          const sideMeshGeo = new THREE.PlaneGeometry(slopeLen, railHeight - 0.3);
          const sideMesh = new THREE.Mesh(sideMeshGeo, chainLinkMat);
          sideMesh.rotation.z = slopeAngle;
          sideMesh.position.set(frontWalkwayWidth + totalSlopeDepth / 2, elevationFt + totalSlopeRise / 2 + railHeight / 2, sideZ);
          this.layerRails.add(sideMesh);
        }
      }
    }
  }

  /**
   * Media Press Box & Announcer Booth ({20ft x 8ft, 40ft x 8ft})
   * Grounded in Sheet S7 & S8: 42' x 8' Building Details
   */
  private buildPressBox(
    rows: number,
    riseFt: number,
    runFt: number,
    elevationFt: number,
    frontWalkwayWidth: number,
    lengthFt: number,
    config: BleacherConfig
  ) {
    const pb = config.pressBox;
    const topX = frontWalkwayWidth + rows * runFt;
    const topY = elevationFt + rows * riseFt;

    const pbWidth = pb.size === '40x8' ? 40 : 20;
    const pbDepth = 8.0; // 8ft depth from Sheet S8
    const pbHeight = 8.0; // 8ft height from Sheet S7

    const boxX = topX + pbDepth / 2 + 1.2;
    const boxY = topY + pbHeight / 2 + 0.4;

    // Structural support steel frame under press box (Sheet S7: 1.5"x4"x1/4" Channel)
    const channelMat = this.getStandardMaterial('#1e293b', 0.5, 0.6);
    const colCount = pbWidth === 40 ? 6 : 4;
    const colSpacing = pbWidth / (colCount - 1);

    for (let c = 0; c < colCount; c++) {
      const cz = -pbWidth / 2 + c * colSpacing;
      const legGeo = new THREE.BoxGeometry(0.6, boxY, 0.6);
      const legFront = new THREE.Mesh(legGeo, channelMat);
      legFront.position.set(topX + 1.2, boxY / 2, cz);
      const legRear = new THREE.Mesh(legGeo, channelMat);
      legRear.position.set(topX + pbDepth + 1.2, boxY / 2, cz);
      this.layerPressBox.add(legFront, legRear);
    }

    // 1. Main Insulated Booth Cabin (.040 Sheet Metal & 1-1/2" Polystyrene Board from Sheet S8)
    const cabinMat = this.getStandardMaterial(pb.color, 0.4, 0.3);
    const cabinGeo = new THREE.BoxGeometry(pbDepth, pbHeight, pbWidth);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(boxX, boxY, 0);
    cabin.castShadow = true;
    this.layerPressBox.add(cabin);

    // 2. Windows & Mullions Setup (Front and Back Observation Windows)
    const windowH = pbHeight * 0.45; // ~3.6ft high commercial ribbon window
    const windowW = pbWidth * 0.88; // Ribbon spans 88% of booth width
    const windowY = boxY + 0.6; // Vertical center of the window

    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a,
      roughness: 0.1,
      metalness: 0.1,
      transmission: 0.75,
      transparent: true,
      opacity: 0.85,
    });

    const frameMat = this.getStandardMaterial('#334155', 0.5, 0.6);
    const aluRailMat = this.getStandardMaterial('#cbd5e1', 0.3, 0.8); // Clear anodized aluminum guard rail

    // Front Window (facing field & spectators)
    const frontWindowGeo = new THREE.BoxGeometry(0.08, windowH, windowW);
    const frontWindowMesh = new THREE.Mesh(frontWindowGeo, glassMat);
    frontWindowMesh.position.set(boxX - pbDepth / 2 - 0.04, windowY, 0);
    this.layerPressBox.add(frontWindowMesh);

    // Front Window Architectural Frame & Mullions
    const fFrameTopBottomGeo = new THREE.BoxGeometry(0.12, 0.1, windowW * 1.02);
    const fFrameTop = new THREE.Mesh(fFrameTopBottomGeo, frameMat);
    fFrameTop.position.set(boxX - pbDepth / 2 - 0.05, windowY + windowH / 2, 0);
    const fFrameBottom = new THREE.Mesh(fFrameTopBottomGeo, frameMat);
    fFrameBottom.position.set(boxX - pbDepth / 2 - 0.05, windowY - windowH / 2, 0);
    this.layerPressBox.add(fFrameTop, fFrameBottom);

    // Back Window (facing rear & concourse)
    const backWindowGeo = new THREE.BoxGeometry(0.08, windowH, windowW);
    const backWindowMesh = new THREE.Mesh(backWindowGeo, glassMat);
    backWindowMesh.position.set(boxX + pbDepth / 2 + 0.04, windowY, 0);
    this.layerPressBox.add(backWindowMesh);

    // Back Window Architectural Frame & Mullions
    const bFrameTop = new THREE.Mesh(fFrameTopBottomGeo, frameMat);
    bFrameTop.position.set(boxX + pbDepth / 2 + 0.05, windowY + windowH / 2, 0);
    const bFrameBottom = new THREE.Mesh(fFrameTopBottomGeo, frameMat);
    bFrameBottom.position.set(boxX + pbDepth / 2 + 0.05, windowY - windowH / 2, 0);
    this.layerPressBox.add(bFrameTop, bFrameBottom);

    // Vertical Divider Mullions across both windows
    const mullionCount = pbWidth === 40 ? 8 : 4;
    const mullionSpacing = windowW / mullionCount;
    for (let m = 0; m <= mullionCount; m++) {
      const mz = -windowW / 2 + m * mullionSpacing;
      const mGeo = new THREE.BoxGeometry(0.12, windowH, 0.08);

      const fMullion = new THREE.Mesh(mGeo, frameMat);
      fMullion.position.set(boxX - pbDepth / 2 - 0.05, windowY, mz);
      const bMullion = new THREE.Mesh(mGeo, frameMat);
      bMullion.position.set(boxX + pbDepth / 2 + 0.05, windowY, mz);
      this.layerPressBox.add(fMullion, bMullion);
    }

    // 3. Aluminum Guard Rails in the Middle of Front & Back Windows
    // Horizontal aluminum pipe rails positioned at the exact vertical center (windowY) of the windows
    const windowRailGeo = new THREE.CylinderGeometry(0.065, 0.065, windowW, 12);
    windowRailGeo.rotateX(Math.PI / 2);

    // Front Window Guard Rail (mounted in middle of front window)
    const frontWindowRail = new THREE.Mesh(windowRailGeo, aluRailMat);
    frontWindowRail.position.set(boxX - pbDepth / 2 - 0.14, windowY, 0);
    frontWindowRail.castShadow = true;
    this.layerPressBox.add(frontWindowRail);

    // Back Window Guard Rail (mounted in middle of back window)
    const backWindowRail = new THREE.Mesh(windowRailGeo, aluRailMat);
    backWindowRail.position.set(boxX + pbDepth / 2 + 0.14, windowY, 0);
    backWindowRail.castShadow = true;
    this.layerPressBox.add(backWindowRail);

    // Stanchion Wall Mounting Brackets securing the guard rails to the window frames
    for (let b = 0; b <= mullionCount; b += 2) {
      const bz = -windowW / 2 + b * mullionSpacing;

      // Front bracket standoff connecting rail to window frame
      const fBracketGeo = new THREE.BoxGeometry(0.12, 0.06, 0.06);
      const fBracket = new THREE.Mesh(fBracketGeo, aluRailMat);
      fBracket.position.set(boxX - pbDepth / 2 - 0.08, windowY, bz);
      this.layerPressBox.add(fBracket);

      // Back bracket standoff connecting rail to window frame
      const bBracketGeo = new THREE.BoxGeometry(0.12, 0.06, 0.06);
      const bBracket = new THREE.Mesh(bBracketGeo, aluRailMat);
      bBracket.position.set(boxX + pbDepth / 2 + 0.08, windowY, bz);
      this.layerPressBox.add(bBracket);
    }

    // 4. Front Lettering Plaque
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const ctx = bannerCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 512, 128);
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 36px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`PRESS BOX ${pb.size.toUpperCase()}`, 256, 64);
    }
    const bannerTexture = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTexture });
    const bannerGeo = new THREE.PlaneGeometry(pbWidth * 0.6, 1.8);
    const bannerMesh = new THREE.Mesh(bannerGeo, bannerMat);
    bannerMesh.position.set(boxX - pbDepth / 2 - 0.06, boxY - pbHeight * 0.3, 0);
    bannerMesh.rotation.y = -Math.PI / 2;
    this.layerPressBox.add(bannerMesh);

    // 5. Roof Camera Filming Platform & Grounded Safety Railing (with vertical posts)
    if (pb.hasRoofDeck) {
      const roofDeckY = boxY + pbHeight / 2 + 0.08;
      const roofRailH = 3.5;
      const roofDeckGeo = new THREE.BoxGeometry(pbDepth, 0.15, pbWidth);
      const railMat = this.getStandardMaterial('#94a3b8', 0.4, 0.7);

      const roofDeck = new THREE.Mesh(roofDeckGeo, railMat);
      roofDeck.position.set(boxX, roofDeckY, 0);
      this.layerPressBox.add(roofDeck);

      // Anchored Roof Guardrail Posts at corners & along perimeter
      const roofPostCount = Math.max(3, Math.floor(pbWidth / 6) + 1);
      const roofPostSpacing = pbWidth / (roofPostCount - 1);

      for (let rp = 0; rp < roofPostCount; rp++) {
        const rpz = -pbWidth / 2 + rp * roofPostSpacing;
        const postGeo = new THREE.CylinderGeometry(0.06, 0.06, roofRailH, 8);

        // Front perimeter post
        const pFrontPost = new THREE.Mesh(postGeo, railMat);
        pFrontPost.position.set(boxX - pbDepth / 2 + 0.1, roofDeckY + roofRailH / 2, rpz);
        pFrontPost.castShadow = true;
        this.layerPressBox.add(pFrontPost);

        // Rear perimeter post
        const pRearPost = new THREE.Mesh(postGeo, railMat);
        pRearPost.position.set(boxX + pbDepth / 2 - 0.1, roofDeckY + roofRailH / 2, rpz);
        pRearPost.castShadow = true;
        this.layerPressBox.add(pRearPost);
      }

      // Continuous Top Rails (Front & Rear)
      const topPerimGeo = new THREE.CylinderGeometry(0.06, 0.06, pbWidth, 8);
      topPerimGeo.rotateX(Math.PI / 2);
      const rFrontTop = new THREE.Mesh(topPerimGeo, railMat);
      rFrontTop.position.set(boxX - pbDepth / 2 + 0.1, roofDeckY + roofRailH, 0);
      const rBackTop = new THREE.Mesh(topPerimGeo, railMat);
      rBackTop.position.set(boxX + pbDepth / 2 - 0.1, roofDeckY + roofRailH, 0);
      this.layerPressBox.add(rFrontTop, rBackTop);

      // Continuous Mid Rails (Front & Rear)
      const midPerimGeo = new THREE.CylinderGeometry(0.045, 0.045, pbWidth, 8);
      midPerimGeo.rotateX(Math.PI / 2);
      const rFrontMid = new THREE.Mesh(midPerimGeo, railMat);
      rFrontMid.position.set(boxX - pbDepth / 2 + 0.1, roofDeckY + roofRailH / 2, 0);
      const rBackMid = new THREE.Mesh(midPerimGeo, railMat);
      rBackMid.position.set(boxX + pbDepth / 2 - 0.1, roofDeckY + roofRailH / 2, 0);
      this.layerPressBox.add(rFrontMid, rBackMid);

      // Side end rails (Left & Right)
      const sidePerimGeo = new THREE.CylinderGeometry(0.06, 0.06, pbDepth - 0.2, 8);
      sidePerimGeo.rotateZ(Math.PI / 2);
      for (const sz of [-pbWidth / 2, pbWidth / 2]) {
        const sideTop = new THREE.Mesh(sidePerimGeo, railMat);
        sideTop.position.set(boxX, roofDeckY + roofRailH, sz);
        const sideMid = new THREE.Mesh(sidePerimGeo, railMat);
        sideMid.position.set(boxX, roofDeckY + roofRailH / 2, sz);
        this.layerPressBox.add(sideTop, sideMid);
      }

      // Camera tripod
      const tripodGeo = new THREE.CylinderGeometry(0.06, 0.25, 3.5, 6);
      const tripod = new THREE.Mesh(tripodGeo, this.getStandardMaterial('#0f172a', 0.5, 0.5));
      tripod.position.set(boxX, roofDeckY + 1.8, 0);
      this.layerPressBox.add(tripod);
    }
  }

  private buildPlankWithAisles(
    x: number,
    y: number,
    totalLen: number,
    aislePositions: number[],
    aisleWidth: number,
    plankWidth: number,
    plankThick: number,
    mat: THREE.Material,
    targetGroup: THREE.Group
  ) {
    const halfLen = totalLen / 2;
    if (aislePositions.length === 0) {
      const geo = new THREE.BoxGeometry(plankWidth, plankThick, totalLen);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      targetGroup.add(mesh);
      return;
    }

    const boundaries = [-halfLen];
    for (const a of aislePositions) {
      boundaries.push(a - aisleWidth / 2);
      boundaries.push(a + aisleWidth / 2);
    }
    boundaries.push(halfLen);
    boundaries.sort((a, b) => a - b);

    for (let i = 0; i < boundaries.length - 1; i += 2) {
      const zStart = boundaries[i];
      const zEnd = boundaries[i + 1];
      const segLen = zEnd - zStart;
      if (segLen > 0.5) {
        const segGeo = new THREE.BoxGeometry(plankWidth, plankThick, segLen);
        const segMesh = new THREE.Mesh(segGeo, mat);
        segMesh.position.set(x, y, (zStart + zEnd) / 2);
        segMesh.castShadow = true;
        segMesh.receiveShadow = true;
        targetGroup.add(segMesh);
      }
    }
  }

  private buildVerticalPlank(
    x: number,
    y: number,
    totalLen: number,
    aislePositions: number[],
    aisleWidth: number,
    height: number,
    thickness: number,
    mat: THREE.Material,
    targetGroup: THREE.Group
  ) {
    this.buildPlankWithAisles(x, y, totalLen, aislePositions, aisleWidth, thickness, height, mat, targetGroup);
  }

  private buildSeatPlanks(
    x: number,
    y: number,
    totalLen: number,
    aislePositions: number[],
    aisleWidth: number,
    adaCutout: { minZ: number; maxZ: number } | null,
    config: BleacherConfig,
    seatMat: THREE.Material
  ) {
    const seatPlankWidth = 0.82;
    const seatPlankThick = 0.15;
    const halfLen = totalLen / 2;

    const cuts: { min: number; max: number }[] = [];
    for (const a of aislePositions) {
      cuts.push({ min: a - aisleWidth / 2, max: a + aisleWidth / 2 });
    }
    if (adaCutout) {
      cuts.push({ min: adaCutout.minZ, max: adaCutout.maxZ });
    }
    cuts.sort((a, b) => a.min - b.min);

    let currentZ = -halfLen;
    for (const cut of cuts) {
      if (cut.min > currentZ + 0.4) {
        const segLen = cut.min - currentZ;
        const segMid = currentZ + segLen / 2;
        this.addSingleSeatSegment(x, y, segMid, segLen, seatPlankWidth, seatPlankThick, config, seatMat);
      }
      currentZ = Math.max(currentZ, cut.max);
    }
    if (currentZ < halfLen - 0.4) {
      const segLen = halfLen - currentZ;
      const segMid = currentZ + segLen / 2;
      this.addSingleSeatSegment(x, y, segMid, segLen, seatPlankWidth, seatPlankThick, config, seatMat);
    }
  }

  private addSingleSeatSegment(
    x: number,
    y: number,
    zMid: number,
    segLen: number,
    w: number,
    h: number,
    config: BleacherConfig,
    seatMat: THREE.Material
  ) {
    const geo = new THREE.BoxGeometry(w, h, segLen);
    const mesh = new THREE.Mesh(geo, seatMat);
    mesh.position.set(x, y, zMid);
    mesh.castShadow = true;
    this.layerSeats.add(mesh);

    if (config.seatType === 'bench-with-back') {
      const backMat = this.getStandardMaterial(config.backrestColor, 0.4, 0.2);
      const backGeo = new THREE.BoxGeometry(0.12, 0.65, segLen);
      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.position.set(x - w / 2 + 0.06, y + 0.65, zMid);
      backMesh.castShadow = true;
      this.layerSeats.add(backMesh);
    }
  }

  private buildStadiumChairs(
    x: number,
    y: number,
    totalLen: number,
    aislePositions: number[],
    aisleWidth: number,
    adaCutout: { minZ: number; maxZ: number } | null,
    config: BleacherConfig,
    seatMat: THREE.Material
  ) {
    const chairWidth = 1.6;
    const halfLen = totalLen / 2;
    const chairCount = Math.floor(totalLen / chairWidth);
    const actualWidth = totalLen / chairCount;
    const frameMat = this.getStandardMaterial('#334155', 0.5, 0.5);

    for (let c = 0; c < chairCount; c++) {
      const cz = -halfLen + (c + 0.5) * actualWidth;

      let insideAisle = false;
      for (const a of aislePositions) {
        if (Math.abs(cz - a) < (aisleWidth + actualWidth) / 2) {
          insideAisle = true;
          break;
        }
      }
      if (insideAisle) continue;
      if (adaCutout && cz >= adaCutout.minZ && cz <= adaCutout.maxZ) continue;

      const stanchionGeo = new THREE.BoxGeometry(0.1, 0.6, 0.1);
      const stanchion = new THREE.Mesh(stanchionGeo, frameMat);
      stanchion.position.set(x - 0.2, y - 0.25, cz);
      this.layerSeats.add(stanchion);

      const panGeo = new THREE.BoxGeometry(0.9, 0.14, actualWidth * 0.85);
      const pan = new THREE.Mesh(panGeo, seatMat);
      pan.position.set(x, y + 0.08, cz);
      pan.castShadow = true;
      this.layerSeats.add(pan);

      const backGeo = new THREE.BoxGeometry(0.12, 0.8, actualWidth * 0.85);
      const back = new THREE.Mesh(backGeo, seatMat);
      back.position.set(x - 0.45, y + 0.6, cz);
      back.rotation.z = -0.1;
      back.castShadow = true;
      this.layerSeats.add(back);
    }
  }

  private buildAisles(
    rows: number,
    riseFt: number,
    runFt: number,
    elevationFt: number,
    frontWalkwayWidth: number,
    aislePositions: number[],
    aisleWidth: number,
    config: BleacherConfig,
    stepMat: THREE.Material,
    railMat: THREE.Material,
    stripeMat: THREE.Material
  ) {
    for (const az of aislePositions) {
      for (let r = 0; r < rows; r++) {
        const stepX = frontWalkwayWidth + (r + 0.5) * runFt;
        const stepY = elevationFt + (r + 0.5) * riseFt;

        const stepGeo = new THREE.BoxGeometry(runFt * 0.95, riseFt * 0.5, aisleWidth * 0.92);
        const stepMesh = new THREE.Mesh(stepGeo, stepMat);
        stepMesh.position.set(stepX, stepY - riseFt * 0.25, az);
        stepMesh.castShadow = true;
        this.layerAisles.add(stepMesh);

        if (config.contrastAisleStep) {
          const stripeGeo = new THREE.BoxGeometry(0.15, 0.04, aisleWidth * 0.92);
          const stripe = new THREE.Mesh(stripeGeo, stripeMat);
          stripe.position.set(stepX + runFt * 0.45, stepY, az);
          this.layerAisles.add(stripe);
        }
      }

      if (config.aisleHandrail) {
        const railStartX = frontWalkwayWidth + runFt * 0.5;
        const railStartY = elevationFt + riseFt * 0.5 + 2.85;
        const railEndX = frontWalkwayWidth + (rows - 0.5) * runFt;
        const railEndY = elevationFt + (rows - 0.5) * riseFt + 2.85;

        const railLen = Math.sqrt((railEndX - railStartX) ** 2 + (railEndY - railStartY) ** 2);
        const railAngle = Math.atan2(railEndY - railStartY, railEndX - railStartX);
        // Corrected upward slope rotation for +Y cylinder: railAngle - Math.PI / 2
        const railRotZ = railAngle - Math.PI / 2;

        // Top Continuous Gripping Handrail (34" / 2.85 ft)
        const handrailGeo = new THREE.CylinderGeometry(0.06, 0.06, railLen, 12);
        handrailGeo.rotateZ(railRotZ);
        const handrail = new THREE.Mesh(handrailGeo, railMat);
        handrail.position.set((railStartX + railEndX) / 2, (railStartY + railEndY) / 2, az);
        handrail.castShadow = true;
        this.layerAisles.add(handrail);

        // Intermediate Aisle Mid-Rail (18" / 1.5 ft)
        const handrailMidGeo = new THREE.CylinderGeometry(0.045, 0.045, railLen, 10);
        handrailMidGeo.rotateZ(railRotZ);
        const handrailMid = new THREE.Mesh(handrailMidGeo, railMat);
        handrailMid.position.set((railStartX + railEndX) / 2, (railStartY + railEndY) / 2 - 1.1, az);
        handrailMid.castShadow = true;
        this.layerAisles.add(handrailMid);

        // Vertical Stanchions / Support Posts every 2 rows rising from aisle steps
        for (let r = 0; r < rows; r += 2) {
          const postX = frontWalkwayWidth + (r + 0.5) * runFt;
          const postStepY = elevationFt + (r + 0.5) * riseFt;
          const postH = 2.85;
          const postGeo = new THREE.CylinderGeometry(0.055, 0.055, postH, 8);
          const postMesh = new THREE.Mesh(postGeo, railMat);
          postMesh.position.set(postX, postStepY + postH / 2, az);
          postMesh.castShadow = true;
          this.layerAisles.add(postMesh);
        }

        // Top Row Terminal Post
        const topPostX = frontWalkwayWidth + (rows - 0.5) * runFt;
        const topPostY = elevationFt + (rows - 0.5) * riseFt;
        const topPostGeo = new THREE.CylinderGeometry(0.055, 0.055, 2.85, 8);
        const topPost = new THREE.Mesh(topPostGeo, railMat);
        topPost.position.set(topPostX, topPostY + 2.85 / 2, az);
        this.layerAisles.add(topPost);

        // ADA Terminal D-Loop Returns at bottom and top
        const loopGeo = new THREE.TorusGeometry(0.5, 0.05, 8, 12, Math.PI);
        const bottomLoop = new THREE.Mesh(loopGeo, railMat);
        bottomLoop.position.set(railStartX - 0.2, railStartY - 0.5, az);
        bottomLoop.rotation.z = Math.PI / 2;
        this.layerAisles.add(bottomLoop);
      }
    }
  }

  private buildAdaPlatform(
    elevationFt: number,
    runFt: number,
    frontWalkwayWidth: number,
    config: BleacherConfig,
    deckMat: THREE.Material,
    railMat: THREE.Material,
    stripeMat: THREE.Material
  ) {
    const adaSpaces = config.adaSpaces;
    const widthFt = adaSpaces * 3.5;
    const depthFt = frontWalkwayWidth;
    const platX = frontWalkwayWidth / 2;
    const platY = elevationFt + 0.1;

    const warningGeo = new THREE.BoxGeometry(0.3, 0.05, widthFt);
    const warningMesh = new THREE.Mesh(warningGeo, stripeMat);
    warningMesh.position.set(frontWalkwayWidth - 0.2, platY + 0.1, 0);
    this.layerAda.add(warningMesh);

    const iconGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.02, 16);
    const iconMat = this.getStandardMaterial('#3b82f6', 0.5, 0.1);
    const iconMesh = new THREE.Mesh(iconGeo, iconMat);
    iconMesh.position.set(platX, platY + 0.11, 0);
    this.layerAda.add(iconMesh);
  }

  private buildShadeCanopy(
    rows: number,
    riseFt: number,
    runFt: number,
    elevationFt: number,
    frontWalkwayWidth: number,
    lengthFt: number,
    config: BleacherConfig
  ) {
    const sc = config.shadeCanopy;
    const topX = frontWalkwayWidth + rows * runFt;
    const topY = elevationFt + rows * riseFt;
    const canopyHeight = topY + 12;
    const spanFt = topX * 0.85;

    const steelMat = this.getStandardMaterial('#334155', 0.4, 0.6);
    const fabricMat = this.getStandardMaterial(sc.fabricColor, 0.7, 0.1);
    (fabricMat as THREE.MeshStandardMaterial).side = THREE.DoubleSide;

    const mastCount = Math.max(3, Math.floor(lengthFt / 24) + 1);
    const mastSpacing = lengthFt / (mastCount - 1);
    const halfLen = lengthFt / 2;

    for (let m = 0; m < mastCount; m++) {
      const mz = -halfLen + m * mastSpacing;
      const mastGeo = new THREE.CylinderGeometry(0.35, 0.4, canopyHeight, 16);
      const mast = new THREE.Mesh(mastGeo, steelMat);
      mast.position.set(topX + 2, canopyHeight / 2, mz);
      mast.castShadow = true;
      this.layerCanopy.add(mast);

      const armGeo = new THREE.BoxGeometry(spanFt, 0.35, 0.35);
      const arm = new THREE.Mesh(armGeo, steelMat);
      arm.position.set(topX + 2 - spanFt / 2, canopyHeight, mz);
      arm.rotation.z = -0.15;
      arm.castShadow = true;
      this.layerCanopy.add(arm);
    }

    const canopyGeo = new THREE.PlaneGeometry(spanFt * 1.05, lengthFt * 1.02, 16, 16);
    const canopyMesh = new THREE.Mesh(canopyGeo, fabricMat);
    canopyMesh.rotation.x = Math.PI / 2;
    canopyMesh.rotation.y = -0.15;
    canopyMesh.position.set(topX + 2 - spanFt / 2, canopyHeight - 0.2, 0);
    this.layerCanopy.add(canopyMesh);
  }

  private buildWindSkirtingAndSponsors(
    rows: number,
    riseFt: number,
    runFt: number,
    elevationFt: number,
    frontWalkwayWidth: number,
    lengthFt: number,
    config: BleacherConfig
  ) {
    const topX = frontWalkwayWidth + rows * runFt;
    const rearH = elevationFt + rows * riseFt;

    if (config.windSkirting.enabled && rearH > 3) {
      const skirtGeo = new THREE.PlaneGeometry(lengthFt, rearH - 0.5);
      const canvas = document.createElement('canvas');
      canvas.width = 1024;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = config.windSkirting.color;
        ctx.fillRect(0, 0, 1024, 256);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 10;
        ctx.strokeRect(20, 20, 984, 216);
        if (config.windSkirting.bannerText) {
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 56px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(config.windSkirting.bannerText.toUpperCase(), 512, 128);
        }
      }
      const texture = new THREE.CanvasTexture(canvas);
      const skirtMat = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });
      const skirtMesh = new THREE.Mesh(skirtGeo, skirtMat);
      skirtMesh.rotation.y = Math.PI / 2;
      skirtMesh.position.set(topX + 0.15, rearH / 2, 0);
      this.layerAccessories.add(skirtMesh);
    }
  }

  private buildStadiumLightPoles(lengthFt: number, rows: number, runFt: number, frontWalkwayWidth: number) {
    const halfLen = lengthFt / 2;
    const poleH = 45;
    const topX = frontWalkwayWidth + rows * runFt;
    const poleMat = this.getStandardMaterial('#334155', 0.4, 0.7);
    const bulbMat = new THREE.MeshBasicMaterial({ color: 0xffffff });

    for (const pz of [-halfLen - 8, halfLen + 8]) {
      const poleGeo = new THREE.CylinderGeometry(0.4, 0.7, poleH, 12);
      const pole = new THREE.Mesh(poleGeo, poleMat);
      pole.position.set(topX + 6, poleH / 2, pz);
      pole.castShadow = true;
      this.layerAccessories.add(pole);

      const bankGeo = new THREE.BoxGeometry(2, 3.5, 6);
      const bank = new THREE.Mesh(bankGeo, poleMat);
      bank.position.set(topX + 5, poleH - 2, pz);
      bank.rotation.z = -0.3;
      this.layerAccessories.add(bank);

      const lensGeo = new THREE.PlaneGeometry(3.2, 5.6);
      const lens = new THREE.Mesh(lensGeo, bulbMat);
      lens.rotation.y = -Math.PI / 2;
      lens.rotation.x = -0.3;
      lens.position.set(topX + 3.95, poleH - 2, pz);
      this.layerAccessories.add(lens);
    }
  }

  private buildGroundEnvironment(config: BleacherConfig) {
    if (this.groundMesh) {
      this.scene.remove(this.groundMesh);
      this.groundMesh.geometry.dispose();
      this.groundMesh = null;
    }

    const groundSize = 360;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, 1024, 1024);
      ctx.fillStyle = '#16a34a';
      for (let i = 0; i < 1024; i += 128) {
        ctx.fillRect(i, 0, 64, 1024);
      }
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 4;
      for (let i = 0; i <= 1024; i += 64) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 1024);
        ctx.stroke();
      }
      ctx.lineWidth = 12;
      ctx.strokeRect(40, 40, 944, 944);
    }

    const groundTex = new THREE.CanvasTexture(canvas);
    groundTex.wrapS = THREE.RepeatWrapping;
    groundTex.wrapT = THREE.RepeatWrapping;
    groundTex.repeat.set(6, 6);

    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: 0.85,
      metalness: 0.05,
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
    this.groundMesh.position.y = -0.05;
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);
  }

  private buildDimensionMarkers(
    rows: number,
    riseFt: number,
    runFt: number,
    lengthFt: number,
    elevationFt: number,
    frontWalkwayWidth: number
  ) {
    const halfLen = lengthFt / 2;
    const totalDepth = frontWalkwayWidth + rows * runFt;
    const totalHeight = elevationFt + rows * riseFt;
    const markerMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });

    // Length Dimension
    const lenPts = [new THREE.Vector3(0, 0.4, -halfLen), new THREE.Vector3(0, 0.4, halfLen)];
    const lenLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(lenPts), markerMat);
    this.layerDimensions.add(lenLine);
    this.addBillboardText(`${lengthFt}'-0" LENGTH`, 0, 1.5, 0, '#38bdf8');

    // Depth Dimension
    const depthPts = [new THREE.Vector3(0, 0.4, halfLen + 4), new THREE.Vector3(totalDepth, 0.4, halfLen + 4)];
    const depthLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(depthPts), markerMat);
    this.layerDimensions.add(depthLine);
    this.addBillboardText(`${totalDepth.toFixed(1)}' DEPTH`, totalDepth / 2, 1.5, halfLen + 4, '#38bdf8');

    // Height Dimension
    const heightPts = [new THREE.Vector3(totalDepth + 4, 0, halfLen), new THREE.Vector3(totalDepth + 4, totalHeight, halfLen)];
    const heightLine = new THREE.Line(new THREE.BufferGeometry().setFromPoints(heightPts), markerMat);
    this.layerDimensions.add(heightLine);
    this.addBillboardText(`${totalHeight.toFixed(1)}' HEIGHT`, totalDepth + 4, totalHeight / 2, halfLen, '#38bdf8');
  }

  private addBillboardText(text: string, x: number, y: number, z: number, color: string) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, 256, 64);
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      ctx.strokeRect(4, 4, 248, 56);
      ctx.fillStyle = color;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 128, 32);
    }
    const tex = new THREE.CanvasTexture(canvas);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex }));
    sprite.scale.set(6, 1.5, 1);
    sprite.position.set(x, y, z);
    this.layerDimensions.add(sprite);
  }

  public applyExplodedOffset(offset: number) {
    const spread = offset * 16;
    this.layerGround.position.set(0, 0, 0);
    this.layerUnderstructureBox.position.set(0, spread * 0.1, 0);
    this.layerFrames.position.set(0, spread * 0.25, 0);
    this.layerDeck.position.set(spread * 0.1, spread * 0.45, 0);
    this.layerRisers.position.set(spread * 0.05, spread * 0.55, 0);
    this.layerSeats.position.set(spread * 0.2, spread * 0.8, 0);
    this.layerRails.position.set(spread * 0.1, spread * 1.0, 0);
    this.layerAisles.position.set(spread * 0.15, spread * 0.65, 0);
    this.layerStairs.position.set(-spread * 0.2, spread * 0.35, 0);
    this.layerAda.position.set(-spread * 0.2, spread * 0.3, 0);
    this.layerPressBox.position.set(spread * 0.3, spread * 1.3, 0);
    this.layerCanopy.position.set(0, spread * 1.6, 0);
    this.layerAccessories.position.set(-spread * 0.2, spread * 0.2, 0);
  }

  public setCameraPreset(preset: CameraPreset, spectatorRow = 4) {
    if (!this.currentConfig) return;
    const rows = this.currentConfig.rows;
    const lengthFt = this.currentConfig.lengthFt;
    const runFt = this.currentConfig.rowRunInches / 12;
    const riseFt = this.currentConfig.rowRiseInches / 12;
    const totalDepth = rows * runFt + (this.currentConfig.elevation > 0 ? 5 : 2);
    const totalHeight = this.currentConfig.elevation + rows * riseFt;

    switch (preset) {
      case 'iso':
        this.camera.position.set(totalDepth * 1.8 + 20, totalHeight + 25, lengthFt * 0.85);
        this.controls.target.set(totalDepth / 2, totalHeight / 3, 0);
        break;
      case 'front':
        this.camera.position.set(-35, totalHeight * 0.7 + 10, 0);
        this.controls.target.set(totalDepth / 2, totalHeight / 2, 0);
        break;
      case 'side':
        this.camera.position.set(totalDepth / 2, totalHeight * 0.6, lengthFt + 35);
        this.controls.target.set(totalDepth / 2, totalHeight / 3, 0);
        break;
      case 'top':
        this.camera.position.set(totalDepth / 2, totalHeight + 110, 0.1);
        this.controls.target.set(totalDepth / 2, 0, 0);
        break;
      case 'spectator':
        const sRow = Math.max(1, Math.min(rows, spectatorRow));
        const sX = (this.currentConfig.elevation > 0 ? 5 : 2) + sRow * runFt;
        const sY = this.currentConfig.elevation + sRow * riseFt + 3.8;
        this.camera.position.set(sX, sY, 0);
        this.controls.target.set(-50, 5, 0);
        break;
      case 'understructure':
        this.camera.position.set(totalDepth * 0.4, 2, 5);
        this.controls.target.set(totalDepth * 0.6, totalHeight * 0.8, -5);
        break;
    }
    this.controls.update();
  }

  public takeScreenshot(scale = 2): string {
    const origW = this.container.clientWidth;
    const origH = this.container.clientHeight;
    this.renderer.setSize(origW * scale, origH * scale);
    this.camera.aspect = origW / origH;
    this.camera.updateProjectionMatrix();
    this.renderer.render(this.scene, this.camera);
    const dataUrl = this.renderer.domElement.toDataURL('image/png');
    this.renderer.setSize(origW, origH);
    this.camera.updateProjectionMatrix();
    return dataUrl;
  }

  private getStandardMaterial(color: string, roughness: number, metalness: number, wireframe = false): THREE.Material {
    const key = `${color}_${roughness}_${metalness}_${wireframe}`;
    if (!this.materialsCache.has(key)) {
      this.materialsCache.set(
        key,
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(color),
          roughness,
          metalness,
          wireframe,
        })
      );
    }
    return this.materialsCache.get(key)!;
  }

  private clearGroup(group: THREE.Group) {
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh && child.geometry) {
        child.geometry.dispose();
      }
    }
  }

  public dispose() {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.renderer && this.renderer.domElement && this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
    this.renderer?.dispose();
  }
}
