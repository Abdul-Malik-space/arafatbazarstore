// ========================================
// ADMIN AUTH API SERVICE
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// GENERIC ADMIN AUTH REQUEST
// ========================================

const adminAuthRequest =
  async (
    endpoint,
    options = {}
  ) => {
    const response =
      await fetch(
        `${API_BASE_URL}${endpoint}`,
        {
          ...options,

          // IMPORTANT:
          // Required for HttpOnly cookie
          credentials: "include",

          headers: {
            Accept:
              "application/json",

            "Content-Type":
              "application/json",

            ...(options.headers ||
              {}),
          },
        }
      );

    let data = null;

    try {
      data =
        await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
            "Something went wrong."
        );

      error.status =
        response.status;

      error.code =
        data?.code ||
        null;

      error.data =
        data;

      throw error;
    }

    return data;
  };

// ========================================
// LOGIN
//
// POST /api/admin/auth/login
// ========================================

export const loginAdmin =
  async ({
    email,
    password,
  }) => {
    return adminAuthRequest(
      "/admin/auth/login",
      {
        method: "POST",

        body:
          JSON.stringify({
            email:
              String(
                email || ""
              ).trim(),

            password:
              String(
                password || ""
              ),
          }),
      }
    );
  };

// ========================================
// LOGOUT
//
// POST /api/admin/auth/logout
// ========================================

export const logoutAdmin =
  async () => {
    return adminAuthRequest(
      "/admin/auth/logout",
      {
        method: "POST",

        body:
          JSON.stringify({}),
      }
    );
  };

// ========================================
// CURRENT ADMIN
//
// GET /api/admin/auth/me
// ========================================

export const getCurrentAdmin =
  async () => {
    return adminAuthRequest(
      "/admin/auth/me",
      {
        method: "GET",
      }
    );
  };

// ========================================
// CHANGE PASSWORD
//
// PATCH /api/admin/auth/change-password
// ========================================

export const changeAdminPassword =
  async ({
    currentPassword,
    newPassword,
    confirmPassword,
  }) => {
    return adminAuthRequest(
      "/admin/auth/change-password",
      {
        method: "PATCH",

        body:
          JSON.stringify({
            currentPassword:
              String(
                currentPassword ||
                  ""
              ),

            newPassword:
              String(
                newPassword ||
                  ""
              ),

            confirmPassword:
              String(
                confirmPassword ||
                  ""
              ),
          }),
      }
    );
  };

// ========================================
// HELPER
// ========================================

export const isAuthError =
  (error) => {
    return (
      error?.status === 401 ||
      error?.status === 403
    );
  };