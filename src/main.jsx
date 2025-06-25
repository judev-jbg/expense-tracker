import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// Import CSS styles
import "./index.css";
import "./styles/auth.css";
import "./styles/layout.css";
import "./styles/settings.css";
import "./styles/expenses.css";
import "./styles/dashboard.css";
import "./styles/input.css";
import "./styles/button.css";

// Registrar Service Worker para PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        // Verificar actualizaciones
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // Nueva versión disponible
                console.log("Nueva versión disponible");
                // Opcional: mostrar notificación al usuario
                if (confirm("Nueva versión disponible. ¿Recargar página?")) {
                  window.location.reload();
                }
              }
            }
          });
        });
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

// Create root and render app
const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
