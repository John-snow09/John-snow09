
import React, { useState, useEffect } from "react";
import SrtAnalyzer from "./SrtAnalyzer"; 
import Analytics from "./Analytics";
import History from "./History";
import { motion, AnimatePresence } from "framer-motion";
import { FaFileAlt, FaChartBar, FaHistory, FaSignOutAlt, FaCog, FaChevronLeft, FaChevronRight, FaBars, FaTimes } from "react-icons/fa";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Dashboard = ({ 
  user, setUser, setPage, darkMode, setDarkMode, historyData, setFiles, 
  handleUpload, loading, data, active, setActive, fetchHistory, 
  filteredHistory, searchQuery, setSearchQuery, selectedIds, 
  toggleSelect, toggleSelectAll, deleteSelected 
}) => {

  useEffect(() => {
    if (active === "history" && (!historyData || historyData.length === 0)) {
      fetchHistory();
    }
  }, [active]);

  const [isFolded, setIsFolded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // New state for Android

  const menuItems = [
    { id: 'srt', label: 'SRT Analyzer', icon: <FaFileAlt />, color: "blue" },
    { id: 'history', label: 'History', icon: <FaHistory />, color: "orange" },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar />, color: "green" },
  ];

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      signOut(auth);
      setUser(null);
      setPage("landing");
    }
  };

  const activeStyles = {
    blue: "bg-blue-600 text-white shadow-lg shadow-blue-500/20",
    green: "bg-green-600 text-white shadow-lg shadow-green-500/20",
    orange: "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
  };

  return (
    <div className="flex min-h-screen bg-white dark:bg-gray-950 transition-all duration-300 overflow-x-hidden">
      
      {/* 📱 MOBILE HAMBURGER BUTTON (Only shows on mobile) */}
      <button 
        onClick={() => setIsMobileMenuOpen(true)}
        className="md:hidden fixed top-4 left-4 z-[60] p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border dark:border-gray-700 shadow-md"
      >
        <FaBars />
      </button>

      {/* 1. UNIFIED SIDEBAR (Mobile Overlay + Desktop Persistent) */}
      <aside 
        className={`
          fixed inset-y-0 left-0 z-50 h-full bg-gray-50 dark:bg-gray-900 border-r dark:border-gray-800 p-4 flex flex-col transition-all duration-300
          ${isMobileMenuOpen ? "translate-x-0 w-64 shadow-2xl" : "-translate-x-full md:translate-x-0"} 
          ${isFolded ? "md:w-20" : "md:w-64"}
        `}
      >
        {/* Mobile Close Button */}
        <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden absolute top-4 right-4 text-gray-400">
           <FaTimes size={20} />
        </button>

        {/* Logo Section */}
        <div className="flex items-center justify-between mb-8 mt-2 md:mt-0">
          {(!isFolded || isMobileMenuOpen) && (
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-xl shrink-0">❄️</span>
              <span className="font-black text-lg tracking-tighter whitespace-nowrap dark:text-white">SNOWLABS</span>
            </div>
          )}
          <button
            onClick={() => setIsFolded(!isFolded)}
            className={`hidden md:block p-2 rounded-lg bg-gray-200 dark:bg-gray-800 hover:bg-blue-600 hover:text-white transition-all ${isFolded ? "mx-auto" : ""}`}
          >
            {isFolded ? <FaChevronRight size={12}/> : <FaChevronLeft size={12}/>}
          </button>
        </div>

        {/* BACK TO HOME */}
        <button 
          onClick={() => setPage("landing")} 
          className={`flex items-center text-xs font-black uppercase tracking-widest text-gray-400 hover:text-blue-500 mb-8 transition-colors group ${isFolded && !isMobileMenuOpen ? "justify-center" : "gap-3 px-2"}`}
        >
          <span className="group-hover:-translate-x-1 transition-transform">←</span>
          {(!isFolded || isMobileMenuOpen) && <span>Back to home</span>}
        </button>

        {/* NAVIGATION */}
        <nav className="space-y-2 flex-1">
          {menuItems.map((item) => {
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setActive(item.id); setIsMobileMenuOpen(false); }}
                className={`w-full p-3 rounded-xl flex items-center transition-all duration-200 ${isFolded && !isMobileMenuOpen ? "justify-center" : "gap-3"} ${
                  isActive ? activeStyles[item.color] : "hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-500 font-bold"
                }`}
              >
                <span className={`text-xl ${isActive ? "text-white" : "text-gray-400"}`}>{item.icon}</span>
                {(!isFolded || isMobileMenuOpen) && <span className="text-sm whitespace-nowrap">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM SECTION */}
        <div className="space-y-4 pt-4 border-t dark:border-gray-800">
           <button 
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex items-center justify-center rounded-xl border dark:border-gray-700 p-2 text-xs transition-all ${isFolded && !isMobileMenuOpen ? "" : "gap-2"}`}
          >
            {darkMode ? "☀️" : "🌙"} {(!isFolded || isMobileMenuOpen) && (darkMode ? "Light" : "Dark")}
          </button>
          <div className={`text-gray-500 font-mono ${isFolded && !isMobileMenuOpen ? "text-center text-[8px]" : "text-[10px] px-2"}`}>
            {isFolded && !isMobileMenuOpen ? "v1" : "v1.0.4 PROD"}
          </div>
        </div>
      </aside>

      {/* 🌑 MOBILE OVERLAY DARKNESS */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* 2. MAIN CONTENT AREA (Responsive Margins) */}
         <main className={`flex-1 transition-all duration-300 w-full min-w-0 ${isFolded ? "md:ml-20" : "md:ml-64"} ml-0`}>
         <div className="p-4 md:p-8 max-w-6xl mx-auto">
          
          {/* CONTENT HEADER */}
          <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 md:mb-10 pt-12 md:pt-0 gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white">
                {menuItems.find(m => m.id === active)?.label}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium italic">Manage your SRT workflow</p>
            </div>

            <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <button onClick={() => setPage("settings")} className="p-3 rounded-2xl border dark:border-gray-800 text-gray-500 hover:text-blue-600 transition-all flex items-center justify-center group" title="Settings">
                <FaCog className="group-hover:rotate-90 transition-transform duration-500" />
              </button>

              <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-900 p-1.5 pr-4 rounded-2xl border dark:border-gray-800">
                <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center text-white font-black text-xs shadow-lg">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden xs:block">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-tighter leading-none">User</p>
                  <p className="text-xs font-bold truncate max-w-[100px]">{user?.displayName || user?.email}</p>
                </div>
                <button onClick={handleLogout} className="ml-2 text-red-500 hover:text-red-600"><FaSignOutAlt /></button>
              </div>
            </div>
          </header>

          {/* PAGE CONTENT SWITCHER */}
          <div className="min-h-[400px] w-full overflow-x-hidden">
            {active === "srt" && <SrtAnalyzer setFiles={setFiles} handleUpload={handleUpload} loading={loading} data={data} />}
            {active === "analytics" && <Analytics historyData={historyData} />}
            {active === "history" && <History historyData={historyData} selectedIds={selectedIds} toggleSelect={toggleSelect} toggleSelectAll={toggleSelectAll} deleteSelected={deleteSelected} fetchHistory={fetchHistory} searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredHistory={filteredHistory} />}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;