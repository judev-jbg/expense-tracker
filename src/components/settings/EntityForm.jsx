import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../common/Button";

const EntityForm = ({
  entity,
  expenseTypes,
  onSubmit,
  onCancel,
  isEditing,
}) => {
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
      expense_type_id: "",
      contact_info: {
        phone: "",
        email: "",
        website: "",
        address: "",
      },
    },
  });

  useEffect(() => {
    if (entity) {
      reset({
        name: entity.name || "",
        description: entity.description || "",
        expense_type_id: entity.expense_type_id || "",
        contact_info: {
          phone: entity.contact_info?.phone || "",
          email: entity.contact_info?.email || "",
          website: entity.contact_info?.website || "",
          address: entity.contact_info?.address || "",
        },
      });
    }
  }, [entity, reset]);

  const onFormSubmit = async (data) => {
    // Clean up contact_info - only include non-empty values
    const contactInfo = Object.entries(data.contact_info)
      .filter(([key, value]) => value && value.trim() !== "")
      .reduce((acc, [key, value]) => {
        acc[key] = value.trim();
        return acc;
      }, {});

    const submitData = {
      ...data,
      contact_info: Object.keys(contactInfo).length > 0 ? contactInfo : null,
    };

    const success = await onSubmit(submitData);
    if (success) {
      reset();
    }
  };

  return (
    <div className="entity-form md-card">
      <div className="form-header">
        <h3 className="md-typescale-title-large">
          {isEditing ? "Editar Entidad" : "Nueva Entidad"}
        </h3>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-content">
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
                required: "Expense type is required",
              })}
              disabled={isSubmitting}
              autoFocus="true"
            >
              <option value="">Selecciona el tipo de gasto</option>
              {expenseTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
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

        <div className="form-row">
          <div className="md-text-field">
            <label htmlFor="name" className="md-text-field-label">
              Nombre *
            </label>
            <input
              id="name"
              type="text"
              className={`md-text-field-input ${errors.name ? "error" : ""}`}
              placeholder="e.g. Mercadona, Endesa, Netflix"
              {...register("name", {
                required: "Name is required",
                minLength: {
                  value: 2,
                  message: "Name must be at least 2 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Name must be less than 100 characters",
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
              Descripción
            </label>
            <textarea
              id="description"
              className={`md-text-field-input ${
                errors.description ? "error" : ""
              }`}
              placeholder="Breve descripción de esta entidad"
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

        {/* Contact Information Section */}
        <div className="form-section">
          <h4 className="md-typescale-title-small section-title">
            Informacion de contacto (Opcional)
          </h4>

          <div className="form-row form-row-split">
            <div className="md-text-field">
              <label htmlFor="phone" className="md-text-field-label">
                Telefono
              </label>
              <input
                id="phone"
                type="tel"
                className="md-text-field-input"
                placeholder="+34 123 456 789"
                {...register("contact_info.phone")}
                disabled={isSubmitting}
              />
            </div>

            <div className="md-text-field">
              <label htmlFor="email" className="md-text-field-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className={`md-text-field-input ${
                  errors.contact_info?.email ? "error" : ""
                }`}
                placeholder="contacto@correo.com"
                {...register("contact_info.email", {
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "El email no es válido",
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.contact_info?.email && (
                <span className="md-text-field-error">
                  {errors.contact_info.email.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="md-text-field">
              <label htmlFor="website" className="md-text-field-label">
                Sitio WEB
              </label>
              <input
                id="website"
                type="url"
                className={`md-text-field-input ${
                  errors.contact_info?.website ? "error" : ""
                }`}
                placeholder="https://misitio.com"
                {...register("contact_info.website", {
                  pattern: {
                    value: /^https?:\/\/.+\..+/,
                    message: "La URL del sitio web no es válida",
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.contact_info?.website && (
                <span className="md-text-field-error">
                  {errors.contact_info.website.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="md-text-field">
              <label htmlFor="address" className="md-text-field-label">
                Dirección
              </label>
              <textarea
                id="address"
                className="md-text-field-input"
                placeholder="Calle, ciudad, código postal"
                rows="2"
                {...register("contact_info.address")}
                disabled={isSubmitting}
              />
            </div>
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
              ? "Actulizar Entidad"
              : "Crear Entidad"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EntityForm;
