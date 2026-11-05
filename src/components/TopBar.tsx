import React from 'react';
import { RotateCw } from 'lucide-react';

export type ActiveTab = 'simulator' | 'compare' | 'agents' | 'presets';

interface TopBarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onRunSimulation: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'simulator', label: 'Simulator' },
  { id: 'compare', label: 'Compare A vs B' },
  { id: 'agents', label: 'Test Crowd' },
  { id: 'presets', label: 'Ideas' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  onSelectTab,
  onRunSimulation,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F6]/95 backdrop-blur-xs border-b border-[#E8E6E1]">
      <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectTab('simulator')}
          className="text-lg font-bold tracking-tight text-[#1E293B] whitespace-nowrap shrink-0 cursor-pointer"
        >
          NudgeLab
        </button>

        <nav
          aria-label="Primary Navigation"
          className="flex items-center gap-6 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`text-sm font-medium whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                  isActive
                    ? 'border-[#4C3D75] text-[#1E293B]'
                    : 'border-transparent text-[#526071] hover:text-[#1E293B]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="shrink-0">
          <button
            type="button"
            onClick={onRunSimulation}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#EFEBF9] text-[#4C3D75] hover:bg-[#E4DDF6] text-xs font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Re-Run Test</span>
          </button>
        </div>
      </div>
    </header>
  );
};
