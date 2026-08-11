// ========================================
// ADMIN PRODUCTS SERVICE
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// CHECK FORM DATA
// ========================================

const isFormData = (value) => {
  return (
    typeof FormData !== "undefined" &&
    value instanceof FormData
  );
};

// ========================================
// BUILD QUERY STRING
// ========================================

const buildQueryString = (
  params = {}
) => {
  const searchParams =
    new URLSearchParams();

  Object.entries(
    params || {}
  ).forEach(
    ([key, value]) => {
      // Skip empty values
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      // Arrays
      if (
        Array.isArray(value)
      ) {
        value.forEach(
          (item) => {
            if (
              item !== undefined &&
              item !== null &&
              item !== ""
            ) {
              searchParams.append(
                key,
                String(item)
              );
            }
          }
        );

        return;
      }

      // Normal value
      searchParams.set(
        key,
        String(value)
      );
    }
  );

  const query =
    searchParams.toString();

  return query
    ? `?${query}`
    : "";
};

// ========================================
// SAFE ID
// ========================================

const requireId = (
  id,
  label = "Product ID"
) => {
  const value =
    String(id || "").trim();

  if (!value) {
    throw new Error(
      `${label} is required.`
    );
  }

  return value;
};

// ========================================
// ADMIN PRODUCT REQUEST
// ========================================

const adminProductRequest =
  async (
    endpoint,
    options = {}
  ) => {
    const {
      body,
      headers,
      ...restOptions
    } = options;

    const formDataBody =
      isFormData(body);

    // ====================================
    // HEADERS
    //
    // FormData کی صورت میں Content-Type
    // browser خود set کرے گا.
    // ====================================

    const requestHeaders = {
      Accept:
        "application/json",

      ...(!formDataBody &&
      body !== undefined
        ? {
            "Content-Type":
              "application/json",
          }
        : {}),

      ...(headers || {}),
    };

    try {
      const response =
        await fetch(
          `${API_BASE_URL}${endpoint}`,
          {
            ...restOptions,

            credentials:
              "include",

            headers:
              requestHeaders,

            body:
              body === undefined
                ? undefined
                : formDataBody
                  ? body
                  : typeof body ===
                        "string"
                    ? body
                    : JSON.stringify(
                        body
                      ),
          }
        );

      // ==================================
      // PARSE RESPONSE
      // ==================================

      let data = null;

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        try {
          data =
            await response.json();
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

      // ==================================
      // ERROR
      // ==================================

      if (!response.ok) {
        const error =
          new Error(
            data?.message ||
              "Product request failed."
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
      // Network error
      if (!error.status) {
        const networkError =
          new Error(
            error?.message ||
              "Unable to connect to the server."
          );

        networkError.cause =
          error;

        throw networkError;
      }

      throw error;
    }
  };

// ========================================
// GET ADMIN PRODUCTS
//
// Public GET endpoint ہے لیکن Admin panel
// cookie بھیجنا محفوظ اور ٹھیک ہے.
//
// Example:
// getAdminProducts({
//   page: 1,
//   limit: 20,
//   search: "oil",
//   category: "...",
// })
// ========================================

export const getAdminProducts =
  async (
    params = {}
  ) => {
    const query =
      buildQueryString(
        params
      );

    return adminProductRequest(
      `/products${query}`,
      {
        method: "GET",
      }
    );
  };

// ========================================
// GET SINGLE PRODUCT
//
// GET /api/products/:id
// ========================================

export const getAdminProductById =
  async (id) => {
    const productId =
      requireId(id);

    return adminProductRequest(
      `/products/${encodeURIComponent(
        productId
      )}`,
      {
        method: "GET",
      }
    );
  };

// ========================================
// GET PRODUCT BY SLUG
//
// GET /api/products/slug/:slug
// ========================================

export const getAdminProductBySlug =
  async (slug) => {
    const safeSlug =
      requireId(
        slug,
        "Product slug"
      );

    return adminProductRequest(
      `/products/slug/${encodeURIComponent(
        safeSlug
      )}`,
      {
        method: "GET",
      }
    );
  };

// ========================================
// CREATE PRODUCT
//
// POST /api/products
//
// Admin authentication required.
// ========================================

export const createAdminProduct =
  async (payload) => {
    if (!payload) {
      throw new Error(
        "Product data is required."
      );
    }

    return adminProductRequest(
      "/products",
      {
        method: "POST",
        body: payload,
      }
    );
  };

// ========================================
// UPDATE PRODUCT
//
// PUT /api/products/:id
//
// Admin authentication required.
// ========================================

export const updateAdminProduct =
  async (
    id,
    payload
  ) => {
    const productId =
      requireId(id);

    if (!payload) {
      throw new Error(
        "Product data is required."
      );
    }

    return adminProductRequest(
      `/products/${encodeURIComponent(
        productId
      )}`,
      {
        method: "PUT",
        body: payload,
      }
    );
  };

// ========================================
// UPDATE PRODUCT STOCK
//
// PATCH /api/products/:id/stock
//
// Example:
//
// updateAdminProductStock(id, {
//   stock: 25
// })
//
// Admin authentication required.
// ========================================

export const updateAdminProductStock =
  async (
    id,
    payload
  ) => {
    const productId =
      requireId(id);

    if (
      payload === undefined ||
      payload === null
    ) {
      throw new Error(
        "Stock data is required."
      );
    }

    const stockPayload =
      typeof payload ===
      "object"
        ? payload
        : {
            stock: payload,
          };

    return adminProductRequest(
      `/products/${encodeURIComponent(
        productId
      )}/stock`,
      {
        method: "PATCH",
        body:
          stockPayload,
      }
    );
  };

// ========================================
// DELETE PRODUCT
//
// DELETE /api/products/:id
//
// Admin authentication required.
// ========================================

export const deleteAdminProduct =
  async (id) => {
    const productId =
      requireId(id);

    return adminProductRequest(
      `/products/${encodeURIComponent(
        productId
      )}`,
      {
        method:
          "DELETE",
      }
    );
  };

// ========================================
// AUTH ERROR HELPER
// ========================================

export const isAdminProductAuthError =
  (error) => {
    return (
      error?.status === 401 ||
      error?.status === 403
    );
  };

// ========================================
// RESPONSE HELPERS
// ========================================

export const extractProducts = (
  response
) => {
  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(
      response?.products
    )
  ) {
    return response.products;
  }

  if (
    Array.isArray(
      response?.data
        ?.products
    )
  ) {
    return response.data
      .products;
  }

  return [];
};

// ========================================
// PRODUCT HELPER
// ========================================

export const extractProduct = (
  response
) => {
  return (
    response?.product ||
    response?.data
      ?.product ||
    null
  );
};

// ========================================
// PAGINATION HELPER
//
// Existing backend response میں اگر:
//
// total
// count
// page
// pages
// limit
//
// موجود ہوں تو Admin page انہیں استعمال
// کر سکے گا.
// ========================================

export const extractProductPagination =
  (
    response,
    fallbackLimit = 20
  ) => {
    const page =
      Number(
        response?.page ||
          response?.pagination
            ?.page
      ) || 1;

    const limit =
      Number(
        response?.limit ||
          response?.pagination
            ?.limit
      ) ||
      Number(
        fallbackLimit
      ) ||
      20;

    const total =
      Number(
        response?.total ??
          response
            ?.pagination
            ?.total ??
          response?.count ??
          0
      ) || 0;

    const totalPages =
      Number(
        response?.pages ||
          response?.totalPages ||
          response
            ?.pagination
            ?.totalPages
      ) ||
      Math.max(
        1,
        Math.ceil(
          total / limit
        )
      );

    return {
      page,
      limit,
      total,
      totalPages,

      hasNextPage:
        page <
        totalPages,

      hasPrevPage:
        page > 1,
    };
  };

// ========================================
// DEFAULT EXPORT
// ========================================

export default {
  getAdminProducts,
  getAdminProductById,
  getAdminProductBySlug,
  createAdminProduct,
  updateAdminProduct,
  updateAdminProductStock,
  deleteAdminProduct,
  isAdminProductAuthError,
  extractProducts,
  extractProduct,
  extractProductPagination,
};