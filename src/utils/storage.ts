import { AssistantSettings, Message, NoteItem, ReminderItem } from '../types/assistant';

const SETTINGS_KEY = 'bilal_king_settings_v4';
const MESSAGES_KEY = 'bilal_king_messages_v4';
const REMINDERS_KEY = 'bilal_king_reminders_v4';
const NOTES_KEY = 'bilal_king_notes_v4';

export const DEFAULT_SETTINGS: AssistantSettings = {
  autoSpeak: true,
  continuousMode: true, // Unlimited continuous hands-free listening loop enabled
  selectedVoiceURI: '',
  speechRate: 1.0,
  speechPitch: 1.0, // Natural, professional female voice
  voicePersona: 'jarvis-kore',
  inputLanguage: 'hi-IN', // Excellent for catching Hindi, Urdu, and Hinglish speech
  soundEffects: true,
  preferredEngine: 'browser',
};

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'init-1',
    role: 'model',
    text: 'Assalam-o-Alaikum Boss! Main Bilal King hoon, aapka BF AI personal assistant. Main aapki kya madad kar sakti hoon?',
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    detectedLang: 'hinglish',
  },
];

export function loadSettings(): AssistantSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: AssistantSettings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings', e);
  }
}

export function loadStoredMessages(): Message[] {
  if (typeof window === 'undefined') return INITIAL_MESSAGES;
  try {
    const raw = localStorage.getItem(MESSAGES_KEY);
    return raw ? JSON.parse(raw) : INITIAL_MESSAGES;
  } catch (e) {
    return INITIAL_MESSAGES;
  }
}

export function saveStoredMessages(messages: Message[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages.slice(-40)));
  } catch (e) {
    console.error('Failed to save messages', e);
  }
}

export function loadReminders(): ReminderItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveReminders(reminders: ReminderItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  } catch (e) {
    console.error('Failed to save reminders', e);
  }
}

export function loadNotes(): NoteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveNotes(notes: NoteItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
  } catch (e) {
    console.error('Failed to save notes', e);
  }
}
