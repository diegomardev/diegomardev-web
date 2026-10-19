export function parseChatUsers(value) {
  if (Array.isArray(value)) return [...new Set(value.filter(v => typeof v === 'string').map(v => v.trim()).filter(Boolean))];
  if (typeof value !== 'string') return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parseChatUsers(parsed);
  } catch { /* Legacy chats also store comma-separated usernames. */ }
  return [...new Set(value.replace(/^[\s\[{]+|[\s\]}]+$/g, '').split(/[,;\n]/).map(v => v.trim().replace(/^["']|["']$/g, '')).filter(Boolean))];
}

export function canViewChat(chat, username) {
  const users = parseChatUsers(chat.users);
  return Boolean(username) && (users.includes('all') || users.includes(username));
}

export function messageKey(message) {
  return String(message.message_id ?? message.id ?? `${message.chat_id}:${message.created_at}:${message.user}:${message.text}`);
}

export function mergeMessages(current, incoming) {
  const byId = new Map(current.map(message => [messageKey(message), message]));
  for (const message of incoming) byId.set(messageKey(message), message);
  return [...byId.values()].sort((a, b) => {
    const time = (Date.parse(a.created_at) || 0) - (Date.parse(b.created_at) || 0);
    return time || messageKey(a).localeCompare(messageKey(b), undefined, { numeric: true });
  });
}

export function formatMessageTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
