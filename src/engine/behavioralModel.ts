import {
  Agent,
  AgentSegment,
  ELMProfile,
  InterventionConfig,
  SimulationResult,
  SimulationSummary,
  TPBProfile,
  WeeklyPoint,
} from '../types/behavioral';
import { BASELINE_CONFIG } from './presets';

/**
 * Clamps numeric inputs safely to [min, max], guarding against NaN or Infinity.
 */
export function clampScore(value: unknown, min = 0, max = 100): number {
  const num = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.min(max, Math.max(min, Math.round(num)));
}

/**
 * Sanitizes user-entered labels to prevent XSS or layout-breaking strings.
 */
export function sanitizeLabel(input: unknown, maxLength = 48): string {
  if (typeof input !== 'string') return 'Untitled Intervention';
  const cleaned = input
    .replace(/[<>`"'&]/g, '')
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();
  return cleaned.length > 0 ? cleaned.slice(0, maxLength) : 'Untitled Intervention';
}

/**
 * Sanitizes an entire InterventionConfig object.
 */
export function sanitizeConfig(config: InterventionConfig): InterventionConfig {
  return {
    id: sanitizeLabel(config.id, 32),
    name: sanitizeLabel(config.name, 48),
    category: sanitizeLabel(config.category, 32),
    easy: clampScore(config.easy),
    attractive: clampScore(config.attractive),
    social: clampScore(config.social),
    timely: clampScore(config.timely),
    argumentQuality: clampScore(config.argumentQuality),
    peripheralCues: clampScore(config.peripheralCues),
    userInvolvement: clampScore(config.userInvolvement),
    frictionCost: clampScore(config.frictionCost),
  };
}

/**
 * Deterministic seeded PRNG (Mulberry32) for reproducible agent simulations.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Maps EAST + ELM parameters to Theory of Planned Behavior (TPB) determinants.
 */
export function computeTPBProfile(raw: InterventionConfig): TPBProfile {
  const c = sanitizeConfig(raw);
  const attitude = clampScore(
    0.45 * c.attractive + 0.4 * c.argumentQuality + 0.15 * c.timely
  );
  const subjectiveNorm = clampScore(0.75 * c.social + 0.25 * c.peripheralCues);
  const perceivedControl = clampScore(
    0.68 * c.easy + 0.22 * c.timely - 0.32 * c.frictionCost + 15
  );
  const behavioralIntention = clampScore(
    0.38 * attitude + 0.28 * subjectiveNorm + 0.34 * perceivedControl
  );

  return {
    attitude,
    subjectiveNorm,
    perceivedControl,
    behavioralIntention,
  };
}

/**
 * Computes Elaboration Likelihood Model (ELM) route weights and weekly decay.
 */
export function computeELMProfile(raw: InterventionConfig): ELMProfile {
  const c = sanitizeConfig(raw);
  const elaborationRaw =
    0.55 * c.userInvolvement + 0.45 * c.argumentQuality - 0.15 * c.frictionCost;
  const normalized = Math.min(100, Math.max(0, elaborationRaw));
  // Smooth bounded central weight between 0.12 and 0.88
  const centralWeight = Number((0.12 + 0.76 * (normalized / 100)).toFixed(3));
  const peripheralWeight = Number((1 - centralWeight).toFixed(3));

  // Peripheral-heavy interventions decay faster unless reinforced by ease & argument
  const baseDecay = 0.012 * centralWeight + 0.095 * peripheralWeight;
  const easeBuffer = 1 - (c.easy / 100) * 0.35;
  const weeklyDecayRate = Number(
    Math.min(0.22, Math.max(0.005, baseDecay * easeBuffer)).toFixed(4)
  );

  return {
    centralWeight,
    peripheralWeight,
    weeklyDecayRate,
  };
}

function createAgentPopulation(count: number, rng: () => number): Agent[] {
  const agents: Agent[] = [];
  for (let i = 0; i < count; i++) {
    const r = rng();
    let segment: AgentSegment;
    let skepticism: number;
    let socialSusceptibility: number;
    let involvement: number;

    if (r < 0.08) {
      segment = 'Innovator';
      skepticism = 18 + rng() * 20;
      socialSusceptibility = 0.3 + rng() * 0.3;
      involvement = 65 + rng() * 30;
    } else if (r < 0.3) {
      segment = 'Early Adopter';
      skepticism = 32 + rng() * 22;
      socialSusceptibility = 0.55 + rng() * 0.35;
      involvement = 50 + rng() * 35;
    } else if (r < 0.76) {
      segment = 'Pragmatist';
      skepticism = 48 + rng() * 24;
      socialSusceptibility = 0.65 + rng() * 0.3;
      involvement = 35 + rng() * 35;
    } else {
      segment = 'Skeptic';
      skepticism = 68 + rng() * 26;
      socialSusceptibility = 0.4 + rng() * 0.35;
      involvement = 20 + rng() * 40;
    }

    agents.push({
      id: i + 1,
      segment,
      skepticism,
      socialSusceptibility,
      involvement,
      state: 'unaware',
      route: 'none',
      adoptedWeek: null,
    });
  }
  return agents;
}

interface SingleRunOutput {
  weeklyAdoptedPct: number[];
  weeklyCentralPct: number[];
  weeklyPeripheralPct: number[];
  weeklyChurnedPct: number[];
  finalAgents: Agent[];
  tpb: TPBProfile;
  elm: ELMProfile;
}

function simulateSingleIntervention(
  rawConfig: InterventionConfig,
  agentCount: number,
  weeks: number,
  seed: number
): SingleRunOutput {
  const config = sanitizeConfig(rawConfig);
  const tpb = computeTPBProfile(config);
  const elm = computeELMProfile(config);
  const rng = mulberry32(seed);
  const agents = createAgentPopulation(agentCount, rng);

  const weeklyAdoptedPct: number[] = [];
  const weeklyCentralPct: number[] = [];
  const weeklyPeripheralPct: number[] = [];
  const weeklyChurnedPct: number[] = [];

  const exposureRate = Math.min(
    0.92,
    0.18 + (config.timely * 0.35 + config.attractive * 0.35) / 100
  );

  for (let w = 1; w <= weeks; w++) {
    const currentAdoptedRatio =
      agents.filter((a) => a.state === 'adopted').length / agentCount;

    for (const agent of agents) {
      if (agent.state === 'unaware') {
        if (rng() < exposureRate) {
          agent.state = 'contemplating';
        }
      }

      if (agent.state === 'contemplating') {
        const socialContagion =
          currentAdoptedRatio * config.social * agent.socialSusceptibility * 0.65;
        const peripheralBoost =
          elm.peripheralWeight * config.peripheralCues * 0.22;
        const stochasticNoise = (rng() - 0.5) * 16;

        const effectiveDrive =
          tpb.behavioralIntention + socialContagion + peripheralBoost + stochasticNoise;

        if (effectiveDrive >= agent.skepticism) {
          agent.state = 'adopted';
          agent.adoptedWeek = w;
          const centralProb =
            0.5 * elm.centralWeight + 0.5 * (agent.involvement / 100);
          agent.route = rng() < centralProb ? 'central' : 'peripheral';
        }
      } else if (agent.state === 'adopted') {
        // Central route adopters have 4x lower churn than peripheral adopters
        const routeMultiplier = agent.route === 'central' ? 0.35 : 1.45;
        const churnProb = elm.weeklyDecayRate * routeMultiplier;
        if (rng() < churnProb) {
          agent.state = 'churned';
        }
      }
    }

    const adopted = agents.filter((a) => a.state === 'adopted');
    const central = adopted.filter((a) => a.route === 'central').length;
    const peripheral = adopted.filter((a) => a.route === 'peripheral').length;
    const churned = agents.filter((a) => a.state === 'churned').length;

    weeklyAdoptedPct.push(Number(((adopted.length / agentCount) * 100).toFixed(1)));
    weeklyCentralPct.push(Number(((central / agentCount) * 100).toFixed(1)));
    weeklyPeripheralPct.push(Number(((peripheral / agentCount) * 100).toFixed(1)));
    weeklyChurnedPct.push(Number(((churned / agentCount) * 100).toFixed(1)));
  }

  return {
    weeklyAdoptedPct,
    weeklyCentralPct,
    weeklyPeripheralPct,
    weeklyChurnedPct,
    finalAgents: agents,
    tpb,
    elm,
  };
}

function buildSummary(
  run: SingleRunOutput,
  baselineFinalPct: number
): SimulationSummary {
  const finalAdoptionPct =
    run.weeklyAdoptedPct[run.weeklyAdoptedPct.length - 1] ?? 0;
  const peakAdoptionPct = Math.max(...run.weeklyAdoptedPct, 0);
  const finalChurnedPct =
    run.weeklyChurnedPct[run.weeklyChurnedPct.length - 1] ?? 0;
  const totalEverAdopted = finalAdoptionPct + finalChurnedPct;
  const retentionRatePct =
    totalEverAdopted > 0
      ? Number(((finalAdoptionPct / totalEverAdopted) * 100).toFixed(1))
      : 100;

  return {
    finalAdoptionPct,
    baselineFinalPct,
    netLiftPct: Number((finalAdoptionPct - baselineFinalPct).toFixed(1)),
    peakAdoptionPct,
    retentionRatePct,
    centralSharePct: Number((run.elm.centralWeight * 100).toFixed(0)),
    tpb: run.tpb,
    elm: run.elm,
  };
}

/**
 * Runs comparative agent-based simulation for Baseline, Variant A, and Variant B.
 */
export function runAgentSimulation(
  variantA: InterventionConfig,
  variantB: InterventionConfig,
  options: { agentCount?: number; weeks?: number; seed?: number } = {}
): SimulationResult {
  const agentCount = clampScore(options.agentCount ?? 400, 100, 2000);
  const weeks = clampScore(options.weeks ?? 12, 4, 24);
  const seed = clampScore(options.seed ?? 42, 1, 999999);

  const baselineRun = simulateSingleIntervention(
    BASELINE_CONFIG,
    agentCount,
    weeks,
    seed
  );
  const runA = simulateSingleIntervention(variantA, agentCount, weeks, seed);
  const runB = simulateSingleIntervention(variantB, agentCount, weeks, seed);

  const baselineFinalPct =
    baselineRun.weeklyAdoptedPct[baselineRun.weeklyAdoptedPct.length - 1] ?? 0;

  const weekly: WeeklyPoint[] = [];
  for (let i = 0; i < weeks; i++) {
    weekly.push({
      week: i + 1,
      baselinePct: baselineRun.weeklyAdoptedPct[i],
      variantAPct: runA.weeklyAdoptedPct[i],
      variantBPct: runB.weeklyAdoptedPct[i],
      centralPct: runA.weeklyCentralPct[i],
      peripheralPct: runA.weeklyPeripheralPct[i],
      churnedPct: runA.weeklyChurnedPct[i],
    });
  }

  return {
    weekly,
    agentsA: runA.finalAgents,
    summaryA: buildSummary(runA, baselineFinalPct),
    summaryB: buildSummary(runB, baselineFinalPct),
  };
}
