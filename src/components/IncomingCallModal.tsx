import React, { useEffect } from 'react';
import { Phone, PhoneOff, Video, User } from 'lucide-react';
import { FirestoreCall } from '../services/chatService';
import { playSound } from '../services/soundEffects';

interface IncomingCallModalProps {
  call: FirestoreCall | null;
  onAccept: () => void;
  onDecline: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  call,
  onAccept,
  onDecline,
}) => {
  useEffect(() => {
    if (call) {
      playSound('ding');
      const ringInterval = setInterval(() => {
        playSound('ding');
      }, 3000);
      return () => clearInterval(ringInterval);
    }
  }, [call]);

  if (!call) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 text-center relative overflow-hidden">
        {/* Animated pulsating ring */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-indigo-500 to-emerald-500 animate-pulse" />

        <div className="my-4 relative inline-block">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-emerald-500 to-indigo-600 p-1 mx-auto animate-bounce">
            {call.callerPhoto ? (
              <img
                src={call.callerPhoto}
                alt={call.callerName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-slate-800 flex items-center justify-center text-3xl font-bold text-white">
                {call.callerName.slice(0, 1).toUpperCase()}
              </div>
            )}
          </div>
          <span className="absolute bottom-1 right-1 p-2 bg-emerald-500 rounded-full text-white ring-4 ring-slate-900">
            {call.type === 'video' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
          </span>
        </div>

        <h3 className="text-xl font-bold text-white mb-1">{call.callerName}</h3>
        <p className="text-xs text-emerald-400 font-medium mb-6 animate-pulse">
          Llamada de {call.type === 'video' ? 'video' : 'voz'} entrante...
        </p>

        <div className="flex items-center justify-center gap-6">
          {/* Decline */}
          <button
            onClick={onDecline}
            className="flex flex-col items-center gap-1.5 p-4 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-full transition-all cursor-pointer group hover:scale-110"
            title="Rechazar llamada"
          >
            <PhoneOff className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Rechazar</span>
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-1.5 p-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-900/40 transition-all cursor-pointer hover:scale-110 animate-pulse"
            title="Aceptar llamada"
          >
            <Phone className="w-6 h-6" />
            <span className="text-[10px] font-semibold">Aceptar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
