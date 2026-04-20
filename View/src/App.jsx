import { useState } from "react";

function App() {
  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🌐 Your deployed backend
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

      if (!res.ok) {
        throw new Error("Backend error");
      }

      const result = await res.json();
      setData(result);

    } catch (err) {
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>

      {/* 🟢 HEADER */}
      <h1 style={styles.title}>🎬 SRT Script Analyzer</h1>

      <p style={styles.subtitle}>
        Upload multiple <b>.srt</b> files and compare quality, richness, and structure.
      </p>

      {/* 📂 UPLOAD SECTION */}
      <div style={styles.uploadRow}>
        <input
          type="file"
          multiple
          accept=".srt"
          onChange={(e) => setFiles(Array.from(e.target.files))}
          style={styles.input}
        />

        <span style={styles.note}>
          ⚠️ Only .srt files allowed
        </span>
      </div>

      <p>{files.length} file(s) selected</p>

      <button onClick={handleUpload} style={styles.button}>
        Compare Scripts
      </button>

      {loading && <p>⏳ Processing files...</p>}

      {/* 📊 RESULTS */}
      {data && (
        <div style={styles.results}>
          <h2>📊 Mode: {data.mode}</h2>

          <h2 style={styles.best}>
            🏆 Best Script: {data.best_file}
          </h2>

          {data.results.map((r, i) => (
            <div
              key={i}
              style={{
                ...styles.card,
                border:
                  r.filename === data.best_file
                    ? "2px solid green"
                    : "1px solid #ccc",
              }}
            >
              <h3>
                {i + 1}. {r.filename}
              </h3>

              <p><b>Score:</b> {r.score}</p>
              <p><b>Reason:</b> {r.reason}</p>
              <p><b>Words:</b> {r.details.word_count}</p>
              <p><b>Unique Words:</b> {r.details.unique_words}</p>
              <p><b>Diversity:</b> {r.details.diversity}</p>
              <p><b>Avg Sentence Length:</b> {r.details.avg_sentence_length}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    padding: "40px",
    background: "#f4f6f8",
    fontFamily: "Arial",
    textAlign: "center",
  },

  title: {
    marginBottom: "10px",
  },

  subtitle: {
    marginBottom: "20px",
    color: "#555",
    fontSize: "16px",
  },

  uploadRow: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "15px",
    marginBottom: "15px",
  },

  input: {
    marginBottom: "0",
  },

  note: {
    fontSize: "14px",
    color: "#888",
  },

  button: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },

  results: {
    marginTop: "30px",
  },

  best: {
    color: "green",
  },

  card: {
    background: "#fff",
    padding: "15px",
    margin: "10px auto",
    borderRadius: "10px",
    width: "320px",
    textAlign: "left",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
};

export default App;