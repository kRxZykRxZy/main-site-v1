import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import EditorPageWrapper from "./pages/EditorPage";
import ProjectPage from "./pages/ProjectPage";
import SnapLabsAuth from "./pages/SiteAuth";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import "./firebaseConfig"; 

const App = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    // Listen to auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // You can get displayName, email, uid, etc.
        setUsername(user.displayName || user.email || null);
      } else {
        setUsername(null);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<MainPage username={username} />}
        />
        <Route
          path="/projects/:id/editor"
          element={<EditorPageWrapper username={username} />}
        />
        <Route
          path="/projects/:id"
          element={<ProjectPage username={username} />}
        />
        <Route 
          path="/account" 
          element={<SiteAuth />} 
        />
        <Route
          path="*"
          element={
            <h1 className="text-center mt-20 text-2xl">Page Not Found</h1>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
