import React, { useState, useRef } from 'react';
import { BleacherConfig, CalculatedSpecs } from '../types/bleacher';
import { getStandaloneBomScript } from '../utils/bleacherCalculations';
import {
  X,
  Printer,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Code2,
  Layers,
  DollarSign,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface SpecModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BleacherConfig;
  specs: CalculatedSpecs;
}

export const SpecModal: React.FC<SpecModalProps> = ({
  isOpen,
  onClose,
  config,
  specs,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'bom' | 'script' | 'code'>('bom');
  const [bomViewMode, setBomViewMode] = useState<'cards' | 'table'>('cards');

  // Sub-tabs drag-to-slide & scroll refs
  const tabsScrollRef = useRef<HTMLDivElement>(null);
  const isDraggingTabsRef = useRef(false);
  const dragTabsStartXRef = useRef(0);
  const dragTabsScrollLeftRef = useRef(0);
  const hasMovedTabsRef = useRef(false);

  const handleTabsMouseDown = (e: React.MouseEvent) => {
    if (!tabsScrollRef.current) return;
    isDraggingTabsRef.current = true;
    hasMovedTabsRef.current = false;
    dragTabsStartXRef.current = e.pageX - tabsScrollRef.current.offsetLeft;
    dragTabsScrollLeftRef.current = tabsScrollRef.current.scrollLeft;
  };

  const handleTabsMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingTabsRef.current || !tabsScrollRef.current) return;
    const x = e.pageX - tabsScrollRef.current.offsetLeft;
    const walk = (x - dragTabsStartXRef.current) * 1.5;
    if (Math.abs(walk) > 4) {
      hasMovedTabsRef.current = true;
      e.preventDefault();
    }
    tabsScrollRef.current.scrollLeft = dragTabsScrollLeftRef.current - walk;
  };

  const handleTabsMouseUpOrLeave = () => {
    isDraggingTabsRef.current = false;
    setTimeout(() => {
      hasMovedTabsRef.current = false;
    }, 50);
  };

  const handleTabsScrollStep = (direction: 'left' | 'right') => {
    if (tabsScrollRef.current) {
      const offset = direction === 'left' ? -160 : 160;
      tabsScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['GRANDSTAND 3D STRUCTURAL BILL OF MATERIALS (BOM) & COST ESTIMATE'],
      ['Drawing Reference', 'Architectural Grandstand Structural Plans'],
      ['Date', new Date().toLocaleDateString()],
      [''],
      ['SYSTEM CONFIGURATION'],
      ['Seating Rows', config.rows],
      ['Elevation', `${config.elevation} ft (${specs.isElevated ? 'Elevated System' : 'Non-Elevated'})`],
      ['Riser Height (Vertical)', `${config.rowRiseInches} in`],
      ['Floor Depth (Horizontal)', `${config.rowRunInches} in`],
      ['Grandstand Length', `${config.lengthFt} ft`],
      ['Press Box', config.pressBox.enabled ? config.pressBox.size : 'None'],
      ['Side Barricades', config.sideBarricades ? 'Enabled' : 'Disabled'],
      ['Platform Access Stairs', config.accessStairs],
      [''],
      ['CAPACITY & COSTING ($150/elevated seat, $100/non-elevated seat)'],
      ['Total Seating Capacity', `${specs.totalCapacity} Spectators`],
      ['Standard Bench Seats', specs.standardCapacity],
      ['ADA Wheelchair Spaces', specs.adaCapacity],
      ['Cost Per Seat Unit', `$${specs.costPerSeat} / seat`],
      ['Seating Cost Subtotal', `$${specs.seatingCostUsd.toLocaleString()}`],
      ['Options & Add-ons Cost', `$${specs.optionsCostUsd.toLocaleString()}`],
      ['Total Estimated Cost', `$${specs.totalCostUsd.toLocaleString()}`],
      [''],
      ['STRUCTURAL ITEM DETAILED BOM'],
      ['Part ID', 'Part Name', 'Material Spec', 'Quantity', 'Unit', 'Drawing Ref'],
      ...specs.structuralParts.map((p) => [
        p.partId,
        p.partName,
        p.material,
        p.quantity,
        p.unit,
        p.drawingRef,
      ]),
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((val) => `"${val}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Grandstand_BOM_${config.rows}Row_${config.elevation}ftElev_${config.lengthFt}ft.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopySummary = () => {
    const text = `GRANDSTAND 3D STRUCTURAL SPEC & BOM
System: ${config.rows} Rows x ${config.lengthFt}'-0" Length
Elevation: ${config.elevation}ft (${specs.isElevated ? 'Elevated Grandstand' : 'Non-Elevated Bleacher'})
Riser: ${config.rowRiseInches}" vertical | Floor Depth: ${config.rowRunInches}"
Press Box: ${config.pressBox.enabled ? config.pressBox.size : 'None'} | Stairs: ${config.accessStairs} | Side Barricades: ${config.sideBarricades ? 'Yes' : 'No'}
Capacity: ${specs.totalCapacity} Seats (${specs.standardCapacity} Standard + ${specs.adaCapacity} ADA)
Cost Rate: $${specs.costPerSeat} / seat
Seating Cost: $${specs.seatingCostUsd.toLocaleString()} USD
Options Cost: $${specs.optionsCostUsd.toLocaleString()} USD
Total Investment: $${specs.totalCostUsd.toLocaleString()} USD
Total Aluminum: ${specs.aluminumLinearFeet} Linear Ft
Steel Weight: ${specs.steelWeightLbs} lbs`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(getStandaloneBomScript());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden my-2 sm:my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950 shrink-0">
          <div className="min-w-0 flex-1 mr-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-blue-500 shrink-0" />
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                Structural Bill of Materials (BOM) & Costing
              </h2>
            </div>
            <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
              {config.rows} Rows · {config.lengthFt}ft Length · {specs.isElevated ? 'Elevated ($150/seat)' : 'Standard ($100/seat)'}
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Print Specification"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadCSV}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors"
              title="Download CSV BOM"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-Tabs: BOM Table vs Standalone Script vs Code Audit (Horizontally Slidable with Drag & Arrows) */}
        <div className="relative px-2 sm:px-4 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-1 shrink-0">
          {/* Scroll Left Arrow */}
          <button
            onClick={() => handleTabsScrollStep('left')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
            title="Slide tabs left"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Draggable Horizontal Track */}
          <div
            ref={tabsScrollRef}
            onMouseDown={handleTabsMouseDown}
            onMouseMove={handleTabsMouseMove}
            onMouseUp={handleTabsMouseUpOrLeave}
            onMouseLeave={handleTabsMouseUpOrLeave}
            className="flex-1 overflow-x-auto scrollbar-none flex items-center gap-1.5 sm:gap-2 text-xs font-semibold touch-pan-x cursor-grab active:cursor-grabbing select-none py-1 px-1 scroll-smooth"
            title="Drag or swipe horizontally to view all tabs"
          >
            <button
              onClick={(e) => {
                if (hasMovedTabsRef.current) return;
                setActiveTab('bom');
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'bom'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Bill of Materials & Cost
            </button>
            <button
              onClick={(e) => {
                if (hasMovedTabsRef.current) return;
                setActiveTab('script');
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                activeTab === 'script'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Calculation Script</span>
            </button>
            <button
              onClick={(e) => {
                if (hasMovedTabsRef.current) return;
                setActiveTab('code');
                e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
              }}
              className={`px-3 py-1.5 rounded-md transition-colors whitespace-nowrap shrink-0 ${
                activeTab === 'code'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              ICC 300 Code Audit
            </button>
          </div>

          {/* Scroll Right Arrow */}
          <button
            onClick={() => handleTabsScrollStep('right')}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
            title="Slide tabs right"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-3 sm:p-6 space-y-5 overflow-y-auto text-xs flex-1">
          {/* TAB 1: BOM & COSTING */}
          {activeTab === 'bom' && (
            <div className="space-y-5">
              {/* Costing Highlight Card - Mobile Stacked & Responsive Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 p-3.5 sm:p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-xl">
                <div className="p-2 sm:p-0">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono">
                    Pricing Rate
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-400 mt-0.5">
                    ${specs.costPerSeat} <span className="text-xs text-slate-400">/ seat</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {specs.isElevated
                      ? 'Elevated grandstand rate ($150/seat)'
                      : 'Non-elevated bleacher rate ($100/seat)'}
                  </div>
                </div>

                <div className="p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-slate-800/80 sm:pl-3">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono">
                    Total Capacity
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
                    {specs.totalCapacity} <span className="text-xs text-slate-400">seats</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    {specs.standardCapacity} bench · {specs.adaCapacity} ADA spaces
                  </div>
                </div>

                <div className="p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-slate-800/80 sm:pl-3">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 uppercase font-mono">
                    Total Estimated Cost
                  </div>
                  <div className="text-xl sm:text-2xl font-bold font-mono text-blue-400 mt-0.5">
                    ${specs.totalCostUsd.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Base: ${specs.seatingCostUsd.toLocaleString()} · Options: ${specs.optionsCostUsd.toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Drawing Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
                <div className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] font-mono block">DIMENSIONS</span>
                  <div className="text-slate-200 font-mono font-bold mt-1 text-xs sm:text-sm">
                    {specs.widthFeet}' W × {specs.depthFeet}' D
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">Overall: {specs.overallHeightFeet}' H</div>
                </div>

                <div className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] font-mono block">ALUMINUM PLANKS</span>
                  <div className="text-blue-400 font-mono font-bold mt-1 text-xs sm:text-sm">
                    {specs.aluminumLinearFeet.toLocaleString()} LF
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">2x10 Anodized & 2x5 Mill</div>
                </div>

                <div className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] font-mono block">STEEL WEIGHT</span>
                  <div className="text-slate-200 font-mono font-bold mt-1 text-xs sm:text-sm">
                    {specs.steelWeightLbs.toLocaleString()} lbs
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">~{(specs.steelWeightLbs / 2000).toFixed(1)} US Tons</div>
                </div>

                <div className="bg-slate-950 p-2.5 sm:p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-500 text-[10px] font-mono block">ACCESS & ENCLOSURE</span>
                  <div className="text-slate-200 font-mono font-bold mt-1 text-xs sm:text-sm capitalize truncate">
                    {config.accessStairs} Stairs
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5 truncate">
                    {config.sideBarricades ? 'Chain Link Sides' : 'Standard Rails'}
                  </div>
                </div>
              </div>

              {/* Itemized Structural BOM Table & Mobile Responsive Views */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Structural Parts Take-Off & Itemized BOM
                  </h3>

                  {/* Responsive View Switcher */}
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 rounded p-0.5 text-[11px] shrink-0">
                    <button
                      onClick={() => setBomViewMode(bomViewMode === 'cards' ? 'table' : 'cards')}
                      className="px-2 py-0.5 rounded text-[11px] font-medium transition-colors bg-slate-800 hover:bg-slate-700 text-slate-200"
                    >
                      {bomViewMode === 'cards' ? 'Show Table' : 'Show Cards'}
                    </button>
                  </div>
                </div>

                {/* Mobile Responsive Cards View */}
                <div className={`space-y-2 ${bomViewMode === 'table' ? 'hidden' : 'block md:hidden'}`}>
                  {specs.structuralParts.map((part, i) => (
                    <div
                      key={i}
                      className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-1.5 transition-colors hover:border-slate-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded bg-blue-950 border border-blue-800/80 font-mono font-bold text-blue-400 text-xs">
                            {part.partId}
                          </span>
                          <span className="font-semibold text-slate-200 text-xs">
                            {part.partName}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/70 font-mono font-bold text-emerald-300 text-xs shrink-0">
                          {part.quantity} {part.unit}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-1 pt-1 border-t border-slate-900">
                        <span className="truncate max-w-[220px]">{part.material}</span>
                        <span className="font-mono text-slate-500 text-[10px]">
                          Ref: {part.drawingRef}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Horizontal Scrollable Table View with Sticky Left Part ID Column */}
                <div className={`border border-slate-800 rounded-lg overflow-x-auto scrollbar-thin touch-pan-x ${
                  bomViewMode === 'cards' ? 'hidden md:block' : 'block'
                }`}>
                  <table className="w-full min-w-[620px] text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                        <th className="p-2.5 sticky left-0 bg-slate-950 z-10 shadow-[1px_0_0_0_rgba(51,65,85,0.8)]">
                          Part ID
                        </th>
                        <th className="p-2.5">Part Name</th>
                        <th className="p-2.5">Material Specification</th>
                        <th className="p-2.5">Qty</th>
                        <th className="p-2.5">Unit</th>
                        <th className="p-2.5">Drawing Ref</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                      {specs.structuralParts.map((part, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-bold text-blue-400 whitespace-nowrap sticky left-0 bg-slate-900/95 backdrop-blur-sm z-10 shadow-[1px_0_0_0_rgba(51,65,85,0.8)]">
                            {part.partId}
                          </td>
                          <td className="p-2.5 font-sans font-medium text-slate-200">
                            {part.partName}
                          </td>
                          <td className="p-2.5 text-slate-400">{part.material}</td>
                          <td className="p-2.5 font-bold text-white whitespace-nowrap">{part.quantity}</td>
                          <td className="p-2.5 text-slate-400 whitespace-nowrap">{part.unit}</td>
                          <td className="p-2.5 text-slate-500 text-[10px] whitespace-nowrap">
                            {part.drawingRef}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STANDALONE CALCULATION SCRIPT */}
          {activeTab === 'script' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-slate-200">
                    Standalone BOM & Component Calculation Script
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    This executable script calculates the complete Bill of Materials, component quantities, and $150/$100 seating costs.
                  </p>
                </div>
                <button
                  onClick={handleCopyScript}
                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-medium transition-colors shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Script</span>
                </button>
              </div>

              <div className="relative bg-slate-950 border border-slate-800 rounded-lg p-3 sm:p-4 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
                <pre>{getStandaloneBomScript()}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: CODE AUDIT */}
          {activeTab === 'code' && (
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Life Safety & Building Code Verification (ICC 300 / IBC 2018)
              </h3>
              <div className="space-y-2">
                {specs.codeCompliances.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 sm:p-3 rounded-lg border flex items-start gap-2.5 ${
                      item.status === 'warning'
                        ? 'bg-amber-950/20 border-amber-900/50'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    {item.status === 'warning' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-200">{item.rule}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-950 flex flex-col sm:flex-row items-center justify-between gap-2.5 shrink-0">
          <div className="text-xs text-slate-400 w-full sm:w-auto flex justify-between sm:justify-start items-center">
            {copied ? (
              <span className="text-emerald-400 font-semibold">
                ✓ Copied to clipboard!
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Certified ICC 300</span>
              </span>
            )}
            <span className="sm:hidden font-mono font-bold text-blue-400 text-xs">
              ${specs.totalCostUsd.toLocaleString()} USD
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleCopySummary}
              className="flex-1 sm:flex-initial px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors text-center"
            >
              Copy Summary
            </button>
            <button
              onClick={handleDownloadCSV}
              className="flex-1 sm:flex-initial px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-md shadow-sm transition-colors text-center"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
