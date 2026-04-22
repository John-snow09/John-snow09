
import { createUserWithEmailAndPassword } from "firebase/auth";
import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
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

  const [resetMode, setResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);

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

  /* 🚫 PROTECT DASHBOARD ROUTE */
useEffect(() => {
  if (page === "dashboard" && !user) {
    setPage("landing");
  }
}, [page, user]);

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
       
  /*SignUP*/
const handleSignup = async () => {
  if (!email || !password) return alert("Fill details");

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // 🔥 SEND EMAIL VERIFICATION
    await sendEmailVerification(user);

    setUser({
      email: user.email,
      name: user.displayName,
      photo: user.photoURL,
    });

    setShowLogin(false);
    setEmail("");
    setPassword("");

    alert("Account created! Please verify your email 📩 before login.");

  } catch (err) {
    console.error(err);

    if (err.code === "auth/email-already-in-use") {
      alert("User already exists. Please login.");
    } else if (err.code === "auth/weak-password") {
      alert("Password should be at least 6 characters");
    } else {
      alert(err.message);
    }
  }
};

  /*Email-Password login */
  const handleLogin = async () => {
  if (!email || !password) return alert("Fill details");

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const currentUser = userCredential.user;

// 🔐 EMAIL VERIFICATION CHECK (PUT HERE)
if (!currentUser.emailVerified) {
  alert("Please verify your email before logging in.");
  return;
}

setUser({
  name: currentUser.displayName,
  email: currentUser.email,
  photo: currentUser.photoURL,
});

setShowLogin(false);
setEmail("");
setPassword("");

  } catch (err) {
  console.error("Firebase login error:", err.code, err.message);

  if (err.code === "auth/user-not-found") {
    alert("No user found. Please sign up first.");
  } else if (err.code === "auth/wrong-password") {
    alert("Incorrect password");
  } else if (err.code === "auth/invalid-email") {
    alert("Invalid email format");
  } else if (err.code === "auth/invalid-credential") {
    alert("Wrong email or password");
  } else {
    alert(err.message); // 👈 IMPORTANT: show real reason
  }
}
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

  /* 🔁 FORGOT PASSWORD */
const handleForgotPassword = () => {
  setResetMode(true);
  setResetEmail(email); // auto-fill if user already typed email
  setResetSent(false);
};

/*RESET EMAIL FUNCTION*/
const handleSendResetEmail = async () => {
  if (!resetEmail) return alert("Enter email first");

  try {
    await sendPasswordResetEmail(auth, resetEmail);
    setResetSent(true);
    alert("Reset link sent to your email 📩");
  } catch (err) {
    console.error(err);
    alert(err.message);
  }
};

/*RESEND Email FUNCTION*/
const handleResendResetEmail = async () => {
  try {
    await sendPasswordResetEmail(auth, resetEmail);
    alert("Reset link resent 📩");
  } catch (err) {
    console.error(err);
    alert(err.message);
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

              {!resetMode && (
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mb-3 p-2 border rounded-lg bg-transparent"
             />
               )}

              {!resetMode && (
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mb-4 p-2 border rounded-lg bg-transparent"
             />
              )}
               
             
             {resetMode && (
              <div className="flex flex-col gap-3 mt-2">

             <p className="text-sm mb-2">Reset your password</p>

             <input
                 type="email"
                 placeholder="Enter your email"
                 value={resetEmail}
                 onChange={(e) => setResetEmail(e.target.value)}
               className="w-full mb-2 p-2 border rounded-lg bg-transparent"
             />

             <button
               onClick={handleSendResetEmail}
               className="w-full bg-blue-600 text-white py-2 rounded-xl hover:scale-105 transition"
              >
                Send Reset Link
            </button>

                 {resetSent && (
            <button
              onClick={handleResendResetEmail}
              className="text-xs text-blue-500 mt-2 hover:underline"
              >
                 Resend Email
            </button>
              )}

            <button
              onClick={() => setResetMode(false)}
              className="text-xs text-gray-500 mt-2 hover:underline"
           >
              Back to login
           </button>

          </div>
                )}

              {!resetMode && (
           <button
             onClick={handleLogin}
             className="w-full bg-black text-white py-2 rounded-xl hover:scale-105 transition"
           >
              Sign In
           </button>
            )}


              {!resetMode && (
           <button
             onClick={handleForgotPassword}
             className="text-xs text-blue-500 mt-2 hover:underline"
           >
             Forgot Password?
           </button>
              )}


              {!resetMode && (
              <button
                onClick={handleSignup}
                className="w-full bg-gray-700 text-white py-2 rounded-xl mt-2 hover:scale-105 transition"
              >
                Sign Up
              </button>
                )}

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
                onClick={() => {
                if (!user) {
                        setShowLogin(true);
                       } else {
                     setPage("dashboard");
                       }
                      }}
                className="bg-black text-white dark:bg-white dark:text-black px-8 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition"
              >
                <FaRocket />
                Get Started
              </button>

            </div>

            {/* FEATURES */}
            <div className="grid md:grid-cols-3 gap-6 px-10 pb-14">
              <div className="border rounded-2xl p-6 text-center shadow-sm">
                <FaFileAlt className="mx-auto text-2xl mb-2" />
                Fast Analysis
              </div>

              <div className="border rounded-2xl p-6 text-center shadow-sm">
                <FaChartBar className="mx-auto text-2xl mb-2" />
                AI Scoring Engine
              </div>

              <div className="border rounded-2xl p-6 text-center shadow-sm">
                <FaHistory className="mx-auto text-2xl mb-2" />
                Smart Comparison
              </div>
            </div>

            {/* FOOTER */}
            <div className="flex justify-center gap-8 p-6 text-3xl border-t">

              <a href="https://instagram.com/___john_snow_" target="_blank">
                <FaInstagram className="hover:text-pink-500 transition hover:scale-110" />
              </a>

              <a href="https://x.com/JohnSnow320411" target="_blank">
                <FaTwitter className="hover:text-blue-500 transition hover:scale-110" />
              </a>

              <a href="https://github.com/John-snow09" target="_blank">
                <FaGithub className="hover:text-black transition hover:scale-110" />
              </a>

            </div>

          </motion.div>
        )}

        {/* DASHBOARD (UNCHANGED) */}
        {page === "dashboard" && user && (
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