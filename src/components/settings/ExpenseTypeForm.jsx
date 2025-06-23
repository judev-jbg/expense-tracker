import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../common/Button";
import { COMMON_ICONS, IconRenderer } from "../../libs/iconMapping";

const ExpenseTypeForm = ({ expenseType, onSubmit, onCancel, isEditing }) => {
  const [selectedIconId, setSelectedIconId] = useState("card");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      name: "",
      description: "",
      icon: "card",
      color: "#6750a4",
    },
  });

  const watchedColor = watch("color");
  const watchedIcon = watch("icon");

  useEffect(() => {
    if (expenseType) {
      const iconId = expenseType.icon || "card";
      setSelectedIconId(iconId);
      reset({
        name: expenseType.name || "",
        description: expenseType.description || "",
        icon: iconId,
        color: expenseType.color || "#6750a4",
      });
    }
  }, [expenseType, reset]);

  useEffect(() => {
    if (watchedIcon) {
      setSelectedIconId(watchedIcon);
    }
  }, [watchedIcon]);

  const onFormSubmit = async (data) => {
    const success = await onSubmit(data);
    if (success && !isEditing) {
      reset();
      setSelectedIconId("card");
    }
  };

  const handleIconSelect = (iconId) => {
    setSelectedIconId(iconId);
    setValue("icon", iconId);
  };

  return (
    <div className="expense-type-form md-card">
      <div className="form-header">
        <h3 className="md-typescale-title-large">
          {isEditing ? "Editar Tipo de gasto" : "Nuevo Tipo de gasto"}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-content">
        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="name" className="md-text-field-label">
              Nombre *
            </label>
            <input
              id="name"
              type="text"
              className={`md-text-field-input ${errors.name ? "error" : ""}`}
              placeholder="ej. Comida & Comedores, Servicios, Suscripciones"
              {...register("name", {
                required: "El nombre es obligatorio",
                minLength: {
                  value: 2,
                  message: "El nombre debe tener al menos 2 caracteres",
                },
                maxLength: {
                  value: 50,
                  message: "El nombre debe tener menos de 50 caracteres",
                },
              })}
              disabled={isSubmitting}
              autoFocus="true"
            />
            {errors.name && (
              <span className="md-text-field-error">{errors.name.message}</span>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="description" className="md-text-field-label">
              Descripción
            </label>
            <textarea
              id="description"
              className={`md-text-field-input ${
                errors.description ? "error" : ""
              }`}
              placeholder="Breve descripción de este tipo de gasto"
              rows="3"
              {...register("description", {
                maxLength: {
                  value: 200,
                  message: "La descripción debe tener menos de 200 caracteres",
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
              Icono seleccionado
            </label>
            <div className="selected-icon-display">
              <div
                className="icon-preview"
                style={{ backgroundColor: watchedColor }}
              >
                <IconRenderer iconId={selectedIconId} />
              </div>
              <span className="selected-icon-name">
                {COMMON_ICONS.find((icon) => icon.id === selectedIconId)
                  ?.name || "Seleccionar icono"}
              </span>
            </div>
            <input
              type="hidden"
              {...register("icon", {
                required: "El icono es obligatorio",
              })}
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
                  required: "El color es obligatorio",
                })}
                disabled={isSubmitting}
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
          <label className="md-text-field-label">Selección de iconos</label>
          <div className="icon-grid">
            {COMMON_ICONS.map((icon) => (
              <button
                key={icon.id}
                type="button"
                className={`icon-option ${
                  selectedIconId === icon.id ? "selected" : ""
                }`}
                onClick={() => handleIconSelect(icon.id)}
                disabled={isSubmitting}
                title={icon.name}
              >
                <icon.component />
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
            Cancelar
          </button>

          <Button
            type="submit"
            className={`${isSubmitting ? "loading" : ""}`}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Actualizando..."
                : "Creando..."
              : isEditing
              ? "Actualizar Tipo de gasto"
              : "Crear Tipo de gasto"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseTypeForm;
