import React, { useState, useRef } from 'react';
import {
  Send,
  Bold,
  Italic,
  Code,
  Quote,
  Smile,
  Mic,
  Paperclip,
  Image,
  X,
  Sparkles
} from 'lucide-react';
import { ChatAttachment } from '../types/chat';

interface MessageComposerProps {
  onSendMessage: (text: string, attachments?: ChatAttachment[]) => void;
  onOpenVoiceRecorder: () => void;
  placeholder?: string;
  disabled?: boolean;
}

const EMOJI_CATEGORIES = [
  { name: 'Populares', emojis: ['👍', '❤️', '🔥', '🚀', '🎉', '✨', '👀', '💯'] },
  { name: 'Expresiones', emojis: ['😀', '😂', '😎', '🤔', '🙌', '👏', '🤝', '💪'] },
  { name: 'Trabajo & Tech', emojis: ['💻', '⚡', '📊', '📌', '💡', '🛠️', '📱', '☕'] },
];

const SUGGESTIONS = [
  '¡Buen trabajo! 🚀',
  '¿Revisamos esto ahora? 👀',
  'Listo para desplegar 💻',
  'Recibido, todo claro 👍',
];

export const MessageComposer: React.FC<MessageComposerProps> = ({
  onSendMessage,
  onOpenVoiceRecorder,
  placeholder = 'Escribe un mensaje...',
  disabled = false,
}) => {
  const [text, setText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || disabled) return;
    onSendMessage(text, attachments.length > 0 ? attachments : undefined);
    setText('');
    setAttachments([]);
    setShowEmojiPicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertFormatting = (prefix: string, suffix: string = prefix) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const selected = text.substring(start, end);

    const replacement = `${prefix}${selected || 'texto'}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);
    setText(newText);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(
          start + prefix.length,
          start + prefix.length + (selected.length || 5)
        );
      }
    }, 50);
  };

  const insertEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const isImg = file.type.startsWith('image/');
      const newAtt: ChatAttachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        type: isImg ? 'image' : 'file',
        url: result,
        size: `${(file.size / 1024).toFixed(0)} KB`,
      };
      setAttachments((prev) => [...prev, newAtt]);
    };
    reader.readAsDataURL(file);
    // reset input
    e.target.value = '';
  };


  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div className="p-3 md:p-4 border-t border-slate-800 bg-slate-900/90 relative">
      {/* Quick Suggestion Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none text-[11px]">
        {SUGGESTIONS.map((sug, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setText(sug)}
            className="shrink-0 px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/60 transition-colors cursor-pointer"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Attachment Previews */}
      {attachments.length > 0 && (
        <div className="flex items-center gap-2 mb-2 p-2 bg-slate-950/60 rounded-xl border border-slate-800 overflow-x-auto">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative shrink-0 flex items-center gap-2 p-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs"
            >
              {att.type === 'image' && (
                <img src={att.url} alt={att.name} className="w-8 h-8 rounded object-cover" />
              )}
              <span className="text-[11px] text-slate-200 truncate max-w-[120px]">{att.name}</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="p-0.5 text-slate-400 hover:text-rose-400 rounded transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-2.5 focus-within:border-indigo-500/80 transition-colors shadow-inner">
        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between pb-2 mb-1 border-b border-slate-800/70 text-slate-400 text-xs">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => insertFormatting('**')}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Negrita (**texto**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*')}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Cursiva (*texto*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`')}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Código (`código`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('> ')}
              className="p-1 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Cita (> cita)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            {/* Emoji Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1 rounded transition-colors cursor-pointer ${
                  showEmojiPicker ? 'text-amber-400 bg-slate-800' : 'hover:text-white hover:bg-slate-800'
                }`}
                title="Insertar emoji"
              >
                <Smile className="w-3.5 h-3.5" />
              </button>

              {/* Emoji Picker Popover */}
              {showEmojiPicker && (
                <div className="absolute bottom-8 right-0 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-300">Emojis</span>
                    <button
                      onClick={() => setShowEmojiPicker(false)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar">
                    {EMOJI_CATEGORIES.map((cat, cIdx) => (
                      <div key={cIdx}>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">
                          {cat.name}
                        </div>
                        <div className="grid grid-cols-6 gap-1">
                          {cat.emojis.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => insertEmoji(emoji)}
                              className="text-base p-1 hover:bg-slate-800 rounded-lg transition-transform hover:scale-125 cursor-pointer text-center"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Voice Recorder */}
            <button
              type="button"
              onClick={onOpenVoiceRecorder}
              className="p-1 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Grabar nota de voz"
            >
              <Mic className="w-3.5 h-3.5" />
            </button>

            {/* Attachment Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 hover:text-indigo-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
              title="Adjuntar imagen o foto"
            >
              <Paperclip className="w-3.5 h-3.5" />
            </button>

          </div>
        </div>

        {/* Input Textarea & Send Button */}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            rows={2}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-transparent border-0 text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed"
          />

          <button
            type="button"
            onClick={handleSend}
            disabled={(!text.trim() && attachments.length === 0) || disabled}
            className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-900/30 transition-all hover:scale-105 cursor-pointer shrink-0"
            title="Enviar mensaje (Enter)"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
