import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { FaCrown } from "react-icons/fa6";
import { BiSolidUser } from "react-icons/bi";
import { SiCyberdefenders } from "react-icons/si";
import { MdEdit, MdCheck, MdClose, MdSunny } from "react-icons/md";
import { IoFingerPrint } from "react-icons/io5";
import { GrMoney } from "react-icons/gr";
import { IoMdMoon } from "react-icons/io";
import { FaMoneyBill1Wave } from "react-icons/fa6";

const UserCard = ({
  user,
  canEdit,
  onEdit,
  onDeactivate,
  onReactivate,
  onResetPassword,
}) => {
  const { user: currentUser } = useAuth();
  const [showActions, setShowActions] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [isResetting, setIsResetting] = useState(false);

  const isCurrentUser = currentUser && currentUser.id === user.id;

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "admin":
        return "#F44336"; // Red
      case "user":
        return "#2196F3"; // Blue
      default:
        return "#9E9E9E"; // Gray
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case "admin":
        return <FaCrown />;
      case "user":
        return <BiSolidUser />;
      default:
        return <SiCyberdefenders />;
    }
  };

  const getUserInitials = () => {
    const firstName = user.first_name || "";
    const lastName = user.last_name || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "??";
  };

  const handlePasswordReset = async () => {
    if (!newPassword || newPassword.length < 6) {
      alert("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsResetting(true);
    const success = await onResetPassword(user.id, newPassword);

    if (success) {
      setShowPasswordReset(false);
      setNewPassword("");
      alert("Contraseña restablecida correctamente");
    }
    setIsResetting(false);
  };

  const handleToggleActive = () => {
    if (user.is_active) {
      onDeactivate(user.id);
    } else {
      onReactivate(user.id);
    }
  };

  return (
    <div className={`user-card md-card ${!user.is_active ? "inactive" : ""}`}>
      <div className="user-card-header">
        <div className="user-avatar-container">
          <div className="user-avatar-large">{getUserInitials()}</div>
          <div
            className="user-role-badge"
            style={{ backgroundColor: getRoleColor(user.role) }}
          >
            <span className="role-icon">{getRoleIcon(user.role)}</span>
            <span className="role-text">{user.role}</span>
          </div>
        </div>

        {canEdit && (
          <div className="user-card-menu">
            <button
              className="card-menu-button"
              onClick={() => setShowActions(!showActions)}
              aria-label="User actions"
            >
              ⋮
            </button>

            {showActions && (
              <div className="user-actions-dropdown md-card">
                <button
                  className="action-item"
                  onClick={() => {
                    onEdit(user);
                    setShowActions(false);
                  }}
                >
                  <span className="action-icon">
                    <MdEdit />
                  </span>
                  Editar Usuario
                </button>

                <button
                  className="action-item"
                  onClick={() => {
                    setShowPasswordReset(true);
                    setShowActions(false);
                  }}
                >
                  <span className="action-icon">
                    <IoFingerPrint />
                  </span>
                  Resetear Contraseña
                </button>

                {!isCurrentUser && (
                  <button
                    className={`action-item ${
                      user.is_active ? "danger" : "success"
                    }`}
                    onClick={() => {
                      handleToggleActive();
                      setShowActions(false);
                    }}
                  >
                    <span className="action-icon">
                      {user.is_active ? <MdClose /> : <MdCheck />}
                    </span>
                    {user.is_active ? "Deactivar" : "Reactivar"}
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="user-card-content">
        <div className="user-info">
          <h3 className="user-name md-typescale-title-medium">
            {user.full_name ||
              `${user.first_name} ${user.last_name}` ||
              "Unknown User"}
          </h3>
          <p className="user-email md-typescale-body-medium">{user.email}</p>
        </div>

        <div className="user-status">
          <div className="status-item">
            <span className="status-label md-typescale-body-small">Estado</span>
            <span
              className={`status-value md-typescale-body-medium ${
                user.is_active ? "active" : "inactive"
              }`}
            >
              {user.is_active ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div className="status-item">
            <span className="status-label md-typescale-body-small">
              Email Verificado
            </span>
            <span
              className={`status-value md-typescale-body-medium ${
                user.email_confirmed_at ? "verified" : "unverified"
              }`}
            >
              {user.email_confirmed_at ? "Si" : "No"}
            </span>
          </div>
        </div>

        <div className="user-preferences">
          <div className="preference-item">
            <span className="preference-icon">
              <FaMoneyBill1Wave />
            </span>
            <span className="preference-text md-typescale-body-small">
              {user.currency || "EUR"}
            </span>
          </div>

          <div className="preference-item">
            <span className="preference-icon">
              {user.theme === "dark" ? <IoMdMoon /> : <MdSunny />}
            </span>
            <span className="preference-text md-typescale-body-small">
              {user.theme === "dark" ? "Oscuro" : "Claro"}
            </span>
          </div>
        </div>
      </div>

      <div className="user-card-footer">
        <div className="user-dates">
          <div className="date-item">
            <span className="date-label md-typescale-body-small">
              Registrado
            </span>
            <span className="date-value md-typescale-body-small">
              {formatDate(user.registered_at)}
            </span>
          </div>

          <div className="date-item">
            <span className="date-label md-typescale-body-small">
              Ultimo inicio de sesión
            </span>
            <span className="date-value md-typescale-body-small">
              {formatDate(user.last_sign_in_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Password Reset Modal */}
      {showPasswordReset && (
        <div className="password-reset-overlay">
          <div className="password-reset-modal md-card">
            <h3 className="md-typescale-title-medium">Reset Password</h3>
            <p className="md-typescale-body-medium">
              Set a new password for {user.full_name || user.email}
            </p>

            <div className="md-text-field">
              <label className="md-text-field-label">New Password</label>
              <input
                type="password"
                className="md-text-field-input"
                placeholder="Enter new password (min 6 characters)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isResetting}
              />
            </div>

            <div className="modal-actions">
              <button
                className="md-button md-button-outlined"
                onClick={() => {
                  setShowPasswordReset(false);
                  setNewPassword("");
                }}
                disabled={isResetting}
              >
                Cancel
              </button>
              <button
                className={`md-button md-button-filled ${
                  isResetting ? "loading" : ""
                }`}
                onClick={handlePasswordReset}
                disabled={isResetting || newPassword.length < 6}
              >
                {isResetting ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Overlay */}
      {showActions && (
        <div
          className="actions-overlay"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default UserCard;
