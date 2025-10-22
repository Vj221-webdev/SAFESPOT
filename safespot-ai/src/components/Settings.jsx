import React, { useState, useEffect } from "react";

export default function Settings() {
  // ------------------ Account Info ------------------
  const [username, setUsername] = useState("JohnDoe");
  const [email, setEmail] = useState("johndoe@example.com");
  const [accounts, setAccounts] = useState([{ username, email }]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccount, setNewAccount] = useState({ username: "", email: "" });

  // ------------------ Privacy / Security ------------------
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);

  // ------------------ Display / Notifications ------------------
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);

  // ------------------ Account Management ------------------
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

  // ------------------ Password / Auth ------------------
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

  // ------------------ Privacy / Misc ------------------
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

  // ------------------ Dark Mode ------------------
  useEffect(() => {
    if (darkMode) document.body.classList.add("bg-gray-900", "text-gray-100");
    else document.body.classList.remove("bg-gray-900", "text-gray-100");
  }, [darkMode]);

  return (
    <div className="w-full p-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Settings</h2>
      <p className="text-gray-600 mb-8">
        Manage your account, privacy, display, and notification preferences.
      </p>

      <div className="max-w-5xl mx-auto space-y-8">

        {/* Account Management */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Management</h3>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Username"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Email"
          />
          <div className="flex gap-4 mt-2 flex-wrap">
            <button
              onClick={saveAccount}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-semibold"
            >
              Save Account
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Create New Account
            </button>
          </div>

          {/* Accounts List */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left border rounded-xl overflow-hidden">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 font-semibold">Username</th>
                  <th className="px-6 py-3 font-semibold">Email</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map((acc, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">{acc.username}</td>
                    <td className="px-6 py-3">{acc.email}</td>
                    <td className="px-6 py-3 flex gap-2 flex-wrap">
                      <button
                        onClick={() => deleteAccount(index)}
                        className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {accounts.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-gray-500">
                      No accounts available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Password & Authentication */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Password & Authentication</h3>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Current Password"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="New Password"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Confirm Password"
          />
          <div className="flex items-center gap-4 flex-wrap mt-2">
            <button
              onClick={changePassword}
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-semibold"
            >
              Change Password
            </button>
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={twoFactorAuth}
                onChange={() => setTwoFactorAuth(!twoFactorAuth)}
                className="w-5 h-5 accent-gray-700"
              />
              Enable Two-Factor Authentication
            </label>
          </div>
        </section>

        {/* Privacy Settings */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Privacy Settings</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Clear Cache</span>
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Clear
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Delete All Accounts</span>
            <button
              onClick={deleteAllAccounts}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </section>

        {/* Display Settings */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Display Settings</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
              className="w-5 h-5 accent-gray-700"
            />
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Notifications</h3>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Enable Notifications</span>
            <input
              type="checkbox"
              checked={notifications}
              onChange={() => setNotifications(!notifications)}
              className="w-5 h-5 accent-gray-700"
            />
          </div>
        </section>

        {/* Logout */}
        <section className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-200">
          <button
            onClick={logout}
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Logout
          </button>
        </section>
      </div>

      {/* ---------- Create Account Modal ---------- */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full md:w-1/2 p-6 rounded-xl shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 font-bold"
              onClick={() => setShowCreateModal(false)}
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Create New Account</h3>
            <input
              type="text"
              placeholder="Username"
              value={newAccount.username}
              onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 mb-4"
            />
            <input
              type="email"
              placeholder="Email"
              value={newAccount.email}
              onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 mb-4"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={createAccount}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
