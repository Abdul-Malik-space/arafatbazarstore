// ========================================
// ADMIN CATEGORIES SERVICE
// ========================================

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// RESPONSE PARSER
// ========================================

const parseResponse = async (
  response
) => {
  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(
      data?.message ||
        "Something went wrong."
    );

    error.status =
      response.status;

    error.data = data;

    throw error;
  }

  return data;
};

// ========================================
// REQUEST HELPER
// ========================================

const request = async (
  endpoint,
  options = {}
) => {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      credentials: "include",

      ...options,

      headers: {
        ...(options.body
          ? {
              "Content-Type":
                "application/json",
            }
          : {}),

        ...(options.headers ||
          {}),
      },
    }
  );

  return parseResponse(
    response
  );
};

// ========================================
// AUTH ERROR HELPER
// ========================================

export const isAdminCategoryAuthError =
  (error) => {
    return (
      error?.status === 401 ||
      error?.status === 403
    );
  };

// ========================================
// NORMALIZE CATEGORY ARRAY
// ========================================

export const normalizeCategoriesArray =
  (value) => {
    return Array.isArray(value)
      ? value
      : [];
  };

// ========================================
// EXTRACT CATEGORY LIST
// ========================================

export const extractAdminCategories =
  (response) => {
    if (
      Array.isArray(
        response?.categories
      )
    ) {
      return response.categories;
    }

    if (
      Array.isArray(
        response?.data?.categories
      )
    ) {
      return response.data
        .categories;
    }

    if (
      Array.isArray(response)
    ) {
      return response;
    }

    return [];
  };

// ========================================
// EXTRACT SINGLE CATEGORY
// ========================================

export const extractAdminCategory =
  (response) => {
    return (
      response?.category ||
      response?.data?.category ||
      null
    );
  };

// ========================================
// EXTRACT CATEGORY TREE
// ========================================

export const extractCategoryTree =
  (response) => {
    if (
      Array.isArray(
        response?.categories
      )
    ) {
      return response.categories;
    }

    if (
      Array.isArray(
        response?.data?.categories
      )
    ) {
      return response.data
        .categories;
    }

    return [];
  };

// ========================================
// GET ALL CATEGORIES
//
// GET /api/categories
//
// Admin list:
// Main + Subcategories
// ========================================

export const getAdminCategories =
  async () => {
    return request(
      "/categories"
    );
  };

// ========================================
// GET ACTIVE CATEGORIES
//
// GET /api/categories/active
// ========================================

export const getActiveAdminCategories =
  async () => {
    return request(
      "/categories/active"
    );
  };

// ========================================
// GET MAIN CATEGORIES
//
// GET /api/categories/main
//
// Used inside Parent Category
// dropdown.
// ========================================

export const getMainAdminCategories =
  async () => {
    return request(
      "/categories/main"
    );
  };

// ========================================
// GET CATEGORY TREE
//
// GET /api/categories/tree
//
// Returns:
//
// Grocery
//   ├── Rice
//   ├── Cooking Oil
//
// Personal Care
//   ├── Face Wash
//   └── Bath Soap
// ========================================

export const getAdminCategoryTree =
  async () => {
    return request(
      "/categories/tree"
    );
  };

// ========================================
// GET SINGLE CATEGORY
//
// GET /api/categories/:id
// ========================================

export const getAdminCategoryById =
  async (id) => {
    if (!id) {
      throw new Error(
        "Category ID is required."
      );
    }

    return request(
      `/categories/${id}`
    );
  };

// ========================================
// GET SUBCATEGORIES
//
// GET
// /api/categories/:id/subcategories
// ========================================

export const getAdminSubcategories =
  async (parentId) => {
    if (!parentId) {
      throw new Error(
        "Parent category ID is required."
      );
    }

    return request(
      `/categories/${parentId}/subcategories`
    );
  };

// ========================================
// CREATE CATEGORY
//
// POST /api/categories
//
// Main Category:
//
// {
//   name: "Personal Care",
//   parentCategory: null
// }
//
// Subcategory:
//
// {
//   name: "Face Wash",
//   parentCategory: "MAIN_ID"
// }
// ========================================

export const createAdminCategory =
  async (payload) => {
    return request(
      "/categories",
      {
        method: "POST",

        body: JSON.stringify(
          payload
        ),
      }
    );
  };

// ========================================
// UPDATE CATEGORY
//
// PUT /api/categories/:id
// ========================================

export const updateAdminCategory =
  async (
    id,
    payload
  ) => {
    if (!id) {
      throw new Error(
        "Category ID is required."
      );
    }

    return request(
      `/categories/${id}`,
      {
        method: "PUT",

        body: JSON.stringify(
          payload
        ),
      }
    );
  };

// ========================================
// DELETE CATEGORY
//
// DELETE /api/categories/:id
// ========================================

export const deleteAdminCategory =
  async (id) => {
    if (!id) {
      throw new Error(
        "Category ID is required."
      );
    }

    return request(
      `/categories/${id}`,
      {
        method: "DELETE",
      }
    );
  };

// ========================================
// CATEGORY TYPE HELPERS
// ========================================

export const isMainCategory = (
  category
) => {
  return !category?.parentCategory;
};

export const isSubcategory = (
  category
) => {
  return Boolean(
    category?.parentCategory
  );
};

// ========================================
// GET PARENT CATEGORY ID
//
// Works when parentCategory is:
//
// ObjectId string
//
// OR
//
// populated object:
//
// {
//   _id,
//   name,
//   slug
// }
// ========================================

export const getParentCategoryId =
  (category) => {
    const parent =
      category?.parentCategory;

    if (!parent) {
      return "";
    }

    if (
      typeof parent === "string"
    ) {
      return parent;
    }

    return (
      parent?._id ||
      parent?.id ||
      ""
    );
  };

// ========================================
// GET PARENT CATEGORY NAME
// ========================================

export const getParentCategoryName =
  (category) => {
    const parent =
      category?.parentCategory;

    if (!parent) {
      return "";
    }

    if (
      typeof parent === "object"
    ) {
      return (
        parent?.name || ""
      );
    }

    return "";
  };

// ========================================
// CREATE CLEAN CATEGORY PAYLOAD
// ========================================

export const buildCategoryPayload =
  ({
    name,
    description,
    image,
    categoryType,
    parentCategory,
    sortOrder,
    isActive,
  }) => {
    return {
      name:
        String(name || "").trim(),

      description:
        String(
          description || ""
        ).trim(),

      image:
        image || "",

      parentCategory:
        categoryType ===
        "sub"
          ? parentCategory ||
            null
          : null,

      sortOrder:
        Number(sortOrder) || 0,

      isActive:
        isActive !== false,
    };
  };