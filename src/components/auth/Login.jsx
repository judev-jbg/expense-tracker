import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../common/Input";
import Button from "../common/Button";
import { MdEmail, MdLock } from "react-icons/md";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setError,
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const emailValue = watch("email");
  const passwordValue = watch("password");

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
      <div className="auth-card md-card">
        <div className="auth-card-header">
          <img
            src="/icon-512x512.png"
            alt="Toolstock Logo"
            className="login-logo"
          />
          <h1 className="md-typescale-headline-medium">Expense Tracker</h1>
          <p className="md-typescale-body-medium auth-subtitle">
            Acceda a su cuenta para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
          <div className="md-text-field">
            <Input
              label="Correo electrónico"
              type="email"
              id="email"
              name="email"
              value={emailValue}
              required
              icon={<MdEmail />}
              fullWidth
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
            />

            {errors.email && (
              <span className="md-text-field-error">
                {errors.email.message}
              </span>
            )}
          </div>

          <Input
            label="Contraseña"
            type="password" // El tipo inicial es password
            id="password"
            name="password"
            value={passwordValue}
            required
            icon={<MdLock />}
            fullWidth
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
          />

          <div className="auth-actions">
            <Link to="/forgot-password" className="forgot-password-link">
              ¿Ha olvidado su contraseña?
            </Link>
          </div>

          <Button type="submit" size="large" fullWidth disabled={isLoading}>
            {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        {/* Remove the auth-footer section that had the "Sign up" link */}
        <div className="auth-footer">
          <p className="md-typescale-body-small auth-note">
            Póngase en contacto con su administrador si necesita una cuenta.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
