import React, { useState } from "react";
import { API } from "../../utils/api_base";
import "./projectActions.css";

const UnshareButton = ({ projectId }) => {
  const [loading, setLoading] = useState(false);

  const handleUnshare = async () => {
    setLoading(true);
    try {
      await API.unshareProject(projectId);
      // Reload the whole page so the share button appears
      window.location.reload();
    } catch (err) {
      console.error("Unshare failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="action-btn unshare"
      onClick={handleUnshare}
      disabled={loading}
    >
      {loading ? "Unsharing..." : "Unshare"}
    </button>
  );
};

export default UnshareButton;
