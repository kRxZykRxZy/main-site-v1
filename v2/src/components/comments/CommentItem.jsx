import React, { useState } from "react";
import ReplyForm from "./ReplyForm";
import { API } from "../../utils/api_base";
import "./comments.css";

const CommentItem = ({ comment, depth = 0, username, projectId, onCommentDeleted }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const displayUsername = comment.user?.username || comment.user || "Anonymous";

  const handleReplySubmit = async (text) => {
    try {
      await API.postReply(projectId, comment.id, text, username);
      setShowReplyForm(false);
    } catch (err) {
      console.error("Reply failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await API.deleteComment(projectId, comment.id);
      if (onCommentDeleted) onCommentDeleted(comment.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="comment-item" style={{ marginLeft: depth * 24 }}>
      <div className="comment-header">
        <span className="comment-user">{displayUsername}</span>
        <span className="comment-date">
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
        </span>
        {/* Show delete button only if the logged-in user is the author */}
        {username === "Admin" && (
          <button className="delete-btn" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>
      <div className="comment-text">{comment.text}</div>

      {username && (
        <button className="reply-btn" onClick={() => setShowReplyForm(!showReplyForm)}>
          Reply
        </button>
      )}

      {showReplyForm && <ReplyForm onSubmit={handleReplySubmit} />}

      {Array.isArray(comment.replies) &&
        comment.replies.map((rep) => (
          <CommentItem
            key={rep.id}
            comment={rep}
            depth={depth + 1}
            username={username}
            projectId={projectId}
            onCommentDeleted={(deletedId) => {
              // Remove deleted reply from state if needed
              comment.replies = comment.replies.filter(r => r.id !== deletedId);
              if (onCommentDeleted) onCommentDeleted(deletedId);
            }}
          />
        ))}
    </div>
  );
};

export default CommentItem;
