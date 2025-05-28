import { useEffect } from "react";
import { useForm } from "react-hook-form";

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
      label: "User",
      description: "Can manage their own expenses",
    },
    {
      value: "admin",
      label: "Administrator",
      description: "Full system access including user management",
    },
  ];

  const currencies = [
    { code: "EUR", name: "Euro (€)" },
    { code: "USD", name: "US Dollar ($)" },
    { code: "GBP", name: "British Pound (£)" },
    { code: "JPY", name: "Japanese Yen (¥)" },
  ];

  const themes = [
    { value: "dark", label: "Dark Theme" },
    { value: "light", label: "Light Theme" },
  ];

  return (
    <div className="user-form md-card">
      <div className="form-header">
        <h3 className="md-typescale-title-large">
          {isEditing ? "Edit User" : "New User"}
        </h3>
        <p className="md-typescale-body-small form-subtitle">
          {isEditing
            ? "Update user information and permissions"
            : "Create a new user account with appropriate permissions"}
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="form-content">
        {/* Personal Information */}
        <div className="form-section">
          <h4 className="md-typescale-title-small section-title">
            Personal Information
          </h4>

          <div className="form-row form-row-split">
            <div className="md-text-field">
              <label htmlFor="firstName" className="md-text-field-label">
                First Name *
              </label>
              <input
                id="firstName"
                type="text"
                className={`md-text-field-input ${
                  errors.firstName ? "error" : ""
                }`}
                placeholder="John"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters",
                  },
                })}
                disabled={isSubmitting}
              />
              {errors.firstName && (
                <span className="md-text-field-error">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="md-text-field">
              <label htmlFor="lastName" className="md-text-field-label">
                Last Name *
              </label>
              <input
                id="lastName"
                type="text"
                className={`md-text-field-input ${
                  errors.lastName ? "error" : ""
                }`}
                placeholder="Doe"
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters",
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
                Email Address *
              </label>
              <input
                id="email"
                type="email"
                className={`md-text-field-input ${errors.email ? "error" : ""}`}
                placeholder="john.doe@example.com"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
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
            Authentication{" "}
            {isEditing && (
              <span className="optional-note">
                (Leave blank to keep current password)
              </span>
            )}
          </h4>

          <div className="form-row form-row-split">
            <div className="md-text-field">
              <label htmlFor="password" className="md-text-field-label">
                Password {!isEditing && "*"}
              </label>
              <input
                id="password"
                type="password"
                className={`md-text-field-input ${
                  errors.password ? "error" : ""
                }`}
                placeholder={
                  isEditing
                    ? "Leave blank to keep current"
                    : "Create a secure password"
                }
                {...register("password", {
                  required: isEditing ? false : "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
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
                Confirm Password {!isEditing && "*"}
              </label>
              <input
                id="confirmPassword"
                type="password"
                className={`md-text-field-input ${
                  errors.confirmPassword ? "error" : ""
                }`}
                placeholder={
                  isEditing ? "Confirm new password" : "Confirm password"
                }
                {...register("confirmPassword", {
                  required:
                    !isEditing || watchedPassword
                      ? "Please confirm the password"
                      : false,
                  validate: (value) => {
                    if (watchedPassword && value !== watchedPassword) {
                      return "The passwords do not match";
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
            Permissions & Settings
          </h4>

          <div className="form-row">
            <div className="md-text-field">
              <label htmlFor="role" className="md-text-field-label">
                Role *
              </label>
              <select
                id="role"
                className={`md-text-field-input ${errors.role ? "error" : ""}`}
                {...register("role", {
                  required: "Role is required",
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
                Default Currency
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
                Default Theme
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
                  Active User
                </span>
                <span className="checkbox-description md-typescale-body-small">
                  Inactive users cannot sign in to the system
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
              ? "Update User"
              : "Create User"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
