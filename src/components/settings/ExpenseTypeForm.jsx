import { useEffect } from "react";
import { useForm } from "react-hook-form";

const ExpenseTypeForm = ({ expenseType, onSubmit, onCancel, isEditing }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      icon: "💰",
      color: "#6200ea",
    },
  });

  const watchedColor = watch("color");

  useEffect(() => {
    if (expenseType) {
      reset({
        name: expenseType.name || "",
        description: expenseType.description || "",
        icon: expenseType.icon || "💰",
        color: expenseType.color || "#6200ea",
      });
    }
  }, [expenseType, reset]);

  const onFormSubmit = async (data) => {
    const success = await onSubmit(data);
    if (success) {
      reset();
    }
  };

  const commonIcons = [
    "💰",
    "🍽️",
    "🚗",
    "💡",
    "🎬",
    "🏥",
    "🛍️",
    "🏠",
    "📱",
    "⛽",
    "🚌",
    "🎯",
    "💊",
    "🎓",
    "🧳",
    "🎮",
  ];

  return (
    <div className="expense-type-form md-card">
      <div className="form-header">
        <h3 className="md-typescale-title-large">
          {isEditing ? "Edit Expense Type" : "New Expense Type"}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-content">
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="name" className="md-text-field-label">
              Name *
            </label>
            <input
              id="name"
              type="text"
              className={`md-text-field-input ${errors.name ? "error" : ""}`}
              placeholder="e.g. Food & Dining"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                maxLength: {
                  value: 50,
                  message: "Name must be less than 50 characters",
                },
              })}
              disabled={isSubmitting}
            />
            {errors.name && (
              <span className="md-text-field-error">{errors.name.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="description" className="md-text-field-label">
              Description
            </label>
            <textarea
              id="description"
              className={`md-text-field-input ${
                errors.description ? "error" : ""
              }`}
              placeholder="Brief description of this expense type"
              rows="3"
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

        <div className="form-row form-row-split">
          <div className="md-text-field">
            <label htmlFor="icon" className="md-text-field-label">
              Icon
            </label>
            <input
              id="icon"
              type="text"
              className={`md-text-field-input ${errors.icon ? "error" : ""}`}
              placeholder="💰"
              {...register("icon", {
                required: "Icon is required",
              })}
              disabled={isSubmitting}
            />
            {errors.icon && (
              <span className="md-text-field-error">{errors.icon.message}</span>
            )}
          </div>

          <div className="md-text-field">
            <label htmlFor="color" className="md-text-field-label">
              Color
            </label>
            <div className="color-input-wrapper">
              <input
                id="color"
                type="color"
                className="color-input"
                {...register("color", {
                  required: "Color is required",
                })}
                disabled={isSubmitting}
              />
              <div
                className="color-preview"
                style={{ backgroundColor: watchedColor }}
              />
            </div>
            {errors.color && (
              <span className="md-text-field-error">
                {errors.color.message}
              </span>
            )}
          </div>
        </div>

        <div className="icon-selector">
          <label className="md-text-field-label">Quick Icon Selection</label>
          <div className="icon-grid">
            {commonIcons.map((icon) => (
              <button
                key={icon}
                type="button"
                className="icon-option"
                onClick={() => reset({ ...watch(), icon })}
                disabled={isSubmitting}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

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
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Updating..."
                : "Creating..."
              : isEditing
              ? "Update Type"
              : "Create Type"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseTypeForm;
