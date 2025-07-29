import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { UPLOAD_API_URL } from "../api/urls";

export default function Docs({
  id,
  can_upload = true,
  can_delete = true,
  can_view = true,
  folder_name,
  prefix,
}) {
  const fileInputRef = useRef(null);
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function doFetch() {
      try {
        const res = await axios.get(`${UPLOAD_API_URL}/${id}`, {
          withCredentials: true,
        });
        setUploadedFiles(res.data);
      } catch (err) {
        console.error("Fetch error:", err.message);
      }
    }

    doFetch();
    const listener = () => doFetch();
    window.addEventListener(`docs-updated-${id}`, listener);
    return () => window.removeEventListener(`docs-updated-${id}`, listener);
  }, [id]);

  const uploadFiles = async () => {
    if (!files.length || !can_upload) return;

    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    formData.append("folder_name", folder_name || "doc");
    formData.append("prefix", prefix || "");

    try {
      setUploading(true);
      await axios.post(`${UPLOAD_API_URL}/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = null;
      window.dispatchEvent(new Event(`docs-updated-${id}`));
    } catch (err) {
      console.error("Upload error:", err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (public_id) => {
    if (!can_delete) return;

    try {
      setDeleting(true);
      await axios.delete(`${UPLOAD_API_URL}/${public_id}`, {
        withCredentials: true,
      });
      setUploadedFiles((prev) => prev.filter((f) => f.public_id !== public_id));
      window.dispatchEvent(new Event(`docs-updated-${id}`));
    } catch (err) {
      console.error("Delete error:", err.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="docs-container">
      {can_upload && (
        <div>
          <input
            type="file"
            multiple
            accept="image/*,application/pdf"
            onChange={(e) => setFiles(Array.from(e.target.files))}
            ref={fileInputRef}
          />
          <button onClick={uploadFiles} disabled={uploading || !files.length}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      )}
      {can_view && (
        <ul>
          {uploadedFiles.map((file) => (
            <li key={file.public_id}>
              <span>
                {file.format === "pdf" && "📄"}
                {["jpg", "jpeg", "png"].includes(file.format) && "🖼️"}
                {file.format === "docx" && "📃"}
              </span>{" "}
              <a
                href={file.secure_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <small>
                  <b>{file.filename}</b>
                </small>
              </a>
              {can_delete && (
                <button
                  onClick={() => deleteFile(encodeURIComponent(file.public_id))}
                  disabled={deleting}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
