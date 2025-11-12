import React, { useState } from "react";
import { API } from "../../utils/api_base";
import "./projectActions.css";

const Likes = ({ count: initialCount, projectId, username }) => {
  const [count, setCount] = useState(initialCount || 0);

  const handleLike = async () => {
    if (!username) return alert("Log in to like this project");
    try {
      await API.postLove(projectId, username);
      setCount((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to like:", err);
    }
  };

  return (
    <button className="action-btn like" onClick={handleLike}>
      ❤️ {count || 0}
    </button>
  );
};

export default Likes;
