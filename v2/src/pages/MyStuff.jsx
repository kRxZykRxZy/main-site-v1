import React, { useEffect, useState, memo } from "react";

const UserProfile = memo(() => {
  const [iframeSrc, setIframeSrc] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      setIframeSrc(`https://sl-api-v1.onrender.com/users/${username}`);
    } else {
      window.location.href = "/404";
    }
  }, []);

  useEffect(() => {
    if (iframeSrc) {
      const iframe = document.getElementById("snaplabs-iframe");
      iframe.onload = () => setLoading(false);
    }
  }, [iframeSrc]);

  return (
    <div className="font-inter bg-slate-50 text-slate-700 min-h-screen">
      {/* Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 flex flex-col items-center justify-center bg-white z-10">
          <div className="border-4 border-gray-200 border-t-indigo-500 rounded-full w-10 h-10 animate-spin mb-3"></div>
          <span className="text-gray-700 font-medium text-sm">
            Loading your SnapLabs workspace...
          </span>
        </div>
      )}

      {/* Iframe */}
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
