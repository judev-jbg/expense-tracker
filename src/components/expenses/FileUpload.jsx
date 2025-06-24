import { useState, useRef, useEffect } from "react";
import { FaCloudArrowUp } from "react-icons/fa6";
import { IoDocumentTextOutline } from "react-icons/io5";
import { IoMdImages } from "react-icons/io";
import { FaRegFilePdf, FaRegFileWord, FaRegFileExcel } from "react-icons/fa";
import { storageService } from "../../libs/storageService";
import { expenseDocumentsService } from "../../libs/configService";
import { useAuth } from "../../contexts/AuthContext";

const FileUpload = ({
  expenseId,
  onFileUpload,
  uploadedFiles = [],
  onFileRemove,
  disabled = false,
}) => {
  const { user } = useAuth();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [storageInfo, setStorageInfo] = useState(null);
  const [loading, setLoading] = useState(false);
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

  // Cargar información de almacenamiento al montar el componente
  useEffect(() => {
    if (user) {
      loadStorageInfo();
    }
  }, [user]);

  const loadStorageInfo = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const result = await storageService.getStorageStats(user.id);
      if (!result.error) {
        console.log("Storage info loaded:", result.data);
        setStorageInfo(result.data);
      } else {
        console.error("Error loading storage info:", result.error);
        // Establecer valores por defecto si hay error
        setStorageInfo({
          total_size: 0,
          file_count: 0,
          storage_limit: 1073741824, // 1GB
          usage_percentage: 0,
          available_space: 1073741824,
        });
      }
    } catch (error) {
      console.error("Exception loading storage info:", error);
      // Establecer valores por defecto si hay excepción
      setStorageInfo({
        total_size: 0,
        file_count: 0,
        storage_limit: 1073741824, // 1GB
        usage_percentage: 0,
        available_space: 1073741824,
      });
    } finally {
      setLoading(false);
    }
  };

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
    if (bytes === 0) return "0 GB";
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

    // Verificar espacio antes de empezar
    const spaceCheck = await storageService.checkStorageSpace(user.id);
    if (!spaceCheck.canUpload) {
      const usageText = spaceCheck.usagePercentage
        ? `${spaceCheck.usagePercentage}%`
        : "desconocido";
      alert(
        `Espacio insuficiente. Uso actual: ${usageText}. Por favor, libere espacio eliminando archivos antiguos.`
      );
      return;
    }

    // Subir archivos
    const uploadPromises = validFiles.map((file) => uploadFile(file));

    try {
      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((result) => result.data);

      if (successfulUploads.length > 0) {
        onFileUpload(successfulUploads.map((result) => result.data));
        await loadStorageInfo(); // Actualizar info de almacenamiento
      }

      const failedUploads = results.filter((result) => result.error);
      if (failedUploads.length > 0) {
        alert(
          `${failedUploads.length} archivo(s) no se pudieron cargar:\n` +
            failedUploads.map((f) => f.error).join("\n")
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error durante la carga. Por favor, inténtelo de nuevo.");
    }
  };

  const uploadFile = async (file) => {
    const fileId = Math.random().toString(36).substr(2, 9);
    setUploading((prev) => [...prev, fileId]);
    setUploadProgress((prev) => ({ ...prev, [fileId]: 0 }));

    try {
      // Simular progreso inicial
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => ({
          ...prev,
          [fileId]: Math.min(prev[fileId] + Math.random() * 20, 70),
        }));
      }, 200);

      // Subir a Supabase Storage
      const uploadResult = await storageService.uploadFile(
        file,
        expenseId,
        user.id
      );

      clearInterval(progressInterval);
      setUploadProgress((prev) => ({ ...prev, [fileId]: 90 }));

      if (uploadResult.error) {
        throw new Error(uploadResult.error);
      }

      // Guardar metadata en la base de datos
      const documentData = {
        expense_id: expenseId,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: uploadResult.data.path,
        storage_bucket: "expense-documents",
        is_receipt: true,
        is_available: true,
      };

      const dbResult = await expenseDocumentsService.create(documentData);

      if (dbResult.error) {
        // Si falla guardar en DB, eliminar archivo de storage
        await storageService.deleteFile(uploadResult.data.path);
        throw new Error(dbResult.error);
      }

      setUploadProgress((prev) => ({ ...prev, [fileId]: 100 }));

      // Limpiar después de un delay
      setTimeout(() => {
        setUploading((prev) => prev.filter((id) => id !== fileId));
        setUploadProgress((prev) => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }, 1000);

      return {
        data: {
          ...dbResult.data,
          url: uploadResult.data.url,
          storage_url: uploadResult.data.url,
        },
        error: null,
      };
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

  const handleRemoveFile = async (index) => {
    const file = uploadedFiles[index];

    if (file.storage_path) {
      // Eliminar de Supabase Storage
      await storageService.deleteFile(file.storage_path);

      // Eliminar de la base de datos
      if (file.id) {
        await expenseDocumentsService.delete(file.id);
      }

      await loadStorageInfo(); // Actualizar info de almacenamiento
    }

    onFileRemove(index);
  };

  const openFileDialog = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="file-upload-container">
      {/* Storage Info */}
      {storageInfo && !loading && (
        <div className="storage-info-bar">
          <div className="storage-usage">
            <span className="storage-label">Almacenamiento usado:</span>
            <span className="storage-value">
              {formatFileSize(storageInfo.total_size)} /{" "}
              {formatFileSize(storageInfo.storage_limit)} (
              {storageInfo.usage_percentage}%)
            </span>
          </div>
          <div className="storage-progress-bar">
            <div
              className="storage-progress-fill"
              style={{
                width: `${Math.min(storageInfo.usage_percentage, 100)}%`,
                backgroundColor:
                  storageInfo.usage_percentage > 85
                    ? "#f44336"
                    : storageInfo.usage_percentage > 70
                    ? "#ff9800"
                    : "#4caf50",
              }}
            />
          </div>
        </div>
      )}

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
              Soporta: Imágenes, documentos PDF, Word y Excel (máximo{" "}
              {formatFileSize(maxFileSize)} cada archivo)
            </p>
            {storageInfo && storageInfo.usage_percentage > 70 && (
              <p className="md-typescale-body-small upload-warning-text">
                ⚠️ Almacenamiento al {storageInfo.usage_percentage}%. Los
                archivos antiguos se eliminarán automáticamente si es necesario.
              </p>
            )}
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
                    {!file.is_available && (
                      <span className="file-unavailable"> (No disponible)</span>
                    )}
                  </span>
                  <div className="file-meta">
                    {(file.file_size || file.size) && (
                      <span className="file-size md-typescale-body-small">
                        {formatFileSize(file.file_size || file.size)}
                      </span>
                    )}
                    {file.is_available && (file.url || file.storage_url) && (
                      <button
                        className="file-view-button"
                        onClick={() =>
                          window.open(file.url || file.storage_url, "_blank")
                        }
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
                  title="Eliminar archivo"
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
          <br />
          Los archivos dejaran de ser visibles automáticamente cuando el espacio
          es limitado
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
