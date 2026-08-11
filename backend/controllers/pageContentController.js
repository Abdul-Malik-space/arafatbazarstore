const mongoose = require("mongoose");

const PageContent = require(
  "../models/PageContent"
);

// ========================================
// HELPERS
// ========================================

// ========================================
// CREATE SLUG
// ========================================

const createSlug = (text = "") => {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ========================================
// NORMALIZE ROUTE
// ========================================

const normalizeRoutePath = (
  routePath = ""
) => {
  let route = String(
    routePath || ""
  ).trim();

  if (!route) {
    return "";
  }

  if (!route.startsWith("/")) {
    route = `/${route}`;
  }

  route = route.replace(
    /\/+/g,
    "/"
  );

  if (
    route.length > 1 &&
    route.endsWith("/")
  ) {
    route = route.slice(
      0,
      -1
    );
  }

  return route;
};

// ========================================
// NORMALIZE BOOLEAN
// ========================================

const normalizeBoolean = (
  value,
  fallback = false
) => {
  if (
    typeof value === "boolean"
  ) {
    return value;
  }

  if (
    value === "true" ||
    value === "1" ||
    value === 1
  ) {
    return true;
  }

  if (
    value === "false" ||
    value === "0" ||
    value === 0
  ) {
    return false;
  }

  return fallback;
};

// ========================================
// NORMALIZE NUMBER
// ========================================

const normalizeNumber = (
  value,
  fallback = 0
) => {
  const number =
    Number(value);

  if (
    Number.isNaN(number) ||
    number < 0
  ) {
    return fallback;
  }

  return number;
};

// ========================================
// NORMALIZE KEYWORDS
// ========================================

const normalizeKeywords = (
  value
) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        String(item).trim()
      )
      .filter(Boolean);
  }

  return String(value)
    .split(",")
    .map((item) =>
      item.trim()
    )
    .filter(Boolean);
};

// ========================================
// NORMALIZE HERO
// ========================================

const normalizeHero = (
  hero = {}
) => {
  return {
    isEnabled:
      normalizeBoolean(
        hero.isEnabled,
        true
      ),

    heading:
      hero.heading || "",

    subheading:
      hero.subheading || "",

    image:
      hero.image || "",

    imageAlt:
      hero.imageAlt || "",

    buttonText:
      hero.buttonText || "",

    buttonUrl:
      hero.buttonUrl || "",
  };
};

// ========================================
// NORMALIZE SECTIONS
// ========================================

const normalizeSections = (
  sections
) => {
  if (!Array.isArray(sections)) {
    return [];
  }

  const allowedTypes = [
    "text",
    "imageText",
    "banner",
    "cta",
    "faq",
  ];

  const allowedAlignments = [
    "left",
    "center",
    "right",
  ];

  const allowedImagePositions = [
    "left",
    "right",
    "top",
    "background",
  ];

  return sections.map(
    (section, index) => {
      const normalized = {
        sectionType:
          allowedTypes.includes(
            section.sectionType
          )
            ? section.sectionType
            : "text",

        heading:
          section.heading || "",

        subheading:
          section.subheading ||
          "",

        content:
          section.content || "",

        image:
          section.image || "",

        imageAlt:
          section.imageAlt || "",

        buttonText:
          section.buttonText ||
          "",

        buttonUrl:
          section.buttonUrl || "",

        textAlign:
          allowedAlignments.includes(
            section.textAlign
          )
            ? section.textAlign
            : "left",

        imagePosition:
          allowedImagePositions.includes(
            section.imagePosition
          )
            ? section.imagePosition
            : "right",

        sortOrder:
          normalizeNumber(
            section.sortOrder,
            index
          ),

        isActive:
          normalizeBoolean(
            section.isActive,
            true
          ),
      };

      // Existing section _id preserve کریں
      if (
        section._id &&
        mongoose.Types.ObjectId.isValid(
          section._id
        )
      ) {
        normalized._id =
          section._id;
      }

      return normalized;
    }
  );
};

// ========================================
// NORMALIZE FAQ ITEMS
// ========================================

const normalizeFaqItems = (
  faqItems
) => {
  if (!Array.isArray(faqItems)) {
    return [];
  }

  return faqItems
    .filter(
      (item) =>
        item.question?.trim() ||
        item.answer?.trim()
    )
    .map((item, index) => {
      const normalized = {
        question:
          String(
            item.question || ""
          ).trim(),

        answer:
          item.answer || "",

        sortOrder:
          normalizeNumber(
            item.sortOrder,
            index
          ),

        isActive:
          normalizeBoolean(
            item.isActive,
            true
          ),
      };

      if (
        item._id &&
        mongoose.Types.ObjectId.isValid(
          item._id
        )
      ) {
        normalized._id =
          item._id;
      }

      return normalized;
    });
};

// ========================================
// VALIDATE OBJECT ID
// ========================================

const isValidObjectId = (
  value
) => {
  return (
    value &&
    mongoose.Types.ObjectId.isValid(
      value
    )
  );
};

// ========================================
// RESERVED ROUTES
//
// Custom pages ان routes کو use
// نہیں کر سکیں گے.
// ========================================

const RESERVED_ROUTE_PREFIXES = [
  "/admin",
  "/api",
  "/product",
  "/cart",
  "/checkout",
  "/order-success",
];

const isReservedCustomRoute = (
  routePath
) => {
  const route =
    normalizeRoutePath(
      routePath
    ).toLowerCase();

  return RESERVED_ROUTE_PREFIXES.some(
    (reserved) =>
      route === reserved ||
      route.startsWith(
        `${reserved}/`
      )
  );
};

// ========================================
// CHECK PARENT PAGE
//
// Header currently supports:
//
// Main Page
//   └── Dropdown Page
//
// We intentionally prevent:
// Main → Child → Grandchild
// ========================================

const validateParentPage =
  async ({
    parentPageId,
    currentPageId = null,
  }) => {
    if (!parentPageId) {
      return {
        valid: true,
        parentPage: null,
      };
    }

    if (
      !isValidObjectId(
        parentPageId
      )
    ) {
      return {
        valid: false,
        message:
          "Invalid parent page.",
      };
    }

    if (
      currentPageId &&
      String(parentPageId) ===
        String(currentPageId)
    ) {
      return {
        valid: false,
        message:
          "A page cannot be its own parent.",
      };
    }

    const parentPage =
      await PageContent.findById(
        parentPageId
      );

    if (!parentPage) {
      return {
        valid: false,
        message:
          "Parent page was not found.",
      };
    }

    // Only one dropdown level
    if (parentPage.parentPage) {
      return {
        valid: false,
        message:
          "A dropdown page cannot itself be used as a parent page.",
      };
    }

    return {
      valid: true,
      parentPage,
    };
  };

// ========================================
// CREATE PAGE
//
// POST /api/page-content
// ========================================

const createPage = async (
  req,
  res
) => {
  try {
    const {
      title,
      slug,
      routePath,

      pageType,
      systemKey,
      isSystemPage,

      shortDescription,
      content,

      hero,
      sections,
      faqItems,

      showInHeader,
      menuLabel,
      menuOrder,
      parentPage,
      openInNewTab,

      showInFooter,
      footerOrder,

      isActive,
      isPublished,

      metaTitle,
      metaDescription,
      metaKeywords,
      socialImage,
    } = req.body;

    // ====================================
    // TITLE
    // ====================================

    if (
      !title ||
      !String(title).trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Page title is required.",
        });
    }

    // ====================================
    // SLUG
    // ====================================

    const finalSlug =
      createSlug(
        slug || title
      );

    if (!finalSlug) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "A valid page slug could not be created.",
        });
    }

    // ====================================
    // PAGE TYPE
    // ====================================

    const finalPageType =
      pageType === "system"
        ? "system"
        : "custom";

    const finalIsSystemPage =
      finalPageType ===
        "system" ||
      normalizeBoolean(
        isSystemPage,
        false
      );

    // ====================================
    // ROUTE
    //
    // Custom page default:
    // /page/example
    // ====================================

    let finalRoutePath =
      normalizeRoutePath(
        routePath
      );

    if (!finalRoutePath) {
      finalRoutePath =
        finalIsSystemPage
          ? `/${finalSlug}`
          : `/page/${finalSlug}`;
    }

    // Custom pages should not override
    // important application routes.

    if (
      !finalIsSystemPage &&
      isReservedCustomRoute(
        finalRoutePath
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This route is reserved by the website and cannot be used for a custom page.",
        });
    }

    // ====================================
    // SYSTEM KEY
    // ====================================

    let finalSystemKey = "";

    if (finalIsSystemPage) {
      finalSystemKey =
        createSlug(
          systemKey ||
            finalSlug
        );

      if (!finalSystemKey) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "System pages require a valid system key.",
          });
      }
    }

    // ====================================
    // DUPLICATE SLUG / ROUTE
    // ====================================

    const duplicate =
      await PageContent.findOne({
        $or: [
          {
            slug: finalSlug,
          },
          {
            routePath:
              finalRoutePath,
          },
        ],
      });

    if (duplicate) {
      const message =
        duplicate.slug ===
        finalSlug
          ? "A page with this slug already exists."
          : "A page with this route already exists.";

      return res
        .status(400)
        .json({
          success: false,
          message,
        });
    }

    // ====================================
    // DUPLICATE SYSTEM KEY
    // ====================================

    if (finalSystemKey) {
      const duplicateSystem =
        await PageContent.findOne(
          {
            systemKey:
              finalSystemKey,
          }
        );

      if (duplicateSystem) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "A system page with this key already exists.",
          });
      }
    }

    // ====================================
    // PARENT PAGE
    // ====================================

    const parentResult =
      await validateParentPage({
        parentPageId:
          parentPage || null,
      });

    if (!parentResult.valid) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            parentResult.message,
        });
    }

    // ====================================
    // CREATE
    // ====================================

    const page =
      await PageContent.create({
        title:
          String(title).trim(),

        slug:
          finalSlug,

        routePath:
          finalRoutePath,

        pageType:
          finalIsSystemPage
            ? "system"
            : "custom",

        systemKey:
          finalSystemKey,

        isSystemPage:
          finalIsSystemPage,

        shortDescription:
          shortDescription || "",

        content:
          content || "",

        hero:
          normalizeHero(hero),

        sections:
          normalizeSections(
            sections
          ),

        faqItems:
          normalizeFaqItems(
            faqItems
          ),

        showInHeader:
          normalizeBoolean(
            showInHeader,
            false
          ),

        menuLabel:
          String(
            menuLabel ||
              title
          ).trim(),

        menuOrder:
          normalizeNumber(
            menuOrder,
            0
          ),

        parentPage:
          parentResult
            .parentPage
            ? parentResult
                .parentPage._id
            : null,

        openInNewTab:
          normalizeBoolean(
            openInNewTab,
            false
          ),

        showInFooter:
          normalizeBoolean(
            showInFooter,
            false
          ),

        footerOrder:
          normalizeNumber(
            footerOrder,
            0
          ),

        isActive:
          normalizeBoolean(
            isActive,
            true
          ),

        isPublished:
          normalizeBoolean(
            isPublished,
            true
          ),

        metaTitle:
          metaTitle || "",

        metaDescription:
          metaDescription || "",

        metaKeywords:
          normalizeKeywords(
            metaKeywords
          ),

        socialImage:
          socialImage || "",
      });

    const populatedPage =
      await PageContent.findById(
        page._id
      ).populate(
        "parentPage",
        "title slug menuLabel routePath"
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Page created successfully.",
        page:
          populatedPage,
      });
  } catch (error) {
    console.error(
      "Create Page Error:",
      error
    );

    if (error?.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "A page with this slug or route already exists.",
        });
    }

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Failed to create page.",
        error:
          error.message,
      });
  }
};

// ========================================
// GET ALL PAGES
//
// Admin
//
// GET /api/page-content
// ========================================

const getPages = async (
  req,
  res
) => {
  try {
    const pages =
      await PageContent.find()
        .populate(
          "parentPage",
          "title slug menuLabel routePath"
        )
        .sort({
          menuOrder: 1,
          createdAt: -1,
        });

    return res
      .status(200)
      .json({
        success: true,
        count:
          pages.length,
        pages,
      });
  } catch (error) {
    console.error(
      "Get Pages Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Failed to fetch pages.",
        error:
          error.message,
      });
  }
};

// ========================================
// GET SINGLE PAGE BY ID
//
// Admin
//
// GET /api/page-content/:id
// ========================================

const getPageById = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid page ID.",
        });
    }

    const page =
      await PageContent.findById(
        req.params.id
      ).populate(
        "parentPage",
        "title slug menuLabel routePath"
      );

    if (!page) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Page not found.",
        });
    }

    return res
      .status(200)
      .json({
        success: true,
        page,
      });
  } catch (error) {
    console.error(
      "Get Page By ID Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Failed to fetch page.",
        error:
          error.message,
      });
  }
};

// ========================================
// GET HEADER MENU TREE
//
// Public
//
// GET /api/page-content/header
// ========================================

const getHeaderPages =
  async (
    req,
    res
  ) => {
    try {
      const pages =
        await PageContent.getHeaderPages();

      return res
        .status(200)
        .json({
          success: true,
          count:
            pages.length,
          pages,
        });
    } catch (error) {
      console.error(
        "Get Header Pages Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to fetch header pages.",
          error:
            error.message,
        });
    }
  };

// ========================================
// GET PUBLIC PAGE BY SLUG
//
// Public custom/general page
//
// GET /api/page-content/public/:slug
// ========================================

const getPublicPageBySlug =
  async (
    req,
    res
  ) => {
    try {
      const slug =
        createSlug(
          req.params.slug
        );

      if (!slug) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid page slug.",
          });
      }

      const page =
        await PageContent.getPublicPageBySlug(
          slug
        );

      if (!page) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Page not found.",
          });
      }

      const pageObject =
        page.toObject();

      // Only active sections
      pageObject.sections =
        Array.isArray(
          pageObject.sections
        )
          ? pageObject.sections
              .filter(
                (section) =>
                  section.isActive !==
                  false
              )
              .sort(
                (a, b) =>
                  Number(
                    a.sortOrder ||
                      0
                  ) -
                  Number(
                    b.sortOrder ||
                      0
                  )
              )
          : [];

      // Only active FAQ items
      pageObject.faqItems =
        Array.isArray(
          pageObject.faqItems
        )
          ? pageObject.faqItems
              .filter(
                (item) =>
                  item.isActive !==
                  false
              )
              .sort(
                (a, b) =>
                  Number(
                    a.sortOrder ||
                      0
                  ) -
                  Number(
                    b.sortOrder ||
                      0
                  )
              )
          : [];

      return res
        .status(200)
        .json({
          success: true,
          page:
            pageObject,
        });
    } catch (error) {
      console.error(
        "Get Public Page Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to fetch page.",
          error:
            error.message,
        });
    }
  };

// ========================================
// GET SYSTEM PAGE
//
// Public
//
// Example:
//
// /api/page-content/system/about
//
// /api/page-content/system/contact
// ========================================

const getSystemPage =
  async (
    req,
    res
  ) => {
    try {
      const systemKey =
        createSlug(
          req.params.systemKey
        );

      if (!systemKey) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Invalid system page key.",
          });
      }

      const page =
        await PageContent.getPublicSystemPage(
          systemKey
        );

      if (!page) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "System page not found.",
          });
      }

      const pageObject =
        page.toObject();

      pageObject.sections =
        Array.isArray(
          pageObject.sections
        )
          ? pageObject.sections
              .filter(
                (section) =>
                  section.isActive !==
                  false
              )
              .sort(
                (a, b) =>
                  Number(
                    a.sortOrder ||
                      0
                  ) -
                  Number(
                    b.sortOrder ||
                      0
                  )
              )
          : [];

      pageObject.faqItems =
        Array.isArray(
          pageObject.faqItems
        )
          ? pageObject.faqItems
              .filter(
                (item) =>
                  item.isActive !==
                  false
              )
              .sort(
                (a, b) =>
                  Number(
                    a.sortOrder ||
                      0
                  ) -
                  Number(
                    b.sortOrder ||
                      0
                  )
              )
          : [];

      return res
        .status(200)
        .json({
          success: true,
          page:
            pageObject,
        });
    } catch (error) {
      console.error(
        "Get System Page Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,
          message:
            "Failed to fetch system page.",
          error:
            error.message,
        });
    }
  };

// ========================================
// UPDATE PAGE
//
// Admin
//
// PUT /api/page-content/:id
// ========================================

const updatePage = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid page ID.",
        });
    }

    const page =
      await PageContent.findById(
        req.params.id
      );

    if (!page) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Page not found.",
        });
    }

    const data =
      req.body || {};

    // ====================================
    // TITLE
    // ====================================

    if (
      data.title !== undefined
    ) {
      if (
        !String(
          data.title
        ).trim()
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Page title cannot be empty.",
          });
      }

      page.title =
        String(
          data.title
        ).trim();
    }

    // ====================================
    // SLUG
    // ====================================

    if (
      data.slug !== undefined
    ) {
      const newSlug =
        createSlug(
          data.slug
        );

      if (!newSlug) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Page slug cannot be empty.",
          });
      }

      const duplicateSlug =
        await PageContent.findOne(
          {
            _id: {
              $ne:
                page._id,
            },

            slug:
              newSlug,
          }
        );

      if (duplicateSlug) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Another page already uses this slug.",
          });
      }

      page.slug =
        newSlug;
    }

    // ====================================
    // ROUTE
    // ====================================

    if (
      data.routePath !==
      undefined
    ) {
      const newRoute =
        normalizeRoutePath(
          data.routePath
        );

      if (!newRoute) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Page route cannot be empty.",
          });
      }

      if (
        !page.isSystemPage &&
        isReservedCustomRoute(
          newRoute
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "This route is reserved by the website.",
          });
      }

      const duplicateRoute =
        await PageContent.findOne(
          {
            _id: {
              $ne:
                page._id,
            },

            routePath:
              newRoute,
          }
        );

      if (duplicateRoute) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Another page already uses this route.",
          });
      }

      page.routePath =
        newRoute;
    }

    // ====================================
    // PAGE TYPE / SYSTEM PAGE
    //
    // Existing system pages cannot be
    // converted into custom pages.
    // ====================================

    if (!page.isSystemPage) {
      if (
        data.pageType ===
        "system" ||
        data.isSystemPage ===
          true
      ) {
        page.pageType =
          "system";

        page.isSystemPage =
          true;
      }
    }

    if (
      page.isSystemPage &&
      data.systemKey !==
        undefined
    ) {
      const newSystemKey =
        createSlug(
          data.systemKey
        );

      if (!newSystemKey) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "System key cannot be empty.",
          });
      }

      const duplicateSystem =
        await PageContent.findOne(
          {
            _id: {
              $ne:
                page._id,
            },

            systemKey:
              newSystemKey,
          }
        );

      if (duplicateSystem) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Another system page already uses this key.",
          });
      }

      page.systemKey =
        newSystemKey;
    }

    // ====================================
    // CONTENT
    // ====================================

    if (
      data.shortDescription !==
      undefined
    ) {
      page.shortDescription =
        data.shortDescription;
    }

    if (
      data.content !==
      undefined
    ) {
      page.content =
        data.content;
    }

    if (
      data.hero !==
      undefined
    ) {
      page.hero =
        normalizeHero(
          data.hero
        );
    }

    if (
      data.sections !==
      undefined
    ) {
      page.sections =
        normalizeSections(
          data.sections
        );
    }

    if (
      data.faqItems !==
      undefined
    ) {
      page.faqItems =
        normalizeFaqItems(
          data.faqItems
        );
    }

    // ====================================
    // HEADER MENU
    // ====================================

    if (
      data.showInHeader !==
      undefined
    ) {
      page.showInHeader =
        normalizeBoolean(
          data.showInHeader,
          page.showInHeader
        );
    }

    if (
      data.menuLabel !==
      undefined
    ) {
      page.menuLabel =
        String(
          data.menuLabel ||
            page.title
        ).trim();
    }

    if (
      data.menuOrder !==
      undefined
    ) {
      page.menuOrder =
        normalizeNumber(
          data.menuOrder,
          0
        );
    }

    // ====================================
    // PARENT PAGE
    // ====================================

    if (
      data.parentPage !==
      undefined
    ) {
      const parentResult =
        await validateParentPage(
          {
            parentPageId:
              data.parentPage ||
              null,

            currentPageId:
              page._id,
          }
        );

      if (!parentResult.valid) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              parentResult.message,
          });
      }

      // --------------------------------
      // Important:
      //
      // If this page already has children,
      // it cannot itself become a child.
      // --------------------------------

      if (
        parentResult.parentPage
      ) {
        const childCount =
          await PageContent.countDocuments(
            {
              parentPage:
                page._id,
            }
          );

        if (childCount > 0) {
          return res
            .status(400)
            .json({
              success: false,
              message:
                "This page already contains dropdown pages, so it cannot be placed under another page.",
            });
        }
      }

      page.parentPage =
        parentResult
          .parentPage
          ? parentResult
              .parentPage._id
          : null;
    }

    if (
      data.openInNewTab !==
      undefined
    ) {
      page.openInNewTab =
        normalizeBoolean(
          data.openInNewTab,
          false
        );
    }

    // ====================================
    // FOOTER
    // ====================================

    if (
      data.showInFooter !==
      undefined
    ) {
      page.showInFooter =
        normalizeBoolean(
          data.showInFooter,
          false
        );
    }

    if (
      data.footerOrder !==
      undefined
    ) {
      page.footerOrder =
        normalizeNumber(
          data.footerOrder,
          0
        );
    }

    // ====================================
    // STATUS
    // ====================================

    if (
      data.isActive !==
      undefined
    ) {
      page.isActive =
        normalizeBoolean(
          data.isActive,
          page.isActive
        );
    }

    if (
      data.isPublished !==
      undefined
    ) {
      page.isPublished =
        normalizeBoolean(
          data.isPublished,
          page.isPublished
        );
    }

    // ====================================
    // SEO
    // ====================================

    if (
      data.metaTitle !==
      undefined
    ) {
      page.metaTitle =
        data.metaTitle;
    }

    if (
      data.metaDescription !==
      undefined
    ) {
      page.metaDescription =
        data.metaDescription;
    }

    if (
      data.metaKeywords !==
      undefined
    ) {
      page.metaKeywords =
        normalizeKeywords(
          data.metaKeywords
        );
    }

    if (
      data.socialImage !==
      undefined
    ) {
      page.socialImage =
        data.socialImage;
    }

    // ====================================
    // SAVE
    // ====================================

    const updatedPage =
      await page.save();

    const populatedPage =
      await PageContent.findById(
        updatedPage._id
      ).populate(
        "parentPage",
        "title slug menuLabel routePath"
      );

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Page updated successfully.",
        page:
          populatedPage,
      });
  } catch (error) {
    console.error(
      "Update Page Error:",
      error
    );

    if (error?.code === 11000) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Another page already uses this slug or route.",
        });
    }

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Failed to update page.",
        error:
          error.message,
      });
  }
};

// ========================================
// DELETE PAGE
//
// Admin
//
// DELETE /api/page-content/:id
// ========================================

const deletePage = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Invalid page ID.",
        });
    }

    const page =
      await PageContent.findById(
        req.params.id
      );

    if (!page) {
      return res
        .status(404)
        .json({
          success: false,
          message:
            "Page not found.",
        });
    }

    // ====================================
    // PROTECT SYSTEM PAGES
    // ====================================

    if (page.isSystemPage) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "System pages cannot be deleted. You can deactivate or unpublish them instead.",
        });
    }

    // ====================================
    // CHILD PAGES CHECK
    // ====================================

    const children =
      await PageContent.countDocuments(
        {
          parentPage:
            page._id,
        }
      );

    if (children > 0) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "This page contains dropdown pages. Move or delete its child pages first.",
        });
    }

    await page.deleteOne();

    return res
      .status(200)
      .json({
        success: true,
        message:
          "Page deleted successfully.",
      });
  } catch (error) {
    console.error(
      "Delete Page Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        message:
          "Failed to delete page.",
        error:
          error.message,
      });
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createPage,
  getPages,
  getPageById,
  getHeaderPages,
  getPublicPageBySlug,
  getSystemPage,
  updatePage,
  deletePage,
};