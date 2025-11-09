import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import MenuBar from "./components/menu-bar/menu-bar.jsx";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebaseConfig";

const Root = () => {
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUsername(user.displayName || user.email || "User");
      } else {
        setUsername(null);
      }
    });

    return () => unsubscribe(); // cleanup when unmounting
  }, []);

  return (
    <React.StrictMode>
      <MenuBar username={username} />
      <App />
    </React.StrictMode>
  );
};

const root = createRoot(document.getElementById("root"));
root.render(<Root />);
