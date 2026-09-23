const CHAT_MESSAGE_TYPES = new Set(['TEXT', 'IMAGE', 'AUDIO']);
const MAX_TEXT_LENGTH = 2000;
const MAX_AUDIO_MS = 60_000;

const isOwnedChatMediaUrl = (url, userId, conversationId) => {
  if (typeof url !== 'string' || url.length > 2048) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return false;
    const marker = `/users/${userId}/chat/${conversationId}/`;
    return parsed.pathname.includes(marker);
  } catch {
    return false;
  }
};

export const normalizeDirectChatMessage = (data, userId, userType) => {
  if (!data?.conversationId || typeof data.conversationId !== 'string') {
    return { error: 'Invalid conversation' };
  }
  if (!data?.messageId || typeof data.messageId !== 'string' || data.messageId.length > 80) {
    return { error: 'Invalid message id' };
  }

  const type = CHAT_MESSAGE_TYPES.has(data.type) ? data.type : 'TEXT';
  const text = typeof data.text === 'string' ? data.text.trim().slice(0, MAX_TEXT_LENGTH) : '';
  const senderType = userType === 'TEACHER' ? 'TEACHER' : 'STUDENT';

  if (type === 'TEXT') {
    if (!text) return { error: 'Message text is required' };
    return {
      payload: {
        conversationId: data.conversationId,
        messageId: data.messageId,
        type: 'TEXT',
        text,
        senderId: userId,
        senderType,
        timestamp: new Date().toISOString(),
      },
    };
  }

  if (!isOwnedChatMediaUrl(data.mediaUrl, userId, data.conversationId)) {
    return { error: 'Invalid media URL' };
  }

  const durationMs =
    type === 'AUDIO' && Number.isFinite(Number(data.durationMs))
      ? Math.min(MAX_AUDIO_MS, Math.max(0, Math.round(Number(data.durationMs))))
      : null;

  return {
    payload: {
      conversationId: data.conversationId,
      messageId: data.messageId,
      type,
      text,
      mediaUrl: data.mediaUrl,
      mediaMime: typeof data.mediaMime === 'string' ? data.mediaMime.slice(0, 120) : null,
      durationMs,
      senderId: userId,
      senderType,
      timestamp: new Date().toISOString(),
    },
  };
};

export const toConversationMessageCreate = (payload) => ({
  conversationId: payload.conversationId,
  messageId: payload.messageId,
  type: payload.type,
  text: payload.text || '',
  mediaUrl: payload.mediaUrl || null,
  mediaMime: payload.mediaMime || null,
  durationMs: payload.durationMs,
  senderId: payload.senderId,
  senderType: payload.senderType,
});
