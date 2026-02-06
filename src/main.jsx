import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "react-phone-number-input/style.css";
import AuthContext from "../src/context/AuthContext.jsx";
import { ToastContainer } from "react-toastify";
import PlanProvider from "./context/PlanContext.jsx";
import { UnsavedChangesProvider } from "./context/UnsavedChangesContext.jsx";

createRoot(document.getElementById("root")).render(
  // <StrictMode>
  <AuthContext>
    <UnsavedChangesProvider>
      <PlanProvider>
        <ToastContainer />
        <App />
      </PlanProvider>
    </UnsavedChangesProvider>
  </AuthContext>
  // </StrictMode>,
);
