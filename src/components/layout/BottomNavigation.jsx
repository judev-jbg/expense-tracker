import { Link } from "react-router-dom";
import { RiDashboardLine, RiDashboardFill } from "react-icons/ri";
import { HiOutlineCreditCard, HiCreditCard } from "react-icons/hi2";
import { AiFillSetting, AiOutlineSetting } from "react-icons/ai";

const BottomNavigation = ({ currentPath }) => {
  const navigationItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: <RiDashboardLine />,
      activeIcon: <RiDashboardFill />,
    },
    {
      path: "/expenses",
      label: "Gastos",
      icon: <HiOutlineCreditCard />,
      activeIcon: <HiCreditCard />,
    },
    {
      path: "/settings",
      label: "Configuración",
      icon: <AiOutlineSetting />,
      activeIcon: <AiFillSetting />,
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
            <span className="md-navigation-label md-typescale-label-large">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;
