import React, { useState } from "react";
import "./comments.css";

const ReplyForm = ({ onSubmit }) => {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSubmit(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="reply-form mt-2">
      <textarea
        className="reply-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your reply..."
        required
      />
      <button type="submit" className="reply-submit-btn">
        Post Reply
      </button>
    </form>
  );
};

export default ReplyForm;
