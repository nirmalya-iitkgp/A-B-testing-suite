import React, { useMemo, useState } from 'react';
import { AlertTriangle, ArrowRight, Plus, Trash2, Zap } from 'lucide-react';
import { OnboardingStep } from '../types/behavioral';
import {
  auditOnboardingStream,
  DEFAULT_ONBOARDING_STEPS,
  sanitizeOnboardingStep,
} from '../engine/frictionAudit';
import { sanitizeLabel } from '../engine/behavioralModel';
import { TOOLTIPS } from '../engine/presets';
import { Tooltip } from './Tooltip';

interface FrictionAuditViewProps {
  onApplyFrictionToSimulator: (frictionScore: number) => void;
}

export const FrictionAuditView: React.FC<FrictionAuditViewProps> = ({
  onApplyFrictionToSimulator,
}) => {
  const [steps, setSteps] = useState<OnboardingStep[]>(DEFAULT_ONBOARDING_STEPS);
  const [selectedId, setSelectedId] = useState<string>(
    DEFAULT_ONBOARDING_STEPS[2].id
  );

  const audit = useMemo(() => auditOnboardingStream(steps), [steps]);
  const selectedStep =
    steps.find((s) => s.id === selectedId) ?? steps[0];

  const updateStep = (
    id: string,
    patch: Partial<OnboardingStep>
  ) => {
    setSteps((prev) =>
      prev.map((s) =>
        s.id === id ? sanitizeOnboardingStep({ ...s, ...patch }) : s
      )
    );
  };

  const handleAddStep = () => {
    if (steps.length >= 10) return;
    const nextNum = steps.length + 1;
    const newStep: OnboardingStep = {
      id: `step-${Date.now()}`,
      screenName: `${nextNum}. New Onboarding Screen`,
      intrinsicLoad: 35,
      extrinsicLoad: 25,
      germaneLoad: 65,
      forcedSystem2: false,
      motivation: 70,
      ability: 75,
      promptClarity: 80,
    };
    setSteps((prev) => [...prev, newStep]);
    setSelectedId(newStep.id);
  };

  const handleRemoveStep = (id: string) => {
    if (steps.length <= 1) return;
    const remaining = steps.filter((s) => s.id !== id);
    setSteps(remaining);
    if (selectedId === id) {
      setSelectedId(remaining[0].id);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stream-Level Workbench Summary */}
      <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-[#1E293B]">
              Onboarding Flow &amp; Brain Effort Audit
            </h2>
            <p className="text-xs text-[#526071] mt-0.5">
              Click any screen node below to spot where users get overwhelmed and quit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddStep}
              disabled={steps.length >= 10}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-xs font-semibold text-[#1E293B] hover:bg-[#FAF9F6] disabled:opacity-40 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Screen</span>
            </button>

            <button
              type="button"
              onClick={() => onApplyFrictionToSimulator(audit.streamFrictionScore)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#EFEBF9] text-[#4C3D75] hover:bg-[#E4DDF6] text-xs font-semibold transition-colors cursor-pointer"
            >
              <span>Send Friction ({audit.streamFrictionScore}) to Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3 Workbench Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-white border border-[#E2E8F0] rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-xs text-[#526071]">
              <span>Stream Friction Score</span>
              <Tooltip text={TOOLTIPS.streamFriction} align="left" />
            </div>
            <div className="text-lg font-mono tabular-nums font-bold text-[#1E293B] mt-1">
              {audit.streamFrictionScore}/100
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg px-4 py-3">
            <div className="text-xs text-[#526071]">
              Users Finishing All Screens
            </div>
            <div className="text-lg font-mono tabular-nums font-bold text-[#245E46] mt-1">
              {audit.completionRatePct}%
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-lg px-4 py-3">
            <div className="flex items-center justify-between text-xs text-[#526071]">
              <span>Deep-Thinking Spikes</span>
              <Tooltip text={TOOLTIPS.forcedSystem2} align="right" />
            </div>
            <div className="text-lg font-mono tabular-nums font-bold text-[#C85A32] mt-1">
              {audit.system2SpikeCount} {audit.system2SpikeCount === 1 ? 'Spike' : 'Spikes'}
            </div>
          </div>
        </div>

        {/* Visual Screen Node Stream */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {audit.steps.map((item) => {
            const isSelected = item.step.id === selectedStep?.id;
            return (
              <div
                key={item.step.id}
                onClick={() => setSelectedId(item.step.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(item.step.id);
                  }
                }}
                className={`rounded-xl p-3.5 border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white border-[#4F46E5] ring-2 ring-[#4F46E5]/15'
                    : 'bg-white/90 border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1E293B] line-clamp-1">
                    {item.step.screenName}
                  </span>
                  {item.isSystem2Spike ? (
                    <span
                      title="Forced System 2 Spike"
                      className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#FDEEE8] text-[#C85A32] text-[10px] font-semibold"
                    >
                      <AlertTriangle className="w-3 h-3" />
                      Spike
                    </span>
                  ) : (
                    <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#E6F4EE] text-[#245E46] text-[10px] font-semibold">
                      <Zap className="w-3 h-3" />
                      Fast
                    </span>
                  )}
                </div>

                <div className="mt-3 space-y-1.5 text-[11px] font-mono tabular-nums">
                  <div className="flex justify-between text-[#526071]">
                    <span>Brain Effort</span>
                    <span className="font-semibold text-[#1E293B]">
                      {item.cognitiveFriction}/100
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#F1F5F9] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.isSystem2Spike ? 'bg-[#EA580C]' : 'bg-[#4F46E5]'
                      }`}
                      style={{ width: `${item.cognitiveFriction}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[#526071] pt-0.5">
                    <span>Still Here</span>
                    <span className="font-semibold text-[#245E46]">
                      {item.cumulativeReachPct}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Screen Inspector */}
      {selectedStep && (
        <div className="bg-white border border-[#E8E6E1] rounded-xl p-5 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex-1 min-w-[200px]">
              <label
                htmlFor="screen-name-input"
                className="block text-xs font-medium text-[#526071] mb-1"
              >
                Editing Screen
              </label>
              <input
                id="screen-name-input"
                type="text"
                maxLength={48}
                value={selectedStep.screenName}
                onChange={(e) =>
                  updateStep(selectedStep.id, {
                    screenName: sanitizeLabel(e.target.value, 48),
                  })
                }
                className="w-full max-w-sm text-xs font-semibold bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg px-3 py-2 text-[#1E293B] focus:outline-none focus:border-[#4F46E5]"
              />
            </div>

            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 text-xs font-medium text-[#1E293B] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedStep.forcedSystem2}
                  onChange={(e) =>
                    updateStep(selectedStep.id, {
                      forcedSystem2: e.target.checked,
                    })
                  }
                  className="rounded border-[#CBD5E1] text-[#4F46E5] focus:ring-[#4F46E5]"
                />
                <span>Forces Deep Thinking (System 2)</span>
                <Tooltip text={TOOLTIPS.forcedSystem2} align="right" />
              </label>

              {steps.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveStep(selectedStep.id)}
                  aria-label="Remove screen"
                  className="p-2 rounded-lg text-[#8F3D22] hover:bg-[#FDEEE8] transition-colors cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-[#F0EEE9]">
            {/* Sweller Cognitive Load */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-semibold text-[#1E293B]">
                Brainpower Load (Sweller)
              </h3>

              {[
                {
                  key: 'intrinsicLoad' as const,
                  label: 'Task Complexity',
                  tip: TOOLTIPS.intrinsicLoad,
                },
                {
                  key: 'extrinsicLoad' as const,
                  label: 'Screen Clutter & Jargon',
                  tip: TOOLTIPS.extrinsicLoad,
                },
                {
                  key: 'germaneLoad' as const,
                  label: 'Helpful Guidance & Examples',
                  tip: TOOLTIPS.germaneLoad,
                },
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="inline-flex items-center gap-1.5 text-[#1E293B]">
                      {item.label}
                      <Tooltip text={item.tip} align="left" />
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-[#4C3D75]">
                      {selectedStep[item.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedStep[item.key]}
                    onChange={(e) =>
                      updateStep(selectedStep.id, {
                        [item.key]: Number(e.target.value),
                      })
                    }
                    className="w-full nudge-slider"
                  />
                </div>
              ))}
            </div>

            {/* Fogg Behavior Model B=MAP */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-semibold text-[#1E293B]">
                  Action Readiness (Fogg B = MAP)
                </h3>
                <Tooltip text={TOOLTIPS.foggMAP} align="right" />
              </div>

              {[
                { key: 'motivation' as const, label: 'User Motivation (M)' },
                { key: 'ability' as const, label: 'Ease / Ability (A)' },
                { key: 'promptClarity' as const, label: 'Clear Button / Prompt (P)' },
              ].map((item) => (
                <div key={item.key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#1E293B]">{item.label}</span>
                    <span className="font-mono tabular-nums font-semibold text-[#245E46]">
                      {selectedStep[item.key]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={selectedStep[item.key]}
                    onChange={(e) =>
                      updateStep(selectedStep.id, {
                        [item.key]: Number(e.target.value),
                      })
                    }
                    className="w-full nudge-slider"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
