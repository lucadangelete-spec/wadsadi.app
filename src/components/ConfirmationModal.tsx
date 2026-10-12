import React from 'react';
import { ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  details?: { label: string; value: string }[];
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirmar y proceder',
  cancelLabel = 'Cancelar',
  isDestructive = false,
  details = [],
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100 relative overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
        
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${isDestructive ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">{title}</h3>
              <p className="text-xs text-slate-400">Verificación de seguridad de Google Workspace</p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          {description}
        </p>

        {details.length > 0 && (
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5 mb-5 space-y-2 text-xs">
            {details.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center gap-2">
                <span className="text-slate-400 font-medium">{item.label}:</span>
                <span className="text-slate-200 font-semibold truncate max-w-[220px]" title={item.value}>{item.value}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-xl transition-all cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg transition-all cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-900/30'
                : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-900/30'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
