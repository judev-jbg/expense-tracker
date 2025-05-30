import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import TopAppBar from "./TopAppBar";
import BottomNavigation from "./BottomNavigation";

const AppLayout = ({ children }) => {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case "/dashboard":
        return "Dashboard";
      case "/expenses":
        return "Expenses";
      case "/settings":
        return "Settings";
      default:
        return "Expense Tracker";
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setIsUserMenuOpen(false);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Toggle user menu
  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  return (
    <div className="app-layout">
      {/* Top App Bar */}
      <TopAppBar
        title={getPageTitle()}
        user={user}
        theme={theme}
        isUserMenuOpen={isUserMenuOpen}
        onToggleUserMenu={toggleUserMenu}
        onToggleTheme={toggleTheme}
        onSignOut={handleSignOut}
      />

      {/* Main Content */}
      <main className="main-content">
        <div className="page-content">{children}</div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation currentPath={location.pathname} />
    </div>
  );
};

export default AppLayout;
