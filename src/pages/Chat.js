import React from 'react';

function Chat() {
  return (
    <div className="min-h-screen bg-gray-700 text-white flex">
      <aside className="w-64 bg-gray-800 p-4">
        <button className="w-full bg-white text-black rounded-full py-2 mb-4">New Chat</button>
        <h2 className="font-bold mb-2">Today</h2>
        <ul>
          <li>Chat 1</li>
          <li>Chat 2</li>
          <li>Chat 3</li>
        </ul>
        <h2 className="font-bold mt-4 mb-2">Yesterday</h2>
        <ul>
          <li>Chat 1</li>
          <li>Chat 2</li>
        </ul>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-serif font-bold mb-4">Hi, How can I help you today?</h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <button className="bg-white text-black rounded-full px-4 py-2">Summarize this article</button>
          <button className="bg-white text-black rounded-full px-4 py-2">Explain this concept</button>
          <button className="bg-white text-black rounded-full px-4 py-2">Search in documents only</button>
        </div>
        <div className="bg-white text-black rounded-full p-4 flex items-center">
          <span className="mr-2 text-xl">+</span>
          <input className="flex-1 bg-transparent outline-none" placeholder="What’s on your mind?" />
          <button className="ml-2 text-xl">↑</button>
        </div>
      </main>
    </div>
  );
}

export default Chat;
