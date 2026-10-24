import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Settings, MessageSquare, Mic, BatteryCharging, Wrench, Phone } from 'lucide-react';
import { AssistantSettings } from '../types/assistant';
import bfAiLogo from '../assets/images/bf_ai_brand_logo_1792862100211.jpg';

interface HeaderHUDProps {
  settings: AssistantSettings;
  activeView: 'core' | 'chat';
  onToggleView: (view: 'core' | 'chat') => void;
  onOpenSettings: () => void;
  onOpenTools: () => void;
  onOpenDialer?: () => void;
  onToggleMute: () => void;
  isSpeaking: boolean;
  isListening: boolean;
  assistantStatus: string;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  settings,
  activeView,
  onToggleView,
  onOpenSettings,
  onOpenTools,
  onOpenDialer,
  onToggleMute,
  isSpeaking,
  isListening,
  assistantStatus,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number>(98);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-US', {
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any)
        .getBattery()
        .then((battery: any) => {
          setBatteryLevel(Math.round(battery.level * 100));
          battery.addEventListener('levelchange', () => {
            setBatteryLevel(Math.round(battery.level * 100));
          });
        })
        .catch(() => {});
    }
  }, []);

  return (
    <header className="w-full bg-slate-950/90 backdrop-blur-md border-b border-cyan-500/20 px-3 py-2 z-30 transition-all select-none">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-2">
        {/* Assistant BF AI Logo Branding */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl overflow-hidden border border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.45)] flex-shrink-0">
            <img src={bfAiLogo} alt="BF AI Logo" className="w-full h-full object-cover" />
            <span
              className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${
                isSpeaking
                  ? 'bg-sky-400 animate-ping'
                  : isListening
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-cyan-400'
              }`}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-orbitron font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                BILAL KING
              </span>
              <span className="text-[10px] font-orbitron font-bold px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-400/50 text-cyan-300">
                BF AI
              </span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-rajdhani">
              <span className="text-cyan-400/90 font-mono tracking-widest">{timeStr || '00:00:00'}</span>
              <span>•</span>
              <span className="flex items-center gap-0.5 text-slate-300">
                <BatteryCharging className="w-2.5 h-2.5 text-cyan-400" />
                {batteryLevel}%
              </span>
              <span>•</span>
              <span className="text-cyan-300 uppercase tracking-wider font-semibold">BF AI // ACTIVE</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Phone Dialer Trigger */}
          <button
            onClick={onOpenDialer}
            title="Open Phone Dialer"
            className="p-1.5 rounded-lg bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 transition-all flex items-center gap-1 text-xs font-rajdhani font-bold"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">DIALER</span>
          </button>

          {/* Switch View Toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-slate-900 border border-cyan-500/30">
            <button
              onClick={() => onToggleView('core')}
              title="3D Core"
              className={`p-1.5 px-2 rounded text-xs font-rajdhani font-semibold transition-all ${
                activeView === 'core'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onToggleView('chat')}
              title="Conversation Log"
              className={`p-1.5 px-2 rounded text-xs font-rajdhani font-semibold transition-all ${
                activeView === 'chat'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Tools Drawer Button */}
          <button
            onClick={onOpenTools}
            title="Tools & Reminders"
            className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-cyan-400 hover:border-cyan-400 transition-all"
          >
            <Wrench className="w-4 h-4" />
          </button>

          {/* Mute / Unmute */}
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded-lg border transition-all ${
              settings.autoSpeak
                ? 'bg-cyan-950/60 border-cyan-500/50 text-cyan-300'
                : 'bg-slate-900 border-red-500/40 text-red-400'
            }`}
          >
            {settings.autoSpeak ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Modal Button */}
          <button
            onClick={onOpenSettings}
            title="Settings"
            className="p-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 text-slate-300 hover:text-cyan-300 transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
