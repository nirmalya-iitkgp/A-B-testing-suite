import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampScore,
  computeELMProfile,
  computeTPBProfile,
  runAgentSimulation,
  sanitizeConfig,
  sanitizeLabel,
} from './behavioralModel';
import {
  auditOnboardingStream,
  DEFAULT_ONBOARDING_STEPS,
} from './frictionAudit';
import { BASELINE_CONFIG, PRESET_SCENARIOS } from './presets';

describe('Behavioral Engine — Blue-Pill Functional Tests', () => {
  it('computes higher TPB intention when EAST levers increase', () => {
    const lowTPB = computeTPBProfile(BASELINE_CONFIG);
    const highTPB = computeTPBProfile(PRESET_SCENARIOS[0].variantA);

    assert.ok(
      highTPB.behavioralIntention > lowTPB.behavioralIntention,
      'Strong EAST intervention should produce higher behavioral intention'
    );
    assert.ok(highTPB.perceivedControl > lowTPB.perceivedControl);
  });

  it('routes high-involvement & strong-argument interventions to ELM Central Route', () => {
    const centralPreset = PRESET_SCENARIOS[0].variantA; // High argument & involvement
    const peripheralPreset = PRESET_SCENARIOS[0].variantB; // High peripheral cues, low argument

    const elmCentral = computeELMProfile(centralPreset);
    const elmPeripheral = computeELMProfile(peripheralPreset);

    assert.ok(
      elmCentral.centralWeight > elmPeripheral.centralWeight,
      'Central preset should have higher centralWeight'
    );
    assert.ok(
      elmCentral.weeklyDecayRate < elmPeripheral.weeklyDecayRate,
      'Central route should have lower weekly decay than peripheral route'
    );
  });

  it('produces deterministic, reproducible agent-based simulation results', () => {
    const p = PRESET_SCENARIOS[0];
    const run1 = runAgentSimulation(p.variantA, p.variantB, {
      agentCount: 300,
      weeks: 12,
      seed: 101,
    });
    const run2 = runAgentSimulation(p.variantA, p.variantB, {
      agentCount: 300,
      weeks: 12,
      seed: 101,
    });

    assert.deepEqual(run1.weekly, run2.weekly);
    assert.equal(run1.agentsA.length, 300);
    assert.equal(run1.weekly.length, 12);
    assert.ok(run1.summaryA.netLiftPct > 0);
  });
});

describe('Security & Boundary — Red-Pill Adversarial Tests', () => {
  it('clamps NaN, Infinity, negative, and out-of-range numeric inputs', () => {
    assert.equal(clampScore(NaN), 0);
    assert.equal(clampScore(Infinity), 0);
    assert.equal(clampScore(-50), 0);
    assert.equal(clampScore(999), 100);
    assert.equal(clampScore('75.6'), 76);
  });

  it('sanitizes XSS payloads and control characters from intervention labels', () => {
    const xss = '<script>alert("xss")</script>Annual Plan & Co.';
    const clean = sanitizeLabel(xss);
    assert.ok(!clean.includes('<'));
    assert.ok(!clean.includes('>'));
    assert.ok(!clean.includes('"'));
    assert.equal(sanitizeLabel('   '), 'Untitled Intervention');
  });

  it('survives malformed config without throwing or producing NaN', () => {
    const hostileConfig = {
      ...BASELINE_CONFIG,
      name: '<img src=x onerror=alert(1)>',
      easy: -999,
      attractive: Infinity,
      social: NaN,
      frictionCost: 5000,
    };
    const safe = sanitizeConfig(hostileConfig);
    assert.equal(safe.easy, 0);
    assert.equal(safe.attractive, 0);
    assert.equal(safe.social, 0);
    assert.equal(safe.frictionCost, 100);

    const sim = runAgentSimulation(hostileConfig, BASELINE_CONFIG, {
      agentCount: 10, // Below min 100 -> clamped to 100
      weeks: 2, // Below min 4 -> clamped to 4
    });
    assert.equal(sim.agentsA.length, 100);
    assert.equal(sim.weekly.length, 4);
    assert.ok(Number.isFinite(sim.summaryA.finalAdoptionPct));
  });
});

describe('Onboarding Friction Audit — Dual-Process, Sweller & Fogg Tests', () => {
  it('flags forced System 2 spikes and calculates cumulative reach', () => {
    const result = auditOnboardingStream(DEFAULT_ONBOARDING_STEPS);
    assert.equal(result.system2SpikeCount, 1);
    assert.ok(result.streamFrictionScore > 0 && result.streamFrictionScore <= 100);
    assert.ok(result.completionRatePct > 0 && result.completionRatePct < 100);
    assert.equal(result.steps.length, DEFAULT_ONBOARDING_STEPS.length);
  });

  it('handles empty or hostile step arrays safely without NaN', () => {
    const emptyAudit = auditOnboardingStream([]);
    assert.equal(emptyAudit.steps.length, DEFAULT_ONBOARDING_STEPS.length);

    const hostileAudit = auditOnboardingStream([
      {
        id: '<script>',
        screenName: '<img src=x onerror=alert(1)>',
        intrinsicLoad: NaN,
        extrinsicLoad: 999,
        germaneLoad: -50,
        forcedSystem2: true,
        motivation: Infinity,
        ability: -10,
        promptClarity: 50,
      },
    ]);
    assert.ok(Number.isFinite(hostileAudit.streamFrictionScore));
    assert.ok(Number.isFinite(hostileAudit.completionRatePct));
    assert.ok(!hostileAudit.steps[0].step.screenName.includes('<'));
  });
});

