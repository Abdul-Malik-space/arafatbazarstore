// ========================================
// ADMIN PAGES SERVICE
//
// Dashboard Pages CMS communication.
//
// Backend:
//
// GET    /api/page-content
// GET    /api/page-content/:id
// POST   /api/page-content
// PUT    /api/page-content/:id
// DELETE /api/page-content/:id
//
// Admin authentication:
// HttpOnly cookie + credentials include
// ========================================

const VITE_API_URL =
  (
    import.meta.env
      .VITE_API_URL ||
    "http://localhost:5000/api"
  ).replace(/\/+$/, "");

// ========================================
// ENDPOINT
// ========================================

const PAGES_ENDPOINT =
  `${VITE_API_URL}/page-content`;

// ========================================
// SAFE JSON PARSER
// ========================================

const parseJsonSafely = async (
  response
) => {
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
// CREATE ERROR
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
// REQUEST HELPER
// ========================================

const request = async (
  url,
  options = {}
) => {
  const headers = {
    Accept:
      "application/json",

    ...(options.body
      ? {
          "Content-Type":
            "application/json",
        }
      : {}),

    ...(options.headers ||
      {}),
  };

  const response =
    await fetch(url, {
      ...options,

      headers,

      credentials:
        "include",
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
// NORMALIZE ARRAY
// ========================================

export const normalizeAdminPages =
  (value) => {
    if (Array.isArray(value)) {
      return value;
    }

    if (
      Array.isArray(
        value?.pages
      )
    ) {
      return value.pages;
    }

    if (
      Array.isArray(
        value?.data?.pages
      )
    ) {
      return value.data.pages;
    }

    return [];
  };

// ========================================
// EXTRACT SINGLE PAGE
// ========================================

export const extractAdminPage =
  (value) => {
    if (value?.page) {
      return value.page;
    }

    if (
      value?.data?.page
    ) {
      return value.data.page;
    }

    return null;
  };

// ========================================
// GET ALL PAGES
//
// Admin
// ========================================

export const getAdminPages =
  async () => {
    return request(
      PAGES_ENDPOINT,
      {
        method: "GET",
      }
    );
  };

// ========================================
// GET SINGLE PAGE
//
// Admin
// ========================================

export const getAdminPage =
  async (pageId) => {
    if (!pageId) {
      throw new Error(
        "Page ID is required."
      );
    }

    return request(
      `${PAGES_ENDPOINT}/${encodeURIComponent(
        pageId
      )}`,
      {
        method: "GET",
      }
    );
  };

// ========================================
// CREATE PAGE
//
// Admin
// ========================================

export const createAdminPage =
  async (payload) => {
    return request(
      PAGES_ENDPOINT,
      {
        method: "POST",

        body:
          JSON.stringify(
            payload || {}
          ),
      }
    );
  };

// ========================================
// UPDATE PAGE
//
// Admin
// ========================================

export const updateAdminPage =
  async (
    pageId,
    payload
  ) => {
    if (!pageId) {
      throw new Error(
        "Page ID is required."
      );
    }

    return request(
      `${PAGES_ENDPOINT}/${encodeURIComponent(
        pageId
      )}`,
      {
        method: "PUT",

        body:
          JSON.stringify(
            payload || {}
          ),
      }
    );
  };

// ========================================
// DELETE PAGE
//
// Admin
// ========================================

export const deleteAdminPage =
  async (pageId) => {
    if (!pageId) {
      throw new Error(
        "Page ID is required."
      );
    }

    return request(
      `${PAGES_ENDPOINT}/${encodeURIComponent(
        pageId
      )}`,
      {
        method:
          "DELETE",
      }
    );
  };

// ========================================
// AUTH ERROR CHECK
// ========================================

export const isAdminPagesAuthError =
  (error) => {
    return (
      error?.status === 401 ||
      error?.status === 403 ||
      error?.statusCode ===
        401 ||
      error?.statusCode ===
        403
    );
  };

// ========================================
// CREATE SLUG
//
// Frontend convenience only.
// Backend will still validate.
// ========================================

export const createPageSlug =
  (value = "") => {
    return String(value)
      .toLowerCase()
      .trim()
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );
  };

// ========================================
// CREATE DEFAULT ROUTE
// ========================================

export const createPageRoute =
  ({
    slug,
    isSystemPage = false,
  }) => {
    const safeSlug =
      createPageSlug(slug);

    if (!safeSlug) {
      return "";
    }

    if (isSystemPage) {
      return `/${safeSlug}`;
    }

    return `/page/${safeSlug}`;
  };

// ========================================
// GET PARENT PAGE ID
// ========================================

export const getPageParentId =
  (page) => {
    if (!page?.parentPage) {
      return "";
    }

    if (
      typeof page.parentPage ===
      "string"
    ) {
      return page.parentPage;
    }

    return (
      page.parentPage._id ||
      page.parentPage.id ||
      ""
    );
  };

// ========================================
// GET PARENT PAGE NAME
// ========================================

export const getPageParentName =
  (page) => {
    if (
      !page?.parentPage ||
      typeof page.parentPage ===
        "string"
    ) {
      return "";
    }

    return (
      page.parentPage.menuLabel ||
      page.parentPage.title ||
      ""
    );
  };

// ========================================
// MAIN PAGE CHECK
// ========================================

export const isMainPage =
  (page) => {
    return !getPageParentId(
      page
    );
  };

// ========================================
// CHILD PAGE CHECK
// ========================================

export const isChildPage =
  (page) => {
    return Boolean(
      getPageParentId(page)
    );
  };

// ========================================
// DEFAULT HERO
// ========================================

export const createDefaultPageHero =
  () => ({
    isEnabled: true,

    heading: "",

    subheading: "",

    image: "",

    imageAlt: "",

    buttonText: "",

    buttonUrl: "",
  });

// ========================================
// DEFAULT SECTION
// ========================================

export const createDefaultPageSection =
  (
    sectionType = "text"
  ) => ({
    sectionType,

    heading: "",

    subheading: "",

    content: "",

    image: "",

    imageAlt: "",

    buttonText: "",

    buttonUrl: "",

    textAlign: "left",

    imagePosition:
      "right",

    sortOrder: 0,

    isActive: true,
  });

// ========================================
// DEFAULT FAQ
// ========================================

export const createDefaultFaqItem =
  () => ({
    question: "",

    answer: "",

    sortOrder: 0,

    isActive: true,
  });

// ========================================
// DEFAULT PAGE FORM
//
// AdminPagesPage میں استعمال ہوگا.
// ========================================

export const createDefaultPage =
  () => ({
    title: "",

    slug: "",

    routePath: "",

    pageType: "custom",

    systemKey: "",

    isSystemPage: false,

    shortDescription: "",

    content: "",

    hero:
      createDefaultPageHero(),

    sections: [],

    faqItems: [],

    showInHeader: false,

    menuLabel: "",

    menuOrder: 0,

    parentPage: "",

    openInNewTab: false,

    showInFooter: false,

    footerOrder: 0,

    isActive: true,

    isPublished: true,

    metaTitle: "",

    metaDescription: "",

    metaKeywords: [],

    socialImage: "",
  });

// ========================================
// NORMALIZE PAGE FOR FORM
// ========================================

export const normalizePageForForm =
  (page = {}) => {
    const defaults =
      createDefaultPage();

    return {
      ...defaults,
      ...page,

      parentPage:
        getPageParentId(
          page
        ),

      hero: {
        ...defaults.hero,
        ...(page.hero ||
          {}),
      },

      sections:
        Array.isArray(
          page.sections
        )
          ? page.sections.map(
              (
                section,
                index
              ) => ({
                ...createDefaultPageSection(
                  section.sectionType
                ),

                ...section,

                sortOrder:
                  Number(
                    section.sortOrder ??
                      index
                  ) || 0,
              })
            )
          : [],

      faqItems:
        Array.isArray(
          page.faqItems
        )
          ? page.faqItems.map(
              (
                item,
                index
              ) => ({
                ...createDefaultFaqItem(),

                ...item,

                sortOrder:
                  Number(
                    item.sortOrder ??
                      index
                  ) || 0,
              })
            )
          : [],

      metaKeywords:
        Array.isArray(
          page.metaKeywords
        )
          ? page.metaKeywords
          : [],
    };
  };

// ========================================
// BUILD SAVE PAYLOAD
//
// Removes frontend-only populated data
// and creates backend-ready object.
// ========================================

export const buildAdminPagePayload =
  (page = {}) => {
    return {
      title:
        String(
          page.title || ""
        ).trim(),

      slug:
        createPageSlug(
          page.slug ||
            page.title
        ),

      routePath:
        String(
          page.routePath ||
            ""
        ).trim(),

      pageType:
        page.isSystemPage
          ? "system"
          : "custom",

      systemKey:
        page.isSystemPage
          ? createPageSlug(
              page.systemKey ||
                page.slug ||
                page.title
            )
          : "",

      isSystemPage:
        Boolean(
          page.isSystemPage
        ),

      shortDescription:
        page.shortDescription ||
        "",

      content:
        page.content || "",

      hero: {
        isEnabled:
          page.hero
            ?.isEnabled !==
          false,

        heading:
          page.hero
            ?.heading ||
          "",

        subheading:
          page.hero
            ?.subheading ||
          "",

        image:
          page.hero?.image ||
          "",

        imageAlt:
          page.hero
            ?.imageAlt ||
          "",

        buttonText:
          page.hero
            ?.buttonText ||
          "",

        buttonUrl:
          page.hero
            ?.buttonUrl ||
          "",
      },

      sections:
        Array.isArray(
          page.sections
        )
          ? page.sections.map(
              (
                section,
                index
              ) => ({
                ...(section._id
                  ? {
                      _id:
                        section._id,
                    }
                  : {}),

                sectionType:
                  section.sectionType ||
                  "text",

                heading:
                  section.heading ||
                  "",

                subheading:
                  section.subheading ||
                  "",

                content:
                  section.content ||
                  "",

                image:
                  section.image ||
                  "",

                imageAlt:
                  section.imageAlt ||
                  "",

                buttonText:
                  section.buttonText ||
                  "",

                buttonUrl:
                  section.buttonUrl ||
                  "",

                textAlign:
                  section.textAlign ||
                  "left",

                imagePosition:
                  section.imagePosition ||
                  "right",

                sortOrder:
                  Number(
                    section.sortOrder ??
                      index
                  ) || 0,

                isActive:
                  section.isActive !==
                  false,
              })
            )
          : [],

      faqItems:
        Array.isArray(
          page.faqItems
        )
          ? page.faqItems
              .filter(
                (item) =>
                  item.question?.trim() ||
                  item.answer?.trim()
              )
              .map(
                (
                  item,
                  index
                ) => ({
                  ...(item._id
                    ? {
                        _id:
                          item._id,
                      }
                    : {}),

                  question:
                    String(
                      item.question ||
                        ""
                    ).trim(),

                  answer:
                    item.answer ||
                    "",

                  sortOrder:
                    Number(
                      item.sortOrder ??
                        index
                    ) || 0,

                  isActive:
                    item.isActive !==
                    false,
                })
              )
          : [],

      showInHeader:
        Boolean(
          page.showInHeader
        ),

      menuLabel:
        String(
          page.menuLabel ||
            page.title ||
            ""
        ).trim(),

      menuOrder:
        Number(
          page.menuOrder
        ) || 0,

      parentPage:
        page.parentPage ||
        null,

      openInNewTab:
        Boolean(
          page.openInNewTab
        ),

      showInFooter:
        Boolean(
          page.showInFooter
        ),

      footerOrder:
        Number(
          page.footerOrder
        ) || 0,

      isActive:
        page.isActive !==
        false,

      isPublished:
        page.isPublished !==
        false,

      metaTitle:
        page.metaTitle ||
        "",

      metaDescription:
        page.metaDescription ||
        "",

      metaKeywords:
        Array.isArray(
          page.metaKeywords
        )
          ? page.metaKeywords
          : String(
              page.metaKeywords ||
                ""
            )
              .split(",")
              .map((item) =>
                item.trim()
              )
              .filter(Boolean),

      socialImage:
        page.socialImage ||
        "",
    };
  };

// ========================================
// EXPORT BASE URL
// ========================================

export {
  VITE_API_URL,
  PAGES_ENDPOINT,
};