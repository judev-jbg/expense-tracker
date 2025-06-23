import React from "react";
import {
  MdLightbulb,
  MdFlatware,
  MdDirectionsBus,
  MdGasMeter,
} from "react-icons/md";
import { IoFastFoodSharp, IoGameController } from "react-icons/io5";
import { IoIosCard, IoIosWater } from "react-icons/io";
import { RiGasStationFill } from "react-icons/ri";
import { FaCarSide, FaGraduationCap, FaStore, FaMobile } from "react-icons/fa";
import { AiFillHome } from "react-icons/ai";
import { TbTargetArrow, TbPillFilled } from "react-icons/tb";
import { BsFillSuitcase2Fill } from "react-icons/bs";
import { GiElectric } from "react-icons/gi";

// Mapeo de iconos: ID string -> Componente React
export const ICON_MAP = {
  // Utilities
  lightbulb: MdLightbulb,
  water: IoIosWater,
  gas: MdGasMeter,
  electric: GiElectric,

  // Food & Dining
  flatware: MdFlatware,
  fastfood: IoFastFoodSharp,
  store: FaStore,

  // Transportation
  car: FaCarSide,
  bus: MdDirectionsBus,
  gasstation: RiGasStationFill,

  // General
  home: AiFillHome,
  mobile: FaMobile,
  card: IoIosCard,
  target: TbTargetArrow,
  pill: TbPillFilled,
  education: FaGraduationCap,
  suitcase: BsFillSuitcase2Fill,
  gamecontroller: IoGameController,

  // Default fallback
  default: IoIosCard,
};

// Array de iconos comunes para el selector
export const COMMON_ICONS = [
  { id: "lightbulb", component: MdLightbulb, name: "Lightbulb" },
  { id: "water", component: IoIosWater, name: "Water" },
  { id: "gas", component: MdGasMeter, name: "Gas" },
  { id: "electric", component: GiElectric, name: "Electric" },
  { id: "flatware", component: MdFlatware, name: "Flatware" },
  { id: "store", component: FaStore, name: "Store" },
  { id: "fastfood", component: IoFastFoodSharp, name: "Fast Food" },
  { id: "car", component: FaCarSide, name: "Car" },
  { id: "card", component: IoIosCard, name: "Card" },
  { id: "home", component: AiFillHome, name: "Home" },
  { id: "mobile", component: FaMobile, name: "Mobile" },
  { id: "gasstation", component: RiGasStationFill, name: "Gas Station" },
  { id: "bus", component: MdDirectionsBus, name: "Bus" },
  { id: "target", component: TbTargetArrow, name: "Target" },
  { id: "pill", component: TbPillFilled, name: "Pill" },
  { id: "education", component: FaGraduationCap, name: "Education" },
  { id: "suitcase", component: BsFillSuitcase2Fill, name: "Suitcase" },
  {
    id: "gamecontroller",
    component: IoGameController,
    name: "Game Controller",
  },
];

// Función para obtener componente por ID
export const getIconComponent = (iconId) => {
  return ICON_MAP[iconId] || ICON_MAP.default;
};

// Hook personalizado para renderizar iconos (más seguro)
export const useIcon = (iconId) => {
  const IconComponent = getIconComponent(iconId);
  return IconComponent;
};

// Componente wrapper para renderizar iconos
export const IconRenderer = ({ iconId, ...props }) => {
  const IconComponent = getIconComponent(iconId);
  return <IconComponent {...props} />;
};
