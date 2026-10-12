import React, { useState, useEffect, useCallback } from 'react';
import {
  Menu,
  X,
  Search,
  Sparkles,
  Radio,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Users,
  Video,
  Phone,
  MessageSquare,
  UserCheck
} from 'lucide-react';
import { ChatSpace, ChatMessage, ChatUser, ChatAttachment, ChatMember } from './types/chat';
import {
  initAuth,
  googleSignIn,
  logout,
  getAccessToken,
} from './services/firebaseAuth';
import {
  GoogleChatService,
  GoogleChatApiError,
  GOOGLE_CHAT_CONSOLE_URL
} from './services/googleChatApi';
import {
  ChatService,
  FirestoreConversation,
  FirestoreCall,
  testFirestoreConnection
} from './services/chatService';
import { playSound } from './services/soundEffects';

import { Sidebar } from './components/Sidebar';
import { ChatHeader } from './components/ChatHeader';
import { MessageList } from './components/MessageList';
import { MessageComposer } from './components/MessageComposer';
import { ConfirmationModal } from './components/ConfirmationModal';
import { NewSpaceModal } from './components/NewSpaceModal';
import { MembersModal } from './components/MembersModal';
import { GoogleChatSetupNotice } from './components/GoogleChatSetupNotice';
import { VoiceRecorderModal } from './components/VoiceRecorderModal';
import { VideoCallModal } from './components/VideoCallModal';
import { IncomingCallModal } from './components/IncomingCallModal';
import { UserDirectoryModal } from './components/UserDirectoryModal';

const DEFAULT_GUEST_USER: ChatUser = {
  id: 'guest-user',
  name: 'Tú',
  status: 'online',
  statusMessage: 'Inicia sesión con Google para conectarte con personas reales',
};

export default function App() {
  // Navigation & Real Spaces
  const [spaces, setSpaces] = useState<ChatSpace[]>([]);
  const [activeSpaceId, setActiveSpaceId] = useState<string>('');
  const [messagesMap, setMessagesMap] = useState<Record<string, ChatMessage[]>>({});
  const [currentUser, setCurrentUser] = useState<ChatUser>(DEFAULT_GUEST_USER);
  const [activePartnerUser, setActivePartnerUser] = useState<ChatUser | null>(null);

  // Authentication
  const [googleUser, setGoogleUser] = useState<any | null>(null);
  const [hasGoogleToken, setHasGoogleToken] = useState<boolean>(false);
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState<boolean>(false);
  const [isLiveGoogleMode, setIsLiveGoogleMode] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [googleChatError, setGoogleChatError] = useState<GoogleChatApiError | null>(null);
  const [isSetupNoticeOpen, setIsSetupNoticeOpen] = useState<boolean>(false);

  // Calls & Real Video
  const [activeCall, setActiveCall] = useState<FirestoreCall | null>(null);
  const [incomingCall, setIncomingCall] = useState<FirestoreCall | null>(null);

  // Modals & Panels
  const [isUserDirectoryOpen, setIsUserDirectoryOpen] = useState<boolean>(false);
  const [isNewSpaceModalOpen, setIsNewSpaceModalOpen] = useState<boolean>(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState<boolean>(false);
  const [isVoiceRecorderOpen, setIsVoiceRecorderOpen] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Filters & Audio
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'spaces' | 'dms' | 'starred'>('all');
  const [inChatSearchOpen, setInChatSearchOpen] = useState<boolean>(false);
  const [inChatSearchQuery, setInChatSearchQuery] = useState<string>('');
  const [showingStarredOnly, setShowingStarredOnly] = useState<boolean>(false);

  // Workspace Confirmation Modal State
  const [confirmationState, setConfirmationState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    confirmLabel?: string;
    details?: { label: string; value: string }[];
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
  });

  // Test Firestore Connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  // Listen for Firebase Auth on load
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        if (token) setHasGoogleToken(true);

        const profile: ChatUser = {
          id: user.uid,
          name: user.displayName || 'Usuario de Google',
          email: user.email || '',
          avatarUrl: user.photoURL || undefined,
          status: 'online',
          role: 'Usuario verificado',
        };
        setCurrentUser(profile);

        // Sync real profile to Firestore
        await ChatService.syncUserProfile(user);
      },
      () => {
        setGoogleUser(null);
        setHasGoogleToken(false);
        setCurrentUser(DEFAULT_GUEST_USER);
        setSpaces([]);
        setActiveSpaceId('');
      }
    );
    return () => unsubscribe();
  }, []);

  // Subscribe to real-time conversations of the current user
  useEffect(() => {
    if (!googleUser) return;

    const unsubscribe = ChatService.subscribeToConversations(googleUser.uid, (convs) => {
      const realSpaces: ChatSpace[] = convs.map((c) => {
        // Find other participant's details
        const otherId = c.participantIds.find((id) => id !== googleUser.uid) || c.participantIds[0];
        const otherDetails = c.participantDetails?.[otherId] || {
          displayName: 'Persona real',
          email: '',
          photoURL: '',
        };

        return {
          id: c.id,
          displayName: otherDetails.displayName,
          type: 'DIRECT_MESSAGE',
          description: otherDetails.email,
          avatarUrl: otherDetails.photoURL,
          lastMessage: c.lastMessage
            ? {
                text: c.lastMessage.text,
                createTime: c.lastMessage.createdAt?.toDate ? c.lastMessage.createdAt.toDate().toISOString() : new Date().toISOString(),
                senderName: c.lastMessage.senderName,
              }
            : undefined,
          unreadCount: 0,
        };
      });

      setSpaces((prev) => {
        // Keep Google spaces if any, merge with real Firestore conversation spaces
        const googleSpaces = prev.filter((s) => s.isRealGoogleSpace);
        return [...realSpaces, ...googleSpaces];
      });

      // If no active space or active space not in list, select first
      if (realSpaces.length > 0 && !activeSpaceId) {
        setActiveSpaceId(realSpaces[0].id);
      }
    });

    return () => unsubscribe();
  }, [googleUser, activeSpaceId]);

  // Subscribe to real-time messages for active conversation
  useEffect(() => {
    if (!activeSpaceId || activeSpaceId.startsWith('spaces/')) return;

    const unsubscribe = ChatService.subscribeToMessages(activeSpaceId, (msgs) => {
      setMessagesMap((prev) => ({
        ...prev,
        [activeSpaceId]: msgs,
      }));
    });

    return () => unsubscribe();
  }, [activeSpaceId]);

  // Subscribe to incoming video / audio calls targeted to current user
  useEffect(() => {
    if (!googleUser) return;

    const unsubscribe = ChatService.subscribeToIncomingCalls(googleUser.uid, (call) => {
      if (call && call.status === 'ringing') {
        setIncomingCall(call);
      } else {
        setIncomingCall(null);
      }
    });

    return () => unsubscribe();
  }, [googleUser]);

  // Active space object
  const currentSpace = spaces.find((s) => s.id === activeSpaceId) || spaces[0] || {
    id: 'placeholder',
    displayName: 'Conversación',
    type: 'DIRECT_MESSAGE',
  };

  const currentMessages = messagesMap[currentSpace.id] || [];

  // Handle Google Sign In
  const handleGoogleSignIn = async () => {
    setIsGoogleSigningIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setHasGoogleToken(true);
        if (soundEnabled) playSound('ding');
        await ChatService.syncUserProfile(res.user);
      }
    } catch (err: any) {
      console.error('Error al iniciar sesión:', err);
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  // Handle Google Sign Out
  const handleGoogleSignOut = async () => {
    await logout();
    setGoogleUser(null);
    setHasGoogleToken(false);
    setIsLiveGoogleMode(false);
    setActiveSpaceId('');
    if (soundEnabled) playSound('pop');
  };

  // Start direct conversation with a searched real person
  const handleSelectUserToChat = async (targetUser: ChatUser) => {
    if (!googleUser) {
      await handleGoogleSignIn();
      return;
    }

    const convId = await ChatService.getOrCreateDirectConversation(currentUser, targetUser);
    setActivePartnerUser(targetUser);
    setActiveSpaceId(convId);
    if (soundEnabled) playSound('ding');
  };

  // Initiate real video call with a searched person or active contact
  const handleInitiateCall = async (targetUser?: ChatUser, type: 'video' | 'audio' = 'video') => {
    if (!googleUser) {
      alert('Debes iniciar sesión con Google para hacer videollamadas.');
      await handleGoogleSignIn();
      return;
    }

    const receiver = targetUser || activePartnerUser || {
      id: currentSpace.id.replace('dm_', '').replace(googleUser.uid, '').replace('_', ''),
      name: currentSpace.displayName,
    };

    if (!receiver.id) {
      alert('Selecciona una persona para iniciar la videollamada.');
      return;
    }

    const callId = await ChatService.initiateCall(
      {
        id: googleUser.uid,
        name: currentUser.name,
        photo: currentUser.avatarUrl,
      },
      {
        id: receiver.id,
        name: receiver.name,
      },
      type
    );

    if (callId) {
      setActiveCall({
        id: callId,
        callerId: googleUser.uid,
        callerName: currentUser.name,
        callerPhoto: currentUser.avatarUrl,
        receiverId: receiver.id,
        receiverName: receiver.name,
        type,
        status: 'ringing',
      });
      if (soundEnabled) playSound('send');
    }
  };

  // Accept incoming call
  const handleAcceptIncomingCall = async () => {
    if (!incomingCall) return;
    await ChatService.updateCallStatus(incomingCall.id, 'accepted');
    setActiveCall(incomingCall);
    setIncomingCall(null);
    if (soundEnabled) playSound('ding');
  };

  // Decline incoming call
  const handleDeclineIncomingCall = async () => {
    if (!incomingCall) return;
    await ChatService.updateCallStatus(incomingCall.id, 'declined');
    setIncomingCall(null);
    if (soundEnabled) playSound('pop');
  };

  // Send message to real recipient (or Google Chat)
  const handleSendMessage = async (text: string, attachments?: ChatAttachment[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;

    // Check if sending to Google Chat Workspace space
    if (currentSpace.isRealGoogleSpace && isLiveGoogleMode) {
      const token = getAccessToken();
      if (!token) {
        alert('Debes iniciar sesión con Google para enviar mensajes a Google Chat.');
        return;
      }

      setConfirmationState({
        isOpen: true,
        title: 'Confirmar envío a Google Chat',
        description: 'Estás a punto de enviar este mensaje a través de la API oficial de Google Chat en tu organización de Workspace. ¿Deseas proceder con el envío?',
        confirmLabel: 'Enviar Mensaje',
        details: [
          { label: 'Espacio de destino', value: currentSpace.displayName },
          { label: 'Contenido', value: text.slice(0, 60) + (text.length > 60 ? '...' : '') },
        ],
        onConfirm: async () => {
          setConfirmationState((prev) => ({ ...prev, isOpen: false }));
          setIsRefreshing(true);
          const { message, error } = await GoogleChatService.sendMessage(
            token,
            currentSpace.name || currentSpace.id,
            text
          );
          setIsRefreshing(false);

          if (error) {
            setGoogleChatError(error);
            setIsSetupNoticeOpen(true);
          } else if (message) {
            if (soundEnabled) playSound('send');
            setMessagesMap((prev) => ({
              ...prev,
              [currentSpace.id]: [...(prev[currentSpace.id] || []), message],
            }));
          }
        },
      });
      return;
    }

    // Direct Conversation between real people in Firestore
    if (!googleUser) {
      alert('Inicia sesión con Google para enviar mensajes a otras personas.');
      await handleGoogleSignIn();
      return;
    }

    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        if (att.type === 'audio') {
          await ChatService.sendAudioMessage(
            currentSpace.id,
            currentUser,
            att.url,
            att.duration || '0:05'
          );
        } else if (att.type === 'image') {
          await ChatService.sendImageMessage(
            currentSpace.id,
            currentUser,
            att.url
          );
        }
      }
    }

    if (text.trim()) {
      await ChatService.sendTextMessage(currentSpace.id, currentUser, text);
    }

    if (soundEnabled) playSound('send');
  };

  // Handle voice note sending
  const handleSendVoiceNote = async (audioDataUrl: string, audioDuration: string) => {
    if (!currentSpace.id || currentSpace.id === 'placeholder') {
      setIsUserDirectoryOpen(true);
      return;
    }

    const voiceAttachment: ChatAttachment = {
      id: `voice-${Date.now()}`,
      name: `Nota_de_voz_${Date.now()}.webm`,
      type: 'audio',
      url: audioDataUrl,
      duration: audioDuration,
    };
    await handleSendMessage('', [voiceAttachment]);
  };

  // Toggle reaction
  const handleToggleReaction = (messageId: string, emoji: string) => {
    if (soundEnabled) playSound('pop');
  };

  // Toggle Star
  const handleToggleStar = (messageId: string) => {
    setMessagesMap((prev) => {
      const spaceMsgs = prev[currentSpace.id] || [];
      const updated = spaceMsgs.map((m) =>
        m.id === messageId ? { ...m, isStarred: !m.isStarred } : m
      );
      return { ...prev, [currentSpace.id]: updated };
    });
  };

  // Total Starred count
  const totalStarredCount = Object.values(messagesMap)
    .flat()
    .filter((m) => m.isStarred).length;

  const displayMessages = showingStarredOnly
    ? currentMessages.filter((m) => m.isStarred)
    : currentMessages;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}

      {/* Sidebar Navigation */}
      <div
        className={`fixed inset-y-0 left-0 z-40 transform md:relative md:translate-x-0 transition-transform duration-200 ease-in-out ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <Sidebar
          spaces={spaces}
          activeSpaceId={activeSpaceId}
          onSelectSpace={(id) => {
            setActiveSpaceId(id);
            setIsMobileSidebarOpen(false);
            setShowingStarredOnly(false);
          }}
          onOpenNewSpaceModal={() => setIsNewSpaceModalOpen(true)}
          currentUser={currentUser}
          onChangeUserStatus={(st) => setCurrentUser((prev) => ({ ...prev, status: st }))}
          googleUser={googleUser}
          hasGoogleToken={hasGoogleToken}
          onGoogleSignIn={handleGoogleSignIn}
          onGoogleSignOut={handleGoogleSignOut}
          isGoogleSigningIn={isGoogleSigningIn}
          isLiveGoogleMode={isLiveGoogleMode}
          onToggleLiveGoogleMode={(enabled) => setIsLiveGoogleMode(enabled)}
          onOpenSetupGuide={() => setIsSetupNoticeOpen(true)}
          hasGoogleChatError={Boolean(googleChatError)}
          starredCount={totalStarredCount}
          activeFilter={activeFilter}
          onChangeFilter={setActiveFilter}
          onOpenUserDirectory={() => setIsUserDirectoryOpen(true)}
        />
      </div>

      {/* Main Chat Interface */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-900/60 relative">
        {/* Mobile Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-bold text-sm text-white flex items-center gap-1.5">
            ChatSpace <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1 py-0.2 rounded font-mono">PRO</span>
          </span>
          <button
            onClick={() => setIsUserDirectoryOpen(true)}
            className="p-1.5 rounded-lg bg-indigo-600 text-white transition-colors cursor-pointer"
            title="Buscar personas reales"
          >
            <Users className="w-4 h-4" />
          </button>
        </div>

        {/* If no user signed in or no conversations selected, show interactive welcome prompt */}
        {(!googleUser || spaces.length === 0 || !activeSpaceId) ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-lg mx-auto">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-2xl shadow-indigo-950/50 mb-6 animate-pulse">
              <Users className="w-10 h-10" />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">
              Conéctate con Personas Reales
            </h2>

            <p className="text-sm text-slate-300 leading-relaxed mb-6">
              Sin bots. Busca personas por su nombre o correo, verifica si existen en el sistema, mira su foto de perfil de Google, envía mensajes, notas de voz y haz videollamadas con cámara en vivo.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
              {!googleUser ? (
                <button
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleSigningIn}
                  className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-6 py-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm rounded-2xl shadow-lg transition-all hover:scale-105 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                  </svg>
                  Iniciar sesión con Google
                </button>
              ) : (
                <button
                  onClick={() => setIsUserDirectoryOpen(true)}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold text-sm rounded-2xl shadow-xl shadow-indigo-950/50 transition-all hover:scale-105 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  Buscar y Elegir Personas
                </button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* In-Chat Search Bar */}
            {inChatSearchOpen && (
              <div className="px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center gap-3">
                <Search className="w-4 h-4 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={inChatSearchQuery}
                  onChange={(e) => setInChatSearchQuery(e.target.value)}
                  placeholder="Buscar palabras en esta conversación..."
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                  autoFocus
                />
                {inChatSearchQuery && (
                  <button
                    onClick={() => setInChatSearchQuery('')}
                    className="text-xs text-slate-400 hover:text-slate-200"
                  >
                    Limpiar
                  </button>
                )}
                <button
                  onClick={() => {
                    setInChatSearchOpen(false);
                    setInChatSearchQuery('');
                  }}
                  className="p-1 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Chat Header */}
            <ChatHeader
              currentSpace={currentSpace}
              membersCount={2}
              onOpenMembersModal={() => setIsMembersModalOpen(true)}
              onRefreshMessages={() => {}}
              isRefreshing={isRefreshing}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              onToggleSearchInChat={() => setInChatSearchOpen(!inChatSearchOpen)}
              isSearchInChatOpen={inChatSearchOpen}
              isLiveGoogleMode={isLiveGoogleMode}
              onOpenSetupNotice={() => setIsSetupNoticeOpen(true)}
              hasStarredInSpace={currentMessages.some((m) => m.isStarred)}
              onToggleShowStarredOnly={() => setShowingStarredOnly(!showingStarredOnly)}
              showingStarredOnly={showingStarredOnly}
              onInitiateVideoCall={() => handleInitiateCall(undefined, 'video')}
            />

            {/* Messages Stream */}
            <MessageList
              messages={displayMessages}
              currentUserId={currentUser.id}
              typingUser={null}
              onToggleReaction={handleToggleReaction}
              onToggleStar={handleToggleStar}
              soundEnabled={soundEnabled}
              searchFilter={inChatSearchQuery}
            />

            {/* Message Composer */}
            <MessageComposer
              onSendMessage={handleSendMessage}
              onOpenVoiceRecorder={() => setIsVoiceRecorderOpen(true)}
              placeholder={`Enviar mensaje o audio a ${currentSpace.displayName}...`}
            />
          </>
        )}
      </main>

      {/* Real Users Search & Verification Directory Modal */}
      <UserDirectoryModal
        isOpen={isUserDirectoryOpen}
        onClose={() => setIsUserDirectoryOpen(false)}
        currentUserId={googleUser?.uid || ''}
        onSelectUserToChat={handleSelectUserToChat}
        onInitiateCallWithUser={(u, type) => handleInitiateCall(u, type)}
      />

      {/* Video Call Modal (Live Webcam & Microphone) */}
      <VideoCallModal
        call={activeCall}
        currentUserId={googleUser?.uid || ''}
        onClose={() => setActiveCall(null)}
      />

      {/* Incoming Call Notification Modal */}
      <IncomingCallModal
        call={incomingCall}
        onAccept={handleAcceptIncomingCall}
        onDecline={handleDeclineIncomingCall}
      />

      {/* Voice Recorder Modal (Real Web Audio Recorder) */}
      <VoiceRecorderModal
        isOpen={isVoiceRecorderOpen}
        onClose={() => setIsVoiceRecorderOpen(false)}
        onSendVoiceNote={handleSendVoiceNote}
      />

      {/* Workspace Confirmation Dialog */}
      <ConfirmationModal
        isOpen={confirmationState.isOpen}
        title={confirmationState.title}
        description={confirmationState.description}
        confirmLabel={confirmationState.confirmLabel}
        details={confirmationState.details}
        onConfirm={confirmationState.onConfirm}
        onCancel={() => setConfirmationState((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* New Space Modal */}
      <NewSpaceModal
        isOpen={isNewSpaceModalOpen}
        onClose={() => setIsNewSpaceModalOpen(false)}
        onCreateSpace={(name, type, desc) => {}}
      />

      {/* Members Modal */}
      <MembersModal
        isOpen={isMembersModalOpen}
        spaceName={currentSpace.displayName}
        members={[
          {
            id: currentUser.id,
            name: currentUser.name,
            displayName: currentUser.name,
            avatarUrl: currentUser.avatarUrl,
            email: currentUser.email,
            role: 'ROLE_MANAGER',
          },
        ]}
        onClose={() => setIsMembersModalOpen(false)}
      />

      {/* Google Chat Setup Notice */}
      <GoogleChatSetupNotice
        isOpen={isSetupNoticeOpen}
        onClose={() => setIsSetupNoticeOpen(false)}
        onSwitchToDemoMode={() => {
          setIsLiveGoogleMode(false);
          setGoogleChatError(null);
        }}
        errorMessage={googleChatError?.message}
        isConsumerAccount={googleChatError?.isConsumerAccountError}
      />
    </div>
  );
}
