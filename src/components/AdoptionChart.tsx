import React, { useState } from 'react';
import { WeeklyPoint } from '../types/behavioral';
import { TOOLTIPS } from '../engine/presets';
import { Tooltip } from './Tooltip';

interface AdoptionChartProps {
  weekly: WeeklyPoint[];
  variantAName: string;
  variantBName: string;
}

export const AdoptionChart: React.FC<AdoptionChartProps> = ({
  weekly,
  variantAName,
  variantBName,
}) => {
  const [hoverWeek, setHoverWeek] = useState<number | null>(null);

  const width = 680;
  const height = 270;
  const pad = { top: 20, right: 24, bottom: 34, left: 42 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxWeek = weekly.length || 12;

  const getX = (week: number) =>
    pad.left + ((week - 1) / Math.max(1, maxWeek - 1)) * plotW;
  const getY = (pct: number) =>
    pad.top + plotH - (Math.min(100, Math.max(0, pct)) / 100) * plotH;

  const buildPath = (accessor: (p: WeeklyPoint) => number) =>
    weekly
      .map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(p.week)} ${getY(accessor(p))}`)
      .join(' ');

  const buildArea = (accessor: (p: WeeklyPoint) => number) => {
    if (weekly.length === 0) return '';
    const line = buildPath(accessor);
    const lastX = getX(weekly[weekly.length - 1].week);
    const firstX = getX(weekly[0].week);
    const baseY = pad.top + plotH;
    return `${line} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;
  };

  const activePoint =
    weekly.find((p) => p.week === hoverWeek) ?? weekly[weekly.length - 1];

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#1E293B]">
            How Many People Join Over 12 Weeks
          </h2>
          <Tooltip text={TOOLTIPS.adoptionCurve} align="left" />
        </div>

        <div className="flex items-center gap-5 text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#245E46] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3B8C6E]" />
            <span className="truncate max-w-[140px]">Idea A: {variantAName}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#285385] font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5B8EC9]" />
            <span className="truncate max-w-[140px]">Idea B: {variantBName}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#526071]">
            <span className="w-2.5 h-0.5 bg-[#94A3B8]" />
            <span>Do Nothing</span>
          </span>
        </div>
      </div>

      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="12-week user adoption chart"
        >
          <defs>
            <linearGradient id="pastelMintFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3B8C6E" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#3B8C6E" stopOpacity="0.01" />
            </linearGradient>
          </defs>

          {[0, 25, 50, 75, 100].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={pad.left}
                  y1={y}
                  x2={width - pad.right}
                  y2={y}
                  stroke="#F0EEE9"
                  strokeWidth={1}
                />
                <text
                  x={pad.left - 8}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[#526071] text-[10px] font-mono tabular-nums"
                >
                  {tick}%
                </text>
              </g>
            );
          })}

          {weekly.map((p) => (
            <text
              key={p.week}
              x={getX(p.week)}
              y={height - 10}
              textAnchor="middle"
              className="fill-[#526071] text-[10px] font-mono tabular-nums"
            >
              W{p.week}
            </text>
          ))}

          <path d={buildArea((p) => p.variantAPct)} fill="url(#pastelMintFill)" />

          <path
            d={buildPath((p) => p.baselinePct)}
            fill="none"
            stroke="#94A3B8"
            strokeWidth={1.75}
            strokeDasharray="4 4"
          />

          <path
            d={buildPath((p) => p.variantBPct)}
            fill="none"
            stroke="#5B8EC9"
            strokeWidth={2.25}
          />

          <path
            d={buildPath((p) => p.variantAPct)}
            fill="none"
            stroke="#3B8C6E"
            strokeWidth={2.75}
          />

          {weekly.map((p) => {
            const x = getX(p.week);
            const isHovered = activePoint?.week === p.week;
            return (
              <g key={p.week}>
                {isHovered && (
                  <line
                    x1={x}
                    y1={pad.top}
                    x2={x}
                    y2={pad.top + plotH}
                    stroke="#D6D3CD"
                    strokeWidth={1}
                  />
                )}
                <circle
                  cx={x}
                  cy={getY(p.variantAPct)}
                  r={isHovered ? 4.5 : 2.5}
                  fill="#3B8C6E"
                />
                <circle
                  cx={x}
                  cy={getY(p.variantBPct)}
                  r={isHovered ? 4 : 2}
                  fill="#5B8EC9"
                />
                <rect
                  x={x - plotW / (maxWeek * 2)}
                  y={pad.top}
                  width={plotW / maxWeek}
                  height={plotH}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverWeek(p.week)}
                  onMouseLeave={() => setHoverWeek(null)}
                />
              </g>
            );
          })}
        </svg>

        {activePoint && (
          <div className="mt-3 pt-3 border-t border-[#F0EEE9] flex flex-wrap items-center justify-between gap-4 text-xs font-mono tabular-nums">
            <span className="font-semibold text-[#1E293B]">
              Week {activePoint.week}
            </span>
            <div className="flex items-center gap-5">
              <span className="text-[#245E46]">
                Idea A: <strong>{activePoint.variantAPct}%</strong>
              </span>
              <span className="text-[#285385]">
                Idea B: <strong>{activePoint.variantBPct}%</strong>
              </span>
              <span className="text-[#526071]">
                Do Nothing: <strong>{activePoint.baselinePct}%</strong>
              </span>
              <span className="text-[#8F3D22]">
                Quit: <strong>{activePoint.churnedPct}%</strong>
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
