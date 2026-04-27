
import React from 'react';
import { motion } from "framer-motion"; // <--- This is the one you are missing!
const Settings = ({ 
  isFolded, 
  setIsFolded, 
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
  // ... rest of your code
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-all duration-300"
    >
      {/* 1. ADAPTIVE SETTINGS SIDEBAR */}
      <aside 
        className={`${isFolded ? "w-20" : "w-72"} border-r dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col shadow-sm fixed h-full transition-all duration-300 z-50`}
      >
        <div className="flex items-center justify-between mb-8">
          {!isFolded && (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                 <span className="text-lg">⚙️</span>
              </div>
              <h2 className="font-black text-xl tracking-tight">Settings</h2>
            </div>
          )}
          
          <button
            onClick={() => setIsFolded(!isFolded)}
            className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white transition-all ${isFolded ? "mx-auto" : ""}`}
          >
            {isFolded ? "→" : "←"}
          </button>
        </div>

        <button
          onClick={() => setPage("dashboard")}
          className={`flex items-center text-sm font-bold text-gray-500 hover:text-blue-500 mb-8 transition-colors group ${isFolded ? "justify-center" : "gap-2"}`}
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          {!isFolded && <span className="overflow-hidden whitespace-nowrap">Back</span>}
        </button>

        <div className="space-y-1">
          {[
            { id: "profile", label: "Profile", icon: "👤" },
            { id: "username", label: "Name", icon: "🏷️" },
            { id: "email", label: "Security", icon: "✉️" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSettingsTab(tab.id)}
              className={`w-full flex items-center rounded-xl text-sm font-bold transition-all p-3 ${
                isFolded ? "justify-center" : "gap-3 px-4"
              } ${
                settingsTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {!isFolded && <span className="overflow-hidden whitespace-nowrap">{tab.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA (Adaptive margin) */}
<div className={`flex-1 ${isFolded ? "ml-20" : "ml-72"} transition-all duration-300 p-8 md:p-12`}>
  <div className="max-w-4xl mx-auto">
    {/* --- ADD THIS HEADER BLOCK --- */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Account Settings</h1>
        <p className="text-xl font-black">Manage your profile</p>
      </div>

      <button
        onClick={() => {
          if (window.confirm("Are you sure you want to logout?")) {
            // Note: Ensure these functions are passed as props from App.jsx
            signOut(auth);
            setUser(null);
            setPage("landing");
          }
        }}
        className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-transparent hover:border-red-200 transition-all group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div>
    {/* --- END OF HEADER BLOCK --- */}
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-8 shadow-sm">
      
      {/* 👤 PROFILE VIEW */}
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

      {/* 🏷️ USERNAME UPDATE */}
      {settingsTab === "username" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black mb-2">Update Username</h1>
          <p className="text-sm text-gray-500 mb-8">This is how you will appear in reports.</p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">New Username</label>
              <input
                className="w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:border-blue-500 transition-all font-medium"
                placeholder="Enter name..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
              />
            </div>
            <button
              onClick={handleUpdateUsername}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all active:scale-95"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      )}

      {/* ✉️ EMAIL UPDATE */}
      {settingsTab === "email" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black mb-2">Change Email Address</h1>
          <p className="text-sm text-gray-500 mb-8">Verification required for new email.</p>
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
</div>
    </motion.div>
  );
};

export default Settings;