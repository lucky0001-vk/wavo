'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, RoomParticipant } from '@/types';
import { QUICK_MESSAGES, QUICK_EMOJIS } from '@/lib/constants';
import { Send, Users, MessageSquare, Crown, Sparkles, Smile } from 'lucide-react';

interface RoomChatProps {
  participants: RoomParticipant[];
  messages: ChatMessage[];
  onSendMessage: (content: string, type?: ChatMessage['type']) => void;
  onSendReaction: (emoji: string) => void;
  currentUserId: string;
}

export const RoomChat: React.FC<RoomChatProps> = ({
  participants,
  messages,
  onSendMessage,
  onSendReaction,
  currentUserId,
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
  const [inputText, setInputText] = useState('');
  const [showQuickPhrases, setShowQuickPhrases] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim(), 'text');
    setInputText('');
  };

  const handleQuickPhrase = (phrase: string) => {
    onSendMessage(phrase, 'quick_message');
    setShowQuickPhrases(false);
  };

  return (
    <div className="flex flex-col h-full bg-cinema-850 border border-cinema-750/70 rounded-3xl overflow-hidden shadow-cinema-card">
      {/* Header Tabs: Chat vs Participants */}
      <div className="flex items-center border-b border-cinema-750/80 bg-cinema-900/60 p-1.5">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'chat'
              ? 'bg-cinema-850 text-white shadow-sm'
              : 'text-cinema-400 hover:text-cinema-200'
          }`}
        >
          <MessageSquare size={14} className={activeTab === 'chat' ? 'text-amber-cinema' : ''} />
          <span>Room Chat</span>
          {messages.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-cinema-750 text-[10px] text-cinema-300">
              {messages.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('participants')}
          className={`flex-1 py-2 px-3 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
            activeTab === 'participants'
              ? 'bg-cinema-850 text-white shadow-sm'
              : 'text-cinema-400 hover:text-cinema-200'
          }`}
        >
          <Users size={14} className={activeTab === 'participants' ? 'text-amber-cinema' : ''} />
          <span>Participants</span>
          <span className="px-1.5 py-0.2 rounded-full bg-amber-cinema/15 text-amber-cinema text-[10px] font-mono">
            {participants.length}
          </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[460px] sm:max-h-[520px]">
        {activeTab === 'chat' ? (
          /* Chat Messages View */
          messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-cinema-500">
              <Sparkles size={24} className="text-amber-cinema/40 mb-2" />
              <p className="text-xs font-medium text-cinema-300">Quiet in the theater...</p>
              <p className="text-[11px] text-cinema-500 mt-1">
                Say hello or react with an emoji below!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.userId === currentUserId;
              const isQuick = msg.type === 'quick_message';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col text-xs ${isMe ? 'items-end' : 'items-start'} animate-fade-in`}
                >
                  <span className="text-[10px] text-cinema-500 mb-1 px-1">
                    {isMe ? 'You' : msg.nickname}
                  </span>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 leading-relaxed ${
                      isMe
                        ? 'bg-amber-cinema text-cinema-950 font-medium rounded-br-none'
                        : isQuick
                        ? 'bg-cinema-800 border border-amber-cinema/30 text-amber-cinema rounded-bl-none'
                        : 'bg-cinema-800 text-cinema-100 rounded-bl-none'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            })
          )
        ) : (
          /* Live Participants View */
          <div className="space-y-2">
            <p className="text-[11px] font-semibold text-cinema-400 uppercase tracking-wider mb-2">
              In this Session ({participants.length})
            </p>
            {participants.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-cinema-900/60 border border-cinema-750/50"
              >
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    {p.avatarUrl ? (
                      <img
                        src={p.avatarUrl}
                        alt={p.nickname}
                        className="w-8 h-8 rounded-full object-cover border border-cinema-700"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-cinema-800 text-cinema-200 border border-cinema-700 flex items-center justify-center font-bold text-xs">
                        {p.nickname.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border border-cinema-900" />
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-cinema-100 flex items-center gap-1.5">
                      {p.nickname}
                      {p.id === currentUserId && (
                        <span className="text-[10px] text-cinema-500 font-normal">(You)</span>
                      )}
                    </p>
                    <p className="text-[10px] text-cinema-500">
                      {p.isHost ? 'Room Host & Controller' : 'Audience Member'}
                    </p>
                  </div>
                </div>

                {p.isHost && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-cinema/15 text-amber-cinema border border-amber-cinema/30 text-[10px] font-semibold">
                    <Crown size={11} />
                    <span>Host</span>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Emoji Reaction Bar (Rave Style!) */}
      <div className="px-3 py-2 bg-cinema-900/80 border-t border-cinema-800 flex items-center justify-between gap-1 overflow-x-auto scrollbar-none">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            onClick={() => onSendReaction(emoji)}
            className="p-1.5 hover:bg-cinema-800 rounded-xl text-lg hover:scale-125 transition-transform"
            title={`React ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Quick Messages Popup */}
      {showQuickPhrases && (
        <div className="p-3 bg-cinema-900 border-t border-cinema-800 flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
          {QUICK_MESSAGES.map((phrase) => (
            <button
              key={phrase}
              onClick={() => handleQuickPhrase(phrase)}
              className="px-2.5 py-1 rounded-xl bg-cinema-800 hover:bg-cinema-750 text-cinema-200 text-xs border border-cinema-700/60 transition-colors"
            >
              {phrase}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-3 pb-safe bg-cinema-900/90 border-t border-cinema-750/80 flex items-center gap-2">
        <button
          type="button"
          onClick={() => setShowQuickPhrases(!showQuickPhrases)}
          className={`p-2.5 rounded-xl border transition-colors shrink-0 ${
            showQuickPhrases
              ? 'bg-amber-cinema/20 border-amber-cinema/50 text-amber-cinema'
              : 'bg-cinema-800 border-cinema-700 text-cinema-400 hover:text-white'
          }`}
          title="Quick phrases"
        >
          <Smile size={16} />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Send a message to the room..."
          enterKeyHint="send"
          className="flex-1 py-2.5 px-3 rounded-xl bg-cinema-950 border border-cinema-750 text-xs text-cinema-100 placeholder-cinema-500 focus:outline-none focus:border-amber-cinema/70"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-2.5 rounded-xl bg-amber-cinema hover:bg-amber-hover text-cinema-950 transition-colors shadow-glow-amber disabled:opacity-40 shrink-0"
          aria-label="Send message"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
};
