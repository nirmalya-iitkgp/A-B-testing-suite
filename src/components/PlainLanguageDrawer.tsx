import React, { useEffect, useState } from 'react';
import { BookOpen, Search, X } from 'lucide-react';
import { sanitizeLabel } from '../engine/behavioralModel';

interface PlainLanguageDrawerProps {
  open: boolean;
  onClose: () => void;
}

interface GlossaryEntry {
  term: string;
  plainTitle: string;
  businessMeaning: string;
  badgeBg: string;
}

const GLOSSARY: GlossaryEntry[] = [
  {
    term: 'Subjective Norms',
    plainTitle: 'Peer Pressure & Social Proof',
    businessMeaning:
      'What customers think people like them are doing. Showing "1,200 teams use this" makes new users feel safe joining.',
    badgeBg: 'bg-[#E6F1FC] text-[#285385]',
  },
  {
    term: 'Agent-Based Modeling',
    plainTitle: 'Virtual Test Crowd',
    businessMeaning:
      'Instead of guessing with one average number, we simulate hundreds of individual people—some eager, some picky—to see how your idea spreads week by week.',
    badgeBg: 'bg-[#EFEBF9] text-[#4C3D75]',
  },
  {
    term: 'Theory of Planned Behavior (TPB)',
    plainTitle: 'Why People Say Yes',
    businessMeaning:
      'People only take action when three things line up: they like the idea, their peers approve, and it feels easy to do.',
    badgeBg: 'bg-[#EFEBF9] text-[#4C3D75]',
  },
  {
    term: 'Perceived Behavioral Control',
    plainTitle: 'Feels Easy to Do',
    businessMeaning:
      'How effortless the user thinks the step is. One-click defaults score high; long forms score low.',
    badgeBg: 'bg-[#E6F4EE] text-[#245E46]',
  },
  {
    term: 'Attitude',
    plainTitle: 'Do They Like It?',
    businessMeaning:
      'Whether the user views your offer as genuinely helpful and worth their time or money.',
    badgeBg: 'bg-[#FDF6E2] text-[#7A5B12]',
  },
  {
    term: 'Behavioral Intention',
    plainTitle: 'Overall Desire to Try',
    businessMeaning:
      'The combined push to say yes. Higher desire means more people convert when they see your prompt.',
    badgeBg: 'bg-[#EFEBF9] text-[#4C3D75]',
  },
  {
    term: 'Elaboration Likelihood Model (ELM)',
    plainTitle: 'Deep Loyalty vs. Quick Hype',
    businessMeaning:
      'Explains whether users joined because they truly understood the value (they stay) or just clicked a flashy badge (they quit sooner).',
    badgeBg: 'bg-[#E6F4EE] text-[#245E46]',
  },
  {
    term: 'Central Route',
    plainTitle: 'Convinced by Real Value',
    businessMeaning:
      'Users who read the facts and see real benefit. They take slightly longer to convince, but rarely churn.',
    badgeBg: 'bg-[#E6F4EE] text-[#245E46]',
  },
  {
    term: 'Peripheral Route',
    plainTitle: 'Hooked by Quick Hype',
    businessMeaning:
      'Users who act on impulse from countdown timers, stars, or colors. Fast initial spike, but higher weekly drop-off.',
    badgeBg: 'bg-[#FDF6E2] text-[#7A5B12]',
  },
  {
    term: 'EAST Framework',
    plainTitle: '4 Rules for Better Nudges',
    businessMeaning:
      'To get more users to act, make your product Easy, Attractive, Social, and Timely.',
    badgeBg: 'bg-[#E6F1FC] text-[#285385]',
  },
  {
    term: 'Friction Cost',
    plainTitle: 'Annoyance & Extra Effort',
    businessMeaning:
      'Every extra click, password field, or slow page load that makes customers give up halfway.',
    badgeBg: 'bg-[#FDEEE8] text-[#8F3D22]',
  },
  {
    term: 'System 1 vs. System 2 (Kahneman)',
    plainTitle: 'Autopilot vs. Deep Thinking',
    businessMeaning:
      'System 1 is fast, effortless autopilot (like clicking "Continue with Google"). System 2 is slow, tiring math or decision-making. Forcing System 2 too early causes users to quit.',
    badgeBg: 'bg-[#EFEBF9] text-[#4C3D75]',
  },
  {
    term: 'Cognitive Load (Sweller)',
    plainTitle: 'Brainpower Budget',
    businessMeaning:
      'Users have limited mental energy. Intrinsic Load is task difficulty, Extrinsic Load is screen clutter, and Germane Load is helpful guidance.',
    badgeBg: 'bg-[#E6F1FC] text-[#285385]',
  },
  {
    term: 'Fogg Behavior Model (B = MAP)',
    plainTitle: 'Motivation × Ability × Prompt',
    businessMeaning:
      'A user only completes a step when they want to do it (Motivation), it feels easy (Ability), and they see a clear button (Prompt) at the same time.',
    badgeBg: 'bg-[#E6F4EE] text-[#245E46]',
  },
];

export const PlainLanguageDrawer: React.FC<PlainLanguageDrawerProps> = ({
  open,
  onClose,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  const cleanQuery = query.trim().toLowerCase();
  const filtered = cleanQuery
    ? GLOSSARY.filter(
        (g) =>
          g.term.toLowerCase().includes(cleanQuery) ||
          g.plainTitle.toLowerCase().includes(cleanQuery) ||
          g.businessMeaning.toLowerCase().includes(cleanQuery)
      )
    : GLOSSARY;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#1E293B]/20 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Side Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Plain Language Guide"
        className="relative z-10 w-full max-w-md bg-[#FAF9F6] border-l border-[#E8E6E1] h-full flex flex-col shadow-xl"
      >
        <div className="px-5 py-4 bg-white border-b border-[#E8E6E1] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#4C3D75]" />
            <h2 className="text-sm font-semibold text-[#1E293B]">
              Plain Language Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Plain Language Guide"
            className="p-1.5 rounded-lg text-[#526071] hover:text-[#1E293B] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-5 py-3 bg-white border-b border-[#E8E6E1]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#526071] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              maxLength={40}
              onChange={(e) =>
                setQuery(
                  e.target.value.length === 0
                    ? ''
                    : sanitizeLabel(e.target.value, 40)
                )
              }
              placeholder="Search any term (e.g. Subjective Norms)..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F6] border border-[#E8E6E1] rounded-lg text-[#1E293B] focus:outline-none focus:border-[#4C3D75]"
            />
          </div>
        </div>

        {/* Glossary Cards */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-xs text-[#526071] text-center py-8">
              No matching terms found.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.term}
                className="bg-white border border-[#E8E6E1] rounded-xl p-4 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded ${item.badgeBg}`}
                  >
                    {item.term}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#1E293B]">
                  {item.plainTitle}
                </h3>
                <p className="text-xs text-[#526071] leading-relaxed">
                  {item.businessMeaning}
                </p>
              </div>
            ))
          )}
        </div>
      </aside>
    </div>
  );
};
