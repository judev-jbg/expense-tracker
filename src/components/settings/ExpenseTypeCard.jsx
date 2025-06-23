import { useState } from "react";
import { MdEdit } from "react-icons/md";
import { IoTrash } from "react-icons/io5";
import { IconRenderer } from "../../libs/iconMapping";

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
            <IconRenderer iconId={expenseType.icon} />
          </span>
        </div>
        <div className="card-menu">
          <button
            className="card-menu-button"
            onClick={() => onEdit(expenseType)}
            aria-label="Edit expense type"
          >
            <MdEdit />
          </button>
          <button
            className="card-menu-button delete-button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete expense type"
          >
            <IoTrash />
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
          Creado {new Date(expenseType.created_at).toLocaleDateString()}
        </span>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="delete-modal-overlay">
          <div className="delete-modal md-card">
            <h3 className="md-typescale-title-medium">Borrar tipo de gasto</h3>
            <p className="md-typescale-body-medium">
              ¿Estás seguro de que quieres borrar "{expenseType.name}"? Esta
              acción no se puede deshacer.
            </p>
            <div className="modal-actions">
              <button
                className="md-button md-button-outlined"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancelar
              </button>
              <button
                className={`md-button md-button-filled delete-confirm-button ${
                  isDeleting ? "loading" : ""
                }`}
                onClick={handleDelete}
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

export default ExpenseTypeCard;
