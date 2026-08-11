const SiteSettings = require("../models/SiteSettings");

// ========================================
// NORMALIZE STRING ARRAY
// ========================================

const normalizeStringArray = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// ========================================
// NORMALIZE BOOLEAN
// ========================================

const normalizeBoolean = (value) => {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value
      .trim()
      .toLowerCase();

    if (
      [
        "true",
        "1",
        "yes",
        "on",
      ].includes(normalized)
    ) {
      return true;
    }

    if (
      [
        "false",
        "0",
        "no",
        "off",
        "",
      ].includes(normalized)
    ) {
      return false;
    }
  }

  return Boolean(value);
};

// ========================================
// PLAIN OBJECT
// ========================================

const toPlainObject = (item) => {
  if (!item) {
    return item;
  }

  if (
    typeof item.toObject ===
    "function"
  ) {
    return item.toObject();
  }

  return item;
};

// ========================================
// ACTIVE + SORTED ITEMS
// ========================================

const getActiveSortedItems = (
  items
) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return [...items]
    .filter(
      (item) =>
        item?.isActive !== false
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
// PREPARE ORDERED ITEMS
// ========================================

const prepareOrderedItems = (
  items
) => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map(
    (item, index) => ({
      ...item,
      sortOrder: index,
    })
  );
};

// ========================================
// PUBLIC HERO SLIDE
// ========================================

const normalizePublicHeroSlide = (
  slide
) => {
  const plain =
    toPlainObject(slide);

  return {
    ...plain,

    subtitle:
      plain?.subtitle ||
      plain?.description ||
      "",
  };
};

// ========================================
// FOOTER LINKS
// ========================================

const normalizeFooterLinks = (
  links
) => {
  if (!Array.isArray(links)) {
    return [];
  }

  return links.map(
    (link, index) => ({
      ...link,

      label: String(
        link?.label || ""
      ).trim(),

      url: String(
        link?.url || "#"
      ).trim(),

      sortOrder: index,

      openInNewTab:
        normalizeBoolean(
          link?.openInNewTab
        ),

      isActive:
        link?.isActive ===
        undefined
          ? true
          : normalizeBoolean(
              link.isActive
            ),
    })
  );
};

// ========================================
// FOOTER COLUMNS
// ========================================

const normalizeFooterColumns = (
  columns
) => {
  if (!Array.isArray(columns)) {
    return [];
  }

  return columns.map(
    (column, index) => ({
      ...column,

      title: String(
        column?.title || ""
      ).trim(),

      sortOrder: index,

      isActive:
        column?.isActive ===
        undefined
          ? true
          : normalizeBoolean(
              column.isActive
            ),

      links:
        normalizeFooterLinks(
          column?.links
        ),
    })
  );
};

// ========================================
// PUBLIC FOOTER COLUMNS
// ========================================

const getActiveFooterColumns = (
  columns
) => {
  if (!Array.isArray(columns)) {
    return [];
  }

  return [...columns]
    .filter(
      (column) =>
        column?.isActive !== false
    )
    .sort(
      (a, b) =>
        Number(
          a?.sortOrder || 0
        ) -
        Number(
          b?.sortOrder || 0
        )
    )
    .map((column) => {
      const plain =
        toPlainObject(column);

      return {
        ...plain,

        links:
          getActiveSortedItems(
            plain?.links
          ).map(
            toPlainObject
          ),
      };
    });
};

// ========================================
// SIMPLE FIELDS
// ========================================

const setSimpleFields = (
  settings,
  data,
  fields
) => {
  fields.forEach(
    (field) => {
      if (
        data[field] !==
        undefined
      ) {
        settings[field] =
          data[field];
      }
    }
  );
};

// ========================================
// UPDATE SUB DOCUMENT
// ========================================

const updateSubdocument = (
  target,
  source,
  fields,
  booleanFields = []
) => {
  if (
    !source ||
    typeof source !== "object" ||
    Array.isArray(source)
  ) {
    return;
  }

  fields.forEach(
    (field) => {
      if (
        source[field] ===
        undefined
      ) {
        return;
      }

      target[field] =
        booleanFields.includes(
          field
        )
          ? normalizeBoolean(
              source[field]
            )
          : source[field];
    }
  );
};

// ========================================
// GET ALL SITE SETTINGS
//
// ADMIN
//
// GET /api/site-settings
// ========================================

const getSiteSettings = async (
  req,
  res
) => {
  try {
    const settings =
      await SiteSettings.getSettings();

    return res
      .status(200)
      .json({
        success: true,
        settings,
      });
  } catch (error) {
    console.error(
      "Get Site Settings Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to fetch site settings",

        error:
          error.message,
      });
  }
};

// ========================================
// GET PUBLIC SITE SETTINGS
//
// CUSTOMER WEBSITE
//
// GET /api/site-settings/public
// ========================================

const getPublicSiteSettings =
  async (req, res) => {
    try {
      const settings =
        await SiteSettings.getSettings();

      // ====================================
      // HERO
      // ====================================

      const heroSlides =
        getActiveSortedItems(
          settings.heroSlides
        ).map(
          normalizePublicHeroSlide
        );

      // ====================================
      // PROMOTIONAL BANNERS
      // ====================================

      const promotionalBanners =
        getActiveSortedItems(
          settings
            .promotionalBanners
        ).map(
          toPlainObject
        );

      // ====================================
      // TESTIMONIALS
      // ====================================

      const testimonials =
        getActiveSortedItems(
          settings.testimonials
        ).map(
          toPlainObject
        );

      // ====================================
      // BRAND LOGOS
      // ====================================

      const brandLogos =
        getActiveSortedItems(
          settings.brandLogos
        ).map(
          toPlainObject
        );

      // ====================================
      // BLOG POSTS
      // ====================================

      const blogPosts =
        getActiveSortedItems(
          settings.blogPosts
        ).map(
          toPlainObject
        );

      // ====================================
      // LARGE BACKGROUND BANNER
      // ====================================

      let backgroundBanner =
        null;

      if (
        settings
          .backgroundBanner &&
        settings
          .backgroundBanner
          .isActive !== false
      ) {
        backgroundBanner =
          toPlainObject(
            settings
              .backgroundBanner
          );
      }

      // ====================================
      // FOOTER NEWSLETTER
      // ====================================

      const footerNewsletter =
        settings
          .footerNewsletter
          ? toPlainObject(
              settings
                .footerNewsletter
            )
          : null;

      // ====================================
      // FOOTER MOBILE APP
      // ====================================

      const footerMobileApp =
        settings.footerMobileApp
          ? toPlainObject(
              settings
                .footerMobileApp
            )
          : null;

      // ====================================
      // OPENING HOURS
      // ====================================

      const openingHours =
        settings.openingHours
          ? toPlainObject(
              settings.openingHours
            )
          : null;

      // ====================================
      // FOOTER COLUMNS
      // ====================================

      const footerColumns =
        getActiveFooterColumns(
          settings.footerColumns
        );

      // ====================================
      // PUBLIC SETTINGS
      // ====================================

      const publicSettings = {
        // ----------------------------------
        // STORE IDENTITY
        // ----------------------------------

        storeName:
          settings.storeName,

        storeTagline:
          settings.storeTagline,

        logo:
          settings.logo,

        favicon:
          settings.favicon,

        // ----------------------------------
        // CONTACT
        // ----------------------------------

        phone:
          settings.phone,

        alternatePhone:
          settings.alternatePhone,

        whatsapp:
          settings.whatsapp,

        email:
          settings.email,

        // ----------------------------------
        // ADDRESS
        // ----------------------------------

        address:
          settings.address,

        city:
          settings.city,

        province:
          settings.province,

        country:
          settings.country,

        googleMapsUrl:
          settings.googleMapsUrl,

        // ----------------------------------
        // ABOUT
        // ----------------------------------

        aboutShort:
          settings.aboutShort,

        aboutFull:
          settings.aboutFull,

        // ----------------------------------
        // CURRENCY
        // ----------------------------------

        currency:
          settings.currency,

        currencySymbol:
          settings.currencySymbol,

        // ----------------------------------
        // DELIVERY
        // ----------------------------------

        deliveryFee:
          settings.deliveryFee,

        freeDeliveryEnabled:
          settings
            .freeDeliveryEnabled,

        freeDeliveryMinimum:
          settings
            .freeDeliveryMinimum,

        estimatedDeliveryText:
          settings
            .estimatedDeliveryText,

        // ----------------------------------
        // PAYMENT METHODS
        // ----------------------------------

        paymentMethods: {
          cod:
            settings
              .codEnabled,

          bankTransfer:
            settings
              .bankTransferEnabled,

          easypaisa:
            settings
              .easypaisaEnabled,

          jazzcash:
            settings
              .jazzcashEnabled,

          card:
            settings
              .cardPaymentEnabled,
        },

        bankAccountDetails:
          settings
            .bankTransferEnabled
            ? settings
                .bankAccountDetails
            : "",

        easypaisaNumber:
          settings
            .easypaisaEnabled
            ? settings
                .easypaisaNumber
            : "",

        jazzcashNumber:
          settings
            .jazzcashEnabled
            ? settings
                .jazzcashNumber
            : "",

        // ----------------------------------
        // HEADER
        // ----------------------------------

        announcementText:
          settings
            .announcementText,

        showAnnouncement:
          settings
            .showAnnouncement,

        menuItems:
          getActiveSortedItems(
            settings.menuItems
          ).map(
            toPlainObject
          ),

        // ----------------------------------
        // HOME
        // ----------------------------------

        heroSlides,

        promotionalBanners,

        backgroundBanner,

        testimonials,

        brandLogos,

        blogPosts,

        homeSections:
          settings.homeSections,

        // ----------------------------------
        // SOCIAL
        // ----------------------------------

        socialLinks:
          Array.isArray(
            settings.socialLinks
          )
            ? settings
                .socialLinks
                .filter(
                  (link) =>
                    link
                      ?.isActive !==
                    false
                )
                .map(
                  toPlainObject
                )
            : [],

        // ----------------------------------
        // FOOTER GENERAL
        // ----------------------------------

        footerLogo:
          settings.footerLogo ||
          settings.logo ||
          "",

        footerDescription:
          settings
            .footerDescription,

        footerCopyright:
          settings
            .footerCopyright,

        // ----------------------------------
        // FOOTER NEWSLETTER
        // ----------------------------------

        showNewsletter:
          settings
            .showNewsletter,

        footerNewsletter,

        // ----------------------------------
        // MOBILE APP
        // ----------------------------------

        footerMobileApp,

        // ----------------------------------
        // FOOTER COLUMNS
        // ----------------------------------

        footerColumns,

        // ----------------------------------
        // OPENING HOURS
        // ----------------------------------

        showOpeningHours:
          settings
            .showOpeningHours,

        openingHoursTitle:
          settings
            .openingHoursTitle,

        openingHours,

        // ----------------------------------
        // FOOTER SOCIAL
        // ----------------------------------

        showFooterSocial:
          settings
            .showFooterSocial,

        footerSocialTitle:
          settings
            .footerSocialTitle,

        // ----------------------------------
        // CMS FOOTER PAGES
        // ----------------------------------

        showCmsPagesInFooter:
          settings
            .showCmsPagesInFooter,

        // ----------------------------------
        // OLD FOOTER ALIASES
        //
        // Current Footer.jsx ابھی ان
        // fields کو use کر سکتا ہے۔
        // ----------------------------------

        appQrImage:
          footerMobileApp
            ?.qrImage ||
          "",

        googlePlayImage:
          footerMobileApp
            ?.googlePlayImage ||
          "",

        googlePlayUrl:
          footerMobileApp
            ?.googlePlayUrl ||
          "",

        appStoreImage:
          footerMobileApp
            ?.appStoreImage ||
          "",

        appStoreUrl:
          footerMobileApp
            ?.appStoreUrl ||
          "",

        // ----------------------------------
        // COLORS
        // ----------------------------------

        primaryColor:
          settings.primaryColor,

        secondaryColor:
          settings.secondaryColor,

        accentColor:
          settings.accentColor,

        // ----------------------------------
        // SEO
        // ----------------------------------

        metaTitle:
          settings.metaTitle,

        metaDescription:
          settings.metaDescription,

        metaKeywords:
          settings.metaKeywords,

        // ----------------------------------
        // STORE STATUS
        // ----------------------------------

        storeEnabled:
          settings.storeEnabled,

        maintenanceMode:
          settings
            .maintenanceMode,

        maintenanceMessage:
          settings
            .maintenanceMessage,
      };

      return res
        .status(200)
        .json({
          success: true,

          settings:
            publicSettings,
        });
    } catch (error) {
      console.error(
        "Get Public Settings Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to fetch public site settings",

          error:
            error.message,
        });
    }
  };

// ========================================
// UPDATE SITE SETTINGS
//
// PUT /api/site-settings
//
// ADMIN
// ========================================

const updateSiteSettings =
  async (req, res) => {
    try {
      const settings =
        await SiteSettings.getSettings();

      const data =
        req.body || {};

      // ====================================
      // SIMPLE FIELDS
      // ====================================

      setSimpleFields(
        settings,
        data,
        [
          // Store
          "storeName",
          "storeTagline",
          "logo",
          "favicon",

          // Contact
          "phone",
          "alternatePhone",
          "whatsapp",
          "email",

          // Address
          "address",
          "city",
          "province",
          "country",
          "googleMapsUrl",

          // About
          "aboutShort",
          "aboutFull",

          // Currency
          "currency",
          "currencySymbol",

          // Delivery
          "estimatedDeliveryText",

          // Payment
          "bankAccountDetails",
          "easypaisaNumber",
          "jazzcashNumber",

          // Header
          "announcementText",

          // Footer
          "footerLogo",
          "footerDescription",
          "footerCopyright",
          "openingHoursTitle",
          "footerSocialTitle",

          // Theme
          "primaryColor",
          "secondaryColor",
          "accentColor",

          // SEO
          "metaTitle",
          "metaDescription",

          // Maintenance
          "maintenanceMessage",
        ]
      );

      // ====================================
      // DELIVERY FEE
      // ====================================

      if (
        data.deliveryFee !==
        undefined
      ) {
        const deliveryFee =
          Number(
            data.deliveryFee
          );

        if (
          Number.isNaN(
            deliveryFee
          ) ||
          deliveryFee < 0
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Delivery fee must be a valid positive number",
            });
        }

        settings.deliveryFee =
          deliveryFee;
      }

      // ====================================
      // FREE DELIVERY MINIMUM
      // ====================================

      if (
        data
          .freeDeliveryMinimum !==
        undefined
      ) {
        const minimum =
          Number(
            data
              .freeDeliveryMinimum
          );

        if (
          Number.isNaN(minimum) ||
          minimum < 0
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Free delivery minimum must be valid",
            });
        }

        settings
          .freeDeliveryMinimum =
          minimum;
      }

      // ====================================
      // BOOLEAN SETTINGS
      // ====================================

      const booleanFields = [
        "freeDeliveryEnabled",

        "codEnabled",
        "bankTransferEnabled",
        "easypaisaEnabled",
        "jazzcashEnabled",
        "cardPaymentEnabled",

        "showAnnouncement",

        "showNewsletter",
        "showOpeningHours",
        "showFooterSocial",
        "showCmsPagesInFooter",

        "storeEnabled",
        "maintenanceMode",
      ];

      booleanFields.forEach(
        (field) => {
          if (
            data[field] !==
            undefined
          ) {
            settings[field] =
              normalizeBoolean(
                data[field]
              );
          }
        }
      );

      // ====================================
      // META KEYWORDS
      // ====================================

      if (
        data.metaKeywords !==
        undefined
      ) {
        settings.metaKeywords =
          normalizeStringArray(
            data.metaKeywords
          );
      }

      // ====================================
      // HEADER MENU
      // ====================================

      if (
        Array.isArray(
          data.menuItems
        )
      ) {
        settings.menuItems =
          prepareOrderedItems(
            data.menuItems
          );
      }

      // ====================================
      // HERO SLIDES
      // ====================================

      if (
        Array.isArray(
          data.heroSlides
        )
      ) {
        settings.heroSlides =
          prepareOrderedItems(
            data.heroSlides
          );
      }

      // ====================================
      // PROMOTIONAL BANNERS
      // ====================================

      if (
        Array.isArray(
          data
            .promotionalBanners
        )
      ) {
        settings
          .promotionalBanners =
          prepareOrderedItems(
            data
              .promotionalBanners
          );
      }

      // ====================================
      // BACKGROUND BANNER
      // ====================================

      if (
        data.backgroundBanner &&
        typeof data
          .backgroundBanner ===
          "object" &&
        !Array.isArray(
          data.backgroundBanner
        )
      ) {
        if (
          !settings
            .backgroundBanner
        ) {
          settings
            .backgroundBanner =
            {};
        }

        updateSubdocument(
          settings
            .backgroundBanner,

          data.backgroundBanner,

          [
            "title",
            "subtitle",
            "image",
            "buttonText",
            "buttonUrl",
            "isActive",
          ],

          [
            "isActive",
          ]
        );
      }

      // ====================================
      // TESTIMONIALS
      // ====================================

      if (
        Array.isArray(
          data.testimonials
        )
      ) {
        settings.testimonials =
          prepareOrderedItems(
            data.testimonials
          );
      }

      // ====================================
      // BRAND LOGOS
      // ====================================

      if (
        Array.isArray(
          data.brandLogos
        )
      ) {
        settings.brandLogos =
          prepareOrderedItems(
            data.brandLogos
          );
      }

      // ====================================
      // BLOG POSTS
      // ====================================

      if (
        Array.isArray(
          data.blogPosts
        )
      ) {
        settings.blogPosts =
          prepareOrderedItems(
            data.blogPosts
          );
      }

      // ====================================
      // HOME SECTIONS
      // ====================================

      if (
        data.homeSections &&
        typeof data
          .homeSections ===
          "object" &&
        !Array.isArray(
          data.homeSections
        )
      ) {
        const sections =
          data.homeSections;

        Object.keys(
          sections
        ).forEach(
          (sectionKey) => {
            const sectionData =
              sections[
                sectionKey
              ];

            if (
              !sectionData ||
              typeof sectionData !==
                "object" ||
              Array.isArray(
                sectionData
              )
            ) {
              return;
            }

            if (
              !settings
                .homeSections?.[
                  sectionKey
                ]
            ) {
              return;
            }

            Object.keys(
              sectionData
            ).forEach(
              (property) => {
                settings
                  .homeSections[
                    sectionKey
                  ][property] =
                  property ===
                  "isActive"
                    ? normalizeBoolean(
                        sectionData[
                          property
                        ]
                      )
                    : sectionData[
                        property
                      ];
              }
            );
          }
        );
      }

      // ====================================
      // SOCIAL LINKS
      // ====================================

      if (
        Array.isArray(
          data.socialLinks
        )
      ) {
        settings.socialLinks =
          data.socialLinks.map(
            (link) => ({
              ...link,

              platform:
                String(
                  link?.platform ||
                    ""
                ).trim(),

              url:
                String(
                  link?.url ||
                    ""
                ).trim(),

              isActive:
                link?.isActive ===
                undefined
                  ? true
                  : normalizeBoolean(
                      link.isActive
                    ),
            })
          );
      }

      // ====================================
      // FOOTER NEWSLETTER
      // ====================================

      if (
        data.footerNewsletter &&
        typeof data
          .footerNewsletter ===
          "object" &&
        !Array.isArray(
          data.footerNewsletter
        )
      ) {
        if (
          !settings
            .footerNewsletter
        ) {
          settings
            .footerNewsletter =
            {};
        }

        updateSubdocument(
          settings
            .footerNewsletter,

          data.footerNewsletter,

          [
            "isActive",
            "title",
            "description",
            "placeholder",
            "buttonText",
          ],

          [
            "isActive",
          ]
        );

        // Keep old switch synced
        if (
          data
            .footerNewsletter
            .isActive !==
          undefined
        ) {
          settings.showNewsletter =
            normalizeBoolean(
              data
                .footerNewsletter
                .isActive
            );
        }
      }

      // ====================================
      // OLD NEWSLETTER SWITCH
      // ====================================

      if (
        data.showNewsletter !==
        undefined
      ) {
        if (
          !settings
            .footerNewsletter
        ) {
          settings
            .footerNewsletter =
            {};
        }

        settings
          .footerNewsletter
          .isActive =
          normalizeBoolean(
            data.showNewsletter
          );
      }

      // ====================================
      // FOOTER MOBILE APP
      // ====================================

      if (
        data.footerMobileApp &&
        typeof data
          .footerMobileApp ===
          "object" &&
        !Array.isArray(
          data.footerMobileApp
        )
      ) {
        if (
          !settings
            .footerMobileApp
        ) {
          settings
            .footerMobileApp =
            {};
        }

        updateSubdocument(
          settings
            .footerMobileApp,

          data.footerMobileApp,

          [
            "isActive",
            "title",
            "description",
            "qrImage",
            "googlePlayImage",
            "googlePlayUrl",
            "appStoreImage",
            "appStoreUrl",
          ],

          [
            "isActive",
          ]
        );
      }

      // ====================================
      // OLD APP QR FIELD
      // ====================================

      if (
        data.appQrImage !==
        undefined
      ) {
        if (
          !settings
            .footerMobileApp
        ) {
          settings
            .footerMobileApp =
            {};
        }

        settings
          .footerMobileApp
          .qrImage =
          data.appQrImage;
      }

      // ====================================
      // OLD GOOGLE PLAY IMAGE
      // ====================================

      if (
        data.googlePlayImage !==
        undefined
      ) {
        if (
          !settings
            .footerMobileApp
        ) {
          settings
            .footerMobileApp =
            {};
        }

        settings
          .footerMobileApp
          .googlePlayImage =
          data.googlePlayImage;
      }

      // ====================================
      // GOOGLE PLAY URL
      // ====================================

      if (
        data.googlePlayUrl !==
        undefined
      ) {
        if (
          !settings
            .footerMobileApp
        ) {
          settings
            .footerMobileApp =
            {};
        }

        settings
          .footerMobileApp
          .googlePlayUrl =
          data.googlePlayUrl;
      }

      // ====================================
      // OLD APP STORE IMAGE
      // ====================================

      if (
        data.appStoreImage !==
        undefined
      ) {
        if (
          !settings
            .footerMobileApp
        ) {
          settings
            .footerMobileApp =
            {};
        }

        settings
          .footerMobileApp
          .appStoreImage =
          data.appStoreImage;
      }

      // ====================================
      // APP STORE URL
      // ====================================

      if (
        data.appStoreUrl !==
        undefined
      ) {
        if (
          !settings
            .footerMobileApp
        ) {
          settings
            .footerMobileApp =
            {};
        }

        settings
          .footerMobileApp
          .appStoreUrl =
          data.appStoreUrl;
      }

      // ====================================
      // FOOTER COLUMNS
      // ====================================

      if (
        Array.isArray(
          data.footerColumns
        )
      ) {
        const columns =
          normalizeFooterColumns(
            data.footerColumns
          );

        // ----------------------------------
        // COLUMN TITLE VALIDATION
        // ----------------------------------

        const invalidColumn =
          columns.find(
            (column) =>
              !column.title
          );

        if (
          invalidColumn
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Every footer column must have a title",
            });
        }

        // ----------------------------------
        // LINK LABEL VALIDATION
        // ----------------------------------

        const invalidLink =
          columns
            .flatMap(
              (column) =>
                column.links ||
                []
            )
            .find(
              (link) =>
                !link.label
            );

        if (
          invalidLink
        ) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "Every footer link must have a label",
            });
        }

        settings.footerColumns =
          columns;
      }

      // ====================================
      // OPENING HOURS
      // ====================================

      if (
        data.openingHours &&
        typeof data
          .openingHours ===
          "object" &&
        !Array.isArray(
          data.openingHours
        )
      ) {
        if (
          !settings.openingHours
        ) {
          settings.openingHours =
            {};
        }

        updateSubdocument(
          settings.openingHours,

          data.openingHours,

          [
            "mondayThursdayLabel",
            "mondayThursday",

            "fridaySaturdayLabel",
            "fridaySaturday",

            "sundayLabel",
            "sunday",
          ]
        );
      }

      // ====================================
      // SAVE
      // ====================================

      const updatedSettings =
        await settings.save();

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Site settings updated successfully",

          settings:
            updatedSettings,
        });
    } catch (error) {
      console.error(
        "Update Site Settings Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to update site settings",

          error:
            error.message,
        });
    }
  };

// ========================================
// RESET SETTINGS
//
// POST /api/site-settings/reset
//
// SUPER ADMIN
// ========================================

const resetSiteSettings =
  async (req, res) => {
    try {
      await SiteSettings.deleteMany(
        {}
      );

      const settings =
        await SiteSettings.create(
          {}
        );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Site settings reset successfully",

          settings,
        });
    } catch (error) {
      console.error(
        "Reset Site Settings Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to reset site settings",

          error:
            error.message,
        });
    }
  };

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getSiteSettings,
  getPublicSiteSettings,
  updateSiteSettings,
  resetSiteSettings,
};