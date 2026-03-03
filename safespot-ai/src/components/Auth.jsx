import React, { useState, useEffect } from 'react';
import { 
  sendEmailVerification, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function Auth({ onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  useEffect(() => {
    const user = auth.currentUser;
    if (user && !user.emailVerified) {
      setNeedsVerification(true);
    }
  }, []);

  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        setError('');
        setTimeout(() => {
          setError('Verification email sent! Check your inbox.');
        }, 100);
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to send verification email');
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!displayName.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: displayName.trim() });

      await setDoc(doc(db, 'users', user.uid), {
        displayName: displayName.trim(),
        email: email,
        role: 'user',
        isAdmin: false,
        emailVerified: false,
        createdAt: new Date(),
        lastLogin: new Date()
      });

      await sendEmailVerification(user);
      setNeedsVerification(true);
      setLoading(false);

    } catch (error) {
      console.error('Signup error:', error);
      if (error.code === 'auth/email-already-in-use') {
        setError('This email is already registered');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/weak-password') {
        setError('Password is too weak');
      } else {
        setError('Failed to create account');
      }
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setNeedsVerification(true);
        setError('Please verify your email before logging in');
        setLoading(false);
        return;
      }

      await setDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date()
      }, { merge: true });

      setLoading(false);
      onAuthSuccess();

    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (error.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else if (error.code === 'auth/invalid-email') {
        setError('Invalid email address');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Try again later');
      } else {
        setError('Login failed. Check your credentials');
      }
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    const user = auth.currentUser;
    
    if (user) {
      await user.reload();
      
      if (user.emailVerified) {
        await setDoc(doc(db, 'users', user.uid), {
          emailVerified: true,
          verifiedAt: new Date()
        }, { merge: true });

        setNeedsVerification(false);
        onAuthSuccess();
      } else {
        setError('Email not verified yet. Check your inbox');
      }
    }
    setLoading(false);
  };

  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-xl">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <h2 className="text-3xl font-black text-center text-gray-900 mb-3">
            Verify Your Email
          </h2>
          <p className="text-center text-gray-600 mb-6">
            Check your inbox at <span className="font-bold text-gray-900">{auth.currentUser?.email}</span>
          </p>

          <div className="bg-blue-50 rounded-xl p-5 mb-6 border border-blue-200">
            <ol className="space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                <span>Check your email inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                <span>Click the verification link</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                <span>Come back and click "I Verified"</span>
              </li>
            </ol>
          </div>

          {error && (
            <div className={`mb-4 p-4 rounded-xl border-l-4 ${
              error.includes('sent') 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}>
              <p className="font-semibold text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={handleCheckVerification}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50"
            >
              {loading ? 'Checking...' : '✓ I Verified My Email'}
            </button>

            <button
              onClick={handleResendVerification}
              disabled={loading}
              className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
            >
              Resend Email
            </button>

            <button
              onClick={() => {
                auth.signOut();
                setNeedsVerification(false);
              }}
              className="w-full py-3 text-gray-600 font-semibold hover:text-gray-900 transition-all"
            >
              Use Different Email
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border border-gray-200">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-xl">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
          </div>
        </div>

        <h2 className="text-3xl font-black text-center text-gray-900 mb-2">
          SafeSpot
        </h2>
        <p className="text-center text-gray-600 mb-8">
          Community Safety Reporter
        </p>

        <div className="flex gap-2 bg-gray-100 p-1.5 rounded-xl mb-6">
          <button
            onClick={() => {
              setIsLogin(true);
              setError('');
            }}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              isLogin
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600'
            }`}
          >
            Login
          </button>
          <button
            onClick={() => {
              setIsLogin(false);
              setError('');
            }}
            className={`flex-1 py-3 rounded-lg font-bold transition-all ${
              !isLogin
                ? 'bg-white text-gray-900 shadow-md'
                : 'text-gray-600'
            }`}
          >
            Sign Up
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border-l-4 border-red-500 rounded-xl p-4">
            <p className="text-red-800 font-semibold text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Password *
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all"
            />
            {!isLogin && (
              <p className="text-xs text-gray-500 mt-2">Minimum 6 characters</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white rounded-xl font-black text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isLogin ? 'Logging in...' : 'Creating...'}
              </div>
            ) : (
              isLogin ? 'Login' : 'Create Account'
            )}
          </button>
        </form>

        {!isLogin && (
          <div className="mt-6 bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <p className="text-green-900 font-bold text-sm">Email Verification</p>
                <p className="text-green-700 text-xs">We'll send a link to verify your account</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}