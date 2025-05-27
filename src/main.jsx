import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Import CSS styles
import "./index.css";
import "./styles/auth.css";
import "./styles/layout.css";
import "./styles/settings.css";
import "./styles/expenses.css";

// Create root and render app
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
