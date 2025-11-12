import React from "react";
import "./projectActions.css";

const SeeInsideButton = ({ projectId }) => {
  const handleSeeInside = () => {
    window.location.href = `/projects/${projectId}/editor`;
  };

  return (
    <button className="action-btn see-inside" onClick={handleSeeInside}>
      🔍 See Inside
    </button>
  );
};

export default SeeInsideButton;
