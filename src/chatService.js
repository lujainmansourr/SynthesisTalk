// src/chatService.js

const API_BASE = 'http://localhost:8000';

export async function sendMessageToLLM(message, sessionId, webSearch = false) {
  const response = await fetch(`${API_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, session_id: sessionId, web_search: webSearch }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("LLM error:", error);
    throw new Error('LLM request failed');
  }

  return await response.json(); 
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Upload error:", error);
    throw new Error('Upload failed');
  }

  return await response.json(); 
}

export async function analyzeFile(sessionId, action) {
  const response = await fetch(`${API_BASE}/api/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, action }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Analyze error:", error);
    throw new Error('Analysis failed');
  }

  return await response.json(); 
}

export async function downloadSummaryPDF(sessionId, action = "summarize") {
  const response = await fetch(`${API_BASE}/api/summarize-pdf`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId, action }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("PDF download error:", error);
    throw new Error('PDF download failed');
  }

  const blob = await response.blob();
  return blob; 
}
