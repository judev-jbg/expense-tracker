import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import Input from "../common/Input";
import Button from "../common/Button";
import { MdEmail, MdLock, MdOutlineErrorOutline } from "react-icons/md";

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    clearErrors,
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
    clearErrors();

    try {
      const result = await signIn(data.email, data.password);

      if (result.success) {
        navigate("/dashboard", { replace: true });
      } else {
        // Handle specific error messages
        if (result.error.includes("Invalid login credentials")) {
          setLoginError("Email o contraseña no válidos");
        } else if (result.error.includes("Email not confirmed")) {
          setLoginError("Compruebe su correo electrónico y confirme su cuenta");
        } else {
          setLoginError(result.error);
        }
      }
    } catch (error) {
      setLoginError("Se ha producido un error inesperado");
    } finally {
      reset();
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

          <div className="md-text-field">
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

            {errors.password && (
              <span className="md-text-field-error">
                {errors.password.message}
              </span>
            )}
          </div>

          {loginError && (
            <div className="md-text-field-error auth-error">
              <MdOutlineErrorOutline />
              {loginError}
            </div>
          )}

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
