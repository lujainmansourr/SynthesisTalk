import React, { useState, useRef } from 'react';
import Profile from './Profile';
import { uploadFile, analyzeFile, sendMessageToLLM } from '../chatService';

function Chat() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [isBulletPoints, setIsBulletPoints] = useState(false);
  const fileInputRef = useRef();

  const toggleSidebar = () => setShowSidebar(prev => !prev);
  const openNewChatTab = () => window.open(window.location.origin + '/chat', '_blank');

  const handleUploadClick = () => fileInputRef.current.click();

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      setSessionId(result.session_id);
      setChatResponse(result.message);
      setShowActionMenu(true);  // Show choice menu
    } catch (error) {
      setChatResponse('File upload failed.');
    }
  };

  const handleActionChoice = async (action) => {
    try {
      const response = await analyzeFile(sessionId, action);
      setIsBulletPoints(action === 'extract key points');
      setChatResponse(response.result);
      setShowActionMenu(false);
    } catch (error) {
      setChatResponse('Analysis failed.');
    }
  };

  const handleSendMessage = async () => {
    try {
      const response = await sendMessageToLLM(userMessage);
      setIsBulletPoints(false);
      setChatResponse(response.reply);
    } catch (error) {
      setChatResponse('LLM message failed.');
    }
    setUserMessage('');
  };

  // 🔥 Helper to render bullet points or plain text
  const renderChatResponse = () => {
    if (isBulletPoints) {
      const lines = chatResponse.split('\n').filter(line => line.trim() !== '');
      return (
        <ul className="list-disc list-inside text-left">
          {lines.map((line, idx) => (
            <li key={idx}>{line.replace(/^[-*]\s*/, '')}</li>
          ))}
        </ul>
      );
    } else {
      return <p>{chatResponse}</p>;
    }
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
          <div className="flex items-center gap-4">
            <button className="text-white text-2xl"><i className="fas fa-share-alt"></i></button>
            <button className="text-white text-2xl" onClick={() => setShowProfile(true)}><i className="fas fa-user-circle"></i></button>
          </div>
        </header>

        {showProfile && <Profile onClose={() => setShowProfile(false)} />}

        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-serif mb-4">Hi, How can I help you today?</h2>
          {chatResponse && (
            <div className="mt-4 bg-white text-black rounded p-4 max-w-md whitespace-pre-wrap">
              {renderChatResponse()}
            </div>
          )}

          {showActionMenu && (
            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => handleActionChoice('summarize')} className="bg-blue-500 text-white rounded-full px-4 py-2">📝 Summarize (Paragraph)</button>
              <button onClick={() => handleActionChoice('extract key points')} className="bg-green-500 text-white rounded-full px-4 py-2">📄 Analyze (Bullet Points)</button>
            </div>
          )}
        </main>

        <footer className="px-4 py-8 flex items-center gap-2">
          <button onClick={handleUploadClick} className="bg-white text-black rounded-full p-4 text-3xl">+</button>
          <input type="file" accept=".pdf,.txt" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <div className="flex-1 flex items-center bg-white text-black rounded-full px-6 py-4">
            <input type="text" placeholder="Type your message..." value={userMessage} onChange={(e) => setUserMessage(e.target.value)} className="flex-1 bg-transparent outline-none font-serif text-lg" />
            <button onClick={handleSendMessage} className="text-3xl ml-4">↑</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Chat;