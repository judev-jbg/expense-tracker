import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Button from "../common/Button";

const UserForm = ({ user, onSubmit, onCancel, isEditing }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user",
      currency: "EUR",
      theme: "dark",
      is_active: true,
    },
  });

  const watchedPassword = watch("password");

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.first_name || "",
        lastName: user.last_name || "",
        email: user.email || "",
        password: "", // Never pre-fill passwords
        confirmPassword: "",
        role: user.role || "user",
        currency: user.currency || "EUR",
        theme: user.theme || "dark",
        is_active: user.is_active !== false,
      });
    }
  }, [user, reset]);

  const onFormSubmit = async (data) => {
    // Remove password fields if not provided (for editing)
    if (isEditing && !data.password) {
      delete data.password;
      delete data.confirmPassword;
    }

    const success = await onSubmit(data);
    if (success && !isEditing) {
      reset();
    }
  };

  const roles = [
    {
      value: "user",
      label: "Usuario",
      description: "Pueden gestionar sus propios gastos",
    },
    {
      value: "admin",
      label: "Administrador",
      description: "Acceso total al sistema, incluida la gestión de usuarios",
    },
  ];

  const currencies = [
    { code: "EUR", name: "Euro (€)" },
    { code: "USD", name: "US Dollar ($)" },
    { code: "GBP", name: "British Pound (£)" },
    { code: "JPY", name: "Japanese Yen (¥)" },
  ];

  const themes = [
    { value: "dark", label: "Tema oscuro" },
    { value: "light", label: "Tema claro" },
  ];

  return (
    <div className="user-form md-card">
      <div className="form-header">
        <h3 className="md-typescale-title-large">
          {isEditing ? "Editar Usuario" : "Nuevo Usuario"}
        </h3>
        <p className="md-typescale-body-small form-subtitle">
          {isEditing
            ? "Actualizar la información y los permisos de los usuarios"
            : "Crear una nueva cuenta de usuario con los permisos adecuados"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-content">
        {/* Personal Information */}
        <div className="form-section">
          <h4 className="md-typescale-title-small section-title">
            Información Personal
          </h4>

          <div className="form-row form-row-split">
            <div className="md-text-field">
              <label htmlFor="firstName" className="md-text-field-label">
                Nombre *
              </label>
              <input
                id="firstName"
                type="text"
                className={`md-text-field-input ${
                  errors.firstName ? "error" : ""
                }`}
                placeholder="John"
                {...register("firstName", {
                  required: "El nombre es obligatorio",
                  minLength: {
                    value: 2,
                    message: "El nombre debe tener al menos 2 caracteres",
                  },
                })}
                disabled={isSubmitting}
                autoFocus="true"
              />
              {errors.firstName && (
                <span className="md-text-field-error">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="md-text-field">
              <label htmlFor="lastName" className="md-text-field-label">
                Apellidos *
              </label>
              <input
                id="lastName"
                type="text"
                className={`md-text-field-input ${
                  errors.lastName ? "error" : ""
                }`}
                placeholder="Doe"
                {...register("lastName", {
                  required: "Apellido obligatorio",
                  minLength: {
                    value: 2,
                    message: "El apellido debe tener al menos 2 caracteres",
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.lastName && (
                <span className="md-text-field-error">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          <div className="form-row">
            <div className="md-text-field">
              <label htmlFor="email" className="md-text-field-label">
                Email *
              </label>
              <input
                id="email"
                type="email"
                className={`md-text-field-input ${errors.email ? "error" : ""}`}
                placeholder="john.doe@example.com"
                {...register("email", {
                  required: "Correo electrónico obligatorio",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Email invalido",
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.email && (
                <span className="md-text-field-error">
                  {errors.email.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Authentication */}
        <div className="form-section">
          <h4 className="md-typescale-title-small section-title">
            Autenticación
            {isEditing && (
              <span className="optional-note">
                (Dejar en blanco para mantener la contraseña actual)
              </span>
            )}
          </h4>

          <div className="form-row form-row-split">
            <div className="md-text-field">
              <label htmlFor="password" className="md-text-field-label">
                Contraseña {!isEditing && "*"}
              </label>
              <input
                id="password"
                type="password"
                className={`md-text-field-input ${
                  errors.password ? "error" : ""
                }`}
                placeholder={
                  isEditing
                    ? "Dejar en blanco para mantenerlo actualizado"
                    : "Crea una contraseña segura"
                }
                {...register("password", {
                  required: isEditing ? false : "La contraseña es obligatoria",
                  minLength: {
                    value: 6,
                    message: "La contraseña debe tener al menos 6 caracteres",
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.password && (
                <span className="md-text-field-error">
                  {errors.password.message}
                </span>
              )}
            </div>

            <div className="md-text-field">
              <label htmlFor="confirmPassword" className="md-text-field-label">
                Confirmar Contraseña {!isEditing && "*"}
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`md-text-field-input ${
                  errors.confirmPassword ? "error" : ""
                }`}
                placeholder={
                  isEditing
                    ? "Confirmar nueva contraseña"
                    : "Confirmar contraseña"
                }
                {...register("confirmPassword", {
                  required:
                    !isEditing || watchedPassword
                      ? "Por favor confirma tu contraseña"
                      : false,
                  validate: (value) => {
                    if (watchedPassword && value !== watchedPassword) {
                      return "La contraseña no coincide";
                    }
                    return true;
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.confirmPassword && (
                <span className="md-text-field-error">
                  {errors.confirmPassword.message}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Permissions & Settings */}
        <div className="form-section">
          <h4 className="md-typescale-title-small section-title">
            Permisos y Configuración
          </h4>

          <div className="form-row">
            <div className="md-text-field">
              <label htmlFor="role" className="md-text-field-label">
                Rol *
              </label>
              <select
                id="role"
                className={`md-text-field-input ${errors.role ? "error" : ""}`}
                {...register("role", {
                  required: "El rol es obligatorio",
                })}
                disabled={isSubmitting}
              >
                {roles.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <span className="md-text-field-error">
                  {errors.role.message}
                </span>
              )}

              {/* Role Descriptions */}
              <div className="role-descriptions">
                {roles.map((role) => (
                  <div key={role.value} className="role-description">
                    <strong>{role.label}:</strong> {role.description}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="form-row form-row-split">
            <div className="md-text-field">
              <label htmlFor="currency" className="md-text-field-label">
                Moneda por defecto
              </label>
              <select
                id="currency"
                className="md-text-field-input"
                {...register("currency")}
                disabled={isSubmitting}
              >
                {currencies.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md-text-field">
              <label htmlFor="theme" className="md-text-field-label">
                Tema por defecto
              </label>
              <select
                id="theme"
                className="md-text-field-input"
                {...register("theme")}
                disabled={isSubmitting}
              >
                {themes.map((theme) => (
                  <option key={theme.value} value={theme.value}>
                    {theme.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {isEditing && (
            <div className="form-row">
              <label className="checkbox-item">
                <input
                  type="checkbox"
                  className="checkbox-input"
                  {...register("is_active")}
                  disabled={isSubmitting}
                />
                <span className="checkbox-label md-typescale-body-medium">
                  Usuario activo
                </span>
                <span className="checkbox-description md-typescale-body-small">
                  Los usuarios inactivos no pueden acceder al sistema
                </span>
              </label>
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
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEditing
                ? "Actualizando..."
                : "Creando..."
              : isEditing
              ? "Actualizar Usuario"
              : "Crear Usuario"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
