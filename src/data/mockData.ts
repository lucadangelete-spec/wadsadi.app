import { ChatSpace, ChatMessage, ChatUser } from '../types/chat';

export const CURRENT_USER: ChatUser = {
  id: 'current-user-1',
  name: 'Tú (Usuario)',
  status: 'online',
  statusMessage: 'Explorando la nueva app modificada de chat 🚀',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const MOCK_USERS: Record<string, ChatUser> = {
  sofia: {
    id: 'user-sofia',
    name: 'Sofía Reyes',
    status: 'online',
    statusMessage: 'Finalizando prototipos en Figma ✨',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'Diseñadora UI/UX',
  },
  carlos: {
    id: 'user-carlos',
    name: 'Carlos Mendoza',
    status: 'online',
    statusMessage: 'Depurando microservicios y APIs ⚡',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'Lead Backend',
  },
  mateo: {
    id: 'user-mateo',
    name: 'Mateo Fernández',
    status: 'busy',
    statusMessage: 'En despliegue a producción 🛠️',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'DevOps Cloud',
  },
  valentina: {
    id: 'user-valentina',
    name: 'Valentina Gómez',
    status: 'away',
    statusMessage: 'Almorzando, vuelvo en 20m 🥪',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    role: 'Product Manager',
  },
};

export const INITIAL_SPACES: ChatSpace[] = [
  {
    id: 'space-alpha',
    displayName: '🚀 Proyecto Alpha - Lanzamiento',
    type: 'SPACE',
    description: 'Coordinación del sprint de entrega, diseño y despliegue del sistema.',
    unreadCount: 1,
    membersCount: 5,
    avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
    lastMessage: {
      text: '¡Las pruebas de integración pasaron al 100%! Listos para el pase.',
      createTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      senderName: 'Carlos Mendoza',
    },
  },
  {
    id: 'space-design',
    displayName: '🎨 Innovación & Diseño UI/UX',
    type: 'SPACE',
    description: 'Discusión de paletas de colores, micro-interacciones y accesibilidad.',
    unreadCount: 0,
    membersCount: 4,
    avatarUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=150&auto=format&fit=crop&q=80',
    lastMessage: {
      text: 'Subí los nuevos componentes y tokens de diseño para revisar.',
      createTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      senderName: 'Sofía Reyes',
    },
  },
  {
    id: 'dm-sofia',
    displayName: 'Sofía Reyes',
    type: 'DIRECT_MESSAGE',
    description: 'Chat directo con Sofía Reyes',
    unreadCount: 1,
    membersCount: 2,
    avatarUrl: MOCK_USERS.sofia.avatarUrl,
    lastMessage: {
      text: '¿Pudiste ver la nueva barra de búsqueda con filtros?',
      createTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      senderName: 'Sofía Reyes',
    },
  },
  {
    id: 'dm-carlos',
    displayName: 'Carlos Mendoza',
    type: 'DIRECT_MESSAGE',
    description: 'Chat directo con Carlos Mendoza',
    unreadCount: 0,
    membersCount: 2,
    avatarUrl: MOCK_USERS.carlos.avatarUrl,
    lastMessage: {
      text: 'Excelente trabajo con la integración de la API. Todo responde al instante.',
      createTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      senderName: 'Carlos Mendoza',
    },
  },
  {
    id: 'dm-valentina',
    displayName: 'Valentina Gómez',
    type: 'DIRECT_MESSAGE',
    description: 'Chat directo con Valentina Gómez',
    unreadCount: 0,
    membersCount: 2,
    avatarUrl: MOCK_USERS.valentina.avatarUrl,
    lastMessage: {
      text: 'Los usuarios de prueba están encantados con las notas de voz y emojis.',
      createTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      senderName: 'Valentina Gómez',
    },
  },
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'space-alpha': [
    {
      id: 'msg-alpha-1',
      spaceId: 'space-alpha',
      sender: MOCK_USERS.valentina,
      text: '¡Hola a todos! Bienvenidos a la versión modificada de nuestro chat. Revisemos los últimos detalles antes de la demo final.',
      createTime: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      reactions: [{ emoji: '🎉', count: 3, users: ['Carlos', 'Sofía', 'Tú'] }],
    },
    {
      id: 'msg-alpha-2',
      spaceId: 'space-alpha',
      sender: MOCK_USERS.sofia,
      text: 'Agregué soporte para vista previa de imágenes, notas de audio interactivas y confirmación de seguridad para operaciones en Google Workspace.',
      createTime: new Date(Date.now() - 1000 * 60 * 80).toISOString(),
      attachments: [
        {
          id: 'att-1',
          name: 'preview_interfaz_v2.png',
          type: 'image',
          url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
          size: '1.2 MB',
        },
      ],
      reactions: [
        { emoji: '🔥', count: 2, users: ['Carlos', 'Mateo'] },
        { emoji: '❤️', count: 1, users: ['Tú'] },
      ],
    },
    {
      id: 'msg-alpha-3',
      spaceId: 'space-alpha',
      sender: MOCK_USERS.carlos,
      text: '¡Las pruebas de integración pasaron al 100%! Listos para el pase.',
      createTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      reactions: [{ emoji: '🚀', count: 4, users: ['Sofía', 'Valentina', 'Mateo', 'Tú'] }],
      isStarred: true,
    },
  ],
  'space-design': [
    {
      id: 'msg-design-1',
      spaceId: 'space-design',
      sender: MOCK_USERS.sofia,
      text: 'Miren cómo queda el tema oscuro y los detalles translúcidos en los paneles. Da una sensación de fluidez y modernidad increíble.',
      createTime: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
      reactions: [{ emoji: '✨', count: 2, users: ['Valentina', 'Tú'] }],
    },
    {
      id: 'msg-design-2',
      spaceId: 'space-design',
      sender: MOCK_USERS.sofia,
      text: 'Subí los nuevos componentes y tokens de diseño para revisar.',
      createTime: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    },
  ],
  'dm-sofia': [
    {
      id: 'msg-sofia-1',
      spaceId: 'dm-sofia',
      sender: MOCK_USERS.sofia,
      text: '¡Hola! Qué bueno que estás probando la nueva versión. ¿Pudiste ver la nueva barra de búsqueda con filtros y los emojis dinámicos?',
      createTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      reactions: [{ emoji: '👋', count: 1, users: ['Tú'] }],
    },
  ],
  'dm-carlos': [
    {
      id: 'msg-carlos-1',
      spaceId: 'dm-carlos',
      sender: MOCK_USERS.carlos,
      text: 'Hola! Recuerda que cuando uses Google Chat con cuenta de Workspace empresarial, la API enviará y recibirá los datos directamente a la nube de Google.',
      createTime: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
    },
    {
      id: 'msg-carlos-2',
      spaceId: 'dm-carlos',
      sender: MOCK_USERS.carlos,
      text: 'Excelente trabajo con la integración de la API. Todo responde al instante.',
      createTime: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      reactions: [{ emoji: '💪', count: 1, users: ['Tú'] }],
    },
  ],
  'dm-valentina': [
    {
      id: 'msg-val-1',
      spaceId: 'dm-valentina',
      sender: MOCK_USERS.valentina,
      text: 'Los usuarios de prueba están encantados con las notas de voz y emojis.',
      createTime: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      reactions: [{ emoji: '🎯', count: 1, users: ['Tú'] }],
    },
  ],
};

// Simulated intelligent responses when user sends message in mock chats
export const getSimulatedResponse = (
  spaceId: string,
  userMessageText: string
): { sender: ChatUser; text: string; delay: number; reaction?: string } => {
  const lower = userMessageText.toLowerCase();

  if (spaceId === 'dm-sofia' || spaceId === 'space-design') {
    let text = '¡Me encanta! Es justo lo que necesitábamos para pulir la experiencia de usuario y hacerla más atractiva.';
    if (lower.includes('hola') || lower.includes('buenas') || lower.includes('hey')) {
      text = '¡Hola! ¿Cómo vas? Estaba ajustando unas animaciones y el selector de emojis. ¿Qué te parece cómo se siente?';
    } else if (lower.includes('color') || lower.includes('diseño') || lower.includes('tema')) {
      text = 'El contraste y la tipografía hacen que leer mensajes largos sea súper cómodo, incluso de noche con el modo oscuro.';
    } else if (lower.includes('gracias') || lower.includes('genial') || lower.includes('bueno')) {
      text = '¡De nada! Seguimos sumándole detalles para que sea la mejor app de chat.';
    }
    return {
      sender: MOCK_USERS.sofia,
      text,
      delay: 1400,
      reaction: '👍',
    };
  }

  if (spaceId === 'dm-carlos' || spaceId === 'space-alpha') {
    let text = 'Entendido, lo tengo en cuenta. El rendimiento está excelente y la latencia es mínima.';
    if (lower.includes('hola') || lower.includes('buenas')) {
      text = '¡Hola! Todo corriendo sobre ruedas en los servidores y endpoints de Google Chat.';
    } else if (lower.includes('error') || lower.includes('bug') || lower.includes('falla')) {
      text = 'Revisando los registros de telemetría y red... Todo en orden, sin excepciones.';
    } else if (lower.includes('listo') || lower.includes('enviar') || lower.includes('ok')) {
      text = '¡Confirmado! Paquete procesado y entregado con éxito.';
    }
    return {
      sender: MOCK_USERS.carlos,
      text,
      delay: 1600,
      reaction: '🚀',
    };
  }

  return {
    sender: MOCK_USERS.valentina,
    text: `¡Recibido! Tomo nota: "${userMessageText.slice(0, 30)}...". Vamos con todo en este release.`,
    delay: 1500,
    reaction: '✨',
  };
};
