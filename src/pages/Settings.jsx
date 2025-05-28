import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useRole } from "../contexts/RoleContext";
import ExpenseTypesManager from "../components/settings/ExpenseTypesManager";
import EntitiesManager from "../components/settings/EntitiesManager";
import UserPreferences from "../components/settings/UserPreferences";
import UserManagement from "../components/settings/UserManagement";

const Settings = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { isAdmin, loading: roleLoading } = useRole();
  const [activeSection, setActiveSection] = useState("expense-types");

  // Define sections based on user role
  const getSections = () => {
    const baseSections = [
      {
        id: "expense-types",
        title: "Expense Types",
        icon: "🏷️",
        description: "Manage expense categories",
      },
      {
        id: "entities",
        title: "Entities",
        icon: "🏢",
        description: "Manage companies and providers",
      },
      {
        id: "preferences",
        title: "Preferences",
        icon: "⚙️",
        description: "User settings and preferences",
      },
    ];

    if (isAdmin) {
      baseSections.splice(0, 0, {
        id: "user-management",
        title: "User Management",
        icon: "👥",
        description: "Manage system users and permissions",
      });
    }

    return baseSections;
  };

  const sections = getSections();

  // Auto-select user management for admins
  useEffect(() => {
    if (!roleLoading && isAdmin && activeSection === "expense-types") {
      setActiveSection("user-management");
    }
  }, [isAdmin, roleLoading]);

  const renderActiveSection = () => {
    switch (activeSection) {
      case "user-management":
        return isAdmin ? <UserManagement /> : null;
      case "expense-types":
        return <ExpenseTypesManager />;
      case "entities":
        return <EntitiesManager />;
      case "preferences":
        return <UserPreferences />;
      default:
        return <ExpenseTypesManager />;
    }
  };

  if (roleLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="md-typescale-headline-medium">Settings</h1>
        <p className="md-typescale-body-medium settings-subtitle">
          Manage your expense categories, entities, and preferences
          {isAdmin && " · Administrator Access"}
        </p>
      </div>

      {/* Section Navigation */}
      <div className="settings-navigation">
        {sections.map((section) => (
          <button
            key={section.id}
            className={`settings-nav-item ${
              activeSection === section.id ? "active" : ""
            }`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="settings-nav-icon">{section.icon}</span>
            <div className="settings-nav-content">
              <span className="settings-nav-title md-typescale-title-medium">
                {section.title}
                {section.id === "user-management" && (
                  <span className="admin-badge">Admin</span>
                )}
              </span>
              <span className="settings-nav-description md-typescale-body-small">
                {section.description}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Active Section Content */}
      <div className="settings-content">{renderActiveSection()}</div>
    </div>
  );
};

export default Settings;
