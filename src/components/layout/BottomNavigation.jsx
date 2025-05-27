import { Link } from "react-router-dom";

const BottomNavigation = ({ currentPath }) => {
  const navigationItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "📊",
      activeIcon: "📈",
    },
    {
      path: "/expenses",
      label: "Expenses",
      icon: "💳",
      activeIcon: "💰",
    },
    {
      path: "/settings",
      label: "Settings",
      icon: "⚙️",
      activeIcon: "🔧",
    },
  ];

  return (
    <nav
      className="md-navigation-bar"
      role="navigation"
      aria-label="Main navigation"
    >
      {navigationItems.map((item) => {
        const isActive = currentPath === item.path;

        return (
          <Link
            key={item.path}
            to={item.path}
            className={`md-navigation-item ${isActive ? "active" : ""}`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="md-navigation-icon" aria-hidden="true">
              {isActive ? item.activeIcon : item.icon}
            </span>
            <span className="md-navigation-label md-typescale-label-medium">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
