// ========================================
// ADMIN SITE SETTINGS SERVICE
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// REQUEST HELPER
// ========================================

const adminSiteSettingsRequest =
  async (
    endpoint = "",
    options = {}
  ) => {
    const {
      method = "GET",
      body,
      headers = {},
    } = options;

    const requestOptions = {
      method,

      credentials: "include",

      headers: {
        ...headers,
      },
    };

    // ------------------------------------
    // JSON BODY
    // ------------------------------------

    if (
      body !== undefined &&
      body !== null
    ) {
      requestOptions.headers[
        "Content-Type"
      ] = "application/json";

      requestOptions.body =
        JSON.stringify(body);
    }

    let response;

    try {
      response = await fetch(
        `${API_BASE_URL}/site-settings${endpoint}`,
        requestOptions
      );
    } catch (error) {
      throw new Error(
        "Unable to connect to the server. Please make sure the backend is running."
      );
    }

    // ======================================
    // PARSE RESPONSE
    // ======================================

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    let data = null;

    if (
      contentType.includes(
        "application/json"
      )
    ) {
      try {
        data = await response.json();
      } catch {
        data = null;
      }
    } else {
      try {
        const text =
          await response.text();

        data = text
          ? {
              message: text,
            }
          : null;
      } catch {
        data = null;
      }
    }

    // ======================================
    // ERROR RESPONSE
    // ======================================

    if (!response.ok) {
      const error =
        new Error(
          data?.message ||
            data?.error ||
            `Request failed with status ${response.status}`
        );

      error.status =
        response.status;

      error.data =
        data;

      throw error;
    }

    return data;
  };

// ========================================
// GET ADMIN SITE SETTINGS
//
// GET /api/site-settings
// ========================================

export const getAdminSiteSettings =
  async () => {
    return adminSiteSettingsRequest(
      "",
      {
        method: "GET",
      }
    );
  };

// ========================================
// UPDATE SITE SETTINGS
//
// PUT /api/site-settings
// ========================================

export const updateAdminSiteSettings =
  async (payload) => {
    if (
      !payload ||
      typeof payload !==
        "object"
    ) {
      throw new Error(
        "Valid site settings data is required."
      );
    }

    return adminSiteSettingsRequest(
      "",
      {
        method: "PUT",
        body: payload,
      }
    );
  };

// ========================================
// RESET SITE SETTINGS
//
// POST /api/site-settings/reset
//
// Super Admin only
// ========================================

export const resetAdminSiteSettings =
  async () => {
    return adminSiteSettingsRequest(
      "/reset",
      {
        method: "POST",
      }
    );
  };

// ========================================
// EXTRACT SETTINGS
//
// Handles different backend response
// structures safely.
// ========================================

export const extractAdminSiteSettings =
  (response) => {
    if (
      !response ||
      typeof response !==
        "object"
    ) {
      return {};
    }

    // ------------------------------------
    // Preferred backend shape
    //
    // {
    //   success: true,
    //   settings: {...}
    // }
    // ------------------------------------

    if (
      response.settings &&
      typeof response.settings ===
        "object"
    ) {
      return response.settings;
    }

    // ------------------------------------
    // Alternate shape
    //
    // {
    //   data: {
    //     settings: {...}
    //   }
    // }
    // ------------------------------------

    if (
      response.data
        ?.settings &&
      typeof response.data
        .settings ===
        "object"
    ) {
      return response.data
        .settings;
    }

    // ------------------------------------
    // Alternate shape
    //
    // {
    //   data: {...settings}
    // }
    // ------------------------------------

    if (
      response.data &&
      typeof response.data ===
        "object" &&
      !Array.isArray(
        response.data
      )
    ) {
      return response.data;
    }

    // ------------------------------------
    // Direct settings object fallback
    // ------------------------------------

    return response;
  };

// ========================================
// AUTH ERROR CHECK
// ========================================

export const isAdminSiteSettingsAuthError =
  (error) => {
    return (
      error?.status === 401 ||
      error?.status === 403
    );
  };

// ========================================
// NORMALIZE ARRAY
// ========================================

export const normalizeSettingsArray =
  (value) => {
    return Array.isArray(value)
      ? value
      : [];
  };

// ========================================
// GENERATE CLIENT-SIDE ITEM ID
//
// Useful while adding new:
//
// - Hero Slides
// - Banners
// - Testimonials
// - Brands
// - Stories
//
// MongoDB will still create its own
// permanent ids when appropriate.
// ========================================

export const createTemporaryContentId =
  (prefix = "item") => {
    const random =
      Math.random()
        .toString(36)
        .slice(2, 9);

    return `${prefix}-${Date.now()}-${random}`;
  };