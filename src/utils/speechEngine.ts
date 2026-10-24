/**
 * Speech Engine for Bilal King
 * Specializes in natural female voice synthesis with Rani Mukerji husky Bollywood persona,
 * robust mobile support, GC protection, and fallback voice resolution.
 */

import { VoicePersona } from '../types/assistant';

export interface VoiceOption {
  voice: SpeechSynthesisVoice;
  isHindi: boolean;
  isFemale: boolean;
  score: number;
}

let activeAudioElement: HTMLAudioElement | null = null;
// Module-level reference to prevent Chrome/Android garbage collection bug
let currentUtterance: SpeechSynthesisUtterance | null = null;
let speechWatchdogTimer: any = null;

// Clean text for speech synthesis (strip markdown, emojis, asterisks, URLs)
export function sanitizeTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/#+\s/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/https?:\/\/\S+/g, 'link')
    .replace(/[_~>]/g, ' ')
    // Remove emojis so TTS does not read emoji descriptions aloud
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
    // Strip bullet markers
    .replace(/^\s*[-*+]\s+/gm, '')
    // Normalize extra spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Unlock mobile audio gesture restrictions on initial tap
 */
export function unlockSpeechSynthesis() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.resume();
      const dummy = new SpeechSynthesisUtterance(' ');
      dummy.volume = 0.01;
      dummy.rate = 2.0;
      window.speechSynthesis.speak(dummy);
    } catch (e) {
      // Ignore
    }
  }
}

/**
 * Get all available browser voices, categorized and scored for female Hindi / Indian compatibility
 */
export function getAvailableVoices(): VoiceOption[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return [];
  }

  const voices = window.speechSynthesis.getVoices();
  return voices
    .map((voice) => {
      const name = voice.name.toLowerCase();
      const lang = voice.lang.toLowerCase();

      const isHindi = lang.startsWith('hi') || name.includes('hindi') || name.includes('हिन्दी');
      const isUrdu = lang.startsWith('ur') || name.includes('urdu') || name.includes('اردو');
      const isIndianEnglish = lang.includes('en-in') || lang.includes('en_in');

      const isFemale =
        name.includes('female') ||
        name.includes('महिला') ||
        name.includes('lekha') ||
        name.includes('neelja') ||
        name.includes('swara') ||
        name.includes('heera') ||
        name.includes('veena') ||
        name.includes('kiran') ||
        name.includes('raveena') ||
        name.includes('zira') ||
        name.includes('samantha') ||
        name.includes('kore') ||
        name.includes('natural') ||
        name.includes('kalpana') ||
        name.includes('priya') ||
        name.includes('aditi') ||
        name.includes('rani');

      let score = 0;

      // Ranking priorities for authentic natural female Hindi/Urdu delivery
      if (isHindi && isFemale) score += 100;
      else if (isHindi) score += 80;
      else if (isUrdu && isFemale) score += 75;
      else if (isUrdu) score += 65;
      else if (isIndianEnglish && isFemale) score += 60;
      else if (isIndianEnglish) score += 50;
      else if (isFemale) score += 30;

      if (name.includes('google') || name.includes('neural') || name.includes('natural') || name.includes('online')) {
        score += 20;
      }

      return { voice, isHindi, isFemale, score };
    })
    .sort((a, b) => b.score - a.score);
}

/**
 * Finds the optimal default female Hindi / Rani Mukerji style voice
 */
export function getBestFemaleHindiVoice(preferredURI?: string, persona?: VoicePersona): SpeechSynthesisVoice | null {
  const voiceOptions = getAvailableVoices();
  if (voiceOptions.length === 0) return null;

  if (preferredURI) {
    const found = voiceOptions.find((v) => v.voice.voiceURI === preferredURI);
    if (found) return found.voice;
  }

  // If Rani Mukerji persona is selected, prioritize voices with richer resonance (Lekha, Swara, Google Hindi, Veena)
  if (persona === 'rani-mukerji') {
    const raniFav = voiceOptions.find((v) => {
      const n = v.voice.name.toLowerCase();
      return (
        n.includes('lekha') ||
        n.includes('swara') ||
        (v.isHindi && v.isFemale) ||
        n.includes('veena') ||
        n.includes('heera')
      );
    });
    if (raniFav) return raniFav.voice;
  }

  // Return highest scored voice (female Hindi/Urdu priority)
  return voiceOptions[0]?.voice || null;
}

/**
 * Speak text using Web Speech API or Cloud TTS
 */
export async function speakAssistantMessage(
  text: string,
  options: {
    rate?: number;
    pitch?: number;
    preferredVoiceURI?: string;
    preferredEngine?: 'browser' | 'cloud';
    voicePersona?: VoicePersona;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (err: any) => void;
  } = {}
): Promise<void> {
  const {
    rate,
    pitch,
    preferredVoiceURI,
    preferredEngine = 'browser',
    voicePersona = 'rani-mukerji',
    onStart,
    onEnd,
    onError,
  } = options;

  stopSpeaking();

  const cleanText = sanitizeTextForSpeech(text);
  if (!cleanText) {
    onEnd?.();
    return;
  }

  // Acoustic tuning for Rani Mukerji: signature warm husky lower-mid pitch (~0.93) and expressive rate (1.0)
  const effectiveRate = rate !== undefined ? rate : (voicePersona === 'rani-mukerji' ? 1.0 : 1.05);
  const effectivePitch = pitch !== undefined ? pitch : (voicePersona === 'rani-mukerji' ? 0.93 : 1.05);

  // Try Cloud TTS if requested
  if (preferredEngine === 'cloud') {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: cleanText,
          voice: 'Kore',
          persona: voicePersona,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType || 'audio/wav'};base64,${data.audioBase64}`);
          activeAudioElement = audio;

          audio.onplay = () => onStart?.();
          audio.onended = () => {
            activeAudioElement = null;
            onEnd?.();
          };
          audio.onerror = (e) => {
            activeAudioElement = null;
            fallbackToWebSpeech(cleanText, effectiveRate, effectivePitch, preferredVoiceURI, voicePersona, onStart, onEnd, onError);
          };

          await audio.play();
          return;
        }
      }
    } catch (err) {
      console.warn('Cloud TTS fallback invoked:', err);
    }
  }

  // Web Speech API execution
  fallbackToWebSpeech(cleanText, effectiveRate, effectivePitch, preferredVoiceURI, voicePersona, onStart, onEnd, onError);
}

function fallbackToWebSpeech(
  text: string,
  rate: number,
  pitch: number,
  preferredVoiceURI: string | undefined,
  persona: VoicePersona | undefined,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.(new Error('Speech Synthesis not supported in this browser.'));
    onEnd?.();
    return;
  }

  if (speechWatchdogTimer) {
    clearTimeout(speechWatchdogTimer);
    speechWatchdogTimer = null;
  }

  window.speechSynthesis.cancel();

  // Small delay to prevent Chrome cancel-on-speak race condition
  setTimeout(() => {
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance; // Prevent Garbage Collection!

      const voice = getBestFemaleHindiVoice(preferredVoiceURI, persona);

      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || 'hi-IN';
      } else {
        // Fallback: check if any browser voice is available
        const allVoices = window.speechSynthesis.getVoices();
        if (allVoices.length > 0) {
          const matched =
            allVoices.find((v) => v.lang.startsWith('hi') || v.lang.startsWith('ur')) ||
            allVoices.find((v) => v.lang.includes('en-IN') || v.lang.includes('en_IN')) ||
            allVoices.find((v) => v.name.toLowerCase().includes('female')) ||
            allVoices[0];
          utterance.voice = matched;
          utterance.lang = matched.lang;
        } else {
          utterance.lang = 'hi-IN';
        }
      }

      utterance.rate = Math.max(0.8, Math.min(1.3, rate));
      utterance.pitch = Math.max(0.8, Math.min(1.3, pitch));

      let hasCompleted = false;

      const finish = () => {
        if (!hasCompleted) {
          hasCompleted = true;
          if (speechWatchdogTimer) {
            clearTimeout(speechWatchdogTimer);
            speechWatchdogTimer = null;
          }
          currentUtterance = null;
          onEnd?.();
        }
      };

      utterance.onstart = () => {
        onStart?.();

        // Android Chrome workaround: speech can get stuck, so periodically resume
        const resumeInterval = setInterval(() => {
          if (!hasCompleted && window.speechSynthesis.speaking) {
            window.speechSynthesis.resume();
          } else {
            clearInterval(resumeInterval);
          }
        }, 3000);
      };

      utterance.onend = () => {
        finish();
      };

      utterance.onerror = (event) => {
        if (event.error !== 'interrupted' && event.error !== 'canceled') {
          console.warn('SpeechSynthesis event error:', event.error);
          onError?.(event);
        }
        finish();
      };

      // Watchdog timer: estimated duration + 4s timeout so state never gets permanently stuck
      const wordCount = text.split(/\s+/).length;
      const expectedDurationMs = Math.max(4000, (wordCount / 2.2) * 1000 + 3000);
      speechWatchdogTimer = setTimeout(() => {
        if (!hasCompleted && currentUtterance === utterance) {
          console.warn('Speech watchdog timer triggered recovery');
          window.speechSynthesis.cancel();
          finish();
        }
      }, expectedDurationMs);

      window.speechSynthesis.speak(utterance);
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (e) {
      console.error('Failed to speak with Web Speech API:', e);
      onError?.(e);
      onEnd?.();
    }
  }, 40);
}

/**
 * Stop any ongoing speech playback immediately
 */
export function stopSpeaking() {
  if (typeof window !== 'undefined') {
    if (speechWatchdogTimer) {
      clearTimeout(speechWatchdogTimer);
      speechWatchdogTimer = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    currentUtterance = null;
    if (activeAudioElement) {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement = null;
    }
  }
}

/**
 * Check if speech is currently active
 */
export function isCurrentlySpeaking(): boolean {
  if (typeof window === 'undefined') return false;
  const synthSpeaking = 'speechSynthesis' in window && window.speechSynthesis.speaking;
  const audioPlaying = activeAudioElement !== null && !activeAudioElement.paused;
  return synthSpeaking || audioPlaying;
}
