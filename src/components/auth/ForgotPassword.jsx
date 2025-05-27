import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";

const ForgotPassword = () => {
  const { resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    getValues,
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    setIsLoading(true);

    try {
      const result = await resetPassword(data.email);

      if (result.success) {
        setEmailSent(true);
      } else {
        setError("email", {
          type: "manual",
          message: result.error,
        });
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

  const handleResendEmail = async () => {
    const email = getValues("email");
    if (email) {
      setIsLoading(true);
      await resetPassword(email);
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <h1 className="md-typescale-display-small">📧</h1>
            <h2 className="md-typescale-headline-medium">Check your email</h2>
          </div>
        </div>

        <div className="auth-card md-card">
          <div className="success-message">
            <h3 className="md-typescale-headline-small">Reset link sent!</h3>
            <p className="md-typescale-body-medium">
              We've sent a password reset link to your email address. Click the
              link in the email to reset your password.
            </p>
            <p className="md-typescale-body-small auth-note">
              Don't forget to check your spam folder if you don't see the email.
            </p>
          </div>

          <div className="auth-actions">
            <button
              type="button"
              className="md-button md-button-outlined"
              onClick={handleResendEmail}
              disabled={isLoading}
              style={{ marginBottom: "16px" }}
            >
              {isLoading ? "Sending..." : "Resend email"}
            </button>

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
          <h1 className="md-typescale-display-small">🔑</h1>
          <h2 className="md-typescale-headline-medium">Reset Password</h2>
        </div>
      </div>

      <div className="auth-card md-card">
        <div className="auth-card-header">
          <h3 className="md-typescale-headline-small">Forgot your password?</h3>
          <p className="md-typescale-body-medium auth-subtitle">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="md-text-field">
            <label htmlFor="email" className="md-text-field-label">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              className={`md-text-field-input ${errors.email ? "error" : ""}`}
              placeholder="Enter your email address"
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

          <button
            type="submit"
            className={`md-button md-button-filled auth-submit-button ${
              isLoading ? "loading" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Sending reset link..." : "Send reset link"}
          </button>
        </form>

        <div className="auth-footer">
          <p className="md-typescale-body-medium">
            Remember your password?{" "}
            <Link to="/login" className="auth-link">
              Back to Sign In
            </Link>
          </p>
          <p className="md-typescale-body-medium" style={{ marginTop: "8px" }}>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
