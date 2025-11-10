import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import EditorPageWrapper from "./pages/EditorPage";
import ProjectPage from "./pages/ProjectPage";
import SiteAuth from "./pages/SiteAuth"; // renamed to match convention
import Ai from "./pages/AIAssistant";
import CP from "./pages/CommunityProjects";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig"; // import from your firebase setup

const App = () => {
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email || null);
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
        Loading...
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
          element={<ProjectPage username={username} />}
        />
        <Route path="/account" element={<SiteAuth />} />
        <Route path="/community-projects" element={<CP />} />
        <Route path="/AI-Assistant" element={<Ai />} />
        <Route
          path="*"
          element={
            <h1 className="text-center mt-20 text-2xl">404! Page Not Found! Be Careful Someone Might Be Trying To Steal Your Projects!</h1>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
