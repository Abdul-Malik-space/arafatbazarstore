const mongoose = require("mongoose");

// ========================================
// HELPERS
// ========================================

const createSlug = (value = "") => {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ========================================
// PAGE HERO
// ========================================

const pageHeroSchema =
  new mongoose.Schema(
    {
      isEnabled: {
        type: Boolean,
        default: true,
      },

      heading: {
        type: String,
        default: "",
        trim: true,
      },

      subheading: {
        type: String,
        default: "",
        trim: true,
      },

      image: {
        type: String,
        default: "",
        trim: true,
      },

      imageAlt: {
        type: String,
        default: "",
        trim: true,
      },

      buttonText: {
        type: String,
        default: "",
        trim: true,
      },

      buttonUrl: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

// ========================================
// PAGE SECTION
// ========================================

const pageSectionSchema =
  new mongoose.Schema(
    {
      sectionType: {
        type: String,

        enum: [
          "text",
          "imageText",
          "banner",
          "cta",
          "faq",
        ],

        default: "text",
      },

      heading: {
        type: String,
        default: "",
        trim: true,
      },

      subheading: {
        type: String,
        default: "",
        trim: true,
      },

      content: {
        type: String,
        default: "",
      },

      image: {
        type: String,
        default: "",
        trim: true,
      },

      imageAlt: {
        type: String,
        default: "",
        trim: true,
      },

      buttonText: {
        type: String,
        default: "",
        trim: true,
      },

      buttonUrl: {
        type: String,
        default: "",
        trim: true,
      },

      textAlign: {
        type: String,

        enum: [
          "left",
          "center",
          "right",
        ],

        default: "left",
      },

      imagePosition: {
        type: String,

        enum: [
          "left",
          "right",
          "top",
          "background",
        ],

        default: "right",
      },

      sortOrder: {
        type: Number,
        default: 0,
        min: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: false,
    }
  );

// ========================================
// FAQ ITEM
// ========================================

const faqItemSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        required: true,
        trim: true,
      },

      answer: {
        type: String,
        required: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
        min: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: false,
    }
  );

// ========================================
// PAGE CONTENT
// ========================================

const pageContentSchema =
  new mongoose.Schema(
    {
      // ====================================
      // BASIC PAGE
      // ====================================

      title: {
        type: String,
        required: [
          true,
          "Page title is required",
        ],
        trim: true,
      },

      slug: {
        type: String,
        required: [
          true,
          "Page slug is required",
        ],
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
      },

      // ====================================
      // ROUTE
      //
      // IMPORTANT:
      //
      // Client route manually نہیں لکھے گا۔
      //
      // Custom:
      // /page/privacy-policy
      //
      // System:
      // /about
      // /contact
      // ====================================

      routePath: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true,
      },

      // ====================================
      // PAGE TYPE
      // ====================================

      pageType: {
        type: String,

        enum: [
          "system",
          "custom",
        ],

        default: "custom",
        index: true,
      },

      // ====================================
      // SYSTEM PAGE
      // ====================================

      systemKey: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
        index: true,
      },

      isSystemPage: {
        type: Boolean,
        default: false,
        index: true,
      },

      // ====================================
      // BASIC CONTENT
      // ====================================

      shortDescription: {
        type: String,
        default: "",
        trim: true,
      },

      content: {
        type: String,
        default: "",
      },

      // ====================================
      // HERO
      // ====================================

      hero: {
        type: pageHeroSchema,

        default: () => ({
          isEnabled: true,
        }),
      },

      // ====================================
      // PAGE SECTIONS
      // ====================================

      sections: {
        type: [
          pageSectionSchema,
        ],

        default: [],
      },

      // ====================================
      // FAQ
      // ====================================

      faqItems: {
        type: [
          faqItemSchema,
        ],

        default: [],
      },

      // ====================================
      // HEADER MANAGEMENT
      // ====================================

      showInHeader: {
        type: Boolean,
        default: false,
        index: true,
      },

      menuLabel: {
        type: String,
        default: "",
        trim: true,
      },

      menuOrder: {
        type: Number,
        default: 0,
        min: 0,
      },

      // ====================================
      // HEADER DROPDOWN
      //
      // null = main menu
      //
      // ObjectId = dropdown child
      // ====================================

      parentPage: {
        type:
          mongoose.Schema.Types
            .ObjectId,

        ref: "PageContent",

        default: null,

        index: true,
      },

      openInNewTab: {
        type: Boolean,
        default: false,
      },

      // ====================================
      // FOOTER
      // ====================================

      showInFooter: {
        type: Boolean,
        default: false,
        index: true,
      },

      footerOrder: {
        type: Number,
        default: 0,
        min: 0,
      },

      // ====================================
      // STATUS
      // ====================================

      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },

      isPublished: {
        type: Boolean,
        default: true,
        index: true,
      },

      // ====================================
      // SEO
      // ====================================

      metaTitle: {
        type: String,
        default: "",
        trim: true,
      },

      metaDescription: {
        type: String,
        default: "",
        trim: true,
      },

      metaKeywords: {
        type: [String],
        default: [],
      },

      socialImage: {
        type: String,
        default: "",
        trim: true,
      },
    },
    {
      timestamps: true,

      toJSON: {
        virtuals: true,
      },

      toObject: {
        virtuals: true,
      },
    }
  );

// ========================================
// PRE VALIDATE
//
// IMPORTANT:
//
// Route یہاں automatically بنتا ہے.
//
// Frontend اگر غلط route بھی بھیجے
// تب بھی backend canonical route save کرے گا.
// ========================================

pageContentSchema.pre(
  "validate",
  function () {
    // ======================================
    // TITLE
    // ======================================

    if (this.title) {
      this.title =
        String(
          this.title
        ).trim();
    }

    // ======================================
    // SLUG
    // ======================================

    const normalizedSlug =
      createSlug(
        this.slug ||
          this.title
      );

    if (!normalizedSlug) {
      throw new Error(
        "A valid page slug is required."
      );
    }

    this.slug =
      normalizedSlug;

    // ======================================
    // SYSTEM PAGE
    // ======================================

    const systemMode =
      this.isSystemPage ===
        true ||
      this.pageType ===
        "system";

    if (systemMode) {
      this.isSystemPage =
        true;

      this.pageType =
        "system";

      const normalizedSystemKey =
        createSlug(
          this.systemKey ||
            this.slug
        );

      if (
        !normalizedSystemKey
      ) {
        throw new Error(
          "System page key is required."
        );
      }

      this.systemKey =
        normalizedSystemKey;

      // ------------------------------------
      // SYSTEM ROUTE
      //
      // about → /about
      // contact → /contact
      // track-order → /track-order
      // ------------------------------------

      this.routePath =
        `/${normalizedSystemKey}`;
    }

    // ======================================
    // CUSTOM PAGE
    // ======================================

    else {
      this.isSystemPage =
        false;

      this.pageType =
        "custom";

      this.systemKey = "";

      // ------------------------------------
      // CUSTOM ROUTE
      //
      // Client route choose نہیں کرے گا۔
      //
      // slug:
      // privacy-policy
      //
      // route:
      // /page/privacy-policy
      // ------------------------------------

      this.routePath =
        `/page/${normalizedSlug}`;
    }

    // ======================================
    // MENU LABEL
    // ======================================

    if (
      !this.menuLabel &&
      this.title
    ) {
      this.menuLabel =
        this.title;
    }

    // ======================================
    // PARENT VALIDATION
    // ======================================

    if (
      this.parentPage &&
      this._id
    ) {
      const parentId =
        this.parentPage?._id ||
        this.parentPage;

      if (
        String(parentId) ===
        String(this._id)
      ) {
        throw new Error(
          "A page cannot be its own parent menu."
        );
      }
    }
  }
);

// ========================================
// INDEXES
// ========================================

pageContentSchema.index({
  showInHeader: 1,
  isActive: 1,
  isPublished: 1,
  parentPage: 1,
  menuOrder: 1,
});

pageContentSchema.index({
  showInFooter: 1,
  isActive: 1,
  isPublished: 1,
  footerOrder: 1,
});

// ========================================
// GET HEADER PAGES
// ========================================

pageContentSchema.statics
  .getHeaderPages =
  async function () {
    const pages =
      await this.find({
        showInHeader: true,
        isActive: true,
        isPublished: true,
      })
        .sort({
          menuOrder: 1,
          title: 1,
        })
        .lean();

    const mainPages =
      pages.filter(
        (page) =>
          !page.parentPage
      );

    const childPages =
      pages.filter(
        (page) =>
          page.parentPage
      );

    return mainPages.map(
      (mainPage) => {
        const children =
          childPages
            .filter(
              (child) =>
                String(
                  child.parentPage
                ) ===
                String(
                  mainPage._id
                )
            )
            .sort(
              (a, b) => {
                const order =
                  Number(
                    a.menuOrder ||
                      0
                  ) -
                  Number(
                    b.menuOrder ||
                      0
                  );

                if (order !== 0) {
                  return order;
                }

                return String(
                  a.title || ""
                ).localeCompare(
                  String(
                    b.title || ""
                  )
                );
              }
            );

        return {
          ...mainPage,
          children,
        };
      }
    );
  };

// ========================================
// GET PUBLIC CUSTOM PAGE
// ========================================

pageContentSchema.statics
  .getPublicPageBySlug =
  function (slug) {
    return this.findOne({
      slug:
        createSlug(slug),

      pageType:
        "custom",

      isActive: true,

      isPublished: true,
    });
  };

// ========================================
// GET PUBLIC SYSTEM PAGE
// ========================================

pageContentSchema.statics
  .getPublicSystemPage =
  function (systemKey) {
    return this.findOne({
      systemKey:
        createSlug(
          systemKey
        ),

      isSystemPage: true,

      pageType:
        "system",

      isActive: true,

      isPublished: true,
    });
  };

// ========================================
// MODEL
// ========================================

const PageContent =
  mongoose.model(
    "PageContent",
    pageContentSchema
  );

module.exports =
  PageContent;