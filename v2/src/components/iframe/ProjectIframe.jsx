import React from "react";
import "./iframe.css";

const ProjectIframe = ({ src, title }) => {
  return (
    <div className="iframe-wrapper mt-4 flex justify-center">
      <div className="iframe-container">
        <iframe
          src={src}
          className="iframe-content"
          frameBorder="0"
          allowFullScreen
          title={title || "Scratch Project"}
        />
      </div>
    </div>
  );
};

export default ProjectIframe;
