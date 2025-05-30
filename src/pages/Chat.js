import React, { useState, useEffect, useRef } from 'react';
import Profile from './Profile';
import { uploadFile, analyzeFile, sendMessageToLLM } from '../chatService';

function Chat() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [sessionId, setSessionId] = useState(() => localStorage.getItem('sessionId') || '');
  const [userName, setUserName] = useState('Guest');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem('chatUser'));
    if (savedUser && savedUser.name) {
      setUserName(savedUser.name);
    } else if (localStorage.getItem('guestMode') === 'true') {
      setUserName('Guest');
    }
    if (!sessionId) {
      const newSessionId = crypto.randomUUID();
      setSessionId(newSessionId);
      localStorage.setItem('sessionId', newSessionId);
    }
  }, []);

  const toggleSidebar = () => setShowSidebar(prev => !prev);
  const openNewChatTab = () => window.open(window.location.origin + '/chat', '_blank');
  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      setSessionId(result.session_id);
      localStorage.setItem('sessionId', result.session_id);
      addMessage('AI', result.message);
      setShowActionMenu(true);
    } catch (error) {
      addMessage('AI', 'File upload failed.');
    }
  };

  const handleActionChoice = async (action) => {
    try {
      const response = await analyzeFile(sessionId, action);
      addMessage('AI', response.result);
      setShowActionMenu(false);
    } catch (error) {
      addMessage('AI', 'Analysis failed.');
    }
  };

  const handleSendMessage = async () => {
    if (!userMessage.trim()) return;
    addMessage(userName, userMessage);
    try {
      const response = await sendMessageToLLM(userMessage, sessionId);
      addMessage('AI', response.reply);
    } catch (error) {
      addMessage('AI', 'LLM message failed.');
    }
    setUserMessage('');
  };

  // New: Web search handler
  const handleWebSearch = async () => {
    if (!userMessage.trim()) return;
    addMessage(userName, userMessage);
    try {
      // Send with flag web_search=true to trigger web search on backend
      const response = await sendMessageToLLM(userMessage, sessionId, true);
      addMessage('AI', response.reply);
    } catch (error) {
      addMessage('AI', 'Web search failed.');
    }
    setUserMessage('');
  };

  const addMessage = (sender, content) => {
    setChatHistory(prev => [...prev, { sender, content }]);
  };

  return (
    <div className="min-h-screen bg-gray-700 text-white flex">
      {showSidebar && (
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-600 font-serif">
          <button onClick={openNewChatTab} className="bg-white text-black rounded-full px-4 py-2 mb-4 w-full">New Chat</button>
        </aside>
      )}
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar}><img src="/assets/history.png" alt="History" className="h-6" /></button>
            <button onClick={openNewChatTab}><img src="/assets/new-chat.png" alt="New Chat" className="h-5" /></button>
            <h1 className="text-2xl font-serif font-bold">SynthesisTalk</h1>
            <img src="/assets/logo.png" alt="Logo" className="h-8" />
          </div>
          <button className="text-white text-2xl" onClick={() => setShowProfile(true)}><i className="fas fa-user-circle"></i></button>
        </header>

        {showProfile && <Profile onClose={() => setShowProfile(false)} />}

        <main className="flex-1 flex flex-col p-4 overflow-y-auto">
          <h2 className="text-2xl font-serif mb-4 text-center">Hi, How can I help you today?</h2>
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`mb-2 ${msg.sender === 'AI' ? 'text-left' : 'text-right'}`}>
              <span className={`inline-block p-2 rounded ${msg.sender === 'AI' ? 'bg-white text-black' : 'bg-blue-500 text-white'}`}>
                <strong>{msg.sender === 'AI' ? 'AI' : userName}:</strong> {msg.content}
              </span>
            </div>
          ))}
          {showActionMenu && (
            <div className="mt-4 flex flex-col gap-2 text-center">
              <button onClick={() => handleActionChoice('summarize')} className="bg-blue-500 text-white rounded-full px-4 py-2">📝 Summarize (Paragraph)</button>
              <button onClick={() => handleActionChoice('extract key points')} className="bg-green-500 text-white rounded-full px-4 py-2">📄 Analyze (Bullet Points)</button>
            </div>
          )}
        </main>

        <footer className="px-4 py-8 flex items-center gap-2">
          <button onClick={handleUploadClick} className="bg-white text-black rounded-full p-4 text-3xl">+</button>
          <input type="file" accept=".pdf,.txt" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <div className="flex-1 flex items-center bg-white text-black rounded-full px-6 py-4">
            <input
              type="text"
              placeholder="Type your message..."
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              className="flex-1 bg-transparent outline-none font-serif text-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSendMessage();
              }}
            />
            <button onClick={handleSendMessage} className="text-3xl ml-4">↑</button>
            {/* Web Search button */}
            <button onClick={handleWebSearch} className="text-3xl ml-4" title="Search in Web">🔍</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Chat;
