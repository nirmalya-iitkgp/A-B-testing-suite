import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface TooltipProps {
  text: string;
  align?: 'left' | 'right' | 'center';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, align = 'center' }) => {
  const [open, setOpen] = useState(false);

  const posClass =
    align === 'left'
      ? 'left-0'
      : align === 'right'
        ? 'right-0'
        : 'left-1/2 -translate-x-1/2';

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={text}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[#526071] hover:text-[#1E293B] focus-visible:outline-2 focus-visible:outline-[#4C3D75] transition-colors cursor-help"
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>

      {open && (
        <span
          role="tooltip"
          className={`pointer-events-none absolute bottom-full mb-2 z-50 w-64 rounded-lg bg-[#1E293B] text-white text-xs leading-relaxed px-3 py-2 shadow-md ${posClass}`}
        >
          {text}
        </span>
      )}
    </span>
  );
};
