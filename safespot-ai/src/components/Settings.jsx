// Importing React library and required hooks: useState for state management and useEffect for side effects
import React, { useState, useEffect } from "react";

// Exporting the Settings component as default
export default function Settings() {
  // ------------------ Account Info ------------------
  const [username, setUsername] = useState("JohnDoe"); // State variable for storing username with initial value "JohnDoe"
  const [email, setEmail] = useState("johndoe@example.com"); // State variable for storing email with initial value
  const [accounts, setAccounts] = useState([{ username, email }]); // State variable for storing list of accounts as array of objects
  const [showCreateModal, setShowCreateModal] = useState(false); // State to control visibility of "Create Account" modal
  const [newAccount, setNewAccount] = useState({ username: "", email: "" }); // State for new account input fields

  // ------------------ Privacy / Security ------------------
  const [password, setPassword] = useState(""); // State for current password input
  const [newPassword, setNewPassword] = useState(""); // State for new password input
  const [confirmPassword, setConfirmPassword] = useState(""); // State for confirm password input
  const [twoFactorAuth, setTwoFactorAuth] = useState(false); // State for enabling/disabling two-factor authentication

  // ------------------ Display / Notifications ------------------
  const [darkMode, setDarkMode] = useState(false); // State to toggle dark mode
  const [notifications, setNotifications] = useState(true); // State to enable or disable notifications

  // Function to save updated account information
  const saveAccount = () => {
    setAccounts([{ username, email }]); // Update accounts state with current username and email
    alert("Account settings updated!"); // Display success alert
  };

  // Function to create a new account
  const createAccount = () => {
    if (!newAccount.username || !newAccount.email) { // Check if required fields are empty
      alert("Please fill all fields"); // Alert user if fields are missing
      return; // Exit function if validation fails
    }
    setAccounts([...accounts, newAccount]); // Add new account to accounts array
    setNewAccount({ username: "", email: "" }); // Reset newAccount input fields
    setShowCreateModal(false); // Close modal after creation
    alert("New account created!"); // Show success alert
  };

  // Function to delete a specific account by index
  const deleteAccount = (index) => {
    if (window.confirm("Delete this account?")) { // Ask user for confirmation
      const updatedAccounts = accounts.filter((_, i) => i !== index); // Filter out the account at the specified index
      setAccounts(updatedAccounts); // Update accounts state
    }
  };

  // ------------------ Password / Auth ------------------
  const changePassword = () => {
    if (!newPassword) { // Check if new password is empty
      alert("Please enter new password"); // Alert user if missing
      return; // Exit function
    }
    if (newPassword !== confirmPassword) { // Check if new password matches confirm password
      alert("Passwords do not match"); // Alert if mismatch
      return; // Exit function
    }
    setPassword(newPassword); // Set password to new password
    setNewPassword(""); // Clear new password field
    setConfirmPassword(""); // Clear confirm password field
    alert("Password changed!"); // Notify user of success
  };

  // ------------------ Privacy / Misc ------------------
  const clearCache = () => alert("Cache cleared!"); // Simple alert simulating cache clear

  // Function to delete all accounts
  const deleteAllAccounts = () => {
    if (window.confirm("Delete all accounts? This cannot be undone.")) { // Confirm action with user
      setAccounts([]); // Clear accounts array
      setUsername(""); // Clear username state
      setEmail(""); // Clear email state
      alert("All accounts deleted!"); // Notify user
    }
  };

  // Function to log out
  const logout = () => {
    if (window.confirm("Are you sure you want to logout?")) { // Confirm logout action
      alert("Logged out successfully!"); // Notify user
    }
  };

  // ------------------ Dark Mode ------------------
  useEffect(() => {
    if (darkMode) document.body.classList.add("bg-gray-900", "text-gray-100"); // Add dark mode classes when enabled
    else document.body.classList.remove("bg-gray-900", "text-gray-100"); // Remove dark mode classes when disabled
  }, [darkMode]); // Run effect when darkMode state changes

  return (
    // Main container for settings page
    <div className="w-full p-6 bg-gray-100 min-h-screen">
      {/* Page Title */}
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Settings</h2>
      {/* Page Subtitle */}
      <p className="text-gray-600 mb-8">
        Manage your account, privacy, display, and notification preferences.
      </p>

      {/* Wrapper for all settings sections */}
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Account Management Section */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Account Management</h3>
          {/* Username input */}
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)} // Update username state on input change
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Username"
          />
          {/* Email input */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)} // Update email state on input change
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Email"
          />
          {/* Action buttons for saving or creating account */}
          <div className="flex gap-4 mt-2 flex-wrap">
            <button
              onClick={saveAccount} // Trigger save account function
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-semibold"
            >
              Save Account
            </button>
            <button
              onClick={() => setShowCreateModal(true)} // Open create account modal
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-semibold"
            >
              Create New Account
            </button>
          </div>

          {/* Accounts List Table */}
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
                {/* Loop through accounts array and display each account */}
                {accounts.map((acc, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-3">{acc.username}</td>
                    <td className="px-6 py-3">{acc.email}</td>
                    <td className="px-6 py-3 flex gap-2 flex-wrap">
                      <button
                        onClick={() => deleteAccount(index)} // Delete account by index
                        className="px-4 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {/* If no accounts exist, show message */}
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

        {/* Password & Authentication Section */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Password & Authentication</h3>
          {/* Current Password Input */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)} // Update password state
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Current Password"
          />
          {/* New Password Input */}
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)} // Update new password state
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="New Password"
          />
          {/* Confirm Password Input */}
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)} // Update confirm password state
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400"
            placeholder="Confirm Password"
          />
          {/* Buttons and 2FA Checkbox */}
          <div className="flex items-center gap-4 flex-wrap mt-2">
            <button
              onClick={changePassword} // Trigger change password function
              className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition font-semibold"
            >
              Change Password
            </button>
            <label className="flex items-center gap-2 text-gray-700">
              <input
                type="checkbox"
                checked={twoFactorAuth} // Bind checkbox to twoFactorAuth state
                onChange={() => setTwoFactorAuth(!twoFactorAuth)} // Toggle 2FA on change
                className="w-5 h-5 accent-gray-700"
              />
              Enable Two-Factor Authentication
            </label>
          </div>
        </section>

        {/* Privacy Settings Section */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Privacy Settings</h3>
          {/* Clear Cache Option */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Clear Cache</span>
            <button
              onClick={clearCache} // Trigger clear cache function
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Clear
            </button>
          </div>
          {/* Delete All Accounts Option */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Delete All Accounts</span>
            <button
              onClick={deleteAllAccounts} // Trigger delete all accounts function
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Delete
            </button>
          </div>
        </section>

        {/* Display Settings Section */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Display Settings</h3>
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Dark Mode</span>
            <input
              type="checkbox"
              checked={darkMode} // Bind to darkMode state
              onChange={() => setDarkMode(!darkMode)} // Toggle dark mode state
              className="w-5 h-5 accent-gray-700"
            />
          </div>
        </section>

        {/* Notifications Section */}
        <section className="bg-white rounded-xl shadow-md p-6 space-y-4 border border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Notifications</h3>
          {/* Enable Notifications Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Enable Notifications</span>
            <input
              type="checkbox"
              checked={notifications} // Bind to notifications state
              onChange={() => setNotifications(!notifications)} // Toggle notifications
              className="w-5 h-5 accent-gray-700"
            />
          </div>
        </section>

        {/* Logout Section */}
        <section className="bg-white rounded-xl shadow-md p-6 text-center border border-gray-200">
          <button
            onClick={logout} // Trigger logout function
            className="px-8 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-semibold"
          >
            Logout
          </button>
        </section>
      </div>

      {/* ---------- Create Account Modal ---------- */}
      {showCreateModal && ( // Conditional rendering of modal based on showCreateModal state
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full md:w-1/2 p-6 rounded-xl shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-700 hover:text-gray-900 font-bold"
              onClick={() => setShowCreateModal(false)} // Close modal on click
            >
              ✕
            </button>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">Create New Account</h3>
            {/* New Account Username Input */}
            <input
              type="text"
              placeholder="Username"
              value={newAccount.username}
              onChange={(e) => setNewAccount({ ...newAccount, username: e.target.value })} // Update newAccount.username
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 mb-4"
            />
            {/* New Account Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={newAccount.email}
              onChange={(e) => setNewAccount({ ...newAccount, email: e.target.value })} // Update newAccount.email
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 mb-4"
            />
            {/* Modal Action Buttons */}
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowCreateModal(false)} // Close modal
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={createAccount} // Trigger account creation
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
