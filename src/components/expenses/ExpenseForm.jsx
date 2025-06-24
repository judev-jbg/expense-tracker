// En src/components/expenses/ExpenseForm.jsx

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FileUpload from "./FileUpload";
import Button from "../common/Button";

const ExpenseForm = ({
  expense,
  expenseTypes,
  entities,
  defaultPeriod,
  onSubmit,
  onCancel,
  isEditing,
}) => {
  const [selectedTypeId, setSelectedTypeId] = useState("");
  const [filteredEntities, setFilteredEntities] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [tempFiles, setTempFiles] = useState([]); // Archivos temporales para nuevo gasto

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      amount: "",
      description: "",
      expense_date: new Date().toISOString().split("T")[0],
      expense_type_id: "",
      entity_id: "",
      notes: "",
      tags: "",
    },
  });

  const watchedTypeId = watch("expense_type_id");

  useEffect(() => {
    if (expense) {
      // Formato de fecha para input
      const expenseDate = new Date(expense.expense_date);
      const formattedDate = expenseDate.toISOString().split("T")[0];

      reset({
        amount: expense.amount.toString(),
        description: expense.description || "",
        expense_date: formattedDate,
        expense_type_id: expense.expense_type_id,
        entity_id: expense.entity_id,
        notes: expense.notes || "",
        tags: expense.tags ? expense.tags.join(", ") : "",
      });

      setSelectedTypeId(expense.expense_type_id);
      setUploadedFiles(expense.expense_documents || []);
    } else {
      // Set default date to today
      const today = new Date().toISOString().split("T")[0];
      setValue("expense_date", today);
      setUploadedFiles([]);
      setTempFiles([]);
    }
  }, [expense, reset, setValue]);

  // Filter entities when expense type changes
  useEffect(() => {
    if (watchedTypeId) {
      const typeEntities = entities.filter(
        (entity) => entity.expense_type_id === watchedTypeId
      );
      setFilteredEntities(typeEntities);
      setSelectedTypeId(watchedTypeId);

      // Reset entity selection if current entity doesn't match new type
      const currentEntityId = watch("entity_id");
      const currentEntityValid = typeEntities.some(
        (entity) => entity.id === currentEntityId
      );
      if (!currentEntityValid) {
        setValue("entity_id", "");
      }
    } else {
      setFilteredEntities([]);
      setSelectedTypeId("");
      setValue("entity_id", "");
    }
  }, [watchedTypeId, entities, setValue, watch]);

  const onFormSubmit = async (data) => {
    // Process tags
    const tags = data.tags
      ? data.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag)
      : [];

    // Format amount
    const amount = parseFloat(data.amount);

    const submitData = {
      ...data,
      amount,
      tags: tags.length > 0 ? tags : null,
      notes: data.notes || null,
      tempFiles: tempFiles, // Pasar archivos temporales para nuevo gasto
    };

    const success = await onSubmit(submitData);
    if (success && !isEditing) {
      reset();
      setUploadedFiles([]);
      setTempFiles([]);
    }
  };

  const handleFileUpload = (files) => {
    if (isEditing && expense?.id) {
      // Para gastos existentes, usar el flujo normal
      setUploadedFiles([...uploadedFiles, ...files]);
    } else {
      // Para nuevos gastos, almacenar temporalmente
      setTempFiles([...tempFiles, ...files]);
    }
  };

  const handleFileRemove = (fileIndex) => {
    if (isEditing && expense?.id) {
      setUploadedFiles(uploadedFiles.filter((_, index) => index !== fileIndex));
    } else {
      setTempFiles(tempFiles.filter((_, index) => index !== fileIndex));
    }
  };

  // Quick amount buttons
  const quickAmounts = [5, 10, 20, 50, 100];

  const setQuickAmount = (amount) => {
    setValue("amount", amount.toString());
  };

  return (
    <div className="expense-form md-card">
      <div className="form-header">
        <h3 className="md-typescale-title-large">
          {isEditing ? "Editar Gasto" : "Nuevo Gasto"}
        </h3>
        <p className="md-typescale-body-small form-subtitle">
          {isEditing
            ? "Actualice sus datos de gastos"
            : `Añadir gastos para ${new Date().toLocaleDateString("es-ES", {
                month: "long",
                year: "numeric",
              })}`}
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-content">
        {/* ... resto de los campos del formulario ... */}

        {/* Amount and Date Row */}
        <div className="form-row form-row-split">
          <div className="md-text-field">
            <label htmlFor="amount" className="md-text-field-label">
              Importe (€) *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              className={`md-text-field-input ${errors.amount ? "error" : ""}`}
              placeholder="0.00"
              {...register("amount", {
                required: "El importe es obligatorio",
                min: {
                  value: 0.01,
                  message: "El importe debe ser superior a 0",
                },
                max: {
                  value: 999999.99,
                  message: "Importe demasiado elevado",
                },
              })}
              disabled={isSubmitting}
              autoFocus="true"
            />
            {errors.amount && (
              <span className="md-text-field-error">
                {errors.amount.message}
              </span>
            )}

            {/* Quick Amount Buttons */}
            <div className="quick-amounts">
              {quickAmounts.map((amount) => (
                <button
                  key={amount}
                  type="button"
                  className="quick-amount-button"
                  onClick={() => setQuickAmount(amount)}
                  disabled={isSubmitting}
                >
                  €{amount}
                </button>
              ))}
            </div>
          </div>

          <div className="md-text-field">
            <label htmlFor="expense_date" className="md-text-field-label">
              Fecha *
            </label>
            <input
              id="expense_date"
              type="date"
              className={`md-text-field-input ${
                errors.expense_date ? "error" : ""
              }`}
              {...register("expense_date", {
                required: "La fecha es obligatoria",
              })}
              disabled={isSubmitting}
            />
            {errors.expense_date && (
              <span className="md-text-field-error">
                {errors.expense_date.message}
              </span>
            )}
          </div>
        </div>

        {/* Expense Type */}
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="expense_type_id" className="md-text-field-label">
              Tipo de gasto *
            </label>
            <select
              id="expense_type_id"
              className={`md-text-field-input ${
                errors.expense_type_id ? "error" : ""
              }`}
              {...register("expense_type_id", {
                required: "El tipo de gasto es obligatorio",
              })}
              disabled={isSubmitting}
            >
              <option value="">Selecciona un tipo de gasto</option>
              {expenseTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.icon} {type.name}
                </option>
              ))}
            </select>
            {errors.expense_type_id && (
              <span className="md-text-field-error">
                {errors.expense_type_id.message}
              </span>
            )}
          </div>
        </div>

        {/* Entity */}
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="entity_id" className="md-text-field-label">
              Entidad *
            </label>
            <select
              id="entity_id"
              className={`md-text-field-input ${
                errors.entity_id ? "error" : ""
              }`}
              {...register("entity_id", {
                required: "La entidad es obligatoria",
              })}
              disabled={isSubmitting || !selectedTypeId}
            >
              <option value="">
                {selectedTypeId
                  ? "Seleccionar entidad"
                  : "Seleccione primero el tipo de gasto"}
              </option>
              {filteredEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.name}
                </option>
              ))}
            </select>
            {errors.entity_id && (
              <span className="md-text-field-error">
                {errors.entity_id.message}
              </span>
            )}
            {filteredEntities.length === 0 && selectedTypeId && (
              <span className="md-text-field-error">
                No se han encontrado entidades para este tipo de gasto. Por
                favor, añada una en Settings.
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="description" className="md-text-field-label">
              Descripción
            </label>
            <input
              id="description"
              type="text"
              className="md-text-field-input"
              placeholder="Brief description of the expense"
              {...register("description", {
                maxLength: {
                  value: 200,
                  message: "Description must be less than 200 characters",
                },
              })}
              disabled={isSubmitting}
            />
            {errors.description && (
              <span className="md-text-field-error">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="tags" className="md-text-field-label">
              Etiquetas
            </label>
            <input
              id="tags"
              type="text"
              className="md-text-field-input"
              placeholder="Separe las etiquetas con comas (por ejemplo, urgente, negocios)"
              {...register("tags")}
              disabled={isSubmitting}
            />
            <span className="md-typescale-body-small field-help">
              Añade etiquetas para clasificar y encontrar los gastos más
              fácilmente
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="notes" className="md-text-field-label">
              Notas
            </label>
            <textarea
              id="notes"
              className="md-text-field-input"
              placeholder="Notas o detalles adicionales sobre este gasto"
              rows="3"
              {...register("notes", {
                maxLength: {
                  value: 500,
                  message: "Las notas deben tener menos de 500 caracteres",
                },
              })}
              disabled={isSubmitting}
            />
            {errors.notes && (
              <span className="md-text-field-error">
                {errors.notes.message}
              </span>
            )}
          </div>
        </div>

        {/* File Upload */}
        <div className="form-section">
          <h4 className="md-typescale-title-small section-title">
            Recibos y documentos
          </h4>
          {isEditing && expense?.id ? (
            // Para edición, usar el expense ID real
            <FileUpload
              expenseId={expense.id}
              onFileUpload={handleFileUpload}
              uploadedFiles={uploadedFiles}
              onFileRemove={handleFileRemove}
              disabled={isSubmitting}
            />
          ) : (
            // Para nuevo gasto, mostrar solo la interfaz sin funcionalidad de subida
            <div className="temp-file-upload">
              <div className="upload-notice">
                <p className="md-typescale-body-medium">
                  📎 Los archivos se podrán subir después de crear el gasto
                </p>
                <p className="md-typescale-body-small">
                  Una vez creado el gasto, podrás editarlo para añadir recibos y
                  documentos
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="md-button md-button-outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>

          <Button
            type="submit"
            className={`${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting || filteredEntities.length === 0}
          >
            {isSubmitting
              ? isEditing
                ? "Actualizando..."
                : "Creando..."
              : isEditing
              ? "Actualizar Gasto"
              : "Crear Gasto"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
