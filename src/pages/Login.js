import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase'; 

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGuestLogin = () => {
    navigate('/chat');
  };

const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log('✅ User logged in:', userCredential.user);
    navigate('/chat');
  } catch (error) {
    // Log the full error object for debugging
    console.error('❌ Firebase Error:', error);

    // Extract error code properly (sometimes it's in error.error?.code)
    const errorCode = error.code || (error.error && error.error.code) || 'unknown-error';
    console.log('❌ Error Code:', errorCode);

    // Show custom messages for specific error codes
    let message;
    switch (errorCode) {
      default:
        message = '❌ Login failed. Please try again.';
    }
    alert(message);
  }
};


  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center justify-center">
      <img src="/assets/logo.png" alt="Logo" className="h-16 mb-4" />
      <h1 className="text-2xl font-serif font-bold text-white mb-4">Welcome Back!</h1>
      <form onSubmit={handleLogin} className="bg-white rounded-3xl p-8 w-80">
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border mb-4 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border mb-4 rounded" />
        <button type="submit" className="w-full bg-gray-700 text-white py-2 rounded-full mb-2">Continue</button>
        <p className="text-sm font-serif text-center">Don't have an account? <Link to="/signup" className="underline">Sign up</Link></p>
        <button onClick={handleGuestLogin} type="button" className="w-full bg-blue-500 text-white py-2 rounded-full mt-2">Continue as Guest</button>
      </form>
    </div>
  );
}

export default Login;
