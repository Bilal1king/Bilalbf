/**
 * Web Speech Recognition helper for Bilal King
 * Supports Hindi, Urdu, and English/Hinglish voice input on mobile and desktop browsers.
 */

export interface SpeechRecognitionListener {
  onStart?: () => void;
  onResult?: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

let recognitionInstance: any = null;
let isManuallyStopped = false;

export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
}

export function startListening(
  options: {
    language?: string;
    continuous?: boolean;
    interimResults?: boolean;
  },
  listener: SpeechRecognitionListener
): boolean {
  if (!isSpeechRecognitionSupported()) {
    listener.onError?.('Voice recognition is not supported in this browser. Please use Google Chrome or a Chromium browser.');
    return false;
  }

  isManuallyStopped = false;
  stopListening();

  try {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    // Default to 'hi-IN' which recognizes Hindi, Urdu words, and English seamlessly
    recognition.lang = options.language || 'hi-IN';
    recognition.continuous = options.continuous ?? false;
    recognition.interimResults = options.interimResults ?? true;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      listener.onStart?.();
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const item = event.results[i];
        if (item.isFinal) {
          finalTranscript += item[0].transcript;
        } else {
          interimTranscript += item[0].transcript;
        }
      }

      if (finalTranscript) {
        listener.onResult?.(finalTranscript.trim(), true);
      } else if (interimTranscript) {
        listener.onResult?.(interimTranscript.trim(), false);
      }
    };

    recognition.onerror = (event: any) => {
      // Silence or normal abort shouldn't throw loud errors
      if (event.error === 'no-speech') {
        listener.onError?.('no-speech');
      } else if (event.error === 'not-allowed') {
        listener.onError?.('Microphone access denied. Kripya browser settings mein microphone allow kijiye.');
      } else if (event.error !== 'aborted') {
        listener.onError?.(`Speech error: ${event.error}`);
      }
    };

    recognition.onend = () => {
      recognitionInstance = null;
      listener.onEnd?.();
    };

    recognitionInstance = recognition;
    recognition.start();
    return true;
  } catch (err: any) {
    console.warn('Speech recognition start failed:', err);
    listener.onError?.(err?.message || 'Failed to start microphone');
    listener.onEnd?.();
    return false;
  }
}

export function stopListening() {
  isManuallyStopped = true;
  if (recognitionInstance) {
    try {
      recognitionInstance.abort();
    } catch (e) {
      // Ignore
    }
    recognitionInstance = null;
  }
}

export function isExplicitlyStopped(): boolean {
  return isManuallyStopped;
}
