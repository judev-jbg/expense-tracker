import { useState, useRef } from "react";
import { FaCloudArrowUp } from "react-icons/fa6";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoMdImages } from "react-icons/io";
import { FaRegFilePdf, FaRegFileWord, FaRegFileExcel } from "react-icons/fa";

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
      errors.push(`Tipo de archivo ${file.type} no es compatible`);
    }

    if (file.size > maxFileSize) {
      errors.push(
        `El tamaño del archivo debe ser inferior a ${formatFileSize(
          maxFileSize
        )}`
      );
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
    if (!type) return <IoDocumentTextOutline />;

    if (type.startsWith("image/")) return <IoMdImages />;
    if (type.includes("pdf")) return <FaRegFilePdf />;
    if (type.includes("word") || type.includes("document"))
      return <FaRegFileWord />;
    if (type.includes("sheet") || type.includes("excel"))
      return <FaRegFileExcel />;

    return <IoDocumentTextOutline />;
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
      alert(`Sólo puede cargar hasta ${maxFiles} archivos`);
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
      alert("No se han podido cargar algunos archivos:\n" + errors.join("\n"));
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
        alert(
          `${failedUploads.length} Archivo(s) no cargado(s). Algunos archivos no pudieron ser cargados`
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Carga fallida. Por favor, inténtelo de nuevo.");
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
          <div className="upload-icon">
            <FaCloudArrowUp />
          </div>
          <div className="upload-text">
            <p className="md-typescale-body-medium upload-main-text">
              {isDragging
                ? "Suelte los archivos aquí para cargarlos"
                : "Arrastre y suelte los archivos aquí, o haga clic para seleccionarlos"}
            </p>
            <p className="md-typescale-body-small upload-help-text">
              Soporta: Imágenes, documentos PDF, Word y Excel (maximo{" "}
              {formatFileSize(maxFileSize)} cada archivo)
            </p>
          </div>
        </div>
      </div>

      {/* Upload Progress */}
      {uploading.length > 0 && (
        <div className="upload-progress-section">
          <h4 className="md-typescale-title-small">Cargando...</h4>
          {uploading.map((fileId) => (
            <div key={fileId} className="upload-progress-item">
              <div className="progress-info">
                <span className="md-typescale-body-small">
                  Cargando archivo...
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
            Archivos cargados ({uploadedFiles.length}/{maxFiles})
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
                    {file.url && (
                      <button
                        className="file-view-button"
                        onClick={() => window.open(file.url, "_blank")}
                        title="Ver archivo"
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
          Máximo {maxFiles} archivos por gasto <br /> Máximo{" "}
          {formatFileSize(maxFileSize)} por archivo
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
