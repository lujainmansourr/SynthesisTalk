// src/chatStorage.js

// Key generator for each user
function getUserKey(userId) {
  return `chatHistory:${userId || 'default'}`;
}

// Get chat history for a specific user
export function getChatHistory(userId = 'default') {
  const history = localStorage.getItem(getUserKey(userId));
  return history ? JSON.parse(history) : [];
}

// Save a new or updated chat session
export function saveChat({ id, title, messages, userId = 'default' }) {
  const history = getChatHistory(userId);
  const chatId = id || Date.now().toString(); // use provided id or generate
  const newChat = {
    id: chatId,
    title,
    messages,
    timestamp: new Date().toISOString(),
  };

  // Remove existing chat with same ID to update it
  const filteredHistory = history.filter(chat => chat.id !== chatId);
  filteredHistory.unshift(newChat);

  localStorage.setItem(getUserKey(userId), JSON.stringify(filteredHistory.slice(0, 20)));
}

// Delete a specific chat by ID
export function deleteChat(id, userId = 'default') {
  const history = getChatHistory(userId);
  const updated = history.filter(chat => chat.id !== id);
  localStorage.setItem(getUserKey(userId), JSON.stringify(updated));
}

// Clear all chat history for a user
export function clearChatHistory(userId = 'default') {
  localStorage.removeItem(getUserKey(userId));
}
