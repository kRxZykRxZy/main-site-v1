import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// Get the root DOM node
const rootElement = document.getElementById("root");

// Create the React root
const root = createRoot(rootElement);

// Render the App component
root.render(App);
