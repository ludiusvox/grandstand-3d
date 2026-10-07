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
<<<<<<< HEAD
=======
  public onContextLost?: () => void;
  public onContextRestored?: () => void;
  public isContextLost = false;
  private needsRender = true;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
  private frameCount = 0;
  private lastFpsTime = performance.now();
  private currentFps = 60;

<<<<<<< HEAD
=======
  public requestRender() {
    this.needsRender = true;
  }

>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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

<<<<<<< HEAD
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
=======
    // 3. Renderer with robust fallback, memory conservation, and guaranteed dark background
    const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: !isMobile,
        alpha: false,
        preserveDrawingBuffer: false, // Prevents doubling VRAM framebuffer usage on mobile
        powerPreference: isMobile ? 'default' : 'high-performance',
        failIfMajorPerformanceCaveat: false,
      });
    } catch (e) {
      console.warn('Falling back to basic WebGLRenderer:', e);
      this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false, failIfMajorPerformanceCaveat: false });
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    }

    this.renderer.setClearColor(0x0a0f1d, 1.0);
    this.renderer.setSize(width, height);
<<<<<<< HEAD
    this.renderer.setPixelRatio(Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
=======
    this.renderer.setPixelRatio(isMobile ? 1.0 : Math.min(typeof window !== 'undefined' ? window.devicePixelRatio : 1, 2));
    this.renderer.shadowMap.enabled = !isMobile;
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.renderer.toneMapping = THREE.LinearToneMapping;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    this.renderer.toneMappingExposure = 1.1;

    // Guarantee canvas style prevents white flashes or mobile background leakage
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.backgroundColor = '#0a0f1d';
    this.renderer.domElement.style.outline = 'none';
    container.appendChild(this.renderer.domElement);

<<<<<<< HEAD
=======
    // Context loss / restoration listeners for mobile GPU survival
    this.renderer.domElement.addEventListener('webglcontextlost', (event: Event) => {
      event.preventDefault();
      console.warn('WebGL context lost! Halting render loop to conserve memory.');
      this.isContextLost = true;
      if (this.animationFrameId !== null) {
        cancelAnimationFrame(this.animationFrameId);
        this.animationFrameId = null;
      }
      this.onContextLost?.();
    }, false);

    this.renderer.domElement.addEventListener('webglcontextrestored', () => {
      console.info('WebGL context restored! Re-building scene.');
      this.isContextLost = false;
      this.materialsCache.clear();
      this.renderer.setClearColor(0x0a0f1d, 1.0);
      if (this.currentConfig) {
        this.updateBleacher(this.currentConfig);
      }
      this.needsRender = true;
      this.animate();
      this.onContextRestored?.();
    }, false);

>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    // 4. Orbit Controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
    this.controls.minDistance = 5;
    this.controls.maxDistance = 450;
    this.controls.target.set(10, 8, 0);
<<<<<<< HEAD
=======
    this.controls.addEventListener('change', () => {
      this.needsRender = true;
    });
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)

    // 5. Lighting
    this.hemiLight = new THREE.HemisphereLight(0xe2e8f0, 0x1e293b, 0.85);
    this.hemiLight.position.set(0, 100, 0);
    this.scene.add(this.hemiLight);

<<<<<<< HEAD
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.dirLight.position.set(80, 100, 60);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 2048;
    this.dirLight.shadow.mapSize.height = 2048;
=======
    const shadowSize = isMobile ? 512 : 2048;
    this.dirLight = new THREE.DirectionalLight(0xffffff, 1.4);
    this.dirLight.position.set(80, 100, 60);
    this.dirLight.castShadow = !isMobile;
    this.dirLight.shadow.mapSize.width = shadowSize;
    this.dirLight.shadow.mapSize.height = shadowSize;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
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
=======
    this.needsRender = true;
  }

  private animate = () => {
    if (this.isContextLost) return;
    this.animationFrameId = requestAnimationFrame(this.animate);

    try {
      const controlsMoved = this.controls.update();

      // Only execute GPU draw calls when camera moves or scene geometry updates
      if (controlsMoved || this.needsRender) {
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
        this.needsRender = false;
      }
    } catch (e) {
      console.warn('Three.js render cycle interrupted:', e);
    }
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
    const frontWalkwayWidth = isElevated ? 5.0 : 2.0;
=======
    // Front walkway width (6' standard, or 8' wide)
    const frontWalkwayWidth = config.walkwayWidthFt ?? 6.0;
    const walkwayColumns = config.walkwayColumns ?? 3;
    const understructureHeight = isElevated ? elevationFt : 2.5;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)

    // Materials
    const steelMat = this.getStandardMaterial(config.frameColor, 0.45, 0.6, config.wireframeMode);
    const boxFrameMat = this.getStandardMaterial('#475569', 0.5, 0.5, config.wireframeMode);
    const deckMat = this.getStandardMaterial(config.deckColor, 0.5, 0.35, config.wireframeMode);
<<<<<<< HEAD
    const riserMat = this.getStandardMaterial('#64748b', 0.5, 0.4, config.wireframeMode);
    const seatMat = this.getStandardMaterial(config.seatColor, 0.35, 0.2, config.wireframeMode);
=======
    // Risers / Kickboards have custom color selection (vertical board behind seats up to next level)
    const riserColor = config.riserColor || config.seatColor || '#1d4ed8';
    const riserMat = this.getStandardMaterial(riserColor, 0.4, 0.3, config.wireframeMode);
    // Seats are standard 2" x 10" clear anodized aluminum planks (no color changes)
    const seatMat = this.getStandardMaterial('#d1d5db', 0.35, 0.65, config.wireframeMode);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    const railMat = this.getStandardMaterial(config.railColor, 0.3, 0.7, config.wireframeMode);
    const chainLinkMat = this.getStandardMaterial('#94a3b8', 0.7, 0.3, true);
    const yellowStripeMat = this.getStandardMaterial('#eab308', 0.4, 0.1, config.wireframeMode);

<<<<<<< HEAD
    // 1. ELEVATED BOX FRAME UNDERSTRUCTURE (Sheet S6: Parts A2, B1, H1, I, I1, J4, J5)
=======
    // 1. MODULAR POST & BEAM UNDERSTRUCTURE WITH CROSS MEMBERS (Matching user CAD drawing)
    // 4-column deep 6ft walkway, vertical orange poles, white horizontal chords, green diagonal cross members
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    const frameSpacing = config.frameSpacingFt; // 6ft O.C.
    const frameCount = Math.max(2, Math.floor(lengthFt / frameSpacing) + 1);
    const actualSpacing = lengthFt / (frameCount - 1);
    const totalDepth = rows * runFt + frontWalkwayWidth;

<<<<<<< HEAD
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
=======
    this.buildModularFrameUnderstructure(
      frameCount,
      actualSpacing,
      halfLen,
      totalDepth,
      understructureHeight,
      isElevated,
      frontWalkwayWidth,
      walkwayColumns,
      config
    );

    // 2. STEPPED SEATING RAKER FRAMES (No diagonal beams directly to bleachers)
    // Stepped vertical riser posts & horizontal seat brackets resting on modular frame bents
    for (let f = 0; f < frameCount; f++) {
      const zPos = -halfLen + f * actualSpacing;
      this.buildRakerFrame(zPos, rows, riseFt, runFt, understructureHeight, frontWalkwayWidth, config, steelMat);
    }

    // Longitudinal sway bracing between bents (along Z axis) in dark red
    const darkRedXMat = this.getStandardMaterial('#991b1b', 0.35, 0.5, config.wireframeMode);
    this.buildSwayBracing(frameCount, actualSpacing, halfLen, rows, riseFt, runFt, understructureHeight, frontWalkwayWidth, darkRedXMat);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)

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

<<<<<<< HEAD
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
=======
    // 4. FRONT WALKWAY (6ft walkway, 3 poles deep)
    const walkwayX = frontWalkwayWidth / 2;
    const walkwayY = understructureHeight;
    this.buildPlankWithAisles(walkwayX, walkwayY, lengthFt, [], 0, frontWalkwayWidth, 0.15, deckMat, this.layerDeck);

    // Front Walkway Safety Railing (42" IBC) along front edge (X = 0.1)
    const fRailGeo = new THREE.CylinderGeometry(0.07, 0.07, lengthFt, 12);
    fRailGeo.rotateX(Math.PI / 2);
    const fRail = new THREE.Mesh(fRailGeo, railMat);
    fRail.position.set(0.1, walkwayY + 3.5, 0);
    fRail.castShadow = true;
    this.layerRails.add(fRail);

    // Front Mid-rail (21" IBC)
    const fMidRailGeo = new THREE.CylinderGeometry(0.05, 0.05, lengthFt, 10);
    fMidRailGeo.rotateX(Math.PI / 2);
    const fMidRail = new THREE.Mesh(fMidRailGeo, railMat);
    fMidRail.position.set(0.1, walkwayY + 1.75, 0);
    this.layerRails.add(fMidRail);

    // Front posts every 6ft along walkway
    for (let f = 0; f < frameCount; f++) {
      const pz = -halfLen + f * actualSpacing;
      const pGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
      const post = new THREE.Mesh(pGeo, railMat);
      post.position.set(0.1, walkwayY + 1.75, pz);
      post.castShadow = true;
      this.layerRails.add(post);
    }

    // End Guardrails on Front Walkway (spans full walkway width)
    if (config.accessStairs !== 'left' && config.accessStairs !== 'both') {
      const endRailGeo = new THREE.CylinderGeometry(0.07, 0.07, frontWalkwayWidth, 12);
      endRailGeo.rotateZ(Math.PI / 2);
      const endRail = new THREE.Mesh(endRailGeo, railMat);
      endRail.position.set(frontWalkwayWidth / 2, walkwayY + 3.5, -halfLen);
      this.layerRails.add(endRail);

      const endMidGeo = new THREE.CylinderGeometry(0.05, 0.05, frontWalkwayWidth, 10);
      endMidGeo.rotateZ(Math.PI / 2);
      const endMid = new THREE.Mesh(endMidGeo, railMat);
      endMid.position.set(frontWalkwayWidth / 2, walkwayY + 1.75, -halfLen);
      this.layerRails.add(endMid);

      const endPostGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
      const endPost = new THREE.Mesh(endPostGeo, railMat);
      endPost.position.set(frontWalkwayWidth, walkwayY + 1.75, -halfLen);
      this.layerRails.add(endPost);
    }

    if (config.accessStairs !== 'right' && config.accessStairs !== 'both') {
      const endRailGeo = new THREE.CylinderGeometry(0.07, 0.07, frontWalkwayWidth, 12);
      endRailGeo.rotateZ(Math.PI / 2);
      const endRail = new THREE.Mesh(endRailGeo, railMat);
      endRail.position.set(frontWalkwayWidth / 2, walkwayY + 3.5, halfLen);
      this.layerRails.add(endRail);

      const endMidGeo = new THREE.CylinderGeometry(0.05, 0.05, frontWalkwayWidth, 10);
      endMidGeo.rotateZ(Math.PI / 2);
      const endMid = new THREE.Mesh(endMidGeo, railMat);
      endMid.position.set(frontWalkwayWidth / 2, walkwayY + 1.75, halfLen);
      this.layerRails.add(endMid);

      const endPostGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
      const endPost = new THREE.Mesh(endPostGeo, railMat);
      endPost.position.set(frontWalkwayWidth, walkwayY + 1.75, halfLen);
      this.layerRails.add(endPost);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    }

    // 5. FOOTBOARDS & RISERS (Sheet S1/S2: 2x10 Anodized Seat Boards & 2x5 / 2x10 Footboards)
    const footboardCount = config.deckType === 'single-foot' ? 1 : 2;
    const footboardWidth = 0.82;

    for (let r = 0; r < rows; r++) {
      const rowX = frontWalkwayWidth + (r + 1) * runFt;
      const rowY = elevationFt + (r + 1) * riseFt;

<<<<<<< HEAD
      for (let p = 0; p < footboardCount; p++) {
        const offset = (p - (footboardCount - 1) / 2) * (footboardWidth + 0.06);
        const plankX = rowX - runFt * 0.5 + offset;
=======
      const extraCutouts = (config.adaEnabled && r === 0)
        ? [{ min: -config.adaSpaces * 3.5 / 2, max: config.adaSpaces * 3.5 / 2 }]
        : undefined;

      for (let p = 0; p < footboardCount; p++) {
        const offset = (p - (footboardCount - 1) / 2) * (footboardWidth + 0.04);
        // Footboards sit forward of the seat in the footwell area:
        const plankX = rowX - runFt * 0.78 + offset;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
          this.layerDeck
=======
          this.layerDeck,
          extraCutouts
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
          this.layerRisers
=======
          this.layerRisers,
          extraCutouts
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
        );
      }
    }

    // 6. SEATING PLANK / CHAIRS (Sheet S1: 2" x 10" Anodized Aluminum Seat Board)
<<<<<<< HEAD
    for (let r = 0; r < rows; r++) {
      const rowX = frontWalkwayWidth + (r + 1) * runFt;
      const rowY = elevationFt + (r + 1) * riseFt;
      const seatX = rowX;
      const seatY = rowY;
=======
    // "move the benches to be on top of the 5 row supports on top"
    for (let r = 0; r < rows; r++) {
      const rowX = frontWalkwayWidth + (r + 1) * runFt;
      const rowY = elevationFt + (r + 1) * riseFt;
      // Benches centered directly on top of the 5-row riser posts and top T-brackets:
      const seatX = rowX - runFt * 0.5;
      const seatY = rowY + 0.08;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)

      let adaCutoutRange: { minZ: number; maxZ: number } | null = null;
      if (config.adaEnabled && r === 0) {
        const adaWidth = config.adaSpaces * 3.5;
        adaCutoutRange = { minZ: -adaWidth / 2, maxZ: adaWidth / 2 };
      }

<<<<<<< HEAD
      if (config.seatType === 'bench' || config.seatType === 'bench-with-back') {
        this.buildSeatPlanks(seatX, seatY, lengthFt, aislePositionsFt, aisleWidthFt, adaCutoutRange, config, seatMat);
      } else {
        this.buildStadiumChairs(seatX, seatY, lengthFt, aislePositionsFt, aisleWidthFt, adaCutoutRange, config, seatMat);
      }
=======
      // Always build standard 2" x 10" clear anodized aluminum bench planks (no stadium chairs or backrests)
      this.buildSeatPlanks(seatX, seatY, lengthFt, aislePositionsFt, aisleWidthFt, adaCutoutRange, config, seatMat);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
  }

  /**
   * Builds the stacked 40" / 48" box frame towers underneath for elevated bleachers
   * Grounded in Sheet S6: Typical 40" Box Frame Assembly & X-Brace Detail (Parts A2, B1, H1, I, I1, J4, J5)
   * The front cross members of the "X" pattern dynamically adjust to fit all front elevation presets {2, 4, 8, 10} ft.
   */
  private buildElevatedBoxUnderstructure(
=======
    this.needsRender = true;
  }

  /**
   * Modular Frame Bent Understructure with Cross Members (Matching User's Engineering Diagram & Sheet S1)
   * - Front walkway supported by 4 columns deep across 6ft (or 3 columns deep selectable).
   * - 5-Row Component (5RC) Stepped System: Understructure columns and horizontal beams step up at every 5-row
   *   module (rows 5, 10, 15, 20) to keep the 5-row seating supports short.
   * - Green diagonal cross-members all slope uniformly: down from the back and up in the front.
   * - Multi-tier modular stacking for elevated grandstands with horizontal header & sill chords.
   */
  private buildModularFrameUnderstructure(
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    frameCount: number,
    actualSpacing: number,
    halfLen: number,
    totalDepth: number,
    elevationFt: number,
<<<<<<< HEAD
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

=======
    isElevated: boolean,
    frontWalkwayWidth: number,
    walkwayColumns: number,
    config: BleacherConfig
  ) {
    const colSize = 0.22;
    const chordHeight = 0.18;
    const chordWidth = 0.18;
    const braceRadius = 0.065;

    // Distinctive CAD Materials directly matching the user's uploaded engineering diagram:
    const postMat = this.getStandardMaterial('#d97706', 0.45, 0.45, config.wireframeMode); // Orange/Amber vertical poles
    const chordMat = this.getStandardMaterial('#f8fafc', 0.35, 0.5, config.wireframeMode); // White/Silver horizontal beams
    const crossMemberMat = this.getStandardMaterial('#16a34a', 0.3, 0.6, config.wireframeMode); // Green diagonal cross members
    const darkRedXMat = this.getStandardMaterial('#991b1b', 0.35, 0.45, config.wireframeMode); // Dark red side-to-side X-pattern bars
    const sillMat = this.getStandardMaterial('#1e293b', 0.8, 0.2, config.wireframeMode); // Dark ground runner sill
    const hardwareMat = this.getStandardMaterial('#94a3b8', 0.3, 0.8, config.wireframeMode);

    const rows = config.rows;
    const riseFt = config.rowRiseInches / 12;
    const runFt = config.rowRunInches / 12;

    // 1. Define Column Lines across the entire depth (Stepping up with 5-Row Component system):
    // A. Front Walkway columns (4 columns deep standard, at x = 0.15, 2.05, 3.95, 5.85)
    interface ColumnLine {
      x: number;
      topY: number;
    }
    const numWalkwayCols = walkwayColumns || 3;
    const colStartX = 0.15;
    const colEndX = frontWalkwayWidth - 0.15;
    const colSpan = colEndX - colStartX;
    const columns: ColumnLine[] = [];

    for (let c = 0; c < numWalkwayCols; c++) {
      const px = parseFloat((colStartX + (colSpan / (numWalkwayCols - 1)) * c).toFixed(3));
      columns.push({ x: px, topY: elevationFt });
    }

    // B. Seating columns stepping up with 5-Row Component (5RC) modules:
    // Every 5 rows, columns and beams step up to support the standardized 5RC modules
    const numModules = Math.ceil(rows / 5);

    for (let m = 0; m < numModules; m++) {
      const startRow = m * 5;
      const rowsInMod = Math.min(5, rows - startRow);
      const modStartX = frontWalkwayWidth + startRow * runFt;
      const modSpan = rowsInMod * runFt;
      const modBaseY = elevationFt + startRow * riseFt;
      const nextModBaseY = elevationFt + (startRow + rowsInMod) * riseFt;

      // Midpoint column in this 5-row module (supports module base beam)
      const midX = parseFloat((modStartX + modSpan / 2).toFixed(3));
      columns.push({ x: midX, topY: modBaseY });

      // End column of this 5-row module (steps up to nextModBaseY to carry the next 5-row module or rear upright)
      const endX = parseFloat((modStartX + modSpan).toFixed(3));
      columns.push({ x: endX, topY: nextModBaseY });
    }

    // 2. Build modular frame bents along length (Z axis)
    for (let f = 0; f < frameCount; f++) {
      const z = -halfLen + f * actualSpacing;

      // Base sill runner along ground (X direction)
      const sillGeo = new THREE.BoxGeometry(totalDepth + 0.6, 0.22, 0.8);
      const sill = new THREE.Mesh(sillGeo, sillMat);
      sill.position.set(totalDepth / 2, 0.11, z);
      sill.receiveShadow = true;
      this.layerUnderstructureBox.add(sill);

      // Vertical Orange Columns from ground up to each column's topY
      for (const col of columns) {
        const poleH = col.topY - chordHeight;
        if (poleH > 0.4) {
          const poleGeo = new THREE.BoxGeometry(colSize, poleH, colSize);
          const pole = new THREE.Mesh(poleGeo, postMat);
          pole.position.set(col.x, chordHeight / 2 + poleH / 2, z);
          pole.castShadow = true;
          this.layerUnderstructureBox.add(pole);
        }
      }

      // Horizontal top beams carrying walkway and each 5-row module base:
      // Walkway top beam
      const wSpan = frontWalkwayWidth;
      const wbGeo = new THREE.BoxGeometry(wSpan, chordHeight, chordWidth);
      const wb = new THREE.Mesh(wbGeo, chordMat);
      wb.position.set(wSpan / 2, elevationFt - chordHeight / 2, z);
      this.layerUnderstructureBox.add(wb);

      // Stepped horizontal beams for each 5-row module
      for (let m = 0; m < numModules; m++) {
        const startRow = m * 5;
        const rowsInMod = Math.min(5, rows - startRow);
        const mStartX = frontWalkwayWidth + startRow * runFt;
        const mSpan = rowsInMod * runFt;
        const mBaseY = elevationFt + startRow * riseFt;

        const bmGeo = new THREE.BoxGeometry(mSpan, chordHeight, chordWidth);
        const bm = new THREE.Mesh(bmGeo, chordMat);
        bm.position.set(mStartX + mSpan / 2, mBaseY - chordHeight / 2, z);
        bm.castShadow = true;
        this.layerUnderstructureBox.add(bm);
      }

      // Modular bays between adjacent columns:
      // All green diagonal supports go DOWN from the back and UP in the front!
      for (let b = 0; b < columns.length - 1; b++) {
        const colA = columns[b];
        const colB = columns[b + 1];
        const x1 = colA.x;
        const x2 = colB.x;
        const dx = x2 - x1;
        const midX = (x1 + x2) / 2;

        // Supported rectangular bay height
        const bayTopY = Math.min(colA.topY, colB.topY);
        const bayBottomY = 0;
        const bayH = bayTopY - bayBottomY;

        // Divide bay into vertical tiers of ~4.5 to 5.0 ft
        const numTiers = Math.max(1, Math.round(bayH / 4.8));
        const tierH = bayH / numTiers;

        for (let t = 0; t < numTiers; t++) {
          const y1 = bayBottomY + t * tierH;
          const y2 = bayBottomY + (t + 1) * tierH;
          const midY = (y1 + y2) / 2;

          // Horizontal Continuous Bracing ("CB") chords at tier levels
          if (t < numTiers - 1) {
            const chordGeo = new THREE.BoxGeometry(dx + colSize, chordHeight, chordWidth);
            const midChord = new THREE.Mesh(chordGeo, chordMat);
            midChord.position.set(midX, y2 - chordHeight / 2, z);
            this.layerUnderstructureBox.add(midChord);
          }

          // Green Diagonal Cross Member:
          // Strictly uniform orientation matching Sheet S1:
          // UP in the front (at x1, y2 - chordHeight), DOWN from the back (at x2, y1 + chordHeight)
          const braceH = y2 - y1 - chordHeight * 2;
          const braceLen = Math.sqrt(dx * dx + braceH * braceH);
          const angle = Math.atan2(braceH, dx);

          const diagGeo = new THREE.BoxGeometry(braceLen, braceRadius * 2, braceRadius * 2);
          const diag = new THREE.Mesh(diagGeo, crossMemberMat);
          diag.position.set(midX, midY, z);
          diag.rotation.z = -angle; // Down from the back, Up in the front
          diag.castShadow = true;
          this.layerUnderstructureBox.add(diag);

          // Gusset plate connectors at intersections
          const gussetGeo = new THREE.BoxGeometry(0.2, 0.2, 0.08);
          const g1 = new THREE.Mesh(gussetGeo, hardwareMat);
          g1.position.set(x1, y2 - chordHeight - 0.1, z); // Front top
          const g2 = new THREE.Mesh(gussetGeo, hardwareMat);
          g2.position.set(x2, y1 + chordHeight + 0.1, z); // Back bottom
          this.layerUnderstructureBox.add(g1, g2);
        }

        // Stepped connector if column B steps up higher for the next 5-row component
        if (colB.topY > bayTopY) {
          const stepGusset = new THREE.BoxGeometry(0.22, 0.22, 0.08);
          const sg = new THREE.Mesh(stepGusset, hardwareMat);
          sg.position.set(x2, bayTopY, z);
          this.layerUnderstructureBox.add(sg);
        }
      }
    }

    // 3. Longitudinal Runners & 3D Sway Cross-X Supports between bents (along Z axis)
    // Matches Screenshot 2026-09-24 5.10.26 PM: Planar horizontal sway X-braces & vertical sway X-braces to prevent sway
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    for (let f = 0; f < frameCount - 1; f++) {
      const z1 = -halfLen + f * actualSpacing;
      const z2 = -halfLen + (f + 1) * actualSpacing;
      const zMid = (z1 + z2) / 2;
<<<<<<< HEAD
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
=======
      const dz = z2 - z1;

      // Longitudinal top and bottom chords along each column line
      for (const col of columns) {
        const lRunnerGeo = new THREE.BoxGeometry(chordWidth, chordHeight, dz);
        const topRunner = new THREE.Mesh(lRunnerGeo, chordMat);
        topRunner.position.set(col.x, col.topY - chordHeight / 2, zMid);
        this.layerUnderstructureBox.add(topRunner);

        const bRunner = new THREE.Mesh(lRunnerGeo, chordMat);
        bRunner.position.set(col.x, 0.11 + chordHeight / 2, zMid);
        this.layerUnderstructureBox.add(bRunner);
      }

      // Vertical Sway Cross-X Braces along Z in each tier along all main column lines (Dark red):
      const swayColumnIndices = [
        0,
        numWalkwayCols - 1,
        ...columns.map((_, idx) => idx).filter(idx => idx >= numWalkwayCols && (idx - numWalkwayCols) % 2 === 1)
      ];

      for (const idx of swayColumnIndices) {
        if (!columns[idx]) continue;
        const col = columns[idx];
        const swayH = col.topY;
        const tiers = Math.max(1, Math.round(swayH / 4.8));
        const tH = swayH / tiers;

        for (let t = 0; t < tiers; t++) {
          const y1 = t * tH;
          const y2 = (t + 1) * tH;

          this.addSwayBrace(new THREE.Vector3(col.x, y1, z1), new THREE.Vector3(col.x, y2, z2), darkRedXMat, this.layerUnderstructureBox, 0.07);
          this.addSwayBrace(new THREE.Vector3(col.x, y2, z1), new THREE.Vector3(col.x, y1, z2), darkRedXMat, this.layerUnderstructureBox, 0.07);
        }
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
      }
    }
  }

  /**
<<<<<<< HEAD
   * Primary Seating Raker Frames (Sheet S3/S4)
=======
   * Helper to construct a 3D structural tube sway brace between two points
   */
  private addSwayBrace(
    p1: THREE.Vector3,
    p2: THREE.Vector3,
    mat: THREE.Material,
    group: THREE.Group,
    radius = 0.065
  ) {
    const dir = new THREE.Vector3().subVectors(p2, p1);
    const len = dir.length();
    if (len < 0.2) return;
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

    const geo = new THREE.CylinderGeometry(radius, radius, len, 6);
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.copy(mid);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone().normalize());
    mesh.castShadow = true;
    group.add(mesh);
  }

  /**
   * Primary Seating Raker Frames - 5-Row Component (5RC) Stepped System (Sheet S1 / North Carolina Welding)
   * - Bleachers are built with standardized 5-row components (5RC).
   * - Understructure columns and horizontal beams step up at each 5-row module to keep the 5-row seating supports short!
   * - Stepped vertical white riser posts (1 to 5 rows of rise) rest on top of each stepped platform beam.
   * - Horizontal seat and footboard support bracket arms at each row.
   * - Magenta vertical upright post at the rear row carrying the safety guardrail.
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
   */
  private buildRakerFrame(
    z: number,
    rows: number,
    riseFt: number,
    runFt: number,
<<<<<<< HEAD
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
=======
    understructureHeight: number,
    frontWalkwayWidth: number,
    config: BleacherConfig,
    _mat: THREE.Material
  ) {
    const riserWidth = 0.16;

    // Materials directly matching Sheet S1:
    const seatBaseMat = this.getStandardMaterial('#0284c7', 0.4, 0.5, config.wireframeMode); // Blue/Cyan base channel
    const riserPostMat = this.getStandardMaterial('#ffffff', 0.35, 0.4, config.wireframeMode); // White vertical riser posts
    const bracketMat = this.getStandardMaterial('#cbd5e1', 0.4, 0.5, config.wireframeMode); // Aluminum seat/foot brackets
    const rearUprightMat = this.getStandardMaterial('#db2777', 0.35, 0.6, config.wireframeMode); // Magenta/pink rear upright post

    // Standardized 5-Row Component (5RC) system:
    // Columns & horizontal beams step up at each 5-row module to keep the 5-row seating supports short!
    const numModules = Math.ceil(rows / 5);

    for (let m = 0; m < numModules; m++) {
      const startRow = m * 5;
      const rowsInMod = Math.min(5, rows - startRow);
      const modStartX = frontWalkwayWidth + startRow * runFt;
      const modDepth = rowsInMod * runFt;
      const modBaseY = understructureHeight + startRow * riseFt;

      // 1. Module base channel (blue/cyan) resting horizontally on the stepped understructure beam
      const baseRunnerGeo = new THREE.BoxGeometry(modDepth + 0.16, 0.16, 0.16);
      const baseRunner = new THREE.Mesh(baseRunnerGeo, seatBaseMat);
      baseRunner.position.set(modStartX + modDepth / 2, modBaseY + 0.08, z);
      baseRunner.castShadow = true;
      this.layerFrames.add(baseRunner);

      // 2. Short Stepped Vertical White Risers & Horizontal Cantilevered Seat Brackets (1 to 5 rows high)
      for (let lr = 0; lr < rowsInMod; lr++) {
        const globalRow = startRow + lr;
        const rowX = frontWalkwayWidth + (globalRow + 1) * runFt;
        const treadY = understructureHeight + (globalRow + 1) * riseFt;
        const riserH = (lr + 1) * riseFt; // Stays short: 1 to 5 rows of rise!

        // Vertical White Riser Post at this row
        const postX = rowX - runFt * 0.5;
        const postGeo = new THREE.BoxGeometry(riserWidth, riserH, riserWidth);
        const post = new THREE.Mesh(postGeo, riserPostMat);
        post.position.set(postX, modBaseY + riserH / 2, z);
        post.castShadow = true;
        this.layerFrames.add(post);

        // Horizontal Seat & Footboard Support Bracket Arm at top of riser
        const bGeo = new THREE.BoxGeometry(runFt * 0.98, 0.12, 0.18);
        const b = new THREE.Mesh(bGeo, bracketMat);
        b.position.set(rowX - runFt * 0.5, treadY - 0.06, z);
        b.castShadow = true;
        this.layerFrames.add(b);

        // Horizontal tie member connecting adjacent riser posts within this 5-row module
        if (lr > 0) {
          const prevPostX = frontWalkwayWidth + globalRow * runFt - runFt * 0.5;
          const prevTreadY = understructureHeight + globalRow * riseFt;
          const tieLen = postX - prevPostX;
          const tieGeo = new THREE.BoxGeometry(tieLen, 0.12, 0.12);
          const tie = new THREE.Mesh(tieGeo, riserPostMat);
          tie.position.set((postX + prevPostX) / 2, prevTreadY - 0.06, z);
          this.layerFrames.add(tie);
        }
      }
    }

    // 3. Tall Rear Upright Post (Magenta / Pink in User's Diagram)
    const rearX = frontWalkwayWidth + rows * runFt;
    const lastMod = numModules - 1;
    const lastModBaseY = understructureHeight + lastMod * 5 * riseFt;
    const rearTopY = understructureHeight + rows * riseFt + 3.8;
    const rearH = rearTopY - lastModBaseY;
    const rearUprightGeo = new THREE.BoxGeometry(riserWidth * 1.2, rearH, riserWidth * 1.2);
    const rearUpright = new THREE.Mesh(rearUprightGeo, rearUprightMat);
    rearUpright.position.set(rearX, lastModBaseY + rearH / 2, z);
    rearUpright.castShadow = true;
    this.layerFrames.add(rearUpright);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
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
=======
      // Vector from ground behind stadium (x = frontWalkwayWidth + stairLen, y = 0)
      // to landing platform at front (x = frontWalkwayWidth, y = elevationFt).
      // Spectators enter from behind the stadium and walk forward/up the stairway!
      const stringerLen = Math.sqrt(stairLen * stairLen + elevationFt * elevationFt);
      const stairAngle = Math.atan2(elevationFt, stairLen);
      const midStairX = frontWalkwayWidth + stairLen / 2;
      const midStairY = elevationFt / 2;

      const stringerGeo = new THREE.BoxGeometry(stringerLen, 0.5, 0.15);
      const s1 = new THREE.Mesh(stringerGeo, deckMat);
      s1.position.set(midStairX, midStairY, sz - stairWidth / 2);
      s1.rotation.z = -stairAngle; // Slopes up from ground behind stadium to landing platform
      s1.castShadow = true;

      const s2 = new THREE.Mesh(stringerGeo, deckMat);
      s2.position.set(midStairX, midStairY, sz + stairWidth / 2);
      s2.rotation.z = -stairAngle;
      s2.castShadow = true;
      this.layerStairs.add(s1, s2);

      // Intermediate support columns under mid-span of stair flight
      if (elevationFt > 2.5) {
        const midLegH = elevationFt / 2;
        const midLegGeo = new THREE.BoxGeometry(0.25, midLegH, 0.25);
        const ml1 = new THREE.Mesh(midLegGeo, deckMat);
        ml1.position.set(midStairX, midLegH / 2, sz - stairWidth / 2 + 0.2);
        const ml2 = new THREE.Mesh(midLegGeo, deckMat);
        ml2.position.set(midStairX, midLegH / 2, sz + stairWidth / 2 - 0.2);
        this.layerStairs.add(ml1, ml2);
      }

      // 3. Step Treads (Stepping up from ground behind stadium towards walkway)
      for (let s = 0; s < stepsCount; s++) {
        // s = 0 is highest step near landing platform (x = frontWalkwayWidth)
        // s = stepsCount - 1 is lowest step near ground level (x = frontWalkwayWidth + stairLen)
        const stepX = frontWalkwayWidth + (s + 0.5) * stepRun;
        const stepY = elevationFt - (s + 1) * (elevationFt / stepsCount);
        const treadGeo = new THREE.BoxGeometry(stepRun * 1.02, 0.15, stairWidth);
        const tread = new THREE.Mesh(treadGeo, deckMat);
        tread.position.set(stepX, stepY + 0.15 / 2, sz);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
        tread.castShadow = true;
        tread.receiveShadow = true;
        this.layerStairs.add(tread);
      }

      // 4. Continuous Stair Handrails & Guardrails (dual sides of stair flight)
<<<<<<< HEAD
      // Corrected rotation around Z for +Y cylinder: stairAngle - Math.PI / 2
      const railRotZ = stairAngle - Math.PI / 2;
=======
      // Slopes up towards front walkway: rotZ = Math.PI / 2 - stairAngle
      const railRotZ = Math.PI / 2 - stairAngle;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)

      for (const sideOffset of [-stairWidth / 2, stairWidth / 2]) {
        const railZ = sz + sideOffset;

        // Top Guardrail (42" / 3.5 ft above nosing)
        const topRailGeo = new THREE.CylinderGeometry(0.065, 0.065, stringerLen, 10);
        topRailGeo.rotateZ(railRotZ);
        const topRail = new THREE.Mesh(topRailGeo, railMat);
<<<<<<< HEAD
        topRail.position.set(-stairLen / 2, elevationFt / 2 + 3.5, railZ);
=======
        topRail.position.set(midStairX, midStairY + 3.5, railZ);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
        topRail.castShadow = true;
        this.layerStairs.add(topRail);

        // ADA Handrail (34" / 2.83 ft above nosing)
        const adaRailGeo = new THREE.CylinderGeometry(0.055, 0.055, stringerLen, 10);
        adaRailGeo.rotateZ(railRotZ);
        const adaRail = new THREE.Mesh(adaRailGeo, railMat);
<<<<<<< HEAD
        adaRail.position.set(-stairLen / 2, elevationFt / 2 + 2.83, railZ);
=======
        adaRail.position.set(midStairX, midStairY + 2.83, railZ);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
        adaRail.castShadow = true;
        this.layerStairs.add(adaRail);

        // Intermediate Rail (21" / 1.75 ft)
        const midRailGeo = new THREE.CylinderGeometry(0.045, 0.045, stringerLen, 8);
        midRailGeo.rotateZ(railRotZ);
        const midRail = new THREE.Mesh(midRailGeo, railMat);
<<<<<<< HEAD
        midRail.position.set(-stairLen / 2, elevationFt / 2 + 1.75, railZ);
=======
        midRail.position.set(midStairX, midStairY + 1.75, railZ);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
        this.layerStairs.add(midRail);

        // Vertical stanchion posts along stair incline
        const postSteps = [0, Math.floor(stepsCount / 2), stepsCount];
        for (const ps of postSteps) {
<<<<<<< HEAD
          const px = -ps * stepRun;
=======
          const px = frontWalkwayWidth + ps * stepRun;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
          const py = elevationFt - ps * (elevationFt / stepsCount);
          const pGeo = new THREE.CylinderGeometry(0.06, 0.06, 3.5, 8);
          const post = new THREE.Mesh(pGeo, postMat);
          post.position.set(px, py + 1.75, railZ);
          post.castShadow = true;
          this.layerStairs.add(post);
        }

<<<<<<< HEAD
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
=======
        // Bottom ADA 12-inch horizontal extension loop (behind stadium at ground entrance)
        const bottomExtGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.0, 8);
        bottomExtGeo.rotateZ(Math.PI / 2);
        const bExt = new THREE.Mesh(bottomExtGeo, railMat);
        bExt.position.set(frontWalkwayWidth + stairLen + 0.5, 2.83, railZ);
        this.layerStairs.add(bExt);
      }

      // 5. Landing Guardrails - Matches Front Guard Rail (42" Top Rail, 21" Mid Rail, Vertical Posts)
      // Front railing along X = 0.1 (faces field, prevents falling forward off the landing)
      const landingFrontRailGeo = new THREE.CylinderGeometry(0.07, 0.07, stairWidth, 12);
      landingFrontRailGeo.rotateX(Math.PI / 2);
      const lFrontRail = new THREE.Mesh(landingFrontRailGeo, railMat);
      lFrontRail.position.set(0.1, elevationFt + 3.5, sz);
      lFrontRail.castShadow = true;
      this.layerStairs.add(lFrontRail);

      const landingFrontMidGeo = new THREE.CylinderGeometry(0.05, 0.05, stairWidth, 10);
      landingFrontMidGeo.rotateX(Math.PI / 2);
      const lFrontMid = new THREE.Mesh(landingFrontMidGeo, railMat);
      lFrontMid.position.set(0.1, elevationFt + 1.75, sz);
      this.layerStairs.add(lFrontMid);

      // Outer side railing (facing outside, opposite walkway entrance)
      const outerSideZ = isLeft ? sz - stairWidth / 2 : sz + stairWidth / 2;
      const landingSideRailGeo = new THREE.CylinderGeometry(0.07, 0.07, frontWalkwayWidth, 12);
      landingSideRailGeo.rotateZ(Math.PI / 2);
      const lSideRail = new THREE.Mesh(landingSideRailGeo, railMat);
      lSideRail.position.set(frontWalkwayWidth / 2, elevationFt + 3.5, outerSideZ);
      lSideRail.castShadow = true;
      this.layerStairs.add(lSideRail);

      const landingSideMidGeo = new THREE.CylinderGeometry(0.05, 0.05, frontWalkwayWidth, 10);
      landingSideMidGeo.rotateZ(Math.PI / 2);
      const lSideMid = new THREE.Mesh(landingSideMidGeo, railMat);
      lSideMid.position.set(frontWalkwayWidth / 2, elevationFt + 1.75, outerSideZ);
      this.layerStairs.add(lSideMid);

      // Vertical posts for landing perimeter
      const lpGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
      const innerZ = isLeft ? -halfLen : halfLen;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
      const lp1 = new THREE.Mesh(lpGeo, postMat);
      lp1.position.set(frontWalkwayWidth - 0.1, elevationFt + 1.75, outerSideZ);
      const lp2 = new THREE.Mesh(lpGeo, postMat);
      lp2.position.set(0.1, elevationFt + 1.75, outerSideZ);
<<<<<<< HEAD
      this.layerStairs.add(lp1, lp2);
=======
      const lp3 = new THREE.Mesh(lpGeo, postMat);
      lp3.position.set(frontWalkwayWidth / 2, elevationFt + 1.75, outerSideZ);
      const lp4 = new THREE.Mesh(lpGeo, postMat);
      lp4.position.set(0.1, elevationFt + 1.75, innerZ);
      const lp5 = new THREE.Mesh(lpGeo, postMat);
      lp5.position.set(frontWalkwayWidth - 0.1, elevationFt + 1.75, innerZ);
      this.layerStairs.add(lp1, lp2, lp3, lp4, lp5);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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

<<<<<<< HEAD
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
=======
    // 1. REAR GUARDRAIL - Matches Front Guard Rail (42" Top Rail, 21" Mid Rail, Vertical Posts every 6ft)
    if (config.backGuardrail) {
      // Continuous Top Rail (42" IBC)
      const topRailGeo = new THREE.CylinderGeometry(0.07, 0.07, lengthFt, 12);
      topRailGeo.rotateX(Math.PI / 2);
      const topRail = new THREE.Mesh(topRailGeo, railMat);
      topRail.position.set(topX + 0.1, topY + 3.5, 0);
      topRail.castShadow = true;
      this.layerRails.add(topRail);

      // Horizontal Mid-Rail (21" IBC)
      const midRailGeo = new THREE.CylinderGeometry(0.05, 0.05, lengthFt, 10);
      midRailGeo.rotateX(Math.PI / 2);
      const midRail = new THREE.Mesh(midRailGeo, railMat);
      midRail.position.set(topX + 0.1, topY + 1.75, 0);
      this.layerRails.add(midRail);

      // Rear posts every 6ft matching front guard rail posts
      const frameSpacing = config.frameSpacingFt || 6;
      const frameCount = Math.max(2, Math.floor(lengthFt / frameSpacing) + 1);
      const actualSpacing = lengthFt / (frameCount - 1);
      for (let f = 0; f < frameCount; f++) {
        const pz = -halfLen + f * actualSpacing;
        const pGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
        const post = new THREE.Mesh(pGeo, railMat);
        post.position.set(topX + 0.1, topY + 1.75, pz);
        post.castShadow = true;
        this.layerRails.add(post);
      }
    }

    // 2. SIDE GUARDRAILS - Matches Front Guard Rail (Sloped Top Rail, Sloped Mid Rail, Vertical Posts at rows)
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    if (config.sideGuardrails || config.sideBarricades) {
      const totalSlopeDepth = rows * runFt;
      const totalSlopeRise = rows * riseFt;
      const slopeLen = Math.sqrt(totalSlopeDepth * totalSlopeDepth + totalSlopeRise * totalSlopeRise);
      const slopeAngle = Math.atan2(totalSlopeRise, totalSlopeDepth);
      // Corrected rotation around Z for +Y cylinder: slopeAngle - Math.PI / 2 (positive upward slope)
      const sideRailRotZ = slopeAngle - Math.PI / 2;

      for (const sideZ of [-halfLen, halfLen]) {
<<<<<<< HEAD
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
=======
        // Continuous Sloped Top Rail (42" IBC)
        const sRailGeo = new THREE.CylinderGeometry(0.07, 0.07, slopeLen, 12);
        sRailGeo.rotateZ(sideRailRotZ);
        const sRail = new THREE.Mesh(sRailGeo, railMat);
        sRail.position.set(frontWalkwayWidth + totalSlopeDepth / 2, elevationFt + totalSlopeRise / 2 + 3.5, sideZ);
        sRail.castShadow = true;
        this.layerRails.add(sRail);

        // Continuous Sloped Mid-Rail (21" IBC)
        const sMidRailGeo = new THREE.CylinderGeometry(0.05, 0.05, slopeLen, 10);
        sMidRailGeo.rotateZ(sideRailRotZ);
        const sMidRail = new THREE.Mesh(sMidRailGeo, railMat);
        sMidRail.position.set(frontWalkwayWidth + totalSlopeDepth / 2, elevationFt + totalSlopeRise / 2 + 1.75, sideZ);
        this.layerRails.add(sMidRail);

        // Side Guard Vertical Posts at each row (3.5 ft high matching front posts)
        for (let r = 0; r <= rows; r++) {
          const rx = frontWalkwayWidth + r * runFt;
          const ry = elevationFt + r * riseFt;
          const postGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
          const post = new THREE.Mesh(postGeo, railMat);
          post.position.set(rx, ry + 1.75, sideZ);
          post.castShadow = true;
          this.layerRails.add(post);
        }
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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

<<<<<<< HEAD
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
=======
    // Structural support under press box: Stacked modular square frame boxes matching bleacher undercarriage
    const postMat = this.getStandardMaterial('#d97706', 0.45, 0.45, config.wireframeMode); // Orange/Amber vertical posts
    const chordMat = this.getStandardMaterial('#f8fafc', 0.35, 0.5, config.wireframeMode); // White/Silver horizontal chords
    const crossMemberMat = this.getStandardMaterial('#16a34a', 0.3, 0.6, config.wireframeMode); // Green diagonal cross members
    const darkRedXMat = this.getStandardMaterial('#991b1b', 0.35, 0.45, config.wireframeMode); // Dark red side-to-side X pattern
    const hardwareMat = this.getStandardMaterial('#94a3b8', 0.3, 0.8, config.wireframeMode); // Stacking sleeve plates
    const sillMat = this.getStandardMaterial('#1e293b', 0.8, 0.2, config.wireframeMode); // Ground base runner sill

    const colCount = pbWidth === 40 ? 7 : 4;
    const colSpacing = pbWidth / (colCount - 1);
    const cabinFloorY = topY + 0.4;
    const frontX = topX + 1.2;
    const midX = frontX + pbDepth / 2; // 4.0 ft depth midpoint column line
    const rearX = frontX + pbDepth; // 8.0 ft depth rear column line
    const depthCols = [frontX, midX, rearX];
    const depthSpan = 4.0; // 4.0 ft square modular frame width

    // Modular stacked tiers (~4.0 ft per tier, creating square 4ft x 4ft stacked box units)
    const tierHeight4Ft = 4.0;
    const numTiers = Math.max(1, Math.round(cabinFloorY / tierHeight4Ft));
    const actualTierH = cabinFloorY / numTiers; // ~4.0 ft per tier
    const colSize = 0.22;
    const chordH = 0.18;
    const chordW = 0.18;

    // 1. Ground base sill runners under each bent line (along X)
    for (let c = 0; c < colCount; c++) {
      const cz = -pbWidth / 2 + c * colSpacing;
      const sillGeo = new THREE.BoxGeometry(pbDepth + 0.6, 0.22, 0.6);
      const sill = new THREE.Mesh(sillGeo, sillMat);
      sill.position.set(midX, 0.11, cz);
      sill.receiveShadow = true;
      this.layerPressBox.add(sill);
    }

    // 2. Stacked Square Modular Box Frames (Tiers 0 to numTiers - 1)
    for (let t = 0; t < numTiers; t++) {
      const y1 = t * actualTierH;
      const y2 = (t + 1) * actualTierH;
      const postH = actualTierH - chordH;
      const postMidY = y1 + chordH / 2 + postH / 2;

      // A. Vertical Posts in this modular box tier (separate posts per tier, NOT one long post!)
      for (const x of depthCols) {
        for (let c = 0; c < colCount; c++) {
          const cz = -pbWidth / 2 + c * colSpacing;
          const postGeo = new THREE.BoxGeometry(colSize, postH, colSize);
          const post = new THREE.Mesh(postGeo, postMat);
          post.position.set(x, postMidY, cz);
          post.castShadow = true;
          this.layerPressBox.add(post);

          // Stacking Joint Flange Plates where upper square box sits on lower square box
          if (t < numTiers - 1) {
            const plateGeo = new THREE.BoxGeometry(colSize + 0.08, 0.08, colSize + 0.08);
            const plate = new THREE.Mesh(plateGeo, hardwareMat);
            plate.position.set(x, y2, cz);
            this.layerPressBox.add(plate);
          }
        }
      }

      // B. Horizontal Top and Bottom Perimeter Chords for each square box frame
      // Chords across depth (X direction, 4.0 ft span between columns)
      for (let c = 0; c < colCount; c++) {
        const cz = -pbWidth / 2 + c * colSpacing;

        // Front bay chord (frontX to midX)
        const chordGeo = new THREE.BoxGeometry(depthSpan, chordH, chordW);
        const topChord1 = new THREE.Mesh(chordGeo, chordMat);
        topChord1.position.set(frontX + depthSpan / 2, y2 - chordH / 2, cz);
        this.layerPressBox.add(topChord1);

        // Rear bay chord (midX to rearX)
        const topChord2 = new THREE.Mesh(chordGeo, chordMat);
        topChord2.position.set(midX + depthSpan / 2, y2 - chordH / 2, cz);
        this.layerPressBox.add(topChord2);

        // Ground tier bottom chords
        if (t === 0) {
          const botChord1 = new THREE.Mesh(chordGeo, chordMat);
          botChord1.position.set(frontX + depthSpan / 2, chordH / 2, cz);
          const botChord2 = new THREE.Mesh(chordGeo, chordMat);
          botChord2.position.set(midX + depthSpan / 2, chordH / 2, cz);
          this.layerPressBox.add(botChord1, botChord2);
        }

        // C. Green Diagonal Cross Members inside each 4ft x 4ft square frame (down from back, up in front)
        this.addSwayBrace(
          new THREE.Vector3(frontX, y2 - chordH, cz),
          new THREE.Vector3(midX, y1 + chordH, cz),
          crossMemberMat,
          this.layerPressBox,
          0.065
        );
        this.addSwayBrace(
          new THREE.Vector3(midX, y2 - chordH, cz),
          new THREE.Vector3(rearX, y1 + chordH, cz),
          crossMemberMat,
          this.layerPressBox,
          0.065
        );
      }

      // Chords along width (Z direction, connecting adjacent frame bents)
      for (let c = 0; c < colCount - 1; c++) {
        const cz1 = -pbWidth / 2 + c * colSpacing;
        const cz2 = -pbWidth / 2 + (c + 1) * colSpacing;
        const zMid = (cz1 + cz2) / 2;

        for (const x of depthCols) {
          const zChordGeo = new THREE.BoxGeometry(chordW, chordH, colSpacing);
          const topZChord = new THREE.Mesh(zChordGeo, chordMat);
          topZChord.position.set(x, y2 - chordH / 2, zMid);
          this.layerPressBox.add(topZChord);

          if (t === 0) {
            const botZChord = new THREE.Mesh(zChordGeo, chordMat);
            botZChord.position.set(x, chordH / 2, zMid);
            this.layerPressBox.add(botZChord);
          }
        }

        // D. Side-to-Side X-Pattern Sway Bracing on front and rear walls of each stacked box
        this.addSwayBrace(new THREE.Vector3(frontX, y1, cz1), new THREE.Vector3(frontX, y2, cz2), darkRedXMat, this.layerPressBox, 0.08);
        this.addSwayBrace(new THREE.Vector3(frontX, y2, cz1), new THREE.Vector3(frontX, y1, cz2), darkRedXMat, this.layerPressBox, 0.08);

        this.addSwayBrace(new THREE.Vector3(rearX, y1, cz1), new THREE.Vector3(rearX, y2, cz2), darkRedXMat, this.layerPressBox, 0.08);
        this.addSwayBrace(new THREE.Vector3(rearX, y2, cz1), new THREE.Vector3(rearX, y1, cz2), darkRedXMat, this.layerPressBox, 0.08);
      }
    }

    // 1. Main Insulated Booth Cabin (Matching custom color / vibrant factory red in photo)
    const cabinColor = pb.color || '#dc2626';
    const cabinMat = this.getStandardMaterial(cabinColor, 0.35, 0.2);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    const cabinGeo = new THREE.BoxGeometry(pbDepth, pbHeight, pbWidth);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(boxX, boxY, 0);
    cabin.castShadow = true;
    this.layerPressBox.add(cabin);

<<<<<<< HEAD
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
=======
    // 2. White Perimeter Roof Fascia / Trim (As featured in factory photo)
    const roofTrimMat = this.getStandardMaterial('#f8fafc', 0.25, 0.1);
    const roofTrimGeo = new THREE.BoxGeometry(pbDepth + 0.35, 0.4, pbWidth + 0.35);
    const roofTrim = new THREE.Mesh(roofTrimGeo, roofTrimMat);
    roofTrim.position.set(boxX, boxY + pbHeight / 2 - 0.2, 0);
    this.layerPressBox.add(roofTrim);

    // 3. Black-Framed Punched Picture Windows (Grounded in uploaded factory booth photo)
    const winH = 4.2; // 4.2ft tall picture windows
    const winCenterY = cabinFloorY + 2.5 + winH / 2; // Bottom sill at 2.5ft from floor, top at 6.7ft
    const frameMat = this.getStandardMaterial('#0f172a', 0.6, 0.4); // Bold architectural black frame
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a8a,
      roughness: 0.08,
      metalness: 0.15,
      transmission: 0.78,
      transparent: true,
      opacity: 0.88,
    });

    // Front Wall Windows (Facing field & spectators)
    const frontWinCount = pbWidth === 40 ? 6 : 3;
    const frontWinW = pbWidth === 40 ? 4.5 : 4.4;
    const frontSpacing = pbWidth / frontWinCount;

    for (let w = 0; w < frontWinCount; w++) {
      const wz = -pbWidth / 2 + (w + 0.5) * frontSpacing;
      const wx = boxX - pbDepth / 2;

      // Picture Glass Pane
      const glassGeo = new THREE.BoxGeometry(0.06, winH, frontWinW);
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(wx - 0.03, winCenterY, wz);
      this.layerPressBox.add(glass);

      // Bold Black Perimeter Frame Casing
      const topFrameGeo = new THREE.BoxGeometry(0.14, 0.18, frontWinW + 0.36);
      const topFrame = new THREE.Mesh(topFrameGeo, frameMat);
      topFrame.position.set(wx - 0.05, winCenterY + winH / 2, wz);

      const botFrameGeo = new THREE.BoxGeometry(0.14, 0.18, frontWinW + 0.36);
      const botFrame = new THREE.Mesh(botFrameGeo, frameMat);
      botFrame.position.set(wx - 0.05, winCenterY - winH / 2, wz);

      const sideFrameGeo = new THREE.BoxGeometry(0.14, winH, 0.18);
      const leftFrame = new THREE.Mesh(sideFrameGeo, frameMat);
      leftFrame.position.set(wx - 0.05, winCenterY, wz - frontWinW / 2);

      const rightFrame = new THREE.Mesh(sideFrameGeo, frameMat);
      rightFrame.position.set(wx - 0.05, winCenterY, wz + frontWinW / 2);

      this.layerPressBox.add(topFrame, botFrame, leftFrame, rightFrame);
    }

    // Side End Wall Windows (Left and Right ends, exactly as shown on the trailer photo!)
    const sideWinW = 4.6; // Spans 4.6ft across depth of end wall
    for (const sideZ of [-pbWidth / 2, pbWidth / 2]) {
      const zOffset = sideZ > 0 ? 0.03 : -0.03;
      const frameZOffset = sideZ > 0 ? 0.05 : -0.05;

      // Side Picture Glass Pane
      const sGlassGeo = new THREE.BoxGeometry(sideWinW, winH, 0.06);
      const sGlass = new THREE.Mesh(sGlassGeo, glassMat);
      sGlass.position.set(boxX, winCenterY, sideZ + zOffset);
      this.layerPressBox.add(sGlass);

      // Bold Black Perimeter Frame Casing on End Wall
      const sTopFrameGeo = new THREE.BoxGeometry(sideWinW + 0.36, 0.18, 0.14);
      const sTopFrame = new THREE.Mesh(sTopFrameGeo, frameMat);
      sTopFrame.position.set(boxX, winCenterY + winH / 2, sideZ + frameZOffset);

      const sBotFrameGeo = new THREE.BoxGeometry(sideWinW + 0.36, 0.18, 0.14);
      const sBotFrame = new THREE.Mesh(sBotFrameGeo, frameMat);
      sBotFrame.position.set(boxX, winCenterY - winH / 2, sideZ + frameZOffset);

      const sJambGeo = new THREE.BoxGeometry(0.18, winH, 0.14);
      const sLeftJamb = new THREE.Mesh(sJambGeo, frameMat);
      sLeftJamb.position.set(boxX - sideWinW / 2, winCenterY, sideZ + frameZOffset);

      const sRightJamb = new THREE.Mesh(sJambGeo, frameMat);
      sRightJamb.position.set(boxX + sideWinW / 2, winCenterY, sideZ + frameZOffset);

      this.layerPressBox.add(sTopFrame, sBotFrame, sLeftJamb, sRightJamb);
    }

    // Back Concourse Windows
    const backWinCount = frontWinCount;
    for (let w = 0; w < backWinCount; w++) {
      const wz = -pbWidth / 2 + (w + 0.5) * frontSpacing;
      const wx = boxX + pbDepth / 2;

      // Picture Glass Pane
      const glassGeo = new THREE.BoxGeometry(0.06, winH, frontWinW);
      const glass = new THREE.Mesh(glassGeo, glassMat);
      glass.position.set(wx + 0.03, winCenterY, wz);
      this.layerPressBox.add(glass);

      // Black Frame Casing
      const topFrameGeo = new THREE.BoxGeometry(0.14, 0.18, frontWinW + 0.36);
      const topFrame = new THREE.Mesh(topFrameGeo, frameMat);
      topFrame.position.set(wx + 0.05, winCenterY + winH / 2, wz);

      const botFrameGeo = new THREE.BoxGeometry(0.14, 0.18, frontWinW + 0.36);
      const botFrame = new THREE.Mesh(botFrameGeo, frameMat);
      botFrame.position.set(wx + 0.05, winCenterY - winH / 2, wz);

      const sideFrameGeo = new THREE.BoxGeometry(0.14, winH, 0.18);
      const leftFrame = new THREE.Mesh(sideFrameGeo, frameMat);
      leftFrame.position.set(wx + 0.05, winCenterY, wz - frontWinW / 2);

      const rightFrame = new THREE.Mesh(sideFrameGeo, frameMat);
      rightFrame.position.set(wx + 0.05, winCenterY, wz + frontWinW / 2);

      this.layerPressBox.add(topFrame, botFrame, leftFrame, rightFrame);
    }

>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
    targetGroup: THREE.Group
  ) {
    const halfLen = totalLen / 2;
    if (aislePositions.length === 0) {
=======
    targetGroup: THREE.Group,
    extraCutouts?: { min: number; max: number }[]
  ) {
    const halfLen = totalLen / 2;
    const cuts: { min: number; max: number }[] = [];
    for (const a of aislePositions) {
      cuts.push({ min: a - aisleWidth / 2, max: a + aisleWidth / 2 });
    }
    if (extraCutouts) {
      for (const ec of extraCutouts) {
        cuts.push(ec);
      }
    }

    if (cuts.length === 0) {
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
      const geo = new THREE.BoxGeometry(plankWidth, plankThick, totalLen);
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, y, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      targetGroup.add(mesh);
      return;
    }

<<<<<<< HEAD
    const boundaries = [-halfLen];
    for (const a of aislePositions) {
      boundaries.push(a - aisleWidth / 2);
      boundaries.push(a + aisleWidth / 2);
=======
    cuts.sort((a, b) => a.min - b.min);
    const mergedCuts: { min: number; max: number }[] = [];
    for (const cut of cuts) {
      if (mergedCuts.length === 0 || mergedCuts[mergedCuts.length - 1].max < cut.min) {
        mergedCuts.push({ ...cut });
      } else {
        mergedCuts[mergedCuts.length - 1].max = Math.max(mergedCuts[mergedCuts.length - 1].max, cut.max);
      }
    }

    const boundaries = [-halfLen];
    for (const cut of mergedCuts) {
      const clampedMin = Math.max(-halfLen, Math.min(halfLen, cut.min));
      const clampedMax = Math.max(-halfLen, Math.min(halfLen, cut.max));
      if (clampedMax > clampedMin) {
        boundaries.push(clampedMin);
        boundaries.push(clampedMax);
      }
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
    targetGroup: THREE.Group
  ) {
    this.buildPlankWithAisles(x, y, totalLen, aislePositions, aisleWidth, thickness, height, mat, targetGroup);
=======
    targetGroup: THREE.Group,
    extraCutouts?: { min: number; max: number }[]
  ) {
    this.buildPlankWithAisles(x, y, totalLen, aislePositions, aisleWidth, thickness, height, mat, targetGroup, extraCutouts);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
=======
    // Standard 2" x 10" clear anodized aluminum bench plank (no backrests)
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    const geo = new THREE.BoxGeometry(w, h, segLen);
    const mesh = new THREE.Mesh(geo, seatMat);
    mesh.position.set(x, y, zMid);
    mesh.castShadow = true;
    this.layerSeats.add(mesh);
<<<<<<< HEAD

    if (config.seatType === 'bench-with-back') {
      const backMat = this.getStandardMaterial(config.backrestColor, 0.4, 0.2);
      const backGeo = new THREE.BoxGeometry(0.12, 0.65, segLen);
      const backMesh = new THREE.Mesh(backGeo, backMat);
      backMesh.position.set(x - w / 2 + 0.06, y + 0.65, zMid);
      backMesh.castShadow = true;
      this.layerSeats.add(backMesh);
    }
=======
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
      stanchion.position.set(x - 0.2, y - 0.25, cz);
=======
      stanchion.position.set(x + 0.2, y - 0.25, cz);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
      this.layerSeats.add(stanchion);

      const panGeo = new THREE.BoxGeometry(0.9, 0.14, actualWidth * 0.85);
      const pan = new THREE.Mesh(panGeo, seatMat);
      pan.position.set(x, y + 0.08, cz);
      pan.castShadow = true;
      this.layerSeats.add(pan);

<<<<<<< HEAD
      const backGeo = new THREE.BoxGeometry(0.12, 0.8, actualWidth * 0.85);
      const back = new THREE.Mesh(backGeo, seatMat);
      back.position.set(x - 0.45, y + 0.6, cz);
      back.rotation.z = -0.1;
=======
      // Back panel positioned opposite of the front rail (at +X facing field towards -X)
      const backGeo = new THREE.BoxGeometry(0.12, 0.8, actualWidth * 0.85);
      const back = new THREE.Mesh(backGeo, seatMat);
      back.position.set(x + 0.38, y + 0.55, cz);
      back.rotation.z = 0.12; // Ergonomic tilt backwards towards +X
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
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
=======
        const treadY = elevationFt + (r + 1) * riseFt;
        const panelThick = 0.15;

        // Flat horizontal aisle tread panel matching the 5-step bracket flashing supports
        const stepGeo = new THREE.BoxGeometry(runFt * 0.98, panelThick, aisleWidth * 0.96);
        const stepMesh = new THREE.Mesh(stepGeo, stepMat);
        stepMesh.position.set(stepX, treadY - panelThick / 2, az);
        stepMesh.castShadow = true;
        stepMesh.receiveShadow = true;
        this.layerAisles.add(stepMesh);

        // Vertical step riser closing the front face of each aisle step
        const riserH = riseFt - panelThick;
        if (riserH > 0.05) {
          const riserGeo = new THREE.BoxGeometry(0.08, riserH, aisleWidth * 0.96);
          const riserMesh = new THREE.Mesh(riserGeo, stepMat);
          riserMesh.position.set(stepX - runFt * 0.49 + 0.04, treadY - panelThick - riserH / 2, az);
          riserMesh.castShadow = true;
          this.layerAisles.add(riserMesh);
        }

        if (config.contrastAisleStep) {
          const stripeGeo = new THREE.BoxGeometry(0.18, 0.03, aisleWidth * 0.96);
          const stripe = new THREE.Mesh(stripeGeo, stripeMat);
          stripe.position.set(stepX + runFt * 0.44, treadY + 0.015, az);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
          this.layerAisles.add(stripe);
        }
      }

      if (config.aisleHandrail) {
        const railStartX = frontWalkwayWidth + runFt * 0.5;
<<<<<<< HEAD
        const railStartY = elevationFt + riseFt * 0.5 + 2.85;
        const railEndX = frontWalkwayWidth + (rows - 0.5) * runFt;
        const railEndY = elevationFt + (rows - 0.5) * riseFt + 2.85;
=======
        const railStartY = elevationFt + 1.0 * riseFt + 2.85;
        const railEndX = frontWalkwayWidth + (rows - 0.5) * runFt;
        const railEndY = elevationFt + rows * riseFt + 2.85;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)

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
<<<<<<< HEAD
          const postStepY = elevationFt + (r + 0.5) * riseFt;
=======
          const postStepY = elevationFt + (r + 1) * riseFt;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
          const postH = 2.85;
          const postGeo = new THREE.CylinderGeometry(0.055, 0.055, postH, 8);
          const postMesh = new THREE.Mesh(postGeo, railMat);
          postMesh.position.set(postX, postStepY + postH / 2, az);
          postMesh.castShadow = true;
          this.layerAisles.add(postMesh);
        }

        // Top Row Terminal Post
        const topPostX = frontWalkwayWidth + (rows - 0.5) * runFt;
<<<<<<< HEAD
        const topPostY = elevationFt + (rows - 0.5) * riseFt;
=======
        const topPostY = elevationFt + rows * riseFt;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
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
=======
    const depthFt = runFt;
    // Platform extends seamlessly into row 0 (from frontWalkwayWidth to frontWalkwayWidth + runFt)
    const platX = frontWalkwayWidth + depthFt / 2;
    // Walkway deck is centered at elevationFt with thickness 0.15 (top surface is elevationFt + 0.075).
    // Placing the floor panel at elevationFt with thickness 0.15 makes it 100% flush with the walkway!
    const platY = elevationFt;

    // 1. Flush Wheelchair Access Floor Deck Panel
    const floorGeo = new THREE.BoxGeometry(depthFt, 0.15, widthFt);
    const floorMesh = new THREE.Mesh(floorGeo, deckMat);
    floorMesh.position.set(platX, platY, 0);
    floorMesh.castShadow = true;
    floorMesh.receiveShadow = true;
    this.layerAda.add(floorMesh);

    // 2. Yellow Tactile Warning Border Strip along front walkway boundary (flush on deck)
    const warningGeo = new THREE.BoxGeometry(0.25, 0.015, widthFt);
    const warningMesh = new THREE.Mesh(warningGeo, stripeMat);
    warningMesh.position.set(frontWalkwayWidth + 0.15, platY + 0.075 + 0.008, 0);
    this.layerAda.add(warningMesh);

    // 3. International Symbol of Access (ISA) Blue Emblem (flush on deck)
    const iconGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.015, 16);
    const iconMat = this.getStandardMaterial('#2563eb', 0.5, 0.1);
    const iconMesh = new THREE.Mesh(iconGeo, iconMat);
    iconMesh.position.set(platX, platY + 0.075 + 0.009, 0);
    this.layerAda.add(iconMesh);

    // 4. Rear Safety Guardrail behind wheelchair bay (matches front guard rail: 42" top, 21" mid)
    const rearX = frontWalkwayWidth + depthFt;
    const rTopRailGeo = new THREE.CylinderGeometry(0.07, 0.07, widthFt, 12);
    rTopRailGeo.rotateX(Math.PI / 2);
    const rTopRail = new THREE.Mesh(rTopRailGeo, railMat);
    rTopRail.position.set(rearX, elevationFt + 3.5, 0);
    rTopRail.castShadow = true;
    this.layerAda.add(rTopRail);

    const rMidRailGeo = new THREE.CylinderGeometry(0.05, 0.05, widthFt, 10);
    rMidRailGeo.rotateX(Math.PI / 2);
    const rMidRail = new THREE.Mesh(rMidRailGeo, railMat);
    rMidRail.position.set(rearX, elevationFt + 1.75, 0);
    this.layerAda.add(rMidRail);

    const rPostGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8);
    const rPost1 = new THREE.Mesh(rPostGeo, railMat);
    rPost1.position.set(rearX, elevationFt + 1.75, -widthFt / 2);
    const rPost2 = new THREE.Mesh(rPostGeo, railMat);
    rPost2.position.set(rearX, elevationFt + 1.75, widthFt / 2);
    this.layerAda.add(rPost1, rPost2);

    // 5. Side Divider Rails separating wheelchair bay from adjacent seating
    for (const sideZ of [-widthFt / 2, widthFt / 2]) {
      const sTopRailGeo = new THREE.CylinderGeometry(0.06, 0.06, depthFt, 10);
      sTopRailGeo.rotateZ(Math.PI / 2);
      const sTop = new THREE.Mesh(sTopRailGeo, railMat);
      sTop.position.set(platX, elevationFt + 3.5, sideZ);
      this.layerAda.add(sTop);

      const sMidRailGeo = new THREE.CylinderGeometry(0.045, 0.045, depthFt, 10);
      sMidRailGeo.rotateZ(Math.PI / 2);
      const sMid = new THREE.Mesh(sMidRailGeo, railMat);
      sMid.position.set(platX, elevationFt + 1.75, sideZ);
      this.layerAda.add(sMid);

      const frontCornerPost = new THREE.Mesh(rPostGeo, railMat);
      frontCornerPost.position.set(frontWalkwayWidth, elevationFt + 1.75, sideZ);
      this.layerAda.add(frontCornerPost);
    }
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
=======
      if (Array.isArray(this.groundMesh.material)) {
        this.groundMesh.material.forEach((m) => m.dispose());
      } else {
        this.groundMesh.material.dispose();
      }
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
      this.groundMesh = null;
    }

    const groundSize = 360;
    const canvas = document.createElement('canvas');
<<<<<<< HEAD
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
=======
    canvas.width = 2048;
    canvas.height = 2048;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const env = config.fieldEnvironment || 'football';
      switch (env) {
        case 'soccer':
          this.drawSoccerPitch(ctx);
          break;
        case 'racetrack':
          this.drawRacetrack(ctx);
          break;
        case 'dirt-track':
          this.drawDirtTrack(ctx);
          break;
        case 'football':
          this.drawFootballField(ctx);
          break;
        case 'track':
          this.drawAthleticsTrack(ctx);
          break;
        case 'basketball':
          this.drawBasketballCourt(ctx);
          break;
        case 'architectural-studio':
        default:
          this.drawCadStudioGrid(ctx);
          break;
      }
    }

    const groundTex = new THREE.CanvasTexture(canvas);
    if (this.renderer) {
      groundTex.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
    }
    groundTex.generateMipmaps = true;
    groundTex.minFilter = THREE.LinearMipmapLinearFilter;
    groundTex.magFilter = THREE.LinearFilter;

    const isCourt = config.fieldEnvironment === 'basketball';
    const groundGeo = new THREE.PlaneGeometry(groundSize, groundSize);
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTex,
      roughness: isCourt ? 0.3 : 0.85,
      metalness: isCourt ? 0.1 : 0.05,
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    });

    this.groundMesh = new THREE.Mesh(groundGeo, groundMat);
    this.groundMesh.rotation.x = -Math.PI / 2;
<<<<<<< HEAD
    this.groundMesh.position.y = -0.05;
=======
    this.groundMesh.position.set(-30, -0.05, 0);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
    this.groundMesh.receiveShadow = true;
    this.scene.add(this.groundMesh);
  }

<<<<<<< HEAD
=======
  private drawSoccerPitch(ctx: CanvasRenderingContext2D) {
    // Base stadium turf
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 2048, 2048);

    // Mowed grass horizontal stripes along Z
    ctx.fillStyle = '#16a34a';
    for (let y = 0; y < 2048; y += 128) {
      ctx.fillRect(0, y, 2048, 64);
    }

    // Pitch coordinates: field length along Y (Z in 3D), width along X
    const pLeft = 260;
    const pRight = 1120;
    const pWidth = pRight - pLeft; // 860 px (~150 ft)
    const pTop = 320;
    const pBottom = 1728;
    const pHeight = pBottom - pTop; // 1408 px (~245 ft)
    const pMidX = (pLeft + pRight) / 2;
    const pMidY = (pTop + pBottom) / 2;

    // Touchlines and goal lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(pLeft, pTop, pWidth, pHeight);

    // Halfway line
    ctx.beginPath();
    ctx.moveTo(pLeft, pMidY);
    ctx.lineTo(pRight, pMidY);
    ctx.stroke();

    // Center circle (radius 110 px ~20 yds) & center kickoff spot
    ctx.beginPath();
    ctx.arc(pMidX, pMidY, 110, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pMidX, pMidY, 6, 0, Math.PI * 2);
    ctx.fill();

    // Penalty Boxes (18-yard boxes)
    const penW = 380;
    const penD = 160;
    ctx.strokeRect(pMidX - penW / 2, pTop, penW, penD);
    ctx.strokeRect(pMidX - penW / 2, pBottom - penD, penW, penD);

    // Goal Boxes (6-yard boxes)
    const goalW = 160;
    const goalD = 55;
    ctx.strokeRect(pMidX - goalW / 2, pTop, goalW, goalD);
    ctx.strokeRect(pMidX - goalW / 2, pBottom - goalD, goalW, goalD);

    // Penalty spots
    ctx.beginPath();
    ctx.arc(pMidX, pTop + 105, 5, 0, Math.PI * 2);
    ctx.arc(pMidX, pBottom - 105, 5, 0, Math.PI * 2);
    ctx.fill();

    // Penalty arcs
    ctx.beginPath();
    ctx.arc(pMidX, pTop + 105, 80, 0.65, Math.PI - 0.65);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pMidX, pBottom - 105, 80, Math.PI + 0.65, -0.65);
    ctx.stroke();

    // Corner arcs (radius 20 px)
    const cRadius = 20;
    ctx.beginPath();
    ctx.arc(pLeft, pTop, cRadius, 0, Math.PI / 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pRight, pTop, cRadius, Math.PI / 2, Math.PI);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pLeft, pBottom, cRadius, -Math.PI / 2, 0);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(pRight, pBottom, cRadius, Math.PI, -Math.PI / 2);
    ctx.stroke();

    // Technical Areas (Coaching / player bench boxes along bleacher sideline at pRight)
    ctx.setLineDash([8, 8]);
    ctx.lineWidth = 3;
    ctx.strokeRect(pRight + 25, pMidY - 260, 45, 200);
    ctx.strokeRect(pRight + 25, pMidY + 60, 45, 200);
    ctx.setLineDash([]);
  }

  private drawFootballField(ctx: CanvasRenderingContext2D) {
    // Base field turf
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 2048, 2048);

    const fLeft = 240;
    const fRight = 1120;
    const fWidth = fRight - fLeft; // 880 px
    const fTop = 100;
    const fBottom = 1948;
    const endZoneH = 154; // 10 yards end zone
    const playTop = fTop + endZoneH;
    const playBottom = fBottom - endZoneH;
    const fiveYd = 15.4 * 5;

    // Alternating 5-yard mower stripes
    for (let s = 0; s < 20; s++) {
      if (s % 2 === 1) {
        ctx.fillStyle = '#166534';
        ctx.fillRect(fLeft, playTop + s * fiveYd, fWidth, fiveYd);
      }
    }

    // End Zones
    // Top End Zone: Royal Blue
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(fLeft, fTop, fWidth, endZoneH);
    // Bottom End Zone: Crimson Red
    ctx.fillStyle = '#991b1b';
    ctx.fillRect(fLeft, playBottom, fWidth, endZoneH);

    // Field boundary
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 8;
    ctx.strokeRect(fLeft, fTop, fWidth, fBottom - fTop);

    // Goal lines (bold white)
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(fLeft, playTop);
    ctx.lineTo(fRight, playTop);
    ctx.moveTo(fLeft, playBottom);
    ctx.lineTo(fRight, playBottom);
    ctx.stroke();

    // Yard lines every 5 yards
    ctx.lineWidth = 3;
    ctx.font = 'bold 36px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const yardNumbers = ['10', '20', '30', '40', '50', '40', '30', '20', '10'];
    for (let y = 1; y < 20; y++) {
      const yPos = playTop + y * fiveYd;
      ctx.lineWidth = y % 2 === 0 ? 5 : 2.5;
      ctx.beginPath();
      ctx.moveTo(fLeft, yPos);
      ctx.lineTo(fRight, yPos);
      ctx.stroke();

      // 10-yard numbers
      if (y % 2 === 0) {
        const idx = y / 2 - 1;
        const num = yardNumbers[idx];
        ctx.fillStyle = '#ffffff';
        ctx.fillText(num, fLeft + 70, yPos);
        ctx.fillText(num, fRight - 70, yPos);
      }
    }

    // Inbounds Hash Marks (every single yard along 2 center lines)
    const hash1X = fLeft + fWidth * 0.4;
    const hash2X = fLeft + fWidth * 0.6;
    ctx.lineWidth = 2;
    for (let yd = 1; yd < 100; yd++) {
      const yp = playTop + yd * 15.4;
      ctx.beginPath();
      ctx.moveTo(hash1X - 6, yp);
      ctx.lineTo(hash1X + 6, yp);
      ctx.moveTo(hash2X - 6, yp);
      ctx.lineTo(hash2X + 6, yp);
      ctx.moveTo(fLeft, yp);
      ctx.lineTo(fLeft + 8, yp);
      ctx.moveTo(fRight - 8, yp);
      ctx.lineTo(fRight, yp);
      ctx.stroke();
    }

    // Yellow coaching box along bleacher sideline
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 4;
    ctx.strokeRect(fRight + 20, playTop + 5 * fiveYd, 50, 10 * fiveYd);
  }

  private drawRacetrack(ctx: CanvasRenderingContext2D) {
    // Safety gravel / sand runoff base
    ctx.fillStyle = '#ca8a04';
    ctx.fillRect(0, 0, 2048, 2048);

    // Outer green grass borders
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 200, 2048);
    ctx.fillRect(1300, 0, 748, 2048);

    // Main asphalt racetrack surface (860 px wide high-speed straightaway)
    const rLeft = 320;
    const rRight = 1180;
    const rWidth = rRight - rLeft; // 860 px
    ctx.fillStyle = '#1e293b'; // High-grip dark asphalt
    ctx.fillRect(rLeft, 0, rWidth, 2048);

    // Asphalt texture & grain noise
    ctx.fillStyle = '#0f172a';
    for (let i = 0; i < 600; i++) {
      const rx = rLeft + Math.random() * rWidth;
      const ry = Math.random() * 2048;
      ctx.fillRect(rx, ry, 2 + Math.random() * 4, 8 + Math.random() * 20);
    }

    // Racing rubber tire grooves (dark tire rubber lines from high-downforce tires)
    ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
    ctx.fillRect(rLeft + rWidth * 0.28, 0, 60, 2048);
    ctx.fillRect(rLeft + rWidth * 0.65, 0, 60, 2048);

    // Rumble Curbs (Apex Kerbs) - Red and white alternating curb blocks on both boundaries
    const kerbW = 35;
    const kerbBlockH = 45;
    for (let y = 0; y < 2048; y += kerbBlockH) {
      const isRed = Math.floor(y / kerbBlockH) % 2 === 0;
      ctx.fillStyle = isRed ? '#dc2626' : '#f8fafc';
      ctx.fillRect(rLeft - kerbW, y, kerbW, kerbBlockH);
      ctx.fillRect(rRight, y, kerbW, kerbBlockH);
    }

    // White boundary track edge lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(rLeft, 0);
    ctx.lineTo(rLeft, 2048);
    ctx.moveTo(rRight, 0);
    ctx.lineTo(rRight, 2048);
    ctx.stroke();

    // Checkered Start / Finish Line directly in front of the grandstand (Y = 1024)
    const finishY = 1024;
    const checkSize = 25;
    const numChecks = Math.floor(rWidth / checkSize);
    for (let row = 0; row < 2; row++) {
      for (let c = 0; c < numChecks; c++) {
        const isBlack = (row + c) % 2 === 0;
        ctx.fillStyle = isBlack ? '#020617' : '#ffffff';
        ctx.fillRect(rLeft + c * checkSize, finishY - 25 + row * checkSize, checkSize, checkSize);
      }
    }

    // Starting Grid Boxes (Staggered Pole Position Boxes before the start/finish line)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    for (let g = 1; g <= 8; g++) {
      const gy = finishY + g * 110;
      const isLeftPole = g % 2 === 1;
      const gx = isLeftPole ? rLeft + rWidth * 0.2 : rLeft + rWidth * 0.6;
      ctx.strokeRect(gx, gy, 140, 50);

      // Number text
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${g}`, gx + 70, gy + 25);
    }

    // Pit Lane boundary line
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(rRight + 55, 0);
    ctx.lineTo(rRight + 55, 2048);
    ctx.stroke();
  }

  private drawDirtTrack(ctx: CanvasRenderingContext2D) {
    // Outer grass / countryside grounds
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 2048, 2048);

    // Outer gravel safety apron & pit runoff
    ctx.fillStyle = '#78350f';
    ctx.fillRect(200, 0, 1100, 2048);

    // Main Packed Red Clay Dirt Track Oval / Straightaway (860 px wide)
    const dLeft = 320;
    const dRight = 1180;
    const dWidth = dRight - dLeft; // 860 px (~150 ft wide clay track)

    // Base rich red-brown clay soil
    ctx.fillStyle = '#854d0e';
    ctx.fillRect(dLeft, 0, dWidth, 2048);

    // Alternating grader / tiller blade tilled soil bands
    for (let y = 0; y < 2048; y += 40) {
      ctx.fillStyle = y % 80 === 0 ? 'rgba(113, 63, 18, 0.4)' : 'rgba(161, 98, 7, 0.3)';
      ctx.fillRect(dLeft, y, dWidth, 30);
    }

    // High-wear damp clay groove / racing line (dark moist packed dirt where sprint cars bite)
    // Primary low racing line
    ctx.fillStyle = 'rgba(67, 40, 14, 0.7)';
    ctx.fillRect(dLeft + dWidth * 0.22, 0, 140, 2048);
    // Secondary high cushion racing line
    ctx.fillStyle = 'rgba(67, 40, 14, 0.55)';
    ctx.fillRect(dLeft + dWidth * 0.68, 0, 120, 2048);

    // Natural soil dirt clod & pebble texture grain
    ctx.fillStyle = '#451a03';
    for (let i = 0; i < 900; i++) {
      const dx = dLeft + Math.random() * dWidth;
      const dy = Math.random() * 2048;
      ctx.fillRect(dx, dy, 2 + Math.random() * 4, 3 + Math.random() * 8);
    }
    ctx.fillStyle = '#ca8a04';
    for (let i = 0; i < 600; i++) {
      const dx = dLeft + Math.random() * dWidth;
      const dy = Math.random() * 2048;
      ctx.fillRect(dx, dy, 2 + Math.random() * 3, 2 + Math.random() * 4);
    }

    // Outer Safety Catch-Wall / Retaining Wall along track boundary
    const wallX = dRight;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(wallX, 0, 18, 2048); // Concrete safety retaining wall
    // Red hazard stripes on catch wall
    for (let y = 0; y < 2048; y += 60) {
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(wallX, y, 18, 30);
    }

    // Inner Track Marker Tires (staggered white marker tractor tires on inside line)
    for (let y = 30; y < 2048; y += 120) {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(dLeft - 15, y, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(dLeft - 15, y, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Inner boundary chalk line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(dLeft, 0);
    ctx.lineTo(dLeft, 2048);
    ctx.stroke();

    // Checkered Start / Finish Line in front of grandstand (Y = 1024)
    const finishY = 1024;
    const checkSize = 25;
    const numChecks = Math.floor(dWidth / checkSize);
    for (let row = 0; row < 2; row++) {
      for (let c = 0; c < numChecks; c++) {
        const isBlack = (row + c) % 2 === 0;
        ctx.fillStyle = isBlack ? '#020617' : '#ffffff';
        ctx.fillRect(dLeft + c * checkSize, finishY - 25 + row * checkSize, checkSize, checkSize);
      }
    }

    // Flag stand / Starter Stand crosswalk stripes
    ctx.fillStyle = '#eab308';
    ctx.fillRect(dRight + 20, finishY - 15, 30, 30);
  }

  private drawAthleticsTrack(ctx: CanvasRenderingContext2D) {
    // Infield natural turf grass
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, 0, 2048, 2048);

    // Reddish-terracotta polyurethane track straightaway & lanes
    const tLeft = 650;
    const tRight = 1180;
    const tWidth = tRight - tLeft; // 530 px (8 lanes)
    const laneW = tWidth / 8; // ~66 px per lane

    ctx.fillStyle = '#991b1b'; // All-weather red polyurethane track
    ctx.fillRect(tLeft, 0, tWidth, 2048);

    // White lane divider lines (9 lines for 8 lanes)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3.5;
    for (let l = 0; l <= 8; l++) {
      const lx = tLeft + l * laneW;
      ctx.beginPath();
      ctx.moveTo(lx, 0);
      ctx.lineTo(lx, 2048);
      ctx.stroke();
    }

    // Finish Line (bold white bar at Y = 1024)
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(tLeft, 1024);
    ctx.lineTo(tRight, 1024);
    ctx.stroke();

    // Lane numbers painted on track
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let l = 0; l < 8; l++) {
      const lx = tLeft + (l + 0.5) * laneW;
      ctx.fillText(`${l + 1}`, lx, 1070);
    }

    // Infield shot put circle & sector
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(380, 1024, 45, 0, Math.PI * 2);
    ctx.stroke();
  }

  private drawBasketballCourt(ctx: CanvasRenderingContext2D) {
    // Surrounding gym apron
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 2048, 2048);

    // Maple Hardwood Parquet Court
    const bLeft = 300;
    const bRight = 1140;
    const bWidth = bRight - bLeft; // 840 px (~50 ft)
    const bTop = 320;
    const bBottom = 1728;
    const bHeight = bBottom - bTop; // 1408 px (~94 ft)
    const bMidX = (bLeft + bRight) / 2;
    const bMidY = (bTop + bBottom) / 2;

    // Wood planks base
    ctx.fillStyle = '#d97706';
    ctx.fillRect(bLeft, bTop, bWidth, bHeight);

    // Parquet wood slats
    ctx.strokeStyle = 'rgba(180, 83, 9, 0.4)';
    ctx.lineWidth = 1.5;
    for (let y = bTop; y < bBottom; y += 14) {
      ctx.beginPath();
      ctx.moveTo(bLeft, y);
      ctx.lineTo(bRight, y);
      ctx.stroke();
    }

    // White boundary lines
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 6;
    ctx.strokeRect(bLeft, bTop, bWidth, bHeight);

    // Center Court Line & Jump Circle
    ctx.beginPath();
    ctx.moveTo(bLeft, bMidY);
    ctx.lineTo(bRight, bMidY);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(bMidX, bMidY, 90, 0, Math.PI * 2);
    ctx.stroke();

    // Keys / Free Throw Lanes at top and bottom
    const keyW = 200;
    const keyH = 280;
    ctx.fillStyle = '#1d4ed8'; // Blue painted key
    ctx.fillRect(bMidX - keyW / 2, bTop, keyW, keyH);
    ctx.fillRect(bMidX - keyW / 2, bBottom - keyH, keyW, keyH);

    ctx.strokeRect(bMidX - keyW / 2, bTop, keyW, keyH);
    ctx.strokeRect(bMidX - keyW / 2, bBottom - keyH, keyW, keyH);

    // Free throw circles
    ctx.beginPath();
    ctx.arc(bMidX, bTop + keyH, 90, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bMidX, bBottom - keyH, 90, 0, Math.PI * 2);
    ctx.stroke();

    // 3-Point Arcs
    ctx.beginPath();
    ctx.arc(bMidX, bTop + 75, 340, 0.28, Math.PI - 0.28);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(bMidX, bBottom - 75, 340, Math.PI + 0.28, -0.28);
    ctx.stroke();
  }

  private drawCadStudioGrid(ctx: CanvasRenderingContext2D) {
    // Dark Blueprint Background
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, 2048, 2048);

    // Minor Grid Lines (every 32 px)
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 2048; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 2048);
      ctx.moveTo(0, i);
      ctx.lineTo(2048, i);
      ctx.stroke();
    }

    // Major Grid Lines (every 160 px)
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 2048; i += 160) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 2048);
      ctx.moveTo(0, i);
      ctx.lineTo(2048, i);
      ctx.stroke();
    }

    // Origin Axes
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(1024, 0);
    ctx.lineTo(1024, 2048);
    ctx.moveTo(0, 1024);
    ctx.lineTo(2048, 1024);
    ctx.stroke();
  }

>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
=======
    this.needsRender = true;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
  }

  public setCameraPreset(preset: CameraPreset, spectatorRow = 4) {
    if (!this.currentConfig) return;
    const rows = this.currentConfig.rows;
    const lengthFt = this.currentConfig.lengthFt;
    const runFt = this.currentConfig.rowRunInches / 12;
    const riseFt = this.currentConfig.rowRiseInches / 12;
<<<<<<< HEAD
    const totalDepth = rows * runFt + (this.currentConfig.elevation > 0 ? 5 : 2);
=======
    const walkwayWidth = this.currentConfig.walkwayWidthFt ?? 6.0;
    const totalDepth = rows * runFt + (this.currentConfig.elevation > 0 ? walkwayWidth : 2);
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
<<<<<<< HEAD
=======
    this.needsRender = true;
>>>>>>> 10fa525 (Initial commit: GrandStand-3D Bleachers Visualizer & Configurator)
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
