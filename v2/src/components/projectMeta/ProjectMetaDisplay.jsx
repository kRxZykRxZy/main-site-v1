import React from "react";
import "./projectMeta.css";

/**
 * Display-only component for project metadata
 * @param {object} projectMeta
 */
const ProjectMetaDisplay = ({ projectMeta }) => {
  return (
    <div className="project-meta-display mb-4 text-center">
      <h1 className="project-title-display">{projectMeta.title}</h1>
      <p className="project-desc-display">{projectMeta.description}</p>
      <p className="project-author-display text-gray-500 mt-1">
        By {projectMeta.author?.username || "Unknown"}
      </p>
    </div>
  );
};

export default ProjectMetaDisplay;
