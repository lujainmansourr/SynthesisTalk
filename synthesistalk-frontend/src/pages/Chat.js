// src/pages/Chat.js

import React, { useState, useEffect } from 'react';
import { sendMessageToLLM } from '../chatService';
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
  const [activeChatId, setActiveChatId] = useState(localStorage.getItem('activeChatId'));

  const [userName] = useState(() => {
    const saved = localStorage.getItem('chatUser');
    return saved ? JSON.parse(saved).name : 'Guest';
  });

  useEffect(() => {
    const history = getChatHistory(userName);
    setChatHistory(history);

    if (activeChatId) {
      const existing = history.find(c => c.id === activeChatId);
      if (existing) setMessages(existing.messages);
    }
  }, [userName, activeChatId]);

  const toggleSidebar = () => {
    setChatHistory(getChatHistory(userName));
    setShowSidebar(prev => !prev);
  };

  const openNewChatTab = () => {
    window.open(window.location.origin + '/chat', '_blank');
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const updatedMessages = [...messages, { role: 'user', text: input }];
    setMessages(updatedMessages);
    setInput('');

    try {
      const response = await sendMessageToLLM(input);
      const newChat = [...updatedMessages, { role: 'assistant', text: response.reply }];
      setMessages(newChat);

      const id = activeChatId || Date.now().toString();

      saveChat({
        id,
        title: updatedMessages[0]?.text.slice(0, 30) + '...',
        messages: newChat,
        userId: userName,
      });

      localStorage.setItem('activeChatId', id);
      setActiveChatId(id);
      setChatHistory(getChatHistory(userName));
    } catch (error) {
      setMessages([
        ...updatedMessages,
        { role: 'assistant', text: '⚠️ LLM error: Something went wrong.' },
      ]);
    }
  };

  const handleDeleteChat = (id) => {
    deleteChat(id, userName);
    if (id === activeChatId) {
      setMessages([]);
      localStorage.removeItem('activeChatId');
      setActiveChatId(null);
    }
    setChatHistory(getChatHistory(userName));
  };

  const handleClearAll = () => {
    clearChatHistory(userName);
    setMessages([]);
    setChatHistory([]);
    localStorage.removeItem('activeChatId');
    setActiveChatId(null);
  };

  const startEditingTitle = (chat) => {
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const saveTitleEdit = (id) => {
    const updatedHistory = chatHistory.map(chat =>
      chat.id === id ? { ...chat, title: editTitle } : chat
    );
    localStorage.setItem(`chatHistory:${userName}`, JSON.stringify(updatedHistory));
    setChatHistory(updatedHistory);
    setEditingChatId(null);
  };

  return (
    <div className="min-h-screen bg-gray-700 text-white flex">
      {showSidebar && (
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-600 font-serif overflow-y-auto">
          <button
            onClick={openNewChatTab}
            className="bg-white text-black rounded-full px-4 py-2 mb-4 w-full"
          >
            New Chat
          </button>

          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg">Previous Chats</h3>
            <button className="text-sm text-red-400 hover:underline" onClick={handleClearAll}>
              Clear All
            </button>
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
                      className={`cursor-pointer hover:underline ${
                        chat.id === activeChatId ? 'text-blue-400 font-bold' : ''
                      }`}
                    >
                      {chat.title}
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(chat.timestamp), { addSuffix: true })}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end gap-2 mt-1">
                    <button
                      className="text-xs text-blue-400 hover:underline"
                      onClick={() => startEditingTitle(chat)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-xs text-red-400 hover:underline"
                      onClick={() => handleDeleteChat(chat.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col relative">
        <header className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <button onClick={toggleSidebar}>
              <img src="/assets/history.png" alt="History" className="h-6" />
            </button>
            <button onClick={openNewChatTab}>
              <img src="/assets/new-chat.png" alt="New Chat" className="h-5" />
            </button>
            <h1 className="text-2xl font-serif font-bold">SynthesisTalk</h1>
            <img src="/assets/logo.png" alt="Logo" className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <button className="text-white text-2xl"><i className="fas fa-share-alt"></i></button>
            <button className="text-white text-2xl" onClick={() => setShowProfile(true)}>
              <i className="fas fa-user-circle"></i>
            </button>
          </div>
        </header>

        {showProfile && <Profile onClose={() => setShowProfile(false)} />}

        <main className="flex-1 flex flex-col items-center text-center px-4 overflow-y-auto">
          <h2 className="text-2xl font-serif mb-4">Hi, How can I help you today?</h2>
          <div className="flex flex-wrap gap-4 justify-center mb-6">
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Summarize this article</button>
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Explain this concept</button>
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Search in documents only</button>
          </div>

          <div className="w-full max-w-xl text-left">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`my-2 p-2 rounded ${msg.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-300 text-black'}`}
              >
                <strong>{msg.role === 'user' ? 'You' : 'AI'}: </strong>{msg.text}
              </div>
            ))}
          </div>
        </main>

        <footer className="px-4 py-8">
          <div className="bg-white text-black rounded-full flex items-center px-6 py-8 w-full text-lg">
            <span className="text-3xl mr-4">+</span>
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
