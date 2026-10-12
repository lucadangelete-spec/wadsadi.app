import React from 'react';
import {
  Users,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  Info,
  Radio,
  Sparkles,
  Bookmark,
  Video
} from 'lucide-react';
import { ChatSpace } from '../types/chat';

interface ChatHeaderProps {
  currentSpace: ChatSpace;
  membersCount: number;
  onOpenMembersModal: () => void;
  onRefreshMessages: () => void;
  isRefreshing: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onToggleSearchInChat: () => void;
  isSearchInChatOpen: boolean;
  isLiveGoogleMode: boolean;
  onOpenSetupNotice: () => void;
  hasStarredInSpace: boolean;
  onToggleShowStarredOnly: () => void;
  showingStarredOnly: boolean;
  onInitiateVideoCall?: () => void;
}


export const ChatHeader: React.FC<ChatHeaderProps> = ({
  currentSpace,
  membersCount,
  onOpenMembersModal,
  onRefreshMessages,
  isRefreshing,
  soundEnabled,
  onToggleSound,
  onToggleSearchInChat,
  isSearchInChatOpen,
  isLiveGoogleMode,
  onOpenSetupNotice,
  hasStarredInSpace,
  onToggleShowStarredOnly,
  showingStarredOnly,
  onInitiateVideoCall,
}) => {
  return (
    <header className="h-16 px-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex items-center justify-between text-slate-100 select-none z-10">
      {/* Title & Metadata */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          {currentSpace.avatarUrl ? (
            <img
              src={currentSpace.avatarUrl}
              alt={currentSpace.displayName}
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-800"
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-800 to-purple-800 flex items-center justify-center font-bold text-sm text-white">
              {currentSpace.displayName.slice(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm md:text-base text-white truncate max-w-[220px] md:max-w-md">
              {currentSpace.displayName}
            </h2>

            {currentSpace.isRealGoogleSpace ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                <Radio className="w-3 h-3 animate-pulse" /> Google Chat
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Sparkles className="w-3 h-3" /> Interactivo
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 truncate max-w-[300px]">
            {currentSpace.description || `${membersCount} participantes en la conversación`}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 md:gap-2">
        {/* Video Call Trigger */}
        {onInitiateVideoCall && (
          <button
            onClick={onInitiateVideoCall}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white border border-emerald-500/30 transition-all font-semibold text-xs cursor-pointer shadow-sm hover:scale-105"
            title="Iniciar videollamada con cámara y audio"
          >
            <Video className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Videollamada</span>
          </button>
        )}

        {/* Toggle Starred Filter */}
        <button
          onClick={onToggleShowStarredOnly}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            showingStarredOnly
              ? 'bg-amber-500/20 text-amber-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title={showingStarredOnly ? 'Ver todos los mensajes' : 'Ver solo destacados'}
        >
          <Bookmark className={`w-4 h-4 ${showingStarredOnly ? 'fill-amber-400' : ''}`} />
        </button>

        {/* Toggle in-chat search */}
        <button
          onClick={onToggleSearchInChat}
          className={`p-2 rounded-xl transition-colors cursor-pointer ${
            isSearchInChatOpen
              ? 'bg-indigo-600/30 text-indigo-300'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
          title="Buscar en mensajes"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Sound Toggle */}
        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos de notificación'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" />
          )}
        </button>

        {/* Members Modal Trigger */}
        <button
          onClick={onOpenMembersModal}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 transition-colors cursor-pointer"
          title="Ver miembros"
        >
          <Users className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">{membersCount} miembros</span>
        </button>

        {/* Refresh button */}
        <button
          onClick={onRefreshMessages}
          disabled={isRefreshing}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          title="Sincronizar y actualizar mensajes"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>
    </header>
  );
};
