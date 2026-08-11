import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { getPublicSettings } from "../services/api";

// ========================================
// SITE CONTEXT
// ========================================

const SiteContext = createContext(null);

// ========================================
// DEFAULT SETTINGS
// Backend temporarily unavailable ہو تو
// frontend crash نہیں ہوگا
// ========================================

const defaultSettings = {
  storeName: "General Store",
  storeTagline: "",

  logo: "",
  favicon: "",

  phone: "",
  alternatePhone: "",
  whatsapp: "",
  email: "",

  address: "",
  city: "",
  province: "Punjab",
  country: "Pakistan",
  googleMapsUrl: "",

  aboutShort: "",
  aboutFull: "",

  currency: "PKR",
  currencySymbol: "Rs.",

  deliveryFee: 0,
  freeDeliveryEnabled: false,
  freeDeliveryMinimum: 0,

  estimatedDeliveryText:
    "Delivery within 2-4 working days",

  paymentMethods: {
    cod: true,
    bankTransfer: false,
    easypaisa: false,
    jazzcash: false,
    card: false,
  },

  bankAccountDetails: "",
  easypaisaNumber: "",
  jazzcashNumber: "",

  announcementText: "",
  showAnnouncement: false,

  menuItems: [],

  heroSlides: [],

  promotionalBanners: [],

  homeSections: {},

  socialLinks: [],

  footerDescription: "",
  footerCopyright:
    "All rights reserved.",

  showNewsletter: true,

  primaryColor: "#6f9a37",
  secondaryColor: "#222222",
  accentColor: "#ffffff",

  metaTitle: "",
  metaDescription: "",
  metaKeywords: [],

  storeEnabled: true,
  maintenanceMode: false,

  maintenanceMessage:
    "Our store is temporarily unavailable.",
};

// ========================================
// PROVIDER
// ========================================

export const SiteProvider = ({
  children,
}) => {
  const [settings, setSettings] =
    useState(defaultSettings);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ======================================
  // LOAD SITE SETTINGS
  // ======================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getPublicSettings();

      if (
        data?.success &&
        data?.settings
      ) {
        setSettings((previous) => ({
          ...previous,
          ...data.settings,

          paymentMethods: {
            ...previous.paymentMethods,
            ...data.settings
              .paymentMethods,
          },
        }));
      }
    } catch (err) {
      console.error(
        "Site Settings Load Error:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to load store settings"
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    loadSettings();
  }, []);

  // ======================================
  // APPLY THEME COLORS GLOBALLY
  // ======================================

  useEffect(() => {
    const root =
      document.documentElement;

    root.style.setProperty(
      "--primary-color",
      settings.primaryColor ||
        "#6f9a37"
    );

    root.style.setProperty(
      "--secondary-color",
      settings.secondaryColor ||
        "#222222"
    );

    root.style.setProperty(
      "--accent-color",
      settings.accentColor ||
        "#ffffff"
    );
  }, [
    settings.primaryColor,
    settings.secondaryColor,
    settings.accentColor,
  ]);

  // ======================================
  // PAGE TITLE
  // ======================================

  useEffect(() => {
    if (settings.metaTitle) {
      document.title =
        settings.metaTitle;
    } else if (
      settings.storeName
    ) {
      document.title =
        settings.storeName;
    }
  }, [
    settings.metaTitle,
    settings.storeName,
  ]);

  // ======================================
  // META DESCRIPTION
  // ======================================

  useEffect(() => {
    if (
      !settings.metaDescription
    ) {
      return;
    }

    let meta =
      document.querySelector(
        'meta[name="description"]'
      );

    if (!meta) {
      meta =
        document.createElement(
          "meta"
        );

      meta.setAttribute(
        "name",
        "description"
      );

      document.head.appendChild(
        meta
      );
    }

    meta.setAttribute(
      "content",
      settings.metaDescription
    );
  }, [
    settings.metaDescription,
  ]);

  // ======================================
  // FAVICON
  // ======================================

  useEffect(() => {
    if (!settings.favicon) {
      return;
    }

    let favicon =
      document.querySelector(
        "link[rel='icon']"
      );

    if (!favicon) {
      favicon =
        document.createElement(
          "link"
        );

      favicon.rel = "icon";

      document.head.appendChild(
        favicon
      );
    }

    favicon.href =
      settings.favicon;
  }, [settings.favicon]);

  // ======================================
  // FORMAT PRICE
  // ======================================

  const formatPrice = (
    amount = 0
  ) => {
    const numericAmount =
      Number(amount) || 0;

    return `${settings.currencySymbol} ${numericAmount.toLocaleString(
      "en-PK"
    )}`;
  };

  // ======================================
  // FREE DELIVERY CHECK
  // ======================================

  const calculateDeliveryFee = (
    subtotal = 0
  ) => {
    if (
      settings.freeDeliveryEnabled &&
      Number(subtotal) >=
        Number(
          settings.freeDeliveryMinimum
        )
    ) {
      return 0;
    }

    return (
      Number(
        settings.deliveryFee
      ) || 0
    );
  };

  // ======================================
  // WHATSAPP LINK
  // ======================================

  const getWhatsAppLink = (
    message = ""
  ) => {
    if (!settings.whatsapp) {
      return "#";
    }

    let number =
      settings.whatsapp.replace(
        /\D/g,
        ""
      );

    // Pakistani local number:
    // 03001234567
    // becomes:
    // 923001234567

    if (
      number.startsWith("0")
    ) {
      number =
        "92" + number.substring(1);
    }

    const encodedMessage =
      encodeURIComponent(message);

    return `https://wa.me/${number}${
      message
        ? `?text=${encodedMessage}`
        : ""
    }`;
  };

  // ======================================
  // CONTEXT VALUE
  // ======================================

  const value = useMemo(
    () => ({
      settings,

      loading,
      error,

      reloadSettings:
        loadSettings,

      formatPrice,

      calculateDeliveryFee,

      getWhatsAppLink,
    }),
    [
      settings,
      loading,
      error,
    ]
  );

  return (
    <SiteContext.Provider
      value={value}
    >
      {children}
    </SiteContext.Provider>
  );
};

// ========================================
// CUSTOM HOOK
// ========================================

export const useSite = () => {
  const context =
    useContext(SiteContext);

  if (!context) {
    throw new Error(
      "useSite must be used inside SiteProvider"
    );
  }

  return context;
};

export default SiteContext;