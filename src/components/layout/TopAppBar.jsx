import { useRef, useEffect } from "react";
import { MdSunny } from "react-icons/md";
import { RiMoonFill } from "react-icons/ri";

const TopAppBar = ({
  title,
  user,
  theme,
  isUserMenuOpen,
  onToggleUserMenu,
  onToggleTheme,
  onSignOut,
}) => {
  const userMenuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        if (isUserMenuOpen) {
          onToggleUserMenu();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen, onToggleUserMenu]);

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "??";

    const firstName = user.user_metadata?.first_name || "";
    const lastName = user.user_metadata?.last_name || "";

    if (firstName && lastName) {
      return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    } else if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "??";
  };

  return (
    <header className="md-top-app-bar">
      {/* App Title */}
      <div className="logo">
        <img
          src="/icon-512x512.png"
          alt="Toolstock Logo"
          className="logo-app"
        />
        <h1>Expense Traker</h1>
      </div>

      {/* Actions */}
      <div className="top-app-bar-actions">
        {/* Theme Toggle */}
        <button
          className="top-app-bar-action-button"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
          title={`${theme === "light" ? "Dark" : "Light"} theme`}
        >
          <span className="action-icon">
            {theme === "light" ? <RiMoonFill /> : <MdSunny />}
          </span>
        </button>

        {/* User Menu */}
        <div className="user-menu-container" ref={userMenuRef}>
          <button
            className="user-avatar-button"
            onClick={onToggleUserMenu}
            aria-label="User menu"
            aria-expanded={isUserMenuOpen}
          >
            <div className="user-avatar">{getUserInitials()}</div>
          </button>

          {/* User Menu Dropdown */}
          {isUserMenuOpen && (
            <div className="user-menu-dropdown md-card">
              <div className="user-menu-header">
                <div className="user-info">
                  <div className="user-name md-typescale-title-medium">
                    {user?.user_metadata?.full_name ||
                      `${user?.user_metadata?.first_name || ""} ${
                        user?.user_metadata?.last_name || ""
                      }`.trim() ||
                      "User"}
                  </div>
                  <div className="user-email md-typescale-body-small">
                    {user?.email}
                  </div>
                </div>
              </div>

              <div className="user-menu-divider"></div>

              <div className="user-menu-actions">
                <button className="user-menu-item" onClick={onSignOut}>
                  <span className="menu-item-icon">🚪</span>
                  <span className="menu-item-text md-typescale-body-medium">
                    Sign out
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopAppBar;
