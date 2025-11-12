import React from "react";
import CommentItem from "./CommentItem";
import "./comments.css";

/**
 * CommentList renders all comments for a project
 * @param {Array} comments - Array of comment objects
 * @param {string} username - Current logged-in user
 * @param {string} projectId
 */
const CommentList = ({ comments, username, projectId }) => {
  if (!comments || comments.length === 0) return <p>No comments yet.</p>;

  return (
    <div className="comment-list">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} username={username} projectId={projectId} />
      ))}
    </div>
  );
};

export default CommentList;
