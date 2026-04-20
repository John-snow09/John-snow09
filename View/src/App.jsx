import { useState } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="flex min-h-screen bg-gray-50 text-gray-900">

      {/* ================= SIDEBAR ================= */}
      <motion.div
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ type: "spring", stiffness: 260, damping: 25 }}
        className="bg-white border-r flex flex-col justify-between"
      >

        <div>

          {/* TOP */}
          <div className="flex items-center justify-between p-4 border-b">
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
                      ? "bg-black text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                {item.icon}
                {sidebarOpen && (
                  <span className="text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </button>
            ))}

          </div>

        </div>

        {/* SIDEBAR FOOTER */}
        <div className="p-4 text-xs text-gray-500 border-t">
          API: <span className="text-green-600 font-medium">Online</span>
        </div>

      </motion.div>

      {/* ================= MAIN ================= */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">

          <div>
            <h1 className="font-semibold text-gray-800">
              {menu.find((m) => m.id === active)?.label}
            </h1>
            <p className="text-xs text-gray-500">
              Upload and analyze subtitle files
            </p>
          </div>

          <div className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-600">
            Production Mode
          </div>

        </div>

        {/* WORKSPACE */}
        <div className="flex-1 px-4 sm:px-6 lg:px-10 py-8 flex justify-center">

          <div className="w-full max-w-6xl">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* MAIN PANEL */}
              <div className="lg:col-span-2 space-y-6">

                <div className="bg-white border rounded-2xl p-6 shadow-sm">

                  <h2 className="font-semibold text-lg mb-1">
                    Upload Files
                  </h2>

                  <p className="text-sm text-gray-500 mb-5">
                    Compare subtitle quality using AI scoring engine
                  </p>

                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-black transition">

                    <input
                      type="file"
                      multiple
                      onChange={(e) => setFiles(Array.from(e.target.files))}
                      className="hidden"
                      id="fileInput"
                    />

                    <label
                      htmlFor="fileInput"
                      className="cursor-pointer text-sm text-gray-600"
                    >
                      Drop files here or click to upload
                    </label>

                  </div>

                  <button
                    onClick={handleUpload}
                    className="mt-5 w-full bg-black text-white py-2.5 rounded-xl hover:bg-gray-800 transition active:scale-95"
                  >
                    {loading ? "Processing..." : "Run Analysis"}
                  </button>

                </div>

                {/* RESULTS */}
                <AnimatePresence>
                  {data?.results && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-3"
                    >

                      <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                        🏆 Best File:{" "}
                        <span className="font-semibold">
                          {data.best_file}
                        </span>
                      </div>

                      {data.results.map((r, i) => (
                        <div
                          key={i}
                          className="bg-white border rounded-xl p-4 hover:shadow-md transition"
                        >
                          <div className="font-semibold">{r.filename}</div>
                          <div className="text-sm text-gray-500 mt-1">
                            Score: {r.score}
                          </div>
                        </div>
                      ))}

                    </motion.div>
                  )}
                </AnimatePresence>

              </div>

              {/* RIGHT PANEL */}
              <div className="space-y-4">

                <div className="bg-white border rounded-xl p-4">
                  <h3 className="font-semibold">System Status</h3>
                  <p className="text-green-600 text-sm">All systems operational</p>
                </div>

                <div className="bg-white border rounded-xl p-4">
                  <h3 className="font-semibold">Usage</h3>
                  <p className="text-sm text-gray-500">Free tier active</p>
                </div>

                <div className="bg-white border rounded-xl p-4">
                  <h3 className="font-semibold">Coming Features</h3>
                  <ul className="text-sm text-gray-500 mt-2 space-y-1">
                    <li>AI insights</li>
                    <li>Batch processing</li>
                    <li>Export reports</li>
                  </ul>
                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= FOOTER (YOUR LINKS ADDED) ================= */}
        <div className="bg-white border-t p-4 flex justify-center gap-6 text-gray-500 text-3xl">

          {/* Instagram */}
          <a
            href="https://www.instagram.com/___john_snow_"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-500 hover:scale-110 transition"
          >
            <FaInstagram />
          </a>

          {/* Twitter (X) */}
          <a
            href="https://x.com/JohnSnow320411"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-500 hover:scale-110 transition"
          >
            <FaTwitter />
          </a>

          {/* GitHub */}
          <a
            href="https://github.com/John-snow09"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-black hover:scale-110 transition"
          >
            <FaGithub />
          </a>

        </div>

      </div>

    </div>
  );
}

export default App;