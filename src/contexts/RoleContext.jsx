import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { userManagementService } from "../libs/configService";

const RoleContext = createContext({
  role: "user",
  isAdmin: false,
  loading: true,
  checkRole: async () => {},
});

export const RoleProvider = ({ children }) => {
  const { user } = useAuth();
  const [role, setRole] = useState("user");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      checkRole();
    } else {
      setRole("user");
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const checkRole = async () => {
    setLoading(true);

    try {
      const [roleResult, adminResult] = await Promise.all([
        userManagementService.getUserRole(),
        userManagementService.isAdmin(),
      ]);

      if (roleResult.error) {
        console.error("Error getting user role:", roleResult.error);
      } else {
        setRole(roleResult.role);
      }

      if (adminResult.error) {
        console.error("Error checking admin status:", adminResult.error);
      } else {
        setIsAdmin(adminResult.isAdmin);
      }
    } catch (error) {
      console.error("Error checking user role:", error);
    } finally {
      setLoading(false);
    }
  };

  const value = {
    role,
    isAdmin,
    loading,
    checkRole,
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);

  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }

  return context;
};

// HOC for admin-only components
export const withAdminRole = (Component) => {
  return function AdminOnlyComponent(props) {
    const { isAdmin, loading } = useRole();

    if (loading) {
      return (
        <div className="loading-container">
          <div className="loading-spinner">Loading...</div>
        </div>
      );
    }

    if (!isAdmin) {
      return (
        <div className="access-denied">
          <div
            className="md-card"
            style={{ padding: "24px", textAlign: "center" }}
          >
            <h3 className="md-typescale-title-medium">Access Denied</h3>
            <p className="md-typescale-body-medium">
              You don't have permission to access this feature.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
