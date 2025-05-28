import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGuestSignup = () => {
    localStorage.removeItem('chatUser');          // Clear user data
    localStorage.setItem('guestMode', 'true');    // Enable guest mode
    navigate('/chat');
  };

  const handleConfirmSignup = (e) => {
    e.preventDefault();
    localStorage.setItem('chatUser', JSON.stringify({ name, email }));
    localStorage.removeItem('guestMode'); // Disable guest mode
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center justify-center">
      <img src="/assets/logo.png" alt="Logo" className="h-16 mb-4" />
      <h1 className="text-2xl font-serif font-bold text-white mb-4">Create your account</h1>

      <form onSubmit={handleConfirmSignup} className="bg-white rounded-3xl p-8 w-80">
        <input
          type="text"
          placeholder="Name"
          className="w-full p-2 border mb-4 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-2 border mb-4 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-4 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-gray-700 text-white py-2 rounded-full mb-2"
        >
          Confirm
        </button>
        <p className="text-sm font-serif text-center">
          Already have an account? <Link to="/login" className="underline">Log in</Link>
        </p>
        <button
          type="button"
          onClick={handleGuestSignup}
          className="w-full bg-blue-500 text-white py-2 rounded-full mt-2"
        >
          Continue as Guest
        </button>
      </form>
    </div>
  );
}

export default Signup;
