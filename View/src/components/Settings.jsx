import React from 'react';
import { motion } from "framer-motion";

const Settings = ({ 
  user, 
  setPage, 
  settingsTab, 
  setSettingsTab, 
  newUsername, 
  setNewUsername, 
  handleUpdateUsername,
  newEmail,
  setNewEmail,
  emailPassword,
  setEmailPassword,
  handleEmailChange
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-colors"
    >
      {/* SIDEBAR */}
      <div className="w-72 border-r dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h2 className="font-black text-xl tracking-tight">Settings</h2>
        </div>

        <button
          onClick={() => setPage("dashboard")}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-500 mb-8 transition-colors group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Dashboard
        </button>

        <div className="space-y-1">
          {[
            { id: "profile", label: "General Profile", icon: "👤" },
            { id: "username", label: "Account Name", icon: "🏷️" },
            { id: "email", label: "Email Security", icon: "✉️" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                settingsTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 p-12 max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-8 shadow-sm">
          {settingsTab === "profile" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-black mb-6">User Profile</h1>
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border dark:border-gray-700">
                  <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 text-2xl font-bold">
                    {user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Logged in as</p>
                    <p className="text-lg font-bold">{user?.displayName || user?.name || "Snow User"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 border dark:border-gray-800 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase">Email Address</p>
                    <p className="font-medium mt-1">{user?.email}</p>
                  </div>
                  <div className="p-4 border dark:border-gray-800 rounded-2xl">
                    <p className="text-xs text-gray-400 font-bold uppercase">Account Status</p>
                    <p className="font-medium mt-1 text-green-500 flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Active
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {settingsTab === "username" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-black mb-2">Update Username</h1>
              <p className="text-sm text-gray-500 mb-8">This is how you will appear in reports.</p>
              <div className="space-y-4 max-w-md">
                <input
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                  placeholder="Enter name..."
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                />
                <button
                  onClick={handleUpdateUsername}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          )}

          {settingsTab === "email" && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <h1 className="text-2xl font-black mb-2">Change Email Address</h1>
              <div className="space-y-4 max-w-md">
                <input
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                  placeholder="New email address"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <input
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                  placeholder="Current password"
                  type="password"
                  value={emailPassword}
                  onChange={(e) => setEmailPassword(e.target.value)}
                />
                <button
                  onClick={handleEmailChange}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                  Send Verification
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Settings;