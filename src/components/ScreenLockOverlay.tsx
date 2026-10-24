import React, { useState, useEffect } from 'react';
import { Lock, Unlock, Fingerprint, ShieldAlert, Sparkles } from 'lucide-react';

interface ScreenLockOverlayProps {
  isLocked: boolean;
  onUnlock: () => void;
}

export const ScreenLockOverlay: React.FC<ScreenLockOverlayProps> = ({
  isLocked,
  onUnlock,
}) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      );
      setDateStr(
        now.toLocaleDateString('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isLocked) return null;

  return (
    <div
      onClick={onUnlock}
      className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-between p-6 select-none cursor-pointer animate-fade-in"
    >
      {/* Top Lock Status */}
      <div className="flex flex-col items-center gap-1 mt-6">
        <div className="w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center glow-cyan-box animate-pulse">
          <Lock className="w-5 h-5 text-cyan-400" />
        </div>
        <span className="text-[10px] font-orbitron tracking-widest text-cyan-400 mt-1 uppercase">
          BF AI • PHONE LOCKED
        </span>
      </div>

      {/* Center Clock */}
      <div className="flex flex-col items-center text-center my-auto">
        <div className="text-6xl sm:text-7xl font-mono font-extrabold text-white tracking-widest drop-shadow-[0_0_20px_rgba(0,240,255,0.4)]">
          {timeStr}
        </div>
        <p className="text-sm font-rajdhani font-bold text-cyan-300 mt-2 uppercase tracking-widest">
          {dateStr}
        </p>
      </div>

      {/* Bottom Unlock Trigger */}
      <div className="flex flex-col items-center gap-3 mb-6">
        <div className="w-16 h-16 rounded-full border border-cyan-400/60 bg-cyan-950/40 flex items-center justify-center animate-pulse glow-cyan-box">
          <Fingerprint className="w-8 h-8 text-cyan-300" />
        </div>
        <p className="text-xs font-rajdhani font-bold tracking-widest text-slate-300 uppercase">
          Tap Anywhere to Unlock Phone
        </p>
      </div>
    </div>
  );
};
