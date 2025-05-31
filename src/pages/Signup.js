import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from 'firebase/auth';
import { auth } from '../firebase';

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationSent, setVerificationSent] = useState(false);

  const handleGuestSignup = () => {
    localStorage.removeItem('chatUser');
    localStorage.setItem('guestMode', 'true');
    navigate('/chat');
  };

  const handleConfirmSignup = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });
      await sendEmailVerification(user);

      console.log('📧 Verification Email Sent To:', email);
      setVerificationSent(true); // Show the new UI
    } catch (error) {
      console.error('Signup Failed:', error.message);
      let message;
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = '❌ This Email Is Already Registered. Please Log In Instead.';
          break;
        case 'auth/invalid-email':
          message = '❌ Please Enter a Valid Email Address.';
          break;
        case 'auth/weak-password':
          message = '❌ Password Must Be At Least 6 Characters.';
          break;
        default:
          message = '❌ Signup Failed. Please Try Again.';
      }
      alert(message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-700 flex flex-col items-center justify-center px-4 text-white">
      <img src="/assets/logo.png" alt="Logo" className="h-16 mb-6" />

      {verificationSent ? (
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4">📧 Verify Your Email</h2>
          <p className="mb-4">
            A verification link has been sent to <strong>{email}</strong>. Please check your inbox and verify your email address.
          </p>
          <p>
            Once verified, you can <Link to="/login" className="underline text-blue-400">log in here</Link>.
          </p>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-serif font-bold text-white mb-4">Create your account</h1>
          <form onSubmit={handleConfirmSignup} className="bg-white text-black rounded-3xl p-8 w-80">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2 border mb-4 rounded"
            />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 border mb-4 rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2 border mb-4 rounded"
            />
            <button type="submit" className="w-full bg-gray-700 text-white py-2 rounded-full mb-2">
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
        </>
      )}
    </div>
  );
}

export default Signup;