import React, { useState, useEffect } from "react";

export default function Settings() {
  // Account Info
  const [username, setUsername] = useState("JohnDoe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [accounts, setAccounts] = useState([{ username, email }]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ username: "", email: "" });

  // Privacy / Security
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // Display / Notifications
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  const saveAccount = () => {
    setAccounts([{ username, email }]);
    alert("Account settings updated!");
  };

  const createAccount = () => {
    if (!newAccount.username || !newAccount.email) {
      alert("Please fill all fields");
      return;
    }
    setAccounts([...accounts, newAccount]);
    setNewAccount({ username: "", email: "" });
    setShowCreateModal(false);
    alert("New account created!");
  };

  const deleteAccount = (index) => {
    if (window.confirm("Delete this account?")) {
      const updatedAccounts = accounts.filter((_, i) => i !== index);
      setAccounts(updatedAccounts);
    }
  };

  const changePassword = () => {
    if (!newPassword) {
      alert("Please enter new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    setPassword(newPassword);
    setNewPassword("");
    setConfirmPassword("");
    alert("Password changed!");
  };

  const clearCache = () => alert("Cache cleared!");

  const deleteAllAccounts = () => {
    if (window.confirm("Delete all accounts? This cannot be undone.")) {
      setAccounts([]);
      setUsername("");
      setEmail("");
      alert("All accounts deleted!");
    }
  };

  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      alert("Logged out successfully!");
    }
  };

  useEffect(() => {
    if (darkMode) document.body.classList.add("bg-gray-900", "text-gray-100");
    else document.body.classList.remove("bg-gray-900", "text-gray-100");
  }, [darkMode]);

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
            Manage your account, privacy, display, and notification preferences
          </p>
        </div>

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
                <label className="block text-sm font-bold text-gray-900 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="Username"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="Email"
                />
              </div>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={saveAccount}
                  className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Save Account
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-4 bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Create New Account
                </button>
              </div>

              {/* Accounts Table */}
              <div className="mt-6 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Username</th>
                        <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Email</th>
                        <th className="px-6 py-4 text-left font-black text-gray-900 text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      {accounts.map((acc, index) => (
                        <tr key={index} className="border-t border-gray-100 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all">
                          <td className="px-6 py-4 font-semibold text-gray-900">{acc.username}</td>
                          <td className="px-6 py-4 font-medium text-gray-700">{acc.email}</td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => deleteAccount(index)}
                              className="px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white rounded-lg font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {accounts.length === 0 && (
                        <tr>
                          <td colSpan="3" className="text-center py-8 text-gray-500 font-semibold">
                            No accounts available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
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
              <h3 className="text-2xl font-black text-gray-900">Password & Authentication</h3>
            </div>

            <div className="space-y-4">
              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">Current Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="Current Password"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="New Password"
                />
              </div>

              <div className="group">
                <label className="block text-sm font-bold text-gray-900 mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                  placeholder="Confirm Password"
                />
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                <button
                  onClick={changePassword}
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
                >
                  Change Password
                </button>
                <label className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-gray-200 cursor-pointer hover:border-purple-500 transition-all group">
                  <input
                    type="checkbox"
                    checked={twoFactorAuth}
                    onChange={() => setTwoFactorAuth(!twoFactorAuth)}
                    className="w-6 h-6 accent-purple-600 cursor-pointer"
                  />
                  <span className="text-gray-900 font-bold group-hover:text-purple-600 transition-colors">
                    Enable Two-Factor Authentication
                  </span>
                </label>
              </div>
            </div>
          </section>

          {/* Privacy Settings Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Privacy Settings</h3>
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
                <span className="text-gray-900 font-bold group-hover:text-red-600 transition-colors">Delete All Accounts</span>
                <button
                  onClick={deleteAllAccounts}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all"
                >
                  Delete
                </button>
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

            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 hover:border-yellow-500 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                </div>
                <span className="text-gray-900 font-bold group-hover:text-yellow-600 transition-colors">Dark Mode</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-yellow-500/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-yellow-500 peer-checked:to-orange-500"></div>
              </label>
            </div>
          </section>

          {/* Notifications Section */}
          <section className="bg-white rounded-3xl shadow-xl p-6 md:p-8 border border-gray-100 hover:shadow-2xl transition-all duration-300 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-2xl font-black text-gray-900">Notifications</h3>
            </div>

            <div className="flex items-center justify-between p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-gray-200 hover:border-indigo-500 transition-all group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <span className="text-gray-900 font-bold group-hover:text-indigo-600 transition-colors">Enable Notifications</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications(!notifications)}
                  className="sr-only peer"
                />
                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/20 rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-indigo-500 peer-checked:to-purple-500"></div>
              </label>
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

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl relative animate-scale-in overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 relative">
              <button
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 flex items-center justify-center text-white font-bold transition-all transform hover:scale-110 hover:rotate-90"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
              <h3 className="text-3xl font-black text-white">Create New Account</h3>
            </div>

            <div className="p-8 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  value={newAccount.username}
                  onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={newAccount.email}
                  onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
                  className="w-full px-5 py-4 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 outline-none text-gray-900 font-medium"
                />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={createAccount}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
        
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}