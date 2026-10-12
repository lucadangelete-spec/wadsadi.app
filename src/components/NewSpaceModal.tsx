import React, { useState } from 'react';
import { PlusCircle, Hash, MessageSquare, Users, X } from 'lucide-react';

interface NewSpaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSpace: (name: string, type: 'SPACE' | 'GROUP_CHAT', description: string) => void;
}

export const NewSpaceModal: React.FC<NewSpaceModalProps> = ({
  isOpen,
  onClose,
  onCreateSpace,
}) => {
  const [displayName, setDisplayName] = useState('');
  const [description, setDescription] = useState('');
  const [spaceType, setSpaceType] = useState<'SPACE' | 'GROUP_CHAT'>('SPACE');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;
    onCreateSpace(displayName.trim(), spaceType, description.trim());
    setDisplayName('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Nuevo Espacio de Chat</h3>
              <p className="text-xs text-slate-400">Crea una sala de conversación para colaborar</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Nombre del Espacio *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ej. Lanzamiento de Producto, Equipo de Diseño..."
                className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                autoFocus
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Tipo de Conversación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSpaceType('SPACE')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  spaceType === 'SPACE'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Users className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Espacio (Space)</div>
                  <div className="text-[10px] text-slate-400">Para proyectos y equipos</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setSpaceType('GROUP_CHAT')}
                className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  spaceType === 'GROUP_CHAT'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <MessageSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                <div>
                  <div className="text-xs font-semibold">Chat Grupal</div>
                  <div className="text-[10px] text-slate-400">Charlas directas rápidas</div>
                </div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Descripción o Propósito (opcional)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="¿De qué trata este espacio y quiénes deben participar?"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!displayName.trim()}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-900/30 transition-all cursor-pointer"
            >
              Crear Espacio
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
