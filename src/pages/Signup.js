import React from 'react';
import { Link } from 'react-router-dom';

function Signup() {
  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center justify-center">
      <img src="/assets/logo.png" alt="Logo" className="h-16 mb-4" />
      <h1 className="text-2xl font-serif font-bold text-white mb-4">Create your account</h1>
      <p className="text-sm font-serif text-center text-white mb-4">
        Please note that phone verification is required for signup. Your number will only be used to verify your identity for security purposes.
      </p>
      <div className="bg-white rounded-3xl p-8 w-80">
        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-2 border mb-4 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border mb-4 rounded"
        />
        <button className="w-full bg-gray-700 text-white py-2 rounded-full mb-2">Continue</button>
        <p className="text-sm font-serif text-center">
          Already have an account? <Link to="/login" className="underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
