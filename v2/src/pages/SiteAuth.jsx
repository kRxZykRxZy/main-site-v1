import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  verifyBeforeUpdateEmail,
  onAuthStateChanged
} from "firebase/auth";
import { auth, db } from "../firebaseConfig"; // db imported from config
import { doc, query, setDoc, getDoc, arrayUnion, where, getDocs, collection } from "firebase/firestore";
import Spinner from "../components/spinner/workspace";

const API_BASE = "https://sl-api-v1.onrender.com";

const SnapLabsDashboard = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setUid(currentUser.uid);
        window.username = currentUser.displayName;
        await fetchUserData(currentUser.displayName, currentUser.uid);
      } else {
        setUser(null);
        setUid(null);
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch user data from API
  const fetchUserData = async (username, uid) => {
    if (!username || !uid) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/userapi/${username}`, {
        headers: {
          Authorization: `Bearer ${uid}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch user data");
      const data = await res.json();
      setUserData(data);
      setEmail(data.email || "");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create Firestore user document
  const createFirestoreUser = async (username, uid) => {
    try {
      const userRef = doc(db, "users", uid);
      const adminRef = doc(db, "users", "YzS99EK1RbeXniXxPhAXuuv5sk93");
      const docSnap = await getDoc(userRef);
      const adminSnap = await getDoc(adminRef);
      if (!docSnap.exists()) {
        await setDoc(userRef, {
          username,
          uid,
          followers: ["Admin"],
          followings: ["Admin"],
          achievements: [""]
        });
        console.log("User document created in Firestore.");
      }
      if (!adminSnap.exists()) {
        await updateDoc(adminRef, {
          followings: arrayUnion(username)
        });
      }
    } catch (err) {
      console.error("Failed to create Firestore user:", err);
    }
  };

  // Register user
  const handleRegister = async () => {
    setError("");
    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", username));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        setError("Username already exists. Please choose another one.");
        return;
      }
      
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: username });
      setUser(res.user);
      setUid(res.user.uid);
      window.username = username;

      // Create Firestore document
      await createFirestoreUser(username, res.user.uid);

      // Optional: send email to API
      await sendEmailToServer(username, email, res.user.uid);

      fetchUserData(username, res.user.uid);
    } catch (err) {
      setError(err.message);
    }
  };

  // Login user
  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      setUid(res.user.uid);
      window.username = res.user.displayName;

      await sendEmailToServer(res.user.displayName, res.user.email, res.user.uid);
      fetchUserData(res.user.displayName, res.user.uid);
    } catch (err) {
      setError(err.message);
    }
  };

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUid(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setUserData(null);
  };

  // Optional: send email to API
  const sendEmailToServer = async (username, email, uid) => {
    try {
      await fetch(`${API_BASE}/users/${username}/email/set`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${uid}`,
        },
        body: JSON.stringify({ username, email }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Email change
  const handleEmailChange = async () => {
    if (!newEmail || !user || !uid) return;
    try {
      await verifyBeforeUpdateEmail(user, newEmail);
      alert(`Verification email sent to ${newEmail}.`);

      await sendEmailToServer(user.displayName, newEmail, uid);

      setEmail(newEmail);
      setShowEmailModal(false);
      fetchUserData(user.displayName, uid);
    } catch (err) {
      console.error(err);
      alert("Failed to update email. " + err);
    }
  };

  if (loading) {
    return <Spinner text="Loading Your SnapLabs Workspace..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-6">
      {!user ? (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">SnapLabs</h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}
          <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mb-3 px-4 py-2 border rounded-md" />
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full mb-3 px-4 py-2 border rounded-md" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mb-3 px-4 py-2 border rounded-md" />
          <div className="flex space-x-2">
            <button onClick={handleRegister} className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Register</button>
            <button onClick={handleLogin} className="flex-1 bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600">Login</button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* User Info & Stats */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-2xl font-semibold mb-2">Welcome, {user.displayName || "User"}!</h3>
            <p>Email: {user.email}</p>

            {userData && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="font-semibold text-indigo-700">{userData.stats?.totalProjects || 0}</p>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="font-semibold text-indigo-700">{userData.stats?.totalViews || 0}</p>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="font-semibold text-indigo-700">{userData.stats?.totalLikes || 0}</p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="font-semibold text-indigo-700">{userData.stats?.totalFavorites || 0}</p>
                  <p className="text-sm text-gray-600">Favorites</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex space-x-2">
              <button onClick={() => window.location.href = `/users/${user.displayName}`} className="bg-yellow-400 py-1 px-3 rounded hover:bg-yellow-500">My Profile</button>
              <button onClick={() => setShowEmailModal(true)} className="bg-yellow-400 py-1 px-3 rounded hover:bg-yellow-500">Change Email</button>
              <button onClick={handleLogout} className="bg-red-600 py-1 px-3 rounded text-white hover:bg-red-700">Logout</button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-2">Change Email</h3>
            <input type="email" placeholder="New Email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full mb-3 px-3 py-2 border rounded" />
            <div className="flex justify-end space-x-2">
              <button onClick={() => setShowEmailModal(false)} className="py-1 px-3 rounded bg-gray-300 hover:bg-gray-400">Cancel</button>
              <button onClick={handleEmailChange} className="py-1 px-3 rounded bg-indigo-600 text-white hover:bg-indigo-700">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnapLabsDashboard;
