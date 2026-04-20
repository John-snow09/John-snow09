import { useState } from "react";

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
      console.error(err);
      alert("Error connecting to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        
        <h1 style={styles.title}>🎬 SRT Analyzer</h1>
        <p style={styles.subtitle}>
          Upload subtitle files and find the best quality script instantly.
        </p>

        <div style={styles.uploadBox}>
          <input
            type="file"
            multiple
            accept=".srt"
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />
          <p style={styles.note}>Only .srt files supported</p>
        </div>

        <button onClick={handleUpload} style={styles.button}>
          {loading ? "Processing..." : "Compare Scripts"}
        </button>

        {data && (
          <div style={styles.results}>
            <h2 style={styles.mode}>Mode: {data.mode}</h2>

            {data.results.map((r, i) => (
              <div
                key={i}
                style={{
                  ...styles.card,
                  ...(r.filename === data.best_file && styles.bestCard),
                }}
              >
                <h3>{r.filename}</h3>

                <p><b>Score:</b> {r.score}</p>
                <p>{r.reason}</p>

                <div style={styles.metrics}>
                  <span>Words: {r.details.word_count}</span>
                  <span>Unique: {r.details.unique_words}</span>
                  <span>Diversity: {r.details.diversity}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontFamily: "Segoe UI",
  },

  container: {
    background: "rgba(255,255,255,0.95)",
    padding: "40px",
    borderRadius: "20px",
    width: "420px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
  },

  title: {
    marginBottom: "10px",
  },

  subtitle: {
    color: "#555",
    marginBottom: "25px",
  },

  uploadBox: {
    border: "2px dashed #ccc",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "15px",
  },

  note: {
    fontSize: "12px",
    color: "#888",
  },

  button: {
    marginTop: "10px",
    padding: "12px 25px",
    borderRadius: "8px",
    border: "none",
    background: "#667eea",
    color: "#fff",
    cursor: "pointer",
    fontSize: "16px",
  },

  results: {
    marginTop: "30px",
    textAlign: "left",
  },

  mode: {
    textAlign: "center",
  },

  card: {
    background: "#fff",
    padding: "15px",
    borderRadius: "10px",
    marginTop: "10px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
  },

  bestCard: {
    border: "2px solid #4caf50",
    background: "#f0fff4",
  },

  metrics: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    fontSize: "14px",
  },
};

export default App;