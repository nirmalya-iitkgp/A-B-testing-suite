# NudgeLab — Behavioral Economics & Product Nudge Simulator

An interactive, light-pastel behavioral science simulation canvas where product and growth teams test user interventions through **EAST**, **Theory of Planned Behavior (TPB)**, and **Elaboration Likelihood Model (ELM)** filters, then simulate adoption curves via a probabilistic agent-based engine.

---

### User Review & Critical Decisions

> [!IMPORTANT] All Phase 1 preferences have been locked into the design below. Review the architecture and click **Proceed** to begin implementation.

- **Confirmed Domain**: **Product & Growth Nudge Lab** — pre-loaded with realistic product interventions (e.g., *Default Annual Billing*, *Social Proof Checkout*, *Progressive Onboarding*, *Frictionless Referral*) plus custom intervention configuration.
- **Confirmed Frameworks**: **Full Suite (EAST + TPB + ELM)** — interventions are scored across EAST dimensions, mapped to TPB determinants ($Attitude$, $Subjective\ Norm$, $Perceived\ Behavioral\ Control$), routed through ELM ($Central$ vs. $Peripheral$ processing), and simulated across an agent population.
- **Confirmed Visual & UX Direction**: **Light Pastel Palette & Minimal Text** — airy pastel surfaces (lavender, mint sage, peach coral, sky periwinkle) with high-contrast dark slate typography, tabular numerals, and **interactive tooltips** (`?`) for all instructions and framework definitions instead of dense prose.

---

### 1. Overview & Core Concept

- **What It Does**: Lets product managers, growth designers, and UX researchers configure a proposed product intervention, tune its behavioral levers, and run a multi-week probabilistic agent-based simulation to forecast adoption curves, conversion lift, and retention decay.
- **Target Audience**: Product designers, growth marketers, and behavioral UX teams evaluating onboarding flows, pricing defaults, habit loops, and social proof mechanics.
- **Key Value**: Replaces guesswork and static textbook diagrams with an immediate, quantitative testing ground showing *why* an intervention succeeds (e.g., high peripheral spike that decays vs. slower central-route adoption that compounds).

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. **Zero-State & Preset Selection**: Opens directly into a populated, ready-to-run Product & Growth workspace with a default preset (*One-Click Annual Plan Default*) and a 1-click preset switcher for 4 product scenarios.
  2. **Intervention & EAST Tuning**: Users name/edit their intervention and adjust 4 **EAST** sliders (*Easy*, *Attractive*, *Social*, *Timely*) plus *Cognitive Load / Argument Strength*. Every control has a hover/focus **Tooltip** explaining the behavioral mechanism in 1–2 crisp sentences.
  3. **TPB & ELM Causal Filter**: Live visualizers show how the intervention shifts **Attitudes ($A$)**, **Subjective Norms ($SN$)**, and **Perceived Behavioral Control ($PBC$)** to form **Behavioral Intention ($BI$)**, while **ELM** splits the audience into *Central Route* (deep, durable) vs. *Peripheral Route* (heuristic, fast-decaying) processors.
  4. **Agent-Based Adoption Simulation**: Users click **Run Simulation** (or toggle live auto-sim) to watch $N$ heterogeneous agents (Innovators, Early Adopters, Pragmatists, Skeptics) transition across states (*Unaware $\to$ Exposed $\to$ Adopted $\to$ Churned*) over 12 weeks, comparing **Baseline** vs. **Intervention A** vs. **Variant B**.
  5. **A/B Variant Comparison & Agent Grid**: Dedicated views to pit two nudge designs head-to-head or inspect individual agent segments and their TPB thresholds.

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Light Pastel Editorial Lab — calm, tactile, low-text, high-clarity scientific instrument.
  - *Color Palette*:
    - `--bg-canvas`: `#FAF9F6` (Warm Alabaster)
    - `--bg-surface`: `#FFFFFF` with `#E8E6E1` hairline borders
    - `--pastel-lavender`: `#EFEBF9` (Ink: `#4C3D75`) — TPB & Intention
    - `--pastel-mint`: `#E6F4EE` (Ink: `#245E46`) — Adoption & Easy/PBC
    - `--pastel-peach`: `#FDEEE8` (Ink: `#8F3D22`) — Friction & Churn/Decay
    - `--pastel-sky`: `#E6F1FC` (Ink: `#285385`) — ELM Central/Peripheral & Social
    - `--pastel-butter`: `#FDF6E2` (Ink: `#7A5B12`) — Timely & Attractive
  - *Typography*: `Plus Jakarta Sans` (display & UI labels, `text-wrap: balance`) paired with `JetBrains Mono` (`tabular-nums`) for all percentages, agent counts, and week-by-week metrics.
  - *Top Bar Contract*: Single-row 3-zone header (`NudgeLab` wordmark — `Simulator`, `A/B Compare`, `Agent Grid`, `Presets` nav links — `Run Simulation` primary CTA).

- **Interactive Feedback & Motion**:
  - Smooth SVG curve transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), subtle hover tooltips (`150ms` reveal), and deterministic seeded replay so users can reproduce exact simulation runs.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Pure Client-Side Probabilistic Agent-Based Engine (No AI/LLM)**
  - *Chosen Approach*: Deterministic-seeded Monte Carlo & agent-based simulation written in pure TypeScript.
  - *Why*: Instantaneous (<10ms) slider feedback, 100% reproducible A/B comparisons, zero API latency, and strict adherence to no-AI-inside-app constraints.
  - *Alternatives Considered*: Server-side simulation or LLM-estimated scores (rejected due to latency, non-determinism, and user preference).

- **Decision 2: Tooltip-First Micro-Copy Architecture**
  - *Chosen Approach*: Keep the main canvas free of explanatory paragraphs; surface all behavioral science definitions, formulas, and tuning tips inside accessible hover/focus tooltips.
  - *Why*: Directly honors the user's request for minimal on-screen text while keeping the tool educational for non-specialists.
  - *Alternatives Considered*: Inline accordion textbooks (rejected as visually noisy).

---

### 4. Technical Architecture & Data Strategy

- **Architecture & Component Diagram**:

```text
┌──────────────────────────────────────────────────────────────────────┐
│                        Top Bar (3-Zone Header)                       │
│   NudgeLab   │   Simulator · A/B Compare · Agent Grid · Presets   │  Run │
└──────────────────────────────────┬───────────────────────────────────┘
                                   │
         ┌─────────────────────────┴─────────────────────────┐
         ▼                                                   ▼
┌──────────────────────────┐                      ┌──────────────────────────┐
│  Intervention & EAST     │                      │  Simulation Stage        │
│  Control Deck            │                      │  (65% Viewport Width)    │
│                          │                      │                          │
│ • Preset Selector        │   Parameters (EAST,  │ • Adoption S-Curve SVG   │
│ • EAST Sliders (0–100)   │   ELM, Population)   │   (Baseline vs A vs B)   │
│   + Tooltip (?) Guides   │ ───────────────────► │ • TPB Causal Flow        │
│ • ELM Argument & Cue     │                      │   (A + SN + PBC -> BI)   │
│   Sliders + Tooltips     │                      │ • ELM Route Split Bar    │
│ • Variant A / B Toggle   │                      │ • Agent State Grid       │
└──────────────────────────┘                      └──────────────────────────┘
                                   │
                                   ▼
┌──────────────────────────────────────────────────────────────────────┐
│                  Pure TypeScript Behavioral Engine                   │
│                                                                      │
│  EAST Levers ──► TPB Determinants (A, SN, PBC) ──► Intention (BI)    │
│                                                        │             │
│  ELM Elaboration ──► Central vs. Peripheral Weight ────┼──► Agents   │
│                                                        ▼             │
│  Seeded PRNG ──► N Heterogeneous Agents (12 Weeks) ──► TimeSeries    │
└──────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `InterventionConfig`: Name, category, EAST scores (`easy`, `attractive`, `social`, `timely` 0–100), ELM parameters (`argumentQuality`, `peripheralCues`, `userInvolvement` 0–100), and `frictionCost` (0–100).
  - `TPBProfile`: Computed `attitude`, `subjectiveNorm`, `perceivedControl`, `behavioralIntention`, and `elmCentralShare` (0–1).
  - `Agent`: `id`, `segment` (*Innovator*, *Early Adopter*, *Pragmatist*, *Skeptic*), `skepticism`, `socialSusceptibility`, `involvement`, `state` (*unaware*, *contemplating*, *adopted*, *churned*), `routeUsed` (*central*, *peripheral*).
  - `SimulationResult`: Weekly time-series (`week`, `baselineAdoptedPct`, `variantAAdoptedPct`, `variantBAdoptedPct`, `centralPct`, `peripheralPct`, `churnedPct`) + final KPIs.

- **Quality, Security & Verification**:
  - **Unit Tests**: Automated test suite (`tsx --test`) verifying TPB weighted intention math, ELM central/peripheral decay dynamics, EAST-to-TPB mapping bounds, and agent-based simulation monotonicity.
  - **Security & Input Validation**: Strict numeric clamping (`0..100`) on all inputs, sanitized text rendering (no `dangerouslySetInnerHTML`), and clean `index.html` metadata + custom PNG icon.
  - **Documentation & UAT**: Descriptive `README.md` updated with architecture, formulas, and test instructions, followed by a post-build UAT review.
