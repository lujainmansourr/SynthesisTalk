// src/chatStorage.js

export function getChatHistory(userId) {
  const raw = localStorage.getItem(`chatHistory:${userId}`);
  return raw ? JSON.parse(raw) : [];
}

export function saveChat(chat) {
  const key = `chatHistory:${chat.userId}`;
  const existing = getChatHistory(chat.userId);
  const updated = existing.filter(c => c.id !== chat.id);
  updated.push({ ...chat, timestamp: chat.timestamp || new Date().toISOString() });
  localStorage.setItem(key, JSON.stringify(updated));
}

export function deleteChat(chatId, userId) {
  const key = `chatHistory:${userId}`;
  const existing = getChatHistory(userId);
  const filtered = existing.filter(c => c.id !== chatId);
  localStorage.setItem(key, JSON.stringify(filtered));
}

export function clearChatHistory(userId) {
  localStorage.removeItem(`chatHistory:${userId}`);
}
