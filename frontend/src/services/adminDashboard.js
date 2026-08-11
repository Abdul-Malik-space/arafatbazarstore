// ========================================
// ADMIN DASHBOARD SERVICE
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// ADMIN DASHBOARD REQUEST
// ========================================

const adminDashboardRequest =
  async (
    endpoint,
    options = {}
  ) => {
    try {
      const response =
        await fetch(
          `${API_BASE_URL}${endpoint}`,
          {
            ...options,

            // HttpOnly admin cookie
            // request کے ساتھ بھیجنے کے لیے
            credentials:
              "include",

            headers: {
              Accept:
                "application/json",

              ...(
                options.headers ||
                {}
              ),
            },
          }
        );

      // ==================================
      // PARSE RESPONSE
      // ==================================

      let data = null;

      try {
        data =
          await response.json();
      } catch {
        data = null;
      }

      // ==================================
      // ERROR RESPONSE
      // ==================================

      if (!response.ok) {
        const error =
          new Error(
            data?.message ||
              "Unable to load administrator dashboard."
          );

        error.status =
          response.status;

        error.code =
          data?.code || null;

        error.data =
          data;

        throw error;
      }

      return data;
    } catch (error) {
      // Fetch/network errors میں
      // status موجود نہیں ہوگا۔
      if (!error.status) {
        error.message =
          error.message ||
          "Unable to connect to the server.";
      }

      throw error;
    }
  };

// ========================================
// GET DASHBOARD OVERVIEW
//
// GET /api/admin/dashboard
// ========================================

export const getAdminDashboard =
  async () => {
    const response =
      await adminDashboardRequest(
        "/admin/dashboard",
        {
          method: "GET",
        }
      );

    return response;
  };

// ========================================
// GET DASHBOARD DATA ONLY
//
// Component میں صرف dashboard object
// چاہیے ہو تو یہ helper استعمال کریں.
// ========================================

export const getAdminDashboardData =
  async () => {
    const response =
      await getAdminDashboard();

    return (
      response?.dashboard || {
        summary: {},
        orderStatus: {},
        recentOrders: [],
        lowStockProducts: [],
        meta: {},
      }
    );
  };

// ========================================
// DASHBOARD AUTH ERROR
// ========================================

export const isAdminDashboardAuthError =
  (error) => {
    return (
      error?.status === 401 ||
      error?.status === 403
    );
  };

// ========================================
// DEFAULT EXPORT
// ========================================

export default {
  getAdminDashboard,
  getAdminDashboardData,
  isAdminDashboardAuthError,
};