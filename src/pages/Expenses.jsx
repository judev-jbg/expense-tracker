import { useState, useEffect } from "react";
import {
  expensesService,
  expenseTypesService,
  entitiesService,
} from "../libs/configService";
import ExpensesList from "../components/expenses/ExpensesList";
import ExpenseForm from "../components/expenses/ExpenseForm";
import ExpenseFilters from "../components/expenses/ExpenseFilters";
import ExpenseDetails from "../components/expenses/ExpenseDetails";
import Spinner from "../components/common/Spinner";
import Button from "../components/common/Button";
import { MdOutlineModeEditOutline } from "react-icons/md";
import { IoMdSettings } from "react-icons/io";
import { IoWarning } from "react-icons/io5";

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [expenseTypes, setExpenseTypes] = useState([]);
  const [entities, setEntities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [viewingExpense, setViewingExpense] = useState(null);
  const [filters, setFilters] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadExpenses();
    }
  }, [filters, loading]);

  const loadInitialData = async () => {
    setLoading(true);

    // Load expense types and entities first
    const [typesResult, entitiesResult] = await Promise.all([
      expenseTypesService.getAll(),
      entitiesService.getAll(),
    ]);

    if (typesResult.error) {
      setError(typesResult.error);
    } else {
      setExpenseTypes(typesResult.data || []);
    }

    if (entitiesResult.error) {
      setError(entitiesResult.error);
    } else {
      setEntities(entitiesResult.data || []);
    }

    setLoading(false);
  };

  const loadExpenses = async () => {
    const { data, error } = await expensesService.getAll(filters);

    if (error) {
      setError(error);
    } else {
      setExpenses(data || []);
      setError("");
    }
  };

  const handleCreate = async (formData) => {
    const { tempFiles, ...expenseData } = formData; // Separar archivos temporales

    const { data, error } = await expenseService.create(expenseData);

    if (error) {
      setError(error);
      return false;
    } else {
      setExpenses([data, ...expenses]);
      setShowForm(false);
      setError("");

      // Si hay archivos temporales, mostrar mensaje o redirigir a edición
      if (tempFiles && tempFiles.length > 0) {
        // Aquí podrías mostrar un mensaje o redirigir automáticamente a edición
        alert(
          `Gasto creado exitosamente. ${tempFiles.length} archivo(s) pendiente(s) de subir. Ve a editar el gasto para añadir los documentos.`
        );
      }

      return true;
    }
  };

  const handleUpdate = async (formData) => {
    const { data, error } = await expensesService.update(
      editingExpense.id,
      formData
    );

    if (error) {
      setError(error);
      return false;
    } else {
      setExpenses(
        expenses.map((expense) =>
          expense.id === editingExpense.id ? data : expense
        )
      );
      setEditingExpense(null);
      setShowForm(false);
      setError("");

      // If we're viewing this expense, update the view
      if (viewingExpense && viewingExpense.id === editingExpense.id) {
        setViewingExpense(data);
      }

      return true;
    }
  };

  const handleDelete = async (id) => {
    const { error } = await expensesService.delete(id);

    if (error) {
      setError(error);
    } else {
      setExpenses(expenses.filter((expense) => expense.id !== id));
      setError("");

      // Close details view if we're viewing the deleted expense
      if (viewingExpense && viewingExpense.id === id) {
        setViewingExpense(null);
      }
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  const handleView = async (expense) => {
    // Load full expense details
    const { data, error } = await expensesService.getById(expense.id);

    if (error) {
      setError(error);
    } else {
      setViewingExpense(data);
    }
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    setError("");
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Get current month/year for default form values
  const getCurrentPeriod = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
    };
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

  // Check if user has expense types and entities configured
  const hasConfiguration = expenseTypes.length > 0 && entities.length > 0;

  if (!hasConfiguration) {
    return (
      <div className="expenses-container">
        <div className="configuration-required md-card">
          <div className="config-icon">
            <IoMdSettings />
          </div>
          <h2 className="md-typescale-headline-small">
            Configuración necesaria
          </h2>
          <p className="md-typescale-body-medium">
            Antes de poder crear gastos, es necesario configurar los tipos de
            gastos y las entidades.
          </p>
          <p className="md-typescale-body-small">
            Vaya a Configuración para configurar sus categorías de gastos y
            entidades.
          </p>
          <div className="config-actions">
            <a href="/settings" className="md-button md-button-filled">
              Ir a Ajustes
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="expenses-container">
      {/* Header */}
      <div className="expenses-header">
        <div className="header-content">
          <h1 className="md-typescale-headline-medium">Gastos</h1>
          <p className="md-typescale-body-medium expenses-subtitle">
            Administra tus gastos mensuales, crea nuevos gastos y visualiza tus
            transacciones pasadas.
          </p>
        </div>

        <div className="header-actions">
          <Button
            icon={<MdOutlineModeEditOutline />}
            variant="fab"
            onClick={() => setShowForm(true)}
            disabled={showForm}
          ></Button>
        </div>
      </div>

      {error && (
        <div className="error-message md-card">
          <span className="error-icon">
            <IoWarning />
          </span>
          <span className="md-typescale-body-medium">{error}</span>
        </div>
      )}

      {/* Filters */}
      <ExpenseFilters
        filters={filters}
        expenseTypes={expenseTypes}
        entities={entities}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Form */}
      {showForm && (
        <ExpenseForm
          expense={editingExpense}
          expenseTypes={expenseTypes}
          entities={entities}
          defaultPeriod={getCurrentPeriod()}
          onSubmit={editingExpense ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
          isEditing={!!editingExpense}
        />
      )}

      {/* Details View */}
      {viewingExpense && (
        <ExpenseDetails
          expense={viewingExpense}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onClose={() => setViewingExpense(null)}
        />
      )}

      {/* Expenses List */}
      <ExpensesList
        expenses={expenses}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        loading={false}
      />
    </div>
  );
};

export default Expenses;
