import {
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import {
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";

import {
  useAdminAuth,
} from "../../context/AdminAuthContext";

// ========================================
// LOADING SCREEN
// ========================================

const AdminAuthLoader = () => {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f7f7f7]
        px-5
      "
    >
      <div className="text-center">
        <div
          className="
            mx-auto
            flex
            h-16
            w-16
            items-center
            justify-center
            rounded-full
            bg-[#f4f7ef]
            text-[var(--primary-color)]
          "
        >
          <LockKeyhole
            size={27}
          />
        </div>

        <div
          className="
            mx-auto
            mt-5
            h-7
            w-7
            animate-spin
            rounded-full
            border-[3px]
            border-[#dddddd]
            border-t-[var(--primary-color)]
          "
        />

        <p
          className="
            mt-4
            text-[12px]
            font-semibold
            text-[#777]
          "
        >
          Verifying administrator
          session...
        </p>
      </div>
    </div>
  );
};

// ========================================
// ACCESS DENIED
// ========================================

const AdminAccessDenied = ({
  role,
}) => {
  return (
    <div
      className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f7f7f7]
        px-5
      "
    >
      <div
        className="
          w-full
          max-w-[470px]
          border
          border-[#eeeeee]
          bg-white
          px-7
          py-10
          text-center
        "
      >
        <div
          className="
            mx-auto
            flex
            h-[76px]
            w-[76px]
            items-center
            justify-center
            rounded-full
            bg-red-50
            text-red-500
          "
        >
          <ShieldAlert
            size={32}
          />
        </div>

        <div
          className="
            mt-5
            text-[11px]
            font-bold
            uppercase
            tracking-[0.15em]
            text-red-500
          "
        >
          Access denied
        </div>

        <h1
          className="
            mt-2
            text-[27px]
            font-black
            text-[#222]
          "
        >
          Permission required
        </h1>

        <p
          className="
            mt-3
            text-[12px]
            leading-6
            text-[#777]
          "
        >
          Your administrator account
          does not have permission to
          access this page.
        </p>

        {role && (
          <div
            className="
              mt-5
              rounded-[10px]
              bg-[#fafafa]
              px-4
              py-3
              text-[11px]
              text-[#777]
            "
          >
            Current role:{" "}
            <strong
              className="
                text-[#333]
              "
            >
              {role}
            </strong>
          </div>
        )}

        <a
          href="/admin/dashboard"
          className="
            mt-6
            inline-flex
            min-h-[46px]
            items-center
            justify-center
            rounded-full
            bg-[#282828]
            px-7
            text-[11px]
            font-bold
            uppercase
            text-white
            transition
            hover:bg-[var(--primary-color)]
          "
        >
          Back to dashboard
        </a>
      </div>
    </div>
  );
};

// ========================================
// PROTECTED ADMIN ROUTE
//
// Usage:
//
// <ProtectedAdminRoute>
//   <AdminDashboardPage />
// </ProtectedAdminRoute>
//
// OR nested:
//
// <Route
//   element={
//     <ProtectedAdminRoute />
//   }
// >
//   ...
// </Route>
//
// Role protected:
//
// <ProtectedAdminRoute
//   allowedRoles={[
//     "super-admin"
//   ]}
// >
//   <AdminUsersPage />
// </ProtectedAdminRoute>
// ========================================

const ProtectedAdminRoute = ({
  children,
  allowedRoles = [],
}) => {
  const location =
    useLocation();

  const {
    admin,

    authLoading,

    isAuthenticated,

    isSuperAdmin,

    hasRole,
  } = useAdminAuth();

  // ======================================
  // WAIT FOR /me REQUEST
  // ======================================

  if (authLoading) {
    return (
      <AdminAuthLoader />
    );
  }

  // ======================================
  // NOT LOGGED IN
  // ======================================

  if (!isAuthenticated) {
    const returnPath =
      `${location.pathname}${location.search}`;

    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          from: returnPath,
        }}
      />
    );
  }

  // ======================================
  // ROLE PROTECTION
  // ======================================

  const roles =
    Array.isArray(
      allowedRoles
    )
      ? allowedRoles.filter(
          Boolean
        )
      : [
          allowedRoles,
        ].filter(Boolean);

  const roleRestricted =
    roles.length > 0;

  /*
   * Super Admin has access
   * to every administrator page.
   */

  const roleAllowed =
    !roleRestricted ||
    isSuperAdmin ||
    hasRole(roles);

  if (!roleAllowed) {
    return (
      <AdminAccessDenied
        role={admin?.role}
      />
    );
  }

  // ======================================
  // RENDER PAGE
  // ======================================

  if (children) {
    return children;
  }

  /*
   * Supports nested routes:
   *
   * <Route
   *   element={
   *     <ProtectedAdminRoute />
   *   }
   * >
   *   ...
   * </Route>
   */

  return <Outlet />;
};

export default ProtectedAdminRoute;