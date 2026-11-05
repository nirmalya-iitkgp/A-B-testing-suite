import { useEffect, useMemo, useState } from 'react';
import { BookOpen } from 'lucide-react';
import { PRESET_SCENARIOS, TOOLTIPS } from './engine/presets';
import {
  runAgentSimulation,
  sanitizeConfig,
  sanitizeLabel,
} from './engine/behavioralModel';
import { InterventionConfig, PresetScenario } from './types/behavioral';
import { ActiveTab, TopBar } from './components/TopBar';
import { ControlDeck } from './components/ControlDeck';
import { AdoptionChart } from './components/AdoptionChart';
import { FrameworkBreakdown } from './components/FrameworkBreakdown';
import { AgentGridView } from './components/AgentGridView';
import { ABCompareView } from './components/ABCompareView';
import { PresetsView } from './components/PresetsView';
import { Tooltip } from './components/Tooltip';
import { PlainLanguageDrawer } from './components/PlainLanguageDrawer';

const STORAGE_KEY = 'nudgelab_custom_ideas_v1';

function loadSavedIdeas(): PresetScenario[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, 20).map((item) => ({
      id: sanitizeLabel(item.id, 32),
      name: sanitizeLabel(item.name, 48),
      category: 'My Saved Idea',
      tagline: sanitizeLabel(item.tagline || 'Custom product nudge idea.', 96),
      variantA: sanitizeConfig(item.variantA),
      variantB: sanitizeConfig(item.variantB),
    }));
  } catch {
    return [];
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('simulator');
  const [activeVariant, setActiveVariant] = useState<'A' | 'B'>('A');
  const [variantA, setVariantA] = useState<InterventionConfig>(
    PRESET_SCENARIOS[0].variantA
  );
  const [variantB, setVariantB] = useState<InterventionConfig>(
    PRESET_SCENARIOS[0].variantB
  );
  const [customIdeas, setCustomIdeas] = useState<PresetScenario[]>(loadSavedIdeas);
  const [agentCount, setAgentCount] = useState<number>(400);
  const [seed, setSeed] = useState<number>(42);
  const [guideOpen, setGuideOpen] = useState<boolean>(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customIdeas));
    } catch {
      // Ignore storage quota errors
    }
  }, [customIdeas]);

  const simulation = useMemo(
    () => runAgentSimulation(variantA, variantB, { agentCount, weeks: 12, seed }),
    [variantA, variantB, agentCount, seed]
  );

  const activeConfig = activeVariant === 'A' ? variantA : variantB;
  const activeSummary =
    activeVariant === 'A' ? simulation.summaryA : simulation.summaryB;

  const handleConfigChange = (updated: InterventionConfig) => {
    if (activeVariant === 'A') {
      setVariantA(updated);
    } else {
      setVariantB(updated);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const found = [...customIdeas, ...PRESET_SCENARIOS].find(
      (p) => p.id === presetId
    );
    if (!found) return;
    setVariantA(found.variantA);
    setVariantB(found.variantB);
    setActiveTab('simulator');
  };

  const handleSaveCustomIdea = () => {
    const newIdea: PresetScenario = {
      id: `custom-${Date.now()}`,
      name: sanitizeLabel(activeConfig.name, 48),
      category: 'My Saved Idea',
      tagline: `Saved from Idea ${activeVariant} · Easy ${activeConfig.easy}, Friends ${activeConfig.social}, Value ${activeConfig.argumentQuality}.`,
      variantA: sanitizeConfig(variantA),
      variantB: sanitizeConfig(variantB),
    };
    setCustomIdeas((prev) => [newIdea, ...prev.slice(0, 19)]);
  };

  const handleDeleteCustomIdea = (presetId: string) => {
    setCustomIdeas((prev) => prev.filter((item) => item.id !== presetId));
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#1E293B]">
      <TopBar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onRunSimulation={() => setSeed((s) => s + 1)}
      />

      <main className="max-w-[1400px] mx-auto px-6 py-6 space-y-5">
        {/* Ultra-short 1-line orientation strip + Plain Language Guide trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#526071] bg-white border border-[#E8E6E1] rounded-xl px-4 py-2.5">
          <span>
            <strong className="text-[#1E293B]">How it works:</strong> 1. Name
            &amp; tune your idea on the left → 2. Click{' '}
            <strong className="text-[#1E293B]">Save to Ideas</strong> to keep
            it → 3. Watch how many people join &amp; stay.
          </span>

          <button
            type="button"
            onClick={() => setGuideOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#EFEBF9] text-[#4C3D75] hover:bg-[#E4DDF6] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Plain Language Guide</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Control Deck */}
          <div className="lg:col-span-4">
            <ControlDeck
              activeVariant={activeVariant}
              onVariantChange={setActiveVariant}
              config={activeConfig}
              onChangeConfig={handleConfigChange}
              customIdeas={customIdeas}
              onSelectPreset={handleSelectPreset}
              onSaveCustomIdea={handleSaveCustomIdea}
              agentCount={agentCount}
              onChangeAgentCount={setAgentCount}
            />
          </div>

          {/* Right Simulation Stage */}
          <div className="lg:col-span-8 space-y-5">
            {/* 4-Column Pastel KPI Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="rounded-xl bg-[#E6F4EE] border border-[#D4EADF] px-4 py-3.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#245E46]">
                  <span>Users Who Join</span>
                  <Tooltip text={TOOLTIPS.kpiJoined} align="left" />
                </div>
                <div className="text-xl font-mono tabular-nums font-bold text-[#1E293B] mt-1">
                  {activeSummary.finalAdoptionPct}%
                </div>
              </div>

              <div className="rounded-xl bg-[#EFEBF9] border border-[#DFD8F2] px-4 py-3.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#4C3D75]">
                  <span>Extra Growth</span>
                  <Tooltip text={TOOLTIPS.kpiLift} align="center" />
                </div>
                <div className="text-xl font-mono tabular-nums font-bold text-[#1E293B] mt-1">
                  {activeSummary.netLiftPct >= 0 ? '+' : ''}
                  {activeSummary.netLiftPct}%
                </div>
              </div>

              <div className="rounded-xl bg-[#E6F1FC] border border-[#D2E4F7] px-4 py-3.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#285385]">
                  <span>Desire to Try</span>
                  <Tooltip text={TOOLTIPS.kpiDesire} align="center" />
                </div>
                <div className="text-xl font-mono tabular-nums font-bold text-[#1E293B] mt-1">
                  {activeSummary.tpb.behavioralIntention}/100
                </div>
              </div>

              <div className="rounded-xl bg-[#FDF6E2] border border-[#F3E7C4] px-4 py-3.5">
                <div className="flex items-center justify-between text-xs font-medium text-[#7A5B12]">
                  <span>Long-Term Loyalty</span>
                  <Tooltip text={TOOLTIPS.kpiLoyalty} align="right" />
                </div>
                <div className="text-xl font-mono tabular-nums font-bold text-[#1E293B] mt-1">
                  {activeSummary.centralSharePct}%
                </div>
              </div>
            </div>

            {/* Active Stage View */}
            {activeTab === 'simulator' && (
              <>
                <AdoptionChart
                  weekly={simulation.weekly}
                  variantAName={variantA.name}
                  variantBName={variantB.name}
                />
                <FrameworkBreakdown
                  summary={activeSummary}
                  variantLabel={`Idea ${activeVariant}`}
                />
              </>
            )}

            {activeTab === 'compare' && (
              <>
                <ABCompareView
                  variantA={variantA}
                  variantB={variantB}
                  summaryA={simulation.summaryA}
                  summaryB={simulation.summaryB}
                />
                <AdoptionChart
                  weekly={simulation.weekly}
                  variantAName={variantA.name}
                  variantBName={variantB.name}
                />
              </>
            )}

            {activeTab === 'agents' && (
              <AgentGridView agents={simulation.agentsA} />
            )}

            {activeTab === 'presets' && (
              <PresetsView
                customIdeas={customIdeas}
                onLoadPreset={handleSelectPreset}
                onDeleteCustomIdea={handleDeleteCustomIdea}
              />
            )}
          </div>
        </div>
      </main>

      <PlainLanguageDrawer
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />
    </div>
  );
}
