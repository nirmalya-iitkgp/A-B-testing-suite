import React from 'react';
import { InterventionConfig, SimulationSummary } from '../types/behavioral';

interface ABCompareViewProps {
  variantA: InterventionConfig;
  variantB: InterventionConfig;
  summaryA: SimulationSummary;
  summaryB: SimulationSummary;
}

export const ABCompareView: React.FC<ABCompareViewProps> = ({
  variantA,
  variantB,
  summaryA,
  summaryB,
}) => {
  const rows: {
    metric: string;
    valA: string;
    valB: string;
    winner: 'A' | 'B' | 'tie';
  }[] = [
    {
      metric: 'Users Who Join (Week 12)',
      valA: `${summaryA.finalAdoptionPct}%`,
      valB: `${summaryB.finalAdoptionPct}%`,
      winner:
        summaryA.finalAdoptionPct > summaryB.finalAdoptionPct
          ? 'A'
          : summaryB.finalAdoptionPct > summaryA.finalAdoptionPct
            ? 'B'
            : 'tie',
    },
    {
      metric: 'Extra Growth vs. Doing Nothing',
      valA: `${summaryA.netLiftPct >= 0 ? '+' : ''}${summaryA.netLiftPct}%`,
      valB: `${summaryB.netLiftPct >= 0 ? '+' : ''}${summaryB.netLiftPct}%`,
      winner:
        summaryA.netLiftPct > summaryB.netLiftPct
          ? 'A'
          : summaryB.netLiftPct > summaryA.netLiftPct
            ? 'B'
            : 'tie',
    },
    {
      metric: 'Users Who Stay (12-Wk Retention)',
      valA: `${summaryA.retentionRatePct}%`,
      valB: `${summaryB.retentionRatePct}%`,
      winner:
        summaryA.retentionRatePct > summaryB.retentionRatePct
          ? 'A'
          : summaryB.retentionRatePct > summaryA.retentionRatePct
            ? 'B'
            : 'tie',
    },
    {
      metric: 'Desire to Try',
      valA: `${summaryA.tpb.behavioralIntention}/100`,
      valB: `${summaryB.tpb.behavioralIntention}/100`,
      winner:
        summaryA.tpb.behavioralIntention > summaryB.tpb.behavioralIntention
          ? 'A'
          : summaryB.tpb.behavioralIntention > summaryA.tpb.behavioralIntention
            ? 'B'
            : 'tie',
    },
    {
      metric: 'Long-Term Loyalty (Real Value)',
      valA: `${summaryA.centralSharePct}%`,
      valB: `${summaryB.centralSharePct}%`,
      winner:
        summaryA.centralSharePct > summaryB.centralSharePct
          ? 'A'
          : summaryB.centralSharePct > summaryA.centralSharePct
            ? 'B'
            : 'tie',
    },
    {
      metric: 'Weekly Drop-Off Rate',
      valA: `${(summaryA.elm.weeklyDecayRate * 100).toFixed(1)}%`,
      valB: `${(summaryB.elm.weeklyDecayRate * 100).toFixed(1)}%`,
      winner:
        summaryA.elm.weeklyDecayRate < summaryB.elm.weeklyDecayRate
          ? 'A'
          : summaryB.elm.weeklyDecayRate < summaryA.elm.weeklyDecayRate
            ? 'B'
            : 'tie',
    },
  ];

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-5">
      <h2 className="text-sm font-semibold text-[#1E293B] mb-4">
        Which Idea Wins? (Idea A vs. Idea B)
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E8E6E1] text-xs text-[#526071]">
              <th className="py-2.5 font-medium">Result</th>
              <th className="py-2.5 font-semibold text-[#4C3D75] text-right">
                Idea A · {variantA.name}
              </th>
              <th className="py-2.5 font-semibold text-[#285385] text-right">
                Idea B · {variantB.name}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F0EEE9] text-xs">
            {rows.map((r) => (
              <tr key={r.metric} className="hover:bg-[#FAF9F6]">
                <td className="py-3 font-medium text-[#1E293B]">{r.metric}</td>
                <td className="py-3 text-right font-mono tabular-nums">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      r.winner === 'A'
                        ? 'bg-[#E6F4EE] text-[#245E46] font-semibold'
                        : 'text-[#1E293B]'
                    }`}
                  >
                    {r.valA}
                  </span>
                </td>
                <td className="py-3 text-right font-mono tabular-nums">
                  <span
                    className={`px-2 py-0.5 rounded ${
                      r.winner === 'B'
                        ? 'bg-[#E6F1FC] text-[#285385] font-semibold'
                        : 'text-[#1E293B]'
                    }`}
                  >
                    {r.valB}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
