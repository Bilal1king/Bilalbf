import React, { useState } from 'react';
import { X, Phone, PhoneCall, PhoneIncoming, PhoneMissed, ArrowLeft, Delete, User, Bell } from 'lucide-react';

export interface CallLogItem {
  id: string;
  name: string;
  number: string;
  time: string;
  type: 'incoming' | 'missed' | 'outgoing';
}

interface PhoneCallManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onMakeCall: (number: string, name?: string) => void;
  recentCalls: CallLogItem[];
}

export const PhoneCallManager: React.FC<PhoneCallManagerProps> = ({
  isOpen,
  onClose,
  onMakeCall,
  recentCalls,
}) => {
  const [dialedNumber, setDialedNumber] = useState('');
  const [activeTab, setActiveTab] = useState<'dialer' | 'recents'>('dialer');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    setDialedNumber((prev) => prev + digit);
  };

  const handleDelete = () => {
    setDialedNumber((prev) => prev.slice(0, -1));
  };

  const handleCall = () => {
    if (dialedNumber.trim()) {
      onMakeCall(dialedNumber.trim());
    } else {
      window.location.href = 'tel:';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-sm bg-slate-950 border border-cyan-500/40 rounded-3xl p-5 shadow-2xl glow-cyan-box flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-400/50 flex items-center justify-center">
              <Phone className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-orbitron font-bold text-sm text-slate-100">BF AI PHONE DIALER</h2>
              <span className="text-[10px] font-rajdhani text-cyan-400">Mobile Calls & Notifications</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 gap-1 bg-slate-900/80 rounded-xl mb-4 text-xs font-rajdhani font-bold">
          <button
            onClick={() => setActiveTab('dialer')}
            className={`py-1.5 rounded-lg transition-all ${
              activeTab === 'dialer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            DIALPAD
          </button>
          <button
            onClick={() => setActiveTab('recents')}
            className={`py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 ${
              activeTab === 'recents'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3 h-3 text-cyan-400" />
            <span>CALL LOG & ALERTS</span>
          </button>
        </div>

        {activeTab === 'dialer' && (
          <div className="flex flex-col flex-1 justify-between">
            {/* Number Display */}
            <div className="min-h-[3.5rem] bg-slate-900/60 rounded-2xl border border-cyan-500/30 flex items-center justify-between px-4 mb-4">
              <span className="font-mono font-bold text-2xl text-cyan-200 tracking-wider overflow-x-auto">
                {dialedNumber || <span className="text-slate-600 text-lg font-rajdhani">Number dial kijiye...</span>}
              </span>
              {dialedNumber && (
                <button onClick={handleDelete} className="p-1.5 text-slate-400 hover:text-red-400">
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Dialpad Matrix */}
            <div className="grid grid-cols-3 gap-2.5 my-2">
              {[
                { digit: '1', letters: '' },
                { digit: '2', letters: 'ABC' },
                { digit: '3', letters: 'DEF' },
                { digit: '4', letters: 'GHI' },
                { digit: '5', letters: 'JKL' },
                { digit: '6', letters: 'MNO' },
                { digit: '7', letters: 'PQRS' },
                { digit: '8', letters: 'TUV' },
                { digit: '9', letters: 'WXYZ' },
                { digit: '*', letters: '' },
                { digit: '0', letters: '+' },
                { digit: '#', letters: '' },
              ].map((k) => (
                <button
                  key={k.digit}
                  onClick={() => handleDigit(k.digit)}
                  className="flex flex-col items-center justify-center py-3 rounded-2xl bg-slate-900/90 hover:bg-cyan-950/80 border border-slate-800 hover:border-cyan-400 text-slate-100 transition-all active:scale-95 shadow-sm"
                >
                  <span className="font-orbitron font-bold text-xl">{k.digit}</span>
                  {k.letters && <span className="text-[9px] font-mono text-cyan-400/80 tracking-widest">{k.letters}</span>}
                </button>
              ))}
            </div>

            {/* Call Action Button */}
            <div className="mt-3">
              <button
                onClick={handleCall}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-rajdhani font-bold text-sm tracking-widest uppercase transition-all shadow-lg shadow-emerald-500/30 active:scale-95 cursor-pointer"
              >
                <PhoneCall className="w-5 h-5 fill-slate-950" />
                <span>DIRECT CALL</span>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'recents' && (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {recentCalls.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-10">Koi call notification nahi hai.</p>
            ) : (
              recentCalls.map((call) => (
                <div
                  key={call.id}
                  className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between gap-2 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        call.type === 'missed'
                          ? 'bg-red-950/80 border border-red-500/40 text-red-400'
                          : 'bg-cyan-950/80 border border-cyan-500/40 text-cyan-400'
                      }`}
                    >
                      {call.type === 'missed' ? (
                        <PhoneMissed className="w-4 h-4" />
                      ) : (
                        <PhoneIncoming className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-slate-100">{call.name}</p>
                      <p className="font-mono text-[10px] text-slate-400">{call.number}</p>
                      <span className="text-[9px] font-rajdhani text-cyan-400">{call.time}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onMakeCall(call.number, call.name)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-xs font-rajdhani font-bold flex items-center gap-1 hover:bg-emerald-500/30 transition-all active:scale-95"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>CALL BACK</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
