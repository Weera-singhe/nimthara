import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { UPLOAD_API_URL } from "../api/urls";
import MyFormBox from "./MyFormBox";
import NoteAddOutlinedIcon from "@mui/icons-material/NoteAddOutlined";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";

import {
  CircularProgress,
  TextField,
  Box,
  IconButton,
  Chip,
  Button,
  Typography,
} from "@mui/material";

export default function DocUpload({
  located_id,
  can_upload = false,
  can_delete = false,
  can_view = false,
  folder_name,
  prefix,
  label,
}) {
  const fileInputRef = useRef(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [renamedAs, setRenamedAs] = useState("");

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await axios.get(`${UPLOAD_API_URL}/${located_id}`, {
          withCredentials: true,
        });
        setUploadedFiles(res.data);
      } catch (err) {
        console.log("Error loading uploaded files:", err);
      }
    }
    fetchFiles();
  }, [located_id]);

  const uploadFiles = async () => {
    setUploading(true);

    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append("files", f));
      formData.append("folder_name", folder_name || "doc");
      formData.append("prefix", prefix || "");
      formData.append("renamedAs", renamedAs);

      const res = await axios.post(
        `${UPLOAD_API_URL}/${located_id}`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );
      setSelectedFiles([]);
      setRenamedAs("");
      if (res.data?.success) {
        setUploadedFiles(res.data?.uploads);
      }
    } catch (err) {
      console.log("Error uploading files:", err);
    } finally {
      setUploading(false);
    }
  };

  const deleteFile = async (file) => {
    setDeleting(true);
    try {
      const res = await axios.delete(`${UPLOAD_API_URL}/${file?.doc_id}`, {
        withCredentials: true,
      });
      if (res.data?.success) {
        setUploadedFiles(res.data?.uploads);
      }
    } catch (err) {
      console.error("Delete error:", err.message);
    } finally {
      setDeleting(false);
    }
  };
  const canUpload = !uploading && selectedFiles.length && can_upload;

  return (
    <MyFormBox
      buttonType="Upload"
      label={label}
      clickable={canUpload}
      onPress={uploadFiles}
    >
      {can_upload && (
        <>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* Hidden real input */}
            <input
              style={{ display: "none" }}
              type="file"
              multiple
              accept="image/*,application/pdf"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files))}
              ref={fileInputRef}
            />

            {/* Icon button that opens file picker */}
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              color="primary"
            >
              <NoteAddOutlinedIcon />
            </IconButton>

            {/* Show selected file(s) */}
            <Box
              sx={{
                border: "1px solid grey",
                p: 1,
                borderRadius: 1,
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {selectedFiles.length === 0 ? (
                <Typography variant="caption">no file selected </Typography>
              ) : (
                selectedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={
                      renamedAs
                        ? `${prefix ? prefix + "_" : ""}${renamedAs}`
                        : `${prefix ? prefix + "_" : ""}${file.name}`
                    }
                    size="small"
                    sx={{ maxWidth: 150 }}
                  />
                ))
              )}
            </Box>
            <TextField
              label="Rename"
              variant="outlined"
              size="small"
              value={renamedAs}
              onChange={(e) => {
                let val = e.target.value;
                // Remove leading spaces
                val = val.replace(/^\s+/, "");
                // Convert to uppercase automatically
                val = val.toUpperCase();
                // Allow only A-Z, 0-9, and underscore
                val = val.replace(/[^A-Z0-9_]/g, "");
                setRenamedAs(val);
              }}
            />
          </Box>
          {uploading && (
            <Button loading={true} loadingPosition="end">
              Uploading...
            </Button>
          )}
          {uploadedFiles.length && can_view ? (
            <Box sx={{ width: "100%" }} />
          ) : (
            <></>
          )}
        </>
      )}
      {can_view && (
        <ul>
          {uploadedFiles.map((file) => (
            <li key={file.doc_id}>
              <span>
                {file.format === "pdf" && "📄"}
                {["jpg", "jpeg", "png", "ai"].includes(file.format) && "🖼️"}
                {file.format === "docx" && "📃"}
              </span>{" "}
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <small>
                  <b>{`${file.filename}.${file.format}`}</b>
                </small>
              </a>
              {can_delete && (
                <IconButton
                  onClick={() => deleteFile(file)}
                  disabled={deleting}
                >
                  {deleting ? (
                    <CircularProgress size={18} />
                  ) : (
                    <DeleteRoundedIcon sx={{ fontSize: 18 }} />
                  )}
                </IconButton>
              )}
            </li>
          ))}
        </ul>
      )}
    </MyFormBox>
  );
}
