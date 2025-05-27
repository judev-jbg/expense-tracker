import { useState } from "react";
import { googleDriveService } from "../../libs/googleDriveService";

const ExpenseDetails = ({ expense, onEdit, onDelete, onClose }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const handleDocumentClick = (document) => {
    // Open document in new tab
    window.open(document.google_drive_url, "_blank", "noopener,noreferrer");
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return "📄";

    if (mimeType.startsWith("image/")) return "🖼️";
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📘";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📗";
    if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
      return "📙";

    return "📄";
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
            <h2 className="md-typescale-headline-small">Expense Details</h2>
            <button
              className="close-button"
              onClick={onClose}
              aria-label="Close details"
            >
              ✕
            </button>
          </div>

          <div className="details-actions">
            <button
              className="md-button md-button-outlined"
              onClick={() => onEdit(expense)}
            >
              <span className="button-icon">✏️</span>
              Edit
            </button>
            <button
              className="md-button md-button-filled delete-button"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <span className="button-icon">🗑️</span>
              Delete
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="details-content">
          {/* Amount and Date */}
          <div className="details-summary">
            <div className="amount-section">
              <span className="amount-label md-typescale-body-small">
                Amount
              </span>
              <span className="amount-value md-typescale-display-small">
                {formatAmount(expense.amount)}
              </span>
            </div>

            <div className="date-section">
              <span className="date-label md-typescale-body-small">Date</span>
              <span className="date-value md-typescale-title-large">
                {formatDate(expense.expense_date)}
              </span>
            </div>
          </div>

          {/* Type and Entity */}
          <div className="details-section">
            <h3 className="md-typescale-title-medium section-title">
              Category & Entity
            </h3>

            <div className="category-info">
              <div className="category-item">
                <div className="category-icon-container">
                  <span
                    className="category-icon"
                    style={{ backgroundColor: expense.expense_types.color }}
                  >
                    {expense.expense_types.icon}
                  </span>
                </div>
                <div className="category-details">
                  <span className="category-name md-typescale-title-medium">
                    {expense.expense_types.name}
                  </span>
                  <span className="category-type md-typescale-body-small">
                    Expense Type
                  </span>
                </div>
              </div>

              <div className="category-item">
                <div className="entity-icon-container">
                  <span className="entity-icon">🏢</span>
                </div>
                <div className="category-details">
                  <span className="category-name md-typescale-title-medium">
                    {expense.entities.name}
                  </span>
                  <span className="category-type md-typescale-body-small">
                    Entity
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
                    Contact Information
                  </h4>
                  <div className="contact-grid">
                    {expense.entities.contact_info.phone && (
                      <div className="contact-item">
                        <span className="contact-icon">📞</span>
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
                        <span className="contact-icon">📧</span>
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
                        <span className="contact-icon">🌐</span>
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
                Description
              </h3>
              <p className="md-typescale-body-large expense-description-text">
                {expense.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {expense.tags && expense.tags.length > 0 && (
            <div className="details-section">
              <h3 className="md-typescale-title-medium section-title">Tags</h3>
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
              <h3 className="md-typescale-title-medium section-title">Notes</h3>
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
                  Documents & Receipts
                </h3>
                <div className="documents-grid">
                  {expense.expense_documents.map((document) => (
                    <div
                      key={document.id}
                      className="document-item"
                      onClick={() => handleDocumentClick(document)}
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
                        </div>
                      </div>
                      <div className="document-actions">
                        <button
                          className="document-action-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDocumentClick(document);
                          }}
                          title="Open document"
                        >
                          👁️
                        </button>
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
                  Created
                </span>
                <span className="metadata-value md-typescale-body-medium">
                  {formatDateTime(expense.created_at)}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label md-typescale-body-small">
                  Last Updated
                </span>
                <span className="metadata-value md-typescale-body-medium">
                  {formatDateTime(expense.updated_at)}
                </span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label md-typescale-body-small">
                  Period
                </span>
                <span className="metadata-value md-typescale-body-medium">
                  {expense.month}/{expense.year}
                </span>
              </div>
              {expense.expense_documents &&
                expense.expense_documents.length > 0 && (
                  <div className="metadata-item">
                    <span className="metadata-label md-typescale-body-small">
                      Attachments
                    </span>
                    <span className="metadata-value md-typescale-body-medium">
                      {expense.expense_documents.length} file
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
              <h3 className="md-typescale-title-medium">Delete Expense</h3>
              <p className="md-typescale-body-medium">
                Are you sure you want to delete this expense of{" "}
                {formatAmount(expense.amount)}? This action cannot be undone and
                will also remove any attached documents.
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
                  {isDeleting ? "Deleting..." : "Delete Expense"}
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
