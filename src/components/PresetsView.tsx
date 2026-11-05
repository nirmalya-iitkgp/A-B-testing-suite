import React from 'react';
import { Trash2 } from 'lucide-react';
import { PRESET_SCENARIOS } from '../engine/presets';
import { PresetScenario } from '../types/behavioral';

interface PresetsViewProps {
  customIdeas: PresetScenario[];
  onLoadPreset: (presetId: string) => void;
  onDeleteCustomIdea: (presetId: string) => void;
}

export const PresetsView: React.FC<PresetsViewProps> = ({
  customIdeas,
  onLoadPreset,
  onDeleteCustomIdea,
}) => {
  const allIdeas = [...customIdeas, ...PRESET_SCENARIOS];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {allIdeas.map((preset) => {
        const isCustom = preset.id.startsWith('custom-');
        return (
          <div
            key={preset.id}
            className="bg-white border border-[#E8E6E1] rounded-xl p-5 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-medium text-[#526071]">
                <span>{preset.category}</span>
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => onDeleteCustomIdea(preset.id)}
                    aria-label={`Delete ${preset.name}`}
                    className="text-[#8F3D22] hover:opacity-75 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <h3 className="text-base font-semibold text-[#1E293B]">
                {preset.name}
              </h3>
              <p className="text-xs text-[#526071] leading-relaxed">
                {preset.tagline}
              </p>
            </div>

            <div className="pt-3 border-t border-[#F0EEE9] flex items-center justify-between gap-3">
              <div className="text-[11px] font-mono tabular-nums text-[#526071]">
                Easy {preset.variantA.easy} · Friends {preset.variantA.social} · Value{' '}
                {preset.variantA.argumentQuality}
              </div>
              <button
                type="button"
                onClick={() => onLoadPreset(preset.id)}
                className="px-3 py-1.5 rounded-lg bg-[#EFEBF9] text-[#4C3D75] hover:bg-[#E4DDF6] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                Try This Idea
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
