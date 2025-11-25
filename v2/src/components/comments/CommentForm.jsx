import React, { useState } from "react";
import { API } from "../../utils/api_base";
import "./comments.css";

const CommentForm = ({ projectId, username, onCommentPosted }) => {
  const [text, setText] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      const res = await API.postComment(projectId, text, username);
      setText("");
      if (res.error) {
        alert(res.error);
      }
      onCommentPosted && onCommentPosted();
    } catch (err) {
      console.error("Comment failed:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="comment-form mb-4">
      <textarea
        className="comment-textarea"
        placeholder="Write a comment..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        required
      />
      <button type="submit" className="comment-submit-btn">
        Post Comment
      </button>
    </form>
  );
};

export default CommentForm;
