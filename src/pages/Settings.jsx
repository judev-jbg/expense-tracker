import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import ExpenseTypesManager from "../components/settings/ExpenseTypesManager";
import EntitiesManager from "../components/settings/EntitiesManager";
import UserPreferences from "../components/settings/UserPreferences";

const Settings = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [activeSection, setActiveSection] = useState("expense-types");

  const sections = [
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

  const renderActiveSection = () => {
    switch (activeSection) {
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

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1 className="md-typescale-headline-medium">Settings</h1>
        <p className="md-typescale-body-medium settings-subtitle">
          Manage your expense categories, entities, and preferences
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
