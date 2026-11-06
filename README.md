# NudgeLab — Behavioral Economics & Product Nudge Simulator

**NudgeLab** is an interactive behavioral science simulation canvas for product designers, growth marketers, and UX researchers. It transforms abstract psychological and sociological frameworks—**EAST**, **Theory of Planned Behavior (TPB)**, and the **Elaboration Likelihood Model (ELM)**—into a probabilistic agent-based adoption simulator.

---

## Core Behavioral Frameworks

1. **EAST Nudge Architecture**
   - **Easy**: Reduces interaction friction and cognitive effort, directly increasing Perceived Behavioral Control.
   - **Attractive**: Elevates visual salience and reward framing, boosting Attitude and initial exposure.
   - **Social**: Leverages peer norms and social proof, driving Subjective Norms and network contagion.
   - **Timely**: Delivers prompts at high-receptivity moments.

2. **Theory of Planned Behavior (TPB)**
   - Maps intervention parameters into **Attitude ($A$)**, **Subjective Norm ($SN$)**, and **Perceived Behavioral Control ($PBC$)** to compute **Behavioral Intention ($BI$)**.

3. **Elaboration Likelihood Model (ELM)**
   - Routes simulated users between **Central Route** processing (high cognitive elaboration, durable attitude shift, low weekly churn) and **Peripheral Route** processing (heuristic cues, fast initial conversion, higher decay).

4. **Probabilistic Agent-Based Engine**
   - Simulates $250\text{–}800$ heterogeneous consumer agents across four segments (*Innovator*, *Early Adopter*, *Pragmatist*, *Skeptic*) over 12 weeks using a deterministic seeded PRNG (`mulberry32`) for reproducible A/B comparisons.

5. **Dual-Process Cognitive Friction & Onboarding Audit Studio**
   - Evaluates multi-screen onboarding flows against **Sweller’s Cognitive Load Theory** (*Intrinsic*, *Extrinsic*, *Germane*), **Kahneman’s Dual-Process Theory** (*System 1* autopilot vs. forced *System 2* spikes), and the **Fogg Behavior Model** ($B = M \times A \times P$), calculating a stream-level **Cognitive Friction Score** that syncs directly into the simulator.

---

## Running & Testing

```bash
# Install dependencies
npm install

# Run unit & security (red-pill / blue-pill) tests
npm test

# Type-check & build for production
npm run lint
npm run build
```

---

## Security & Input Validation

- All numeric parameters are strictly clamped (`0–100` for behavioral scores, `100–2000` for agent counts, `4–24` for weeks) with `Number.isFinite` guards against `NaN` and `Infinity`.
- All user-entered intervention labels are sanitized to strip HTML/script characters and control sequences.
- Zero external AI/LLM API calls; all simulations execute deterministically client-side.
