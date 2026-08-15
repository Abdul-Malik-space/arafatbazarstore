import { useEffect } from "react";

import {
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";

import {
  useSite,
} from "./context/SiteContext";

// ========================================
// CUSTOMER LAYOUT
// ========================================

import MainLayout from "./components/layout/MainLayout";

// ========================================
// ADMIN AUTH + LAYOUT
// ========================================

import ProtectedAdminRoute from "./components/admin/ProtectedAdminRoute";
import AdminLayout from "./components/admin/AdminLayout";

// ========================================
// ADMIN PAGES
// ========================================

import AdminLoginPage from "./pages/admin/AdminLoginPage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";

import AdminProductsPage from "./pages/admin/AdminProductsPage";

import AdminProductFormPage from "./pages/admin/AdminProductFormPage";

import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";

import AdminOrdersPage from "./pages/admin/AdminOrdersPage";

import AdminOrderInvoicePage from "./pages/admin/AdminOrderInvoicePage";

import AdminCustomersPage from "./pages/admin/AdminCustomersPage";

import AdminCustomerDetailsPage from "./pages/admin/AdminCustomerDetailsPage";

import AdminWebsiteContentPage from "./pages/admin/AdminWebsiteContentPage";

import AdminPagesPage from "./pages/admin/AdminPagesPage";

import AdminFooterPage from "./pages/admin/AdminFooterPage";

import AdminStoreSettingsPage from "./pages/admin/AdminStoreSettingsPage";

// ========================================
// CUSTOMER PAGES
// ========================================

import HomePage from "./pages/HomePage";

import ShopPage from "./pages/ShopPage";

import ProductDetailsPage from "./pages/ProductDetailsPage";

import CartPage from "./pages/CartPage";

import CheckoutPage from "./pages/CheckoutPage";

import OrderSuccessPage from "./pages/OrderSuccessPage";

import TrackOrderPage from "./pages/TrackOrderPage";

import AboutPage from "./pages/AboutPage";

import ContactPage from "./pages/ContactPage";

// ========================================
// DYNAMIC CMS PAGE
// ========================================

import DynamicPage from "./pages/DynamicPage";

// ========================================
// SCROLL TO TOP
// ========================================

const ScrollToTop = () => {
  const {
    pathname,
  } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "auto",
    });
  }, [pathname]);

  return null;
};

// ========================================
// LOADING SCREEN
// ========================================

const LoadingScreen = () => {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-white
      "
    >
      <div
        className="
          text-center
        "
      >
        <div
          className="
            mx-auto
            h-10
            w-10
            animate-spin
            rounded-full
            border-4
            border-gray-200
            border-t-[var(--primary-color)]
          "
        />

        <p
          className="
            mt-4
            text-sm
            font-medium
            text-gray-500
          "
        >
          Loading store...
        </p>
      </div>
    </div>
  );
};

// ========================================
// MAINTENANCE SCREEN
// ========================================

const MaintenanceScreen = ({
  message,
}) => {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-gray-50
        px-5
      "
    >
      <div
        className="
          w-full
          max-w-lg
          rounded-2xl
          bg-white
          p-8
          text-center
          shadow-sm
        "
      >
        <div
          className="
            mb-5
            text-5xl
          "
        >
          🛒
        </div>

        <h1
          className="
            text-2xl
            font-bold
            text-gray-900
          "
        >
          Store Temporarily
          Unavailable
        </h1>

        <p
          className="
            mt-3
            leading-7
            text-gray-500
          "
        >
          {message ||
            "Our store is temporarily unavailable."}
        </p>
      </div>
    </div>
  );
};

// ========================================
// CUSTOMER 404 PAGE
// ========================================

const NotFoundPage = () => {
  return (
    <section
      className="
        flex
        min-h-[60vh]
        items-center
        justify-center
        px-5
        py-16
      "
    >
      <div
        className="
          text-center
        "
      >
        <div
          className="
            text-7xl
            font-black
            text-[var(--primary-color)]
          "
        >
          404
        </div>

        <h1
          className="
            mt-4
            text-2xl
            font-bold
            text-gray-900
          "
        >
          Page Not Found
        </h1>

        <p
          className="
            mt-3
            text-gray-500
          "
        >
          The page you are
          looking for does not
          exist.
        </p>
      </div>
    </section>
  );
};

// ========================================
// CUSTOMER STORE GATE
// ========================================

const CustomerStoreGate = () => {
  const {
    settings,
    loading,
  } = useSite();

  if (loading) {
    return <LoadingScreen />;
  }

  if (
    settings?.storeEnabled ===
    false
  ) {
    return (
      <MaintenanceScreen
        message="The store is currently unavailable."
      />
    );
  }

  if (
    settings?.maintenanceMode
  ) {
    return (
      <MaintenanceScreen
        message={
          settings?.maintenanceMessage
        }
      />
    );
  }

  return <MainLayout />;
};

// ========================================
// APP
// ========================================

function App() {
  return (
    <>
      <ScrollToTop />

      <Routes>
        {/* =================================
            ADMIN LOGIN
        ================================= */}

        <Route
          path="/admin/login"
          element={
            <AdminLoginPage />
          }
        />

        {/* =================================
            PROTECTED ADMIN AREA
        ================================= */}

        <Route
          element={
            <ProtectedAdminRoute />
          }
        >
          <Route
            path="/admin"
            element={
              <AdminLayout />
            }
          >
            {/* =============================
                ADMIN ROOT
            ============================= */}

            <Route
              index
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

            {/* =============================
                DASHBOARD
            ============================= */}

            <Route
              path="dashboard"
              element={
                <AdminDashboardPage />
              }
            />

            {/* =============================
                PRODUCTS
            ============================= */}

            <Route
              path="products"
              element={
                <AdminProductsPage />
              }
            />

            <Route
              path="products/new"
              element={
                <AdminProductFormPage />
              }
            />

            <Route
              path="products/:id/edit"
              element={
                <AdminProductFormPage />
              }
            />

            {/* =============================
                CATEGORIES
            ============================= */}

            <Route
              path="categories"
              element={
                <AdminCategoriesPage />
              }
            />

            {/* =============================
                ORDERS
            ============================= */}

            <Route
              path="orders"
              element={
                <AdminOrdersPage />
              }
            />


            <Route
              path="orders/:id/invoice"
              element={
                <AdminOrderInvoicePage />
              }
            />

            {/* =============================
                CUSTOMERS
            ============================= */}

            <Route
              path="customers"
              element={
                <AdminCustomersPage />
              }
            />

            <Route
              path="customers/:phoneKey"
              element={
                <AdminCustomerDetailsPage />
              }
            />

            {/* =============================
                HOME PAGE CONTENT
            ============================= */}

            <Route
              path="content"
              element={
                <AdminWebsiteContentPage />
              }
            />

            {/* =============================
                PAGES CMS
            ============================= */}

            <Route
              path="pages"
              element={
                <AdminPagesPage />
              }
            />

            {/* =============================
                FOOTER MANAGEMENT
            ============================= */}

            <Route
              path="footer"
              element={
                <AdminFooterPage />
              }
            />

            {/* =============================
                MEDIA
            ============================= */}

            <Route
              path="media"
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />

            {/* =============================
                STORE SETTINGS
            ============================= */}

            <Route
              path="settings"
              element={
                <AdminStoreSettingsPage />
              }
            />

            {/* =============================
                UNKNOWN ADMIN ROUTES
            ============================= */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/admin/dashboard"
                  replace
                />
              }
            />
          </Route>
        </Route>

        {/* =================================
            CUSTOMER WEBSITE
        ================================= */}

        <Route
          element={
            <CustomerStoreGate />
          }
        >
          {/* =============================
              HOME
          ============================= */}

          <Route
            index
            element={
              <HomePage />
            }
          />

          {/* =============================
              SHOP
          ============================= */}

          <Route
            path="shop"
            element={
              <ShopPage />
            }
          />

          {/* =============================
              CATEGORY PRODUCTS
          ============================= */}

          <Route
            path="shop/category/:categorySlug"
            element={
              <ShopPage />
            }
          />

          {/* =============================
              PRODUCT DETAILS
          ============================= */}

          <Route
            path="product/:slug"
            element={
              <ProductDetailsPage />
            }
          />

          {/* =============================
              CART
          ============================= */}

          <Route
            path="cart"
            element={
              <CartPage />
            }
          />

          {/* =============================
              CHECKOUT
          ============================= */}

          <Route
            path="checkout"
            element={
              <CheckoutPage />
            }
          />

          {/* =============================
              ORDER SUCCESS
          ============================= */}

          <Route
            path="order-success/:orderNumber"
            element={
              <OrderSuccessPage />
            }
          />

          {/* =============================
              TRACK ORDER
          ============================= */}

          <Route
            path="track-order"
            element={
              <TrackOrderPage />
            }
          />

          <Route
            path="track-order/:orderNumber"
            element={
              <TrackOrderPage />
            }
          />

          {/* =============================
              ABOUT
          ============================= */}

          <Route
            path="about"
            element={
              <AboutPage />
            }
          />

          {/* =============================
              CONTACT
          ============================= */}

          <Route
            path="contact"
            element={
              <ContactPage />
            }
          />

          {/* =============================
              DYNAMIC CUSTOM CMS PAGE
          ============================= */}

          <Route
            path="page/:slug"
            element={
              <DynamicPage />
            }
          />

          {/* =============================
              HOME SHORTCUT
          ============================= */}

          <Route
            path="home"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />

          {/* =============================
              CUSTOMER 404
          ============================= */}

          <Route
            path="*"
            element={
              <NotFoundPage />
            }
          />
        </Route>
      </Routes>
    </>
  );
}

export default App;