import React, { useState } from 'react';
import { Agent, AgentSegment, AgentState } from '../types/behavioral';
import { TOOLTIPS } from '../engine/presets';
import { Tooltip } from './Tooltip';

interface AgentGridViewProps {
  agents: Agent[];
}

const SEGMENT_LABELS: Record<'All' | AgentSegment, string> = {
  All: 'Everyone',
  Innovator: 'First Tries',
  'Early Adopter': 'Trendsetters',
  Pragmatist: 'Everyday Users',
  Skeptic: 'Hard to Convince',
};

const SEGMENTS: ('All' | AgentSegment)[] = [
  'All',
  'Innovator',
  'Early Adopter',
  'Pragmatist',
  'Skeptic',
];

const STATE_STYLES: Record<AgentState, { bg: string; label: string }> = {
  adopted: { bg: 'bg-[#3B8C6E]', label: 'Joined' },
  contemplating: { bg: 'bg-[#E5A952]', label: 'Thinking' },
  churned: { bg: 'bg-[#D96B43]', label: 'Quit' },
  unaware: { bg: 'bg-[#E2E0DA]', label: 'Not Seen' },
};

export const AgentGridView: React.FC<AgentGridViewProps> = ({ agents }) => {
  const [segmentFilter, setSegmentFilter] = useState<'All' | AgentSegment>('All');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

  const filtered =
    segmentFilter === 'All'
      ? agents
      : agents.filter((a) => a.segment === segmentFilter);

  const counts = {
    adopted: filtered.filter((a) => a.state === 'adopted').length,
    contemplating: filtered.filter((a) => a.state === 'contemplating').length,
    churned: filtered.filter((a) => a.state === 'churned').length,
    unaware: filtered.filter((a) => a.state === 'unaware').length,
  };

  return (
    <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-[#1E293B]">
            Test Crowd (1 Square = 1 Person)
          </h2>
          <Tooltip text={TOOLTIPS.agentGrid} align="left" />
        </div>

        <div className="flex items-center gap-1 p-1 bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg overflow-x-auto">
          {SEGMENTS.map((seg) => (
            <button
              key={seg}
              type="button"
              onClick={() => setSegmentFilter(seg)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                segmentFilter === seg
                  ? 'bg-[#EFEBF9] text-[#4C3D75]'
                  : 'text-[#526071] hover:text-[#1E293B]'
              }`}
            >
              {SEGMENT_LABELS[seg]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-5 text-xs font-mono tabular-nums">
        {(Object.keys(STATE_STYLES) as AgentState[]).map((st) => (
          <span key={st} className="inline-flex items-center gap-1.5 text-[#1E293B]">
            <span className={`w-2.5 h-2.5 rounded-xs ${STATE_STYLES[st].bg}`} />
            <span>
              {STATE_STYLES[st].label}: <strong>{counts[st]}</strong>
            </span>
          </span>
        ))}
      </div>

      <div className="grid grid-cols-16 sm:grid-cols-20 md:grid-cols-25 gap-1.5 pt-1">
        {filtered.slice(0, 500).map((agent) => (
          <button
            key={agent.id}
            type="button"
            onClick={() => setSelectedAgent(agent)}
            title={`Person #${agent.id} · ${SEGMENT_LABELS[agent.segment]} · ${STATE_STYLES[agent.state].label}`}
            aria-label={`Person ${agent.id} ${SEGMENT_LABELS[agent.segment]} ${STATE_STYLES[agent.state].label}`}
            className={`h-3.5 rounded-xs transition-transform hover:scale-125 focus-visible:outline-2 focus-visible:outline-[#4C3D75] cursor-pointer ${
              STATE_STYLES[agent.state].bg
            }`}
          />
        ))}
      </div>

      {selectedAgent && (
        <div className="pt-3 border-t border-[#F0EEE9] flex flex-wrap items-center justify-between gap-4 text-xs font-mono tabular-nums">
          <div className="flex items-center gap-4">
            <span className="font-semibold text-[#1E293B]">
              Person #{selectedAgent.id}
            </span>
            <span className="text-[#526071]">
              {SEGMENT_LABELS[selectedAgent.segment]}
            </span>
            <span className="text-[#245E46]">
              Status: {STATE_STYLES[selectedAgent.state].label}
            </span>
            {selectedAgent.route !== 'none' && (
              <span className="text-[#4C3D75]">
                Reason:{' '}
                {selectedAgent.route === 'central' ? 'Real Value' : 'Quick Hype'}
              </span>
            )}
          </div>
          <div className="text-[#526071]">
            Pickiness: {Math.round(selectedAgent.skepticism)}/100 · Interest:{' '}
            {Math.round(selectedAgent.involvement)}/100
          </div>
        </div>
      )}
    </div>
  );
};
