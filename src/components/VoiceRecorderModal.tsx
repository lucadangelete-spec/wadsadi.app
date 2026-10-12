import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send, AlertCircle } from 'lucide-react';
import { playSound } from '../services/soundEffects';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendVoiceNote: (audioDataUrl: string, audioDuration: string) => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  onSendVoiceNote,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecorded, setHasRecorded] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  useEffect(() => {
    if (isOpen) {
      startActualRecording();
    } else {
      cleanup();
    }
  }, [isOpen]);

  const cleanup = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }
    setIsRecording(false);
    setSeconds(0);
    setHasRecorded(false);
    setIsPlayingPreview(false);
    setAudioUrl(null);
    setMicError(null);
  };

  const startActualRecording = async () => {
    setMicError(null);
    setSeconds(0);
    setHasRecorded(false);
    setAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          setAudioUrl(base64Audio);
          setHasRecorded(true);
        };
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      playSound('pop');
    } catch (err: any) {
      console.warn('Mic permission error:', err);
      setMicError('No se pudo acceder al micrófono del navegador. Comprueba los permisos.');
      setIsRecording(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    playSound('pop');
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const togglePreview = () => {
    if (!audioUrl) return;

    if (!audioPreviewRef.current) {
      audioPreviewRef.current = new Audio(audioUrl);
      audioPreviewRef.current.onended = () => setIsPlayingPreview(false);
    }

    if (isPlayingPreview) {
      audioPreviewRef.current.pause();
      setIsPlayingPreview(false);
    } else {
      audioPreviewRef.current.play();
      setIsPlayingPreview(true);
    }
  };

  const handleSend = () => {
    const duration = formatTime(seconds || 2);
    // If real audio URL was recorded, send it, otherwise fallback
    const finalAudioUrl = audioUrl || 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=';
    playSound('send');
    onSendVoiceNote(finalAudioUrl, duration);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 text-center">
        <h3 className="font-bold text-base text-white mb-1">Grabar Nota de Voz Real</h3>
        <p className="text-xs text-slate-400 mb-5">
          {isRecording ? 'Habla ahora, el audio llegará a la otra persona...' : 'Escucha tu audio antes de enviarlo'}
        </p>

        {micError && (
          <div className="flex items-center gap-2 p-3 bg-amber-950/60 border border-amber-800 text-amber-300 text-xs rounded-xl mb-4 text-left">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{micError}</span>
          </div>
        )}

        {/* Animated Sound Waveform */}
        <div className="h-20 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-center gap-1.5 px-4 mb-5 overflow-hidden">
          {Array.from({ length: 24 }).map((_, i) => {
            const height = isRecording
              ? Math.sin(i * 0.5 + Date.now() / 150) * 22 + 28
              : isPlayingPreview
              ? Math.sin(i * 0.8) * 18 + 24
              : 8;
            return (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-150 ${
                  isRecording
                    ? 'bg-rose-500 animate-pulse'
                    : isPlayingPreview
                    ? 'bg-indigo-400'
                    : 'bg-slate-700'
                }`}
                style={{ height: `${Math.max(6, Math.min(60, height))}px` }}
              />
            );
          })}
        </div>

        <div className="text-2xl font-mono font-bold text-white mb-6">
          {formatTime(seconds)}
        </div>

        <div className="flex items-center justify-center gap-3">
          {isRecording ? (
            <button
              onClick={handleStopRecording}
              className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-rose-900/30 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-white" />
              Detener y Guardar
            </button>
          ) : (
            <>
              <button
                onClick={startActualRecording}
                className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl transition-colors cursor-pointer"
                title="Volver a grabar"
              >
                <Trash2 className="w-5 h-5 text-rose-400" />
              </button>

              <button
                onClick={togglePreview}
                className="flex items-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-semibold text-sm transition-colors cursor-pointer"
              >
                {isPlayingPreview ? (
                  <>
                    <Pause className="w-4 h-4" /> Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" /> Escuchar
                  </>
                )}
              </button>

              <button
                onClick={handleSend}
                className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                Enviar Audio
              </button>
            </>
          )}
        </div>

        <button
          onClick={onClose}
          className="mt-5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};
