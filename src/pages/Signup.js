import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../firebase';  // Import auth

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGuestSignup = () => {
    localStorage.removeItem('chatUser');
    localStorage.setItem('guestMode', 'true');
    navigate('/chat');
  };

  const handleConfirmSignup = async (e) => {
  e.preventDefault();
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    console.log('User signed up:', userCredential.user);
    navigate('/chat');
  } catch (error) {
    console.error('Signup failed:', error.message);
    let message = '';
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = '❌ This Email is Already Registered.';
        break;
      case 'auth/weak-password':
        message = '❌ Password Should Be At Least 6 Characters.';
        break;
      default:
        message = '❌ Signup Failed. Please Try Again.';
    }
    alert(message);
  }
};


  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center justify-center">
      <img src="/assets/logo.png" alt="Logo" className="h-16 mb-4" />
      <h1 className="text-2xl font-serif font-bold text-white mb-4">Create your account</h1>

      <form onSubmit={handleConfirmSignup} className="bg-white rounded-3xl p-8 w-80">
        <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} required className="w-full p-2 border mb-4 rounded" />
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full p-2 border mb-4 rounded" />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-2 border mb-4 rounded" />
        <button type="submit" className="w-full bg-gray-700 text-white py-2 rounded-full mb-2">Confirm</button>
        <p className="text-sm font-serif text-center">Already have an account? <Link to="/login" className="underline">Log in</Link></p>
        <button type="button" onClick={handleGuestSignup} className="w-full bg-blue-500 text-white py-2 rounded-full mt-2">Continue as Guest</button>
      </form>
    </div>
  );
}

export default Signup;
