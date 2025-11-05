import React from "react";
import App from "./App";
import ReactDOM from "react-dom";

// Using React.createElement instead of JSX
const appElement = React.createElement(App, null, null);

// Rendering to the root element
ReactDOM.render(appElement, document.getElementById("root"));
