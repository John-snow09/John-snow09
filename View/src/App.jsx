import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaFileAlt,
  FaChartBar,
  FaHistory,
  FaCog,
  FaGithub,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

function App() {
  const [active, setActive] = useState("srt");

  // ✅ SIDEBAR CLOSED BY DEFAULT
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🌙 DARK MODE
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // 📱 AUTO CLOSE SIDEBAR ON MOBILE
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const API_BASE = "https://choose-your-sub.onrender.com";

  const handleUpload = async () => {
    if (!files.length) return alert("Select files");

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));

    try {
      setLoading(true);

      const res = await fetch(`${API_BASE}/compare`, {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      setData(result);
    } catch {
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  const menu = [
    { id: "srt", label: "SRT Analyzer", icon: <FaFileAlt /> },
    { id: "analytics", label: "Analytics", icon: <FaChartBar /> },
    { id: "history", label: "History", icon: <FaHistory /> },
    { id: "settings", label: "Settings", icon: <FaCog /> },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white">

      {/* ================= SIDEBAR ================= */}
      <motion.div
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="bg-white dark:bg-gray-800 border-r dark:border-gray-700 flex flex-col justify-between"
      >

        <div>

          {/* TOP */}
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
            <div className="text-xl">❄️</div>

            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars />
            </button>
          </div>

          {/* NAV */}
          <div className="p-2 space-y-1">

            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl transition
                  ${
                    active === item.id
                      ? "bg-black text-white dark:bg-white dark:text-black"
                      : "hover:bg-gray-100 dark:hover:bg-gray-700"
                  }
                `}
              >
                {item.icon}
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}

          </div>

        </div>

        <div className="p-4 text-xs text-gray-500 dark:text-gray-300 border-t dark:border-gray-700">
          API: <span className="text-green-500">Online</span>
        </div>

      </motion.div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="font-semibold">
              {menu.find((m) => m.id === active)?.label}
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-300">
              Clean SaaS Dashboard
            </p>
          </div>

          {/* 🌙 TOGGLE */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="px-3 py-1 rounded-lg border dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            {darkMode ? "☀️ Light" : "🌙 Dark"}
          </button>

        </div>

        {/* WORKSPACE */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-8 flex justify-center">

          <div className="w-full max-w-6xl">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* MAIN */}
              <div className="lg:col-span-2 space-y-6">

                <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-2xl p-6">

                  <h2 className="font-semibold text-lg mb-1">
                    Upload Files
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-300 mb-5">
                    Compare subtitle quality using AI scoring engine
                  </p>

                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="mb-4"
                  />

                  <button
                    onClick={handleUpload}
                    className="w-full bg-black text-white dark:bg-white dark:text-black py-2.5 rounded-xl"
                  >
                    {loading ? "Processing..." : "Run Analysis"}
                  </button>

                </div>

                {/* RESULTS */}
                <AnimatePresence>

                  {data?.results && (
                    <motion.div className="space-y-3">

                      <div className="bg-green-50 dark:bg-green-900 border p-4 rounded-xl">
                        🏆 Best File:{" "}
                        <span className="font-semibold">
                          {data.best_file}
                        </span>
                      </div>

                      {data.results.map((r, i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-gray-800 border dark:border-gray-700 p-4 rounded-xl"
                        >
                          <div className="font-semibold">{r.filename}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-300">
                            Score: {r.score}
                          </div>
                        </div>
                      ))}

                    </motion.div>
                  )}

                </AnimatePresence>

              </div>

              {/* RIGHT */}
              <div className="space-y-4">

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-4">
                  System Status: <span className="text-green-500">OK</span>
                </div>

                <div className="bg-white dark:bg-gray-800 border rounded-xl p-4">
                  Usage: Free Tier
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-white dark:bg-gray-800 border-t p-4 flex justify-center gap-6 text-3xl">

          <a href="https://www.instagram.com/___john_snow_" target="_blank">
            <FaInstagram className="hover:text-pink-500 transition" />
          </a>

          <a href="https://x.com/JohnSnow320411" target="_blank">
            <FaTwitter className="hover:text-blue-500 transition" />
          </a>

          <a href="https://github.com/John-snow09" target="_blank">
            <FaGithub className="hover:text-black transition" />
          </a>

        </div>

      </div>

    </div>
  );
}

export default App;