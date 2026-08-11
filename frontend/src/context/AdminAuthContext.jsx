import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  changeAdminPassword,
  getCurrentAdmin,
  isAuthError,
  loginAdmin as loginAdminRequest,
  logoutAdmin as logoutAdminRequest,
} from "../services/adminAuth";

// ========================================
// CONTEXT
// ========================================

const AdminAuthContext =
  createContext(null);

// ========================================
// PROVIDER
// ========================================

export const AdminAuthProvider = ({
  children,
}) => {
  // ======================================
  // STATE
  // ======================================

  const [
    admin,
    setAdmin,
  ] = useState(null);

  // Initial authentication check
  const [
    authLoading,
    setAuthLoading,
  ] = useState(true);

  // Login / logout / password actions
  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    authError,
    setAuthError,
  ] = useState("");

  // ======================================
  // AUTH STATUS
  // ======================================

  const isAuthenticated =
    Boolean(admin?._id);

  const isSuperAdmin =
    admin?.role ===
    "super-admin";

  // ======================================
  // CLEAR ERROR
  // ======================================

  const clearAuthError =
    useCallback(() => {
      setAuthError("");
    }, []);

  // ======================================
  // LOAD CURRENT ADMIN
  //
  // GET /api/admin/auth/me
  // ======================================

  const refreshAdmin =
    useCallback(
      async ({
        silent = false,
      } = {}) => {
        if (!silent) {
          setAuthLoading(true);
        }

        try {
          setAuthError("");

          const response =
            await getCurrentAdmin();

          if (
            response?.success &&
            response?.admin
          ) {
            setAdmin(
              response.admin
            );

            return response.admin;
          }

          setAdmin(null);

          return null;
        } catch (error) {
          setAdmin(null);

          // 401 / 403 simply means
          // there is no valid admin session.
          if (
            !isAuthError(error)
          ) {
            setAuthError(
              error?.message ||
                "Unable to verify administrator session."
            );
          }

          return null;
        } finally {
          if (!silent) {
            setAuthLoading(false);
          }
        }
      },
      []
    );

  // ======================================
  // INITIAL SESSION CHECK
  //
  // Runs once when the frontend loads.
  // ======================================

  useEffect(() => {
    let active = true;

    const initializeAuth =
      async () => {
        setAuthLoading(true);

        try {
          const response =
            await getCurrentAdmin();

          if (!active) {
            return;
          }

          if (
            response?.success &&
            response?.admin
          ) {
            setAdmin(
              response.admin
            );
          } else {
            setAdmin(null);
          }
        } catch (error) {
          if (!active) {
            return;
          }

          setAdmin(null);

          // Do not show an error simply
          // because user is logged out.
          if (
            !isAuthError(error)
          ) {
            setAuthError(
              error?.message ||
                "Unable to verify administrator session."
            );
          }
        } finally {
          if (active) {
            setAuthLoading(false);
          }
        }
      };

    initializeAuth();

    return () => {
      active = false;
    };
  }, []);

  // ======================================
  // LOGIN
  //
  // POST /api/admin/auth/login
  // ======================================

  const login = useCallback(
    async ({
      email,
      password,
    }) => {
      try {
        setActionLoading(
          true
        );

        setAuthError("");

        const response =
          await loginAdminRequest({
            email,
            password,
          });

        if (
          !response?.success ||
          !response?.admin
        ) {
          throw new Error(
            response?.message ||
              "Unable to sign in."
          );
        }

        setAdmin(
          response.admin
        );

        return {
          success: true,
          admin:
            response.admin,
          message:
            response.message,
        };
      } catch (error) {
        setAdmin(null);

        const message =
          error?.message ||
          "Unable to sign in.";

        setAuthError(
          message
        );

        throw error;
      } finally {
        setActionLoading(
          false
        );
      }
    },
    []
  );

  // ======================================
  // LOGOUT
  //
  // POST /api/admin/auth/logout
  // ======================================

  const logout =
    useCallback(
      async () => {
        try {
          setActionLoading(
            true
          );

          setAuthError("");

          await logoutAdminRequest();

          setAdmin(null);

          return {
            success: true,
          };
        } catch (error) {
          // Clear local admin state even
          // if logout request failed.
          setAdmin(null);

          const message =
            error?.message ||
            "Unable to logout.";

          setAuthError(
            message
          );

          throw error;
        } finally {
          setActionLoading(
            false
          );
        }
      },
      []
    );

  // ======================================
  // CHANGE PASSWORD
  //
  // PATCH
  // /api/admin/auth/change-password
  // ======================================

  const changePassword =
    useCallback(
      async ({
        currentPassword,
        newPassword,
        confirmPassword,
      }) => {
        try {
          setActionLoading(
            true
          );

          setAuthError("");

          const response =
            await changeAdminPassword({
              currentPassword,
              newPassword,
              confirmPassword,
            });

          if (
            !response?.success
          ) {
            throw new Error(
              response?.message ||
                "Unable to change password."
            );
          }

          if (
            response?.admin
          ) {
            setAdmin(
              response.admin
            );
          }

          return response;
        } catch (error) {
          const message =
            error?.message ||
            "Unable to change password.";

          setAuthError(
            message
          );

          throw error;
        } finally {
          setActionLoading(
            false
          );
        }
      },
      []
    );

  // ======================================
  // ROLE HELPER
  // ======================================

  const hasRole =
    useCallback(
      (...roles) => {
        if (!admin?.role) {
          return false;
        }

        const allowedRoles =
          roles
            .flat()
            .filter(Boolean);

        return allowedRoles.includes(
          admin.role
        );
      },
      [admin?.role]
    );

  // ======================================
  // CONTEXT VALUE
  // ======================================

  const value =
    useMemo(
      () => ({
        // Admin
        admin,

        setAdmin,

        // Status
        isAuthenticated,
        isSuperAdmin,

        authLoading,
        actionLoading,

        authError,

        // Actions
        login,
        logout,
        refreshAdmin,
        changePassword,

        clearAuthError,

        // Permissions
        hasRole,
      }),
      [
        admin,
        isAuthenticated,
        isSuperAdmin,
        authLoading,
        actionLoading,
        authError,
        login,
        logout,
        refreshAdmin,
        changePassword,
        clearAuthError,
        hasRole,
      ]
    );

  return (
    <AdminAuthContext.Provider
      value={value}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};

// ========================================
// HOOK
// ========================================

export const useAdminAuth =
  () => {
    const context =
      useContext(
        AdminAuthContext
      );

    if (!context) {
      throw new Error(
        "useAdminAuth must be used inside AdminAuthProvider."
      );
    }

    return context;
  };

// ========================================
// DEFAULT EXPORT
// ========================================

export default AdminAuthContext;