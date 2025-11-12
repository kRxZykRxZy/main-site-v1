import React, { useState } from "react";
import { API } from "../../utils/api_base";
import "./projectActions.css";

const ShareButton = ({ projectId }) => {
  const [loading, setLoading] = useState(false);

  const handleShare = async () => {
    setLoading(true);
    try {
      await API.shareProject(projectId);
      window.location.reload();
    } catch (err) {
      console.error("Share failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button className="action-btn share" onClick={handleShare} disabled={loading}>
      {loading ? "Sharing..." : "Share"}
    </button>
  );
};

export default ShareButton;
