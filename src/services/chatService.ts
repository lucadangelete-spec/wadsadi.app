import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  serverTimestamp,
  getDocFromServer
} from 'firebase/firestore';
import { db, auth } from './firebaseAuth';
import { ChatUser, ChatMessage } from '../types/chat';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot as mandated by skill
export async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'users', 'connection-test'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firestore connection: client offline or waiting for network.");
    }
  }
}

export interface FirestoreConversation {
  id: string;
  participantIds: string[];
  participantDetails: Record<string, {
    displayName: string;
    email: string;
    photoURL?: string;
  }>;
  lastMessage?: {
    text: string;
    senderId: string;
    senderName: string;
    type?: string;
    createdAt?: any;
  };
  updatedAt?: any;
}

export interface FirestoreCall {
  id: string;
  callerId: string;
  callerName: string;
  callerPhoto?: string;
  receiverId: string;
  receiverName: string;
  type: 'video' | 'audio';
  status: 'ringing' | 'accepted' | 'declined' | 'ended';
  createdAt?: any;
}

export class ChatService {
  /**
   * Sync or create current user's profile in Firestore upon Google Login
   */
  static async syncUserProfile(user: { uid: string; displayName?: string | null; email?: string | null; photoURL?: string | null }) {
    const userRef = doc(db, 'users', user.uid);
    const profile = {
      id: user.uid,
      displayName: user.displayName || 'Usuario de Google',
      email: user.email || '',
      photoURL: user.photoURL || '',
      status: 'online',
      lastSeen: new Date().toISOString(),
    };

    try {
      await setDoc(userRef, profile, { merge: true });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
    }
    return profile;
  }

  /**
   * Fetch all registered real users from Firestore
   */
  static async getAllRegisteredUsers(currentUserId?: string): Promise<ChatUser[]> {
    try {
      const usersSnap = await getDocs(collection(db, 'users'));
      const list: ChatUser[] = [];
      usersSnap.forEach((d) => {
        const data = d.data();
        if (data.id !== currentUserId) {
          list.push({
            id: data.id,
            name: data.displayName || 'Usuario',
            email: data.email || '',
            avatarUrl: data.photoURL || '',
            status: data.status || 'offline',
            role: 'Usuario verificado',
          });
        }
      });
      return list;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'users');
      return [];
    }
  }

  /**
   * Search real users by name or email query, and verify existence
   */
  static async searchRealUsers(searchTerm: string, currentUserId?: string): Promise<{ users: ChatUser[]; exactMatch: boolean }> {
    const all = await this.getAllRegisteredUsers(currentUserId);
    const term = searchTerm.toLowerCase().trim();

    if (!term) return { users: all, exactMatch: false };

    const filtered = all.filter((u) => 
      (u.name && u.name.toLowerCase().includes(term)) ||
      (u.email && u.email.toLowerCase().includes(term))
    );

    const exactMatch = filtered.some((u) => 
      (u.email && u.email.toLowerCase() === term) || (u.name && u.name.toLowerCase() === term)
    );

    return { users: filtered, exactMatch };
  }

  /**
   * Find or create a direct conversation between two real users
   */
  static async getOrCreateDirectConversation(
    currentUser: { id: string; name: string; email?: string; avatarUrl?: string },
    otherUser: { id: string; name: string; email?: string; avatarUrl?: string }
  ): Promise<string> {
    // Deterministic conversation ID for two users
    const sortedIds = [currentUser.id, otherUser.id].sort();
    const convId = `dm_${sortedIds[0]}_${sortedIds[1]}`;

    const convRef = doc(db, 'conversations', convId);
    try {
      const snap = await getDoc(convRef);
      if (!snap.exists()) {
        await setDoc(convRef, {
          id: convId,
          participantIds: sortedIds,
          participantDetails: {
            [currentUser.id]: {
              displayName: currentUser.name,
              email: currentUser.email || '',
              photoURL: currentUser.avatarUrl || '',
            },
            [otherUser.id]: {
              displayName: otherUser.name,
              email: otherUser.email || '',
              photoURL: otherUser.avatarUrl || '',
            },
          },
          updatedAt: serverTimestamp(),
        });
      }
      return convId;
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `conversations/${convId}`);
      return convId;
    }
  }

  /**
   * Subscribe to real-time conversations of the current user
   */
  static subscribeToConversations(
    currentUserId: string,
    onUpdate: (convs: FirestoreConversation[]) => void
  ) {
    const q = query(
      collection(db, 'conversations'),
      where('participantIds', 'array-contains', currentUserId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const convs: FirestoreConversation[] = [];
        snapshot.forEach((d) => {
          convs.push(d.data() as FirestoreConversation);
        });
        onUpdate(convs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'conversations');
      }
    );
  }

  /**
   * Subscribe to real-time messages in a conversation
   */
  static subscribeToMessages(
    conversationId: string,
    onUpdate: (messages: ChatMessage[]) => void
  ) {
    const msgsRef = collection(db, 'conversations', conversationId, 'messages');
    const q = query(msgsRef, orderBy('createdAt', 'asc'));

    return onSnapshot(
      q,
      (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          msgs.push({
            id: d.id,
            spaceId: conversationId,
            sender: {
              id: data.senderId,
              name: data.senderName,
              avatarUrl: data.senderPhoto,
              status: 'online',
            },
            text: data.text || '',
            createTime: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : (data.createdAt || new Date().toISOString()),
            attachments: data.audioUrl
              ? [
                  {
                    id: `audio-${d.id}`,
                    name: 'Nota de voz',
                    type: 'audio',
                    url: data.audioUrl,
                    duration: data.audioDuration || '0:05',
                  },
                ]
              : data.imageUrl
              ? [
                  {
                    id: `img-${d.id}`,
                    name: 'Foto compartida',
                    type: 'image',
                    url: data.imageUrl,
                  },
                ]
              : undefined,
            reactions: data.reactions || [],
          });
        });
        onUpdate(msgs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, `conversations/${conversationId}/messages`);
      }
    );
  }

  /**
   * Send a text message to real recipient
   */
  static async sendTextMessage(
    conversationId: string,
    sender: { id: string; name: string; avatarUrl?: string },
    text: string
  ) {
    const msgsRef = collection(db, 'conversations', conversationId, 'messages');
    const convRef = doc(db, 'conversations', conversationId);

    try {
      await addDoc(msgsRef, {
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        senderPhoto: sender.avatarUrl || '',
        text: text.trim(),
        type: 'text',
        createdAt: serverTimestamp(),
      });

      await updateDoc(convRef, {
        lastMessage: {
          text: text.trim(),
          senderId: sender.id,
          senderName: sender.name,
          type: 'text',
          createdAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `conversations/${conversationId}/messages`);
    }
  }

  /**
   * Send a real recorded audio note to real recipient
   */
  static async sendAudioMessage(
    conversationId: string,
    sender: { id: string; name: string; avatarUrl?: string },
    audioDataUrl: string,
    audioDuration: string
  ) {
    const msgsRef = collection(db, 'conversations', conversationId, 'messages');
    const convRef = doc(db, 'conversations', conversationId);

    try {
      await addDoc(msgsRef, {
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        senderPhoto: sender.avatarUrl || '',
        text: '🎙️ Nota de voz',
        type: 'audio',
        audioUrl: audioDataUrl,
        audioDuration,
        createdAt: serverTimestamp(),
      });

      await updateDoc(convRef, {
        lastMessage: {
          text: '🎙️ Nota de voz',
          senderId: sender.id,
          senderName: sender.name,
          type: 'audio',
          createdAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `conversations/${conversationId}/messages`);
    }
  }

  /**
   * Send an image to real recipient
   */
  static async sendImageMessage(
    conversationId: string,
    sender: { id: string; name: string; avatarUrl?: string },
    imageDataUrl: string
  ) {
    const msgsRef = collection(db, 'conversations', conversationId, 'messages');
    const convRef = doc(db, 'conversations', conversationId);

    try {
      await addDoc(msgsRef, {
        conversationId,
        senderId: sender.id,
        senderName: sender.name,
        senderPhoto: sender.avatarUrl || '',
        text: '📷 Foto',
        type: 'image',
        imageUrl: imageDataUrl,
        createdAt: serverTimestamp(),
      });

      await updateDoc(convRef, {
        lastMessage: {
          text: '📷 Foto',
          senderId: sender.id,
          senderName: sender.name,
          type: 'image',
          createdAt: serverTimestamp(),
        },
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `conversations/${conversationId}/messages`);
    }
  }

  /**
   * Initiate a call (Video or Audio) in Firestore
   */
  static async initiateCall(
    caller: { id: string; name: string; photo?: string },
    receiver: { id: string; name: string },
    type: 'video' | 'audio' = 'video'
  ): Promise<string> {
    const callRef = doc(collection(db, 'calls'));
    try {
      await setDoc(callRef, {
        id: callRef.id,
        callerId: caller.id,
        callerName: caller.name,
        callerPhoto: caller.photo || '',
        receiverId: receiver.id,
        receiverName: receiver.name,
        type,
        status: 'ringing',
        createdAt: serverTimestamp(),
      });
      return callRef.id;
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'calls');
      return '';
    }
  }

  /**
   * Listen for incoming calls targeted to current user
   */
  static subscribeToIncomingCalls(
    currentUserId: string,
    onCallReceived: (call: FirestoreCall | null) => void
  ) {
    const q = query(
      collection(db, 'calls'),
      where('receiverId', '==', currentUserId),
      where('status', '==', 'ringing')
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const docData = snapshot.docs[0].data() as FirestoreCall;
          onCallReceived({ ...docData, id: snapshot.docs[0].id });
        } else {
          onCallReceived(null);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, 'calls');
      }
    );
  }

  /**
   * Update Call Status (accepted, declined, ended)
   */
  static async updateCallStatus(callId: string, status: 'accepted' | 'declined' | 'ended') {
    const callRef = doc(db, 'calls', callId);
    try {
      await updateDoc(callRef, { status });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `calls/${callId}`);
    }
  }
}
