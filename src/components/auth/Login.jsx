import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await signIn(data.email, data.password);

      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        // Handle specific error messages
        if (result.error.includes("Invalid login credentials")) {
          setError("password", {
            type: "manual",
            message: "Invalid email or password",
          });
        } else if (result.error.includes("Email not confirmed")) {
          setError("email", {
            type: "manual",
            message: "Please check your email and confirm your account",
          });
        } else {
          setError("password", {
            type: "manual",
            message: result.error,
          });
        }
      }
    } catch (error) {
      setError("password", {
        type: "manual",
        message: "An unexpected error occurred",
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <h3 className="md-typescale-headline-small">Welcome back</h3>
          <p className="md-typescale-body-medium auth-subtitle">
            Sign in to your account to continue
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
                placeholder="Enter your password"
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

          <div className="auth-actions">
            <Link to="/forgot-password" className="forgot-password-link">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className={`md-button md-button-filled auth-submit-button ${
              isLoading ? "loading" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Remove the auth-footer section that had the "Sign up" link */}
        <div className="auth-footer">
          <p className="md-typescale-body-small auth-note">
            Contact your administrator if you need an account.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
