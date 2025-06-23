import { useState } from "react";
import { IoTrash } from "react-icons/io5";
import { MdModeEditOutline } from "react-icons/md";
import { IoMdPricetags } from "react-icons/io";
import { IconRenderer } from "../../libs/iconMapping";

const ExpenseCard = ({ expense, onEdit, onDelete, onView }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    await onDelete(expense.id);
    setIsDeleting(false);
    setShowDeleteConfirm(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const hasDocuments =
    expense.expense_documents && expense.expense_documents.length > 0;

  return (
    <div className="expense-card md-card" onClick={() => onView(expense)}>
      <div className="card-header">
        <div className="expense-date">
          <span className="date-day">
            {formatDate(expense.expense_date).split(" ")[0]}
          </span>
          <span className="date-month">
            {formatDate(expense.expense_date).split(" ")[1]}
          </span>
        </div>

        <div className="card-menu" onClick={(e) => e.stopPropagation()}>
          <button
            className="card-menu-button"
            onClick={() => onEdit(expense)}
            aria-label="Edit expense"
          >
            <MdModeEditOutline />
          </button>
          <button
            className="card-menu-button delete-button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete expense"
          >
            <IoTrash />
          </button>
        </div>
      </div>

      <div className="card-content">
        <div className="expense-type-info">
          <span
            className="type-badge"
            style={{ backgroundColor: expense.expense_types.color }}
          >
            <IconRenderer iconId={expense.expense_types.icon} />
          </span>
          <div className="type-details">
            <span className="type-name md-typescale-body-medium">
              {expense.expense_types.name}
            </span>
            <span className="entity-name md-typescale-body-small">
              {expense.entities.name}
            </span>
          </div>
        </div>

        <div className="expense-amount">
          <span className="amount-value md-typescale-title-medium">
            {formatAmount(expense.amount)}
          </span>
        </div>
      </div>

      {expense.description && (
        <div className="expense-description">
          <p className="md-typescale-body-small">
            {expense.description.length > 100
              ? `${expense.description.substring(0, 100)}...`
              : expense.description}
          </p>
        </div>
      )}

      <div className="card-footer">
        <div className="expense-indicators">
          {hasDocuments && (
            <span
              className="document-indicator"
              title={`${expense.expense_documents.length} document(s)`}
            >
              📎 {expense.expense_documents.length}
            </span>
          )}
          {expense.tags && expense.tags.length > 0 && (
            <span className="tags-indicator" title="Has tags">
              <IoMdPricetags />
              {expense.tags.map((tag, index) => (
                <span key={index}>
                  {tag}
                  {index < expense.tags.length - 1 && ", "}
                </span>
              ))}
            </span>
          )}
        </div>

        <span className="created-date md-typescale-body-small">
          {new Date(expense.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="delete-modal-overlay"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="delete-modal md-card">
            <h3 className="md-typescale-title-medium">Eliminar gasto</h3>
            <p className="md-typescale-body-medium">
              ¿Está seguro de que desea eliminar este gasto de{" "}
              {formatAmount(expense.amount)}? Esta acción no puede deshacerse.
            </p>
            <div className="modal-actions">
              <button
                className="md-button md-button-outlined"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(false);
                }}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className={`md-button md-button-filled delete-confirm-button ${
                  isDeleting ? "loading" : ""
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                disabled={isDeleting}
              >
                {isDeleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseCard;
