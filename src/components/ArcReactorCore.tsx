import React from 'react';
import { Mic, Square, Sparkles } from 'lucide-react';
import { WaveformVisualizer } from './WaveformVisualizer';
import bfAi3dSphere from '../assets/images/bf_ai_3d_sphere_1792862100016.jpg';

interface ArcReactorCoreProps {
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isHandsFreeActive: boolean;
  onToggleCore: () => void;
  onStopAll: () => void;
  liveTranscript: string;
  lastAssistantReply: string;
  assistantStatus: string;
}

export const ArcReactorCore: React.FC<ArcReactorCoreProps> = ({
  isListening,
  isSpeaking,
  isProcessing,
  isHandsFreeActive,
  onToggleCore,
  liveTranscript,
  lastAssistantReply,
}) => {
  // Determine core glow state & theme colors
  let glowClasses = 'shadow-[0_0_40px_rgba(0,240,255,0.4)] border-cyan-400';

  if (isSpeaking) {
    glowClasses = 'shadow-[0_0_60px_rgba(56,189,248,0.8)] border-sky-400 animate-pulse';
  } else if (isListening) {
    glowClasses = 'shadow-[0_0_60px_rgba(16,185,129,0.85)] border-emerald-400 animate-pulse';
  } else if (isProcessing) {
    glowClasses = 'shadow-[0_0_50px_rgba(168,85,247,0.7)] border-purple-400';
  }

  return (
    <div className="flex flex-col items-center justify-center w-full px-3 py-2 select-none">
      {/* 3D Cybernetic BF AI Core Stage */}
      <div className="relative flex items-center justify-center w-72 h-72 sm:w-80 sm:h-80 my-2">
        {/* Outermost Compass Ring */}
        <div className="absolute inset-0 rounded-full border border-dashed border-cyan-500/25 animate-spin-slow pointer-events-none" />

        {/* Outer Rotating Segmented Tech Ring */}
        <div
          className={`absolute w-64 h-64 sm:w-72 sm:h-72 rounded-full border-2 border-t-cyan-400 border-r-transparent border-b-sky-500 border-l-transparent transition-colors duration-500 pointer-events-none ${
            isProcessing ? 'animate-spin' : 'animate-spin-slow'
          }`}
        />

        {/* Counter-Rotating Segmented Tech Ring */}
        <div
          className={`absolute w-52 h-52 sm:w-60 sm:h-60 rounded-full border border-b-2 border-cyan-300 opacity-60 pointer-events-none animate-spin-reverse`}
        />

        {/* Ambient Pulsing Glow Halo */}
        <div
          className={`absolute w-44 h-44 sm:w-48 sm:h-48 rounded-full blur-2xl opacity-50 transition-all duration-500 ${
            isSpeaking
              ? 'bg-sky-400'
              : isListening
              ? 'bg-emerald-400'
              : isProcessing
              ? 'bg-purple-500'
              : 'bg-cyan-500'
          }`}
        />

        {/* Central 3D Cybernetic Sphere Core Button */}
        <button
          onClick={onToggleCore}
          aria-label={isSpeaking ? 'Stop' : isListening ? 'Listening' : 'Start'}
          className={`relative z-10 flex flex-col items-center justify-center w-40 h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden border-2 transition-all duration-300 transform active:scale-95 cursor-pointer ${glowClasses}`}
        >
          {/* 3D Cybernetic Sphere Image */}
          <img
            src={bfAi3dSphere}
            alt="3D BF AI Core Sphere"
            className={`w-full h-full object-cover transition-transform duration-700 ${
              isSpeaking
                ? 'scale-110 filter brightness-115 contrast-125'
                : isListening
                ? 'scale-110 filter brightness-125'
                : isProcessing
                ? 'scale-105 animate-pulse'
                : 'scale-100 hover:scale-105'
            }`}
          />

          {/* Central Overlay HUD & Status Action */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 flex flex-col items-center justify-between p-3">
            <span className="text-[9px] font-orbitron font-bold tracking-widest text-cyan-300 uppercase">
              {isSpeaking ? 'SPEAKING' : isListening ? 'LISTENING' : isProcessing ? 'THINKING' : 'TAP TO TALK'}
            </span>

            <div className="flex items-center justify-center">
              {isSpeaking ? (
                <Square className="w-8 h-8 text-sky-300 fill-sky-300/40 drop-shadow-[0_0_12px_rgba(56,189,248,1)]" />
              ) : isListening ? (
                <Mic className="w-8 h-8 text-emerald-300 animate-bounce drop-shadow-[0_0_12px_rgba(52,211,153,1)]" />
              ) : isProcessing ? (
                <Sparkles className="w-8 h-8 text-purple-300 animate-spin drop-shadow-[0_0_12px_rgba(192,132,252,1)]" />
              ) : (
                <Mic className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              )}
            </div>

            <span className="text-[9px] font-orbitron font-extrabold tracking-widest text-cyan-200 uppercase bg-black/60 px-2.5 py-0.5 rounded-full border border-cyan-500/40">
              BF AI
            </span>
          </div>
        </button>

        {/* Telemetry Degree Markers */}
        <span className="absolute top-1 text-[8px] font-mono text-cyan-400/50 tracking-wider">000°</span>
        <span className="absolute right-1 text-[8px] font-mono text-cyan-400/50 tracking-wider">090°</span>
        <span className="absolute bottom-1 text-[8px] font-mono text-cyan-400/50 tracking-wider">180°</span>
        <span className="absolute left-1 text-[8px] font-mono text-cyan-400/50 tracking-wider">270°</span>
      </div>

      {/* Reactive Equalizer Waveform */}
      <WaveformVisualizer isListening={isListening} isSpeaking={isSpeaking} />

      {/* Clean Uncluttered Subtitle Box (All falto text removed) */}
      <div className="w-full max-w-lg min-h-[4rem] bg-slate-950/80 backdrop-blur-md rounded-2xl border border-cyan-500/30 p-3 shadow-xl flex flex-col justify-center my-2">
        {isListening ? (
          <div className="flex flex-col items-center text-center">
            <p className="text-sm sm:text-base text-slate-100 font-medium italic">
              {liveTranscript ? `"${liveTranscript}"` : 'Listening...'}
            </p>
          </div>
        ) : isProcessing ? (
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-cyan-200 animate-pulse font-mono">
              Processing...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <p className="text-sm text-slate-200 line-clamp-2 font-medium">
              {lastAssistantReply || 'BF AI ready hai Boss.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
