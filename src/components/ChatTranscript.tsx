import React, { useRef, useEffect } from 'react';
import { Volume2, Copy, Check, Sparkles, User, Trash2 } from 'lucide-react';
import { Message } from '../types/assistant';

interface ChatTranscriptProps {
  messages: Message[];
  onSpeakMessage: (text: string) => void;
  onClearHistory: () => void;
  currentlySpeakingText: string;
}

export const ChatTranscript: React.FC<ChatTranscriptProps> = ({
  messages,
  onSpeakMessage,
  onClearHistory,
  currentlySpeakingText,
}) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto px-3 py-2">
      {/* Header with Clear Button */}
      <div className="flex items-center justify-between py-1.5 px-2 mb-2 border-b border-cyan-500/20">
        <div className="flex items-center gap-1.5 text-xs font-rajdhani font-bold text-cyan-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>BILAL KING CONVERSATION LOG</span>
        </div>
        {messages.length > 1 && (
          <button
            onClick={onClearHistory}
            className="flex items-center gap-1 text-[11px] font-rajdhani font-semibold text-red-400/80 hover:text-red-300 px-2 py-0.5 rounded hover:bg-red-950/30 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear Log</span>
          </button>
        )}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 pb-4">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isSpeakingThis = !isUser && currentlySpeakingText === msg.text;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {/* Avatar Icon */}
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-cyan-950 border border-cyan-400/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              )}

              {/* Message Content Bubble */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl px-3.5 py-2.5 transition-all text-sm leading-relaxed ${
                  isUser
                    ? 'bg-cyan-950/70 border border-cyan-500/40 text-cyan-50 rounded-tr-none'
                    : `bg-slate-900/90 border ${
                        isSpeakingThis
                          ? 'border-cyan-400 glow-cyan-box'
                          : 'border-slate-800'
                      } text-slate-100 rounded-tl-none shadow-md`
                }`}
              >
                {/* Sender Tag & Timestamp */}
                <div className="flex items-center justify-between gap-3 text-[10px] font-rajdhani font-semibold text-slate-400 mb-1 border-b border-slate-700/30 pb-0.5">
                  <span className={isUser ? 'text-cyan-300' : 'text-sky-400 font-orbitron'}>
                    {isUser ? 'YOU (BOSS)' : 'BILAL KING'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Body */}
                <p className="whitespace-pre-wrap select-text">{msg.text}</p>

                {/* Action Toolbar for AI message */}
                {!isUser && (
                  <div className="flex items-center justify-end gap-2 mt-2 pt-1 border-t border-slate-800/60 text-slate-400">
                    <button
                      onClick={() => onSpeakMessage(msg.text)}
                      title="Speak response in Female Hindi voice"
                      className={`flex items-center gap-1 text-[11px] font-rajdhani font-semibold px-2 py-0.5 rounded transition-all ${
                        isSpeakingThis
                          ? 'bg-cyan-500/30 text-cyan-200 border border-cyan-400/50'
                          : 'hover:text-cyan-300 hover:bg-slate-800'
                      }`}
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>{isSpeakingThis ? 'Speaking...' : 'Speak'}</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(msg.id, msg.text)}
                      title="Copy message"
                      className="p-1 rounded hover:text-slate-200 hover:bg-slate-800 transition-all text-[11px]"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-slate-300">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
