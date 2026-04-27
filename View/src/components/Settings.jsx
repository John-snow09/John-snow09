
import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
// 1. IMPORT DIRECTLY FROM FIREBASE & YOUR CONFIG
import { signOut as firebaseSignOut } from "firebase/auth"; 
import { auth, db } from "../firebase"; 

const Settings = ({ 
  isFolded, 
  setIsFolded, 
  user, 
  setPage, 
  setUser, // Keep these two to update the UI after logout
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
  // ❌ DO NOT include 'auth' or 'signOut' here anymore!
}) => {

  const [availability, setAvailability] = useState(null); // null, 'loading', 'available', or 'taken'

  // --- USERNAME AVAILABILITY CHECK ---
  useEffect(() => {
  const checkUsername = async () => {
    if (!newUsername || newUsername.length < 3) {
      setAvailability(null);
      return;
    }

    setAvailability('loading');
    try {
      const usernameRef = doc(db, "usernames", newUsername.toLowerCase().trim());
      const docSnap = await getDoc(usernameRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        
        // Use the 'user' prop we already have. 
        // We use user.uid (passed from App.jsx)
        if (data.uid === user?.uid) {
          setAvailability('available'); 
        } else {
          setAvailability('taken');
        }
      } else {
        setAvailability('available');
      }
    } catch (err) {
      console.error("Database check failed:", err);
      setAvailability(null);
    }
  };

  const timeoutId = setTimeout(checkUsername, 500);
  return () => clearTimeout(timeoutId);
}, [newUsername, user?.uid]); // Watch for changes in the username or the user ID


  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-all duration-300"
    >
      {/* 1. ADAPTIVE SETTINGS SIDEBAR */}
      <aside className={`${isFolded ? "w-20" : "w-72"} border-r dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col shadow-sm fixed h-full transition-all duration-300 z-50`}>
        <div className="flex items-center justify-between mb-8">
          {!isFolded && (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                 <span className="text-lg">⚙️</span>
              </div>
              <h2 className="font-black text-xl tracking-tight">Settings</h2>
            </div>
          )}
          <button onClick={() => setIsFolded(!isFolded)} className={`p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white transition-all ${isFolded ? "mx-auto" : ""}`}>
            {isFolded ? "→" : "←"}
          </button>
        </div>

        <button onClick={() => setPage("landing")} className={`flex items-center text-sm font-bold text-gray-500 hover:text-blue-500 mb-8 transition-colors group ${isFolded ? "justify-center" : "gap-2"}`}>
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          {!isFolded && <span className="overflow-hidden whitespace-nowrap">Back to home</span>}
        </button>

        <div className="space-y-1">
          {[{ id: "profile", label: "Profile", icon: "👤" }, { id: "username", label: "Name", icon: "🏷️" }, { id: "email", label: "Security", icon: "✉️" }].map((tab) => (
            <button key={tab.id} onClick={() => setSettingsTab(tab.id)} className={`w-full flex items-center rounded-xl text-sm font-bold transition-all p-3 ${isFolded ? "justify-center" : "gap-3 px-4"} ${settingsTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
              <span className="text-lg">{tab.icon}</span>
              {!isFolded && <span className="overflow-hidden whitespace-nowrap">{tab.label}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
<div className={`flex-1 ${isFolded ? "ml-20" : "ml-72"} transition-all duration-300 p-8 md:p-12`}>
  <div className="max-w-4xl mx-auto">
    
    {/* HEADER SECTION */}
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Account Settings</h1>
        <p className="text-xl font-black">Manage your profile</p>
      </div>

      <button
        onClick={async () => {
          if (window.confirm("Are you sure you want to logout?")) {
            try {
              await firebaseSignOut(auth); 
              setUser(null);      
              setPage("landing"); 
              console.log("Logged out successfully!");
            } catch (error) {
              console.error("Logout error:", error);
              alert("Logout failed. See console for details.");
            }
          }
        }}
        className="flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border border-transparent hover:border-red-200 transition-all group"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="group-hover:-translate-x-1 transition-transform">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Logout
      </button>
    </div> {/* <--- THIS WAS THE MISSING CLOSING TAG */}

    {/* WHITE/DARK SETTINGS BOX */}
    <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-8 shadow-sm">
      
      {/* 👤 PROFILE VIEW */}
{settingsTab === "profile" && (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
    <h1 className="text-2xl font-black mb-6">User Profile</h1>
    <div className="flex items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border dark:border-gray-700">
      
      {/* Avatar Circle */}
      <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-blue-500/20">
        {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
      </div>

      <div className="space-y-1">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Username</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {user?.displayName || "Not set yet"}
          </p>
        </div>
        
        <div className="pt-2">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Email Address</p>
          <p className="text-sm font-bold text-gray-600 dark:text-gray-300">
            {user?.email}
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
          <p className="text-sm text-gray-500 mb-8">Choose a unique handle for your account.</p>
          <div className="space-y-4 max-w-md">
            <div>
              <label className="text-xs font-bold text-gray-400 uppercase ml-1">New Username</label>
              <input
                className={`w-full mt-1 p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none transition-all font-medium ${
                  availability === 'available' ? 'border-green-500 shadow-sm shadow-green-500/10' : 
                  availability === 'taken' ? 'border-red-500 shadow-sm shadow-red-500/10' : 
                  'dark:border-gray-700 focus:border-blue-500'
                }`}
                placeholder="Enter name..."
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
              />
              <div className="mt-2 ml-1 text-xs font-bold">
                {availability === 'loading' && <span className="text-gray-400 animate-pulse">Checking...</span>}
                {availability === 'available' && <span className="text-green-500">✓ Username available</span>}
                {availability === 'taken' && <span className="text-red-500">✕ Already taken</span>}
              </div>
            </div>
            <button
              onClick={() => handleUpdateUsername(newUsername)}
              disabled={availability !== 'available'}
              className={`px-6 py-3 rounded-xl font-bold transition-all ${
                availability === 'available' 
                ? 'bg-blue-600 text-white shadow-lg cursor-pointer active:scale-95' 
                : 'bg-gray-200 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
              }`}
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      )}

      {/* ✉️ EMAIL SECURITY */}
      {settingsTab === "email" && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-black mb-2">Email Security</h1>
          <div className="space-y-4 max-w-md mt-6">
            <input 
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none focus:border-blue-500" 
              placeholder="New Email" 
              value={newEmail} 
              onChange={(e) => setNewEmail(e.target.value)} 
            />
            <button 
              onClick={handleEmailChange} 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transition-all"
            >
              Update Email
            </button>
          </div>
        </motion.div>
      )}

    </div> {/* Ends Settings Box */}
  </div> {/* Ends Max-width container */}
</div> {/* Ends Main Content Area */}
    </motion.div>
  );
};

export default Settings;