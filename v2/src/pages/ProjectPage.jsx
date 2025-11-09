import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const BASE_URL = "https://sl-api-v1.onrender.com";

const ProjectPage = ({ username: propUsername }) => {
  const { id: projectId } = useParams();
  const [projectMeta, setProjectMeta] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const currentUsername = propUsername;
  const saveTimeout = useRef(null);

  const isAuthor = projectMeta?.author?.username === currentUsername;

  /** --- Fetch Project Metadata --- **/
  const fetchMeta = async () => {
    setLoadingMeta(true);
    try {
      const res = await fetch(
        `${BASE_URL}/api/projects/${projectId}/meta/${currentUsername || "guest"}`
      );
      const data = await res.json();
      setProjectMeta(data);
      setTitleInput(data.title || "");
      setDescriptionInput(data.description || "");
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
      const res = await fetch(`${BASE_URL}/api/projects/${projectId}/comments`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  /** --- Auto-save Metadata --- **/
  const saveMeta = async (title, description) => {
    try {
      await fetch(`${BASE_URL}/api/projects/${projectId}/meta`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      });
      await fetchMeta();
    } catch (err) {
      console.error("Auto-save metadata error:", err);
    }
  };

  const handleTitleChange = (e) => {
    const value = e.target.value;
    setTitleInput(value);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveMeta(value, descriptionInput), 800);
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescriptionInput(value);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => saveMeta(titleInput, value), 800);
  };

  /** --- Thumbnail Upload --- **/
  const handleThumbnailChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setThumbnailFile(file);
    setUploadingThumbnail(true);

    try {
      const res = await fetch(`${BASE_URL}/api/upload/${projectId}`, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const data = await res.json();
      if (!data.success) alert("Thumbnail upload failed");
      await fetchMeta();
    } catch (err) {
      console.error("Thumbnail upload error:", err);
    } finally {
      setUploadingThumbnail(false);
    }
  };

  /** --- Comments & Replies --- **/
  const postComment = async (text) => {
    if (!currentUsername || !text.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${projectId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, user: { username: currentUsername } }),
      });
      if (res.ok) {
        setCommentText("");
        await fetchComments();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const postReply = async (commentId, text) => {
    if (!currentUsername || !text.trim()) return;
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${projectId}/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, user: { username: currentUsername } }),
      });
      if (res.ok) await fetchComments();
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Like / Favorite --- **/
  const handleAction = async (action) => {
    if (!currentUsername) return alert(`Log in to ${action} this project`);
    try {
      const res = await fetch(`${BASE_URL}/api/projects/${projectId}/${action}/${currentUsername}`, {
        method: "POST",
      });
      if (res.ok) await fetchMeta();
    } catch (err) {
      console.error(err);
    }
  };

  /** --- Remix / See Inside --- **/
  const handleRemix = () => {
    if (!currentUsername) return alert("Log in to remix this project");
    window.location.href = `/projects/0/editor/?remix=${projectId}`;
  };

  const handleSeeInside = () => {
    window.location.href = `/projects/${projectId}/editor`;
  };

  /** --- Share / Unshare --- **/
  const handleShare = async () => {
    try {
      await fetch(`${BASE_URL}/api/share/${projectId}`, { method: "PUT" });
      await fetchMeta();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUnshare = async () => {
    try {
      await fetch(`${BASE_URL}/api/unshare/${projectId}`, { method: "PUT" });
      await fetchMeta();
    } catch (err) {
      console.error(err);
    }
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
        {comment.replies?.map((rep) => (
          <CommentItem key={rep.id} comment={rep} depth={depth + 1} />
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetchMeta();
    fetchComments();

    if (currentUsername) {
      fetch(`${BASE_URL}/api/${projectId}/views/${currentUsername}`, { method: "POST" }).catch(console.error);
    }
  }, [projectId, currentUsername]);

  if (loadingMeta || !projectMeta) return <p>Loading project...</p>;

  return (
    <div className="container mx-auto p-4">
      {loadingMeta ? (
        <p>Loading project...</p>
      ) : (
        <div>
          {/* Title input only for author */}
          {isAuthor ? (
            <input
              value={titleInput}
              onChange={handleTitleChange}
              className="w-full text-3xl font-bold border-b-2 border-gray-300 mb-2 p-1"
            />
          ) : (
            <h1 className="text-3xl font-bold mb-2">{projectMeta.title}</h1>
          )}

          {/* Description editable only for author */}
          {isAuthor ? (
            <textarea
              value={descriptionInput}
              onChange={handleDescriptionChange}
              className="w-full p-2 border rounded mb-2"
              placeholder="Project description..."
            />
          ) : (
            <p className="text-gray-700 mb-2">{projectMeta.description}</p>
          )}

          <p className="mt-1 text-sm text-gray-500">By {projectMeta.author?.username || "Unknown"}</p>

          {/* Thumbnail upload only for author */}
          {isAuthor && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Project Thumbnail:</label>
              <input type="file" accept="image/*" onChange={handleThumbnailChange} disabled={uploadingThumbnail} />
              {uploadingThumbnail && <span className="ml-2 text-gray-500">Uploading...</span>}
            </div>
          )}

          {/* Scratch project iframe */}
          {!loadingMeta && projectMeta && (
            <div className="mt-4 flex justify-center">
              <div className="w-[80vw] max-w-[1200px] aspect-[4/3] shadow-lg rounded-lg overflow-hidden" style={{ minHeight: "360px" }}>
                <iframe
                  src={`https://myscratchblocks.github.io/scratch-gui/embed#${projectId}?username=${currentUsername}`}
                  className="w-full h-full"
                  frameBorder="0"
                  allowFullScreen
                  title={projectMeta.title || "Scratch Project"}
                />
              </div>
            </div>
          )} 

          {/* Project actions */}
          <div className="flex space-x-3 mt-3 flex-wrap">
            <button onClick={() => handleAction("love")} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600">
              ❤️ {projectMeta.stats?.loves || 0}
            </button>
            <button onClick={() => handleAction("favourite")} className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600">
              ⭐ {projectMeta.stats?.favorites || 0}
            </button>
            <button onClick={handleRemix} className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600">
              Remix
            </button>
            <button onClick={handleSeeInside} className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
              See Inside
            </button>
            {isAuthor && (
              <>
                <button onClick={handleShare} className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">
                  Share
                </button>
                <button onClick={handleUnshare} className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800">
                  Unshare
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Comments Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Comments</h2>
        {currentUsername && (
          <form
            onSubmit={(e) => { e.preventDefault(); postComment(commentText); }}
            className="mb-4"
          >
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
