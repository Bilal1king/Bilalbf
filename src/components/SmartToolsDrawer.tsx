import React, { useState } from 'react';
import {
  X,
  Clock,
  Bell,
  FileText,
  PhoneCall,
  MessageCircle,
  MapPin,
  Search,
  CheckCircle2,
  Circle,
  Trash2,
  Play,
  Square,
  Plus,
  Send,
} from 'lucide-react';
import { ActiveTimer, NoteItem, ReminderItem } from '../types/assistant';

interface SmartToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTimer: ActiveTimer | null;
  onStartTimer: (seconds: number, label?: string) => void;
  onStopTimer: () => void;
  reminders: ReminderItem[];
  onAddReminder: (title: string, datetime: string) => void;
  onToggleReminder: (id: string) => void;
  onDeleteReminder: (id: string) => void;
  notes: NoteItem[];
  onAddNote: (content: string) => void;
  onDeleteNote: (id: string) => void;
}

export const SmartToolsDrawer: React.FC<SmartToolsDrawerProps> = ({
  isOpen,
  onClose,
  activeTimer,
  onStartTimer,
  onStopTimer,
  reminders,
  onAddReminder,
  onToggleReminder,
  onDeleteReminder,
  notes,
  onAddNote,
  onDeleteNote,
}) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'reminders' | 'notes' | 'actions'>('timer');
  const [newReminderText, setNewReminderText] = useState('');
  const [newReminderTime, setNewReminderTime] = useState('');
  const [newNoteText, setNewNoteText] = useState('');

  // Mobile quick action states
  const [whatsAppText, setWhatsAppText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapLocation, setMapLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  if (!isOpen) return null;

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderText.trim()) return;
    const timeValue = newReminderTime || new Date(Date.now() + 60 * 60 * 1000).toISOString();
    onAddReminder(newReminderText.trim(), timeValue);
    setNewReminderText('');
    setNewReminderTime('');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    onAddNote(newNoteText.trim());
    setNewNoteText('');
  };

  const formatTimerTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-cyan-500/30 flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 flex items-center justify-between">
          <div>
            <h2 className="font-orbitron font-bold text-base text-cyan-300 tracking-wide">
              SMART TOOLS & ACTIONS
            </h2>
            <span className="text-[10px] font-rajdhani text-slate-400">
              BILAL KING SYSTEM MODULES
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="grid grid-cols-4 p-2 gap-1 bg-slate-900/60 border-b border-slate-800 text-xs font-rajdhani font-semibold">
          <button
            onClick={() => setActiveTab('timer')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === 'timer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>TIMER</span>
          </button>

          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === 'reminders'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>TASKS</span>
          </button>

          <button
            onClick={() => setActiveTab('notes')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === 'notes'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>NOTES</span>
          </button>

          <button
            onClick={() => setActiveTab('actions')}
            className={`py-2 px-1 rounded-lg flex flex-col items-center gap-1 transition-all ${
              activeTab === 'actions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>ACTIONS</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: TIMER */}
          {activeTab === 'timer' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-cyan-500/30 text-center glow-cyan-box">
                <span className="text-[11px] font-rajdhani font-semibold text-cyan-400 tracking-widest uppercase block mb-1">
                  Active Countdown
                </span>
                <div className="text-4xl font-mono font-bold text-white tracking-widest my-2">
                  {activeTimer ? formatTimerTime(activeTimer.remainingSeconds) : '00:00'}
                </div>
                {activeTimer && (
                  <p className="text-xs text-cyan-300 font-medium mb-3">
                    Label: {activeTimer.label}
                  </p>
                )}

                {activeTimer ? (
                  <button
                    onClick={onStopTimer}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 font-rajdhani font-bold text-xs uppercase hover:bg-red-900/80 transition-all"
                  >
                    <Square className="w-4 h-4 text-red-400 fill-red-400/40" />
                    <span>Cancel Timer</span>
                  </button>
                ) : (
                  <p className="text-xs text-slate-400">
                    Pick a duration below or tell Bilal King: "Set a 5 minute timer"
                  </p>
                )}
              </div>

              {/* Quick Presets */}
              <div>
                <label className="block text-xs font-rajdhani font-bold text-cyan-300 uppercase mb-2">
                  Quick Timer Presets
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: '1 Min', secs: 60 },
                    { label: '3 Min', secs: 180 },
                    { label: '5 Min', secs: 300 },
                    { label: '10 Min', secs: 600 },
                    { label: '15 Min', secs: 900 },
                    { label: '25 Min (Focus)', secs: 1500 },
                  ].map((preset) => (
                    <button
                      key={preset.secs}
                      onClick={() => onStartTimer(preset.secs, preset.label)}
                      className="py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-cyan-950/60 border border-slate-800 hover:border-cyan-400 text-xs font-semibold text-slate-200 transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Play className="w-3 h-3 text-cyan-400" />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: REMINDERS & TASKS */}
          {activeTab === 'reminders' && (
            <div className="space-y-4">
              <form onSubmit={handleCreateReminder} className="space-y-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <input
                  type="text"
                  placeholder="E.g., Call boss, take medicine..."
                  value={newReminderText}
                  onChange={(e) => setNewReminderText(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex gap-2">
                  <input
                    type="datetime-local"
                    value={newReminderTime}
                    onChange={(e) => setNewReminderTime(e.target.value)}
                    className="flex-1 bg-slate-950 border border-cyan-500/30 rounded-lg p-2 text-xs text-slate-300 focus:outline-none focus:border-cyan-400"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-rajdhani font-bold flex items-center gap-1 hover:bg-cyan-500/30 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>ADD</span>
                  </button>
                </div>
              </form>

              {/* Reminders List */}
              <div className="space-y-2">
                {reminders.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No active tasks. Tell Bilal King: "Remind me to..." or add one above!
                  </p>
                ) : (
                  reminders.map((rem) => (
                    <div
                      key={rem.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                        rem.completed
                          ? 'bg-slate-950/60 border-slate-900 text-slate-500 line-through'
                          : 'bg-slate-900/90 border-cyan-500/30 text-slate-200'
                      }`}
                    >
                      <button
                        onClick={() => onToggleReminder(rem.id)}
                        className="text-cyan-400 flex-shrink-0"
                      >
                        {rem.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Circle className="w-4 h-4" />
                        )}
                      </button>
                      <div className="flex-1 text-xs">
                        <p className="font-medium">{rem.title}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(rem.datetime).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => onDeleteReminder(rem.id)}
                        className="text-slate-500 hover:text-red-400 p-1 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 3: NOTES & SCRATCHPAD */}
          {activeTab === 'notes' && (
            <div className="space-y-4">
              <form onSubmit={handleCreateNote} className="space-y-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <textarea
                  rows={2}
                  placeholder="Quick note / yaadgar..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg p-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-300 text-xs font-rajdhani font-bold flex items-center justify-center gap-1 hover:bg-cyan-500/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>SAVE VOICE NOTE</span>
                </button>
              </form>

              <div className="space-y-2">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">
                    No notes saved yet. Tell Bilal King: "Save a note..."
                  </p>
                ) : (
                  notes.map((note) => (
                    <div
                      key={note.id}
                      className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-start justify-between gap-2"
                    >
                      <div className="text-xs text-slate-200 whitespace-pre-wrap flex-1">
                        <p>{note.content}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(note.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <button
                        onClick={() => onDeleteNote(note.id)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QUICK MOBILE ACTIONS */}
          {activeTab === 'actions' && (
            <div className="space-y-3">
              {/* WhatsApp Quick Message */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mb-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Quick Message</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type message text..."
                    value={whatsAppText}
                    onChange={(e) => setWhatsAppText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  />
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(whatsAppText || 'Hello')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold font-rajdhani flex items-center"
                  >
                    SEND
                  </a>
                </div>
              </div>

              {/* Direct Phone Dial */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-400 mb-2">
                  <PhoneCall className="w-4 h-4" />
                  <span>Direct Mobile Dial</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="tel"
                    placeholder="Enter phone number..."
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  />
                  <a
                    href={`tel:${phoneNumber}`}
                    className="px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold font-rajdhani flex items-center"
                  >
                    CALL
                  </a>
                </div>
              </div>

              {/* Google Maps Search */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span>Google Maps Directions</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="City, restaurant, or landmark..."
                    value={mapLocation}
                    onChange={(e) => setMapLocation(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  />
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapLocation || 'nearby')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold font-rajdhani flex items-center"
                  >
                    MAP
                  </a>
                </div>
              </div>

              {/* Web / Search Query */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-cyan-400 mb-2">
                  <Search className="w-4 h-4" />
                  <span>Web & Video Search</span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search Google..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-slate-200"
                  />
                  <a
                    href={`https://www.google.com/search?q=${encodeURIComponent(searchQuery || 'Bilal king')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-bold font-rajdhani flex items-center"
                  >
                    SEARCH
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
