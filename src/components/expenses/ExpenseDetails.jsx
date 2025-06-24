import { useState } from "react";
import Button from "../common/Button";
import { storageService } from "../../libs/storageService";
import { IconRenderer } from "../../libs/iconMapping";
import { IoDocumentTextOutline, IoTrash } from "react-icons/io5";
import { IoMdImages, IoMdClose, IoMdDownload } from "react-icons/io";
import { FaRegFilePdf, FaRegFileWord, FaRegFileExcel } from "react-icons/fa";
import { FaBuildingColumns } from "react-icons/fa6";
import { ImMobile } from "react-icons/im";
import { MdEdit, MdEmail, MdOpenInNew, MdClose } from "react-icons/md";
import { BiWorld } from "react-icons/bi";
import { GoStopwatch } from "react-icons/go";

const ExpenseDetails = ({ expense, onEdit, onDelete, onClose }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(null);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(expense.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
    onClose();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("es-ES", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleDocumentClick = async (document) => {
    if (!document) {
      alert("Este archivo ya no está disponible. Puede haber sido eliminado.");
      return;
    }

    if (!document.storage_path) {
      console.log(document.storage_path);
      alert(
        "No se puede acceder al archivo. Ruta de almacenamiento no encontrada."
      );
      return;
    }

    setLoadingDocument(document.id);

    try {
      // Verificar si el archivo existe
      const existsResult = await storageService.checkFileExists(
        document.storage_path
      );

      if (!existsResult.data) {
        alert(
          "El archivo no se encuentra en el almacenamiento. Es posible que haya sido eliminado."
        );
        setLoadingDocument(null);
        return;
      }

      // Determinar si abrir en nueva pestaña o descargar según el tipo de archivo
      const shouldOpenInTab = isViewableInBrowser(document.mime_type);

      if (shouldOpenInTab) {
        // Generar URL firmada para archivos que se pueden ver en el navegador
        const urlResult = await storageService.getSignedUrl(
          document.storage_path,
          3600
        );

        if (urlResult.error) {
          throw new Error(urlResult.error);
        }

        // Abrir en nueva pestaña
        const newWindow = window.open(urlResult.data, "_blank");

        if (!newWindow) {
          // Si el popup fue bloqueado, ofrecer descarga como alternativa
          const downloadConfirm = confirm(
            "No se pudo abrir el archivo en una nueva pestaña (popup bloqueado). ¿Deseas descargarlo en su lugar?"
          );

          if (downloadConfirm) {
            await downloadDocument(document);
          }
        }
      } else {
        // Descargar directamente para tipos de archivo que no se pueden ver en el navegador
        await downloadDocument(document);
      }
    } catch (error) {
      console.error("Error accessing document:", error);
      alert(`Error al acceder al archivo: ${error.message}`);
    } finally {
      setLoadingDocument(null);
    }
  };

  const downloadDocument = async (document) => {
    try {
      const result = await storageService.downloadFile(
        document.storage_path,
        document.file_name
      );

      if (result.error) {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error("Error downloading document:", error);
      alert(`Error al descargar el archivo: ${error.message}`);
    }
  };

  const isViewableInBrowser = (mimeType) => {
    if (!mimeType) return false;

    const viewableTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/svg+xml",
      "application/pdf",
      "text/plain",
      "text/html",
      "text/css",
      "text/javascript",
      "application/json",
    ];

    return viewableTypes.includes(mimeType.toLowerCase());
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return <IoDocumentTextOutline />;

    if (mimeType.startsWith("image/")) return <IoMdImages />;
    if (mimeType.includes("pdf")) return <FaRegFilePdf />;
    if (mimeType.includes("word") || mimeType.includes("document"))
      return <FaRegFileWord />;
    if (mimeType.includes("sheet") || mimeType.includes("excel"))
      return <FaRegFileExcel />;

    return <IoDocumentTextOutline />;
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "Unknown size";

    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <div className="expense-details-overlay">
      <div className="expense-details-modal md-card">
        {/* Header */}
        <div className="details-header">
          <div className="header-main">
            <h2 className="md-typescale-headline-small">Detalle del gasto</h2>
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Close details"
            >
              <IoMdClose />
            </button>
          </div>

          <div className="details-actions">
            <button
              className="md-button md-button-outlined"
              onClick={() => onEdit(expense)}
            >
              <span className="button-icon">
                <MdEdit />
              </span>
              Editar
            </button>

            <Button
              className="md-button md-button-filled delete-button"
              onClick={() => setShowDeleteConfirm(true)}
              icon={<IoTrash />}
            >
              Eliminar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="details-content">
          {/* Amount and Date */}
          <div className="details-summary">
            <div className="amount-section">
              <span className="amount-label md-typescale-body-small">
                Importe
              </span>
              <span className="amount-value md-typescale-display-small">
                {formatAmount(expense.amount)}
              </span>
            </div>

            <div className="date-section">
              <span className="date-label md-typescale-body-small">Fecha</span>
              <span className="date-value md-typescale-title-large">
                {formatDate(expense.expense_date)}
              </span>
            </div>
          </div>

          {/* Type and Entity */}
          <div className="details-section">
            <h3 className="md-typescale-title-medium section-title">
              Categoria y Entidad
            </h3>

            <div className="category-info">
              <div className="category-item">
                <div className="category-icon-container">
                  <span
                    className="category-icon"
                    style={{ backgroundColor: expense.expense_types.color }}
                  >
                    <IconRenderer iconId={expense.expense_types.icon} />
                  </span>
                </div>
                <div className="category-details">
                  <span className="category-name md-typescale-title-medium">
                    {expense.expense_types.name}
                  </span>
                  <span className="category-type md-typescale-body-small">
                    Tipo de Gasto
                  </span>
                </div>
              </div>

              <div className="category-item">
                <div className="entity-icon-container">
                  <span className="entity-icon">
                    <FaBuildingColumns />
                  </span>
                </div>
                <div className="category-details">
                  <span className="category-name md-typescale-title-medium">
                    {expense.entities.name}
                  </span>
                  <span className="category-type md-typescale-body-small">
                    Entidad
                  </span>
                  {expense.entities.description && (
                    <span className="entity-description md-typescale-body-small">
                      {expense.entities.description}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Entity Contact Info */}
            {expense.entities.contact_info &&
              Object.keys(expense.entities.contact_info).length > 0 && (
                <div className="entity-contact">
                  <h4 className="md-typescale-title-small">
                    Informacion de Contacto
                  </h4>
                  <div className="contact-grid">
                    {expense.entities.contact_info.phone && (
                      <div className="contact-item">
                        <span className="contact-icon">
                          <ImMobile />
                        </span>
                        <a
                          href={`tel:${expense.entities.contact_info.phone}`}
                          className="contact-link"
                        >
                          {expense.entities.contact_info.phone}
                        </a>
                      </div>
                    )}
                    {expense.entities.contact_info.email && (
                      <div className="contact-item">
                        <span className="contact-icon">
                          <MdEmail />
                        </span>
                        <a
                          href={`mailto:${expense.entities.contact_info.email}`}
                          className="contact-link"
                        >
                          {expense.entities.contact_info.email}
                        </a>
                      </div>
                    )}
                    {expense.entities.contact_info.website && (
                      <div className="contact-item">
                        <span className="contact-icon">
                          <BiWorld />
                        </span>
                        <a
                          href={expense.entities.contact_info.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-link"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>

          {/* Description */}
          {expense.description && (
            <div className="details-section">
              <h3 className="md-typescale-title-medium section-title">
                Descripción
              </h3>
              <p className="md-typescale-body-large expense-description-text">
                {expense.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {expense.tags && expense.tags.length > 0 && (
            <div className="details-section">
              <h3 className="md-typescale-title-medium section-title">
                Etiquetas
              </h3>
              <div className="tags-container">
                {expense.tags.map((tag, index) => (
                  <span key={index} className="tag-chip">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {expense.notes && (
            <div className="details-section">
              <h3 className="md-typescale-title-medium section-title">Notas</h3>
              <div className="notes-content">
                <p className="md-typescale-body-medium notes-text">
                  {expense.notes}
                </p>
              </div>
            </div>
          )}

          {/* Documents */}
          {expense.expense_documents &&
            expense.expense_documents.length > 0 && (
              <div className="details-section">
                <h3 className="md-typescale-title-medium section-title">
                  Documentos y recibos
                </h3>
                <div className="documents-grid">
                  {expense.expense_documents.map((document) => (
                    <div
                      key={document.id}
                      className={`document-item ${
                        !document ? "unavailable" : ""
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDocumentClick(document);
                      }}
                    >
                      <div className="document-icon">
                        {getFileIcon(document.mime_type)}
                      </div>
                      <div className="document-info">
                        <span className="document-name md-typescale-body-medium">
                          {document.file_name}
                        </span>
                        <div className="document-meta">
                          {document.file_size && (
                            <span className="document-size md-typescale-body-small">
                              {formatFileSize(document.file_size)}
                            </span>
                          )}
                          <span className="document-date md-typescale-body-small">
                            {formatDateTime(document.uploaded_at)}
                          </span>
                          {document.mime_type && (
                            <span className="document-type md-typescale-body-small"></span>
                          )}
                        </div>
                      </div>
                      <div className="document-actions">
                        {document ? (
                          <button
                            className={`document-action-button ${
                              loadingDocument === document.id ? "loading" : ""
                            }`}
                            disabled={loadingDocument === document.id}
                            title={
                              isViewableInBrowser(document.mime_type)
                                ? "Ver archivo"
                                : "Descargar archivo"
                            }
                          >
                            {loadingDocument === document.id ? (
                              <GoStopwatch />
                            ) : isViewableInBrowser(document.mime_type) ? (
                              <MdOpenInNew />
                            ) : (
                              <IoCloudDownloadOutline />
                            )}
                          </button>
                        ) : (
                          <span
                            className="document-unavailable-icon"
                            title="Archivo no disponible"
                          >
                            <MdClose />
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          {/* Metadata */}
          <div className="details-section">
            <h3 className="md-typescale-title-medium section-title">
              Metadata
            </h3>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="metadata-label md-typescale-body-small">
                  Creado
                </span>
                <span className="metadata-value md-typescale-body-medium">
                  {formatDateTime(expense.created_at)}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label md-typescale-body-small">
                  Ultima actualización
                </span>
                <span className="metadata-value md-typescale-body-medium">
                  {formatDateTime(expense.updated_at)}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label md-typescale-body-small">
                  Periodo
                </span>
                <span className="metadata-value md-typescale-body-medium">
                  {expense.month}/{expense.year}
                </span>
              </div>
              {expense.expense_documents &&
                expense.expense_documents.length > 0 && (
                  <div className="metadata-item">
                    <span className="metadata-label md-typescale-body-small">
                      Adjuntos
                    </span>
                    <span className="metadata-value md-typescale-body-medium">
                      {expense.expense_documents.length} archivo
                      {expense.expense_documents.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="delete-confirmation-overlay">
            <div className="delete-confirmation-modal md-card">
              <h3 className="md-typescale-title-medium">Eliminar gasto</h3>
              <p className="md-typescale-body-medium">
                ¿Está seguro de que desea eliminar este gasto de{" "}
                {formatAmount(expense.amount)}? Esta acción no puede deshacerse
                y también eliminará cualquier documento adjunto.
              </p>
              <div className="confirmation-actions">
                <button
                  className="md-button md-button-outlined"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  className={`md-button md-button-filled delete-confirm-button ${
                    isDeleting ? "loading" : ""
                  }`}
                  onClick={handleDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar gasto"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseDetails;
