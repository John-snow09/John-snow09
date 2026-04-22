
import { createUserWithEmailAndPassword } from "firebase/auth";
import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "./firebase";
import { updateProfile } from "firebase/auth";
import { verifyBeforeUpdateEmail, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";

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
  const [cooldown, setCooldown] = useState(0);
  const [toast, setToast] = useState(null);
  const [settingsTab, setSettingsTab] = useState("profile");
  const [profileMode, setProfileMode] = useState("menu");
// menu | username | email

  /* ================= LOGIN STATES ================= */
  const [showResend, setShowResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newUsername, setNewUsername] = useState("");
  const [showProfile, setShowProfile] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [showEmailChange, setShowEmailChange] = useState(false);

  const API_BASE = "https://choose-your-sub.onrender.com";

  /* 🌙 DARK MODE */
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

       // 👇 BETTER BUTTON SYSTEM
  const primaryBtn =
    "bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-xl hover:scale-105 transition";

  /* 🔐 AUTO LOGIN AFTER VERIFY (NEW FIX) */
  useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
    if (currentUser) {
      await currentUser.reload(); // ✅ important

      if (!currentUser.emailVerified) {
        setUser(null);
        return;
      }

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
  
  /*TIMER LOGIC*/  
useEffect(() => {
  if (cooldown <= 0) return;

  const timer = setInterval(() => {
    setCooldown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [cooldown]);  

  const handleUpload = async () => {
    if (!files.length) return showToast("Select files");

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
      showToast("Backend error");
    } finally {
      setLoading(false);
    }
  };
       
  /*SignUP*/
const handleSignup = async () => {
  if (!email || !password) return showToast("Fill details");

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    // ✅ set username (optional)
    if (newUsername) {
      await updateProfile(firebaseUser, {
        displayName: newUsername,
      });
    }

    // ✅ send verification email
    await sendEmailVerification(firebaseUser);

       showToast("📩 Verify your email before login. Check spam too!");

    // ❗ IMPORTANT: DO NOT log user in yet
    await signOut(auth);

    setShowLogin(false);
    setEmail("");
    setPassword("");
    setNewUsername("");

    showToast("Account created! Verify your email 📩");

  } catch (err) {
    console.error(err);

    if (err.code === "auth/email-already-in-use") {
      showToast("User already exists. Please login.");
    } else if (err.code === "auth/weak-password") {
      showToast("Password should be at least 6 characters");
    } else {
      showToast(err.message);
    }
  }
};

  /*Email-Password login */
  const handleLogin = async () => {
  if (!email || !password) return showToast("Fill details");

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    // ❗ BLOCK if not verified
    if (!firebaseUser.emailVerified) {
      await signOut(auth);
      showToast("Please verify your email before logging in ❗", "error");
      setShowResend(true); // 👈 show resend option

      return;
    }

    setUser({
      name: firebaseUser.displayName,
      email: firebaseUser.email,
      photo: firebaseUser.photoURL,
    });

    setShowLogin(false);
    setEmail("");
    setPassword("");

  } catch (err) {
    console.error(err);

    if (err.code === "auth/user-not-found") {
      showToast("No user found. Please sign up first.", "error");
    } else if (err.code === "auth/wrong-password") {
      showToast("Incorrect password", "error");
    } else {
      showToast("Login failed", "error");
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
      showToast("Google login failed");
    }
  };
  
         /* USERNAME FUNCTION */
    const handleUpdateUsername = async () => {
  try {
    await updateProfile(auth.currentUser, {
      displayName: newUsername,
    });

    setUser({
      ...user,
      name: newUsername,
    });

    showToast("Username updated ✅");
    setShowProfile(false);
   } catch (err) {
    showToast(err.message, "error");
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
  if (!resetEmail) return showToast("Enter email first");

  try {
    await sendPasswordResetEmail(auth, resetEmail);

    setResetSent(true); // 🔥 LOCK STATE ENABLED
    showToast("Reset link sent to your email 📩");

  } catch (err) {
    console.error(err);
    showToast(err.message);
  }
};

/*RESEND Email FUNCTION*/
const handleResendResetEmail = async () => {
  if (cooldown > 0) return;

  try {
    await sendPasswordResetEmail(auth, resetEmail);

    setCooldown(30); // 🔥 start 30s cooldown
    showToast("Reset link resent 📩");

  } catch (err) {
    console.error(err);
    showToast(err.message);
  }
};


         // 👇 RESEND VERIFICATION
  const handleResendVerification = async () => {
  if (resendCooldown > 0) return;

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const firebaseUser = userCredential.user;

    await sendEmailVerification(firebaseUser);

    showToast("Verification email resent 📩");

    setCooldown(30); // ⏱ start 30s cooldown

    await signOut(auth);

  } catch (err) {
    console.error(err);
    showToast("Failed to resend email", "error");
  }
};


      /*========Email Change========= */ 
      const handleEmailChange = async () => {
  if (!newEmail || !emailPassword) {
    return showToast("Fill all fields", "error");
  }

  try {
    // STEP 1: re-authenticate user
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      emailPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);

    // STEP 2: send verification to NEW email
    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);

    showToast("Verification link sent to new email 📩");

    setShowEmailChange(false);
    setNewEmail("");
    setEmailPassword("");

  } catch (err) {
    showToast(err.message, "error");
  }
};



    /*TOAST NOTIFICATION FUNCTION*/
const showToast = (message, type = "success") => {
  setToast({ message, type });

  setTimeout(() => {
    setToast(null);
  }, 3000);
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
               disabled={resetSent}
               className={`w-full py-2 rounded-xl transition ${
               resetSent
               ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:scale-105 text-white"
               }`}
              >
               {resetSent ? "Link Sent ✔" : "Send Reset Link"}
             </button>

                 {resetSent && (
            <button
              onClick={handleResendResetEmail}
              disabled={cooldown > 0}
              className={`text-xs mt-2 hover:underline ${
              cooldown > 0
             ? "text-gray-400 cursor-not-allowed"
             : "text-blue-500"
               }`}
              >
             {cooldown > 0
             ? `Resend in ${cooldown}s`
             : "Resend Email"}
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


            <div className="flex flex-col gap-2 mt-2">
  
  {showResend && (
    <button
      onClick={handleResendVerification}
      disabled={cooldown > 0}
      className={`text-xs ${
        cooldown > 0
          ? "text-gray-400 cursor-not-allowed"
          : "text-blue-500 hover:underline"
      }`}
    >
      {cooldown > 0
        ? `Resend in ${cooldown}s`
        : "Resend Verification Email"}
    </button>
  )}

  {!resetMode && (
    <button
      onClick={handleForgotPassword}
      className="text-xs text-blue-500 hover:underline"
    >
      Forgot Password?
    </button>
  )}

</div>

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
                    {user.name || user.email}
                    <button
                      onClick={() => {
                        signOut(auth);
                        setUser(null);
                      }}
                      className="text-xs ml-2 text-red-500"
                    >
                      Logout
                    </button>

                    <button
                      onClick={() => setPage("settings")}
                      className="text-sm text-blue-500 ml-2"
                    >
                      Settings
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


         {/*================Setting page==========*/}
         {page === "settings" && (
  <div className="min-h-screen flex bg-white dark:bg-gray-950 text-black dark:text-white">

    {/* SIDEBAR */}
    <div className="w-64 border-r p-5 space-y-2">

      <h2 className="font-bold text-lg mb-4">Settings</h2>

      <button
        onClick={() => setPage("landing")}   // or "landing" if you prefer
        className="w-full text-left p-2 mb-4 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-sm text-gray-500"
      >
        ← Back to Home
      </button>

      <button
  onClick={() => setSettingsTab("profile")}
  className={`w-full text-left p-2 rounded transition ${
    settingsTab === "profile"
      ? "bg-black text-white dark:bg-white dark:text-black"
      : "hover:bg-gray-100 dark:hover:bg-gray-800"
  }`}
>
  Profile
</button>

<button
  onClick={() => setSettingsTab("username")}
  className={`w-full text-left p-2 rounded transition ${
    settingsTab === "username"
      ? "bg-black text-white dark:bg-white dark:text-black"
      : "hover:bg-gray-100 dark:hover:bg-gray-800"
  }`}
>
  Change Username
</button>

<button
  onClick={() => setSettingsTab("email")}
  className={`w-full text-left p-2 rounded transition ${
    settingsTab === "email"
      ? "bg-black text-white dark:bg-white dark:text-black"
      : "hover:bg-gray-100 dark:hover:bg-gray-800"
  }`}
>
  Change Email
</button>


    </div>

    {/* MAIN CONTENT */}
    <div className="flex-1 p-8">

      {/* PROFILE VIEW */}
      {settingsTab === "profile" && (
  <div>
    <h1 className="text-xl font-bold mb-4">Profile</h1>
    <p><b>Name:</b> {user?.name}</p>
    <p><b>Email:</b> {user?.email}</p>
  </div>
)}

      {/* USERNAME UPDATE */}
      {settingsTab === "username" && (
  <div>
    <h1 className="text-xl font-bold mb-4">Change Username</h1>

    <input
      className="w-full p-2 border rounded mb-3 bg-transparent"
      value={newUsername}
      onChange={(e) => setNewUsername(e.target.value)}
    />

    <button
      onClick={handleUpdateUsername}
      className={primaryBtn}
    >
      Save
    </button>
  </div>
)}

      {/* EMAIL UPDATE */}
      {settingsTab === "email" && (
  <div>
    <h1 className="text-xl font-bold mb-4">Change Email</h1>

    <input
      className="w-full p-2 border rounded mb-2 bg-transparent"
      placeholder="New email"
      value={newEmail}
      onChange={(e) => setNewEmail(e.target.value)}
    />

    <input
      className="w-full p-2 border rounded mb-3 bg-transparent"
      placeholder="Password"
      type="password"
      value={emailPassword}
      onChange={(e) => setEmailPassword(e.target.value)}
    />

    <button
      onClick={handleEmailChange}
      className={primaryBtn}
    >
      Send Verification
    </button>
  </div>
)}

    </div>

  </div>
)}

        {/* ================= TOAST ================= */}
    {toast && (
  <div
    className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] px-4 py-2 rounded-xl text-white shadow-2xl transition ${
      toast.type === "error" ? "bg-red-500" : "bg-green-500"
    }`}
  >
    {toast.message}
  </div>
)}
    </div>
  );
}

export default App;