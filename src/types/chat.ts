export interface ChatUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  statusMessage?: string;
  role?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'audio';
  url: string;
  size?: string;
  duration?: string; // for audio
}

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs or names
}

export interface ChatMessage {
  id: string;
  name?: string; // Google Chat resource name: spaces/{space}/messages/{message}
  spaceId: string;
  sender: ChatUser;
  text: string;
  createTime: string; // ISO string
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  isStarred?: boolean;
  isPending?: boolean;
}

export interface ChatSpace {
  id: string;
  name?: string; // Google Chat resource name: spaces/{space}
  displayName: string;
  type: 'SPACE' | 'GROUP_CHAT' | 'DIRECT_MESSAGE';
  description?: string;
  avatarUrl?: string;
  unreadCount?: number;
  lastMessage?: {
    text: string;
    createTime: string;
    senderName: string;
  };
  membersCount?: number;
  isRealGoogleSpace?: boolean;
}

export interface ChatMember {
  id: string;
  name: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  role: 'ROLE_MEMBER' | 'ROLE_MANAGER';
}
