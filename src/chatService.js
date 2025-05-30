const API_BASE = 'http://localhost:8000';

export async function sendMessageToLLM(message, sessionId) {
  const response = await fetch(${API_BASE}/api/chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId }),
  });

  if (!response.ok) throw new Error('LLM request failed');
  return await response.json();
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(${API_BASE}/api/upload, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) throw new Error('Upload failed');
  return await response.json();
}

export async function analyzeFile(sessionId, action) {
  const response = await fetch(${API_BASE}/api/analyze, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, action }),
  });

  if (!response.ok) throw new Error('Analysis failed');
  return await response.json();
}
