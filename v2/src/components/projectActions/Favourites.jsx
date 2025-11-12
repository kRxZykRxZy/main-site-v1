import React, { useState } from "react";
import { API } from "../../utils/api_base";
import "./projectActions.css";

const Favourites = ({ count: initialCount, projectId, username }) => {
  const [count, setCount] = useState(initialCount || 0);

  const handleFavourite = async () => {
    if (!username) return alert("Log in to favourite this project");
    try {
      await API.postFavourite(projectId, username);
      setCount((prev) => prev + 1);
    } catch (err) {
      console.error("Failed to favourite:", err);
    }
  };

  return (
    <button className="action-btn favourite" onClick={handleFavourite}>
      ⭐ {count || 0}
    </button>
  );
};

export default Favourites;
