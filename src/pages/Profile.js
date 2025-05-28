import React, { useState, useEffect } from 'react';

function Profile({ onClose }) {
  const [user, setUser] = useState({ name: 'Guest', email: '' });

  useEffect(() => {
    const guestMode = localStorage.getItem('guestMode');

    if (guestMode === 'true') {
      // Force guest mode
      setUser({ name: 'Guest', email: '' });
    } else {
      const savedUser = JSON.parse(localStorage.getItem('chatUser'));
      if (savedUser && savedUser.name) {
        setUser(savedUser);
      } else {
        setUser({ name: 'Guest', email: '' });
      }
    }
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-end items-start z-50">
      <div className="bg-gray-800 text-white w-80 rounded-lg mt-20 mr-10 p-6 relative shadow-xl">
        <button
          className="absolute top-2 right-3 text-2xl text-white"
          onClick={onClose}
        >
          &times;
        </button>
        {user.email && <p className="text-sm text-gray-300 mb-2">{user.email}</p>}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-teal-500 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
        </div>
        <h2 className="text-center text-xl font-semibold mb-2">
          Hi, {user.name || 'Guest'}!
        </h2>
      </div>
    </div>
  );
}

export default Profile;
