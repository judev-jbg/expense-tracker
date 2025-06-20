import { useState, useEffect } from "react";
import { useRole } from "../../contexts/RoleContext";
import { userManagementService } from "../../libs/configService";
import UserForm from "./UserForm";
import UserCard from "./UserCard";
import Spinner from "../common/Spinner";
import Button from "../common/Button";

const UserManagement = () => {
  const { isAdmin, loading: roleLoading } = useRole();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!roleLoading) {
      loadUsers();
    }
  }, [roleLoading]);

  const loadUsers = async () => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const { data, error } = await userManagementService.getAllUsers();

    if (error) {
      setError(error);
    } else {
      setUsers(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async (formData) => {
    const { data, error } = await userManagementService.createUser(formData);

    if (error) {
      setError(error);
      return false;
    } else {
      await loadUsers(); // Reload users list
      setShowForm(false);
      setError("");
      return true;
    }
  };

  const handleUpdate = async (formData) => {
    const { data, error } = await userManagementService.updateUser(
      editingUser.id,
      formData
    );

    if (error) {
      setError(error);
      return false;
    } else {
      await loadUsers(); // Reload users list
      setEditingUser(null);
      setShowForm(false);
      setError("");
      return true;
    }
  };

  const handleDeactivate = async (userId) => {
    const { error } = await userManagementService.deactivateUser(userId);

    if (error) {
      setError(error);
    } else {
      await loadUsers();
      setError("");
    }
  };

  const handleReactivate = async (userId) => {
    const { error } = await userManagementService.reactivateUser(userId);

    if (error) {
      setError(error);
    } else {
      await loadUsers();
      setError("");
    }
  };

  const handleResetPassword = async (userId, newPassword) => {
    const { error } = await userManagementService.resetUserPassword(
      userId,
      newPassword
    );

    if (error) {
      setError(error);
      return false;
    } else {
      setError("");
      return true;
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingUser(null);
    setError("");
  };

  if (roleLoading || loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <Spinner />
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="user-management">
        <div className="section-header">
          <div className="section-title">
            <h2 className="md-typescale-headline-small">Usuarios</h2>
            <p className="md-typescale-body-medium section-description">
              Ver usuarios del sistema
            </p>
          </div>
        </div>

        <div className="users-grid">
          {users.length === 0 ? (
            <div className="empty-state md-card">
              <div className="empty-icon">👥</div>
              <h3 className="md-typescale-title-medium">
                <Spinner />
              </h3>
            </div>
          ) : (
            users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                canEdit={false}
                onEdit={() => {}}
                onDeactivate={() => {}}
                onReactivate={() => {}}
                onResetPassword={() => {}}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="user-management">
      <div className="section-header">
        <div className="section-title">
          <h2 className="md-typescale-headline-small">Gestión de usuarios</h2>
          <p className="md-typescale-body-medium section-description">
            Crear y gestionar usuarios del sistema, asignar funciones y
            permisos.
          </p>
        </div>

        <Button
          children="Agregar usuario"
          onClick={() => setShowForm(true)}
          disabled={showForm}
        />
      </div>

      {error && (
        <div className="error-message md-card">
          <span className="error-icon">⚠️</span>
          <span className="md-typescale-body-medium">{error}</span>
        </div>
      )}

      {showForm && (
        <UserForm
          user={editingUser}
          onSubmit={editingUser ? handleUpdate : handleCreate}
          onCancel={handleCancelForm}
          isEditing={!!editingUser}
        />
      )}

      <div className="users-grid">
        {users.length === 0 ? (
          <div className="empty-state md-card">
            <div className="empty-icon">👥</div>
            <h3 className="md-typescale-title-medium">Aún no hay usuarios</h3>
            <p className="md-typescale-body-medium">
              Crea tu primer usuario para empezar.
            </p>
          </div>
        ) : (
          users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              canEdit={isAdmin}
              onEdit={handleEdit}
              onDeactivate={handleDeactivate}
              onReactivate={handleReactivate}
              onResetPassword={handleResetPassword}
            />
          ))
        )}
      </div>

      <div className="user-stats md-card">
        <h3 className="md-typescale-title-medium">Estadísticas de usuarios</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{users.length}</span>
            <span className="stat-label">Usuarios totales</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {users.filter((u) => u.is_active).length}
            </span>
            <span className="stat-label">Usuarios activos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {users.filter((u) => u.role === "admin").length}
            </span>
            <span className="stat-label">Administradores</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {users.filter((u) => u.last_sign_in_at).length}
            </span>
            <span className="stat-label">¿Alguna vez ha iniciado sesión?</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
