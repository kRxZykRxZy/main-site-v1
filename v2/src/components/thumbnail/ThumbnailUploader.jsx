import React, { useState } from "react";
import { API } from "../../utils/api_base";
import "./thumbnail.css";

const ThumbnailUploader = ({ projectId, onUpload }) => {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await API.uploadThumbnail(projectId, file);
      if (!res.success) alert("Thumbnail upload failed");
      else onUpload && onUpload();
    } catch (err) {
      console.error("Thumbnail upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="thumbnail-uploader mb-4">
      <label className="block text-sm font-medium text-gray-700">Upload Thumbnail</label>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <span className="uploading-text">Uploading...</span>}
    </div>
  );
};

export default ThumbnailUploader;
