import React, { useState, useEffect } from 'react';
import { sendMessageToLLM, uploadFile, analyzeFile, downloadSummaryPDF } from '../chatService';
import { saveChat, getChatHistory, deleteChat, clearChatHistory } from '../chatStorage';
import Profile from './Profile';
import { formatDistanceToNow } from 'date-fns';

function Chat() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [userName] = useState(() => {
    const saved = localStorage.getItem('chatUser');
    return saved ? JSON.parse(saved).name : 'Guest';
  });
  const [sessionId, setSessionId] = useState(localStorage.getItem('sessionId') || '');
  const [showFileActionButtons, setShowFileActionButtons] = useState(false);
  const [lastUploadedFileName, setLastUploadedFileName] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const newSessionId = Date.now().toString();
    setActiveChatId(newSessionId);
    setSessionId(newSessionId);
    localStorage.setItem('sessionId', newSessionId);
    localStorage.removeItem('activeChatId');
    setMessages([]);
    setChatHistory(userName !== 'Guest' ? getChatHistory(userName) : []);
  }, [userName]);

  const toggleSidebar = () => {
    if (userName !== 'Guest') {
      setChatHistory(getChatHistory(userName));
      setShowSidebar(prev => !prev);
    }
  };

  const startNewChat = () => {
    const newId = Date.now().toString();
    setMessages([]);
    setActiveChatId(newId);
    setShowFileActionButtons(false);
    setSessionId(newId);
    localStorage.setItem('activeChatId', newId);
    localStorage.setItem('sessionId', newId);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const updatedMessages = [...messages, { role: 'user', text: input }];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    try {
      const response = await sendMessageToLLM(input, sessionId);
      const newChat = [...updatedMessages, { role: 'assistant', text: response.reply }];
      setMessages(newChat);
      if (userName !== 'Guest') {
        saveChat({ id: activeChatId, title: updatedMessages[0]?.text.slice(0,30)+'...', messages: newChat, userId: userName });
        setChatHistory(getChatHistory(userName));
      }
    } catch (error) {
      setMessages([...updatedMessages, { role: 'assistant', text: '⚠️ Something went wrong' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleWebSearch = async () => {
    if (!input.trim()) return;
    const updatedMessages = [...messages, { role: 'user', text: input }];
    setMessages(updatedMessages);
    setInput('');
    setIsTyping(true);
    try {
      const response = await sendMessageToLLM(input, sessionId, true);
      const newChat = [...updatedMessages, { role: 'assistant', text: response.reply }];
      setMessages(newChat);
      if (userName !== 'Guest') {
        saveChat({ id: activeChatId, title: updatedMessages[0]?.text.slice(0,30)+'...', messages: newChat, userId: userName });
        setChatHistory(getChatHistory(userName));
      }
    } catch {
      setMessages([...updatedMessages, { role: 'assistant', text: '⚠️ Web search failed' }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await uploadFile(file);
      setSessionId(result.session_id);
      setMessages(prev => [...prev, { role: 'assistant', text: `✅ File '${file.name}' uploaded.` }]);
      setLastUploadedFileName(file.name);
      setShowFileActionButtons(true);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Upload failed' }]);
    }
  };

  const handleAnalyzeChoice = async (type) => {
    try {
      const response = await analyzeFile(sessionId, type);
      const updated = [...messages, { role: 'assistant', text: response.result }];
      setMessages(updated);
      setShowFileActionButtons(false);
      if (userName !== 'Guest') {
        saveChat({ id: activeChatId, title: `File ${lastUploadedFileName}`, messages: updated, userId: userName });
        setChatHistory(getChatHistory(userName));
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Analysis failed' }]);
    }
  };

  const handleDownloadText = () => {
    const textContent = messages.map(m => `${m.role === 'user' ? 'You' : 'AI'}: ${m.text}`).join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat_history.txt';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDeleteChat = (id) => {
    deleteChat(id, userName);
    if (id === activeChatId) setMessages([]);
    setChatHistory(getChatHistory(userName));
  };

  const handleClearAll = () => {
    clearChatHistory(userName);
    setChatHistory([]);
    setMessages([]);
  };

  const startEditingTitle = (chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveTitleEdit = (id) => {
    const updated = chatHistory.map(chat => chat.id === id ? { ...chat, title: editTitle } : chat);
    localStorage.setItem(`chatHistory:${userName}`, JSON.stringify(updated));
    setChatHistory(updated);
    setEditingChatId(null);
  };

  return (
    <div className="min-h-screen bg-gray-700 text-white flex">
      {showSidebar && userName !== 'Guest' && (
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-600 font-serif overflow-y-auto">
          <button onClick={startNewChat} className="bg-white text-black rounded-full px-4 py-2 mb-4 w-full">New Chat</button>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Previous Chats</h3>
            <button className="text-sm text-red-400 hover:underline" onClick={handleClearAll}>Clear All</button>
          </div>
          {chatHistory.length === 0 ? <p className="text-gray-400 text-sm">No history yet.</p> : (
            <ul>{chatHistory.map(chat => (
              <li key={chat.id} className="text-sm">
                {editingChatId === chat.id ? (
                  <input value={editTitle} onChange={e => setEditTitle(e.target.value)} onBlur={() => saveTitleEdit(chat.id)} onKeyDown={e => e.key === 'Enter' && saveTitleEdit(chat.id)} autoFocus className="bg-gray-700 text-white border-b w-full" />
                ) : (
                  <div onClick={() => { setMessages(chat.messages); setActiveChatId(chat.id); setShowSidebar(false); }} className={`cursor-pointer hover:underline ${chat.id === activeChatId ? 'text-blue-400 font-bold' : ''}`}>
                    {chat.title}<div className="text-xs text-gray-400">{formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}</div>
                  </div>
                )}
                <div className="flex justify-end gap-2 mt-1">
                  <button className="text-xs text-blue-400 hover:underline" onClick={() => startEditingTitle(chat)}>Edit</button>
                  <button className="text-xs text-red-400 hover:underline" onClick={() => handleDeleteChat(chat.id)}>Delete</button>
                </div>
              </li>
            ))}</ul>
          )}
        </aside>
      )}

      <div className="flex-1 flex flex-col relative">
        <header className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {userName !== 'Guest' && <button onClick={toggleSidebar}><img src="/assets/history.png" alt="History" className="h-6" /></button>}
            <button onClick={startNewChat}><img src="/assets/new-chat.png" alt="New Chat" className="h-5" /></button>
            <h1 className="text-2xl font-serif font-bold">SynthesisTalk</h1>
            <img src="/assets/logo.png" alt="Logo" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handleDownloadText} className="text-white text-2xl" title="Download Chat"><i className="fas fa-download"></i></button>
            <button className="text-white text-2xl" onClick={() => setShowProfile(true)}><i className="fas fa-user-circle"></i></button>
          </div>
        </header>

        {showProfile && <Profile onClose={() => setShowProfile(false)} />}

        <main className="flex-1 flex flex-col px-4 overflow-y-auto">
          <h2 className="text-2xl font-serif mb-4 text-center">Hi, How can I help you today?</h2>
          <div className="w-full py-6 flex flex-col space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex w-full mb-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`p-4 rounded-lg break-words ${msg.role === 'user' ? 'bg-blue-600 text-white text-right' : 'bg-white text-black text-left'} shadow-md`} style={{ maxWidth: '100%', width: 'auto' }}>
                  <strong>{msg.role === 'user' ? 'You' : 'AI'}:</strong>
                  <span>
                    {msg.text.startsWith('• ') || msg.text.startsWith('- ') ? (
                      <ul className="list-disc pl-5">
                        {msg.text
                          .split(/[\n\r]+/)
                          .filter(line => line.trim() !== '')
                          .map((line, idx) => (
                            <li key={idx}>{line.replace(/^[-•]\s*/, '')}</li>
                          ))}
                      </ul>
                    ) : (
                      msg.text
                    )}
                  </span>
                </div>
              </div>
            ))}
            {isTyping && <div className="flex w-full mb-2 justify-start"><div className="p-4 rounded-lg bg-gray-600 text-white italic shadow-md">AI is typing...</div></div>}
          </div>
          {showFileActionButtons && (
            <div className="mt-4 flex flex-col gap-2">
              <button onClick={() => handleAnalyzeChoice('summarize')} className="bg-blue-500 text-white rounded-full px-4 py-2">📝 Summarize</button>
              <button onClick={() => handleAnalyzeChoice('extract key points')} className="bg-green-500 text-white rounded-full px-4 py-2">📄 Analyze</button>
            </div>
          )}
        </main>

        <footer className="px-4 py-8">
          <div className="bg-white text-black rounded-full flex items-center px-6 py-8 w-full text-lg">
            <label className="text-3xl mr-4 cursor-pointer">+
              <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} className="hidden" />
            </label>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="What's on your mind?" className="flex-1 bg-transparent outline-none font-serif text-lg" onKeyDown={e => e.key === 'Enter' && handleSend()} />
            <button className="text-3xl ml-4" onClick={handleSend}>↑</button>
            <button className="text-3xl ml-4" onClick={handleWebSearch}>🔍</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Chat;