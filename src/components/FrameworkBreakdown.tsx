import React from 'react';
import { SimulationSummary } from '../types/behavioral';
import { TOOLTIPS } from '../engine/presets';
import { Tooltip } from './Tooltip';

interface FrameworkBreakdownProps {
  summary: SimulationSummary;
  variantLabel: string;
}

interface BarMeterProps {
  label: string;
  value: number;
  tooltip: string;
  barColor: string;
  badgeBg: string;
}

const BarMeter: React.FC<BarMeterProps> = ({
  label,
  value,
  tooltip,
  barColor,
  badgeBg,
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="inline-flex items-center gap-1.5 font-medium text-[#1E293B]">
        {label}
        <Tooltip text={tooltip} align="left" />
      </span>
      <span
        className={`font-mono tabular-nums text-[11px] font-semibold px-2 py-0.5 rounded ${badgeBg}`}
      >
        {value}/100
      </span>
    </div>
    <div className="w-full h-2 rounded-full bg-[#F0EEE9] overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-200 ${barColor}`}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  </div>
);

export const FrameworkBreakdown: React.FC<FrameworkBreakdownProps> = ({
  summary,
  variantLabel,
}) => {
  const { tpb, elm } = summary;
  const centralPct = Math.round(elm.centralWeight * 100);
  const peripheralPct = 100 - centralPct;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {/* Why People Say Yes (TPB) */}
      <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#1E293B]">
            Why People Say Yes ({variantLabel})
          </h3>
          <span className="font-mono tabular-nums text-xs font-semibold px-2.5 py-1 rounded bg-[#EFEBF9] text-[#4C3D75]">
            Desire: {tpb.behavioralIntention}
          </span>
        </div>

        <div className="space-y-3">
          <BarMeter
            label="Do They Like It?"
            value={tpb.attitude}
            tooltip={TOOLTIPS.tpbAttitude}
            barColor="bg-[#D99B52]"
            badgeBg="bg-[#FDF6E2] text-[#7A5B12]"
          />
          <BarMeter
            label="Peer Pressure"
            value={tpb.subjectiveNorm}
            tooltip={TOOLTIPS.tpbNorm}
            barColor="bg-[#5B8EC9]"
            badgeBg="bg-[#E6F1FC] text-[#285385]"
          />
          <BarMeter
            label="Feels Easy to Do"
            value={tpb.perceivedControl}
            tooltip={TOOLTIPS.tpbControl}
            barColor="bg-[#3B8C6E]"
            badgeBg="bg-[#E6F4EE] text-[#245E46]"
          />
        </div>

        <div className="pt-2 border-t border-[#F0EEE9] flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 text-[#526071]">
            Overall Desire to Act
            <Tooltip text={TOOLTIPS.tpbIntention} align="left" />
          </span>
          <span className="font-mono tabular-nums font-semibold text-[#4C3D75]">
            {tpb.behavioralIntention}%
          </span>
        </div>
      </div>

      {/* Deep Loyalty vs. Quick Hype (ELM) */}
      <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 flex flex-col justify-between space-y-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#1E293B]">
              Deep Loyalty vs. Quick Hype
            </h3>
            <span className="font-mono tabular-nums text-xs text-[#526071]">
              Drop-off: {(elm.weeklyDecayRate * 100).toFixed(1)}%/wk
            </span>
          </div>

          <div className="space-y-2">
            <div className="w-full h-4 rounded-lg overflow-hidden flex bg-[#F0EEE9]">
              <div
                className="bg-[#3B8C6E] transition-all duration-200"
                style={{ width: `${centralPct}%` }}
                title={`Convinced by Value: ${centralPct}%`}
              />
              <div
                className="bg-[#E5A952] transition-all duration-200"
                style={{ width: `${peripheralPct}%` }}
                title={`Hooked by Hype: ${peripheralPct}%`}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1.5 font-medium text-[#245E46]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#3B8C6E]" />
                Real Value ({centralPct}%)
                <Tooltip text={TOOLTIPS.elmCentral} align="left" />
              </span>
              <span className="inline-flex items-center gap-1.5 font-medium text-[#7A5B12]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5A952]" />
                Quick Hype ({peripheralPct}%)
                <Tooltip text={TOOLTIPS.elmPeripheral} align="right" />
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-[#F0EEE9]">
          <div className="rounded-lg bg-[#E6F4EE]/60 px-3 py-2.5">
            <div className="text-[11px] text-[#245E46] font-medium">
              Users Who Stay
            </div>
            <div className="text-base font-mono tabular-nums font-bold text-[#1E293B] mt-0.5">
              {summary.retentionRatePct}%
            </div>
          </div>
          <div className="rounded-lg bg-[#FDEEE8]/70 px-3 py-2.5">
            <div className="text-[11px] text-[#8F3D22] font-medium">
              Weekly Drop-Off
            </div>
            <div className="text-base font-mono tabular-nums font-bold text-[#1E293B] mt-0.5">
              {(elm.weeklyDecayRate * 100).toFixed(1)}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
