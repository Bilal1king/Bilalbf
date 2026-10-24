/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic,
  Send,
  Sparkles,
  Volume2,
  Clock,
  Radio,
  Zap,
  Flame,
} from 'lucide-react';
import { ActiveTimer, AssistantSettings, Message, NoteItem, ReminderItem } from './types/assistant';
import {
  DEFAULT_SETTINGS,
  INITIAL_MESSAGES,
  loadNotes,
  loadReminders,
  loadSettings,
  loadStoredMessages,
  saveNotes,
  saveReminders,
  saveSettings,
  saveStoredMessages,
} from './utils/storage';
import {
  playActivationSound,
  playAlarmAlert,
  playListeningPing,
  playResponseChime,
  playTactileClick,
} from './utils/audioEffects';
import {
  isCurrentlySpeaking,
  speakAssistantMessage,
  stopSpeaking,
  unlockSpeechSynthesis,
} from './utils/speechEngine';
import {
  isSpeechRecognitionSupported,
  startListening,
  stopListening,
} from './utils/speechRecognition';
import {
  getDeviceBatteryInfo,
  requestScreenWakeLock,
  releaseScreenWakeLock,
  startBackgroundAudioKeepAlive,
  stopBackgroundAudioKeepAlive,
  toggleDeviceTorch,
} from './utils/backgroundEngine';
import { executeDirectVoiceAction } from './utils/directActionsEngine';
import { HeaderHUD } from './components/HeaderHUD';
import { ArcReactorCore } from './components/ArcReactorCore';
import { ChatTranscript } from './components/ChatTranscript';
import { VoiceSettingsModal } from './components/VoiceSettingsModal';
import { SmartToolsDrawer } from './components/SmartToolsDrawer';
import { PhoneCallManager, CallLogItem } from './components/PhoneCallManager';
import { ScreenLockOverlay } from './components/ScreenLockOverlay';

// Stop phrases in English, Urdu, and Hindi
const STOP_COMMANDS_REGEX = /^(stop|exit|pause|band ho jao|band karo|ruk jao|chup|so jao|khatam|alvida|bye|standby|cancel|shant ho jao)\b/i;

export default function App() {
  // Persistent States
  const [settings, setSettings] = useState<AssistantSettings>(loadSettings);
  const [messages, setMessages] = useState<Message[]>(loadStoredMessages);
  const [reminders, setReminders] = useState<ReminderItem[]>(loadReminders);
  const [notes, setNotes] = useState<NoteItem[]>(loadNotes);
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);

  // Runtime Assistant States
  const [activeView, setActiveView] = useState<'core' | 'chat'>('core');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isHandsFreeActive, setIsHandsFreeActive] = useState<boolean>(false);
  const [liveTranscript, setLiveTranscript] = useState<string>('');
  const [lastAssistantReply, setLastAssistantReply] = useState<string>(
    'Assalam-o-Alaikum Boss! Main BF AI hoon, aapka personal AI assistant.'
  );
  const [assistantStatus, setAssistantStatus] = useState<string>('ONLINE // BF AI READY');

  // Input, Modal & Mobile Hardware States
  const [textInput, setTextInput] = useState<string>('');
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isToolsOpen, setIsToolsOpen] = useState<boolean>(false);
  const [isDialerOpen, setIsDialerOpen] = useState<boolean>(false);
  const [isPhoneLocked, setIsPhoneLocked] = useState<boolean>(false);
  const [screenTorchActive, setScreenTorchActive] = useState<boolean>(false);

  // Call notifications & call log
  const [recentCalls, setRecentCalls] = useState<CallLogItem[]>([
    {
      id: 'call-1',
      name: 'Ali (Boss Friend)',
      number: '+92 300 9876543',
      time: '5 min ago',
      type: 'missed',
    },
    {
      id: 'call-2',
      name: 'Office VIP',
      number: '+92 321 4455667',
      time: '1 hr ago',
      type: 'incoming',
    },
    {
      id: 'call-3',
      name: 'Family Contact',
      number: '+92 333 1122334',
      time: 'Yesterday',
      type: 'outgoing',
    },
  ]);

  // Hidden gallery file input ref
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Refs for persistent cycle management
  const silenceTimerRef = useRef<any>(null);
  const restartListeningTimerRef = useRef<any>(null);
  const isHandsFreeRef = useRef<boolean>(false);
  const isSpeakingRef = useRef<boolean>(false);
  const isProcessingRef = useRef<boolean>(false);

  // Keep refs in sync with state for access in asynchronous audio & recognition callbacks
  useEffect(() => {
    isHandsFreeRef.current = isHandsFreeActive;
  }, [isHandsFreeActive]);

  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  useEffect(() => {
    isProcessingRef.current = isProcessing;
  }, [isProcessing]);

  // Save changes to local storage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveStoredMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveReminders(reminders);
  }, [reminders]);

  useEffect(() => {
    saveNotes(notes);
  }, [notes]);

  // Background mode & Screen Wake Lock lifecycle
  useEffect(() => {
    if (isHandsFreeActive) {
      requestScreenWakeLock();
      startBackgroundAudioKeepAlive();
    } else {
      releaseScreenWakeLock();
      stopBackgroundAudioKeepAlive();
    }

    return () => {
      releaseScreenWakeLock();
      stopBackgroundAudioKeepAlive();
    };
  }, [isHandsFreeActive]);

  // Preload and prime voices on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // Page Visibility handler to manage wake lock without auto-starting mic
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isHandsFreeRef.current) {
        requestScreenWakeLock();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle countdown timer tick
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev) return null;
        if (prev.remainingSeconds <= 1) {
          // Timer finished!
          clearInterval(interval);
          playAlarmAlert();
          const alertMessage = `Boss! Aapka ${prev.label || 'timer'} khatam ho gaya hai!`;
          if (settings.autoSpeak) {
            speakAssistantMessage(alertMessage, {
              rate: settings.speechRate,
              pitch: settings.speechPitch,
              preferredVoiceURI: settings.selectedVoiceURI,
              preferredEngine: settings.preferredEngine,
            });
          }
          return null;
        }
        return {
          ...prev,
          remainingSeconds: prev.remainingSeconds - 1,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer, settings]);

  // Handle scheduled reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date().getTime();
      let hasUpdate = false;

      const updated = reminders.map((rem) => {
        const remTime = new Date(rem.datetime).getTime();
        if (!rem.completed && !rem.notified && remTime <= now) {
          hasUpdate = true;
          playAlarmAlert();
          const spokenReminder = `Boss, aapko yaad dilana tha: ${rem.title}`;
          if (settings.autoSpeak) {
            speakAssistantMessage(spokenReminder, {
              rate: settings.speechRate,
              pitch: settings.speechPitch,
              preferredVoiceURI: settings.selectedVoiceURI,
              preferredEngine: settings.preferredEngine,
            });
          }
          return { ...rem, notified: true };
        }
        return rem;
      });

      if (hasUpdate) {
        setReminders(updated);
      }
    };

    const interval = setInterval(checkReminders, 15000);
    return () => clearInterval(interval);
  }, [reminders, settings]);

  // Speak a message with natural female Hindi/Urdu voice, then re-arm continuous listening if active
  const handleSpeak = useCallback(
    (textToSpeak: string, onSpeechDoneCallback?: () => void) => {
      if (!textToSpeak) return;

      const statusText =
        settings.voicePersona === 'rani-mukerji'
          ? 'SPEAKING // RANI MUKERJI'
          : 'SPEAKING // FEMALE VOICE';

      setIsSpeaking(true);
      isSpeakingRef.current = true;
      setAssistantStatus(statusText);

      speakAssistantMessage(textToSpeak, {
        rate: settings.speechRate,
        pitch: settings.speechPitch,
        preferredVoiceURI: settings.selectedVoiceURI,
        preferredEngine: settings.preferredEngine,
        voicePersona: settings.voicePersona,
        onStart: () => {
          setIsSpeaking(true);
          isSpeakingRef.current = true;
          setAssistantStatus(statusText);
        },
        onEnd: () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setAssistantStatus('STANDBY // READY');

          if (onSpeechDoneCallback) {
            onSpeechDoneCallback();
          }
        },
        onError: () => {
          setIsSpeaking(false);
          isSpeakingRef.current = false;
          setAssistantStatus('STANDBY // READY');
        },
      });
    },
    [settings]
  );

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
    isSpeakingRef.current = false;
    setAssistantStatus('STANDBY // READY');
    if (settings.soundEffects) playTactileClick();
  }, [settings.soundEffects]);

  // Exit continuous hands-free session completely
  const handleStopHandsFreeSession = useCallback((farewellMessage?: string) => {
    setIsHandsFreeActive(false);
    isHandsFreeRef.current = false;
    stopListening();
    setIsListening(false);

    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (restartListeningTimerRef.current) clearTimeout(restartListeningTimerRef.current);

    releaseScreenWakeLock();
    stopBackgroundAudioKeepAlive();

    const goodbye = farewellMessage || 'Theek hai Boss, main standby mode par ja raha hoon. Zaroorat ho toh bas tap kijiye!';
    setLastAssistantReply(goodbye);

    if (settings.autoSpeak) {
      handleSpeak(goodbye);
    } else {
      setAssistantStatus('STANDBY // READY');
    }
  }, [settings.autoSpeak, handleSpeak]);

  // Direct phone dialing and outgoing call handler
  const handleMakeCall = useCallback((phoneNumber: string, contactName?: string) => {
    const cleanNum = phoneNumber.replace(/[\s\-]/g, '');
    const newCall: CallLogItem = {
      id: `call-${Date.now()}`,
      name: contactName || `Call to ${cleanNum}`,
      number: cleanNum,
      time: 'Just now',
      type: 'outgoing',
    };
    setRecentCalls((prev) => [newCall, ...prev]);
    if (settings.soundEffects) playTactileClick();
    window.location.href = `tel:${cleanNum}`;
  }, [settings.soundEffects]);

  // Send message to Bilal King AI Core (with fast local tool execution first)
  const processUserMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim()) return;

      const cleanText = userText.trim();
      setLiveTranscript('');
      setIsListening(false);
      stopListening();

      if (silenceTimerRef.current) {
        clearTimeout(silenceTimerRef.current);
      }

      // 1. Check for Stop / Exit commands (Requirement #3)
      if (
        STOP_COMMANDS_REGEX.test(cleanText.toLowerCase()) ||
        cleanText.toLowerCase().includes('ruk jao') ||
        cleanText.toLowerCase().includes('band ho jao') ||
        cleanText.toLowerCase().includes('chup ho jao') ||
        cleanText.toLowerCase().includes('exit') ||
        cleanText.toLowerCase().includes('so jao')
      ) {
        handleStopSpeaking();
        handleStopHandsFreeSession('Theek hai Boss, main standby mode par ja raha hoon. Jab bhi bulana ho, bas tap kijiye!');
        return;
      }

      // Add user message to history
      const userMessageObj: Message = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: cleanText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMessageObj]);
      setIsProcessing(true);
      isProcessingRef.current = true;
      setAssistantStatus('COMPUTING // BILAL KING CORE');

      const lower = cleanText.toLowerCase();

      // Direct Automated Voice Actions (YouTube, Songs, Gallery, WhatsApp, Calls, Google, Mobile Lock, Dialer)
      const directAction = executeDirectVoiceAction(cleanText, {
        openGalleryPicker: () => {
          galleryInputRef.current?.click();
        },
        toggleTorch: async (turnOn) => {
          const res = await toggleDeviceTorch(turnOn);
          setScreenTorchActive(turnOn);
          return res.isOn;
        },
        startTimer: (secs, label) => {
          handleStartTimer(secs, label);
        },
        playCyberMusic: () => {
          window.open('https://www.youtube.com/results?search_query=Trending+Bollywood+Songs', '_blank');
        },
        lockScreen: () => {
          setIsPhoneLocked(true);
          releaseScreenWakeLock();
        },
        openDialer: () => {
          setIsDialerOpen(true);
        },
        makeCall: (phoneNum: string) => {
          handleMakeCall(phoneNum);
        },
        checkCallerNotification: () => {
          setIsDialerOpen(true);
          const missed = recentCalls.find((c) => c.type === 'missed') || recentCalls[0];
          return `Boss, ${missed.name} ki missed call aayi thi ${missed.time} par (${missed.number}). Kya aapko back call karni hai?`;
        },
        makeBackCall: () => {
          const lastCall = recentCalls[0];
          if (lastCall) {
            handleMakeCall(lastCall.number, lastCall.name);
          } else {
            window.location.href = 'tel:';
          }
        },
        appBack: () => {
          setIsDialerOpen(false);
          setIsSettingsOpen(false);
          setIsToolsOpen(false);
          setActiveView('core');
        },
      });

      if (directAction.handled) {
        const directMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: directAction.spokenResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, directMsg]);
        setLastAssistantReply(directAction.spokenResponse);
        setIsProcessing(false);
        isProcessingRef.current = false;

        if (settings.soundEffects) playActivationSound();
        if (settings.autoSpeak) {
          handleSpeak(directAction.spokenResponse);
        }
        return;
      }

      // 2. Fast Local Mobile Task Execution: Battery Check
      if (lower.includes('battery') || lower.includes('charging') || lower.includes('kitni charge hai')) {
        const batteryInfo = await getDeviceBatteryInfo();
        let batteryReply = `Boss, aapke phone ki battery ${batteryInfo.level}% hai.`;
        if (batteryInfo.charging) {
          batteryReply += ' Charger connected hai aur phone charge ho raha hai.';
        } else {
          batteryReply += ' Charger connected nahi hai.';
        }

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: batteryReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setLastAssistantReply(batteryReply);
        setIsProcessing(false);
        isProcessingRef.current = false;

        if (settings.soundEffects) playResponseChime();
        if (settings.autoSpeak) {
          handleSpeak(batteryReply);
        }
        return;
      }

      // 3. Fast Local Mobile Task Execution: Timer / Alarm
      const timerMatch = cleanText.match(/(\d+)\s*(minute|min|मिनट|sec|second)/i);
      if (timerMatch && (lower.includes('timer') || lower.includes('countdown') || lower.includes('laga do'))) {
        const amount = parseInt(timerMatch[1], 10);
        const isSecs = timerMatch[2].toLowerCase().startsWith('sec');
        const totalSecs = isSecs ? amount : amount * 60;

        if (!isNaN(totalSecs) && totalSecs > 0) {
          setActiveTimer({
            id: `timer-${Date.now()}`,
            totalSeconds: totalSecs,
            remainingSeconds: totalSecs,
            label: `${amount} ${isSecs ? 'second' : 'minute'} timer`,
            isRunning: true,
          });

          const timerReply = `Bilkul Boss, maine ${amount} ${isSecs ? 'second' : 'minute'} ka countdown timer shuru kar diya hai!`;
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            role: 'model',
            text: timerReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages((prev) => [...prev, aiMsg]);
          setLastAssistantReply(timerReply);
          setIsProcessing(false);
          isProcessingRef.current = false;

          if (settings.soundEffects) playActivationSound();
          if (settings.autoSpeak) {
            handleSpeak(timerReply);
          }
          return;
        }
      }

      // 4. Fast Local Mobile Task Execution: Flashlight / Torch
      if (lower.includes('torch') || lower.includes('flashlight')) {
        const turnOn = !lower.includes('band') && !lower.includes('off') && !lower.includes('hatao');
        const res = await toggleDeviceTorch(turnOn);
        setScreenTorchActive(turnOn);

        const torchReply = turnOn
          ? 'Boss, torch on kar di gayi hai!'
          : 'Boss, torch band kar di gayi hai.';

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: torchReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setLastAssistantReply(torchReply);
        setIsProcessing(false);
        isProcessingRef.current = false;

        if (settings.soundEffects) playTactileClick();
        if (settings.autoSpeak) {
          handleSpeak(torchReply);
        }
        return;
      }

      // 5. Fast Local Mobile Task Execution: Save Note
      if (lower.startsWith('note ') || lower.startsWith('note likho') || lower.includes('yaad rakhna')) {
        const noteContent = cleanText
          .replace(/^(note likho|note|yaad rakhna ki|yaad rakhna)\s*/i, '')
          .trim();

        if (noteContent) {
          const newNote: NoteItem = {
            id: `note-${Date.now()}`,
            content: noteContent,
            createdAt: new Date().toISOString(),
          };
          setNotes((prev) => [newNote, ...prev]);

          const noteReply = `Boss, maine aapka note save kar liya hai: "${noteContent}".`;
          const aiMsg: Message = {
            id: `ai-${Date.now()}`,
            role: 'model',
            text: noteReply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };

          setMessages((prev) => [...prev, aiMsg]);
          setLastAssistantReply(noteReply);
          setIsProcessing(false);
          isProcessingRef.current = false;

          if (settings.soundEffects) playResponseChime();
          if (settings.autoSpeak) {
            handleSpeak(noteReply);
          }
          return;
        }
      }

      // 6. Fast Local Mobile Task Execution: Current Time / Date
      if (lower.includes('kya waqt') || lower.includes('kya time') || lower.includes('time kya') || lower.includes('aaj kya tareekh') || lower.includes('today date')) {
        const now = new Date();
        const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateFormatted = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
        const timeReply = `Boss, abhi waqt ${timeFormatted} ho raha hai aur aaj ki tareekh ${dateFormatted} hai.`;

        const aiMsg: Message = {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: timeReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setLastAssistantReply(timeReply);
        setIsProcessing(false);
        isProcessingRef.current = false;

        if (settings.soundEffects) playResponseChime();
        if (settings.autoSpeak) {
          handleSpeak(timeReply);
        }
        return;
      }

      // 7. General AI Core: Full Conversation Memory with Gemini 3.8 Flash
      try {
        const historyForApi = messages.slice(-12).map((m) => ({
          role: m.role,
          text: m.text,
        }));

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: cleanText,
            history: historyForApi,
            currentDateTime: new Date().toLocaleString(),
            userLanguage: settings.inputLanguage,
          }),
        });

        let replyText = 'Bilal King online hai Boss. Aage kya hukum hai?';
        if (response.ok) {
          const data = await response.json();
          if (data.reply) {
            replyText = data.reply;
          }
        }

        if (settings.soundEffects) {
          playResponseChime();
        }

        const assistantMsgObj: Message = {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, assistantMsgObj]);
        setLastAssistantReply(replyText);
        setIsProcessing(false);
        isProcessingRef.current = false;

        // Speak aloud using natural female voice
        if (settings.autoSpeak) {
          handleSpeak(replyText);
        } else {
          setAssistantStatus('STANDBY // READY');
        }
      } catch (err: any) {
        console.warn('Network issue caught, speaking helpful local response:', err);
        const fallbackText =
          'Ji Boss, main bilkul sun raha hoon. Aap batayein main aapki kya madad kar sakta hoon?';

        const fallbackMsgObj: Message = {
          id: `ai-rec-${Date.now()}`,
          role: 'model',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, fallbackMsgObj]);
        setLastAssistantReply(fallbackText);
        setIsProcessing(false);
        isProcessingRef.current = false;
        setAssistantStatus('STANDBY // READY');

        if (settings.autoSpeak) {
          handleSpeak(fallbackText);
        }
      }
    },
    [messages, settings, handleSpeak, handleStopSpeaking, handleStopHandsFreeSession]
  );

  // Start listening through Web Speech Recognition (Manual single-turn)
  const triggerStartListening = useCallback(() => {
    // If currently speaking, stop it
    if (isCurrentlySpeaking()) {
      handleStopSpeaking();
    }

    if (settings.soundEffects) {
      playListeningPing();
    }

    setLiveTranscript('');
    setIsListening(true);
    setAssistantStatus('LISTENING // BOSS SPEAKING');

    const started = startListening(
      {
        language: settings.inputLanguage,
        continuous: false,
        interimResults: true,
      },
      {
        onStart: () => {
          setIsListening(true);
          setAssistantStatus('LISTENING // BOSS SPEAKING');
        },
        onResult: (transcript, isFinal) => {
          setLiveTranscript(transcript);

          // Clear any existing silence timer
          if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
          }

          if (isFinal && transcript.trim().length > 0) {
            stopListening();
            setIsListening(false);
            processUserMessage(transcript);
          } else {
            // Rapid submission after 1.3 seconds of pause for fast response latency
            silenceTimerRef.current = setTimeout(() => {
              if (transcript.trim().length > 0) {
                stopListening();
                setIsListening(false);
                processUserMessage(transcript);
              }
            }, 1300);
          }
        },
        onError: (_err) => {
          // Gracefully reset on error without auto-restart loops or annoying popups
          setIsListening(false);
          setAssistantStatus('STANDBY // READY');
        },
        onEnd: () => {
          setIsListening(false);
          if (!isProcessingRef.current && !isSpeakingRef.current) {
            setAssistantStatus('STANDBY // READY');
          }
        },
      }
    );

    if (!started) {
      setIsListening(false);
      setAssistantStatus('STANDBY // READY');
    }
  }, [settings, handleStopSpeaking, processUserMessage]);

  const triggerStopListening = useCallback(() => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
    }
    stopListening();
    setIsListening(false);
    setAssistantStatus('STANDBY // READY');

    if (liveTranscript.trim()) {
      processUserMessage(liveTranscript);
    }
  }, [liveTranscript, processUserMessage]);

  // Single Tap Activation: starts speech recognition for one user input (NO auto loop)
  const handleToggleCore = () => {
    unlockSpeechSynthesis();

    if (isSpeaking) {
      handleStopSpeaking();
      return;
    }

    if (isListening) {
      triggerStopListening();
      return;
    }

    // Manual tap-to-talk: starts listening for user command
    triggerStartListening();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    unlockSpeechSynthesis();
    if (!textInput.trim() || isProcessing) return;
    const query = textInput.trim();
    setTextInput('');
    processUserMessage(query);
  };

  // Timer controls from Smart Tools
  const handleStartTimer = (seconds: number, label: string = 'Timer') => {
    setActiveTimer({
      id: `timer-${Date.now()}`,
      totalSeconds: seconds,
      remainingSeconds: seconds,
      label,
      isRunning: true,
    });
    if (settings.soundEffects) playActivationSound();
  };

  const handleStopTimer = () => {
    setActiveTimer(null);
    if (settings.soundEffects) playTactileClick();
  };

  // Reminder operations
  const handleAddReminder = (title: string, datetime: string) => {
    const newRem: ReminderItem = {
      id: `rem-${Date.now()}`,
      title,
      datetime,
      completed: false,
      notified: false,
    };
    setReminders((prev) => [newRem, ...prev]);
    if (settings.soundEffects) playResponseChime();
  };

  const handleToggleReminder = (id: string) => {
    setReminders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const handleDeleteReminder = (id: string) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  };

  // Note operations
  const handleAddNote = (content: string) => {
    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      content,
      createdAt: new Date().toISOString(),
    };
    setNotes((prev) => [newNote, ...prev]);
    if (settings.soundEffects) playResponseChime();
  };

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Direct action button triggers
  const handleQuickAction = (action: string) => {
    unlockSpeechSynthesis();
    if (settings.soundEffects) playTactileClick();

    if (action === 'youtube') {
      window.open('https://www.youtube.com/results?search_query=Trending+Bollywood+Songs', '_blank');
      const rep = 'Boss, YouTube par songs open kar diye hain!';
      handleSpeak(rep);
    } else if (action === 'gallery') {
      galleryInputRef.current?.click();
      const rep = 'Boss, phone photo gallery open kar di hai.';
      handleSpeak(rep);
    } else if (action === 'torch') {
      const turnOn = !screenTorchActive;
      toggleDeviceTorch(turnOn);
      setScreenTorchActive(turnOn);
      const rep = turnOn ? 'Boss, torch on kar di hai!' : 'Boss, torch band kar di hai.';
      handleSpeak(rep);
    } else if (action === 'whatsapp') {
      window.open('https://wa.me/?text=Hello%20Boss', '_blank');
      const rep = 'Boss, WhatsApp open kar diya hai.';
      handleSpeak(rep);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#030712] text-slate-100 overflow-hidden hud-grid-bg relative">
      {/* Hidden File Gallery Input for Direct Gallery Action */}
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            handleSpeak(`Boss, ${e.target.files.length} photos select ho gayi hain!`);
          }
        }}
      />
      {/* Screen Torch Overlay (if active) */}
      {screenTorchActive && (
        <div
          onClick={() => {
            setScreenTorchActive(false);
            toggleDeviceTorch(false);
          }}
          className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-4 cursor-pointer text-slate-900"
        >
          <Flame className="w-16 h-16 text-amber-500 animate-pulse mb-3" />
          <h2 className="font-orbitron font-bold text-2xl uppercase">Screen Torch Active</h2>
          <p className="text-sm font-rajdhani font-semibold mt-1">Tap anywhere to turn off flashlight</p>
        </div>
      )}

      {/* Top Telemetry Header */}
      <HeaderHUD
        settings={settings}
        activeView={activeView}
        onToggleView={(view) => {
          setActiveView(view);
          if (settings.soundEffects) playTactileClick();
        }}
        onOpenSettings={() => {
          setIsSettingsOpen(true);
          if (settings.soundEffects) playTactileClick();
        }}
        onOpenTools={() => {
          setIsToolsOpen(true);
          if (settings.soundEffects) playTactileClick();
        }}
        onOpenDialer={() => {
          setIsDialerOpen(true);
          if (settings.soundEffects) playTactileClick();
        }}
        onToggleMute={() => {
          setSettings((prev) => ({ ...prev, autoSpeak: !prev.autoSpeak }));
          if (isSpeaking) handleStopSpeaking();
        }}
        isSpeaking={isSpeaking}
        isListening={isListening}
        assistantStatus={assistantStatus}
      />

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col justify-between max-w-4xl w-full mx-auto relative">
        {/* Active Timer Pill Bar (if timer is running) */}
        {activeTimer && (
          <div className="mx-4 mt-2 p-2 rounded-xl bg-cyan-950/80 border border-cyan-400/40 flex items-center justify-between text-xs glow-cyan-box animate-pulse-glow z-10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span className="font-rajdhani font-bold text-cyan-200">
                {activeTimer.label}:
              </span>
              <span className="font-mono font-bold text-white tracking-wider text-sm">
                {Math.floor(activeTimer.remainingSeconds / 60)
                  .toString()
                  .padStart(2, '0')}
                :
                {(activeTimer.remainingSeconds % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <button
              onClick={handleStopTimer}
              className="text-[10px] font-rajdhani font-bold text-red-300 hover:text-red-200 uppercase px-2 py-0.5 rounded bg-red-950/60 border border-red-500/40"
            >
              Cancel
            </button>
          </div>
        )}

        {/* View 1: Core Arc Reactor HUD */}
        {activeView === 'core' && (
          <div className="flex-1 flex flex-col justify-center items-center overflow-y-auto">
            <ArcReactorCore
              isListening={isListening}
              isSpeaking={isSpeaking}
              isProcessing={isProcessing}
              isHandsFreeActive={isHandsFreeActive}
              onToggleCore={handleToggleCore}
              onStopAll={() => handleStopHandsFreeSession()}
              liveTranscript={liveTranscript}
              lastAssistantReply={lastAssistantReply}
              assistantStatus={assistantStatus}
            />

          </div>
        )}

        {/* View 2: Full Chat Transcript View */}
        {activeView === 'chat' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <ChatTranscript
              messages={messages}
              onSpeakMessage={(text) => handleSpeak(text)}
              onClearHistory={() => setMessages(INITIAL_MESSAGES)}
              currentlySpeakingText={isSpeaking ? lastAssistantReply : ''}
            />
          </div>
        )}

        {/* Bottom Dock: Clean SMS Input & Voice Microphone */}
        <div className="w-full bg-slate-950/95 backdrop-blur-md border-t border-cyan-500/30 p-2 sm:p-3 z-20">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
            {/* Minimal SMS Input Form */}
            <form onSubmit={handleTextSubmit} className="flex-1 flex items-center gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="SMS type..."
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  disabled={isProcessing}
                  className="w-full bg-slate-900/90 border border-cyan-500/30 focus:border-cyan-400 rounded-xl py-2 pl-3 pr-8 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-mono tracking-wide"
                />
                {textInput && (
                  <button
                    type="button"
                    onClick={() => setTextInput('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Text Send Button */}
              {textInput.trim() && (
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-rajdhani font-bold text-xs flex items-center gap-1 shadow-md shadow-cyan-500/30 transition-all active:scale-95 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">SEND</span>
                </button>
              )}
            </form>

            {/* Glowing Microphone Button */}
            <button
              onClick={handleToggleCore}
              disabled={isProcessing}
              title={
                isListening
                  ? 'Stop Voice Input'
                  : isSpeaking
                  ? 'Stop BF AI Voice'
                  : 'Tap to Speak (Voice Input)'
              }
              className={`p-2.5 sm:p-3 rounded-xl border flex items-center justify-center transition-all duration-200 transform active:scale-90 ${
                isListening
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.7)] animate-bounce'
                  : isSpeaking
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 border-cyan-500/40 text-cyan-300 hover:border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
              }`}
            >
              {isListening ? (
                <Mic className="w-5 h-5 text-emerald-300" />
              ) : isSpeaking ? (
                <Volume2 className="w-5 h-5 text-sky-300" />
              ) : (
                <Mic className="w-5 h-5 text-cyan-400" />
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Voice & System Settings Modal */}
      <VoiceSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings(newSettings)}
      />

      {/* Smart Assistant Tools Drawer */}
      <SmartToolsDrawer
        isOpen={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
        activeTimer={activeTimer}
        onStartTimer={handleStartTimer}
        onStopTimer={handleStopTimer}
        reminders={reminders}
        onAddReminder={handleAddReminder}
        onToggleReminder={handleToggleReminder}
        onDeleteReminder={handleDeleteReminder}
        notes={notes}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
      />

      {/* Phone Call Manager & Mobile Dialer */}
      <PhoneCallManager
        isOpen={isDialerOpen}
        onClose={() => setIsDialerOpen(false)}
        onMakeCall={handleMakeCall}
        recentCalls={recentCalls}
      />

      {/* Futuristic AMOLED Screen Lock Overlay */}
      <ScreenLockOverlay
        isLocked={isPhoneLocked}
        onUnlock={() => {
          setIsPhoneLocked(false);
          requestScreenWakeLock();
          if (settings.soundEffects) playActivationSound();
        }}
      />
    </div>
  );
}
