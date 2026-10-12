import { ChatSpace, ChatMessage, ChatMember } from '../types/chat';

export interface GoogleChatApiError {
  isChatAppNotConfigured?: boolean;
  isConsumerAccountError?: boolean;
  isPermissionError?: boolean;
  message: string;
  statusCode?: number;
  consoleUrl?: string;
}

const PROJECT_ID = 'gen-lang-client-0837397292';
export const GOOGLE_CHAT_CONSOLE_URL = `https://console.cloud.google.com/apis/api/chat.googleapis.com/hangouts-chat?project=${PROJECT_ID}`;

export class GoogleChatService {
  private static parseError(resStatus: number, errorData: any): GoogleChatApiError {
    const errorMsg = errorData?.error?.message || errorData?.message || 'Error al comunicarse con Google Chat API';
    
    // Check for 404 Chat app not found (standard Chat API requirement)
    if (resStatus === 404 || errorMsg.includes('Google Chat app not found') || errorMsg.includes('configure the app')) {
      return {
        isChatAppNotConfigured: true,
        statusCode: 404,
        message: 'La aplicación de Google Chat aún no ha sido configurada en Google Cloud Console. Para conectar con cuentas de Google Chat empresariales, la aplicación debe estar registrada en la consola.',
        consoleUrl: GOOGLE_CHAT_CONSOLE_URL
      };
    }

    // Check for 403 or consumer account error
    if (resStatus === 403 || errorMsg.includes('Workspace') || errorMsg.includes('consumer')) {
      return {
        isConsumerAccountError: true,
        statusCode: 403,
        message: 'Google Chat API requiere una cuenta empresarial o educativa de Google Workspace. Las cuentas de consumidor personales (@gmail.com) no tienen acceso directo a la API de Chat.',
        consoleUrl: GOOGLE_CHAT_CONSOLE_URL
      };
    }

    return {
      statusCode: resStatus,
      message: errorMsg
    };
  }

  static async listSpaces(accessToken: string): Promise<{ spaces: ChatSpace[]; error?: GoogleChatApiError }> {
    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        return { spaces: [], error: this.parseError(response.status, errorJson) };
      }

      const data = await response.json();
      const rawSpaces = data.spaces || [];
      const spaces: ChatSpace[] = rawSpaces.map((s: any) => ({
        id: s.name?.replace('spaces/', '') || s.name,
        name: s.name,
        displayName: s.displayName || (s.type === 'DIRECT_MESSAGE' ? 'Mensaje Directo' : 'Espacio de Chat'),
        type: s.spaceType || s.type || 'SPACE',
        isRealGoogleSpace: true,
        unreadCount: 0,
      }));

      return { spaces };
    } catch (err: any) {
      return {
        spaces: [],
        error: {
          message: err.message || 'Error de conexión de red con Google Chat API',
        },
      };
    }
  }

  static async listMessages(accessToken: string, spaceName: string): Promise<{ messages: ChatMessage[]; error?: GoogleChatApiError }> {
    try {
      const formattedSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
      const url = `https://chat.googleapis.com/v1/${formattedSpaceName}/messages?pageSize=40`;
      
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        return { messages: [], error: this.parseError(response.status, errorJson) };
      }

      const data = await response.json();
      const rawMessages = data.messages || [];
      
      const messages: ChatMessage[] = rawMessages.map((m: any) => ({
        id: m.name || Math.random().toString(),
        name: m.name,
        spaceId: spaceName,
        text: m.text || '',
        createTime: m.createTime || new Date().toISOString(),
        sender: {
          id: m.sender?.name || 'unknown',
          name: m.sender?.displayName || 'Usuario de Chat',
          avatarUrl: m.sender?.avatarUrl,
          status: 'online',
        },
      }));

      // Sort messages chronologically
      messages.sort((a, b) => new Date(a.createTime).getTime() - new Date(b.createTime).getTime());

      return { messages };
    } catch (err: any) {
      return {
        messages: [],
        error: {
          message: err.message || 'Error al cargar mensajes',
        },
      };
    }
  }

  static async sendMessage(accessToken: string, spaceName: string, text: string): Promise<{ message?: ChatMessage; error?: GoogleChatApiError }> {
    try {
      const formattedSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
      const url = `https://chat.googleapis.com/v1/${formattedSpaceName}/messages`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text.trim(),
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        return { error: this.parseError(response.status, errorJson) };
      }

      const data = await response.json();
      const msg: ChatMessage = {
        id: data.name || Math.random().toString(),
        name: data.name,
        spaceId: spaceName,
        text: data.text || text,
        createTime: data.createTime || new Date().toISOString(),
        sender: {
          id: data.sender?.name || 'me',
          name: data.sender?.displayName || 'Tú',
          avatarUrl: data.sender?.avatarUrl,
          status: 'online',
        },
      };

      return { message: msg };
    } catch (err: any) {
      return {
        error: {
          message: err.message || 'Error al enviar mensaje',
        },
      };
    }
  }

  static async createSpace(accessToken: string, displayName: string, spaceType: 'SPACE' | 'GROUP_CHAT' = 'SPACE'): Promise<{ space?: ChatSpace; error?: GoogleChatApiError }> {
    try {
      const response = await fetch('https://chat.googleapis.com/v1/spaces', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          displayName,
          spaceType,
        }),
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        return { error: this.parseError(response.status, errorJson) };
      }

      const data = await response.json();
      const space: ChatSpace = {
        id: data.name?.replace('spaces/', '') || data.name,
        name: data.name,
        displayName: data.displayName || displayName,
        type: data.spaceType || spaceType,
        isRealGoogleSpace: true,
      };

      return { space };
    } catch (err: any) {
      return {
        error: {
          message: err.message || 'Error al crear espacio',
        },
      };
    }
  }

  static async listMembers(accessToken: string, spaceName: string): Promise<{ members: ChatMember[]; error?: GoogleChatApiError }> {
    try {
      const formattedSpaceName = spaceName.startsWith('spaces/') ? spaceName : `spaces/${spaceName}`;
      const url = `https://chat.googleapis.com/v1/${formattedSpaceName}/members`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        return { members: [], error: this.parseError(response.status, errorJson) };
      }

      const data = await response.json();
      const raw = data.memberships || [];
      const members: ChatMember[] = raw.map((m: any) => ({
        id: m.name,
        name: m.member?.name || m.name,
        displayName: m.member?.displayName || 'Miembro de Chat',
        avatarUrl: m.member?.avatarUrl,
        role: m.role || 'ROLE_MEMBER',
      }));

      return { members };
    } catch (err: any) {
      return {
        members: [],
        error: {
          message: err.message || 'Error al obtener miembros',
        },
      };
    }
  }
}
