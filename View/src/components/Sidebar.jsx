import React from 'react';
import { FaRocket, FaFileAlt, FaChartBar, FaHistory } from "react-icons/fa";

const Sidebar = ({ active, setActive, darkMode, setDarkMode, handleLogout, user }) => {
  const menuItems = [
    { id: 'srt', label: 'SRT Analyzer', icon: <FaFileAlt /> },
    { id: 'analytics', label: 'Analytics', icon: <FaChartBar /> },
    { id: 'history', label: 'History', icon: <FaHistory /> },
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-900 h-screen border-r dark:border-gray-800 flex flex-col transition-colors">
      <div className="p-6 flex items-center gap-3 border-b dark:border-gray-800">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <FaRocket size={20} />
        </div>
        <span className="font-black text-xl tracking-tighter">SNOWLABS</span>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
              active === item.id 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t dark:border-gray-800 space-y-4">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className="w-full py-2 px-4 rounded-xl border dark:border-gray-700 text-sm font-bold flex items-center justify-center gap-2"
        >
          {darkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
        </button>
        
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 font-bold text-xs">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-bold truncate">{user?.email}</p>
          </div>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full py-2 px-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl text-sm font-bold transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;