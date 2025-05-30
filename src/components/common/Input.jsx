import React, { useState } from "react";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

const Input = ({
  label,
  type = "text",
  id,
  name,
  value,
  onChange,
  onBlur,
  onFocus,
  placeholder,
  required = false,
  error,
  icon,
  fullWidth = false,
  className = "",
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const inputClasses = `md-input-container ${error ? "error" : ""} ${
    fullWidth ? "full-width" : ""
  } ${className}`;

  // Determinar si es un campo de contraseña
  const isPasswordField = type === "password";

  // Determinar el tipo actual del input
  const currentInputType = isPasswordField && showPassword ? "text" : type;

  const inputValue = value || "";
  const hasValue = inputValue !== "";
  const showLabel = isFocused || hasValue || placeholder;

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={inputClasses}>
      <div
        className={`md-input-outline ${isFocused ? "focused" : ""} ${
          hasValue ? "has-value" : ""
        }`}
      >
        {icon && <span className="md-input-icon">{icon}</span>}

        {type === "textarea" ? (
          <textarea
            id={id}
            name={name}
            value={inputValue}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="md-input md-textarea"
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        ) : (
          <input
            type={currentInputType}
            id={id}
            name={name}
            value={inputValue}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="md-input"
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        )}

        {/* Toggle de visibilidad de contraseña */}
        {isPasswordField && (
          <button
            type="button"
            className="md-password-toggle"
            onClick={togglePasswordVisibility}
            tabIndex={-1}
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
          </button>
        )}

        {label && (
          <label
            htmlFor={id}
            className={`md-input-label ${showLabel ? "active" : ""} ${
              icon ? "with-ico" : ""
            } ${isPasswordField ? "with-toggle" : ""}`}
          >
            {label}
          </label>
        )}

        <fieldset
          className={`md-input-fieldset ${icon ? "with-ico" : ""} ${
            isPasswordField ? "with-toggle" : ""
          }`}
        >
          <legend
            className={`md-input-legend ${showLabel ? "active" : ""} ${
              icon ? "with-ico" : ""
            } ${isPasswordField ? "with-toggle" : ""}`}
          >
            {label ? <span>{label}</span> : <span>&nbsp;</span>}
          </legend>
        </fieldset>
      </div>

      {error && <span className="md-input-error">{error}</span>}
    </div>
  );
};

export default Input;
