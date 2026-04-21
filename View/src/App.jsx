import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "./firebase";

import {
  FaRocket,
  FaFileAlt,
  FaChartBar,
  FaHistory,
  FaGithub,
  FaTwitter,
  FaInstagram,
} from "react-icons/fa";

function App() {
  const [page, setPage] = useState("landing");
  const [active, setActive] = useState("srt");

  const [darkMode, setDarkMode] = useState(false);
  const [files, setFiles] = useState([]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ================= LOGIN STATES ================= */
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const API_BASE = "https://choose-your-sub.onrender.com";

  /* 🌙 DARK MODE */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  /* 🔐 PERSIST LOGIN (NEW FIX) */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          name: currentUser.displayName,
          email: currentUser.email,
          photo: currentUser.photoURL,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

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

  const handleLogin = () => {
    if (!email || !password) return alert("Fill details");

    setUser({ email });
    setShowLogin(false);
    setEmail("");
    setPassword("");
  };

  /* 🔥 GOOGLE LOGIN */
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);

      setUser({
        name: result.user.displayName,
        email: result.user.email,
        photo: result.user.photoURL,
      });

      setShowLogin(false);
    } catch (err) {
      console.error(err);
      alert("Google login failed");
    }
  };

  const menu = [
    { id: "srt", label: "SRT Analyzer", icon: <FaFileAlt /> },
    { id: "analytics", label: "Analytics", icon: <FaChartBar /> },
    { id: "history", label: "History", icon: <FaHistory /> },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white">

      {/* ================= LOGIN MODAL ================= */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowLogin(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-[360px] bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl p-6 rounded-2xl shadow-2xl border"
            >
              <h2 className="text-xl font-bold mb-1">Welcome back</h2>
              <p className="text-sm text-gray-500 mb-6">
                Sign in to continue to Snowlabs
              </p>

              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2 border py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition mb-4"
              >
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  className="w-5 h-5"
                  alt="google"
                />
                Continue with Google
              </button>

              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
                <span className="text-xs text-gray-400">OR</span>
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
              </div>

              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-3 p-2 border rounded-lg bg-transparent"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-4 p-2 border rounded-lg bg-transparent"
              />

              <button
                onClick={handleLogin}
                className="w-full bg-black text-white py-2 rounded-xl hover:scale-105 transition"
              >
                Sign In
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= APP ================= */}
      <AnimatePresence mode="wait">

        {/* LANDING */}
        {page === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="min-h-screen flex flex-col"
          >
            {/* NAV */}
            <div className="flex justify-between items-center px-6 py-5">
              <h1 className="font-bold text-xl">❄️ Snowlabs</h1>

              <div className="flex gap-3 items-center">

                {!user ? (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 text-sm rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    Login
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-sm">
                    {user.photo && (
                      <img src={user.photo} className="w-6 h-6 rounded-full" />
                    )}
                    {user.email}
                    <button
                      onClick={() => {
                        signOut(auth);
                        setUser(null);
                      }}
                      className="text-xs ml-2 text-red-500"
                    >
                      Logout
                    </button>
                  </div>
                )}

                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="text-sm border px-3 py-1 rounded-lg"
                >
                  {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>

              </div>
            </div>

            {/* HERO */}
            <div className="flex-1 flex flex-col items-center justify-center text-center px-6">

              <div className="px-4 py-1 mb-6 text-sm rounded-full border bg-gray-50 dark:bg-gray-900">
                AI-powered subtitle intelligence
              </div>

              <h1 className="text-5xl font-bold mb-4 max-w-3xl leading-tight">
                Analyze & Compare Subtitle Files in Seconds
              </h1>

              <p className="text-gray-500 max-w-xl mb-8 text-lg">
                Upload multiple SRT files and automatically detect the best quality using intelligent scoring.
              </p>

              <button
                onClick={() => setPage("dashboard")}
                className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition"
              >
                <FaRocket />
                Get Started
              </button>

            </div>

            {/* FEATURES */}
            <div className="grid md:grid-cols-3 gap-6 px-10 pb-14">
              <div className="border rounded-2xl p-6 text-center bg-gray-50 dark:bg-gray-900 shadow-md hover:shadow-2xl transition duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                <FaFileAlt className="mx-auto text-2xl mb-2" />
                Fast Analysis
              </div>

              <div className="border rounded-2xl p-6 text-center bg-gray-50 dark:bg-gray-900 shadow-md hover:shadow-2xl transition duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                <FaChartBar className="mx-auto text-2xl mb-2" />
                AI Scoring Engine
              </div>

              <div className="border rounded-2xl p-6 text-center bg-gray-50 dark:bg-gray-900 shadow-md hover:shadow-2xl transition duration-300 hover:-translate-y-1 hover:scale-[1.02]">
                <FaHistory className="mx-auto text-2xl mb-2" />
                Smart Comparison
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-center gap-8 p-6 text-3xl border-t">
              <FaInstagram />
              <FaTwitter />
              <FaGithub />
            </div>

          </motion.div>
        )}

        {/* DASHBOARD (UNCHANGED) */}
        {page === "dashboard" && (
  <motion.div
    key="dashboard"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex min-h-screen"
  >

    {/* SIDEBAR */}
    <div className="w-64 bg-gray-100 dark:bg-gray-900 border-r p-4 flex flex-col">

      <h1 className="font-bold mb-6">❄️ Snowlabs</h1>

      <button
        onClick={() => setPage("landing")}
        className="text-xs text-gray-500 mb-5 hover:text-black dark:hover:text-white"
      >
        ← Back to Home
      </button>

      <div className="space-y-2 flex-1">

        {menu.map((item) => (
          <button
            key={item.id}
            onClick={() => setActive(item.id)}
            className={`w-full text-left p-2 rounded flex items-center gap-2 transition ${
              active === item.id
                ? "bg-black text-white dark:bg-white dark:text-black shadow"
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

      {active === "srt" && (
        <div className="border rounded-2xl p-6 bg-white dark:bg-gray-800 shadow-sm">

          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
          />

          <button
            onClick={handleUpload}
            className="bg-black text-white px-4 py-2 mt-4 rounded-xl hover:scale-105 transition"
          >
            {loading ? "Processing..." : "Run Analysis"}
          </button>

          {data?.results && (
            <div className="mt-6 space-y-2">

              <div className="p-3 bg-green-100 rounded-xl">
                🏆 Best: {data.best_file}
              </div>

              {data.results.map((r, i) => (
                <div key={i} className="border p-3 rounded-xl">
                  {r.filename} — {r.score}
                </div>
              ))}

            </div>
          )}

        </div>
      )}

      {active === "analytics" && (
        <div className="border rounded-2xl p-6">
          Analytics Coming Soon 🚀
        </div>
      )}

      {active === "history" && (
        <div className="border rounded-2xl p-6">
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