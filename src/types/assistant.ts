export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  detectedLang?: 'hi' | 'ur' | 'en' | 'hinglish';
  isSpeaking?: boolean;
}

export interface ReminderItem {
  id: string;
  title: string;
  datetime: string; // ISO string
  completed: boolean;
  notified: boolean;
}

export interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
}

export interface ActiveTimer {
  id: string;
  totalSeconds: number;
  remainingSeconds: number;
  label: string;
  isRunning: boolean;
}

export type VoicePersona = 'rani-mukerji' | 'jarvis-kore' | 'natural-hindi';

export interface AssistantSettings {
  autoSpeak: boolean;
  continuousMode: boolean; // Continuous voice banter (Hands-free JARVIS mode)
  selectedVoiceURI: string;
  speechRate: number; // 0.8 to 1.5
  speechPitch: number; // 0.8 to 1.3
  voicePersona: VoicePersona; // Rani Mukerji, Kore, or Natural
  inputLanguage: string; // 'hi-IN' | 'ur-PK' | 'en-IN' | 'en-US'
  soundEffects: boolean;
  preferredEngine: 'browser' | 'cloud'; // 'browser' = Web Speech API (Female Hindi), 'cloud' = Gemini TTS
}
