import { useState } from "react";
import { motion } from "framer-motion";
import { FaUpload } from "react-icons/fa";

function App() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = "https://choose-your-sub.onrender.com";

  const handleUpload = async () => {
    if (files.length === 0) {
      alert("Please select .srt files");
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
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center p-4">
      
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 w-full max-w-xl text-center"
      >

        <h1 className="text-3xl font-bold mb-2">🎬 SRT Analyzer</h1>
        <p className="text-gray-600 mb-6">
          Find the best subtitle file with AI-like scoring
        </p>

        {/* Drag & Drop Style Upload */}
        <label className="border-2 border-dashed border-gray-300 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 transition mb-4">
          <FaUpload className="text-3xl text-gray-400 mb-3" />
          <span className="text-gray-600">
            Click or drag .srt files here
          </span>

          <input
            type="file"
            multiple
            accept=".srt"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="hidden"
          />
        </label>

        <p className="text-sm text-gray-500 mb-4">
          {files.length} file(s) selected
        </p>

        {/* Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={handleUpload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl shadow-lg transition"
        >
          {loading ? "Processing..." : "Compare Scripts"}
        </motion.button>

        {/* Results */}
        {data && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 text-left"
          >
            <h2 className="text-center font-semibold mb-4">
              Mode: {data.mode}
            </h2>

            {data.results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 mb-3 rounded-xl shadow ${
                  r.filename === data.best_file
                    ? "border-2 border-green-500 bg-green-50"
                    : "bg-white"
                }`}
              >
                <h3 className="font-bold">{r.filename}</h3>

                <p className="text-sm text-gray-600 mb-1">
                  Score: {r.score}
                </p>

                <p className="text-xs text-gray-500 mb-2">
                  {r.reason}
                </p>

                <div className="flex justify-between text-xs text-gray-600">
                  <span>Words: {r.details.word_count}</span>
                  <span>Unique: {r.details.unique_words}</span>
                  <span>Diversity: {r.details.diversity}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default App;