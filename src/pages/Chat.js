import React, { useState } from 'react';
import { sendMessageToLLM } from '../chatService';
import Profile from './Profile';

function Chat() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);

  const toggleSidebar = () => setShowSidebar(prev => !prev);
  const openNewChatTab = () => window.open(window.location.origin + '/chat', '_blank');

  const handleSend = async () => {
    if (input.trim() === '') return;

    const updatedMessages = [...messages, { role: 'user', text: input }];
    setMessages(updatedMessages);
    setInput('');

    const reply = await sendMessageToLLM(input);
    setMessages([...updatedMessages, { role: 'assistant', text: reply }]);
  };

  return (
    <div className="min-h-screen bg-gray-700 text-white flex">
      {showSidebar && (
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-600 font-serif">
          <button onClick={openNewChatTab} className="bg-white text-black rounded-full px-4 py-2 mb-4 w-full">New Chat</button>
          {/* Sidebar content */}
        </aside>
      )}

      <div className="flex-1 flex flex-col relative">
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
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Summarize this article</button>
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Explain this concept</button>
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Search in documents only</button>
          </div>

          <div className="w-full max-w-xl text-left mt-4">
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
