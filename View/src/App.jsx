import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBars,
  FaFileAlt,
  FaChartBar,
  FaHistory,
  FaRocket,
  FaGithub,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

function App() {
  const [page, setPage] = useState("landing"); // landing | dashboard
  const [active, setActive] = useState("srt");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [darkMode, setDarkMode] = useState(false);

  const API_BASE = "https://choose-your-sub.onrender.com";

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

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
  ];

  const pageAnim = {
    initial: { opacity: 0, y: 15 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -15 },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      <AnimatePresence mode="wait">

        {/* ================= LANDING ================= */}
        {page === "landing" && (
          <motion.div
            key="landing"
            {...pageAnim}
            className="min-h-screen flex flex-col"
          >

            {/* NAV */}
            <div className="flex justify-between p-6">
              <h1 className="font-bold text-xl">❄️ Snowlabs</h1>

              <div className="flex gap-3 items-center">

                <button onClick={() => setDarkMode(!darkMode)} className="text-sm">
                  {darkMode ? "☀️" : "🌙"}
                </button>

                <button
                  onClick={() => setPage("dashboard")}
                  className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl"
                >
                  <FaRocket className="inline mr-1" />
                  Get Started
                </button>

              </div>
            </div>

            {/* HERO */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">

              <h1 className="text-5xl font-bold mb-4">
                AI Subtitle Intelligence
              </h1>

              <p className="text-gray-500 max-w-xl mb-6">
                Compare subtitle files, rank quality, and find the best version instantly.
              </p>

            </div>

            {/* FEATURES */}
            <div className="grid md:grid-cols-3 gap-6 p-10">
              <div className="border rounded-xl p-6">Fast Analysis</div>
              <div className="border rounded-xl p-6">AI Scoring</div>
              <div className="border rounded-xl p-6">Smart Ranking</div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-center gap-6 p-6 text-2xl border-t">

              <a href="https://instagram.com/___john_snow_" target="_blank">
                <FaInstagram />
              </a>

              <a href="https://x.com/JohnSnow320411" target="_blank">
                <FaTwitter />
              </a>

              <a href="https://github.com/John-snow09" target="_blank">
                <FaGithub />
              </a>

            </div>

          </motion.div>
        )}

        {/* ================= DASHBOARD ================= */}
        {page === "dashboard" && (
          <motion.div
            key="dashboard"
            {...pageAnim}
            className="flex min-h-screen"
          >

            {/* SIDEBAR */}
            <div className="w-64 bg-gray-100 dark:bg-gray-900 border-r p-4 flex flex-col">

              <h1 className="font-bold mb-6">❄️ Snowlabs</h1>

              {/* BACK BUTTON */}
              <button
                onClick={() => setPage("landing")}
                className="text-xs text-gray-500 mb-4 hover:text-black dark:hover:text-white"
              >
                ← Back to Home
              </button>

              {/* MENU */}
              <div className="space-y-2 flex-1">

                {menu.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActive(item.id)}
                    className={`w-full text-left p-2 rounded flex items-center gap-2 ${
                      active === item.id
                        ? "bg-black text-white dark:bg-white dark:text-black"
                        : "hover:bg-gray-200 dark:hover:bg-gray-800"
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

              </div>

              <div className="text-xs text-gray-500">
                v1.0 SaaS Mode
              </div>

            </div>

            {/* MAIN */}
            <div className="flex-1 p-8">

              {/* HEADER */}
              <div className="flex justify-between items-center mb-6">

                <h1 className="text-xl font-bold">
                  {menu.find(m => m.id === active)?.label}
                </h1>

                <button
                  onClick={() => setPage("landing")}
                  className="text-sm text-gray-500 hover:text-black dark:hover:text-white"
                >
                  Exit
                </button>

              </div>

              {/* SRT TOOL */}
              {active === "srt" && (
                <div className="border rounded-xl p-6 bg-white dark:bg-gray-800">

                  <input
                    type="file"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                  />

                  <button
                    onClick={handleUpload}
                    className="bg-black text-white px-4 py-2 mt-3 rounded-xl"
                  >
                    {loading ? "Processing..." : "Run Analysis"}
                  </button>

                  {data?.results && (
                    <div className="mt-6 space-y-2">

                      <div className="p-3 bg-green-100 rounded">
                        🏆 Best: {data.best_file}
                      </div>

                      {data.results.map((r, i) => (
                        <div key={i} className="border p-3 rounded">
                          {r.filename} — {r.score}
                        </div>
                      ))}

                    </div>
                  )}

                </div>
              )}

              {active === "analytics" && (
                <div className="border p-6 rounded-xl">
                  Analytics Coming Soon 🚀
                </div>
              )}

              {active === "history" && (
                <div className="border p-6 rounded-xl">
                  No history yet
                </div>
              )}

            </div>

          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}

export default App;