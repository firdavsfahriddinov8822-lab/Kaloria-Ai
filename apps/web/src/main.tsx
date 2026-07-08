import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AppProvider } from "./state/AppContext";
import { I18nProvider } from "./i18n";
import "./lib/pwa";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("root element missing");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <I18nProvider>
      <BrowserRouter>
        <AppProvider>
          <App />
        </AppProvider>
      </BrowserRouter>
    </I18nProvider>
  </React.StrictMode>,
);
