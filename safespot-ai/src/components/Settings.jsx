import React, { useState, useEffect } from "react";
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  signOut,
  sendEmailVerification
} from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { requestNotificationPermission } from "../services/notificationService";

export default function Settings({ user }) {
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  // Profile data
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  
  // Password data
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Preferences
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reportUpdates, setReportUpdates] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setDisplayName(user.displayName || "");
        setEmail(user.email || "");

        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          const savedDarkMode = localStorage.getItem('darkMode') === 'true';
          setDarkMode(savedDarkMode || data.darkMode || false);
          setEmailNotifications(data.emailNotifications !== false);
          setPushNotifications(data.pushNotifications !== false);
          setReportUpdates(data.reportUpdates !== false);
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      if (!document.getElementById('dark-mode-styles')) {
        const style = document.createElement('style');
        style.id = 'dark-mode-styles';
        style.innerHTML = `
          body.dark-mode { background: #0f172a !important; }
          body.dark-mode * { border-color: #334155 !important; }
          body.dark-mode .bg-white { background: #1e293b !important; }
          body.dark-mode .bg-gradient-to-br.from-gray-50 { background: #0f172a !important; }
          
          /* ALL TEXT ELEMENTS - BRIGHT WHITE */
          body.dark-mode .text-gray-900,
          body.dark-mode h1,
          body.dark-mode h2,
          body.dark-mode h3,
          body.dark-mode h4,
          body.dark-mode span,
          body.dark-mode p,
          body.dark-mode label,
          body.dark-mode button,
          body.dark-mode div { 
            color: #f1f5f9 !important;
          }
          
          body.dark-mode .text-gray-700 { 
            color: #e2e8f0 !important;
          }
          
          body.dark-mode .text-gray-600 { 
            color: #cbd5e1 !important;
          }
          
          body.dark-mode .text-gray-500 { 
            color: #94a3b8 !important;
          }
          
          /* Inputs */
          body.dark-mode input { 
            background: #0f172a !important; 
            color: #f1f5f9 !important; 
            border-color: #334155 !important; 
          }
          
          body.dark-mode input::placeholder {
            color: #64748b !important;
          }
          
          /* Borders */
          body.dark-mode .border-gray-200,
          body.dark-mode .border-gray-100 { 
            border-color: #334155 !important; 
          }
          
          /* Gradient backgrounds - make them darker */
          body.dark-mode .from-blue-50,
          body.dark-mode .from-purple-50,
          body.dark-mode .from-yellow-50,
          body.dark-mode .from-green-50,
          body.dark-mode .from-red-50,
          body.dark-mode .from-indigo-50,
          body.dark-mode .from-gray-50 {
            background: #1e293b !important;
          }
          
          /* Keep button text visible */
          body.dark-mode button.bg-gradient-to-r,
          body.dark-mode button[class*="bg-gradient"] {
            color: white !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      document.body.classList.remove('dark-mode');
      const styleElement = document.getElementById('dark-mode-styles');
      if (styleElement) styleElement.remove();
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { displayName, updatedAt: new Date() });

      showMessage('success', '✓ Profile updated');
      setShowProfileModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      showMessage('error', 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const saveEmail = async () => {
    setSaving(true);
    try {
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { email, updatedAt: new Date() });

      showMessage('success', '✓ Email updated');
      setShowEmailModal(false);
      window.location.reload();
    } catch (error) {
      console.error("Error:", error);
      if (error.code === "auth/requires-recent-login") {
        showMessage('error', 'Please re-login to change email');
      } else if (error.code === "auth/email-already-in-use") {
        showMessage('error', 'Email already in use');
      } else {
        showMessage('error', 'Failed to update email');
      }
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      showMessage('error', 'Fill all fields');
      return;
    }
    if (newPassword.length < 6) {
      showMessage('error', 'Password must be 6+ characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showMessage('error', 'Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      showMessage('success', '✓ Password changed');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordModal(false);
    } catch (error) {
      console.error("Error:", error);
      if (error.code === "auth/wrong-password") {
        showMessage('error', 'Current password incorrect');
      } else {
        showMessage('error', 'Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const sendVerification = async () => {
    setSaving(true);
    try {
      await sendEmailVerification(user);
      showMessage('success', '✓ Verification email sent');
    } catch (error) {
      showMessage('error', 'Failed to send email');
    } finally {
      setSaving(false);
    }
  };

  const checkVerification = async () => {
    setSaving(true);
    try {
      await user.reload();
      if (user.emailVerified) {
        await updateDoc(doc(db, 'users', user.uid), {
          emailVerified: true,
          verifiedAt: new Date()
        });
        showMessage('success', '✓ Email verified!');
        window.location.reload();
      } else {
        showMessage('error', 'Not verified yet');
      }
    } catch (error) {
      showMessage('error', 'Check failed');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = async (preference, value) => {
    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, { [preference]: value, updatedAt: new Date() });
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleToggle = async (setter, preference, currentValue) => {
    const newValue = !currentValue;
    setter(newValue);
    await updatePreference(preference, newValue);
  };

  const handleNotificationToggle = async () => {
    if (!pushNotifications) {
      const granted = await requestNotificationPermission();
      if (granted) {
        handleToggle(setPushNotifications, "pushNotifications", pushNotifications);
        showMessage('success', '✓ Notifications enabled');
      } else {
        showMessage('error', 'Permission denied');
      }
    } else {
      handleToggle(setPushNotifications, "pushNotifications", pushNotifications);
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm("⚠️ Delete account? This cannot be undone!")) return;
    const confirmText = window.prompt("Type 'DELETE' to confirm:");
    if (confirmText !== "DELETE") return;

    try {
      await updateDoc(doc(db, "users", user.uid), { deleted: true, deletedAt: new Date() });
      await user.delete();
      window.location.href = "/";
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        showMessage('error', 'Please re-login first');
      } else {
        showMessage('error', 'Failed to delete');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center">
        <div className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Icon */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl mb-6 group hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Settings
          </h1>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Manage your account, security, and preferences
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-xl border-l-4 ${
            message.type === 'success' 
              ? 'bg-green-50 border-green-500 text-green-800' 
              : 'bg-red-50 border-red-500 text-red-800'
          }`}>
            <p className="font-bold">{message.text}</p>
          </div>
        )}

        <div className="space-y-6 animate-fade-in-up">
          {/* Account Management */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Account Management</h2>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {/* Profile */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full p-8 flex items-center justify-between hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                    <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-600 flex items-center justify-center text-white font-black text-2xl shadow-xl transform group-hover:scale-110 transition-transform">
                      {user.displayName?.charAt(0) || 'U'}
                    </div>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-900 text-xl mb-1">{user.displayName || 'User'}</p>
                    <p className="text-sm text-gray-600 font-semibold">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Email Verification */}
              {!user.emailVerified && (
                <div className="p-8 bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 border-t-4 border-yellow-400">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center shadow-lg animate-pulse">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-black text-gray-900 text-lg mb-1">Verify Your Email</p>
                        <p className="text-sm text-gray-600 font-semibold">Secure your account by verifying your email address</p>
                      </div>
                    </div>
                    <div className="flex gap-3 flex-shrink-0">
                      <button
                        onClick={sendVerification}
                        disabled={saving}
                        className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-bold hover:from-yellow-600 hover:to-orange-700 hover:shadow-lg transform hover:scale-105 transition-all disabled:opacity-50"
                      >
                        Send Link
                      </button>
                      <button
                        onClick={checkVerification}
                        disabled={saving}
                        className="px-6 py-3 border-2 border-yellow-500 text-yellow-700 rounded-xl font-bold hover:bg-yellow-100 transform hover:scale-105 transition-all disabled:opacity-50"
                      >
                        I Verified
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Change Password */}
              <button
                onClick={() => setShowPasswordModal(true)}
                className="w-full p-8 flex items-center justify-between hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-900 text-lg mb-1">Change Password</p>
                    <p className="text-sm text-gray-600 font-semibold">Update your account password</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              {/* Email Settings */}
              <button
                onClick={() => setShowEmailModal(true)}
                className="w-full p-8 flex items-center justify-between hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <p className="font-black text-gray-900 text-lg mb-1">Change Email</p>
                    <p className="text-sm text-gray-600 font-semibold">Update your email address</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">Edit</span>
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Notifications</h2>
              </div>
            </div>

            <div className="p-6 space-y-2">
              <label className="flex items-center justify-between cursor-pointer p-5 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="font-black text-gray-900 text-lg">Email Notifications</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={emailNotifications}
                    onChange={() => handleToggle(setEmailNotifications, "emailNotifications", emailNotifications)}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-9 bg-gray-300 peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-600 peer-checked:to-purple-600 shadow-inner"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-5 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <span className="font-black text-gray-900 text-lg">Push Notifications</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={pushNotifications}
                    onChange={handleNotificationToggle}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-9 bg-gray-300 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-600 peer-checked:to-pink-600 shadow-inner"></div>
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer p-5 rounded-2xl hover:bg-gradient-to-r hover:from-green-50 hover:to-emerald-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <span className="font-black text-gray-900 text-lg">Report Updates</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={reportUpdates}
                    onChange={() => handleToggle(setReportUpdates, "reportUpdates", reportUpdates)}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-9 bg-gray-300 peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-green-600 peer-checked:to-emerald-600 shadow-inner"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-yellow-50 via-orange-50 to-amber-50">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-gray-900">Preferences</h2>
              </div>
            </div>

            <div className="p-6">
              <label className="flex items-center justify-between cursor-pointer p-5 rounded-2xl hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 transition-all group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center opacity-75 group-hover:opacity-100 transition-opacity">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <span className="font-black text-gray-900 text-lg">Dark Mode</span>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => handleToggle(setDarkMode, "darkMode", darkMode)}
                    className="sr-only peer"
                  />
                  <div className="w-16 h-9 bg-gray-300 peer-focus:ring-4 peer-focus:ring-gray-400 rounded-full peer peer-checked:after:translate-x-7 peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-8 after:w-8 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-gray-700 peer-checked:to-gray-900 shadow-inner"></div>
                </div>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-gradient-to-br from-red-50 via-pink-50 to-red-50 rounded-3xl shadow-xl border-2 border-red-200 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="p-8 border-b-2 border-red-200 bg-gradient-to-r from-red-100 to-pink-100">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-pink-600 flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-black text-red-900">Danger Zone</h2>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <button
                onClick={() => signOut(auth)}
                className="w-full px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-xl font-black hover:bg-gray-50 hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Sign Out
              </button>
              <button
                onClick={deleteAccount}
                className="w-full px-8 py-4 bg-gradient-to-r from-red-600 via-pink-600 to-red-600 text-white rounded-xl font-black hover:from-red-700 hover:via-pink-700 hover:to-red-700 hover:shadow-xl transform hover:scale-105 transition-all"
              >
                Delete Account Permanently
              </button>
            </div>
          </div>
        </div>

        {/* Profile Modal */}
        {showProfileModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowProfileModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-black text-gray-900 mb-6">Edit Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveProfile}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowEmailModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-black text-gray-900 mb-6">Change Email</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">New Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-2">You may need to re-login after this</p>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={saveEmail}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowPasswordModal(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-black text-gray-900 mb-6">Change Password</h3>
              <div className="space-y-4">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Current password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="New password (min 6 chars)"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                />
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={changePassword}
                    disabled={saving}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg disabled:opacity-50"
                  >
                    {saving ? 'Updating...' : 'Update'}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-down {
          animation: fade-in-down 0.6s ease-out;
        }
        
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out both;
        }
      `}</style>
    </div>
  );
}