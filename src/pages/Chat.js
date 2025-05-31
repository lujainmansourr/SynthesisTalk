import React, { useState, useEffect } from 'react';
import { sendMessageToLLM, uploadFile, analyzeFile } from '../chatService';
import {
  saveChat,
  getChatHistory,
  deleteChat,
  clearChatHistory,
} from '../chatStorage';
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

  useEffect(() => {
    const newSessionId = Date.now().toString();
    setActiveChatId(newSessionId);
    setSessionId(newSessionId);
    localStorage.setItem('sessionId', newSessionId);
    localStorage.removeItem('activeChatId');
    setMessages([]);
    if (userName !== 'Guest') {
      setChatHistory(getChatHistory(userName));
    }
  }, [userName]);

  const toggleSidebar = () => {
    if (userName !== 'Guest') {
      setChatHistory(getChatHistory(userName));
    }
    setShowSidebar(prev => !prev);
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

    const currentSessionId = sessionId || Date.now().toString();
    if (!sessionId) {
      setSessionId(currentSessionId);
      localStorage.setItem('sessionId', currentSessionId);
    }

    const updatedMessages = [...messages, { role: 'user', text: input }];
    setMessages(updatedMessages);
    setInput('');

    try {
      const response = await sendMessageToLLM(input, currentSessionId);
      const newChat = [...updatedMessages, { role: 'assistant', text: response.reply }];
      setMessages(newChat);
      const id = activeChatId || Date.now().toString();

      if (userName !== 'Guest') {
        saveChat({
          id,
          title: updatedMessages[0]?.text.slice(0, 30) + '...',
          messages: newChat,
          userId: userName,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('activeChatId', id);
        setActiveChatId(id);
        setChatHistory(getChatHistory(userName));
      }
    } catch (error) {
      const failed = [...updatedMessages, { role: 'assistant', text: '⚠️ LLM error: Something went wrong.' }];
      setMessages(failed);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await uploadFile(file);
      const fileMsg = {
        role: 'assistant',
        text: `✅ File '${file.name}' uploaded successfully. Choose an action below.`,
      };
      setSessionId(result.session_id);
      localStorage.setItem('sessionId', result.session_id);
      setMessages(prev => [...prev, fileMsg]);
      setLastUploadedFileName(file.name);
      setShowFileActionButtons(true);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ File upload failed.' }]);
    }
  };

  const handleAnalyzeChoice = async (type) => {
    try {
      const response = await analyzeFile(sessionId, type);
      const resultMsg = {
        role: 'assistant',
        text: `${type === 'summarize' ? '📝' : '📄'} ${response.result}`,
      };
      const updated = [...messages, resultMsg];
      setMessages(updated);
      setShowFileActionButtons(false);

      const id = activeChatId || Date.now().toString();

      if (userName !== 'Guest') {
        saveChat({
          id,
          title: `File '${lastUploadedFileName}' uploaded`,
          messages: updated,
          userId: userName,
          timestamp: new Date().toISOString(),
        });
        localStorage.setItem('activeChatId', id);
        setActiveChatId(id);
        setChatHistory(getChatHistory(userName));
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: '⚠️ Analysis failed.' }]);
    }
  };

  const handleDeleteChat = (id) => {
    if (userName !== 'Guest') {
      deleteChat(id, userName);
      setChatHistory(getChatHistory(userName));
    }
    if (id === activeChatId) {
      setMessages([]);
      localStorage.removeItem('activeChatId');
      localStorage.removeItem('sessionId');
      setActiveChatId(null);
      setSessionId('');
    }
  };

  const handleClearAll = () => {
    if (userName !== 'Guest') {
      clearChatHistory(userName);
      setChatHistory([]);
    }
    setMessages([]);
    localStorage.removeItem('activeChatId');
    localStorage.removeItem('sessionId');
  };

  const startEditingTitle = (chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveTitleEdit = (id) => {
    if (userName !== 'Guest') {
      const updatedHistory = chatHistory.map(chat =>
        chat.id === id ? { ...chat, title: editTitle } : chat
      );
      localStorage.setItem(`chatHistory:${userName}`, JSON.stringify(updatedHistory));
      setChatHistory(updatedHistory);
    }
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
          {chatHistory.length === 0 ? (
            <p className="text-gray-400 text-sm">No history yet.</p>
          ) : (
            <ul className="space-y-2">
              {chatHistory.map(chat => (
                <li key={chat.id} className="text-sm">
                  {editingChatId === chat.id ? (
                    <input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => saveTitleEdit(chat.id)}
                      onKeyDown={(e) => e.key === 'Enter' && saveTitleEdit(chat.id)}
                      autoFocus
                      className="bg-gray-700 text-white border-b w-full"
                    />
                  ) : (
                    <div
                      onClick={() => {
                        setMessages(chat.messages);
                        setActiveChatId(chat.id);
                        localStorage.setItem('activeChatId', chat.id);
                        setShowSidebar(false);
                      }}
                      className={`cursor-pointer hover:underline ${chat.id === activeChatId ? 'text-blue-400 font-bold' : ''}`}
                    >
                      {chat.title}
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-1">
                    <button className="text-xs text-blue-400 hover:underline" onClick={() => startEditingTitle(chat)}>Edit</button>
                    <button className="text-xs text-red-400 hover:underline" onClick={() => handleDeleteChat(chat.id)}>Delete</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}

      <div className="flex-1 flex flex-col relative">
        <header className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            {userName !== 'Guest' && (
              <button onClick={toggleSidebar}>
                <img src="/assets/history.png" alt="History" className="h-6" />
              </button>
            )}
            <button onClick={startNewChat}>
              <img src="/assets/new-chat.png" alt="New Chat" className="h-5" />
            </button>
            <h1 className="text-2xl font-serif font-bold">SynthesisTalk</h1>
            <img src="/assets/logo.png" alt="Logo" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white text-2xl"><i className="fas fa-share-alt"></i></button>
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
                  <strong>{msg.role === 'user' ? 'You' : 'AI'}: </strong>
                  <span>{msg.text}</span>
                </div>
              </div>
            ))}
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
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="What's on your mind?"
              className="flex-1 bg-transparent outline-none font-serif text-lg"
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button className="text-3xl ml-4" onClick={handleSend}>↑</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Chat;
