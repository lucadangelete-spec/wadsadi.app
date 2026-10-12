import React from 'react';
import { ExternalLink, AlertTriangle, Sparkles, Building2, UserCheck, X } from 'lucide-react';
import { GOOGLE_CHAT_CONSOLE_URL } from '../services/googleChatApi';

interface GoogleChatSetupNoticeProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToDemoMode: () => void;
  errorMessage?: string;
  isConsumerAccount?: boolean;
}

export const GoogleChatSetupNotice: React.FC<GoogleChatSetupNoticeProps> = ({
  isOpen,
  onClose,
  onSwitchToDemoMode,
  errorMessage,
  isConsumerAccount = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-indigo-500 to-emerald-500" />
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Requisitos de Google Chat API</h3>
              <p className="text-xs text-slate-400">Google Workspace & Cloud Console</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 mb-4 text-xs text-rose-300">
            <strong>Respuesta de Google:</strong> {errorMessage}
          </div>
        )}

        <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed mb-6">
          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <Building2 className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">1. Cuenta empresarial o educativa</p>
              <p className="text-slate-400 mt-0.5">
                La API oficial de Google Chat está restringida por Google a cuentas de Google Workspace (Business, Enterprise o Education). Las cuentas personales gratuitas (@gmail.com) no tienen permisos de API para Chat.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/50">
            <ExternalLink className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-200">2. Registro de App de Chat en Google Cloud Console</p>
              <p className="text-slate-400 mt-0.5">
                Para que la API responda en una organización, se debe completar la configuración de nombre y avatar en la consola de Google Cloud:
              </p>
              <a
                href={GOOGLE_CHAT_CONSOLE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-indigo-400 hover:text-indigo-300 font-semibold underline underline-offset-2"
              >
                Abrir Configuración de Chat en Cloud Console
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
            <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-300">¡Modo Interactivo Pro disponible al 100%!</p>
              <p className="text-emerald-400/80 mt-0.5">
                Puedes probar inmediatamente todas las funciones de la app modificada: chatear con compañeros inteligentes (Sofía, Carlos, Valentina), notas de voz interactivas, reacciones, fotos, espacios y filtros.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
          >
            Entendido
          </button>
          <button
            type="button"
            onClick={() => {
              onSwitchToDemoMode();
              onClose();
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Activar Modo Interactivo Pro
          </button>
        </div>
      </div>
    </div>
  );
};
