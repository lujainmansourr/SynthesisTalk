// ✅ Simplified Chat.js: removed profile logic to move it to Profile.js
import React, { useState } from 'react';
import Profile from './Profile';

function Chat() {
  const [showSidebar, setShowSidebar] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const toggleSidebar = () => {
    setShowSidebar(prev => !prev);
  };

  const openNewChatTab = () => {
    window.open(window.location.origin + '/chat', '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-700 text-white flex">
      {showSidebar && (
        <aside className="w-64 bg-gray-800 p-4 border-r border-gray-600 font-serif">
          <button
            onClick={openNewChatTab}
            className="bg-white text-black rounded-full px-4 py-2 mb-4 w-full"
          >
            New Chat
          </button>
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2">Today</h3>
            <ul className="space-y-1">
              <li>Chat 1</li>
              <li>Chat 2</li>
              <li>Chat 3</li>
              <li>Chat 4</li>
            </ul>
          </div>
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2">Yesterday</h3>
            <ul className="space-y-1">
              <li>Chat 1</li>
              <li>Chat 2</li>
              <li>Chat 3</li>
              <li>Chat 4</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-lg mb-2">Previous 30 Days</h3>
            <ul className="space-y-1">
              <li>Chat 1</li>
              <li>Chat 2</li>
              <li>Chat 3</li>
              <li>Chat 4</li>
            </ul>
          </div>
        </aside>
      )}

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

        <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <h2 className="text-2xl font-serif mb-4">Hi, How can I help you today?</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Summarize this article</button>
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Explain this concept</button>
            <button className="bg-white text-black font-serif rounded-full px-4 py-2">Search in documents only</button>
          </div>
        </main>

        <footer className="px-4 py-8">
          <div className="bg-white text-black rounded-full flex items-center px-6 py-8 w-full text-lg">
            <span className="text-3xl mr-4">+</span>
            <input type="text" placeholder="What's on your mind?" className="flex-1 bg-transparent outline-none font-serif text-lg" />
            <button className="text-3xl ml-4">↑</button>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default Chat;
