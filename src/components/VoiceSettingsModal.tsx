import React, { useState, useEffect } from 'react';
import { X, Volume2, Mic, Play, Check, Sparkles, Sliders, Star, Heart } from 'lucide-react';
import { AssistantSettings, VoicePersona } from '../types/assistant';
import { getAvailableVoices, speakAssistantMessage, stopSpeaking, VoiceOption } from '../utils/speechEngine';

interface VoiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AssistantSettings;
  onUpdateSettings: (newSettings: AssistantSettings) => void;
}

export const VoiceSettingsModal: React.FC<VoiceSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isTestingVoice, setIsTestingVoice] = useState(false);

  useEffect(() => {
    const updateVoices = () => {
      const v = getAvailableVoices();
      setVoices(v);
    };

    updateVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, []);

  if (!isOpen) return null;

  const handleTestVoice = async () => {
    setIsTestingVoice(true);
    const testText =
      settings.voicePersona === 'rani-mukerji'
        ? 'Main hoon Bilal King, Rani Mukerji ke signature husky aur warm andaaz mein! Kahiye Boss, main aapki kya madad kar sakti hoon?'
        : 'Assalam-o-Alaikum Boss! Main Bilal King hoon, aapka personal AI assistant. Main bilkul ready hoon!';

    await speakAssistantMessage(testText, {
      rate: settings.speechRate,
      pitch: settings.speechPitch,
      preferredVoiceURI: settings.selectedVoiceURI,
      preferredEngine: settings.preferredEngine,
      voicePersona: settings.voicePersona,
      onEnd: () => setIsTestingVoice(false),
      onError: () => setIsTestingVoice(false),
    });
  };

  const handleStopTest = () => {
    stopSpeaking();
    setIsTestingVoice(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-950 border border-cyan-500/40 rounded-2xl p-5 shadow-2xl glow-cyan-box max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/20">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="font-orbitron font-bold text-base sm:text-lg text-slate-100">
              VOICE & ASSISTANT SETTINGS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm">
          {/* Voice Persona Selector (Rani Mukerji Featured) */}
          <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-500/30 glow-cyan-box">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-rajdhani font-bold text-cyan-300 uppercase flex items-center gap-1.5">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Voice Persona / Andaaz</span>
              </label>
              {settings.voicePersona === 'rani-mukerji' && (
                <span className="text-[10px] font-rajdhani font-bold text-amber-300 bg-amber-950/80 border border-amber-500/50 px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
                  <Heart className="w-3 h-3 text-rose-400 fill-rose-400" />
                  RANI MUKERJI ACTIVE
                </span>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Persona 1: Rani Mukerji */}
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    voicePersona: 'rani-mukerji',
                    speechPitch: 0.93,
                    speechRate: 1.0,
                  })
                }
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs text-center transition-all ${
                  settings.voicePersona === 'rani-mukerji'
                    ? 'border-amber-400 bg-amber-950/60 text-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.4)] ring-1 ring-amber-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  👑 Rani Mukerji
                </span>
                <span className="text-[10px] text-amber-200/80 mt-0.5">Husky & Charming</span>
              </button>

              {/* Persona 2: JARVIS Kore */}
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    voicePersona: 'jarvis-kore',
                    speechPitch: 1.05,
                    speechRate: 1.05,
                  })
                }
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs text-center transition-all ${
                  settings.voicePersona === 'jarvis-kore'
                    ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200 shadow-[0_0_15px_rgba(0,240,255,0.4)] ring-1 ring-cyan-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-cyan-300">⚡ Kore JARVIS</span>
                <span className="text-[10px] text-cyan-200/80 mt-0.5">Crisp Neural AI</span>
              </button>

              {/* Persona 3: Standard Natural */}
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({
                    ...settings,
                    voicePersona: 'natural-hindi',
                    speechPitch: 1.0,
                    speechRate: 1.0,
                  })
                }
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs text-center transition-all ${
                  settings.voicePersona === 'natural-hindi'
                    ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200 shadow-[0_0_15px_rgba(16,185,129,0.4)] ring-1 ring-emerald-400'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-bold text-emerald-300">🇮🇳 Hindi Female</span>
                <span className="text-[10px] text-emerald-200/80 mt-0.5">Natural Clean</span>
              </button>
            </div>
          </div>

          {/* TTS Engine Selection */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="block text-xs font-rajdhani font-bold text-cyan-300 uppercase mb-2">
              Speech Synthesis Engine
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, preferredEngine: 'browser' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                  settings.preferredEngine === 'browser'
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 glow-cyan-box'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-semibold text-slate-100">Native Female Voice</span>
                <span className="text-[10px] text-cyan-300/80 mt-0.5">Instant • Zero Latency</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateSettings({ ...settings, preferredEngine: 'cloud' })}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-xs transition-all ${
                  settings.preferredEngine === 'cloud'
                    ? 'border-cyan-400 bg-cyan-950/70 text-cyan-200 glow-cyan-box'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-semibold text-slate-100">Gemini Neural TTS</span>
                <span className="text-[10px] text-cyan-300/80 mt-0.5">Kore Neural Female</span>
              </button>
            </div>
          </div>

          {/* Voice Selector Dropdown (When Browser Engine is active) */}
          {settings.preferredEngine === 'browser' && (
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <label className="block text-xs font-rajdhani font-bold text-cyan-300 uppercase mb-1.5">
                Physical Device Voice Selection
              </label>
              <select
                value={settings.selectedVoiceURI}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, selectedVoiceURI: e.target.value })
                }
                className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg p-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="">Auto Select (Rani Mukerji Style Female Voice)</option>
                {voices.map(({ voice, isHindi, isFemale }) => (
                  <option key={voice.voiceURI} value={voice.voiceURI}>
                    {isHindi ? '🇮🇳 [HINDI] ' : isFemale ? '👩 [FEMALE] ' : ''}
                    {voice.name} ({voice.lang})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-400 mt-1">
                Optimized for husky, expressive Roman Urdu and Hindi delivery.
              </p>
            </div>
          )}

          {/* Voice Modulation: Rate & Pitch */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
            <div>
              <div className="flex justify-between text-xs font-rajdhani font-bold text-slate-300 mb-1">
                <span>SPEECH SPEED (RATE)</span>
                <span className="text-cyan-400">{settings.speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.02"
                value={settings.speechRate}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, speechRate: parseFloat(e.target.value) })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-rajdhani font-bold text-slate-300 mb-1">
                <span>VOICE PITCH / HUSKINESS</span>
                <span className="text-amber-400 font-mono">
                  {settings.speechPitch.toFixed(2)}{' '}
                  {settings.speechPitch < 0.98 ? '(Husky / Rani Style)' : '(Standard)'}
                </span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.25"
                step="0.02"
                value={settings.speechPitch}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, speechPitch: parseFloat(e.target.value) })
                }
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Test Voice Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={isTestingVoice ? handleStopTest : handleTestVoice}
                className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-rajdhani font-bold text-xs uppercase tracking-wider transition-all shadow-md ${
                  isTestingVoice
                    ? 'bg-red-900/80 border border-red-500/60 text-red-100'
                    : 'bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-blue-500/20 border border-amber-400/50 text-amber-200 hover:border-amber-300'
                }`}
              >
                {isTestingVoice ? (
                  <>
                    <X className="w-4 h-4 text-red-400" />
                    <span>Stop Voice Test</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 text-amber-400" />
                    <span>
                      {settings.voicePersona === 'rani-mukerji'
                        ? 'Test Rani Mukerji Voice Sample'
                        : 'Test Voice Sample'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Speech Input Language */}
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
            <label className="block text-xs font-rajdhani font-bold text-cyan-300 uppercase mb-1.5">
              Microphone Speech Input Language
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
                { code: 'ur-PK', label: 'Urdu (اردو)' },
                { code: 'en-IN', label: 'Hinglish / Indian En' },
                { code: 'en-US', label: 'English (US)' },
              ].map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => onUpdateSettings({ ...settings, inputLanguage: lang.code })}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                    settings.inputLanguage === lang.code
                      ? 'border-cyan-400 bg-cyan-950/60 text-cyan-200'
                      : 'border-slate-800 bg-slate-950 text-slate-400'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive JARVIS Toggles */}
          <div className="space-y-2">
            {/* Auto speak response */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Auto-Speak Bilal King Answers
                </span>
                <span className="text-[11px] text-slate-400">
                  Read aloud all responses in Rani Mukerji style female voice
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSpeak}
                onChange={(e) => onUpdateSettings({ ...settings, autoSpeak: e.target.checked })}
                className="w-4 h-4 accent-cyan-400"
              />
            </label>

            {/* Continuous Hands-Free JARVIS Mode */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  Continuous Hands-Free Mode
                </span>
                <span className="text-[11px] text-slate-400">
                  Automatically listen again after Bilal King finishes speaking
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.continuousMode}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, continuousMode: e.target.checked })
                }
                className="w-4 h-4 accent-cyan-400"
              />
            </label>

            {/* Sound effects */}
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
              <div>
                <span className="text-xs font-semibold text-slate-200 block">
                  Sci-Fi Sound Effects & Chimes
                </span>
                <span className="text-[11px] text-slate-400">
                  Play futuristic audio cues on activation and responses
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.soundEffects}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, soundEffects: e.target.checked })
                }
                className="w-4 h-4 accent-cyan-400"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-cyan-500/20 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-cyan-500 to-blue-600 text-slate-950 font-rajdhani font-bold text-xs tracking-wider uppercase hover:opacity-95 transition-all shadow-lg shadow-cyan-500/25"
          >
            Save & Return to Core
          </button>
        </div>
      </div>
    </div>
  );
};
