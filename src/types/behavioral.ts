export type AgentSegment = 'Innovator' | 'Early Adopter' | 'Pragmatist' | 'Skeptic';

export type AgentState = 'unaware' | 'contemplating' | 'adopted' | 'churned';

export type ProcessingRoute = 'central' | 'peripheral' | 'none';

export interface InterventionConfig {
  id: string;
  name: string;
  category: string;
  // EAST levers (0 - 100)
  easy: number;
  attractive: number;
  social: number;
  timely: number;
  // ELM & Friction parameters (0 - 100)
  argumentQuality: number;
  peripheralCues: number;
  userInvolvement: number;
  frictionCost: number;
}

export interface TPBProfile {
  attitude: number;
  subjectiveNorm: number;
  perceivedControl: number;
  behavioralIntention: number;
}

export interface ELMProfile {
  centralWeight: number; // 0 to 1
  peripheralWeight: number; // 0 to 1
  weeklyDecayRate: number; // 0 to 0.25
}

export interface Agent {
  id: number;
  segment: AgentSegment;
  skepticism: number; // 0 - 100
  socialSusceptibility: number; // 0 - 1
  involvement: number; // 0 - 100
  state: AgentState;
  route: ProcessingRoute;
  adoptedWeek: number | null;
}

export interface WeeklyPoint {
  week: number;
  baselinePct: number;
  variantAPct: number;
  variantBPct: number;
  centralPct: number;
  peripheralPct: number;
  churnedPct: number;
}

export interface SimulationSummary {
  finalAdoptionPct: number;
  baselineFinalPct: number;
  netLiftPct: number;
  peakAdoptionPct: number;
  retentionRatePct: number;
  centralSharePct: number;
  tpb: TPBProfile;
  elm: ELMProfile;
}

export interface SimulationResult {
  weekly: WeeklyPoint[];
  agentsA: Agent[];
  summaryA: SimulationSummary;
  summaryB: SimulationSummary;
}

export interface PresetScenario {
  id: string;
  name: string;
  category: string;
  tagline: string;
  variantA: InterventionConfig;
  variantB: InterventionConfig;
}

export interface OnboardingStep {
  id: string;
  screenName: string;
  intrinsicLoad: number; // Task complexity (0 - 100)
  extrinsicLoad: number; // UI clutter / confusion (0 - 100)
  germaneLoad: number; // Helpful guidance / clarity (0 - 100)
  forcedSystem2: boolean; // Requires slow analytical decision
  motivation: number; // Fogg M (0 - 100)
  ability: number; // Fogg A (0 - 100)
  promptClarity: number; // Fogg P (0 - 100)
}

export interface StepAuditResult {
  step: OnboardingStep;
  cognitiveFriction: number; // 0 - 100
  foggScore: number; // 0 - 100
  isSystem2Spike: boolean;
  stepPassRatePct: number; // 0 - 100
  cumulativeReachPct: number; // 0 - 100
}

export interface StreamAuditResult {
  streamFrictionScore: number; // 0 - 100
  completionRatePct: number; // 0 - 100
  system2SpikeCount: number;
  avgFoggScore: number; // 0 - 100
  steps: StepAuditResult[];
}
