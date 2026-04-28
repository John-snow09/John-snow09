import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRocket, FaFileAlt, FaChartBar, FaHistory, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Landing = ({ user, setUser, setPage, setShowLogin, darkMode, setDarkMode }) => {
  const [activeMenu, setActiveMenu] = useState(null);

  const menuData = {
    products: [
      { title: "SRT Editor", desc: "Studio-grade subtitle editing.", icon: "🎬", color: "text-blue-500" },
      { title: "AI Translator", desc: "Translate 50+ languages instantly.", icon: "🌐", color: "text-violet-500" },
      { title: "Auto-Caption", desc: "Voice-to-text with 99% accuracy.", icon: "🎙️", color: "text-green-500" },
    ],
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col bg-white dark:bg-gray-950 text-gray-900 dark:text-white"
    >
      {/* 1. MEGA MENU NAV */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <h1 className="font-black text-xl tracking-tighter">
              SNOW<span className="text-blue-600">LABS</span><span className="text-violet-500 text-2xl">.</span>
            </h1>

            {/* Products Dropdown */}
            <div 
              className="hidden md:block relative group" 
              onMouseEnter={() => setActiveMenu('products')} 
              onMouseLeave={() => setActiveMenu(null)}
            >
              <button className="text-sm font-bold text-gray-500 hover:text-blue-600 py-8 transition-colors">
                Products
              </button>
              <AnimatePresence>
                {activeMenu === 'products' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                    className="absolute top-[80%] left-0 w-[400px] bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-3xl shadow-2xl p-4 grid grid-cols-1 gap-2"
                  >
                    {menuData.products.map((item) => (
                      <div key={item.title} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all cursor-pointer">
                        <span className="text-2xl">{item.icon}</span>
                        <div>
                          <h4 className={`font-black text-sm ${item.color}`}>{item.title}</h4>
                          <p className="text-[11px] text-gray-400">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button className="hidden md:block text-sm font-bold text-gray-500 hover:text-violet-500 transition-colors">Tools</button>
            <button className="hidden md:block text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors">Pricing</button>
          </div>

          <div className="flex gap-3 items-center">
            {!user ? (
              <button onClick={() => setShowLogin(true)} className="px-5 py-2 text-sm font-black rounded-full border border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                Login
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button onClick={() => setPage("settings")} className="p-2.5 rounded-xl border dark:border-gray-800 text-gray-500 hover:text-blue-600 transition-all">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="hover:rotate-90 transition-transform duration-500">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
                <div className="w-9 h-9 rounded-xl bg-violet-500 flex items-center justify-center text-white font-black text-xs shadow-lg shadow-violet-500/20 overflow-hidden">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="profile" className="w-full h-full object-cover" />
                  ) : (
                    user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()
                  )}
                </div>
                <button onClick={() => { if(window.confirm("Logout?")) { signOut(auth); setUser(null); } }} className="text-[10px] font-black text-red-500 uppercase hover:text-red-600 transition-colors">
                  Out
                </button>
              </div>
            )}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full border dark:border-gray-800">
              {darkMode ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-32">
        <div className="px-4 py-1 mb-6 text-[10px] font-black uppercase tracking-[0.2em] rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-500">
          AI-powered subtitle intelligence
        </div>

        <h1 className="text-5xl md:text-7xl font-black mb-6 max-w-4xl leading-[1.1] tracking-tighter">
          Analyze & Compare <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-500 to-blue-400">
            Subtitle Files in Seconds
          </span>
        </h1>

        <p className="text-gray-500 max-w-xl mb-10 text-lg font-medium">
          Upload multiple SRT files and automatically detect the best quality using intelligent scoring.
        </p>

        <button
          onClick={() => !user ? setShowLogin(true) : setPage("dashboard")}
          className="bg-blue-600 text-white px-10 py-4 rounded-2xl flex items-center gap-2 hover:bg-violet-600 hover:scale-105 transition-all shadow-xl shadow-blue-500/20 font-bold"
        >
          <FaRocket />
          Get Started
        </button>
      </div>

      {/* 3. FEATURES */}
      <div className="grid md:grid-cols-3 gap-6 px-10 pb-20 max-w-7xl mx-auto w-full">
        <div className="border dark:border-gray-800 rounded-3xl p-8 text-center hover:border-blue-500/50 transition-colors bg-gray-50/50 dark:bg-gray-900/50">
          <FaFileAlt className="mx-auto text-3xl mb-4 text-blue-500" />
          <p className="font-black uppercase tracking-widest text-xs">Fast Analysis</p>
        </div>
        <div className="border dark:border-gray-800 rounded-3xl p-8 text-center hover:border-violet-500/50 transition-colors bg-gray-50/50 dark:bg-gray-900/50">
          <FaChartBar className="mx-auto text-3xl mb-4 text-violet-500" />
          <p className="font-black uppercase tracking-widest text-xs">AI Scoring Engine</p>
        </div>
        <div className="border dark:border-gray-800 rounded-3xl p-8 text-center hover:border-blue-500/50 transition-colors bg-gray-50/50 dark:bg-gray-900/50">
          <FaHistory className="mx-auto text-3xl mb-4 text-blue-500" />
          <p className="font-black uppercase tracking-widest text-xs">Smart Comparison</p>
        </div>
      </div>

      {/* 4. FOOTER */}
      <div className="flex justify-center gap-10 p-10 border-t dark:border-gray-900 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all">
        <a href="https://instagram.com/___john_snow_" target="_blank" rel="noreferrer"><FaInstagram className="text-2xl hover:text-pink-500 transition" /></a>
        <a href="https://x.com/JohnSnow320411" target="_blank" rel="noreferrer"><FaTwitter className="text-2xl hover:text-blue-500 transition" /></a>
        <a href="https://github.com/John-snow09" target="_blank" rel="noreferrer"><FaGithub className="text-2xl hover:text-white transition" /></a>
      </div>
    </motion.div>
  );
};

export default Landing;