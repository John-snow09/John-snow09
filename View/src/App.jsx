
import { db } from "./firebase"; // Make sure you exported 'db' in firebase.js!
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
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
  const [historyData, setHistoryData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
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

  const API_BASE = "https://snowlabs.onrender.com";

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

      // --- NEW: Save to History ---
      if (result && auth.currentUser) {
        try {
          await addDoc(collection(db, "history"), {
            userId: auth.currentUser.uid,
            best_file: result.best_file,
            mode: result.mode || "Standard", // Defaulting to Standard if mode isn't in result
            results: result.results.map(r => ({
              filename: r.filename,
              score: r.score
            })),
            timestamp: serverTimestamp()
          });
          console.log("Analysis saved to history!");
        } catch (dbError) {
          console.error("Firestore Save Error:", dbError);
        }
      }
      // --- END NEW SECTION ---

    } catch {
      showToast("Backend error");
    } finally {
      setLoading(false);
    }
  };

  
       /*Fetch History*/  
  const fetchHistory = async () => {
  if (!user) return;
  setLoading(true); // Reuse your loading state
  try {
    const q = query(
      collection(db, "history"),
      where("userId", "==", auth.currentUser.uid),
      orderBy("timestamp", "desc")
    );
    const querySnapshot = await getDocs(q);
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setHistoryData(docs);
  } catch (error) {
    // This will print the EXACT reason to your console
    console.error("FIREBASE FETCH ERROR:", error.code, error.message); 
    showToast("Failed to load history", "error");
  } finally {
    setLoading(false);
  }
};


         /*history to load automatically*/
useEffect(() => {
  if (active === "history") { // ✅ Matches your existing state
    fetchHistory();
  }
}, [active]); // ✅ Matches your existing state



// Toggle individual selection in History
const toggleSelect = (id) => {
  setSelectedIds(prev => 
    prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
  );
};

// Toggle all
const toggleSelectAll = () => {
  if (selectedIds.length === historyData.length) {
    setSelectedIds([]);
  } else {
    setSelectedIds(historyData.map(item => item.id));
  }
};

// Delete selected items
const deleteSelected = async () => {
  if (selectedIds.length === 0) return;
  if (!window.confirm(`Delete ${selectedIds.length} items?`)) return;

  setLoading(true);
  try {
    const { deleteDoc, doc } = await import("firebase/firestore");
    
    // Delete all selected docs from Firestore
    await Promise.all(
      selectedIds.map(id => deleteDoc(doc(db, "history", id)))
    );

    showToast(`Deleted ${selectedIds.length} items`);
    setSelectedIds([]); // Clear selection
    fetchHistory(); // Refresh list
  } catch (error) {
    console.error("Delete Error:", error);
    showToast("Failed to delete", "error");
  } finally {
    setLoading(false);
  }
};


       //Search history
const filteredHistory = historyData.filter(item => {
  const query = searchQuery.toLowerCase();
  // Searches both the winning file name AND any file in the list
  return (
    item.best_file.toLowerCase().includes(query) ||
    item.results.some(r => r.filename.toLowerCase().includes(query))
  );
});

       
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
  { id: "srt", label: "SRT Analyzer", icon: <FaFileAlt className="text-blue-500" /> }, 
  { id: "analytics", label: "Analytics", icon: <FaChartBar className="text-green-500" /> },
  { id: "history", label: "History", icon: <FaHistory className="text-orange-500" /> },
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
<div className="flex justify-between items-center px-4 py-5 md:px-6">
  <h1 className="font-bold text-lg md:text-xl flex-shrink-0">❄️ Snowlabs</h1>

  <div className="flex gap-2 sm:gap-3 items-center">
    {!user ? (
      <button
        onClick={() => setShowLogin(true)}
        className="px-4 py-2 text-sm rounded-xl border hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      >
        Login
      </button>
    ) : (
      <>
        {/* Settings Icon */}
        <button
          onClick={() => setPage("settings")}
          className={`p-2 rounded-full transition-all flex-shrink-0 ${
            page === "settings" 
              ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30" 
              : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
        </button>

        {/* User Info (Minimalist on Mobile) */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 pl-1 pr-2 py-1 rounded-full border dark:border-gray-700">
          {user.photo && (
            <img src={user.photo} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
          )}
          <button
            onClick={() => {
            // Add the confirmation check here
            if (window.confirm("Are you sure you want to log out?")) {
            signOut(auth);
            setUser(null);
            }
           }}
           className="text-[10px] font-bold text-red-500 uppercase px-1 hover:text-red-700 transition-colors"
         >
           out
         </button>
        </div>
      </>
    )}

    {/* Theme Toggle (Icon only to save space) */}
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="p-2 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex-shrink-0"
    >
      {darkMode ? "☀️" : "🌙"}
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

        {menu.map((item) => {
  // Define active styles based on ID
  const activeStyles = {
    srt: "bg-blue-600 text-white shadow-lg shadow-blue-500/20",
    analytics: "bg-green-600 text-white shadow-lg shadow-green-500/20",
    history: "bg-orange-600 text-white shadow-lg shadow-orange-500/20"
  };

  return (
    <button
      key={item.id}
      onClick={() => setActive(item.id)}
      className={`w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all duration-200 ${
        active === item.id
          ? activeStyles[item.id] // Use the specific color
          : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
      }`}
    >
      {/* Make icon white if active, otherwise keep original color */}
      <span className={active === item.id ? "text-white" : ""}>
        {item.icon}
      </span>
      <span className="font-bold text-sm">{item.label}</span>
    </button>
  );
})}

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
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }} 
    animate={{ opacity: 1, scale: 1 }}
    className="border rounded-2xl p-8 bg-white dark:bg-gray-800 shadow-sm border-blue-100 dark:border-blue-900/30"
  >
    {/* HEADER SECTION */}
    <div className="flex items-center gap-3 mb-6">
      <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
        <FaFileAlt size={20} />
      </div>
      <div>
        <h2 className="text-xl font-bold">SRT Subtitle Analyzer</h2>
        <p className="text-xs text-gray-500">Upload multiple files to find the best quality</p>
      </div>
    </div>

    {/* UPLOAD AREA */}
    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl p-10 hover:border-blue-400 transition-colors bg-gray-50/50 dark:bg-gray-900/30">
      <input
        type="file"
        multiple
        className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        onChange={(e) => setFiles(Array.from(e.target.files))}
      />
    </div>

    <button
      onClick={handleUpload}
      className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 mt-6 rounded-2xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2"
    >
      {loading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : (
        <>Run Analysis</>
      )}
    </button>

    {/* RESULTS SECTION */}
    {data?.results && (
      <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-2">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 flex items-center gap-3">
          <span className="text-xl">🏆</span>
          <div>
            <p className="text-[10px] uppercase font-bold text-blue-500">Winner</p>
            <h3 className="font-bold text-blue-700 dark:text-blue-300">{data.best_file}</h3>
          </div>
        </div>

        <div className="grid gap-3">
          {data.results.map((r, i) => (
            <div key={i} className="flex justify-between items-center p-4 bg-white dark:bg-gray-900 border rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-sm font-medium truncate max-w-[200px]">{r.filename}</span>
              <div className="flex items-center gap-4">
                <div className="h-2 w-24 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.min(r.score, 100)}%` }}
                  />
                </div>
                <span className="font-black text-blue-600 dark:text-blue-400">{r.score}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </motion.div>
)}

      {active === "analytics" && (
  <motion.div 
    initial={{ opacity: 0, y: 20 }} 
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    {/* HEADER SECTION */}
    <div className="border rounded-2xl p-8 bg-white dark:bg-gray-800 shadow-sm border-green-100 dark:border-green-900/30">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl text-green-600">
          <FaChartBar size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Usage Analytics</h2>
          <p className="text-xs text-gray-500">Insights into your subtitle and STE processing</p>
        </div>
      </div>
    </div>

    {/* QUICK STATS CARDS */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="p-6 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm border-gray-100 dark:border-gray-700 hover:border-green-500 transition-colors">
        <p className="text-sm text-gray-500 font-medium">Total Files Analyzed</p>
        <h3 className="text-3xl font-black mt-2 text-green-600">{historyData?.length || 0}</h3>
        <p className="text-[10px] text-gray-400 mt-1">Across all modes</p>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm border-gray-100 dark:border-gray-700 hover:border-green-500 transition-colors">
        <p className="text-sm text-gray-500 font-medium">Avg. STE Score</p>
        <h3 className="text-3xl font-black mt-2 text-purple-600">84%</h3>
        <p className="text-[10px] text-gray-400 mt-1">Based on recent runs</p>
      </div>

      <div className="p-6 bg-white dark:bg-gray-800 border rounded-2xl shadow-sm border-gray-100 dark:border-gray-700 hover:border-green-500 transition-colors">
        <p className="text-sm text-gray-500 font-medium">Time Saved</p>
        <h3 className="text-3xl font-black mt-2 text-blue-600">12.4h</h3>
        <p className="text-[10px] text-gray-400 mt-1">Estimated manual checking</p>
      </div>
    </div>

    {/* PLACEHOLDER FOR CHART */}
    <div className="border rounded-2xl p-12 bg-gray-50 dark:bg-gray-900/50 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center text-green-600 mb-4">
        <FaChartBar size={32} />
      </div>
      <h3 className="font-bold text-gray-800 dark:text-gray-200">Activity Chart</h3>
      <p className="text-sm text-gray-500 max-w-xs">Detailed visual trends will appear here as you continue to use Snowlabs.</p>
    </div>
  </motion.div>
)}


       {/* 🟧 HISTORY SECTION (CLEAN ORANGE THEME) */}
{active === "history" && (
  <div className="p-6 h-full flex flex-col">
    {/* HEADER SECTION: Sticky at the top */}
    <div className="bg-white dark:bg-gray-900 sticky top-0 z-10 pb-4 border-b dark:border-gray-800">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-2xl shadow-sm border border-orange-200 dark:border-orange-800/50">
            <FaHistory size={22} className="text-orange-600 dark:text-orange-400 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Past Analyses</h2>
            <p className="text-sm text-gray-500">{historyData.length} records</p>
          </div>
          
          {/* SELECT TOGGLE */}
          {historyData.length > 0 && (
            <button 
              onClick={toggleSelectAll} 
              className="ml-4 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            >
              {selectedIds.length === historyData.length ? "Deselect All" : "Select All"}
            </button>
          )}
        </div>
        
        <div className="flex gap-3 items-center">
          {/* DELETE BUTTON */}
          <div className="w-32 flex justify-end">
            {selectedIds.length > 0 && (
              <button 
                onClick={deleteSelected} 
                className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg shadow-red-500/20 transition-all animate-in fade-in zoom-in duration-200"
              >
                Delete ({selectedIds.length})
              </button>
            )}
          </div>

          <button 
            onClick={fetchHistory} 
            className="p-2 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-full transition-colors text-orange-600 dark:text-orange-400"
            title="Refresh"
          >
            🔄
          </button>
        </div>
      </div>

      {/* SEARCH INPUT FIELD */}
      <div className="relative">
        <input 
          type="text"
          placeholder="Search by filename..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-orange-500 rounded-xl outline-none transition-all text-sm"
        />
        <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-2.5 text-gray-400 hover:text-orange-600"
          >
            ✕
          </button>
        )}
      </div>
    </div>

    {/* SCROLLABLE GRID AREA */}
    <div className="flex-1 overflow-y-auto pr-2 mt-4 custom-scrollbar" style={{ maxHeight: 'calc(100vh - 280px)' }}>
      {filteredHistory.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredHistory.map((item) => (
            <div 
              key={item.id} 
              onClick={() => toggleSelect(item.id)}
              className={`relative p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 group ${
                selectedIds.includes(item.id) 
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-md' 
                  : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:border-orange-200 dark:hover:border-orange-900/30'
              }`}
            >
              <div className="absolute top-3 right-3">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelect(item.id);
                  }}
                  className="w-5 h-5 rounded-full border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
                />
              </div>

              <div className="mb-3">
                <div className="text-xs text-gray-400 mb-1">
                   {item.timestamp?.toDate().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="font-bold text-orange-600 dark:text-orange-400 truncate pr-6">
                  🏆 {item.best_file}
                </div>
              </div>

              <div className="text-xs text-gray-500 line-clamp-2">
                <span className="font-semibold text-gray-400">Analyzed:</span> {item.results.map(r => r.filename).join(", ")}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-500">
          <span className="text-4xl mb-4">{searchQuery ? "🕵️‍♂️" : "📂"}</span>
          <p className="italic">
            {searchQuery ? `No results found for "${searchQuery}"` : "No history found yet."}
          </p>
        </div>
      )}
    </div>
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