import React, { useEffect, useState, useRef } from "react";
import { API } from "../../utils/api_base";
import "./projectMeta.css";

const ProjectMetaEditor = ({ projectMeta, setProjectMeta }) => {
  const [title, setTitle] = useState(projectMeta.title || "");
  const [description, setDescription] = useState(projectMeta.description || "");

  const saveTimeout = useRef(null);

  useEffect(() => {
    setTitle(projectMeta.title || "");
    setDescription(projectMeta.description || "");
  }, [projectMeta]);

  const handleChange = (field, value) => {
    if (field === "title") setTitle(value);
    if (field === "description") setDescription(value);

    clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      try {
        await API.updateProjectMeta(projectMeta.id, {
          title,
          description,
        });

        console.log("Project meta auto-saved");

        // Optional: update parent state
        setProjectMeta((prev) => ({
          ...prev,
          title,
          description,
        }));
      } catch (err) {
        console.error("Auto-save failed:", err);
      }
    }, 800);
  };

  return (
    <div className="project-meta-editor mb-4">
      <input
        type="text"
        value={title}
        onChange={(e) => handleChange("title", e.target.value)}
        className="project-title-input"
        placeholder="Project title..."
      />
      <textarea
        value={description}
        onChange={(e) => handleChange("description", e.target.value)}
        className="project-desc-input"
        placeholder="Project description..."
      />
    </div>
  );
};

export default ProjectMetaEditor;
