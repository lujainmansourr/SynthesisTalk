import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center justify-center">
      <img src="/assets/logo.png" alt="Logo" className="h-16 mb-4" />
      <div className="bg-white rounded-3xl p-8 w-80 text-center">
        <h1 className="text-2xl font-serif font-bold mb-2">Welcome to SynthesisTalk</h1>
        <p className="text-sm font-serif mb-4">
          Log in or sign up to chat smarter, upload files, and explore topics with AI.
        </p>
        <Link to="/login">
          <button className="w-full bg-gray-700 text-white py-2 rounded-full mb-2">Log In</button>
        </Link>
        <Link to="/signup">
          <button className="w-full bg-gray-700 text-white py-2 rounded-full">Sign Up</button>
        </Link>
      </div>
    </div>
  );
}

export default Landing;
