import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import FileUpload from "./FileUpload";

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
      // Format date for input
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
    };

    const success = await onSubmit(submitData);
    if (success && !isEditing) {
      reset();
      setUploadedFiles([]);
    }
  };

  const handleFileUpload = (files) => {
    setUploadedFiles([...uploadedFiles, ...files]);
  };

  const handleFileRemove = (fileIndex) => {
    setUploadedFiles(uploadedFiles.filter((_, index) => index !== fileIndex));
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
          {isEditing ? "Edit Expense" : "New Expense"}
        </h3>
        <p className="md-typescale-body-small form-subtitle">
          {isEditing
            ? "Update your expense details"
            : `Adding expense for ${new Date().toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}`}
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-content">
        {/* Amount and Date Row */}
        <div className="form-row form-row-split">
          <div className="md-text-field">
            <label htmlFor="amount" className="md-text-field-label">
              Amount (€) *
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              className={`md-text-field-input ${errors.amount ? "error" : ""}`}
              placeholder="0.00"
              {...register("amount", {
                required: "Amount is required",
                min: {
                  value: 0.01,
                  message: "Amount must be greater than 0",
                },
                max: {
                  value: 999999.99,
                  message: "Amount is too large",
                },
              })}
              disabled={isSubmitting}
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
              Date *
            </label>
            <input
              id="expense_date"
              type="date"
              className={`md-text-field-input ${
                errors.expense_date ? "error" : ""
              }`}
              {...register("expense_date", {
                required: "Date is required",
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
              Expense Type *
            </label>
            <select
              id="expense_type_id"
              className={`md-text-field-input ${
                errors.expense_type_id ? "error" : ""
              }`}
              {...register("expense_type_id", {
                required: "Expense type is required",
              })}
              disabled={isSubmitting}
            >
              <option value="">Select expense type</option>
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
              Entity *
            </label>
            <select
              id="entity_id"
              className={`md-text-field-input ${
                errors.entity_id ? "error" : ""
              }`}
              {...register("entity_id", {
                required: "Entity is required",
              })}
              disabled={isSubmitting || !selectedTypeId}
            >
              <option value="">
                {selectedTypeId ? "Select entity" : "Select expense type first"}
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
                No entities found for this expense type. Please add one in
                Settings.
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="description" className="md-text-field-label">
              Description
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
              Tags
            </label>
            <input
              id="tags"
              type="text"
              className="md-text-field-input"
              placeholder="Separate tags with commas (e.g., urgent, business)"
              {...register("tags")}
              disabled={isSubmitting}
            />
            <span className="md-typescale-body-small field-help">
              Add tags to categorize and find expenses easier
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="notes" className="md-text-field-label">
              Notes
            </label>
            <textarea
              id="notes"
              className="md-text-field-input"
              placeholder="Additional notes or details about this expense"
              rows="3"
              {...register("notes", {
                maxLength: {
                  value: 500,
                  message: "Notes must be less than 500 characters",
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
            Receipts & Documents
          </h4>
          <FileUpload
            onFileUpload={handleFileUpload}
            uploadedFiles={uploadedFiles}
            onFileRemove={handleFileRemove}
            disabled={isSubmitting}
          />
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            className="md-button md-button-outlined"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`md-button md-button-filled ${
              isSubmitting ? "loading" : ""
            }`}
            disabled={isSubmitting || filteredEntities.length === 0}
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Expense"
              : "Create Expense"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
