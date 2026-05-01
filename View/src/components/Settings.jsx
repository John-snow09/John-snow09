
import React, { useState, useEffect } from 'react';
import { FaChevronLeft, FaChevronRight, FaBars, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { signOut as firebaseSignOut } from "firebase/auth"; 
import { auth, db } from "../firebase"; 

const Settings = ({ 
  darkMode, setDarkMode, isFolded, setIsFolded, user, setPage, setUser, settingsTab, setSettingsTab, 
  newUsername, setNewUsername, handleUpdateUsername, newEmail, setNewEmail, 
  emailPassword, setEmailPassword, handleEmailChange
}) => {
  const [availability, setAvailability] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile toggle state

  // Username check effect remains the same
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
          if (data.uid === user?.uid) { setAvailability('available'); } 
          else { setAvailability('taken'); }
        } else { setAvailability('available'); }
      } catch (err) {
        console.error("Database check failed:", err);
        setAvailability(null);
      }
    };
    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [newUsername, user?.uid]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      className="min-h-screen flex bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white transition-all duration-300 overflow-x-hidden"
    >
      {/* 📱 MOBILE HAMBURGER BUTTON */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] p-3 rounded-xl bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700 shadow-md"
      >
        <FaBars />
      </button>

      {/* 1. ADAPTIVE SETTINGS SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 h-full border-r dark:border-gray-800 bg-white dark:bg-gray-900 p-6 flex flex-col transition-all duration-300
        ${isMobileMenuOpen ? "translate-x-0 w-72 shadow-2xl" : "-translate-x-full md:translate-x-0"} 
        ${isFolded ? "md:w-20" : "md:w-72"}
      `}>
        {/* Mobile Close Button */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-400 p-2">
           <FaTimes size={20} />
        </button>

        <div className="flex items-center justify-between mb-8 mt-2 md:mt-0">
          {(!isFolded || isMobileMenuOpen) && (
            <div className="flex items-center gap-3 overflow-hidden whitespace-nowrap">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <span className="text-lg">⚙️</span>
              </div>
              <h2 className="font-black text-xl tracking-tight">Settings</h2>
            </div>
          )}
          
          <button 
            onClick={() => setIsFolded(!isFolded)} 
            className={`hidden md:flex p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-blue-500 hover:text-white transition-all items-center justify-center ${isFolded ? "mx-auto" : ""}`}
          >
            {isFolded ? <FaChevronRight size={12}/> : <FaChevronLeft size={12}/>}
          </button>
        </div>

        {/* BACK TO HOME */}
        <button 
          onClick={() => setPage("landing")} 
          className={`flex items-center text-sm font-bold text-gray-500 hover:text-blue-500 mb-8 transition-colors group ${isFolded && !isMobileMenuOpen ? "justify-center" : "gap-2"}`}
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          {(!isFolded || isMobileMenuOpen) && <span className="overflow-hidden whitespace-nowrap">Back to home</span>}
        </button>

        {/* NAVIGATION TABS */}
        <div className="space-y-1">
          {[
            { id: "profile", label: "Profile", icon: "👤" }, 
            { id: "username", label: "Name", icon: "🏷️" }, 
            { id: "email", label: "Security", icon: "✉️" }
          ].map((tab) => (
            <button 
              key={tab.id} 
              onClick={() => { setSettingsTab(tab.id); setIsMobileMenuOpen(false); }} 
              className={`w-full flex items-center rounded-xl text-sm font-bold transition-all p-3 ${isFolded && !isMobileMenuOpen ? "justify-center" : "gap-3 px-4"} ${
                settingsTab === tab.id 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" 
                  : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {(!isFolded || isMobileMenuOpen) && <span className="overflow-hidden whitespace-nowrap">{tab.label}</span>}
            </button>
          ))}

          {/* 🌙 NEW: BOTTOM SECTION (Theme & Version) */}
        <div className="space-y-4 pt-4 border-t dark:border-gray-800 mt-auto">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center rounded-xl border dark:border-gray-700 p-2.5 text-xs font-bold transition-all hover:bg-gray-100 dark:hover:bg-gray-800 ${isFolded && !isMobileMenuOpen ? "" : "gap-2"}`}
          >
            <span className="text-sm">{darkMode ? "☀️" : "🌙"}</span> 
            {(!isFolded || isMobileMenuOpen) && (
              <span className="dark:text-gray-300">
                {darkMode ? "Light" : "Dark"}
              </span>
            )}
          </button>
          
          <div className={`text-gray-400 font-mono tracking-tighter ${isFolded && !isMobileMenuOpen ? "text-center text-[8px]" : "text-[10px] px-2"}`}>
            {isFolded && !isMobileMenuOpen ? "v1" : "v1.0.4 PROD"}
          </div>
        </div>
        </div>
      </aside>
    

      {/* 🌑 MOBILE OVERLAY BACKGROUND */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. MAIN CONTENT AREA */}
      <main className={`flex-1 transition-all duration-300 p-4 md:p-12 w-full min-w-0 ${isFolded ? "md:ml-20" : "md:ml-72"} ml-0`}>
        <div className="max-w-4xl mx-auto pt-14 md:pt-0">
          
          {/* HEADER SECTION */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
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
                  } catch (error) { console.error("Logout error:", error); }
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

          {/* SETTINGS BOX */}
          <div className="bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl p-6 md:p-8 shadow-sm">
            
            {settingsTab === "profile" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-black mb-6">User Profile</h1>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gray-50 dark:bg-gray-800/50 rounded-3xl border dark:border-gray-700">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl sm:text-3xl font-black shadow-lg">
                    {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Username</p>
                    <p className="text-lg sm:text-xl font-black">{user?.displayName || "Not set yet"}</p>
                    <div className="pt-2">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email Address</p>
                      <p className="text-sm font-bold text-gray-600 dark:text-gray-300">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {settingsTab === "username" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-black mb-2">Update Username</h1>
                <p className="text-sm text-gray-500 mb-8">Choose a unique handle for your account.</p>
                <div className="space-y-4 max-w-md">
                  <label className="text-xs font-bold text-gray-400 uppercase ml-1">New Username</label>
                  <input
                    className={`w-full p-3 bg-gray-50 dark:bg-gray-800 border rounded-xl outline-none transition-all ${
                      availability === 'available' ? 'border-green-500' : availability === 'taken' ? 'border-red-500' : 'dark:border-gray-700'
                    }`}
                    placeholder="Enter name..."
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                  />
                  <div className="text-xs font-bold">
                    {availability === 'loading' && <span className="text-gray-400 animate-pulse">Checking...</span>}
                    {availability === 'available' && <span className="text-green-500">✓ Available</span>}
                    {availability === 'taken' && <span className="text-red-500">✕ Taken</span>}
                  </div>
                  <button
                    onClick={() => handleUpdateUsername(newUsername)}
                    disabled={availability !== 'available'}
                    className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold transition-all ${
                      availability === 'available' ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 dark:bg-gray-800 text-gray-400'
                    }`}
                  >
                    Save Changes
                  </button>
                </div>
              </motion.div>
            )}

            {settingsTab === "email" && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-2xl font-black mb-2">Email Security</h1>
                <div className="space-y-4 max-w-md mt-6">
                  <input className="w-full p-3 bg-gray-50 dark:bg-gray-800 border dark:border-gray-700 rounded-xl outline-none" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
                  <button onClick={handleEmailChange} className="w-full sm:w-auto bg-blue-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg">Update Email</button>
                </div>
              </motion.div>
            )}

          </div>
        </div>
      </main>
    </motion.div>
  );
};

export default Settings;