const mongoose = require("mongoose");

// ========================================
// SOCIAL LINK SCHEMA
// ========================================

const socialLinkSchema =
  new mongoose.Schema(
    {
      platform: {
        type: String,
        required: true,
        trim: true,
      },

      url: {
        type: String,
        default: "",
        trim: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// MENU ITEM SCHEMA
// ========================================

const menuItemSchema =
  new mongoose.Schema(
    {
      label: {
        type: String,
        required: true,
        trim: true,
      },

      url: {
        type: String,
        required: true,
        trim: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },

      openInNewTab: {
        type: Boolean,
        default: false,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// HERO SLIDER SCHEMA
// ========================================

const heroSlideSchema =
  new mongoose.Schema(
    {
      // ------------------------------------
      // SMALL TITLE - OPTIONAL
      // ------------------------------------

      smallTitle: {
        type: String,
        default: "",
        trim: true,
      },

      // ------------------------------------
      // MAIN HEADING - OPTIONAL
      //
      // A banner may already contain its
      // heading inside the uploaded image.
      // Keep this empty in that case.
      // ------------------------------------

      title: {
        type: String,
        default: "",
        trim: true,
      },

      // ------------------------------------
      // SUBTITLE - OPTIONAL
      // ------------------------------------

      subtitle: {
        type: String,
        default: "",
        trim: true,
      },

      // Backwards compatibility
      description: {
        type: String,
        default: "",
        trim: true,
      },

      // ------------------------------------
      // PRICE / OFFER TEXT - OPTIONAL
      // ------------------------------------

      priceText: {
        type: String,
        default: "",
        trim: true,
      },

      // ------------------------------------
      // OVERLAY TEXT COLOR
      //
      // Used for small title, heading,
      // subtitle and price/offer text.
      // ------------------------------------

      textColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      // ====================================
      // CTA BUTTON
      // ====================================

      buttonText: {
        type: String,
        default: "",
        trim: true,
      },

      buttonUrl: {
        type: String,
        default: "/shop",
        trim: true,
      },

      buttonBackgroundColor: {
        type: String,
        default: "#272727",
        trim: true,
      },

      buttonTextColor: {
        type: String,
        default: "#ffffff",
        trim: true,
      },

      // ------------------------------------
      // CUSTOM BUTTON POSITION
      //
      // false = button follows normal text
      // layout.
      // true = use X/Y percentages below.
      // ------------------------------------

      buttonCustomPosition: {
        type: Boolean,
        default: false,
      },

      // 0 = left, 50 = center, 100 = right
      buttonPositionX: {
        type: Number,
        default: 15,
        min: 0,
        max: 100,
      },

      // 0 = top, 50 = center, 100 = bottom
      buttonPositionY: {
        type: Number,
        default: 75,
        min: 0,
        max: 100,
      },

      // ====================================
      // HERO IMAGE
      // ====================================

      image: {
        type: String,
        default: "",
      },

      // ====================================
      // ORDER / STATUS
      // ====================================

      sortOrder: {
        type: Number,
        default: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// PROMOTIONAL BANNER SCHEMA
//
// Kept for backwards compatibility.
// Homepage can ignore this.
// ========================================

const bannerSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        default: "",
        trim: true,
      },

      subtitle: {
        type: String,
        default: "",
        trim: true,
      },

      image: {
        type: String,
        default: "",
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

      position: {
        type: String,

        enum: [
          "top",
          "home",
          "middle",
          "bottom",
        ],

        default: "home",
      },

      sortOrder: {
        type: Number,
        default: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// LARGE BACKGROUND BANNER
// ========================================

const backgroundBannerSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        default: "",
        trim: true,
      },

      subtitle: {
        type: String,
        default: "",
        trim: true,
      },

      image: {
        type: String,
        default: "",
      },

      buttonText: {
        type: String,
        default: "Buy now",
        trim: true,
      },

      buttonUrl: {
        type: String,
        default: "/shop",
        trim: true,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: false,
    }
  );

// ========================================
// TESTIMONIAL
// ========================================

const testimonialSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        required: true,
        trim: true,
      },

      role: {
        type: String,
        default: "Customer",
        trim: true,
      },

      comment: {
        type: String,
        required: true,
        trim: true,
      },

      image: {
        type: String,
        default: "",
      },

      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: 5,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// BRAND LOGO
// ========================================

const brandLogoSchema =
  new mongoose.Schema(
    {
      name: {
        type: String,
        default: "",
        trim: true,
      },

      image: {
        type: String,
        required: true,
      },

      url: {
        type: String,
        default: "",
        trim: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// BLOG / STORY
// ========================================

const blogPostSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      image: {
        type: String,
        default: "",
      },

      url: {
        type: String,
        default: "/shop",
        trim: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// FOOTER LINK
// ========================================

const footerLinkSchema =
  new mongoose.Schema(
    {
      label: {
        type: String,
        required: true,
        trim: true,
      },

      url: {
        type: String,
        default: "#",
        trim: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },

      openInNewTab: {
        type: Boolean,
        default: false,
      },

      isActive: {
        type: Boolean,
        default: true,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// FOOTER COLUMN
// ========================================

const footerColumnSchema =
  new mongoose.Schema(
    {
      title: {
        type: String,
        required: true,
        trim: true,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      links: {
        type: [footerLinkSchema],
        default: [],
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// FOOTER NEWSLETTER
// ========================================

const footerNewsletterSchema =
  new mongoose.Schema(
    {
      isActive: {
        type: Boolean,
        default: true,
      },

      title: {
        type: String,
        default:
          "Our subscribe newsletter",
        trim: true,
      },

      description: {
        type: String,
        default:
          "Don't miss any promotion and get the latest offers from our store.",
        trim: true,
      },

      placeholder: {
        type: String,
        default:
          "Enter your email",
        trim: true,
      },

      buttonText: {
        type: String,
        default: "Subscribe",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

// ========================================
// FOOTER MOBILE APP
// ========================================

const footerMobileAppSchema =
  new mongoose.Schema(
    {
      isActive: {
        type: Boolean,
        default: true,
      },

      title: {
        type: String,
        default:
          "Mobile app store",
        trim: true,
      },

      description: {
        type: String,
        default:
          "Check promotions and shop quickly from your mobile.",
        trim: true,
      },

      qrImage: {
        type: String,
        default: "",
        trim: true,
      },

      googlePlayImage: {
        type: String,
        default: "",
        trim: true,
      },

      googlePlayUrl: {
        type: String,
        default: "",
        trim: true,
      },

      appStoreImage: {
        type: String,
        default: "",
        trim: true,
      },

      appStoreUrl: {
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
// OPENING HOURS
// ========================================

const openingHoursSchema =
  new mongoose.Schema(
    {
      mondayThursdayLabel: {
        type: String,
        default:
          "Monday to Thursday",
        trim: true,
      },

      mondayThursday: {
        type: String,
        default:
          "8:30 AM to 8:30 PM",
        trim: true,
      },

      fridaySaturdayLabel: {
        type: String,
        default:
          "Friday to Saturday",
        trim: true,
      },

      fridaySaturday: {
        type: String,
        default:
          "8:30 AM to 4:30 PM",
        trim: true,
      },

      sundayLabel: {
        type: String,
        default: "Sunday",
        trim: true,
      },

      sunday: {
        type: String,
        default: "Closed",
        trim: true,
      },
    },
    {
      _id: false,
    }
  );

// ========================================
// HOME SECTIONS
// ========================================

const homeSectionsSchema =
  new mongoose.Schema(
    {
      categories: {
        title: {
          type: String,
          default:
            "Shop by Category",
        },

        subtitle: {
          type: String,
          default: "",
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },

      featuredProducts: {
        title: {
          type: String,
          default:
            "Featured Products",
        },

        subtitle: {
          type: String,
          default: "",
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },

      trendingProducts: {
        title: {
          type: String,
          default:
            "Trending Products",
        },

        subtitle: {
          type: String,
          default: "",
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },

      newArrivals: {
        title: {
          type: String,
          default: "New Arrivals",
        },

        subtitle: {
          type: String,
          default: "",
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },

      bestSellers: {
        title: {
          type: String,
          default: "Best Sellers",
        },

        subtitle: {
          type: String,
          default: "",
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },

      deals: {
        title: {
          type: String,
          default:
            "Deal of the Day",
        },

        subtitle: {
          type: String,
          default: "",
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },

      testimonials: {
        title: {
          type: String,
          default:
            "What Our Customers Say",
        },

        subtitle: {
          type: String,
          default: "",
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },

      newsletter: {
        title: {
          type: String,
          default:
            "Subscribe to Our Newsletter",
        },

        description: {
          type: String,
          default:
            "Get the latest offers and updates.",
        },

        isActive: {
          type: Boolean,
          default: true,
        },
      },
    },
    {
      _id: false,
    }
  );

// ========================================
// PACKING OPTION SCHEMA
// ========================================

const packingOptionSchema =
  new mongoose.Schema(
    {
      // Stable key used by checkout/backend.
      // The customer-facing name can change
      // without breaking saved selections.
      code: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },

      name: {
        type: String,
        required: true,
        trim: true,
      },

      description: {
        type: String,
        default: "",
        trim: true,
      },

      // Additional packing charge.
      price: {
        type: Number,
        default: 0,
        min: 0,
      },

      isActive: {
        type: Boolean,
        default: true,
      },

      // Only one option should be treated as
      // default by the admin/controller layer.
      isDefault: {
        type: Boolean,
        default: false,
      },

      sortOrder: {
        type: Number,
        default: 0,
      },
    },
    {
      _id: true,
    }
  );

// ========================================
// SITE SETTINGS
// ========================================

const siteSettingsSchema =
  new mongoose.Schema(
    {
      // ====================================
      // STORE IDENTITY
      // ====================================

      storeName: {
        type: String,
        default: "General Store",
        trim: true,
      },

      storeTagline: {
        type: String,
        default: "",
        trim: true,
      },

      logo: {
        type: String,
        default: "",
      },

      favicon: {
        type: String,
        default: "",
      },

      // ====================================
      // CONTACT DETAILS
      // ====================================

      phone: {
        type: String,
        default: "",
        trim: true,
      },

      alternatePhone: {
        type: String,
        default: "",
        trim: true,
      },

      whatsapp: {
        type: String,
        default: "",
        trim: true,
      },

      email: {
        type: String,
        default: "",
        trim: true,
        lowercase: true,
      },

      // ====================================
      // ADDRESS
      // ====================================

      address: {
        type: String,
        default: "",
        trim: true,
      },

      city: {
        type: String,
        default: "",
        trim: true,
      },

      province: {
        type: String,
        default: "Punjab",
        trim: true,
      },

      country: {
        type: String,
        default: "Pakistan",
        trim: true,
      },

      googleMapsUrl: {
        type: String,
        default: "",
        trim: true,
      },

      // ====================================
      // STORE INFORMATION
      // ====================================

      aboutShort: {
        type: String,
        default: "",
        trim: true,
      },

      aboutFull: {
        type: String,
        default: "",
      },

      // ====================================
      // CURRENCY
      // ====================================

      currency: {
        type: String,
        default: "PKR",
        trim: true,
      },

      currencySymbol: {
        type: String,
        default: "Rs.",
        trim: true,
      },

      // ====================================
      // DELIVERY
      // ====================================

      deliveryFee: {
        type: Number,
        default: 200,
        min: 0,
      },

      freeDeliveryEnabled: {
        type: Boolean,
        default: false,
      },

      freeDeliveryMinimum: {
        type: Number,
        default: 0,
        min: 0,
      },

      estimatedDeliveryText: {
        type: String,
        default:
          "Delivery within 2-4 working days",
        trim: true,
      },

      // ====================================
      // PACKING / PACKAGING OPTIONS
      // ====================================

      // Master switch. When disabled, checkout
      // will not show packing choices.
      packingEnabled: {
        type: Boolean,
        default: true,
      },

      // Admin-manageable packing choices.
      // Prices are stored here and will later
      // be re-validated by the backend when
      // an order is created.
      packingOptions: {
        type: [packingOptionSchema],

        default: [
          {
            code: "standard",
            name: "Standard Packing",
            description:
              "Normal store packaging",
            price: 0,
            isActive: true,
            isDefault: true,
            sortOrder: 1,
          },

          {
            code: "secure",
            name: "Secure Packing",
            description:
              "Extra protective packaging for safer delivery",
            price: 100,
            isActive: true,
            isDefault: false,
            sortOrder: 2,
          },

          {
            code: "gift",
            name: "Gift Packing",
            description:
              "Premium gift wrapping",
            price: 250,
            isActive: true,
            isDefault: false,
            sortOrder: 3,
          },
        ],
      },

      // ====================================
      // PAYMENT METHODS
      // ====================================

      codEnabled: {
        type: Boolean,
        default: true,
      },

      bankTransferEnabled: {
        type: Boolean,
        default: false,
      },

      easypaisaEnabled: {
        type: Boolean,
        default: false,
      },

      jazzcashEnabled: {
        type: Boolean,
        default: false,
      },

      cardPaymentEnabled: {
        type: Boolean,
        default: false,
      },

      bankAccountDetails: {
        type: String,
        default: "",
      },

      easypaisaNumber: {
        type: String,
        default: "",
        trim: true,
      },

      jazzcashNumber: {
        type: String,
        default: "",
        trim: true,
      },

      // ====================================
      // HEADER
      // ====================================

      announcementText: {
        type: String,
        default: "",
        trim: true,
      },

      showAnnouncement: {
        type: Boolean,
        default: true,
      },

      menuItems: {
        type: [menuItemSchema],

        default: [
          {
            label: "Home",
            url: "/",
            sortOrder: 1,
          },

          {
            label: "Shop",
            url: "/shop",
            sortOrder: 2,
          },

          {
            label: "About Us",
            url: "/about",
            sortOrder: 3,
          },

          {
            label: "Contact Us",
            url: "/contact",
            sortOrder: 4,
          },
        ],
      },

      // ====================================
      // HOME PAGE
      // ====================================

      heroSlides: {
        type: [heroSlideSchema],
        default: [],
      },

      promotionalBanners: {
        type: [bannerSchema],
        default: [],
      },

      backgroundBanner: {
        type: backgroundBannerSchema,
        default: () => ({}),
      },

      testimonials: {
        type: [testimonialSchema],
        default: [],
      },

      brandLogos: {
        type: [brandLogoSchema],
        default: [],
      },

      blogPosts: {
        type: [blogPostSchema],
        default: [],
      },

      homeSections: {
        type: homeSectionsSchema,
        default: () => ({}),
      },

      // ====================================
      // SOCIAL MEDIA
      // ====================================

      socialLinks: {
        type: [socialLinkSchema],
        default: [],
      },

      // ====================================
      // FOOTER GENERAL
      // ====================================

      // Separate footer logo.
      // If empty, Footer can use main logo.
      footerLogo: {
        type: String,
        default: "",
        trim: true,
      },

      footerDescription: {
        type: String,
        default: "",
        trim: true,
      },

      footerCopyright: {
        type: String,
        default:
          "All rights reserved.",
        trim: true,
      },

      // ====================================
      // FOOTER NEWSLETTER
      // ====================================

      // Old field kept so current frontend
      // does not break.
      showNewsletter: {
        type: Boolean,
        default: true,
      },

      footerNewsletter: {
        type: footerNewsletterSchema,
        default: () => ({}),
      },

      // ====================================
      // MOBILE APP FOOTER
      // ====================================

      footerMobileApp: {
        type: footerMobileAppSchema,
        default: () => ({}),
      },

      // ====================================
      // FOOTER COLUMNS
      // ====================================

      footerColumns: {
        type: [footerColumnSchema],

        default: [
          {
            title: "Information",
            sortOrder: 1,
            isActive: true,

            links: [
              {
                label:
                  "About story",
                url: "/about",
                sortOrder: 1,
                isActive: true,
              },

              {
                label:
                  "Privacy policy",
                url:
                  "/page/privacy-policy",
                sortOrder: 2,
                isActive: true,
              },

              {
                label:
                  "Return policy",
                url:
                  "/page/return-policy",
                sortOrder: 3,
                isActive: true,
              },

              {
                label:
                  "Track order",
                url:
                  "/track-order",
                sortOrder: 4,
                isActive: true,
              },

              {
                label:
                  "Contact us",
                url: "/contact",
                sortOrder: 5,
                isActive: true,
              },
            ],
          },

          {
            title: "My account",
            sortOrder: 2,
            isActive: true,

            links: [
              {
                label:
                  "My order",
                url:
                  "/track-order",
                sortOrder: 1,
                isActive: true,
              },

              {
                label:
                  "Shopping cart",
                url: "/cart",
                sortOrder: 2,
                isActive: true,
              },

              {
                label: "Shop",
                url: "/shop",
                sortOrder: 3,
                isActive: true,
              },
            ],
          },

          {
            title:
              "Customer care",
            sortOrder: 3,
            isActive: true,

            links: [
              {
                label:
                  "Payment method",
                url: "/checkout",
                sortOrder: 1,
                isActive: true,
              },

              {
                label:
                  "Help & support",
                url: "/contact",
                sortOrder: 2,
                isActive: true,
              },

              {
                label:
                  "Terms & conditions",
                url:
                  "/page/terms-conditions",
                sortOrder: 3,
                isActive: true,
              },
            ],
          },
        ],
      },

      // ====================================
      // OPENING HOURS
      // ====================================

      showOpeningHours: {
        type: Boolean,
        default: true,
      },

      openingHoursTitle: {
        type: String,
        default:
          "Opening hours",
        trim: true,
      },

      openingHours: {
        type: openingHoursSchema,
        default: () => ({}),
      },

      // ====================================
      // FOOTER SOCIAL
      // ====================================

      showFooterSocial: {
        type: Boolean,
        default: true,
      },

      footerSocialTitle: {
        type: String,
        default:
          "Followed by :",
        trim: true,
      },

      // ====================================
      // CMS PAGES IN FOOTER
      // ====================================

      showCmsPagesInFooter: {
        type: Boolean,
        default: true,
      },

      // ====================================
      // THEME COLORS
      // ====================================

      primaryColor: {
        type: String,
        default: "#6f9a37",
        trim: true,
      },

      secondaryColor: {
        type: String,
        default: "#222222",
        trim: true,
      },

      accentColor: {
        type: String,
        default: "#ffffff",
        trim: true,
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

      // ====================================
      // GENERAL SWITCHES
      // ====================================

      storeEnabled: {
        type: Boolean,
        default: true,
      },

      maintenanceMode: {
        type: Boolean,
        default: false,
      },

      maintenanceMessage: {
        type: String,
        default:
          "Our store is temporarily unavailable.",
        trim: true,
      },
    },
    {
      timestamps: true,
    }
  );

// ========================================
// SINGLETON
//
// Website کے لیے صرف ایک settings
// document استعمال ہوگا.
// ========================================

siteSettingsSchema.statics
  .getSettings =
  async function () {
    let settings =
      await this.findOne();

    if (!settings) {
      settings =
        await this.create({});
    }

    return settings;
  };

// ========================================
// MODEL
// ========================================

const SiteSettings =
  mongoose.model(
    "SiteSettings",
    siteSettingsSchema
  );

module.exports =
  SiteSettings;