import { useState, useRef } from "react";
import { googleDriveService } from "../../libs/googleDriveService";

const FileUpload = ({
  onFileUpload,
  uploadedFiles = [],
  onFileRemove,
  disabled = false,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);

  const acceptedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const maxFiles = 10;

  const validateFile = (file) => {
    const errors = [];

    if (!acceptedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not supported`);
    }

    if (file.size > maxFileSize) {
      errors.push(`File size must be less than ${formatFileSize(maxFileSize)}`);
    }

    return errors;
  };

  const formatFileSize = (bytes) => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const getFileIcon = (file) => {
    const type = file.type || file.mime_type;
    if (!type) return "📄";

    if (type.startsWith("image/")) return "🖼️";
    if (type.includes("pdf")) return "📕";
    if (type.includes("word") || type.includes("document")) return "📘";
    if (type.includes("sheet") || type.includes("excel")) return "📗";
    if (type.includes("presentation") || type.includes("powerpoint"))
      return "📙";

    return "📄";
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Reset input value to allow selecting the same file again
    e.target.value = "";
  };

  const handleFiles = async (files) => {
    if (uploadedFiles.length + files.length > maxFiles) {
      alert(`You can only upload up to ${maxFiles} files`);
      return;
    }

    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      const fileErrors = validateFile(file);
      if (fileErrors.length === 0) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${fileErrors.join(", ")}`);
      }
    });

    if (errors.length > 0) {
      alert("Some files could not be uploaded:\n" + errors.join("\n"));
    }

    if (validFiles.length === 0) return;

    // Start uploading files
    const uploadPromises = validFiles.map((file) => uploadFile(file));

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result) => result.data);

      if (successfulUploads.length > 0) {
        onFileUpload(successfulUploads.map((result) => result.data));
      }

      const failedUploads = results.filter((result) => result.error);
      if (failedUploads.length > 0) {
        alert(`${failedUploads.length} file(s) failed to upload`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
    }
  };

  const uploadFile = async (file) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    setUploading((prev) => [...prev, fileId]);
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: Math.min(prev[fileId] + Math.random() * 30, 90),
        }));
      }, 200);

      // Use mock upload for development
      const result = await googleDriveService.mockUpload(
        file,
        "temp-expense-id"
      );

      clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

      // Clean up after a short delay
      setTimeout(() => {
        setUploading((prev) => prev.filter((id) => id !== fileId));
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);

      return result;
    } catch (error) {
      setUploading((prev) => prev.filter((id) => id !== fileId));
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
      return { data: null, error: error.message };
    }
  };

  const handleRemoveFile = (index) => {
    onFileRemove(index);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="file-upload-container">
      {/* Upload Area */}
      <div
        className={`file-upload-dropzone ${isDragging ? "dragging" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={handleFileSelect}
          className="file-input-hidden"
          disabled={disabled}
        />

        <div className="dropzone-content">
          <div className="upload-icon">📁</div>
          <div className="upload-text">
            <p className="md-typescale-body-medium upload-main-text">
              {isDragging
                ? "Drop files here to upload"
                : "Drag & drop files here, or click to select"}
            </p>
            <p className="md-typescale-body-small upload-help-text">
              Supports: Images, PDF, Word, Excel documents (max{" "}
              {formatFileSize(maxFileSize)} each)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading.length > 0 && (
        <div className="upload-progress-section">
          <h4 className="md-typescale-title-small">Uploading...</h4>
          {uploading.map((fileId) => (
            <div key={fileId} className="upload-progress-item">
              <div className="progress-info">
                <span className="md-typescale-body-small">
                  Uploading file...
                </span>
                <span className="md-typescale-body-small">
                  {Math.round(uploadProgress[fileId] || 0)}%
                </span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${uploadProgress[fileId] || 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="uploaded-files-section">
          <h4 className="md-typescale-title-small">
            Uploaded Files ({uploadedFiles.length}/{maxFiles})
          </h4>
          <div className="uploaded-files-list">
            {uploadedFiles.map((file, index) => (
              <div key={index} className="uploaded-file-item">
                <div className="file-icon">{getFileIcon(file)}</div>
                <div className="file-info">
                  <span className="file-name md-typescale-body-medium">
                    {file.file_name || file.name}
                  </span>
                  <div className="file-meta">
                    {(file.file_size || file.size) && (
                      <span className="file-size md-typescale-body-small">
                        {formatFileSize(file.file_size || file.size)}
                      </span>
                    )}
                    {file.google_drive_url && (
                      <button
                        className="file-view-button"
                        onClick={() =>
                          window.open(file.google_drive_url, "_blank")
                        }
                        title="View file"
                      >
                        👁️
                      </button>
                    )}
                  </div>
                </div>
                <button
                  className="file-remove-button"
                  onClick={() => handleRemoveFile(index)}
                  disabled={disabled}
                  title="Remove file"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Limits Info */}
      <div className="upload-limits-info">
        <p className="md-typescale-body-small upload-limits-text">
          • Maximum {maxFiles} files per expense • Maximum{" "}
          {formatFileSize(maxFileSize)} per file • Files are stored securely in
          Google Drive
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
