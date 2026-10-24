import React from 'react';
import { Sparkles, Youtube, Image, Flame, Battery, Music, Bell } from 'lucide-react';

interface QuickPromptsBarProps {
  onSelectPrompt: (promptText: string) => void;
  disabled?: boolean;
}

const PROMPT_CHIPS = [
  { label: '🎬 Song Chalao', text: 'YouTube par Arijit Singh ka song chala do' },
  { label: '🖼️ Gallery Kholo', text: 'Gallery open karo' },
  { label: '🔦 Torch Jalao', text: 'Torch on karo' },
  { label: '🔋 Battery Kitni Hai', text: 'Battery kitni charge hai?' },
  { label: '📜 Shayari Sunao', text: 'Ek khoobsurat Urdu shayari sunao' },
  { label: '⏰ 5 Min Timer', text: '5 minute ka timer laga do' },
  { label: '💬 WhatsApp Bhejo', text: 'WhatsApp par message bhejo: Hello Boss' },
  { label: '💡 Bilal King Intro', text: 'Bilal King aap kya kya kar sakti ho?' },
];

export const QuickPromptsBar: React.FC<QuickPromptsBarProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto px-3 py-1.5">
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {PROMPT_CHIPS.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(chip.text)}
            disabled={disabled}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-rajdhani font-bold bg-slate-900/90 hover:bg-cyan-950/90 border border-cyan-500/40 hover:border-cyan-400 text-slate-200 hover:text-cyan-200 transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-sm"
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
};
