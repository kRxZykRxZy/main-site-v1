import React, { useState, useEffect } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  updateEmail as firebaseUpdateEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import Spinner from "../components/spinner/workspace";

const API_BASE = "https://sl-api-v1.onrender.com";

const SnapLabsDashboard = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  // Firebase auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        window.username = currentUser.displayName;
        fetchUserData(currentUser.displayName);
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchUserData = async (username) => {
    if (!username) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/userapi/${username}`);
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

  const sendEmailToServer = async (username, email) => {
    try {
      await fetch(`${API_BASE}/users/${username}/email/set`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRegister = async () => {
    setError("");
    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(res.user, { displayName: username });
      setUser(res.user);
      window.username = username;

      await sendEmailToServer(username, email);
      fetchUserData(username);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      setUser(res.user);
      window.username = res.user.displayName;

      await sendEmailToServer(res.user.displayName, res.user.email);
      fetchUserData(res.user.displayName);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    setUsername("");
    setEmail("");
    setPassword("");
    setUserData(null);
  };

  const handleEmailChange = async () => {
    if (!newEmail || !user) return;

    try {
      // Update email in Firebase
      await firebaseUpdateEmail(user, newEmail);

      // Update email on server
      await sendEmailToServer(user.displayName, newEmail);

      // Update local state and refetch data
      setEmail(newEmail);
      setShowEmailModal(false);
      fetchUserData(user.displayName);
    } catch (err) {
      console.error(err);
      alert(
        "Failed to update email. You may need to re-login to change your email."
      );
    }
  };

  const getTrendingProject = () => {
    if (!userData?.projects || userData.projects.length === 0) return null;
    return [...userData.projects].sort(
      (a, b) => (b.stats.views || 0) - (a.stats.views || 0)
    )[0];
  };

  const trendingProject = getTrendingProject();

  if (loading) {
    return <Spinner text="Loading Your SnapLabs Workspace..." />;
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-6">
      {!user ? (
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-lg">
          <h2 className="text-3xl font-bold text-indigo-600 mb-6 text-center">
            SnapLabs
          </h2>
          {error && <p className="text-red-600 mb-4">{error}</p>}

          <input
            type="text"
            placeholder="Username (for signup)"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full mb-3 px-4 py-2 border rounded-md"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-3 px-4 py-2 border rounded-md"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full mb-3 px-4 py-2 border rounded-md"
          />

          <div className="flex space-x-2">
            <button
              onClick={handleRegister}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
            >
              Register
            </button>
            <button
              onClick={handleLogin}
              className="flex-1 bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600"
            >
              Login
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {/* User Info & Stats */}
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h3 className="text-2xl font-semibold mb-2">
              Welcome, {user.displayName || "User"}!
            </h3>
            <p>Email: {user.email}</p>

            {userData && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="font-semibold text-indigo-700">
                    {userData.stats.totalProjects || 0}
                  </p>
                  <p className="text-sm text-gray-600">Projects</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="font-semibold text-indigo-700">
                    {userData.stats.totalViews || 0}
                  </p>
                  <p className="text-sm text-gray-600">Views</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="font-semibold text-indigo-700">
                    {userData.stats.totalLikes || 0}
                  </p>
                  <p className="text-sm text-gray-600">Likes</p>
                </div>
                <div className="bg-indigo-50 p-3 rounded">
                  <p className="font-semibold text-indigo-700">
                    {userData.stats.totalFavorites || 0}
                  </p>
                  <p className="text-sm text-gray-600">Favorites</p>
                </div>
              </div>
            )}

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => setShowEmailModal(true)}
                className="bg-yellow-400 py-1 px-3 rounded hover:bg-yellow-500"
              >
                Change Email
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 py-1 px-3 rounded text-white hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Trending Project */}
          {trendingProject ? (
            <div className="bg-white p-4 rounded-lg shadow mb-6">
              <h4 className="text-xl font-semibold mb-2 text-indigo-700">
                Trending Project: {trendingProject.title}
              </h4>
              <p className="text-sm text-gray-600">
                Views: {trendingProject.stats.views || 0} | Likes:{" "}
                {trendingProject.stats.loves || 0} | Favorites:{" "}
                {trendingProject.stats.favorites || 0}
              </p>
              <a
                href={trendingProject.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 text-sm mt-2 inline-block"
              >
                View Project
              </a>
            </div>
          ) : (
            <p className="text-center text-gray-600 mt-4">
              No trending project available.
            </p>
          )}
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-semibold mb-2">Change Email</h3>
            <input
              type="email"
              placeholder="New Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full mb-3 px-3 py-2 border rounded"
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowEmailModal(false)}
                className="py-1 px-3 rounded bg-gray-300 hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailChange}
                className="py-1 px-3 rounded bg-indigo-600 text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SnapLabsDashboard;
