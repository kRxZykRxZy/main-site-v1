import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import MenuBar from "./components/menu-bar/menu-bar.jsx";

const rootElement = document.getElementById("root");

const root = createRoot(rootElement);

root.render(
  <React.StrictMode>
    <MenuBar username={window.username} />
    <App />
  </React.StrictMode>
);
