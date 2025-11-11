import React, { useEffect, useState, memo } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import SnapLabsSpinner from "../components/spinner/workspace";

const UserProfile = memo(() => {
  const [iframeSrc, setIframeSrc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const username = user.displayName || null;
        if (username) {
          setIframeSrc(`https://sl-api-v1.onrender.com/users/${username}`);
        } else {
          window.location.href = "/404";
        }
      } else {
        window.location.href = "/404";
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (iframeSrc) {
      const iframe = document.getElementById("snaplabs-iframe");
      iframe.onload = () => setLoading(false);
    }
  }, [iframeSrc]);

  return (
    <div className="font-inter bg-slate-50 text-slate-700 min-h-screen">
      {loading && (
        <SnapLabsSpinner text="Loading Your SnapLabs Workspace..." />
      )}

      {iframeSrc && (
        <iframe
          id="snaplabs-iframe"
          src={iframeSrc}
          title="SnapLabs User Editor"
          className="w-screen h-screen border-none"
        />
      )}
    </div>
  );
});

export default UserProfile;
