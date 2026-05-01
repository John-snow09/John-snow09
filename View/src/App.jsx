
import { StatusBar, Style } from '@capacitor/status-bar';
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import SrtAnalyzer from './components/SrtAnalyzer';
import Analytics from './components/Analytics';
import History from './components/History';
import Settings from './components/Settings';
import { db } from "./firebase"; // Make sure you exported 'db' in firebase.js!
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import {  
  query, 
  where, 
  getDocs, 
  orderBy, 
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { sendEmailVerification, sendPasswordResetEmail } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getDoc, setDoc } from "firebase/firestore";
import { deleteDoc } from "firebase/firestore";
import { auth, provider } from "./firebase";
import { doc, runTransaction } from "firebase/firestore";
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
  const [isFolded, setIsFolded] = useState(false);
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
  const unsubscribe = onAuthStateChanged(auth, async (authenticatedUser) => {
    if (authenticatedUser) {
      // 1. Initial set from Auth
      setUser(authenticatedUser);

      try {
        // 2. Fetch the "Real" username from Firestore
        const q = query(
          collection(db, "usernames"), 
          where("uid", "==", authenticatedUser.uid)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          // We found their username document!
          const username = querySnapshot.docs[0].id; // The doc ID is the username
          
          // 3. Force the state to include this username
          setUser({
            ...authenticatedUser,
            displayName: username
          });
        }
      } catch (error) {
        console.error("Error fetching username on login:", error);
      }
    } else {
      setUser(null);
    }
    setLoading(false);
  });

  return () => unsubscribe();
}, []);

  /* 🚫 PROTECT DASHBOARD ROUTE */
useEffect(() => {
  if (page === "dashboard" && !user) {
    setPage("landing");
  }
}, [page, user]);


// Call this when the app loads
const setupStatusBar = async () => {
  await StatusBar.setBackgroundColor({ color: '#000000' }); // Your dashboard color
  await StatusBar.setStyle({ style: Style.Dark }); // Makes icons (time/battery) white
};

  
  /*TIMER LOGIC*/  
useEffect(() => {
  if (cooldown <= 0) return;

  const timer = setInterval(() => {
    setCooldown((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(timer);
}, [cooldown]);  


//Handle upload plus fetch history code
  const handleUpload = useCallback(async () => {
  if (!files.length) return showToast("Select files");

  const formData = new FormData();
  files.forEach((f) => formData.append("files", f));

  try {
    setLoading(true);

    // 1. Fetch from Backend
    const res = await fetch(`${API_BASE}/compare`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) throw new Error("Backend error");
    
    const result = await res.json();
    setData(result);

    // 2. Save to History (Using your new detailed structure)
    if (result && auth.currentUser) {
      try {
        await addDoc(collection(db, "history"), {
          userId: auth.currentUser.uid,
          best_file: result.best_file,
          mode: result.mode || "Standard",
          results: result.results.map(r => ({
            filename: r.filename,
            score: r.score
          })),
          timestamp: serverTimestamp() // Using serverTimestamp for accuracy
        });
        console.log("Analysis saved to history!");
      } catch (dbError) {
        console.error("Firestore Save Error:", dbError);
      }
    }

  } catch (error) {
    console.error("Upload error:", error);
    showToast(error.message === "Backend error" ? "Backend error" : "Analysis failed");
  } finally {
    setLoading(false);
  }
}, [files, API_BASE]); // Removed 'user' dependency to prevent unnecessary re-renders

  
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
    const handleUpdateUsername = async (chosenName) => {
  if (!chosenName) return;
  
  const oldName = auth.currentUser.displayName?.toLowerCase().trim();
  const newNameClean = chosenName.toLowerCase().trim();

  try {
    const newNameRef = doc(db, "usernames", newNameClean);
    
    const docSnap = await getDoc(newNameRef);
    if (docSnap.exists() && docSnap.data().uid !== auth.currentUser.uid) {
      alert("This username is taken by another user.");
      return;
    }

    await setDoc(newNameRef, {
      uid: auth.currentUser.uid,
      createdAt: new Date()
    });

    if (oldName && oldName !== newNameClean) {
      await deleteDoc(doc(db, "usernames", oldName));
    }

    await updateProfile(auth.currentUser, { displayName: chosenName });

    // 1. Refresh the user object so the UI sees the new name
    setUser({ ...auth.currentUser });

    // 2. Show the success message
    alert("Username updated!");

    // 3. Swap the tab back to 'profile' so they see the result
    // (Ensure setSettingsTab is passed into this function or available in scope)
    if (typeof setSettingsTab === 'function') {
      setSettingsTab("profile");
    }

    // ❌ REMOVE THIS LINE:
    // setPage("dashboard"); 

  } catch (error) {
    alert("Error: " + error.message);
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

        {/* LANDING PAGE */}
{page === "landing" && (
  <Landing 
    user={user} 
    setUser={setUser}
    setPage={setPage} 
    setShowLogin={setShowLogin} 
    darkMode={darkMode}
    setDarkMode={setDarkMode}
  />
)}

        {/* 2. UNIFIED DASHBOARD */}
    {page === "dashboard" && user && (
      <Dashboard 
        user={user} 
        setUser={setUser} 
        setPage={setPage} 
        active={active} 
        setActive={setActive}
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        historyData={historyData}
        setFiles={setFiles}
        handleUpload={handleUpload}
        loading={loading}
        data={data}
        fetchHistory={fetchHistory}
        filteredHistory={filteredHistory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedIds={selectedIds}
        toggleSelect={toggleSelect}
        toggleSelectAll={toggleSelectAll}
        deleteSelected={deleteSelected}
      />
    )}
      </AnimatePresence>


        {/*======================Settings========================*/}
      {page === "settings" && (
  <Settings 
    isFolded={isFolded}
    setIsFolded={setIsFolded}
    user={user}
    setPage={setPage}
    settingsTab={settingsTab}
    setSettingsTab={setSettingsTab}
    setUser={setUser}
    newUsername={newUsername}
    setNewUsername={setNewUsername}
    handleUpdateUsername={handleUpdateUsername}
    newEmail={newEmail}
    setNewEmail={setNewEmail}
    emailPassword={emailPassword}
    setEmailPassword={setEmailPassword}
    handleEmailChange={handleEmailChange}
  />
)}

      {/* ================= TOAST ================= */}
      {toast && (
        <div className={`fixed top-5 left-1/2 transform -translate-x-1/2 z-[9999] px-4 py-2 rounded-xl text-white shadow-2xl transition ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}

export default App;