// ========================================
// PUBLIC PAGE CONTENT SERVICE
//
// Customer website کے لیے
// dynamic Pages CMS data.
//
// Backend Public APIs:
//
// GET /api/page-content/header
// GET /api/page-content/public/:slug
// GET /api/page-content/system/:systemKey
// ========================================

const VITE_API_URL =
  (
    import.meta.env
      .VITE_API_URL ||
    "http://localhost:5000/api"
  ).replace(/\/+$/, "");

// ========================================
// BASE ENDPOINT
// ========================================

const PAGE_CONTENT_ENDPOINT =
  `${VITE_API_URL}/page-content`;

// ========================================
// SAFE JSON PARSER
// ========================================

const parseJsonSafely =
  async (response) => {
    const text =
      await response.text();

    if (!text) {
      return {};
    }

    try {
      return JSON.parse(text);
    } catch {
      return {
        message: text,
      };
    }
  };

// ========================================
// API ERROR
// ========================================

const createApiError = (
  response,
  data
) => {
  const error =
    new Error(
      data?.message ||
        data?.error ||
        `Request failed with status ${response.status}`
    );

  error.status =
    response.status;

  error.statusCode =
    response.status;

  error.data =
    data;

  return error;
};

// ========================================
// PUBLIC REQUEST
// ========================================

const publicRequest =
  async (url) => {
    const response =
      await fetch(url, {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },
      });

    const data =
      await parseJsonSafely(
        response
      );

    if (!response.ok) {
      throw createApiError(
        response,
        data
      );
    }

    return data;
  };

// ========================================
// EXTRACT PAGE
// ========================================

export const extractPageContent =
  (response) => {
    if (response?.page) {
      return response.page;
    }

    if (
      response?.data?.page
    ) {
      return response.data.page;
    }

    return null;
  };

// ========================================
// EXTRACT HEADER PAGES
// ========================================

export const extractHeaderPages =
  (response) => {
    if (
      Array.isArray(
        response?.pages
      )
    ) {
      return response.pages;
    }

    if (
      Array.isArray(
        response?.data?.pages
      )
    ) {
      return response.data.pages;
    }

    if (
      Array.isArray(response)
    ) {
      return response;
    }

    return [];
  };

// ========================================
// GET CUSTOM PAGE
//
// Example:
//
// /page/privacy-policy
//
// API:
// /api/page-content/public/privacy-policy
// ========================================

export const getPublicPageBySlug =
  async (slug) => {
    const safeSlug =
      String(
        slug || ""
      ).trim();

    if (!safeSlug) {
      throw new Error(
        "Page slug is required."
      );
    }

    return publicRequest(
      `${PAGE_CONTENT_ENDPOINT}/public/${encodeURIComponent(
        safeSlug
      )}`
    );
  };

// ========================================
// GET SYSTEM PAGE
//
// Examples:
//
// about
// contact
// shop
// track-order
//
// API:
//
// /api/page-content/system/about
// ========================================

export const getPublicSystemPage =
  async (
    systemKey
  ) => {
    const safeKey =
      String(
        systemKey || ""
      ).trim();

    if (!safeKey) {
      throw new Error(
        "System page key is required."
      );
    }

    return publicRequest(
      `${PAGE_CONTENT_ENDPOINT}/system/${encodeURIComponent(
        safeKey
      )}`
    );
  };

// ========================================
// GET HEADER CMS PAGES
//
// Header میں dashboard سے
// selected pages.
//
// API:
//
// /api/page-content/header
// ========================================

export const getPublicHeaderPages =
  async () => {
    return publicRequest(
      `${PAGE_CONTENT_ENDPOINT}/header`
    );
  };

// ========================================
// IS PAGE NOT FOUND
// ========================================

export const isPageNotFoundError =
  (error) => {
    return (
      error?.status ===
        404 ||
      error?.statusCode ===
        404
    );
  };

// ========================================
// SORT SECTIONS
// ========================================

export const getActivePageSections =
  (page) => {
    if (
      !Array.isArray(
        page?.sections
      )
    ) {
      return [];
    }

    return [
      ...page.sections,
    ]
      .filter(
        (section) =>
          section?.isActive !==
          false
      )
      .sort(
        (a, b) =>
          Number(
            a?.sortOrder || 0
          ) -
          Number(
            b?.sortOrder || 0
          )
      );
  };

// ========================================
// SORT FAQ
// ========================================

export const getActiveFaqItems =
  (page) => {
    if (
      !Array.isArray(
        page?.faqItems
      )
    ) {
      return [];
    }

    return [
      ...page.faqItems,
    ]
      .filter(
        (item) =>
          item?.isActive !==
          false
      )
      .sort(
        (a, b) =>
          Number(
            a?.sortOrder || 0
          ) -
          Number(
            b?.sortOrder || 0
          )
      );
  };

// ========================================
// PAGE URL
// ========================================

export const getPageUrl =
  (page) => {
    if (
      page?.routePath
    ) {
      return page.routePath;
    }

    if (page?.slug) {
      return `/page/${page.slug}`;
    }

    return "/";
  };

// ========================================
// PAGE MENU LABEL
// ========================================

export const getPageMenuLabel =
  (page) => {
    return (
      page?.menuLabel ||
      page?.title ||
      "Page"
    );
  };

// ========================================
// EXTERNAL LINK CHECK
// ========================================

export const isExternalPageLink =
  (url = "") => {
    const value =
      String(url).trim();

    return (
      value.startsWith(
        "http://"
      ) ||
      value.startsWith(
        "https://"
      )
    );
  };

// ========================================
// EXPORTS
// ========================================

export {
  VITE_API_URL,
  PAGE_CONTENT_ENDPOINT,
};