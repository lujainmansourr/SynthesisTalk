import React from 'react';

function NewChat() {
  return (
    <div className="min-h-screen bg-gray-700 text-white flex flex-col">
      <header className="flex items-center justify-between px-4 py-2">
        <h1 className="text-2xl font-serif font-bold">New Chat</h1>
      </header>

      <main className="flex-1 flex items-center justify-center text-center">
        <h2 className="text-xl font-serif">Start a brand new conversation here!</h2>
      </main>
    </div>
  );
}

export default NewChat;
