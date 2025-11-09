import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import currentUsername from "../components/username/username";

const BASE_URL = "https://sl-api-v1.onrender.com";

const ProjectPage = ({ username: propUsername }) => {
  const { id: projectId } = useParams();
  const [projectMeta, setProjectMeta] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState("");

  /** --- Fetch Project Metadata --- **/
  const fetchMeta = async () => {
    setLoadingMeta(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/projects/${projectId}/meta/${currentUsername || "guest"}`
      );
      const data = await res.json();
      setProjectMeta(data);
    } catch (err) {
      console.error("Error fetching project meta:", err);
    } finally {
      setLoadingMeta(false);
    }
  };

  /** --- Fetch Comments --- **/
  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const res = await fetch(`${BASE_URL}/${projectId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    } finally {
      setLoadingComments(false);
    }
  };

  /** --- Post Top-Level Comment --- **/
  const postComment = async (text) => {
    if (!currentUsername) return alert("You must be logged in to comment");
    try {
      const res = await fetch(`${BASE_URL}/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, user: { username: currentUsername } }),
      });
      if (res.ok) {
        setCommentText("");
        await fetchComments();
      } else {
        alert((await res.json()).error || "Failed to post comment");
      }
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Post Reply --- **/
  const postReply = async (commentId, text) => {
    if (!currentUsername) return alert("You must be logged in to reply");
    try {
      const res = await fetch(`${BASE_URL}/${projectId}/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, user: { username: currentUsername } }),
      });
      if (res.ok) await fetchComments();
      else alert((await res.json()).error || "Failed to post reply");
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Like / Favorite / Remix --- **/
  const handleLike = async () => {
    if (!currentUsername) return alert("Log in to like this project");
    try {
      await fetch(`${BASE_URL}/api/projects/${projectId}/love/${currentUsername}`, {
        method: "POST",
        headers: { Authorization: currentUsername },
      });
      fetchMeta();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFavorite = async () => {
    if (!currentUsername) return alert("Log in to favorite this project");
    try {
      await fetch(`${BASE_URL}/api/projects/${projectId}/favourite/${currentUsername}`, {
        method: "POST",
        headers: { Authorization: currentUsername },
      });
      fetchMeta();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemix = () => {
    if (!currentUsername) return alert("Log in to remix this project");
    window.location.href = `/projects/1/editor/?remix=${projectId}`;
  };

  const handleSeeInside = () => {
    window.location.href = `/projects/${projectId}/editor`;
  };

  /** --- Recursive Comment Component --- **/
  const CommentItem = ({ comment, depth = 0 }) => {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [replyText, setReplyText] = useState("");

    const handleReplySubmit = async (e) => {
      e.preventDefault();
      if (!replyText.trim()) return;
      await postReply(comment.id, replyText);
      setReplyText("");
      setShowReplyForm(false);
    };

    return (
      <div style={{ marginLeft: depth * 24 }} className="comment-item bg-gray-100 p-3 rounded mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span className="font-semibold text-blue-700">{comment.user}</span>
          <span className="text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
        </div>
        <div className="text-gray-800">{comment.text}</div>
        {currentUsername && (
          <button
            className="text-blue-500 hover:underline text-sm mt-1"
            onClick={() => setShowReplyForm(!showReplyForm)}
          >
            Reply
          </button>
        )}
        {showReplyForm && (
          <form onSubmit={handleReplySubmit} className="mt-2">
            <textarea
              className="w-full p-2 border rounded"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              required
            />
            <button type="submit" className="mt-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              Post Reply
            </button>
          </form>
        )}
        {comment.replies && comment.replies.map((rep) => (
          <CommentItem key={rep.id} comment={rep} depth={depth + 1} />
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchMeta();
    fetchComments();
  }, [projectId, currentUsername]);

  return (
    <div className="container mx-auto p-4">
      {loadingMeta ? (
        <p>Loading project...</p>
      ) : (
        <div>
          <h1 className="text-3xl font-bold">{projectMeta?.title || "Untitled Project"}</h1>

          {/* Improved Scratch-style iframe */}
          <div className="mt-4 flex justify-center">
            <div
              className="w-[80vw] max-w-[1200px] aspect-[4/3] shadow-lg rounded-lg overflow-hidden"
              style={{ minHeight: "360px" }}
            >
              <iframe
                src={`https://myscratchblocks.github.io/scratch-gui/embed#${projectId}?username=${currentUsername}`}
                className="w-full h-full"
                frameBorder="0"
                allowFullScreen
                title={projectMeta?.title || "Scratch Project"}
              ></iframe>
            </div>
          </div>

          <p className="mt-2 text-gray-700">{projectMeta?.description || "No description."}</p>
          <p className="mt-1 text-sm text-gray-500">By {projectMeta?.author?.username || "Unknown"}</p>

          <div className="flex space-x-3 mt-3">
            <button onClick={handleLike} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              ❤️ {projectMeta?.stats?.loves || 0}
            </button>
            <button onClick={handleFavorite} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              ⭐ {projectMeta?.stats?.favorites || 0}
            </button>
            <button onClick={handleRemix} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
              Remix
            </button>
            <button onClick={handleSeeInside} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              See Inside
            </button>
          </div>
        </div>
      )}

      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Comments</h2>
        {currentUsername && (
          <form onSubmit={(e) => { e.preventDefault(); postComment(commentText); }} className="mb-4">
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 border rounded"
              required
            />
            <button type="submit" className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              Post Comment
            </button>
          </form>
        )}

        {loadingComments ? (
          <p>Loading comments...</p>
        ) : comments.length === 0 ? (
          <p>No comments yet.</p>
        ) : (
          comments.map((c) => <CommentItem key={c.id} comment={c} />)
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
