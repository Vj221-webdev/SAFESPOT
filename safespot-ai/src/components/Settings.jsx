import React, { useState, useEffect } from "react";
import { 
  updateProfile, 
  updateEmail, 
  updatePassword, 
  EmailAuthProvider, 
  reauthenticateWithCredential,
  signOut 
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebase";

export default function Settings({ user }) {
  
  // Account Info
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  
  // Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  
  // Preferences
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [reportUpdates, setReportUpdates] = useState(true);
  
  // UI States
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Load dark mode from localStorage immediately
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
      setDarkMode(true);
    }
  }, []);

  // Load user data and preferences from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Set basic user info from Firebase Auth
        setUsername(user.displayName || "");
        setEmail(user.email || "");

        // Load user preferences from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const data = userDoc.data();
          setTwoFactorAuth(data.twoFactorAuth || false);
          
          // Load dark mode from localStorage first, then Firestore
          const savedDarkMode = localStorage.getItem('darkMode') === 'true';
          const firestoreDarkMode = data.darkMode || false;
          setDarkMode(savedDarkMode || firestoreDarkMode);
          
          setEmailNotifications(data.emailNotifications !== false);
          setPushNotifications(data.pushNotifications !== false);
          setReportUpdates(data.reportUpdates !== false);
        } else {
          // Create initial user document if it doesn't exist
          await setDoc(userDocRef, {
            displayName: user.displayName || "",
            email: user.email || "",
            createdAt: new Date(),
            emailNotifications: true,
            pushNotifications: true,
            reportUpdates: true,
            darkMode: false,
            twoFactorAuth: false
          });
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setErrorMessage("Failed to load user preferences");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user]);

  // Apply dark mode with custom styles
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      
      // Create style element if it doesn't exist
      if (!document.getElementById('dark-mode-styles')) {
        const style = document.createElement('style');
        style.id = 'dark-mode-styles';
        style.innerHTML = `
          body.dark-mode {
            background: #0f172a !important;
          }
          body.dark-mode * {
            border-color: #334155 !important;
          }
          body.dark-mode .bg-white {
            background: #1e293b !important;
            color: #f1f5f9 !important;
          }
          body.dark-mode .bg-gradient-to-br.from-gray-50,
          body.dark-mode .bg-gray-50 {
            background: #0f172a !important;
          }
          body.dark-mode .text-gray-900 {
            color: #f1f5f9 !important;
          }
          body.dark-mode .text-gray-800 {
            color: #e2e8f0 !important;
          }
          body.dark-mode .text-gray-700 {
            color: #cbd5e1 !important;
          }
          body.dark-mode .text-gray-600 {
            color: #94a3b8 !important;
          }
          body.dark-mode .text-gray-500 {
            color: #64748b !important;
          }
          body.dark-mode .text-gray-400 {
            color: #475569 !important;
          }
          body.dark-mode input,
          body.dark-mode textarea,
          body.dark-mode select {
            background: #0f172a !important;
            color: #f1f5f9 !important;
            border-color: #334155 !important;
          }
          body.dark-mode input:focus,
          body.dark-mode textarea:focus,
          body.dark-mode select:focus {
            background: #1e293b !important;
            border-color: #3b82f6 !important;
          }
          body.dark-mode input::placeholder,
          body.dark-mode textarea::placeholder {
            color: #64748b !important;
          }
          body.dark-mode .from-gray-50.to-gray-100,
          body.dark-mode .bg-gradient-to-br {
            background: linear-gradient(to bottom right, #0f172a, #1e293b) !important;
          }
          body.dark-mode .border-gray-200,
          body.dark-mode .border-gray-100 {
            border-color: #334155 !important;
          }
          body.dark-mode .shadow-xl,
          body.dark-mode .shadow-2xl {
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
          }
          body.dark-mode .shadow-lg {
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3) !important;
          }
        `;
        document.head.appendChild(style);
      }
    } else {
      document.body.classList.remove('dark-mode');
      const styleElement = document.getElementById('dark-mode-styles');
      if (styleElement) {
        styleElement.remove();
      }
    }
    
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Save account information
  const saveAccountInfo = async () => {
    if (!user) return;

    setSaving(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      // Update display name in Firebase Auth
      if (username !== user.displayName) {
        await updateProfile(user, {
          displayName: username
        });
      }

      // Update email if changed (requires recent authentication)
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Update Firestore document
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        displayName: username,
        email: email,
        updatedAt: new Date()
      });

      setSuccessMessage("Account information updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error updating account:", error);
      
      if (error.code === "auth/requires-recent-login") {
        setErrorMessage("Please log out and log back in to change your email");
      } else if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already in use by another account");
      } else {
        setErrorMessage("Failed to update account information");
      }
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const changePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password");
      return;
    }

    if (!newPassword) {
      setPasswordError("Please enter a new password");
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSaving(true);

    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);

      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(""), 3000);
    } catch (error) {
      console.error("Error changing password:", error);
      
      if (error.code === "auth/wrong-password") {
        setPasswordError("Current password is incorrect");
      } else if (error.code === "auth/weak-password") {
        setPasswordError("Password is too weak");
      } else {
        setPasswordError("Failed to change password");
      }
    } finally {
      setSaving(false);
    }
  };

  // Update preferences
  const updatePreference = async (preference, value) => {
    if (!user) return;

    try {
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        [preference]: value,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Error updating preference:", error);
    }
  };

  // Handle toggle changes with Firestore update
  const handleToggle = async (setter, preference, currentValue) => {
    const newValue = !currentValue;
    setter(newValue);
    await updatePreference(preference, newValue);
  };

  // Clear cache
  const clearCache = () => {
    if (window.confirm("Are you sure you want to clear the cache?")) {
      localStorage.clear();
      sessionStorage.clear();
      setSuccessMessage("Cache cleared successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  // Delete account
  const deleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    const confirmText = window.prompt("Type 'DELETE' to confirm account deletion:");
    if (confirmText !== "DELETE") {
      return;
    }

    try {
      // Delete user document from Firestore
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, { deleted: true, deletedAt: new Date() }, { merge: true });

      // Delete Firebase Auth account
      await user.delete();

      // Redirect to home
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      
      if (error.code === "auth/requires-recent-login") {
        setErrorMessage("Please log out and log back in to delete your account");
      } else {
        setErrorMessage("Failed to delete account");
      }
    }
  };

  // Logout
  const logout = async () => {
    if (window.confirm("Are you sure you want to logout?")) {
      try {
        await signOut(auth);
        window.location.href = "/login";
      } catch (error) {
        console.error("Error logging out:", error);
        setErrorMessage("Failed to logout");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">Not Logged In</h3>
          <p className="text-gray-600 mb-6">Please log in to access settings</p>
          <button
            onClick={() => window.location.href = "/login"}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in-down">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-2xl mb-6 group hover:scale-110 transition-transform duration-300">
            <svg className="w-10 h-10 text-white group-hover:rotate-90 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Settings
          </h2>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto">
            Manage your account, security, and preferences
          </p>
        </div>

        {/* Success/Error Messages */}
        {successMessage && (
          <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 rounded-xl p-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-green-800 font-semibold">{successMessage}</span>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-xl p-5 animate-fade-in">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
              </svg>
              <span className="text-red-800 font-semibold">{errorMessage}</span>
              <button onClick={() => setErrorMessage("")} className="ml-auto text-red-400 hover:text-red-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        <div className="space-y-6">
          {/* Account Management Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Account Management</h3>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">Display Name</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="Your display name"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="your.email@example.com"
                />
                <p className="mt-2 text-sm text-gray-500">You may need to re-login after changing your email</p>
              </div>

              <div className="flex gap-4 flex-wrap pt-2">
                <button
                  onClick={saveAccountInfo}
                  disabled={saving}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 transition-all duration-300"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {/* Account Info Display */}
              <div className="mt-6 p-5 bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-blue-900">Account Information</span>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700"><span className="font-semibold">User ID:</span> {user.uid}</p>
                  <p className="text-gray-700"><span className="font-semibold">Account created:</span> {user.metadata.creationTime}</p>
                  <p className="text-gray-700"><span className="font-semibold">Last sign-in:</span> {user.metadata.lastSignInTime}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Password & Authentication Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Password & Security</h3>
            </div>

            {/* Password Error/Success */}
            {passwordError && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-800 text-sm font-semibold">{passwordError}</p>
              </div>
            )}

            {passwordSuccess && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
                <p className="text-green-800 text-sm font-semibold">{passwordSuccess}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="Enter current password"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="Enter new password"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="Confirm new password"
                />
              </div>

              <button
                onClick={changePassword}
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 disabled:scale-100 transition-all duration-300"
              >
                {saving ? "Changing Password..." : "Change Password"}
              </button>

              {/* 2FA Toggle */}
              <div className="mt-6 p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-900 font-bold block group-hover:text-purple-600 transition-colors">Two-Factor Authentication</span>
                      <span className="text-sm text-gray-500">Add extra security to your account</span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={twoFactorAuth}
                      onChange={() => handleToggle(setTwoFactorAuth, "twoFactorAuth", twoFactorAuth)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-500/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Notifications</h3>
            </div>

            <div className="space-y-4">
              {/* Email Notifications */}
              <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-900 font-bold block group-hover:text-indigo-600 transition-colors">Email Notifications</span>
                      <span className="text-sm text-gray-500">Receive updates via email</span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={() => handleToggle(setEmailNotifications, "emailNotifications", emailNotifications)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500"></div>
                  </div>
                </label>
              </div>

              {/* Push Notifications */}
              <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-900 font-bold block group-hover:text-indigo-600 transition-colors">Push Notifications</span>
                      <span className="text-sm text-gray-500">Get instant push alerts</span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={pushNotifications}
                      onChange={() => handleToggle(setPushNotifications, "pushNotifications", pushNotifications)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500"></div>
                  </div>
                </label>
              </div>

              {/* Report Updates */}
              <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
                <label className="flex items-center justify-between cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <span className="text-gray-900 font-bold block group-hover:text-indigo-600 transition-colors">Report Updates</span>
                      <span className="text-sm text-gray-500">Get notified on report status changes</span>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={reportUpdates}
                      onChange={() => handleToggle(setReportUpdates, "reportUpdates", reportUpdates)}
                      className="sr-only peer"
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500"></div>
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Display Settings Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Display Settings</h3>
            </div>

            <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200">
              <label className="flex items-center justify-between cursor-pointer group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-gray-900 font-bold block group-hover:text-yellow-600 transition-colors">Dark Mode</span>
                    <span className="text-sm text-gray-500">Switch to dark theme</span>
                  </div>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={() => handleToggle(setDarkMode, "darkMode", darkMode)}
                    className="sr-only peer"
                  />
                  <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-500"></div>
                </div>
              </label>
            </div>
          </section>

          {/* Privacy Settings Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Privacy & Data</h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200 hover:border-green-500 transition-all group">
                <span className="text-gray-900 font-bold group-hover:text-green-600 transition-colors">Clear Cache</span>
                <button
                  onClick={clearCache}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Clear
                </button>
              </div>

              <div className="flex items-center justify-between p-5 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200 hover:border-red-500 transition-all group">
                <div>
                  <span className="text-gray-900 font-bold block group-hover:text-red-600 transition-colors">Delete Account</span>
                  <span className="text-sm text-red-600">This action cannot be undone</span>
                </div>
                <button
                  onClick={deleteAccount}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </section>

          {/* Logout Section */}
          <section className="bg-gradient-to-r from-red-600 via-pink-600 to-red-600 rounded-3xl shadow-2xl p-8 text-center animate-fade-in-up relative overflow-hidden" style={{ animationDelay: '0.5s' }}>
            <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Ready to go?</h3>
              <p className="text-red-100 mb-6">You'll be logged out of your account</p>
              <button
                onClick={logout}
                className="px-10 py-4 bg-white text-red-600 rounded-xl font-black shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                Logout
              </button>
            </div>
          </section>
        </div>
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
        
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
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