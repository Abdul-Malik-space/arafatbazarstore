import {
  useEffect,
  useState,
} from "react";

import {
  Outlet,
  useLocation,
} from "react-router-dom";

import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

// ========================================
// ADMIN LAYOUT
// ========================================

const AdminLayout = () => {
  const location =
    useLocation();

  // ======================================
  // MOBILE SIDEBAR
  // ======================================

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  // ======================================
  // OPEN SIDEBAR
  // ======================================

  const openSidebar = () => {
    setSidebarOpen(true);
  };

  // ======================================
  // CLOSE SIDEBAR
  // ======================================

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // ======================================
  // CLOSE MOBILE SIDEBAR
  // AFTER ROUTE CHANGE
  // ======================================

  useEffect(() => {
    setSidebarOpen(false);
  }, [
    location.pathname,
  ]);

  // ======================================
  // LOCK BODY SCROLL
  // WHEN MOBILE SIDEBAR IS OPEN
  // ======================================

  useEffect(() => {
    if (!sidebarOpen) {
      document.body.style.overflow =
        "";

      return;
    }

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    sidebarOpen,
  ]);

  // ======================================
  // CLOSE SIDEBAR WITH ESC
  // ======================================

  useEffect(() => {
    const handleKeyDown = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // ======================================
  // PAGE
  // ======================================

  return (
    <div
      className="
        min-h-screen
        bg-[#f6f7f4]
      "
    >
      {/* =================================
          MOBILE OVERLAY
      ================================= */}

      <button
        type="button"
        aria-label="Close sidebar"
        onClick={
          closeSidebar
        }
        className={`
          fixed
          inset-0
          z-40
          bg-black/45
          transition-opacity
          duration-300
          lg:hidden

          ${
            sidebarOpen
              ? `
                  pointer-events-auto
                  opacity-100
                `
              : `
                  pointer-events-none
                  opacity-0
                `
          }
        `}
      />

      {/* =================================
          SIDEBAR
      ================================= */}

      <AdminSidebar
        isOpen={
          sidebarOpen
        }
        onClose={
          closeSidebar
        }
      />

      {/* =================================
          RIGHT AREA
      ================================= */}

      <div
        className="
          min-h-screen
          lg:pl-[270px]
        "
      >
        {/* ===============================
            HEADER
        =============================== */}

        <AdminHeader
          onOpenSidebar={
            openSidebar
          }
        />

        {/* ===============================
            PAGE CONTENT
        =============================== */}

        <main
          className="
            min-h-[calc(100vh-72px)]
            px-4
            py-5
            sm:px-5
            sm:py-6
            lg:px-7
            xl:px-8
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1600px]
            "
          >
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;