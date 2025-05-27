import { useState } from "react";

const EntityCard = ({ entity, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(entity.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const hasContactInfo =
    entity.contact_info && Object.keys(entity.contact_info).length > 0;

  return (
    <div className="entity-card md-card">
      <div className="card-header">
        <div className="entity-type-indicator">
          <span
            className="type-badge"
            style={{ backgroundColor: entity.expense_types.color }}
          >
            {entity.expense_types.icon}
          </span>
          <span className="type-name md-typescale-body-small">
            {entity.expense_types.name}
          </span>
        </div>
        <div className="card-menu">
          {hasContactInfo && (
            <button
              className="card-menu-button"
              onClick={() => setShowDetails(!showDetails)}
              aria-label="Toggle details"
            >
              {showDetails ? "👁️‍🗨️" : "👁️"}
            </button>
          )}
          <button
            className="card-menu-button"
            onClick={() => onEdit(entity)}
            aria-label="Edit entity"
          >
            ✏️
          </button>
          <button
            className="card-menu-button delete-button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete entity"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="card-content">
        <h3 className="md-typescale-title-medium entity-name">{entity.name}</h3>
        {entity.description && (
          <p className="md-typescale-body-small entity-description">
            {entity.description}
          </p>
        )}

        {/* Contact Details (collapsible) */}
        {hasContactInfo && showDetails && (
          <div className="contact-details">
            <h4 className="md-typescale-title-small">Contact Information</h4>
            <div className="contact-grid">
              {entity.contact_info.phone && (
                <div className="contact-item">
                  <span className="contact-icon">📞</span>
                  <a
                    href={`tel:${entity.contact_info.phone}`}
                    className="contact-link"
                  >
                    {entity.contact_info.phone}
                  </a>
                </div>
              )}
              {entity.contact_info.email && (
                <div className="contact-item">
                  <span className="contact-icon">📧</span>
                  <a
                    href={`mailto:${entity.contact_info.email}`}
                    className="contact-link"
                  >
                    {entity.contact_info.email}
                  </a>
                </div>
              )}
              {entity.contact_info.website && (
                <div className="contact-item">
                  <span className="contact-icon">🌐</span>
                  <a
                    href={entity.contact_info.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-link"
                  >
                    Website
                  </a>
                </div>
              )}
              {entity.contact_info.address && (
                <div className="contact-item contact-address">
                  <span className="contact-icon">📍</span>
                  <span className="contact-text">
                    {entity.contact_info.address}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card-footer">
        <span className="md-typescale-body-small card-date">
          Created {new Date(entity.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal md-card">
            <h3 className="md-typescale-title-medium">Delete Entity</h3>
            <p className="md-typescale-body-medium">
              Are you sure you want to delete "{entity.name}"? This action
              cannot be undone.
            </p>
            <div className="modal-actions">
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
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EntityCard;
