const BASE_URL = 'http://localhost:8000';

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function analyzeFile(sessionId, action) {
  const response = await fetch(`${BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, action }),
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.statusText}`);
  }

  return await response.json();
}

export async function sendMessageToLLM(message, session_id) {
  const response = await fetch(`${BASE_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.reply || 'LLM error');
  }

  return await response.json();
}

export async function fetchChatHistory() {
  const response = await fetch(`${BASE_URL}/api/history`);
  if (!response.ok) throw new Error('Failed to fetch chat history.');
  return await response.json();
}
