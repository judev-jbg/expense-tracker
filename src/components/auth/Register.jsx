import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const Register = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const watchPassword = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await signUp(data.email, data.password, {
        first_name: data.firstName,
        last_name: data.lastName,
        full_name: `${data.firstName} ${data.lastName}`,
      });

      if (result.success) {
        setRegistrationSuccess(true);
        // Note: With Supabase, user needs to confirm email before they can sign in
        // So we show success message instead of redirecting immediately
      } else {
        // Handle specific error messages
        if (result.error.includes("User already registered")) {
          setError("email", {
            type: "manual",
            message: "An account with this email already exists",
          });
        } else if (
          result.error.includes("Password should be at least 6 characters")
        ) {
          setError("password", {
            type: "manual",
            message: "Password should be at least 6 characters",
          });
        } else {
          setError("email", {
            type: "manual",
            message: result.error,
          });
        }
      }
    } catch (error) {
      setError("email", {
        type: "manual",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (registrationSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <h1 className="md-typescale-display-small">✅</h1>
            <h2 className="md-typescale-headline-medium">Check your email</h2>
          </div>
        </div>

        <div className="auth-card md-card">
          <div className="success-message">
            <h3 className="md-typescale-headline-small">
              Registration successful!
            </h3>
            <p className="md-typescale-body-medium">
              We've sent you a confirmation email. Please check your inbox and
              click the confirmation link to activate your account.
            </p>
            <p className="md-typescale-body-small auth-note">
              Don't forget to check your spam folder if you don't see the email.
            </p>
          </div>

          <div className="auth-actions">
            <Link to="/login" className="md-button md-button-filled">
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-header">
        <button
          className="theme-toggle-button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
        >
          {theme === "light" ? "🌙" : "☀️"}
        </button>

        <div className="auth-logo">
          <h1 className="md-typescale-display-small">💰</h1>
          <h2 className="md-typescale-headline-medium">Expense Tracker</h2>
        </div>
      </div>

      <div className="auth-card md-card">
        <div className="auth-card-header">
          <h3 className="md-typescale-headline-small">Create your account</h3>
          <p className="md-typescale-body-medium auth-subtitle">
            Get started with managing your expenses
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="name-fields-row">
            <div className="md-text-field">
              <label htmlFor="firstName" className="md-text-field-label">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                className={`md-text-field-input ${
                  errors.firstName ? "error" : ""
                }`}
                placeholder="First name"
                {...register("firstName", {
                  required: "First name is required",
                  minLength: {
                    value: 2,
                    message: "First name must be at least 2 characters",
                  },
                })}
                disabled={isLoading}
              />
              {errors.firstName && (
                <span className="md-text-field-error">
                  {errors.firstName.message}
                </span>
              )}
            </div>

            <div className="md-text-field">
              <label htmlFor="lastName" className="md-text-field-label">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                className={`md-text-field-input ${
                  errors.lastName ? "error" : ""
                }`}
                placeholder="Last name"
                {...register("lastName", {
                  required: "Last name is required",
                  minLength: {
                    value: 2,
                    message: "Last name must be at least 2 characters",
                  },
                })}
                disabled={isLoading}
              />
              {errors.lastName && (
                <span className="md-text-field-error">
                  {errors.lastName.message}
                </span>
              )}
            </div>
          </div>

          <div className="md-text-field">
            <label htmlFor="email" className="md-text-field-label">
              Email
            </label>
            <input
              id="email"
              type="email"
              className={`md-text-field-input ${errors.email ? "error" : ""}`}
              placeholder="Enter your email"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="md-text-field-error">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="md-text-field">
            <label htmlFor="password" className="md-text-field-label">
              Password
            </label>
            <div className="password-field-container">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                className={`md-text-field-input ${
                  errors.password ? "error" : ""
                }`}
                placeholder="Create a password"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.password && (
              <span className="md-text-field-error">
                {errors.password.message}
              </span>
            )}
          </div>

          <div className="md-text-field">
            <label htmlFor="confirmPassword" className="md-text-field-label">
              Confirm Password
            </label>
            <div className="password-field-container">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                className={`md-text-field-input ${
                  errors.confirmPassword ? "error" : ""
                }`}
                placeholder="Confirm your password"
                {...register("confirmPassword", {
                  required: "Please confirm your password",
                  validate: (value) =>
                    value === watchPassword || "The passwords do not match",
                })}
                disabled={isLoading}
              />
              <button
                type="button"
                className="password-toggle-button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              </button>
            </div>
            {errors.confirmPassword && (
              <span className="md-text-field-error">
                {errors.confirmPassword.message}
              </span>
            )}
          </div>

          <button
            type="submit"
            className={`md-button md-button-filled auth-submit-button ${
              isLoading ? "loading" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="md-typescale-body-medium">
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
