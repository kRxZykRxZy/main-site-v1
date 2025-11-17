import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";

// Components
import { fetchProjectMeta } from "../components/projectMeta/fetchProjectMeta";
import ProjectMetaEditor from "../components/projectMeta/ProjectMetaEditor";
import ProjectMetaDisplay from "../components/projectMeta/ProjectMetaDisplay";

import Likes from "../components/projectActions/Likes";
import Views from "../components/projectActions/Views";
import Favourites from "../components/projectActions/Favourites";
import RemixButton from "../components/projectActions/RemixButton";
import SeeInsideButton from "../components/projectActions/SeeInsideButton";
import ShareButton from "../components/projectActions/ShareButton";
import UnshareButton from "../components/projectActions/UnshareButton";

import ThumbnailUploader from "../components/thumbnail/ThumbnailUploader";
import ProjectIframe from "../components/iframe/ProjectIframe";

import CommentList from "../components/comments/CommentList";
import CommentForm from "../components/comments/CommentForm";

import ErrorDisplay from "../components/layout/ErrorDisplay";
import LoadingSpinner from "../components/layout/LoadingSpinner";

import { API } from "../utils/api_base";

const ProjectPage = ({ username: propUsername, isAdmin }) => {
  const { id: projectId } = useParams();
  const [projectMeta, setProjectMeta] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingMeta, setLoadingMeta] = useState(true);
  const [loadingComments, setLoadingComments] = useState(true);
  const [error, setError] = useState(null);

  const currentUsername = propUsername;
  const isAuthor = isAdmin || projectMeta?.author?.username === currentUsername;

  /** --- Fetch Project Meta --- **/
  const loadProjectMeta = async () => {
    await fetchProjectMeta(projectId, currentUsername, setProjectMeta, setError, setLoadingMeta);
  };

  /** --- Fetch Comments --- **/
  const loadComments = async () => {
    setLoadingComments(true);
    try {
      const data = await API.fetchComments(projectId);
      setComments(Array.isArray(data) ? data.slice().reverse() : []);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      setComments([]);
    } finally {
      setLoadingComments(false);
    }
  };

  /** --- Handle comment deletion --- **/
  const handleCommentDeleted = (deletedId) => {
    // Remove comment or reply from state recursively
    const removeById = (items, id) => {
      return items
        .filter(item => item.id !== id)
        .map(item => ({
          ...item,
          replies: item.replies ? removeById(item.replies, id) : []
        }));
    };
    setComments(prev => removeById(prev, deletedId));
  };

  /** --- Initial load and post view --- **/
  useEffect(() => {
    if (!projectId) return;

    loadProjectMeta();
    loadComments();

    if (currentUsername) {
      API.postView(projectId, currentUsername).catch(console.error);
    }
  }, [projectId, currentUsername]);

  /** --- Iframe source --- **/
  const iframeSrc = useMemo(() => {
    return `https://myscratchblocks.github.io/scratch-gui/embed#${projectId}?username=${currentUsername}`;
  }, [projectId, currentUsername]);

  if (error) return <ErrorDisplay error="Failed to load project" details={error} />;
  if (loadingMeta) return <LoadingSpinner />;
  if (!projectMeta) return <ErrorDisplay error="Project not found or unavailable" />;

  return (
    <div className="container mx-auto p-4">
      {/* Project Meta */}
      {isAuthor ? (
        <ProjectMetaEditor projectMeta={projectMeta} setProjectMeta={setProjectMeta} />
      ) : (
        <ProjectMetaDisplay projectMeta={projectMeta} />
      )}

      {/* Thumbnail uploader */}
      {isAuthor && (
        <ThumbnailUploader
          projectId={projectId}
          onUpload={loadProjectMeta}
        />
      )}

      {/* Scratch project iframe */}
      <ProjectIframe src={iframeSrc} title={projectMeta.title} />

      {/* Project Actions */}
      <div className="flex space-x-3 mt-3 flex-wrap">
        <Views count={projectMeta.stats?.views} />
        <Likes count={projectMeta.stats?.loves} projectId={projectId} username={currentUsername} />
        <Favourites count={projectMeta.stats?.favorites} projectId={projectId} username={currentUsername} />
        <RemixButton projectId={projectId} username={currentUsername} />
        <SeeInsideButton projectId={projectId} />
        {isAuthor && (
          projectMeta.visibility === "visible" ? (
            <UnshareButton projectId={projectId} />
          ) : (
            <ShareButton projectId={projectId} />
          )
        )}
      </div>

      {/* Comments */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Comments</h2>
        {currentUsername && (
          <CommentForm
            projectId={projectId}
            username={currentUsername}
            onCommentPosted={loadComments}
          />
        )}
        {loadingComments ? (
          <LoadingSpinner />
        ) : (
          <CommentList
            comments={comments}
            projectId={projectId}
            username={currentUsername}
            onCommentDeleted={handleCommentDeleted} // pass deletion callback
          />
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
