import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import App from "./App.jsx";

import "./index.css";

// ========================================
// CUSTOMER STORE CONTEXTS
// ========================================

import {
  SiteProvider,
} from "./context/SiteContext.jsx";

import {
  CartProvider,
} from "./context/CartContext.jsx";

// ========================================
// ADMIN AUTH CONTEXT
// ========================================

import {
  AdminAuthProvider,
} from "./context/AdminAuthContext.jsx";

// ========================================
// ROOT
// ========================================

createRoot(
  document.getElementById(
    "root"
  )
).render(
  <StrictMode>
    <BrowserRouter>
      <SiteProvider>
        <CartProvider>
          <AdminAuthProvider>
            <App />
          </AdminAuthProvider>
        </CartProvider>
      </SiteProvider>
    </BrowserRouter>
  </StrictMode>
);