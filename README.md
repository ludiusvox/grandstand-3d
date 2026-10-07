<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# GrandStand-3D — Bleachers Visualizer & Configurator

An interactive real-time 3D bleacher and grandstand structural visualizer, parametric CAD configurator, and engineering Bill of Materials (BOM) generator. Built with React, Three.js, Vite, and TypeScript.

[![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=fff)](https://vitejs.dev/)
[![React 19](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=three.js&logoColor=white)](https://threejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=fff)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-06B6D4?logo=tailwind-css&logoColor=fff)](https://tailwindcss.com/)

---

## 🚀 Features

### 3D Visualization & Rendering
- **Real-time WebGL rendering** via Three.js with interactive orbit controls
- **Multiple camera presets**: Iso, Front, Side, Top, Spectator, and Understructure views
- **Exploded view mode** for inspecting internal structural components
- **Wireframe overlay** for engineering inspection
- **Dimension overlays** showing key measurements in the viewport
- **Screenshot capture** — export high-res renders as PNG

### Parametric CAD Configuration
- **Core architectural inputs**: Rows (5/10/15/20), Elevation (2–10 ft), Riser height, Floor depth, Length (42–180 ft)
- **Frame types**: Angle frame, I-beam structural, Transportable
- **Deck configurations**: Single-foot, Double-foot, Interlocking deck
- **Riser styles**: Open, Semi-closed, Fully-closed
- **Seat options**: Bench, Bench with back, Stadium chair, VIP cushioned
- **X-brace modes**: Modular-tiered, Full-height, Double-X with profile selection

### Engineering & Compliance
- **Automated code compliance checks** — verifies designs against standard building codes (egress widths, guardrail heights, ADA requirements)
- **Bill of Materials (BOM)** — itemized structural parts list with part IDs, materials, quantities, and drawing references
- **Cost estimation** — seating cost + options cost breakdown
- **Capacity calculations** — standard, ADA, companion seating totals

### Accessibility & Safety Features
- **ADA-compliant seating** configuration with ramp support
- **Guardrail systems**: Vertical pickets, Chain-link mesh, Multi-rail
- **Side barricades**, access stairs (left/right/both), aisle configurations with handrails
- **Contrast aisle steps** for visual differentiation

### Add-ons & Customization
- **Press box** (20×8 ft or 40×8 ft) with roof deck option
- **Shade canopy**: Cantilever, Arch-barrel, Tension-sail
- **Wind skirting** with custom banner text
- **Sponsorship signage** support
- **Field environment presets**: Soccer, Football, Racetrack, Dirt track, Track, Basketball, Baseball, Architectural studio
- **Light poles** toggle

### UI & Layout
- **Responsive design** — full desktop layout and mobile-adaptive layouts (scrollable page, split-screen, fullscreen modes)
- **Preset quick-load** system for common configurations
- **Multi-tab config sidebar** with color pickers for all structural elements
- **Pipeline Inspector** — real-time vertex/triangle/draw-call stats per component

---

## ⚠️ Known Issues & Limitations

### Performance
| Issue | Impact | Status |
|-------|--------|--------|
| Large configurations (20 rows × 180 ft) cause frame drops on mid-range GPUs | Viewport jank during config changes | Open |
| WebGL memory grows unbounded when toggling add-ons repeatedly | Browser tab crashes after extended sessions | Open |
| Exploded view with all components enabled exceeds draw-call budget | Stuttering in exploded mode | Open |

### Rendering & Visual Fidelity
| Issue | Impact | Status |
|-------|--------|--------|
| Shadow maps are static — don't update when config changes | Shadows appear stale after parameter edits | Open |
| No PBR materials or environment mapping | Renders look flat / unlit in some views | Low priority |
| Textured ground plane doesn't match all field environments | Mismatch between bleacher and pitch/track visuals | Open |

### Mobile UX
| Issue | Impact | Status |
|-------|--------|--------|
| Split-screen panel height calculation is inconsistent across devices | Config sidebar gets cut off on some phones | Open |
| Touch orbit controls conflict with slider inputs | Accidental camera rotation while adjusting parameters | Open |
| Fullscreen 3D mode doesn't respect safe areas on notched devices | UI elements overlap status bar / home indicator | Open |

### Engineering & Data
| Issue | Impact | Status |
|-------|--------|--------|
| BOM export is modal-only — no CSV/PDF download | Users can't easily share or import parts lists | Feature request |
| Cost estimation uses flat rates ($100/$150 per seat) — not region-adjusted | Estimates may be inaccurate for real-world procurement | Low priority |
| No structural load calculations (wind, seismic, live loads) | Cannot be used as a substitute for professional engineering sign-off | By design |

### State Management
| Issue | Impact | Status |
|-------|--------|--------|
| Preset switching doesn't reset all derived state (e.g., camera position, inspector filters) | Stale UI state after preset change | Open |
| No undo/redo history for config changes | Accidental edits are irreversible | Feature request |

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **3D Engine**: Three.js (r186)
- **Build Tool**: Vite 8
- **Styling**: Tailwind CSS 4 (via `@tailwindcss/vite`)
- **Animation**: Framer Motion (`motion` package)
- **Icons**: Lucide React
- **Server**: Express (for production build)

---

## 📦 Run Locally

**Prerequisites:** Node.js 18+

```bash
# Install dependencies
npm install

# Set your Gemini API key in .env.local
cp .env.example .env.local
# Edit .env.local and add GEMINI_API_KEY

# Start the dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── ConfigSidebar.tsx    # Parametric CAD controls (69KB)
│   ├── HUDOverlay.tsx       # In-viewport stats & overlays
│   ├── Header.tsx           # Top bar with presets, screenshot, specs
│   ├── PipelineInspector.tsx# Real-time rendering pipeline stats
│   ├── SpecModal.tsx        # Engineering BOM & compliance modal
│   └── Viewport.tsx         # Three.js WebGL canvas wrapper
├── engine/
│   └── Bleacher3DGenerator.ts  # Core geometry generation (106KB)
├── types/
│   └── bleacher.ts          # TypeScript interfaces & config schema
├── utils/
│   └── bleacherCalculations.ts  # Specs, BOM, cost calculations
├── App.tsx                  # Root component with layout logic
└── main.tsx                 # Entry point
```

---

## 📄 License

Apache-2.0
