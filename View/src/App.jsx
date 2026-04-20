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
    if (files.length === 0) return alert("Select files");

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
    } catch (e) {
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
    <div className="flex min-h-screen bg-gray-50">

      {/* ================= SIDEBAR ================= */}
      <motion.div
        animate={{ width: sidebarOpen ? 260 : 70 }}
        className="bg-white border-r flex flex-col justify-between"
      >

        {/* TOP */}
        <div>

          <div className="flex items-center justify-between p-4 border-b">
            <div className="text-xl">❄️</div>

            <button onClick={() => setSidebarOpen(!sidebarOpen)}>
              <FaBars />
            </button>
          </div>

          {/* NAV */}
          <div className="p-2 space-y-2">

            {menu.map((item) => (
              <button
                key={item.id}
                onClick={() => setActive(item.id)}
                className={`flex items-center gap-3 w-full p-2 rounded-lg transition
                  ${active === item.id ? "bg-black text-white" : "hover:bg-gray-100"}
                `}
              >
                {item.icon}
                {sidebarOpen && item.label}
              </button>
            ))}

          </div>

        </div>

        {/* FOOTER */}
        <div className="p-4 border-t text-xs text-gray-500">
          API: <span className="text-green-600">Online</span>
        </div>

      </motion.div>

      {/* ================= MAIN AREA ================= */}
      <div className="flex-1 flex flex-col">

        {/* TOPBAR */}
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">

          <h1 className="font-semibold text-gray-800">
            {menu.find((m) => m.id === active)?.label}
          </h1>

          <div className="text-xs text-gray-500">
            Production Mode
          </div>

        </div>

        {/* WORKSPACE */}
        <div className="flex-1 p-8 grid grid-cols-3 gap-6">

          {/* MAIN PANEL */}
          <div className="col-span-2">

            {/* TOOL CARD */}
            <div className="bg-white border rounded-2xl p-6">

              <h2 className="font-semibold mb-2">
                Upload Files
              </h2>

              <p className="text-sm text-gray-500 mb-4">
                Compare subtitle quality using AI scoring engine
              </p>

              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
              />

              <button
                onClick={handleUpload}
                className="mt-4 bg-black text-white px-5 py-2 rounded-xl hover:bg-gray-800 transition"
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
                  className="mt-6 space-y-3"
                >

                  {/* BEST */}
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl">
                    🏆 Best File: {data.best_file}
                  </div>

                  {/* LIST */}
                  {data.results.map((r, i) => (
                    <div
                      key={i}
                      className="bg-white border rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="font-semibold">{r.filename}</div>
                      <div className="text-sm text-gray-500">
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
              <p className="text-sm text-gray-500">
                Free tier active
              </p>
            </div>

            <div className="bg-white border rounded-xl p-4">
              <h3 className="font-semibold">Coming Features</h3>
              <ul className="text-sm text-gray-500 mt-2">
                <li>AI insights</li>
                <li>Batch processing</li>
                <li>Export reports</li>
              </ul>
            </div>

          </div>

        </div>

        {/* FOOTER */}
        <div className="bg-white border-t p-3 flex justify-center gap-6 text-gray-500">
          <FaInstagram className="hover:text-pink-500 cursor-pointer" />
          <FaTwitter className="hover:text-blue-500 cursor-pointer" />
          <FaGithub className="hover:text-black cursor-pointer" />
        </div>

      </div>

    </div>
  );
}

export default App;