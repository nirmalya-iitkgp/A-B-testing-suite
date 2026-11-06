import {
  OnboardingStep,
  StepAuditResult,
  StreamAuditResult,
} from '../types/behavioral';
import { clampScore, sanitizeLabel } from './behavioralModel';

export const DEFAULT_ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'step-1',
    screenName: '1. Welcome & 1-Click Sign-In',
    intrinsicLoad: 15,
    extrinsicLoad: 12,
    germaneLoad: 80,
    forcedSystem2: false,
    motivation: 78,
    ability: 92,
    promptClarity: 88,
  },
  {
    id: 'step-2',
    screenName: '2. Role & Goal Picker (3 Tiles)',
    intrinsicLoad: 28,
    extrinsicLoad: 20,
    germaneLoad: 75,
    forcedSystem2: false,
    motivation: 72,
    ability: 84,
    promptClarity: 82,
  },
  {
    id: 'step-3',
    screenName: '3. Billing Plan & Seat Math',
    intrinsicLoad: 76,
    extrinsicLoad: 64,
    germaneLoad: 35,
    forcedSystem2: true,
    motivation: 55,
    ability: 42,
    promptClarity: 58,
  },
  {
    id: 'step-4',
    screenName: '4. First Template Quick-Start',
    intrinsicLoad: 32,
    extrinsicLoad: 18,
    germaneLoad: 85,
    forcedSystem2: false,
    motivation: 80,
    ability: 86,
    promptClarity: 90,
  },
];

export function sanitizeOnboardingStep(raw: OnboardingStep): OnboardingStep {
  return {
    id: sanitizeLabel(raw.id, 32),
    screenName: sanitizeLabel(raw.screenName, 48),
    intrinsicLoad: clampScore(raw.intrinsicLoad),
    extrinsicLoad: clampScore(raw.extrinsicLoad),
    germaneLoad: clampScore(raw.germaneLoad),
    forcedSystem2: Boolean(raw.forcedSystem2),
    motivation: clampScore(raw.motivation),
    ability: clampScore(raw.ability),
    promptClarity: clampScore(raw.promptClarity),
  };
}

/**
 * Evaluates a multi-screen onboarding flow using:
 * - Sweller's Cognitive Load Theory (Intrinsic + Extrinsic - Germane buffer)
 * - Kahneman's Dual-Process Theory (System 1 autopilot vs. forced System 2 spikes)
 * - Fogg Behavior Model (B = M * A * P)
 */
export function auditOnboardingStream(
  rawSteps: OnboardingStep[]
): StreamAuditResult {
  const safeSteps =
    rawSteps.length > 0
      ? rawSteps.slice(0, 12).map(sanitizeOnboardingStep)
      : DEFAULT_ONBOARDING_STEPS;

  let cumulativeReach = 100;
  let totalFriction = 0;
  let totalFogg = 0;
  let system2SpikeCount = 0;

  const auditedSteps: StepAuditResult[] = safeSteps.map((step) => {
    // Sweller Cognitive Load: Intrinsic + Extrinsic, cushioned by Germane guidance
    const rawLoad =
      0.45 * step.intrinsicLoad +
      0.55 * step.extrinsicLoad -
      0.28 * step.germaneLoad;
    const system2Penalty = step.forcedSystem2 ? 18 : 0;
    const cognitiveFriction = clampScore(rawLoad + system2Penalty + 12);

    // Fogg B = M * A * P (normalized 0 - 100)
    const foggRaw =
      ((step.motivation / 100) *
        (step.ability / 100) *
        (step.promptClarity / 100)) **
        (1 / 3) *
      100;
    const foggScore = clampScore(foggRaw);

    // Flag forced System 2 cognitive processing spike
    const isSystem2Spike =
      step.forcedSystem2 && (cognitiveFriction >= 55 || step.ability < 55);
    if (isSystem2Spike) {
      system2SpikeCount += 1;
    }

    // Step pass rate combines Fogg readiness minus cognitive friction
    const passRaw =
      98 - cognitiveFriction * 0.34 + (foggScore - 50) * 0.22;
    const stepPassRatePct = Number(
      Math.min(99.5, Math.max(25, passRaw)).toFixed(1)
    );

    cumulativeReach = Number(
      ((cumulativeReach * stepPassRatePct) / 100).toFixed(1)
    );

    totalFriction += cognitiveFriction;
    totalFogg += foggScore;

    return {
      step,
      cognitiveFriction,
      foggScore,
      isSystem2Spike,
      stepPassRatePct,
      cumulativeReachPct: cumulativeReach,
    };
  });

  const count = auditedSteps.length;
  return {
    streamFrictionScore: Math.round(totalFriction / count),
    completionRatePct: cumulativeReach,
    system2SpikeCount,
    avgFoggScore: Math.round(totalFogg / count),
    steps: auditedSteps,
  };
}
