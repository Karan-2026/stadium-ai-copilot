import React, { useEffect, useRef, useState } from "react";
import { StadiumSector } from "../types";

interface StadiumMapProps {
  sectors: StadiumSector[];
  selectedSectorId: string;
  onSelectSector: (sectorId: string) => void;
  accessibilityHighContrast: boolean;
}

export const StadiumLayoutMap: React.FC<StadiumMapProps> = ({
  sectors,
  selectedSectorId,
  onSelectSector,
  accessibilityHighContrast,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Use ResizeObserver to safely monitor container sizes for premium responsive accuracy
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setDimensions({ width: Math.round(width), height: Math.round(height) });
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const getHeatmapColor = (status: string, isSelected: boolean) => {
    if (accessibilityHighContrast) {
      if (isSelected) return "fill-amber-400 stroke-black stroke-4";
      switch (status) {
        case "critical": return "fill-slate-900 stroke-red-600 stroke-3 stroke-dashed";
        case "crowded": return "fill-slate-800 stroke-yellow-500 stroke-2";
        default: return "fill-slate-700 stroke-green-500 stroke-1";
      }
    }

    if (isSelected) {
      switch (status) {
        case "critical": return "fill-red-500/30 stroke-red-600 stroke-[5px]";
        case "crowded": return "fill-amber-500/30 stroke-amber-500 stroke-[5px]";
        default: return "fill-emerald-500/30 stroke-emerald-500 stroke-[5px]";
      }
    }

    switch (status) {
      case "critical": return "fill-red-500/10 hover:fill-red-500/20 stroke-red-500/70 stroke-2";
      case "crowded": return "fill-amber-500/10 hover:fill-amber-500/20 stroke-amber-500/70 stroke-2";
      default: return "fill-emerald-500/10 hover:fill-emerald-500/20 stroke-emerald-500/70 stroke-2";
    }
  };

  const getLabelColor = (status: string) => {
    if (accessibilityHighContrast) return "fill-white font-bold text-lg";
    switch (status) {
      case "critical": return "fill-red-800 dark:fill-red-200 font-semibold";
      case "crowded": return "fill-amber-800 dark:fill-amber-200 font-semibold";
      default: return "fill-emerald-800 dark:fill-emerald-200 font-semibold";
    }
  };

  return (
    <div id="stadium-map-card" className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-sm flex flex-col h-full">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 id="stadium-map-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-2">
            🏟️ Stadium Real-Time Heatmap
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Interactive sector monitoring. Click any sector to inspect gates and queue metrics.
          </p>
        </div>
        <div className="text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-500">
          Render: {dimensions.width}px × {dimensions.height}px
        </div>
      </div>

      <div ref={containerRef} className="flex-1 min-h-[250px] md:min-h-[300px] flex items-center justify-center relative">
        <svg
          viewBox="0 0 400 400"
          className="w-full max-w-[340px] md:max-w-[360px] h-auto drop-shadow-sm select-none"
          aria-labelledby="stadium-map-title"
          role="img"
        >
          {/* Inner Stadium Pitch / Field */}
          <rect
            x="140"
            y="140"
            width="120"
            height="120"
            rx="60"
            className="fill-zinc-100 dark:fill-zinc-800 stroke-zinc-200 dark:stroke-zinc-700 stroke-2"
          />
          <rect
            x="155"
            y="155"
            width="90"
            height="90"
            rx="45"
            className="fill-emerald-600/10 dark:fill-emerald-500/5 stroke-emerald-600/30 stroke-1"
          />
          <text
            x="200"
            y="205"
            textAnchor="middle"
            className="text-[10px] font-bold fill-zinc-400 dark:fill-zinc-500 tracking-wider"
          >
            PITCH
          </text>

          {/* SECTOR A: North Gate (Top Arc) */}
          <path
            d="M 120 120 A 113 113 0 0 1 280 120 L 250 150 A 70 70 0 0 0 150 150 Z"
            onClick={() => onSelectSector("sec-a")}
            className={`${getHeatmapColor(sectors[0].status, selectedSectorId === "sec-a")} transition-all duration-300 cursor-pointer focus:outline-none`}
            tabIndex={0}
            aria-label="Sector A: North Gate. Click to inspect."
            onKeyDown={(e) => e.key === "Enter" && onSelectSector("sec-a")}
          />
          <text
            x="200"
            y="95"
            textAnchor="middle"
            className={`text-xs pointer-events-none ${getLabelColor(sectors[0].status)}`}
          >
            SECTOR A (N)
          </text>

          {/* SECTOR B: East Gate (Right Arc) */}
          <path
            d="M 280 120 A 113 113 0 0 1 280 280 L 250 250 A 70 70 0 0 0 250 150 Z"
            onClick={() => onSelectSector("sec-b")}
            className={`${getHeatmapColor(sectors[1].status, selectedSectorId === "sec-b")} transition-all duration-300 cursor-pointer focus:outline-none`}
            tabIndex={0}
            aria-label="Sector B: East Gate. Click to inspect."
            onKeyDown={(e) => e.key === "Enter" && onSelectSector("sec-b")}
          />
          <text
            x="305"
            y="205"
            textAnchor="middle"
            className={`text-xs pointer-events-none ${getLabelColor(sectors[1].status)}`}
          >
            SECTOR B (E)
          </text>

          {/* SECTOR C: South Gate (Bottom Arc) */}
          <path
            d="M 280 280 A 113 113 0 0 1 120 280 L 150 250 A 70 70 0 0 0 250 250 Z"
            onClick={() => onSelectSector("sec-c")}
            className={`${getHeatmapColor(sectors[2].status, selectedSectorId === "sec-c")} transition-all duration-300 cursor-pointer focus:outline-none`}
            tabIndex={0}
            aria-label="Sector C: South Supporters Zone. Congested. Click to inspect."
            onKeyDown={(e) => e.key === "Enter" && onSelectSector("sec-c")}
          />
          <text
            x="200"
            y="315"
            textAnchor="middle"
            className={`text-xs pointer-events-none ${getLabelColor(sectors[2].status)}`}
          >
            SECTOR C (S) 🔥
          </text>

          {/* SECTOR D: West Gate (Left Arc) */}
          <path
            d="M 120 280 A 113 113 0 0 1 120 120 L 150 150 A 70 70 0 0 0 150 250 Z"
            onClick={() => onSelectSector("sec-d")}
            className={`${getHeatmapColor(sectors[3].status, selectedSectorId === "sec-d")} transition-all duration-300 cursor-pointer focus:outline-none`}
            tabIndex={0}
            aria-label="Sector D: West Gate VIP and Media. Click to inspect."
            onKeyDown={(e) => e.key === "Enter" && onSelectSector("sec-d")}
          />
          <text
            x="95"
            y="205"
            textAnchor="middle"
            className={`text-xs pointer-events-none ${getLabelColor(sectors[3].status)}`}
          >
            SECTOR D (W)
          </text>

          {/* Render icons or mini shapes inside the SVG map representing Gate status */}
          {/* North Gates */}
          <circle cx="200" cy="45" r="5" className="fill-blue-500" />
          {/* East Gates */}
          <circle cx="355" cy="200" r="5" className="fill-blue-500" />
          {/* South Gates */}
          <circle cx="200" cy="355" r="5" className="fill-blue-500" />
          {/* West Gates */}
          <circle cx="45" cy="200" r="5" className="fill-blue-500" />
        </svg>

        {/* Floating Legends */}
        <div className="absolute bottom-1 left-2 flex flex-col gap-1 text-[10px] text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/80 p-2 rounded-lg border border-zinc-100 dark:border-zinc-700/50">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block" /> Normal (&lt;50%)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 block" /> Crowded (50-80%)
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 block" /> Critical (&gt;80%)
          </div>
        </div>
      </div>
    </div>
  );
};
