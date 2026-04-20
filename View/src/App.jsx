import { useState } from "react";
import { motion } from "framer-motion";
import { FaRocket, FaFileAlt, FaChartBar } from "react-icons/fa";

function App() {
  const [active, setActive] = useState("landing");
  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://choose-your-sub.onrender.com";

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Select .srt files");
      return;
    }

    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));

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

  return (
    <>
      {/* 🌐 LANDING PAGE */}
      {active === "landing" && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col items-center justify-center text-center px-6">

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            ❄️ Snowlabs
          </motion.h1>

          <p className="max-w-xl text-lg mb-6 text-gray-200">
            Smart developer tools to analyze, optimize and improve your content.
          </p>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActive("dashboard")}
            className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            🚀 Get Started
          </motion.button>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
              <FaFileAlt className="text-2xl mb-3 mx-auto" />
              <h3 className="font-semibold">SRT Analyzer</h3>
              <p className="text-sm text-gray-200 mt-2">
                Compare subtitle quality instantly
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
              <FaChartBar className="text-2xl mb-3 mx-auto" />
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-gray-200 mt-2">
                Visual insights (coming soon)
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
              <FaRocket className="text-2xl mb-3 mx-auto" />
              <h3 className="font-semibold">More Tools</h3>
              <p className="text-sm text-gray-200 mt-2">
                Expanding tool ecosystem
              </p>
            </div>

          </div>
        </div>
      )}

      {/* 📊 DASHBOARD */}
      {active === "dashboard" && (
        <div className="flex min-h-screen bg-gray-100">

          {/* Sidebar */}
          <div className="w-64 bg-white shadow-lg p-5">
            <h1 className="text-xl font-bold mb-6">❄️ Snowlabs</h1>

            <button
              onClick={() => setActive("landing")}
              className="mb-4 text-sm text-gray-500 hover:text-indigo-600"
            >
              ← Back to Home
            </button>

            <nav className="space-y-4">
              <button onClick={() => setActive("srt")} className="block hover:text-indigo-600">
                🎬 SRT Analyzer
              </button>

              <button className="block opacity-50">
                📊 Analytics (Soon)
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-8">
            {active === "srt" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 className="text-xl font-bold mb-4">🎬 SRT Analyzer</h2>

                <div className="bg-white p-6 rounded-xl shadow">
                  <input
                    type="file"
                    multiple
                    accept=".srt"
                    onChange={(e) => setFiles(Array.from(e.target.files))}
                    className="mb-3"
                  />

                  <button
                    onClick={handleUpload}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                  >
                    {loading ? "Processing..." : "Compare"}
                  </button>

                  {data && (
                    <div className="mt-5">
                      <h3 className="font-semibold mb-2">
                        Best: {data.best_file}
                      </h3>

                      {data.results.map((r, i) => (
                        <div
                          key={i}
                          className={`p-3 mb-2 rounded ${
                            r.filename === data.best_file
                              ? "bg-green-100"
                              : "bg-gray-50"
                          }`}
                        >
                          <b>{r.filename}</b> - Score: {r.score}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default App;