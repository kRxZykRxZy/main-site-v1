import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import EditorPageWrapper from "./pages/EditorPage";
import ProjectPage from "./pages/ProjectPage";
import SiteAuth from "./pages/SiteAuth"; // renamed to match convention
import Ai from "./pages/AIAssistant";
import Cp from "./pages/CommunityProjects";
import MyStuff from "./pages/MyStuff";
import Search from "./pages/SearchPage";
import AdminPanel from "./pages/AdminPanel";
import PP from "./pages/PrivacyPolicy";
import UserPage from "./pages/UserPage";
import Editor from "./pages/EditorFrame";
import LB from "./pages/LeaderBoard";
import Messages from "./pages/Messages";
import Spinner from "./components/spinner/workspace";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig"; // import from your firebase setup

const App = () => {
  const [username, setUsername] = useState(null);
  const [admin, setAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email || null);
        setAdmin(user.customClaims?.admin || false);
      } else {
        setUsername(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl">
        <Spinner text="Loading Your SnapLabs Workspace..." />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage username={username} />} />
        <Route
          path="/projects/:id/editor"
          element={<EditorPageWrapper username={username} />}
        />
        <Route
          path="/projects/:id"
          element={<ProjectPage username={username} isAdmin={admin} />}
        />
        <Route path="/users/:username" element={<UserPage />} />
        <Route path="/search" element={<Search />} />
        <Route path="/account" element={<SiteAuth />} />
        <Route path="/leaderboard" element={<LB />} />
        <Route path="/editor-frame" element={<Editor />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/community-projects" element={<Cp />} />
        <Route path="/AI-Assistant" element={<Ai />} />
        <Route path="/dashboard" element={<MyStuff />} />
        <Route path="/privacy-policy" element={<PP />} />
        <Route path="/admin/dashboard" element={<AdminPanel />} />
        <Route
          path="*"
          element={
            <h1 className="text-center mt-20 text-2xl">Page Not Found!</h1>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
