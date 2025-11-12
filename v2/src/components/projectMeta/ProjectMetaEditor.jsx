import React, { useEffect, useRef } from "react";
import { API } from "../../utils/api_base";
import "./projectMeta.css";

const ProjectMetaEditor = ({ projectMeta, setProjectMeta }) => {
  const titleRef = useRef(projectMeta.title || "");
  const descRef = useRef(projectMeta.description || "");
  const saveTimeout = useRef(null);

  useEffect(() => {
    titleRef.current = projectMeta.title || "";
    descRef.current = projectMeta.description || "";
  }, [projectMeta]);

  const handleChange = (field, value) => {
    if (field === "title") titleRef.current = value;
    if (field === "description") descRef.current = value;

    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await API.updateProjectMeta(projectMeta.id, {
          title: titleRef.current,
          description: descRef.current,
        });
        console.log("Project meta auto-saved");
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 800);
  };

  return (
    <div className="project-meta-editor mb-4">
      <input
        type="text"
        value={titleRef.current}
        onChange={(e) => handleChange("title", e.target.value)}
        className="project-title-input"
        placeholder="Project title..."
      />
      <textarea
        value={descRef.current}
        onChange={(e) => handleChange("description", e.target.value)}
        className="project-desc-input"
        placeholder="Project description..."
      />
    </div>
  );
};

export default ProjectMetaEditor;
