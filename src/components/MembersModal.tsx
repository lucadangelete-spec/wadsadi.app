import React from 'react';
import { Users, Shield, User, X, CheckCircle, Mail } from 'lucide-react';
import { ChatMember } from '../types/chat';

interface MembersModalProps {
  isOpen: boolean;
  spaceName: string;
  members: ChatMember[];
  onClose: () => void;
}

export const MembersModal: React.FC<MembersModalProps> = ({
  isOpen,
  spaceName,
  members,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 text-slate-100"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-white">Miembros del Espacio</h3>
              <p className="text-xs text-slate-400 truncate max-w-[240px]">{spaceName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-400 mb-3 flex items-center justify-between">
          <span>{members.length} personas en esta conversación</span>
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle className="w-3.5 h-3.5" /> Sincronizado
          </span>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {members.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No se encontraron miembros registrados aún.
            </div>
          ) : (
            members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
              >
                <div className="flex items-center gap-3">
                  {member.avatarUrl ? (
                    <img
                      src={member.avatarUrl}
                      alt={member.displayName}
                      className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-700"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-semibold text-xs border border-indigo-500/30">
                      {member.displayName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{member.displayName}</h4>
                    {member.email && (
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-500" /> {member.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  {member.role === 'ROLE_MANAGER' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      <Shield className="w-3 h-3" /> Administrador
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                      <User className="w-3 h-3" /> Miembro
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
