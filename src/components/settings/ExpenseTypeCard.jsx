import { useState } from "react";

const ExpenseTypeCard = ({ expenseType, onEdit, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(expenseType.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="expense-type-card md-card">
      <div className="card-header">
        <div className="type-icon-container">
          <span
            className="type-icon"
            style={{ backgroundColor: expenseType.color }}
          >
            {expenseType.icon}
          </span>
        </div>
        <div className="card-menu">
          <button
            className="card-menu-button"
            onClick={() => onEdit(expenseType)}
            aria-label="Edit expense type"
          >
            ✏️
          </button>
          <button
            className="card-menu-button delete-button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete expense type"
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="card-content">
        <h3 className="md-typescale-title-medium type-name">
          {expenseType.name}
        </h3>
        {expenseType.description && (
          <p className="md-typescale-body-small type-description">
            {expenseType.description}
          </p>
        )}
      </div>

      <div className="card-footer">
        <span className="md-typescale-body-small card-date">
          Created {new Date(expenseType.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal md-card">
            <h3 className="md-typescale-title-medium">Delete Expense Type</h3>
            <p className="md-typescale-body-medium">
              Are you sure you want to delete "{expenseType.name}"? This action
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

export default ExpenseTypeCard;
