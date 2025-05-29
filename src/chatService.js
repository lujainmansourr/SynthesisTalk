const API_BASE = 'http://localhost:8000';  // Adjust if your backend URL changes

// 🔹 Upload a file (PDF or TXT)
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch(`${API_BASE}/upload/`, {
      method: 'POST',
      body: formData,
    });
    if (!response.ok) throw new Error('File upload failed.');
    return await response.json();
  } catch (error) {
    console.error('Upload Error:', error);
    throw error;
  }
}

// 🔹 Analyze the uploaded file (Summarize or Extract Key Points)
export async function analyzeFile(sessionId, action) {
  try {
    const response = await fetch(`${API_BASE}/api/analysis`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id: sessionId, action }),
    });
    if (!response.ok) throw new Error('Analysis failed.');
    return await response.json();
  } catch (error) {
    console.error('Analysis Error:', error);
    throw error;
  }
}

// 🔹 Send a regular chat message
export async function sendMessageToLLM(message) {
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error('Chat message failed.');
    return await response.json();
  } catch (error) {
    console.error('Chat Error:', error);
    throw error;
  }
}