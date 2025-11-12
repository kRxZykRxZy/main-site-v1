import React from "react";
import "./projectActions.css";

const RemixButton = ({ projectId, username }) => {
  const handleRemix = () => {
    if (!username) return alert("Log in to remix this project");
    window.location.href = `/projects/0/editor/?remix=${projectId}`;
  };

  return (
    <button className="action-btn remix" onClick={handleRemix}>
      🔁 Remix
    </button>
  );
};

export default RemixButton;
