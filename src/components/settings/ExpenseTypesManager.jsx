import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { expenseTypesService } from "../../libs/configService";
import ExpenseTypeForm from "./ExpenseTypeForm";
import ExpenseTypeCard from "./ExpenseTypeCard";
import Spinner from "../common/Spinner";
import Button from "../common/Button";

const ExpenseTypesManager = () => {
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    loadExpenseTypes();
  }, []);

  const loadExpenseTypes = async () => {
    setLoading(true);
    const { data, error } = await expenseTypesService.getAll();

    if (error) {
      setError(error);
    } else {
      setExpenseTypes(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async (formData) => {
    const { data, error } = await expenseTypesService.create(formData);

    if (error) {
      setError(error);
      return false;
    } else {
      setExpenseTypes([...expenseTypes, data]);
      setShowForm(false);
      setError("");
      return true;
    }
  };

  const handleUpdate = async (formData) => {
    const { data, error } = await expenseTypesService.update(
      editingType.id,
      formData
    );

    if (error) {
      setError(error);
      return false;
    } else {
      setExpenseTypes(
        expenseTypes.map((type) => (type.id === editingType.id ? data : type))
      );
      setEditingType(null);
      setShowForm(false);
      setError("");
      return true;
    }
  };

  const handleDelete = async (id) => {
    const { error } = await expenseTypesService.delete(id);

    if (error) {
      setError(error);
    } else {
      setExpenseTypes(expenseTypes.filter((type) => type.id !== id));
      setError("");
    }
  };

  const handleEdit = (expenseType) => {
    setEditingType(expenseType);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingType(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <Spinner />
        </div>
      </div>
    );
  }

  return (
    <div className="expense-types-manager">
      <div className="section-header">
        <div className="section-title">
          <h2 className="md-typescale-headline-small">Tipos de gasto</h2>
          <p className="md-typescale-body-medium section-description">
            Cree y gestione categorías para sus gastos como Comida, Transporte,
            Servicios públicos, etc.
          </p>
        </div>

        <Button onClick={() => setShowForm(true)} disabled={showForm}>
          Agregar tipo de gasto
        </Button>
      </div>

      {error && (
        <div className="error-message md-card">
          <span className="error-icon">⚠️</span>
          <span className="md-typescale-body-medium">{error}</span>
        </div>
      )}

      {showForm && (
        <ExpenseTypeForm
          expenseType={editingType}
          onSubmit={editingType ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
          isEditing={!!editingType}
        />
      )}

      <div className="expense-types-grid">
        {expenseTypes.length === 0 ? (
          <div className="empty-state md-card">
            <div className="empty-icon">🏷️</div>
            <h3 className="md-typescale-title-medium">
              Aún no hay tipos de gastos
            </h3>
            <p className="md-typescale-body-medium">
              Crea tu primer tipo de gasto para empezar a organizar tus gastos.
            </p>
          </div>
        ) : (
          expenseTypes.map((expenseType) => (
            <ExpenseTypeCard
              key={expenseType.id}
              expenseType={expenseType}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ExpenseTypesManager;
