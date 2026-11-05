import React, { useState } from 'react';
import { BookmarkPlus, Check } from 'lucide-react';
import { InterventionConfig, PresetScenario } from '../types/behavioral';
import { PRESET_SCENARIOS, TOOLTIPS } from '../engine/presets';
import { sanitizeLabel } from '../engine/behavioralModel';
import { Tooltip } from './Tooltip';

interface ControlDeckProps {
  activeVariant: 'A' | 'B';
  onVariantChange: (v: 'A' | 'B') => void;
  config: InterventionConfig;
  onChangeConfig: (updated: InterventionConfig) => void;
  customIdeas: PresetScenario[];
  onSelectPreset: (presetId: string) => void;
  onSaveCustomIdea: () => void;
  agentCount: number;
  onChangeAgentCount: (count: number) => void;
}

interface SliderRowProps {
  label: string;
  value: number;
  tooltip: string;
  accentBg: string;
  onChange: (val: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({
  label,
  value,
  tooltip,
  accentBg,
  onChange,
}) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between text-xs">
      <span className="inline-flex items-center gap-1.5 font-medium text-[#1E293B]">
        {label}
        <Tooltip text={tooltip} align="left" />
      </span>
      <span
        className={`font-mono tabular-nums text-[11px] font-semibold px-2 py-0.5 rounded ${accentBg}`}
      >
        {value}
      </span>
    </div>
    <input
      type="range"
      min={0}
      max={100}
      value={value}
      aria-label={label}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full nudge-slider"
    />
  </div>
);

export const ControlDeck: React.FC<ControlDeckProps> = ({
  activeVariant,
  onVariantChange,
  config,
  onChangeConfig,
  customIdeas,
  onSelectPreset,
  onSaveCustomIdea,
  agentCount,
  onChangeAgentCount,
}) => {
  const [justSaved, setJustSaved] = useState(false);

  const updateField = (field: keyof InterventionConfig, val: number | string) => {
    onChangeConfig({
      ...config,
      [field]: val,
    });
  };

  const handleSaveClick = () => {
    onSaveCustomIdea();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1500);
  };

  const allScenarios = [...customIdeas, ...PRESET_SCENARIOS];

  return (
    <aside className="bg-white border border-[#E8E6E1] rounded-xl p-5 space-y-5">
      {/* Variant Switcher */}
      <div className="flex items-center gap-1 p-1 bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg w-full">
        <button
          type="button"
          onClick={() => onVariantChange('A')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeVariant === 'A'
              ? 'bg-[#EFEBF9] text-[#4C3D75]'
              : 'text-[#526071] hover:text-[#1E293B]'
          }`}
        >
          Idea A
        </button>
        <button
          type="button"
          onClick={() => onVariantChange('B')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            activeVariant === 'B'
              ? 'bg-[#E6F1FC] text-[#285385]'
              : 'text-[#526071] hover:text-[#1E293B]'
          }`}
        >
          Idea B
        </button>
      </div>

      {/* Preset Quick-Load & Custom Idea Name */}
      <div className="space-y-3">
        <div>
          <label
            htmlFor="preset-select"
            className="block text-xs font-medium text-[#526071] mb-1"
          >
            Pick an Example or Saved Idea
          </label>
          <select
            id="preset-select"
            onChange={(e) => onSelectPreset(e.target.value)}
            defaultValue={PRESET_SCENARIOS[0].id}
            className="w-full text-xs font-medium bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-[#1E293B] focus:outline-none focus:border-[#4C3D75]"
          >
            {allScenarios.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="intervention-name"
              className="text-xs font-medium text-[#526071]"
            >
              Your Idea Name
            </label>
            <button
              type="button"
              onClick={handleSaveClick}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#4C3D75] hover:underline cursor-pointer"
            >
              {justSaved ? (
                <>
                  <Check className="w-3 h-3 text-[#245E46]" />
                  <span className="text-[#245E46]">Saved!</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="w-3 h-3" />
                  <span>Save to Ideas</span>
                </>
              )}
            </button>
          </div>
          <input
            id="intervention-name"
            type="text"
            maxLength={48}
            value={config.name}
            onChange={(e) => updateField('name', sanitizeLabel(e.target.value, 48))}
            className="w-full text-xs font-medium bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-[#1E293B] focus:outline-none focus:border-[#4C3D75]"
          />
        </div>
      </div>

      <hr className="border-[#E8E6E1]" />

      {/* First Impression */}
      <div className="space-y-3.5">
        <h2 className="text-xs font-semibold text-[#1E293B]">
          1. First Impression
        </h2>

        <SliderRow
          label="How Easy Is It?"
          value={config.easy}
          tooltip={TOOLTIPS.easy}
          accentBg="bg-[#E6F4EE] text-[#245E46]"
          onChange={(v) => updateField('easy', v)}
        />
        <SliderRow
          label="How Eye-Catching?"
          value={config.attractive}
          tooltip={TOOLTIPS.attractive}
          accentBg="bg-[#FDF6E2] text-[#7A5B12]"
          onChange={(v) => updateField('attractive', v)}
        />
        <SliderRow
          label="Do Friends Use It?"
          value={config.social}
          tooltip={TOOLTIPS.social}
          accentBg="bg-[#E6F1FC] text-[#285385]"
          onChange={(v) => updateField('social', v)}
        />
        <SliderRow
          label="Right Moment?"
          value={config.timely}
          tooltip={TOOLTIPS.timely}
          accentBg="bg-[#EFEBF9] text-[#4C3D75]"
          onChange={(v) => updateField('timely', v)}
        />
      </div>

      <hr className="border-[#E8E6E1]" />

      {/* Staying Power */}
      <div className="space-y-3.5">
        <h2 className="text-xs font-semibold text-[#1E293B]">
          2. Staying Power
        </h2>

        <SliderRow
          label="Real Value / Proof"
          value={config.argumentQuality}
          tooltip={TOOLTIPS.argumentQuality}
          accentBg="bg-[#E6F4EE] text-[#245E46]"
          onChange={(v) => updateField('argumentQuality', v)}
        />
        <SliderRow
          label="Quick Hype / Badges"
          value={config.peripheralCues}
          tooltip={TOOLTIPS.peripheralCues}
          accentBg="bg-[#FDF6E2] text-[#7A5B12]"
          onChange={(v) => updateField('peripheralCues', v)}
        />
        <SliderRow
          label="How Much Do They Care?"
          value={config.userInvolvement}
          tooltip={TOOLTIPS.userInvolvement}
          accentBg="bg-[#EFEBF9] text-[#4C3D75]"
          onChange={(v) => updateField('userInvolvement', v)}
        />
        <SliderRow
          label="Annoyance / Effort"
          value={config.frictionCost}
          tooltip={TOOLTIPS.frictionCost}
          accentBg="bg-[#FDEEE8] text-[#8F3D22]"
          onChange={(v) => updateField('frictionCost', v)}
        />
      </div>

      <hr className="border-[#E8E6E1]" />

      {/* Crowd Size */}
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-[#526071]">Test Crowd</span>
        <div className="flex items-center gap-1">
          {[250, 400, 800].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onChangeAgentCount(n)}
              className={`px-2.5 py-1 rounded font-mono tabular-nums text-[11px] font-medium transition-colors cursor-pointer ${
                agentCount === n
                  ? 'bg-[#EFEBF9] text-[#4C3D75]'
                  : 'bg-[#FAF9F6] text-[#526071] hover:text-[#1E293B]'
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
};
