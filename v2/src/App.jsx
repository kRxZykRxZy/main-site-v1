import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import EditorPageWrapper from "./pages/EditorPage";
import ProjectPage from "./pages/ProjectPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage username="guest"/>} />
        <Route path="/projects/:id/editor" element={<EditorPageWrapper username="guest"/>} />
        <Route path="/projects/:id" element={<ProjectPage username="guest"/>} />
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
