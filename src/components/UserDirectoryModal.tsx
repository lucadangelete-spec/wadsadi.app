import React, { useState, useEffect } from 'react';
import {
  Search,
  UserCheck,
  UserX,
  MessageSquare,
  Video,
  X,
  Users,
  Sparkles,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { ChatUser } from '../types/chat';
import { ChatService } from '../services/chatService';

interface UserDirectoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
  onSelectUserToChat: (user: ChatUser) => void;
  onInitiateCallWithUser: (user: ChatUser, type: 'video' | 'audio') => void;
}

export const UserDirectoryModal: React.FC<UserDirectoryModalProps> = ({
  isOpen,
  onClose,
  currentUserId,
  onSelectUserToChat,
  onInitiateCallWithUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState<ChatUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<ChatUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exactMatch, setExactMatch] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    setIsLoading(true);
    const users = await ChatService.getAllRegisteredUsers(currentUserId);
    setAllUsers(users);
    setFilteredUsers(users);
    setIsLoading(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    const q = term.toLowerCase().trim();
    if (!q) {
      setFilteredUsers(allUsers);
      setExactMatch(false);
      return;
    }

    const filtered = allUsers.filter(
      (u) =>
        (u.name && u.name.toLowerCase().includes(q)) ||
        (u.email && u.email.toLowerCase().includes(q))
    );

    setFilteredUsers(filtered);
    setExactMatch(
      filtered.some(
        (u) =>
          u.name.toLowerCase() === q ||
          (u.email && u.email.toLowerCase() === q)
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl p-6 text-slate-100 relative overflow-hidden flex flex-col max-h-[85vh]"
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Buscar Personas Reales</h3>
              <p className="text-xs text-slate-400">
                Verifica usuarios registrados con Google y chatea o llama en vivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Escribe el nombre o correo exacto para verificar..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-2xl text-xs md:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              autoFocus
            />
          </div>

          {/* Verification Status Alert */}
          {searchTerm.trim().length > 0 && (
            <div className="mt-2.5">
              {filteredUsers.length > 0 ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>
                    <strong>¡Usuario encontrado!</strong> {filteredUsers.length} persona(s) registrada(s) coinciden en el sistema.
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    <strong>No existe ningún usuario registrado con ese nombre o correo.</strong> Pídele a esa persona que inicie sesión con Google en la app para aparecer aquí.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* User List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {isLoading ? (
            <div className="p-8 text-center text-xs text-slate-400">
              Cargando personas registradas...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              {searchTerm ? 'No se encontraron resultados.' : 'Aún no hay otras personas registradas en la base de datos.'}
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/90 hover:border-slate-700 transition-all group"
              >
                {/* Photo & Details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    {user.avatarUrl ? (
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-slate-700 group-hover:ring-indigo-500 transition-all"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 text-indigo-300 flex items-center justify-center font-bold text-base border border-indigo-500/30">
                        {user.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-slate-950" />
                  </div>

                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm text-slate-100 truncate flex items-center gap-1.5">
                      {user.name}
                      <span title="Usuario de Google verificado">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      </span>
                    </h4>
                    {user.email && (
                      <p className="text-xs text-slate-400 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                        {user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions: Chat & Video Call */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <button
                    onClick={() => {
                      onSelectUserToChat(user);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-900/30 transition-all hover:scale-105 cursor-pointer"
                    title="Enviar mensaje"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Chatear</span>
                  </button>

                  <button
                    onClick={() => {
                      onInitiateCallWithUser(user, 'video');
                      onClose();
                    }}
                    className="p-2 bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-xl text-xs font-semibold transition-all hover:scale-105 cursor-pointer"
                    title="Iniciar videollamada"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>{allUsers.length} persona(s) registrada(s)</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
