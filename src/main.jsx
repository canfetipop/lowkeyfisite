import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./globals.css";

const redirectedRoute = sessionStorage.getItem("lowkeyfi-route");
if (redirectedRoute) {
  sessionStorage.removeItem("lowkeyfi-route");
  window.history.replaceState({}, "", redirectedRoute);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
