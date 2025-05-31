import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';

function Profile({ onClose }) {
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: 'Guest', email: '' });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        // Firebase user detected, set user details
        setUser({
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || ''
        });
      } else {
        // No Firebase user, check guest mode
        const guestMode = localStorage.getItem('guestMode');
        if (guestMode === 'true') {
          setUser({ name: 'Guest', email: '' });
        } else {
          const savedUser = JSON.parse(localStorage.getItem('chatUser'));
          if (savedUser && savedUser.name) {
            setUser(savedUser);
          } else {
            setUser({ name: 'Guest', email: '' });
          }
        }
      }
    });

    return () => unsubscribe();  // Clean up listener
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error.message);
    }
    localStorage.removeItem('chatUser');
    localStorage.removeItem('guestMode');
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 flex justify-end items-start z-50">
      <div className="bg-gray-800 text-white w-80 rounded-lg mt-20 mr-10 p-6 relative shadow-xl">
        <button className="absolute top-2 right-3 text-2xl text-white" onClick={onClose}>&times;</button>
        {user.email && <p className="text-sm text-gray-300 mb-2">{user.email}</p>}
        <div className="flex justify-center items-center mb-4">
          <div className="bg-teal-500 rounded-full h-16 w-16 flex items-center justify-center text-2xl font-bold">
            {user.name ? user.name.charAt(0).toUpperCase() : 'G'}
          </div>
        </div>
        <h2 className="text-center text-xl font-semibold mb-4">Hi, {user.name || 'Guest'}!</h2>
        <button
          onClick={handleLogout}
          className="w-full bg-red-500 text-white py-2 rounded-full mt-2"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Profile;
