import React from "react";
import "./projectActions.css";

const Views = ({ count }) => {
  return (
    <button className="action-btn view">
      👁 {count || 0}
    </button>
  );
};

export default Views;
