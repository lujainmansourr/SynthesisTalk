import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();

  const handleGuestLogin = () => {
    navigate('/chat');
  };

  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center justify-center">
      <img src="/assets/logo.png" alt="Logo" className="h-16 mb-4" />
      <h1 className="text-2xl font-serif font-bold text-white mb-4">Welcome Back!</h1>
      <div className="bg-white rounded-3xl p-8 w-80">
        <input type="email" placeholder="Email Address" className="w-full p-2 border mb-4 rounded" />
        <input type="password" placeholder="Password" className="w-full p-2 border mb-4 rounded" />
        <button className="w-full bg-gray-700 text-white py-2 rounded-full mb-2">Continue</button>
        <p className="text-sm font-serif text-center">
          Don't have an account? <Link to="/signup" className="underline">Sign up</Link>
        </p>
        <button onClick={handleGuestLogin} className="w-full bg-blue-500 text-white py-2 rounded-full mt-2">
          Continue as Guest
        </button>
      </div>
    </div>
  );
}

export default Login;
