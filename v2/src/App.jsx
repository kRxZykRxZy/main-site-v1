import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import EditorPageWrapper from "./pages/EditorPage";
import ProjectPage from "./pages/ProjectPage";

const App = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("https://sl-api-v1.onrender.com/session", {
          method: "GET",
          credentials: "include", // send cookies for auth
        });

        if (!res.ok) throw new Error("Failed to fetch session");
        const data = await res.json();
        setUsername(data.username || null);
      } catch (err) {
        console.error("Session fetch error:", err);
        setUsername(null);
      }
    };

    fetchSession();
  }, []);

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
