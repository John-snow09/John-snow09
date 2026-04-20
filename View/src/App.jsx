import { useState } from "react";
import { motion } from "framer-motion";
import { FaRocket, FaFileAlt, FaChartBar, FaInstagram, FaTwitter, FaGithub } from "react-icons/fa";

function App() {
  const [page, setPage] = useState("landing");
  const [tool, setTool] = useState("srt");

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
    } catch (err) {
      console.error(err);
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ================= LANDING ================= */}
      {page === "landing" && (
        <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex flex-col items-center justify-center text-center px-6">

          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            ❄️ Snowlabs
          </motion.h1>

          <p className="max-w-xl text-lg mb-6 text-gray-200">
            Smart developer tools to analyze and improve your content.
          </p>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage("dashboard")}
            className="bg-white text-indigo-700 px-6 py-3 rounded-xl font-semibold shadow-lg"
          >
            🚀 Get Started
          </motion.button>

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
                Coming soon
              </p>
            </div>

            <div className="bg-white/10 p-6 rounded-xl backdrop-blur">
              <FaRocket className="text-2xl mb-3 mx-auto" />
              <h3 className="font-semibold">More Tools</h3>
              <p className="text-sm text-gray-200 mt-2">
                Expanding ecosystem
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ================= DASHBOARD ================= */}
      {page === "dashboard" && (
        <div className="flex flex-col min-h-screen bg-gray-100">

          <div className="flex flex-1">

            {/* ================= SIDEBAR ================= */}
            <div className="w-64 bg-white shadow-lg p-5 flex flex-col justify-between">

              <div>
                <h1 className="text-xl font-bold mb-8">❄️ Snowlabs</h1>

                <button
                  onClick={() => setPage("landing")}
                  className="mb-6 text-sm text-gray-500 hover:text-indigo-600"
                >
                  ← Back to Home
                </button>

                <nav className="space-y-3">
                  <button
                    onClick={() => setTool("srt")}
                    className={`block w-full text-left px-3 py-2 rounded-lg transition ${
                      tool === "srt"
                        ? "bg-indigo-50 text-indigo-600"
                        : "hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                  >
                    🎬 SRT Analyzer
                  </button>

                  <button
                    onClick={() => setTool("analytics")}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition"
                  >
                    📊 Analytics (Soon)
                  </button>
                </nav>
              </div>

            </div>

            {/* ================= MAIN ================= */}
            <div className="flex-1 p-8">

              {tool === "srt" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>

                  <h2 className="text-xl font-bold mb-4">🎬 SRT Analyzer</h2>

                  <div className="bg-white p-6 rounded-xl shadow">

                    <p className="text-sm text-gray-500 mb-2">
                      Upload multiple <b>.srt</b> files to compare quality.
                    </p>

                    <input
                      type="file"
                      multiple
                      accept=".srt,text/plain,application/x-subrip"
                      onChange={(e) => setFiles(Array.from(e.target.files))}
                      className="mb-3"
                    />

                    <button
                      onClick={handleUpload}
                      className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
                    >
                      {loading ? "Processing..." : "Compare"}
                    </button>

                    {/* RESULTS */}
                    {data && data.results && (
                      <div className="mt-6">

                        <div className="bg-green-100 border border-green-300 p-4 rounded-lg mb-4">
                          <h3 className="text-lg font-bold text-green-700">
                            🏆 Best Script: {data.best_file}
                          </h3>
                        </div>

                        {data.results.map((r, i) => (
                          <div
                            key={i}
                            className={`p-4 mb-3 rounded-lg shadow hover:shadow-md transition ${
                              r.filename === data.best_file
                                ? "bg-green-50 border border-green-300"
                                : "bg-white"
                            }`}
                          >
                            <h4 className="font-semibold mb-1">
                              {i + 1}. {r.filename}
                            </h4>

                            <p><b>Score:</b> {r.score}</p>
                            <p><b>Reason:</b> {r.reason}</p>
                            <p><b>Words:</b> {r.details.word_count}</p>
                            <p><b>Diversity:</b> {r.details.diversity}</p>
                            <p><b>Avg Sentence Length:</b> {r.details.avg_sentence_length}</p>
                          </div>
                        ))}

                      </div>
                    )}

                  </div>
                </motion.div>
              )}

              {tool === "analytics" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <h2 className="text-xl font-bold">📊 Coming Soon</h2>
                </motion.div>
              )}

            </div>
          </div>

          {/* ================= FOOTER ================= */}
          <div className="bg-white border-t py-4 flex justify-center space-x-6">

            <a href="#" className="text-gray-500 hover:text-pink-500 text-xl transition">
              <FaInstagram />
            </a>

            <a href="#" className="text-gray-500 hover:text-blue-500 text-xl transition">
              <FaTwitter />
            </a>

            <a href="#" className="text-gray-500 hover:text-gray-900 text-xl transition">
              <FaGithub />
            </a>

          </div>

        </div>
      )}
    </>
  );
}

export default App;