// src/chatStorage.js

// Get chat history for a user (default 'guest')
export function getChatHistory(userId = 'guest') {
  const history = localStorage.getItem(`chatHistory_${userId}`);
  return history ? JSON.parse(history) : [];
}

// Save chat history for a user
export function saveChatHistory(userId = 'guest', messages = []) {
  localStorage.setItem(`chatHistory_${userId}`, JSON.stringify(messages));
}

// Clear chat history for a user
export function clearChatHistory(userId = 'guest') {
  localStorage.removeItem(`chatHistory_${userId}`);
}
