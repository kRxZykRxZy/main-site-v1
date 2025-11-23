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
      window.location.reload();
      setShowReplyForm(false);
    } catch (err) {
      console.error("Reply failed:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this comment?")) return;

    try {
      await API.deleteComment(projectId, comment.id);
      window.location.reload();
      if (onCommentDeleted) onCommentDeleted(comment.id);
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  return (
    <div className="comment-item" style={{ marginLeft: depth * 24 }}>
      <div className="comment-header flex items-center space-x-2">
        {/* Profile picture */}
        <img
          src={`https://sl-api-v1.onrender.com/users/${displayUsername}/image`}
          alt={displayUsername}
          className="w-6 h-6 rounded-full object-cover"
        />
        <a href="/users/{displayUsername}">
          <span className="comment-user font-semibold">{displayUsername}</span>
        </a>
        <span className="comment-date text-gray-500 text-sm">
          {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ""}
        </span>

        {/* Delete button only if logged-in user is the author */}
        {username === "Admin" && (
          <button className="delete-btn ml-auto" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      <div className="comment-text mt-1">{comment.text}</div>

      {username && (
        <button className="reply-btn mt-1 text-sm text-indigo-600 hover:underline" onClick={() => setShowReplyForm(!showReplyForm)}>
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
              comment.replies = comment.replies.filter((r) => r.id !== deletedId);
              if (onCommentDeleted) onCommentDeleted(deletedId);
            }}
          />
        ))}
    </div>
  );
};

export default CommentItem;
