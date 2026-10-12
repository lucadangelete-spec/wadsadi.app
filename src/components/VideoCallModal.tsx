import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Maximize2,
  Minimize2,
  User,
  Shield,
  Volume2
} from 'lucide-react';
import { FirestoreCall, ChatService } from '../services/chatService';

interface VideoCallModalProps {
  call: FirestoreCall | null;
  currentUserId: string;
  onClose: () => void;
}

export const VideoCallModal: React.FC<VideoCallModalProps> = ({
  call,
  currentUserId,
  onClose,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const isCaller = call?.callerId === currentUserId;
  const partnerName = isCaller ? call?.receiverName : call?.callerName;
  const partnerPhoto = isCaller ? undefined : call?.callerPhoto;

  // Initialize camera and mic
  useEffect(() => {
    if (!call) return;

    let mounted = true;

    async function startMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: call?.type === 'video',
          audio: true,
        });

        if (mounted) {
          localStreamRef.current = stream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err: any) {
        console.warn('No se pudo acceder a la cámara/micrófono:', err);
        setCameraError(
          'Permiso de cámara/micrófono no otorgado o no disponible en este dispositivo. Mostrando modo avatar de llamada.'
        );
      }
    }

    startMedia();

    // Call duration timer
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [call]);

  if (!call) return null;

  const toggleMic = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    } else {
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    } else {
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleEndCall = async () => {
    if (call?.id) {
      await ChatService.updateCallStatus(call.id, 'ended');
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    onClose();
  };

  const formatDuration = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[85vh] bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        
        {/* Top Header Bar */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-white font-bold text-sm">
              {partnerPhoto ? (
                <img src={partnerPhoto} alt={partnerName} className="w-full h-full rounded-full object-cover" />
              ) : (
                (partnerName || 'P').slice(0, 1).toUpperCase()
              )}
            </div>
            <div>
              <h3 className="font-bold text-sm md:text-base text-white flex items-center gap-2">
                {partnerName}
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-xs text-slate-300 font-mono">
                {call.type === 'video' ? 'Videollamada en vivo' : 'Llamada de voz'} • {formatDuration(callDuration)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-full border border-slate-700 text-xs text-emerald-400 font-medium">
            <Shield className="w-3.5 h-3.5" />
            Conexión encriptada
          </div>
        </div>

        {/* Remote Main Video / Call Stage */}
        <div className="relative flex-1 w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden">
          {call.type === 'video' && !isVideoOff ? (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Main Participant Video Simulation / Stream */}
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
              <div className="absolute top-16 left-4 bg-slate-950/70 border border-slate-800 text-slate-200 text-xs px-2.5 py-1 rounded-lg backdrop-blur-xs">
                Tu cámara en vivo
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="relative">
                <div className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 p-1 shadow-2xl animate-pulse">
                  {partnerPhoto ? (
                    <img src={partnerPhoto} alt={partnerName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-4xl font-bold text-white">
                      {(partnerName || 'U').slice(0, 1).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 rounded-full text-white ring-4 ring-slate-950">
                  <Volume2 className="w-5 h-5 animate-bounce" />
                </div>
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">{partnerName}</h4>
                <p className="text-xs text-slate-400 mt-1">Conectado en tiempo real</p>
              </div>
            </div>
          )}

          {cameraError && (
            <div className="absolute top-16 right-4 max-w-xs bg-amber-950/80 border border-amber-800 text-amber-200 text-xs p-3 rounded-xl backdrop-blur-xs">
              {cameraError}
            </div>
          )}
        </div>

        {/* Floating PIP Local Preview (if audio call or partner view active) */}
        {call.type === 'video' && (
          <div className="absolute bottom-24 right-5 w-32 h-44 md:w-44 md:h-60 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-2xl bg-black z-20">
            {partnerPhoto ? (
              <img src={partnerPhoto} alt={partnerName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-slate-800 flex flex-col items-center justify-center p-2 text-center">
                <User className="w-8 h-8 text-indigo-400 mb-1" />
                <span className="text-[10px] text-slate-300 font-semibold truncate max-w-full">{partnerName}</span>
                <span className="text-[9px] text-emerald-400">Receptor</span>
              </div>
            )}
          </div>
        )}

        {/* Bottom Call Control Bar */}
        <div className="relative z-20 flex items-center justify-center gap-4 p-5 bg-gradient-to-t from-black via-black/80 to-transparent">
          {/* Mute Mic */}
          <button
            onClick={toggleMic}
            className={`p-3.5 rounded-full transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-white'
            }`}
            title={isMuted ? 'Activar micrófono' : 'Silenciar micrófono'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Toggle Video Camera */}
          {call.type === 'video' && (
            <button
              onClick={toggleVideo}
              className={`p-3.5 rounded-full transition-all cursor-pointer ${
                isVideoOff
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-white'
              }`}
              title={isVideoOff ? 'Activar cámara' : 'Apagar cámara'}
            >
              {isVideoOff ? <VideoOff className="w-5 h-5" /> : <VideoIcon className="w-5 h-5" />}
            </button>
          )}

          {/* Hang up / End Call */}
          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-full font-bold text-sm shadow-xl shadow-rose-900/40 hover:scale-105 transition-all cursor-pointer"
          >
            <PhoneOff className="w-5 h-5" />
            Finalizar Llamada
          </button>
        </div>

      </div>
    </div>
  );
};
