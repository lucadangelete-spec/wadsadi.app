import React, { useState } from 'react';
import {
  MessageSquare,
  Users,
  Search,
  Plus,
  Radio,
  LogOut,
  ChevronDown,
  Sparkles,
  Bookmark,
  Info,
  CheckCircle2,
  CircleDot
} from 'lucide-react';
import { ChatSpace, ChatUser } from '../types/chat';

interface SidebarProps {
  spaces: ChatSpace[];
  activeSpaceId: string;
  onSelectSpace: (spaceId: string) => void;
  onOpenNewSpaceModal: () => void;
  currentUser: ChatUser;
  onChangeUserStatus: (status: 'online' | 'away' | 'busy' | 'offline') => void;
  googleUser: any | null;
  hasGoogleToken: boolean;
  onGoogleSignIn: () => void;
  onGoogleSignOut: () => void;
  isGoogleSigningIn: boolean;
  isLiveGoogleMode: boolean;
  onToggleLiveGoogleMode: (enabled: boolean) => void;
  onOpenSetupGuide: () => void;
  hasGoogleChatError: boolean;
  starredCount: number;
  activeFilter: 'all' | 'spaces' | 'dms' | 'starred';
  onChangeFilter: (filter: 'all' | 'spaces' | 'dms' | 'starred') => void;
  onOpenUserDirectory: () => void;
}


export const Sidebar: React.FC<SidebarProps> = ({
  spaces,
  activeSpaceId,
  onSelectSpace,
  onOpenNewSpaceModal,
  currentUser,
  onChangeUserStatus,
  googleUser,
  hasGoogleToken,
  onGoogleSignIn,
  onGoogleSignOut,
  isGoogleSigningIn,
  isLiveGoogleMode,
  onToggleLiveGoogleMode,
  onOpenSetupGuide,
  hasGoogleChatError,
  starredCount,
  activeFilter,
  onChangeFilter,
  onOpenUserDirectory,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  // Filter spaces based on search and selected tab
  const filteredSpaces = spaces.filter((space) => {
    const matchesSearch = space.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (space.lastMessage?.text || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    if (activeFilter === 'spaces') return space.type === 'SPACE';
    if (activeFilter === 'dms') return space.type === 'DIRECT_MESSAGE' || space.type === 'GROUP_CHAT';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'away':
        return 'bg-amber-500';
      case 'busy':
        return 'bg-rose-500';
      default:
        return 'bg-slate-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online':
        return 'Conectado';
      case 'away':
        return 'Ausente';
      case 'busy':
        return 'No molestar';
      default:
        return 'Desconectado';
    }
  };

  return (
    <aside className="w-80 md:w-88 flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-100 select-none">
      {/* App Branding & Mode Header */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-900/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
                ChatSpace <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">PRO</span>
              </h1>
              <p className="text-[11px] text-slate-400">Mensajería y Google Chat</p>
            </div>
          </div>

          <button
            onClick={onOpenNewSpaceModal}
            className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md shadow-indigo-900/20 hover:scale-105 cursor-pointer"
            title="Crear nuevo espacio"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector Pill */}
        <div className="flex items-center justify-between bg-slate-950/70 p-1.5 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => onToggleLiveGoogleMode(false)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
              !isLiveGoogleMode
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Interactivo Pro
          </button>

          <button
            type="button"
            onClick={() => onToggleLiveGoogleMode(true)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg font-medium transition-all cursor-pointer ${
              isLiveGoogleMode
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            Google Chat
          </button>
        </div>

        {isLiveGoogleMode && hasGoogleChatError && (
          <div className="mt-2.5 flex items-center justify-between px-2.5 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-[11px] text-amber-300">
            <span className="truncate">Requiere setup en Google Cloud</span>
            <button
              onClick={onOpenSetupGuide}
              className="text-amber-200 underline font-semibold ml-2 shrink-0 cursor-pointer"
            >
              Ver guía
            </button>
          </div>
        )}
      </div>

      {/* User Card & Google Account */}
      <div className="px-4 py-3 border-b border-slate-800/60 bg-slate-950/40">
        {googleUser ? (
          <div className="flex items-center justify-between">
            <div className="relative">
              <div 
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="flex items-center gap-2.5 cursor-pointer group"
              >
                <div className="relative">
                  {googleUser.photoURL || currentUser.avatarUrl ? (
                    <img
                      src={googleUser.photoURL || currentUser.avatarUrl}
                      alt={googleUser.displayName || currentUser.name}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-700 group-hover:ring-indigo-500 transition-all"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">
                      {(googleUser.displayName || currentUser.name).slice(0, 1)}
                    </div>
                  )}
                  <span
                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-slate-900 ${getStatusColor(
                      currentUser.status
                    )}`}
                  />
                </div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-slate-200 flex items-center gap-1 group-hover:text-white">
                    <span className="truncate max-w-[120px]">{googleUser.displayName || currentUser.name}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                  <div className="text-[10px] text-slate-400 truncate max-w-[130px]">
                    {googleUser.email || getStatusLabel(currentUser.status)}
                  </div>
                </div>
              </div>

              {/* Status Dropdown */}
              {isStatusDropdownOpen && (
                <div className="absolute left-0 top-11 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-1 z-30">
                  <div className="px-2.5 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Estado de actividad
                  </div>
                  {(['online', 'away', 'busy', 'offline'] as const).map((st) => (
                    <button
                      key={st}
                      onClick={() => {
                        onChangeUserStatus(st);
                        setIsStatusDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700/80 rounded-lg text-left cursor-pointer"
                    >
                      <span className={`w-2 h-2 rounded-full ${getStatusColor(st)}`} />
                      {getStatusLabel(st)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={onGoogleSignOut}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Cerrar sesión de Google"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[11px] text-slate-400">
              Conecta tu cuenta de Google Workspace para usar la API oficial:
            </p>
            {/* Official GSI Styled Button */}
            <button
              onClick={onGoogleSignIn}
              disabled={isGoogleSigningIn}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-white hover:bg-slate-100 text-slate-800 font-medium text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              {isGoogleSigningIn ? 'Iniciando sesión...' : 'Conectar con Google'}
            </button>
          </div>
        )}
      </div>

      {/* Real Users Search & Directory Button */}
      <div className="px-3 pt-3">
        <button
          onClick={onOpenUserDirectory}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-950/40 hover:scale-[1.02] transition-all cursor-pointer"
        >
          <Users className="w-4 h-4" />
          <span>Buscar Personas Reales</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar espacios o chats..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 px-3 pb-2 text-[11px] font-medium border-b border-slate-800/40">
        <button
          onClick={() => onChangeFilter('all')}
          className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => onChangeFilter('spaces')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            activeFilter === 'spaces'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3 h-3" /> Espacios
        </button>
        <button
          onClick={() => onChangeFilter('dms')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
            activeFilter === 'dms'
              ? 'bg-slate-800 text-white font-semibold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-3 h-3" /> Directos
        </button>
        {starredCount > 0 && (
          <button
            onClick={() => onChangeFilter('starred')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors ml-auto cursor-pointer ${
              activeFilter === 'starred'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            <Bookmark className="w-3 h-3" /> {starredCount}
          </button>
        )}
      </div>

      {/* Spaces & Chats List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {filteredSpaces.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No se encontraron conversaciones
          </div>
        ) : (
          filteredSpaces.map((space) => {
            const isActive = space.id === activeSpaceId;
            return (
              <button
                key={space.id}
                onClick={() => onSelectSpace(space.id)}
                className={`w-full flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600/20 text-white border border-indigo-500/40 shadow-xs'
                    : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                {/* Space / DM Avatar */}
                <div className="relative shrink-0">
                  {space.avatarUrl ? (
                    <img
                      src={space.avatarUrl}
                      alt={space.displayName}
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-900 to-slate-800 border border-slate-700/80 flex items-center justify-center text-indigo-300 font-bold text-xs">
                      {space.type === 'SPACE' ? (
                        <Users className="w-5 h-5 text-indigo-400" />
                      ) : (
                        space.displayName.slice(0, 2).toUpperCase()
                      )}
                    </div>
                  )}

                  {space.isRealGoogleSpace && (
                    <span 
                      className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-blue-500 ring-2 ring-slate-900" 
                      title="Sincronizado con Google Chat"
                    />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-xs text-slate-200 truncate">
                      {space.displayName}
                    </span>
                    {space.lastMessage?.createTime && (
                      <span className="text-[10px] text-slate-500 shrink-0 ml-1">
                        {new Date(space.lastMessage.createTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] text-slate-400 truncate">
                    {space.lastMessage ? (
                      <>
                        <span className="text-slate-300 font-medium">
                          {space.lastMessage.senderName.split(' ')[0]}:{' '}
                        </span>
                        {space.lastMessage.text}
                      </>
                    ) : (
                      space.description || 'Sin mensajes aún'
                    )}
                  </p>
                </div>

                {/* Unread Pill */}
                {space.unreadCount && space.unreadCount > 0 ? (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-indigo-500 text-white rounded-full">
                    {space.unreadCount}
                  </span>
                ) : null}
              </button>
            );
          })
        )}
      </div>

      {/* Footer Info & Setup Guide Button */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
        <button
          onClick={onOpenSetupGuide}
          className="flex items-center gap-1.5 text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
        >
          <Info className="w-3.5 h-3.5" />
          <span>Info de Google Chat</span>
        </button>

        <span className="flex items-center gap-1 text-[10px] text-slate-500">
          <CircleDot className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
          Online
        </span>
      </div>
    </aside>
  );
};
