import React, { useState } from 'react';
import {
  Bookmark,
  Smile,
  Copy,
  Check,
  Play,
  Pause,
  FileText,
  Volume2,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { ChatMessage, ChatUser } from '../types/chat';
import { playSound } from '../services/soundEffects';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserId: string;
  typingUser: ChatUser | null;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onToggleStar: (messageId: string) => void;
  soundEnabled: boolean;
  searchFilter: string;
}

const COMMON_EMOJIS = ['❤️', '👍', '🔥', '🎉', '🚀', '👀'];

export const MessageList: React.FC<MessageListProps> = ({
  messages,
  currentUserId,
  typingUser,
  onToggleReaction,
  onToggleStar,
  soundEnabled,
  searchFilter,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeReactionMenuId, setActiveReactionMenuId] = useState<string | null>(null);
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);
  const currentAudioRef = React.useRef<HTMLAudioElement | null>(null);

  const handleCopy = (message: ChatMessage) => {
    navigator.clipboard.writeText(message.text);
    setCopiedId(message.id);
    if (soundEnabled) playSound('pop');
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleReactionClick = (messageId: string, emoji: string) => {
    if (soundEnabled) playSound('pop');
    onToggleReaction(messageId, emoji);
    setActiveReactionMenuId(null);
  };

  const handleToggleAudio = (attId: string, audioUrl?: string) => {
    if (playingAudioId === attId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
      setPlayingAudioId(null);
    } else {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      if (audioUrl && audioUrl !== '#') {
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        audio.onended = () => setPlayingAudioId(null);
        audio.play().catch(() => {});
      }
      setPlayingAudioId(attId);
      if (soundEnabled) playSound('ding');
    }
  };


  // Helper to render simple markdown styles
  const renderFormattedText = (text: string) => {
    if (!text) return null;

    // Check for blockquote
    if (text.startsWith('> ')) {
      return (
        <blockquote className="border-l-2 border-indigo-400 pl-2.5 py-0.5 text-slate-300 italic my-1 text-xs bg-indigo-950/20 rounded-r">
          {text.slice(2)}
        </blockquote>
      );
    }

    // Split text into chunks for formatting (bold, italic, code)
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-slate-200">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-950 text-indigo-300 font-mono text-[11px] border border-slate-800">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  const filteredMessages = searchFilter
    ? messages.filter((m) => m.text.toLowerCase().includes(searchFilter.toLowerCase()))
    : messages;

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar">
      {filteredMessages.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full text-slate-500 text-xs text-center p-8">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 mb-3">
            <Sparkles className="w-6 h-6 text-indigo-400" />
          </div>
          <p className="font-semibold text-slate-300 text-sm">No hay mensajes todavía</p>
          <p className="text-slate-400 max-w-xs mt-1">
            Sé el primero en iniciar la conversación o saluda al equipo para comenzar a colaborar.
          </p>
        </div>
      ) : (
        filteredMessages.map((msg, index) => {
          const isMe = msg.sender.id === currentUserId || msg.sender.id === 'current-user-1' || msg.sender.id === 'me';
          const timeFormatted = new Date(msg.createTime).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={msg.id || index}
              className={`group flex items-start gap-3 relative ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Sender Avatar */}
              <div className="shrink-0 mt-0.5">
                {msg.sender.avatarUrl ? (
                  <img
                    src={msg.sender.avatarUrl}
                    alt={msg.sender.name}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-800"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ring-2 ring-slate-800 ${
                    isMe ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-200'
                  }`}>
                    {(msg.sender.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Message Content Container */}
              <div className={`max-w-[85%] sm:max-w-[75%] md:max-w-[65%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Sender Name & Timestamp Header */}
                <div className={`flex items-center gap-2 mb-1 text-[11px] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                  <span className="font-semibold text-slate-300">{msg.sender.name}</span>
                  <span className="text-slate-500 text-[10px]">{timeFormatted}</span>
                  {msg.isStarred && (
                    <Bookmark className="w-3 h-3 text-amber-400 fill-amber-400" />
                  )}
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm transition-all ${
                    isMe
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white rounded-tr-xs'
                      : 'bg-slate-800/90 border border-slate-700/60 text-slate-100 rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Attachments if any */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2.5 space-y-2">
                      {msg.attachments.map((att) => {
                        if (att.type === 'image') {
                          return (
                            <div
                              key={att.id}
                              onClick={() => setLightboxImageUrl(att.url)}
                              className="overflow-hidden rounded-xl border border-white/10 cursor-pointer group/img relative"
                            >
                              <img
                                src={att.url}
                                alt={att.name}
                                className="w-full max-h-60 object-cover rounded-xl transition-transform duration-300 group-hover/img:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-xs font-semibold transition-opacity">
                                Ampliar imagen
                              </div>
                            </div>
                          );
                        }

                        if (att.type === 'audio') {
                          const isPlaying = playingAudioId === att.id;
                          return (
                            <div
                              key={att.id}
                              className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-950/50 border border-slate-700/40 text-xs min-w-[200px]"
                            >
                              <button
                                onClick={() => handleToggleAudio(att.id, att.url)}
                                className="p-2 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white transition-colors cursor-pointer"
                              >
                                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                              </button>
                              <div className="flex-1">
                                <div className="flex items-center justify-between text-[11px] mb-1">
                                  <span className="font-medium text-slate-200 flex items-center gap-1">
                                    <Volume2 className="w-3 h-3 text-indigo-400" /> Nota de voz
                                  </span>
                                  <span className="text-slate-400 text-[10px] font-mono">{att.duration || '0:05'}</span>
                                </div>
                                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                  <div
                                    className={`h-full bg-indigo-400 rounded-full ${isPlaying ? 'w-3/4 animate-pulse' : 'w-1/3'}`}
                                  />
                                </div>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={att.id}
                            className="flex items-center gap-2.5 p-2 rounded-xl bg-slate-950/40 border border-slate-700/40 text-xs"
                          >
                            <FileText className="w-4 h-4 text-indigo-400" />
                            <span className="truncate max-w-[160px] font-medium text-slate-200">{att.name}</span>
                            {att.size && <span className="text-[10px] text-slate-400">({att.size})</span>}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Reactions Pill Display */}
                  {msg.reactions && msg.reactions.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 mt-2.5 pt-1">
                      {msg.reactions.map((react, rIdx) => {
                        const hasReacted = react.users.includes('Tú');
                        return (
                          <button
                            key={rIdx}
                            onClick={() => handleReactionClick(msg.id, react.emoji)}
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all cursor-pointer ${
                              hasReacted
                                ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 font-semibold shadow-xs'
                                : 'bg-slate-900/60 border-slate-700/60 text-slate-300 hover:border-slate-500'
                            }`}
                            title={`Reacciones de: ${react.users.join(', ')}`}
                          >
                            <span>{react.emoji}</span>
                            <span>{react.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Floating Quick Action Toolbar (on hover) */}
                <div
                  className={`opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-1 bg-slate-800/90 border border-slate-700 rounded-xl p-1 shadow-lg z-10 ${
                    isMe ? 'mr-1' : 'ml-1'
                  }`}
                >
                  {/* Reaction Button & Picker Popover */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActiveReactionMenuId(activeReactionMenuId === msg.id ? null : msg.id)
                      }
                      className="p-1 hover:text-white text-slate-400 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                      title="Reaccionar"
                    >
                      <Smile className="w-3.5 h-3.5" />
                    </button>

                    {activeReactionMenuId === msg.id && (
                      <div className="absolute bottom-7 left-0 flex items-center gap-1 bg-slate-900 border border-slate-700 rounded-xl p-1.5 shadow-2xl z-30">
                        {COMMON_EMOJIS.map((emoji) => (
                          <button
                            key={emoji}
                            onClick={() => handleReactionClick(msg.id, emoji)}
                            className="p-1 text-sm hover:scale-125 transition-transform cursor-pointer"
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Star Toggle Button */}
                  <button
                    onClick={() => {
                      if (soundEnabled) playSound('pop');
                      onToggleStar(msg.id);
                    }}
                    className={`p-1 rounded-lg transition-colors cursor-pointer ${
                      msg.isStarred
                        ? 'text-amber-400 hover:text-amber-300'
                        : 'text-slate-400 hover:text-white hover:bg-slate-700'
                    }`}
                    title={msg.isStarred ? 'Quitar de destacados' : 'Destacar mensaje'}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                  </button>

                  {/* Copy Text Button */}
                  <button
                    onClick={() => handleCopy(msg)}
                    className="p-1 hover:text-white text-slate-400 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Copiar texto"
                  >
                    {copiedId === msg.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* Typing Indicator */}
      {typingUser && (
        <div className="flex items-center gap-3 animate-in fade-in duration-200">
          {typingUser.avatarUrl ? (
            <img
              src={typingUser.avatarUrl}
              alt={typingUser.name}
              className="w-7 h-7 rounded-full object-cover ring-2 ring-slate-800"
            />
          ) : (
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
              {typingUser.name.slice(0, 1)}
            </div>
          )}
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs">
            <span className="font-semibold text-slate-200">{typingUser.name}</span>
            <span>está escribiendo</span>
            <div className="flex items-center gap-1 ml-1">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {lightboxImageUrl && (
        <div
          onClick={() => setLightboxImageUrl(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm cursor-zoom-out"
        >
          <img
            src={lightboxImageUrl}
            alt="Preview ampliado"
            className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain shadow-2xl"
          />
        </div>
      )}
    </div>
  );
};
