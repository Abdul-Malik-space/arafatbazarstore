import axios from "axios";

// ========================================
// API BASE URL
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// AXIOS INSTANCE
// ========================================

const api = axios.create({
  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});

// ========================================
// RESPONSE ERROR HANDLER
// ========================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    console.error("API Error:", message);

    return Promise.reject(error);
  }
);

// ========================================
// SITE SETTINGS
// ========================================

export const getPublicSettings = async () => {
  const response = await api.get(
    "/site-settings/public"
  );

  return response.data;
};

// ========================================
// CATEGORIES
// ========================================

export const getCategories = async () => {
  const response = await api.get(
    "/categories/active"
  );

  return response.data;
};

// ========================================
// PRODUCTS
// ========================================

export const getProducts = async (
  params = {}
) => {
  const response = await api.get(
    "/products",
    {
      params,
    }
  );

  return response.data;
};

// Single product by MongoDB ID
export const getProductById = async (
  productId
) => {
  const response = await api.get(
    `/products/${productId}`
  );

  return response.data;
};

// Single product by slug
export const getProductBySlug = async (
  slug
) => {
  const response = await api.get(
    `/products/slug/${slug}`
  );

  return response.data;
};

// ========================================
// HOMEPAGE PRODUCTS
// ========================================

export const getFeaturedProducts =
  async (limit = 8) => {
    const response = await api.get(
      "/products/featured",
      {
        params: {
          limit,
        },
      }
    );

    return response.data;
  };

export const getTrendingProducts =
  async (limit = 8) => {
    const response = await api.get(
      "/products/trending",
      {
        params: {
          limit,
        },
      }
    );

    return response.data;
  };

export const getNewArrivals = async (
  limit = 8
) => {
  const response = await api.get(
    "/products/new-arrivals",
    {
      params: {
        limit,
      },
    }
  );

  return response.data;
};

export const getBestSellers = async (
  limit = 8
) => {
  const response = await api.get(
    "/products/best-sellers",
    {
      params: {
        limit,
      },
    }
  );

  return response.data;
};

export const getDealProducts = async (
  limit = 8
) => {
  const response = await api.get(
    "/products/deals",
    {
      params: {
        limit,
      },
    }
  );

  return response.data;
};

// ========================================
// ORDERS / CHECKOUT
// ========================================

export const placeOrder = async (
  orderData
) => {
  const response = await api.post(
    "/orders",
    orderData
  );

  return response.data;
};

// ========================================
// ORDER TRACKING
// ========================================

export const trackOrder = async (
  orderNumber
) => {
  const response = await api.get(
    `/orders/track/${orderNumber}`
  );

  return response.data;
};

// ========================================
// IMAGE HELPER
// Converts /uploads/image.jpg to full URL
// ========================================

export const getImageUrl = (image) => {
  if (!image) {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const backendUrl =
    API_BASE_URL.replace(/\/api$/, "");

  return `${backendUrl}${image}`;
};

export default api;