import { useState } from "react";
import { motion } from "framer-motion";
import { FaFileAlt, FaChartBar, FaHome } from "react-icons/fa";

function App() {
  const [active, setActive] = useState("srt");
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
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg p-5">
        <h1 className="text-xl font-bold mb-6">❄️ Snowlabs</h1>

        <nav className="space-y-4">
          <button onClick={() => setActive("home")} className="flex items-center gap-2 w-full text-left hover:text-indigo-600">
            <FaHome /> Home
          </button>

          <button onClick={() => setActive("srt")} className="flex items-center gap-2 w-full text-left hover:text-indigo-600">
            <FaFileAlt /> SRT Analyzer
          </button>

          <button onClick={() => setActive("analytics")} className="flex items-center gap-2 w-full text-left hover:text-indigo-600">
            <FaChartBar /> Analytics (Coming)
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">

        {/* HOME */}
        {active === "home" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-2xl font-bold mb-4">Welcome to Snowlabs ❄️</h2>
            <p className="text-gray-600">
              A collection of smart tools for developers and creators.
            </p>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <div
                onClick={() => setActive("srt")}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer"
              >
                🎬 SRT Analyzer
                <p className="text-sm text-gray-500 mt-2">
                  Compare subtitle files easily
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow opacity-50">
                📊 Analytics Tool (Soon)
              </div>
            </div>
          </motion.div>
        )}

        {/* SRT TOOL */}
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

        {/* ANALYTICS */}
        {active === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h2 className="text-xl font-bold">📊 Coming Soon</h2>
          </motion.div>
        )}

      </div>
    </div>
  );
}

export default App;