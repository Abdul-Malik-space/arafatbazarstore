import {
  useEffect,
  useState,
} from "react";

import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  ImagePlus,
  LayoutTemplate,
  Loader2,
  MessageSquareQuote,
  Monitor,
  Plus,
  RefreshCcw,
  Save,
  Star,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getImageUrl,
} from "../../services/api";

import {
  extractAdminSiteSettings,
  getAdminSiteSettings,
  isAdminSiteSettingsAuthError,
  normalizeSettingsArray,
  updateAdminSiteSettings,
} from "../../services/adminSiteSettings";

import {
  deleteAdminImage,
  extractSingleUploadedImage,
  uploadAdminSingleImage,
} from "../../services/adminUploads";

// ========================================
// CLIENT ID
// ========================================

const createClientId = (
  prefix = "item"
) => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
};

// ========================================
// NORMALIZERS
// ========================================

const clampPercent = (
  value,
  fallback
) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return fallback;
  }

  return Math.min(
    100,
    Math.max(0, number)
  );
};

const normalizeHeroSlide = (
  slide = {}
) => ({
  _id: slide._id || "",

  _clientId:
    slide._id ||
    createClientId("hero"),

  smallTitle:
    slide.smallTitle || "",

  // All overlay text is optional.
  // Leave blank when text already exists inside the banner image.
  title:
    slide.title || "",

  subtitle:
    slide.subtitle ||
    slide.description ||
    "",

  priceText:
    slide.priceText || "",

  textColor:
    slide.textColor ||
    "#ffffff",

  // CTA is optional too.
  buttonText:
    slide.buttonText || "",

  buttonUrl:
    slide.buttonUrl ||
    "/shop",

  buttonBackgroundColor:
    slide.buttonBackgroundColor ||
    "#272727",

  buttonTextColor:
    slide.buttonTextColor ||
    "#ffffff",

  buttonCustomPosition:
    slide.buttonCustomPosition === true,

  buttonPositionX:
    clampPercent(
      slide.buttonPositionX,
      15
    ),

  buttonPositionY:
    clampPercent(
      slide.buttonPositionY,
      75
    ),

  image:
    slide.image || "",

  isActive:
    slide.isActive !== false,

  _newUploadFilename: "",
});

const normalizePromoBanner = (
  banner = {}
) => ({
  _id: banner._id || "",

  _clientId:
    banner._id ||
    createClientId("promo"),

  title:
    banner.title || "",

  subtitle:
    banner.subtitle || "",

  image:
    banner.image || "",

  buttonText:
    banner.buttonText ||
    "Buy now",

  buttonUrl:
    banner.buttonUrl ||
    "/shop",

  position:
    banner.position ||
    "home",

  isActive:
    banner.isActive !== false,

  _newUploadFilename: "",
});

const normalizeBackgroundBanner = (
  banner = {}
) => ({
  title:
    banner?.title || "",

  subtitle:
    banner?.subtitle || "",

  image:
    banner?.image || "",

  buttonText:
    banner?.buttonText ||
    "Buy now",

  buttonUrl:
    banner?.buttonUrl ||
    "/shop",

  isActive:
    banner?.isActive !== false,

  _newUploadFilename: "",
});

const normalizeTestimonial = (
  testimonial = {}
) => ({
  _id:
    testimonial._id || "",

  _clientId:
    testimonial._id ||
    createClientId(
      "testimonial"
    ),

  name:
    testimonial.name || "",

  role:
    testimonial.role ||
    "Customer",

  comment:
    testimonial.comment || "",

  image:
    testimonial.image || "",

  rating:
    Number(
      testimonial.rating || 5
    ),

  isActive:
    testimonial.isActive !==
    false,

  _newUploadFilename: "",
});

const normalizeBrandLogo = (
  brand = {}
) => ({
  _id:
    brand._id || "",

  _clientId:
    brand._id ||
    createClientId("brand"),

  name:
    brand.name || "",

  image:
    brand.image || "",

  url:
    brand.url || "",

  isActive:
    brand.isActive !== false,

  _newUploadFilename: "",
});

// ========================================
// SERIALIZERS
// ========================================

const serializeHeroSlide = (
  slide
) => {
  const payload = {
    smallTitle:
      slide.smallTitle?.trim() ||
      "",

    title:
      slide.title?.trim() ||
      "",

    subtitle:
      slide.subtitle?.trim() ||
      "",

    priceText:
      slide.priceText?.trim() ||
      "",

    textColor:
      slide.textColor ||
      "#ffffff",

    buttonText:
      slide.buttonText?.trim() ||
      "",

    buttonUrl:
      slide.buttonUrl?.trim() ||
      "/shop",

    buttonBackgroundColor:
      slide.buttonBackgroundColor ||
      "#272727",

    buttonTextColor:
      slide.buttonTextColor ||
      "#ffffff",

    buttonCustomPosition:
      slide.buttonCustomPosition === true,

    buttonPositionX:
      clampPercent(
        slide.buttonPositionX,
        15
      ),

    buttonPositionY:
      clampPercent(
        slide.buttonPositionY,
        75
      ),

    image:
      slide.image || "",

    isActive:
      slide.isActive !== false,
  };

  if (slide._id) {
    payload._id = slide._id;
  }

  return payload;
};

const serializePromoBanner = (
  banner
) => {
  const payload = {
    title:
      banner.title?.trim() ||
      "",

    subtitle:
      banner.subtitle?.trim() ||
      "",

    image:
      banner.image || "",

    buttonText:
      banner.buttonText?.trim() ||
      "Buy now",

    buttonUrl:
      banner.buttonUrl?.trim() ||
      "/shop",

    position:
      banner.position ||
      "home",

    isActive:
      banner.isActive !== false,
  };

  if (banner._id) {
    payload._id =
      banner._id;
  }

  return payload;
};

const serializeBackgroundBanner = (
  banner
) => ({
  title:
    banner.title?.trim() ||
    "",

  subtitle:
    banner.subtitle?.trim() ||
    "",

  image:
    banner.image || "",

  buttonText:
    banner.buttonText?.trim() ||
    "Buy now",

  buttonUrl:
    banner.buttonUrl?.trim() ||
    "/shop",

  isActive:
    banner.isActive !== false,
});

const serializeTestimonial = (
  testimonial
) => {
  const payload = {
    name:
      testimonial.name?.trim() ||
      "",

    role:
      testimonial.role?.trim() ||
      "Customer",

    comment:
      testimonial.comment?.trim() ||
      "",

    image:
      testimonial.image || "",

    rating:
      Number(
        testimonial.rating || 5
      ),

    isActive:
      testimonial.isActive !==
      false,
  };

  if (testimonial._id) {
    payload._id =
      testimonial._id;
  }

  return payload;
};

const serializeBrandLogo = (
  brand
) => {
  const payload = {
    name:
      brand.name?.trim() || "",

    image:
      brand.image || "",

    url:
      brand.url?.trim() || "",

    isActive:
      brand.isActive !== false,
  };

  if (brand._id) {
    payload._id =
      brand._id;
  }

  return payload;
};

// ========================================
// IMAGE HELPERS
// ========================================

const getFilenameFromImage = (
  value
) => {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(
      value
        .split("/")
        .pop()
        .split("?")[0]
    );
  } catch {
    return "";
  }
};

const validateImageFile = (
  file
) => {
  if (!file) {
    return "Please select an image.";
  }

  if (
    !file.type?.startsWith(
      "image/"
    )
  ) {
    return "Please select a valid image file.";
  }

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {
    return "Image size must be 5 MB or less.";
  }

  return "";
};

// ========================================
// ALERT
// ========================================

const PageAlert = ({
  type = "success",
  message,
  onClose,
}) => {
  if (!message) {
    return null;
  }

  const isSuccess =
    type === "success";

  return (
    <div
      className={`
        mb-6
        flex
        items-start
        justify-between
        gap-4
        rounded-2xl
        border
        px-4
        py-3.5

        ${
          isSuccess
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-700"
        }
      `}
    >
      <div
        className="
          flex
          items-start
          gap-3
        "
      >
        {isSuccess ? (
          <CheckCircle2
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />
        ) : (
          <XCircle
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />
        )}

        <span
          className="
            text-sm
            font-medium
          "
        >
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// ========================================
// TOGGLE
// ========================================

const Toggle = ({
  checked,
  onChange,
  disabled = false,
}) => (
  <button
    type="button"
    disabled={disabled}
    onClick={() =>
      onChange(!checked)
    }
    className={`
      relative
      h-6
      w-11
      shrink-0
      rounded-full
      transition

      ${
        checked
          ? "bg-[#6f9a37]"
          : "bg-gray-300"
      }

      ${
        disabled
          ? "cursor-not-allowed opacity-50"
          : ""
      }
    `}
  >
    <span
      className={`
        absolute
        top-[3px]
        h-[18px]
        w-[18px]
        rounded-full
        bg-white
        shadow-sm
        transition

        ${
          checked
            ? "left-[23px]"
            : "left-[3px]"
        }
      `}
    />
  </button>
);

// ========================================
// TEXT INPUT
// ========================================

const TextInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  mono = false,
}) => (
  <div>
    <label
      className="
        mb-1.5
        block
        text-xs
        font-black
        uppercase
        tracking-[0.08em]
        text-gray-500
      "
    >
      {label}
    </label>

    <input
      type="text"
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      placeholder={placeholder}
      className={`
        w-full
        rounded-xl
        border
        border-gray-200
        bg-white
        px-4
        py-3
        text-sm
        text-[#172033]
        outline-none
        transition
        placeholder:text-gray-300
        focus:border-[#6f9a37]
        focus:ring-2
        focus:ring-[#6f9a37]/10

        ${
          mono
            ? "font-mono"
            : ""
        }
      `}
    />
  </div>
);

// ========================================
// COLOR INPUT
// ========================================

const ColorInput = ({
  label,
  value,
  onChange,
  fallback = "#ffffff",
}) => {
  const safeValue =
    /^#[0-9a-fA-F]{6}$/.test(
      String(value || "")
    )
      ? value
      : fallback;

  return (
    <div>
      <label
        className="
          mb-1.5
          block
          text-xs
          font-black
          uppercase
          tracking-[0.08em]
          text-gray-500
        "
      >
        {label}
      </label>

      <div
        className="
          flex
          items-center
          gap-2
          rounded-xl
          border
          border-gray-200
          bg-white
          p-2
        "
      >
        <input
          type="color"
          value={safeValue}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          className="
            h-9
            w-12
            cursor-pointer
            rounded-lg
            border-0
            bg-transparent
            p-0
          "
        />

        <input
          type="text"
          value={value || ""}
          onChange={(event) =>
            onChange(
              event.target.value
            )
          }
          placeholder={fallback}
          className="
            min-w-0
            flex-1
            bg-transparent
            px-2
            py-2
            font-mono
            text-sm
            text-[#172033]
            outline-none
          "
        />
      </div>
    </div>
  );
};

// ========================================
// RANGE INPUT
// ========================================

const RangeInput = ({
  label,
  value,
  onChange,
}) => {
  const safeValue =
    clampPercent(value, 0);

  return (
    <div>
      <div
        className="
          mb-2
          flex
          items-center
          justify-between
          gap-3
        "
      >
        <label
          className="
            text-xs
            font-black
            uppercase
            tracking-[0.08em]
            text-gray-500
          "
        >
          {label}
        </label>

        <span
          className="
            rounded-md
            bg-[#f1f5eb]
            px-2
            py-1
            text-[11px]
            font-bold
            text-[#6f9a37]
          "
        >
          {Math.round(
            safeValue
          )}%
        </span>
      </div>

      <input
        type="range"
        min="0"
        max="100"
        step="1"
        value={safeValue}
        onChange={(event) =>
          onChange(
            Number(
              event.target.value
            )
          )
        }
        className="
          w-full
          accent-[#6f9a37]
        "
      />
    </div>
  );
};

// ========================================
// TEXTAREA
// ========================================

const TextArea = ({
  label,
  value,
  onChange,
  placeholder = "",
  rows = 4,
}) => (
  <div>
    <label
      className="
        mb-1.5
        block
        text-xs
        font-black
        uppercase
        tracking-[0.08em]
        text-gray-500
      "
    >
      {label}
    </label>

    <textarea
      rows={rows}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      placeholder={placeholder}
      className="
        w-full
        resize-none
        rounded-xl
        border
        border-gray-200
        bg-white
        px-4
        py-3
        text-sm
        leading-6
        text-[#172033]
        outline-none
        transition
        placeholder:text-gray-300
        focus:border-[#6f9a37]
        focus:ring-2
        focus:ring-[#6f9a37]/10
      "
    />
  </div>
);

// ========================================
// ADMIN WEBSITE CONTENT
// ========================================

const AdminWebsiteContentPage =
  () => {
    const navigate =
      useNavigate();

    // ======================================
    // CONTENT STATES
    // ======================================

    const [
      heroSlides,
      setHeroSlides,
    ] = useState([]);

    const [
      promotionalBanners,
      setPromotionalBanners,
    ] = useState([]);

    const [
      unmanagedBanners,
      setUnmanagedBanners,
    ] = useState([]);

    const [
      backgroundBanner,
      setBackgroundBanner,
    ] = useState(
      normalizeBackgroundBanner()
    );

    const [
      testimonials,
      setTestimonials,
    ] = useState([]);

    const [
      brandLogos,
      setBrandLogos,
    ] = useState([]);

    // ======================================
    // UI STATES
    // ======================================

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      uploadingKey,
      setUploadingKey,
    ] = useState("");

    const [
      dirty,
      setDirty,
    ] = useState(false);

    const [
      successMessage,
      setSuccessMessage,
    ] = useState("");

    const [
      errorMessage,
      setErrorMessage,
    ] = useState("");

    // ======================================
    // AUTH ERROR
    // ======================================

    const handleAuthError = (
      error
    ) => {
      if (
        isAdminSiteSettingsAuthError(
          error
        ) ||
        error?.status === 401 ||
        error?.status === 403
      ) {
        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );

        return true;
      }

      return false;
    };

    // ======================================
    // DIRTY
    // ======================================

    const markDirty = () => {
      setDirty(true);

      setSuccessMessage("");
    };

    // ======================================
    // LOAD SETTINGS
    // ======================================

    const loadSettings =
      async ({
        showLoader = true,
      } = {}) => {
        try {
          if (showLoader) {
            setLoading(true);
          }

          setErrorMessage("");

          const response =
            await getAdminSiteSettings();

          const settings =
            extractAdminSiteSettings(
              response
            );

          // HERO

          setHeroSlides(
            normalizeSettingsArray(
              settings.heroSlides
            ).map(
              normalizeHeroSlide
            )
          );

          // PROMOTIONAL BANNERS

          const allBanners =
            normalizeSettingsArray(
              settings.promotionalBanners
            );

          const homepageBanners =
            allBanners.filter(
              (banner) =>
                !banner.position ||
                banner.position ===
                  "home"
            );

          setPromotionalBanners(
            homepageBanners
              .slice(0, 2)
              .map(
                normalizePromoBanner
              )
          );

          setUnmanagedBanners([
            ...homepageBanners.slice(
              2
            ),

            ...allBanners.filter(
              (banner) =>
                banner.position &&
                banner.position !==
                  "home"
            ),
          ]);

          // LARGE BANNER

          setBackgroundBanner(
            normalizeBackgroundBanner(
              settings.backgroundBanner
            )
          );

          // TESTIMONIALS

          setTestimonials(
            normalizeSettingsArray(
              settings.testimonials
            ).map(
              normalizeTestimonial
            )
          );

          // BRAND LOGOS

          setBrandLogos(
            normalizeSettingsArray(
              settings.brandLogos
            ).map(
              normalizeBrandLogo
            )
          );

          setDirty(false);
        } catch (error) {
          if (
            handleAuthError(error)
          ) {
            return;
          }

          setErrorMessage(
            error?.message ||
              "Failed to load website content."
          );
        } finally {
          if (showLoader) {
            setLoading(false);
          }
        }
      };

    // ======================================
    // INITIAL LOAD
    // ======================================

    useEffect(() => {
      loadSettings();

      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ======================================
    // GET COLLECTION
    // ======================================

    const getCollection = (
      type
    ) => {
      if (type === "hero") {
        return heroSlides;
      }

      if (type === "banner") {
        return promotionalBanners;
      }

      if (
        type ===
        "testimonial"
      ) {
        return testimonials;
      }

      if (type === "brand") {
        return brandLogos;
      }

      return [];
    };

    // ======================================
    // SET COLLECTION
    // ======================================

    const setCollection = (
      type,
      updater
    ) => {
      if (type === "hero") {
        setHeroSlides(updater);
      }

      if (type === "banner") {
        setPromotionalBanners(
          updater
        );
      }

      if (
        type ===
        "testimonial"
      ) {
        setTestimonials(updater);
      }

      if (type === "brand") {
        setBrandLogos(updater);
      }
    };

    // ======================================
    // UPDATE COLLECTION ITEM
    // ======================================

    const updateCollectionItem = (
      type,
      clientId,
      field,
      value
    ) => {
      setCollection(
        type,
        (current) =>
          current.map(
            (item) =>
              item._clientId ===
              clientId
                ? {
                    ...item,

                    [field]:
                      value,
                  }
                : item
          )
      );

      markDirty();
    };

    // ======================================
    // UPDATE BACKGROUND BANNER
    // ======================================

    const updateBackgroundBanner = (
      field,
      value
    ) => {
      setBackgroundBanner(
        (current) => ({
          ...current,

          [field]:
            value,
        })
      );

      markDirty();
    };

    // ======================================
    // ADD HERO
    // ======================================

    const addHeroSlide = () => {
      setHeroSlides(
        (current) => [
          ...current,

          normalizeHeroSlide({
            smallTitle: "",
            title: "",
            subtitle: "",
            priceText: "",
            textColor:
              "#ffffff",
            buttonText: "",
            buttonUrl:
              "/shop",
            buttonBackgroundColor:
              "#272727",
            buttonTextColor:
              "#ffffff",
            buttonCustomPosition:
              false,
            buttonPositionX: 15,
            buttonPositionY: 75,
            isActive: true,
          }),
        ]
      );

      markDirty();
    };

    // ======================================
    // ADD PROMO BANNER
    // ======================================

    const addPromoBanner = () => {
      if (
        promotionalBanners.length >=
        2
      ) {
        setErrorMessage(
          "The homepage uses a maximum of two promotional banners."
        );

        return;
      }

      setPromotionalBanners(
        (current) => [
          ...current,

          normalizePromoBanner({
            buttonText:
              "Buy now",

            buttonUrl:
              "/shop",

            position:
              "home",

            isActive: true,
          }),
        ]
      );

      markDirty();
    };

    // ======================================
    // ADD TESTIMONIAL
    // ======================================

    const addTestimonial = () => {
      setTestimonials(
        (current) => [
          ...current,

          normalizeTestimonial({
            name: "",
            role: "Customer",
            comment: "",
            rating: 5,
            image: "",
            isActive: true,
          }),
        ]
      );

      markDirty();
    };

    // ======================================
    // ADD BRAND LOGO
    // ======================================

    const addBrandLogo = () => {
      setBrandLogos(
        (current) => [
          ...current,

          normalizeBrandLogo({
            name: "",
            image: "",
            url: "",
            isActive: true,
          }),
        ]
      );

      markDirty();
    };

    // ======================================
    // MOVE COLLECTION ITEM
    // ======================================

    const moveItem = (
      type,
      index,
      direction
    ) => {
      const currentArray =
        getCollection(type);

      const targetIndex =
        direction === "up"
          ? index - 1
          : index + 1;

      if (
        targetIndex < 0 ||
        targetIndex >=
          currentArray.length
      ) {
        return;
      }

      const reordered =
        [...currentArray];

      [
        reordered[index],
        reordered[targetIndex],
      ] = [
        reordered[
          targetIndex
        ],
        reordered[index],
      ];

      setCollection(
        type,
        reordered
      );

      markDirty();
    };

    // ======================================
    // DELETE TEMP IMAGE
    // ======================================

    const deleteTemporaryUpload =
      async (filename) => {
        if (!filename) {
          return;
        }

        try {
          await deleteAdminImage(
            filename
          );
        } catch {
          // Non-blocking cleanup.
        }
      };

    // ======================================
    // PERFORM IMAGE UPLOAD
    // ======================================

    const performUpload =
      async ({
        file,
        key,
        oldTemporaryFilename,
        onUploaded,
        successText,
      }) => {
        const validationError =
          validateImageFile(file);

        if (validationError) {
          setErrorMessage(
            validationError
          );

          return;
        }

        try {
          setUploadingKey(key);

          setErrorMessage("");
          setSuccessMessage("");

          const response =
            await uploadAdminSingleImage(
              file
            );

          const uploaded =
            extractSingleUploadedImage(
              response
            );

          const uploadedPath =
            uploaded?.path ||
            uploaded?.url ||
            "";

          if (!uploadedPath) {
            throw new Error(
              "Image uploaded but no image path was returned."
            );
          }

          if (
            oldTemporaryFilename
          ) {
            await deleteTemporaryUpload(
              oldTemporaryFilename
            );
          }

          const filename =
            uploaded?.filename ||
            getFilenameFromImage(
              uploadedPath
            );

          onUploaded(
            uploadedPath,
            filename
          );

          markDirty();

          setSuccessMessage(
            successText ||
              "Image uploaded. Click Save Changes to publish it."
          );
        } catch (error) {
          if (
            error?.status === 401 ||
            error?.status === 403
          ) {
            navigate(
              "/admin/login",
              {
                replace: true,
              }
            );

            return;
          }

          setErrorMessage(
            error?.message ||
              "Failed to upload image."
          );
        } finally {
          setUploadingKey("");
        }
      };

    // ======================================
    // COLLECTION IMAGE UPLOAD
    // ======================================

    const uploadCollectionImage =
      async (
        type,
        clientId,
        file
      ) => {
        const collection =
          getCollection(type);

        const item =
          collection.find(
            (entry) =>
              entry._clientId ===
              clientId
          );

        if (!item) {
          return;
        }

        await performUpload({
          file,

          key:
            `${type}-${clientId}`,

          oldTemporaryFilename:
            item._newUploadFilename,

          onUploaded: (
            uploadedPath,
            filename
          ) => {
            setCollection(
              type,
              (current) =>
                current.map(
                  (entry) =>
                    entry._clientId ===
                    clientId
                      ? {
                          ...entry,

                          image:
                            uploadedPath,

                          _newUploadFilename:
                            filename,
                        }
                      : entry
                )
            );
          },

          successText:
            type === "brand"
              ? "Brand logo uploaded. Click Save Changes to publish it."
              : type ===
                "testimonial"
              ? "Customer image uploaded. Click Save Changes to publish it."
              : "Image uploaded. Click Save Changes to publish it.",
        });
      };

    // ======================================
    // BACKGROUND IMAGE UPLOAD
    // ======================================

    const uploadBackgroundImage =
      async (file) => {
        await performUpload({
          file,

          key:
            "background-banner",

          oldTemporaryFilename:
            backgroundBanner
              ._newUploadFilename,

          onUploaded: (
            uploadedPath,
            filename
          ) => {
            setBackgroundBanner(
              (current) => ({
                ...current,

                image:
                  uploadedPath,

                _newUploadFilename:
                  filename,
              })
            );
          },

          successText:
            "Large banner image uploaded. Click Save Changes to publish it.",
        });
      };

    // ======================================
    // REMOVE COLLECTION IMAGE
    // ======================================

    const removeCollectionImage =
      async (
        type,
        clientId
      ) => {
        const collection =
          getCollection(type);

        const item =
          collection.find(
            (entry) =>
              entry._clientId ===
              clientId
          );

        if (!item) {
          return;
        }

        await deleteTemporaryUpload(
          item._newUploadFilename
        );

        setCollection(
          type,
          (current) =>
            current.map(
              (entry) =>
                entry._clientId ===
                clientId
                  ? {
                      ...entry,

                      image: "",

                      _newUploadFilename:
                        "",
                    }
                  : entry
            )
        );

        markDirty();
      };

    // ======================================
    // REMOVE BACKGROUND IMAGE
    // ======================================

    const removeBackgroundImage =
      async () => {
        await deleteTemporaryUpload(
          backgroundBanner
            ._newUploadFilename
        );

        setBackgroundBanner(
          (current) => ({
            ...current,

            image: "",

            _newUploadFilename:
              "",
          })
        );

        markDirty();
      };

    // ======================================
    // DELETE COLLECTION ITEM
    // ======================================

    const deleteCollectionItem =
      async (
        type,
        clientId
      ) => {
        const collection =
          getCollection(type);

        const item =
          collection.find(
            (entry) =>
              entry._clientId ===
              clientId
          );

        if (!item) {
          return;
        }

        const labels = {
          hero: "Hero Slide",
          banner:
            "Promotional Banner",
          testimonial:
            "Testimonial",
          brand: "Brand Logo",
        };

        const confirmed =
          window.confirm(
            `Remove this ${
              labels[type] ||
              "item"
            }? The change will be published after Save Changes.`
          );

        if (!confirmed) {
          return;
        }

        await deleteTemporaryUpload(
          item._newUploadFilename
        );

        setCollection(
          type,
          (current) =>
            current.filter(
              (entry) =>
                entry._clientId !==
                clientId
            )
        );

        markDirty();
      };

    // ======================================
    // CLEAN TEMP UPLOADS
    // ======================================

    const cleanupTemporaryUploads =
      async () => {
        const filenames = [
          ...heroSlides,
          ...promotionalBanners,
          ...testimonials,
          ...brandLogos,
        ]
          .map(
            (item) =>
              item._newUploadFilename
          )
          .filter(Boolean);

        if (
          backgroundBanner
            ._newUploadFilename
        ) {
          filenames.push(
            backgroundBanner
              ._newUploadFilename
          );
        }

        await Promise.allSettled(
          filenames.map(
            (filename) =>
              deleteAdminImage(
                filename
              )
          )
        );
      };

    // ======================================
    // RELOAD
    // ======================================

    const resetChanges =
      async () => {
        if (dirty) {
          const confirmed =
            window.confirm(
              "Discard all unsaved website content changes?"
            );

          if (!confirmed) {
            return;
          }
        }

        await cleanupTemporaryUploads();

        await loadSettings();
      };

    // ======================================
    // VALIDATION
    // ======================================

    const validateBeforeSave =
      () => {
        const invalidTestimonial =
          testimonials.find(
            (testimonial) =>
              !testimonial.name?.trim() ||
              !testimonial.comment?.trim()
          );

        if (
          invalidTestimonial
        ) {
          setErrorMessage(
            "Every testimonial must have a customer name and review/comment."
          );

          return false;
        }

        const invalidBrand =
          brandLogos.find(
            (brand) =>
              !brand.image
          );

        if (invalidBrand) {
          setErrorMessage(
            "Every Brand Logo must have an uploaded logo image."
          );

          return false;
        }

        return true;
      };

    // ======================================
    // SAVE
    // ======================================

    const saveChanges =
      async () => {
        if (
          !validateBeforeSave()
        ) {
          return;
        }

        try {
          setSaving(true);

          setErrorMessage("");
          setSuccessMessage("");

          const payload = {
            heroSlides:
              heroSlides.map(
                serializeHeroSlide
              ),

            promotionalBanners: [
              ...promotionalBanners.map(
                serializePromoBanner
              ),

              ...unmanagedBanners,
            ],

            backgroundBanner:
              serializeBackgroundBanner(
                backgroundBanner
              ),

            testimonials:
              testimonials.map(
                serializeTestimonial
              ),

            brandLogos:
              brandLogos.map(
                serializeBrandLogo
              ),
          };

          await updateAdminSiteSettings(
            payload
          );

          await loadSettings({
            showLoader: false,
          });

          setDirty(false);

          setSuccessMessage(
            "Website content saved successfully."
          );
        } catch (error) {
          if (
            handleAuthError(error)
          ) {
            return;
          }

          setErrorMessage(
            error?.message ||
              "Failed to save website content."
          );
        } finally {
          setSaving(false);
        }
      };

    // ======================================
    // LOADING
    // ======================================

    if (loading) {
      return (
        <div
          className="
            flex
            min-h-[500px]
            items-center
            justify-center
          "
        >
          <div
            className="
              text-center
            "
          >
            <Loader2
              size={34}
              className="
                mx-auto
                animate-spin
                text-[#6f9a37]
              "
            />

            <p
              className="
                mt-3
                text-sm
                text-gray-500
              "
            >
              Loading website
              content...
            </p>
          </div>
        </div>
      );
    }

    // ======================================
    // PAGE
    // ======================================

    return (
      <div
        className="
          mx-auto
          max-w-[1500px]
          pb-24
        "
      >
        {/* =================================
            PAGE HEADER
        ================================= */}

        <div
          className="
            mb-7
            flex
            flex-col
            justify-between
            gap-4
            xl:flex-row
            xl:items-center
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#6f9a37]
              "
            >
              <Monitor
                size={15}
              />

              Website Content
            </div>

            <h1
              className="
                mt-2
                text-2xl
                font-black
                tracking-tight
                text-[#172033]
                sm:text-3xl
              "
            >
              Homepage Content
            </h1>

            <p
              className="
                mt-2
                max-w-[780px]
                text-sm
                leading-6
                text-gray-500
              "
            >
              Manage Hero Slider,
              Promotional Banners,
              Large Banner,
              Testimonials and
              Brand Logos.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-3
            "
          >
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-gray-700
                shadow-sm
              "
            >
              <Eye size={17} />

              View Store
            </a>

            <button
              type="button"
              onClick={
                resetChanges
              }
              disabled={
                saving ||
                Boolean(
                  uploadingKey
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                border
                border-gray-200
                bg-white
                px-4
                py-2.5
                text-sm
                font-bold
                text-gray-700
                shadow-sm
                disabled:opacity-50
              "
            >
              <RefreshCcw
                size={17}
              />

              Reload
            </button>

            <button
              type="button"
              onClick={
                saveChanges
              }
              disabled={
                saving ||
                !dirty ||
                Boolean(
                  uploadingKey
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#172033]
                px-5
                py-2.5
                text-sm
                font-bold
                text-white
                shadow-sm
                disabled:opacity-50
              "
            >
              {saving ? (
                <Loader2
                  size={17}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <Save size={17} />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </div>

        {/* =================================
            ALERTS
        ================================= */}

        <PageAlert
          type="success"
          message={
            successMessage
          }
          onClose={() =>
            setSuccessMessage("")
          }
        />

        <PageAlert
          type="error"
          message={
            errorMessage
          }
          onClose={() =>
            setErrorMessage("")
          }
        />

        {dirty && (
          <div
            className="
              mb-6
              rounded-xl
              border
              border-amber-200
              bg-amber-50
              px-4
              py-3
              text-sm
              font-medium
              text-amber-800
            "
          >
            You have unsaved
            website content changes.
          </div>
        )}

        {/* =================================
            HERO SLIDER
        ================================= */}

        <section
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              justify-between
              gap-4
              border-b
              border-gray-100
              px-5
              py-5
              sm:px-6
              lg:flex-row
              lg:items-center
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <ImagePlus
                  size={20}
                  className="
                    text-[#6f9a37]
                  "
                />

                <h2
                  className="
                    text-lg
                    font-black
                    text-[#172033]
                  "
                >
                  Hero Slider
                </h2>
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Main homepage slider. Overlay text and CTA are optional; use the banner image alone when it already contains the full design.
              </p>
            </div>

            <button
              type="button"
              onClick={
                addHeroSlide
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#6f9a37]
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
              "
            >
              <Plus size={17} />

              Add Hero Slide
            </button>
          </div>

          {heroSlides.length ===
          0 ? (
            <div
              className="
                py-14
                text-center
                text-sm
                text-gray-400
              "
            >
              No Hero Slides added.
            </div>
          ) : (
            <div
              className="
                space-y-6
                p-5
              "
            >
              {heroSlides.map(
                (
                  slide,
                  index
                ) => {
                  const imageUrl =
                    slide.image
                      ? getImageUrl(
                          slide.image
                        )
                      : "";

                  const isUploading =
                    uploadingKey ===
                    `hero-${slide._clientId}`;

                  return (
                    <div
                      key={
                        slide._clientId
                      }
                      className="
                        overflow-hidden
                        rounded-[20px]
                        border
                        border-gray-200
                      "
                    >
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          justify-between
                          gap-3
                          border-b
                          border-gray-100
                          p-4
                        "
                      >
                        <div
                          className="
                            font-black
                            text-[#172033]
                          "
                        >
                          Hero Slide{" "}
                          {index + 1}
                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <Toggle
                            checked={
                              slide.isActive
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "hero",
                                slide._clientId,
                                "isActive",
                                value
                              )
                            }
                          />

                          <button
                            type="button"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveItem(
                                "hero",
                                index,
                                "up"
                              )
                            }
                          >
                            <ArrowUp
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            disabled={
                              index ===
                              heroSlides.length -
                                1
                            }
                            onClick={() =>
                              moveItem(
                                "hero",
                                index,
                                "down"
                              )
                            }
                          >
                            <ArrowDown
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCollectionItem(
                                "hero",
                                slide._clientId
                              )
                            }
                            className="
                              text-red-500
                            "
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </div>

                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-6
                          p-5
                          xl:grid-cols-[420px_1fr]
                        "
                      >
                        <div>
                          <div
                            className="
                              relative
                              aspect-[16/8]
                              overflow-hidden
                              rounded-2xl
                              bg-gray-100
                            "
                          >
                            {imageUrl ? (
                              <img
                                src={
                                  imageUrl
                                }
                                alt={
                                  slide.title ||
                                  "Hero"
                                }
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                              />
                            ) : (
                              <div
                                className="
                                  flex
                                  h-full
                                  items-center
                                  justify-center
                                  text-gray-300
                                "
                              >
                                <ImagePlus
                                  size={34}
                                />
                              </div>
                            )}

                            {(slide.smallTitle ||
                              slide.title ||
                              slide.subtitle ||
                              slide.priceText) && (
                              <div
                                className="
                                  pointer-events-none
                                  absolute
                                  left-[8%]
                                  top-1/2
                                  z-10
                                  max-w-[58%]
                                  -translate-y-1/2
                                  drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)]
                                "
                                style={{
                                  color:
                                    slide.textColor ||
                                    "#ffffff",
                                }}
                              >
                                {slide.smallTitle && (
                                  <div
                                    className="
                                      text-[7px]
                                      font-bold
                                      uppercase
                                      tracking-[0.12em]
                                    "
                                  >
                                    {slide.smallTitle}
                                  </div>
                                )}

                                {slide.title && (
                                  <div
                                    className="
                                      mt-1
                                      text-[16px]
                                      font-black
                                      leading-[1.05]
                                    "
                                  >
                                    {slide.title}
                                  </div>
                                )}

                                {slide.subtitle && (
                                  <div
                                    className="
                                      mt-1
                                      text-[7px]
                                      leading-3
                                    "
                                  >
                                    {slide.subtitle}
                                  </div>
                                )}

                                {slide.priceText && (
                                  <div
                                    className="
                                      mt-1
                                      text-[8px]
                                      font-bold
                                    "
                                  >
                                    {slide.priceText}
                                  </div>
                                )}
                              </div>
                            )}

                            {slide.buttonText && (
                              <div
                                className={
                                  slide.buttonCustomPosition
                                    ? "absolute z-20"
                                    : "absolute bottom-[10%] left-[8%] z-20"
                                }
                                style={
                                  slide.buttonCustomPosition
                                    ? {
                                        left: `${clampPercent(
                                          slide.buttonPositionX,
                                          15
                                        )}%`,
                                        top: `${clampPercent(
                                          slide.buttonPositionY,
                                          75
                                        )}%`,
                                        transform:
                                          "translate(-50%, -50%)",
                                      }
                                    : undefined
                                }
                              >
                                <span
                                  className="
                                    inline-flex
                                    items-center
                                    rounded-full
                                    px-3
                                    py-1.5
                                    text-[7px]
                                    font-black
                                    uppercase
                                    shadow-sm
                                  "
                                  style={{
                                    backgroundColor:
                                      slide.buttonBackgroundColor ||
                                      "#272727",
                                    color:
                                      slide.buttonTextColor ||
                                      "#ffffff",
                                  }}
                                >
                                  {slide.buttonText}
                                </span>
                              </div>
                            )}

                            {isUploading && (
                              <div
                                className="
                                  absolute
                                  inset-0
                                  flex
                                  items-center
                                  justify-center
                                  bg-white/90
                                "
                              >
                                <Loader2
                                  className="
                                    animate-spin
                                  "
                                />
                              </div>
                            )}
                          </div>

                          <div
                            className="
                              mt-3
                              flex
                              gap-2
                            "
                          >
                            <label
                              className="
                                cursor-pointer
                                rounded-xl
                                bg-[#172033]
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-white
                              "
                            >
                              <Upload
                                size={14}
                                className="
                                  mr-2
                                  inline
                                "
                              />

                              Upload / Replace

                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(
                                  event
                                ) => {
                                  const file =
                                    event
                                      .target
                                      .files?.[0];

                                  if (
                                    file
                                  ) {
                                    uploadCollectionImage(
                                      "hero",
                                      slide._clientId,
                                      file
                                    );
                                  }

                                  event.target.value =
                                    "";
                                }}
                              />
                            </label>

                            {slide.image && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeCollectionImage(
                                    "hero",
                                    slide._clientId
                                  )
                                }
                                className="
                                  rounded-xl
                                  border
                                  border-red-200
                                  px-4
                                  text-xs
                                  font-bold
                                  text-red-600
                                "
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        <div
                          className="
                            space-y-4
                          "
                        >
                          <div
                            className="
                              rounded-2xl
                              border
                              border-[#dfe8d3]
                              bg-[#f8fbf4]
                              px-4
                              py-3
                              text-xs
                              leading-5
                              text-[#62704f]
                            "
                          >
                            Heading, subtitle, offer text and button are all optional. If the banner image already contains its own text or CTA, simply leave those fields blank.
                          </div>

                          <TextInput
                            label="Small Title (Optional)"
                            value={
                              slide.smallTitle
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "hero",
                                slide._clientId,
                                "smallTitle",
                                value
                              )
                            }
                            placeholder="Leave blank if text is already in the banner"
                          />

                          <TextInput
                            label="Heading (Optional)"
                            value={
                              slide.title
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "hero",
                                slide._clientId,
                                "title",
                                value
                              )
                            }
                            placeholder="Leave blank to show no heading"
                          />

                          <TextArea
                            label="Subtitle (Optional)"
                            value={
                              slide.subtitle
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "hero",
                                slide._clientId,
                                "subtitle",
                                value
                              )
                            }
                            placeholder="Leave blank to show no subtitle"
                            rows={3}
                          />

                          <div
                            className="
                              grid
                              grid-cols-1
                              gap-4
                              md:grid-cols-2
                            "
                          >
                            <TextInput
                              label="Price / Offer Text (Optional)"
                              value={
                                slide.priceText
                              }
                              onChange={(
                                value
                              ) =>
                                updateCollectionItem(
                                  "hero",
                                  slide._clientId,
                                  "priceText",
                                  value
                                )
                              }
                              placeholder="Optional"
                            />

                            <ColorInput
                              label="Hero Text Color"
                              value={
                                slide.textColor
                              }
                              fallback="#ffffff"
                              onChange={(
                                value
                              ) =>
                                updateCollectionItem(
                                  "hero",
                                  slide._clientId,
                                  "textColor",
                                  value
                                )
                              }
                            />
                          </div>

                          <div
                            className="
                              rounded-2xl
                              border
                              border-gray-200
                              bg-gray-50/70
                              p-4
                            "
                          >
                            <div
                              className="
                                mb-4
                                flex
                                flex-wrap
                                items-center
                                justify-between
                                gap-3
                              "
                            >
                              <div>
                                <div
                                  className="
                                    text-sm
                                    font-black
                                    text-[#172033]
                                  "
                                >
                                  Hero Button
                                </div>

                                <div
                                  className="
                                    mt-1
                                    text-xs
                                    text-gray-500
                                  "
                                >
                                  Leave Button Text blank when no CTA is needed.
                                </div>
                              </div>
                            </div>

                            <div
                              className="
                                grid
                                grid-cols-1
                                gap-4
                                md:grid-cols-2
                              "
                            >
                              <TextInput
                                label="Button Text (Optional)"
                                value={
                                  slide.buttonText
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateCollectionItem(
                                    "hero",
                                    slide._clientId,
                                    "buttonText",
                                    value
                                  )
                                }
                                placeholder="e.g. Shop Now"
                              />

                              <TextInput
                                label="Button Link"
                                value={
                                  slide.buttonUrl
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateCollectionItem(
                                    "hero",
                                    slide._clientId,
                                    "buttonUrl",
                                    value
                                  )
                                }
                                placeholder="/shop"
                                mono
                              />

                              <ColorInput
                                label="Button Background"
                                value={
                                  slide.buttonBackgroundColor
                                }
                                fallback="#272727"
                                onChange={(
                                  value
                                ) =>
                                  updateCollectionItem(
                                    "hero",
                                    slide._clientId,
                                    "buttonBackgroundColor",
                                    value
                                  )
                                }
                              />

                              <ColorInput
                                label="Button Text Color"
                                value={
                                  slide.buttonTextColor
                                }
                                fallback="#ffffff"
                                onChange={(
                                  value
                                ) =>
                                  updateCollectionItem(
                                    "hero",
                                    slide._clientId,
                                    "buttonTextColor",
                                    value
                                  )
                                }
                              />
                            </div>

                            <div
                              className="
                                mt-5
                                flex
                                items-center
                                justify-between
                                gap-4
                                rounded-xl
                                border
                                border-gray-200
                                bg-white
                                px-4
                                py-3
                              "
                            >
                              <div>
                                <div
                                  className="
                                    text-xs
                                    font-black
                                    uppercase
                                    tracking-[0.08em]
                                    text-gray-600
                                  "
                                >
                                  Custom Button Position
                                </div>

                                <div
                                  className="
                                    mt-1
                                    text-xs
                                    text-gray-400
                                  "
                                >
                                  Turn on to place the button anywhere over the banner.
                                </div>
                              </div>

                              <Toggle
                                checked={
                                  slide.buttonCustomPosition
                                }
                                onChange={(
                                  value
                                ) =>
                                  updateCollectionItem(
                                    "hero",
                                    slide._clientId,
                                    "buttonCustomPosition",
                                    value
                                  )
                                }
                              />
                            </div>

                            {slide.buttonCustomPosition && (
                              <div
                                className="
                                  mt-5
                                  grid
                                  grid-cols-1
                                  gap-5
                                  md:grid-cols-2
                                "
                              >
                                <RangeInput
                                  label="Horizontal Position (X)"
                                  value={
                                    slide.buttonPositionX
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateCollectionItem(
                                      "hero",
                                      slide._clientId,
                                      "buttonPositionX",
                                      value
                                    )
                                  }
                                />

                                <RangeInput
                                  label="Vertical Position (Y)"
                                  value={
                                    slide.buttonPositionY
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateCollectionItem(
                                      "hero",
                                      slide._clientId,
                                      "buttonPositionY",
                                      value
                                    )
                                  }
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* =================================
            PROMOTIONAL BANNERS
        ================================= */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-[22px]
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              justify-between
              gap-4
              border-b
              border-gray-100
              px-6
              py-5
              lg:flex-row
              lg:items-center
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <LayoutTemplate
                  size={20}
                  className="
                    text-[#6f9a37]
                  "
                />

                <h2
                  className="
                    text-lg
                    font-black
                    text-[#172033]
                  "
                >
                  Promotional Banners
                </h2>
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Two homepage
                promotional cards.
              </p>
            </div>

            <button
              type="button"
              onClick={
                addPromoBanner
              }
              disabled={
                promotionalBanners.length >=
                2
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#6f9a37]
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
                disabled:opacity-40
              "
            >
              <Plus size={17} />

              Add Banner
            </button>
          </div>

          {promotionalBanners.length >
          0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-6
                p-5
                xl:grid-cols-2
              "
            >
              {promotionalBanners.map(
                (
                  banner,
                  index
                ) => {
                  const imageUrl =
                    banner.image
                      ? getImageUrl(
                          banner.image
                        )
                      : "";

                  return (
                    <div
                      key={
                        banner._clientId
                      }
                      className="
                        overflow-hidden
                        rounded-[20px]
                        border
                        border-gray-200
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          gap-3
                          border-b
                          border-gray-100
                          p-4
                        "
                      >
                        <strong>
                          Banner{" "}
                          {index + 1}
                        </strong>

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <Toggle
                            checked={
                              banner.isActive
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "banner",
                                banner._clientId,
                                "isActive",
                                value
                              )
                            }
                          />

                          <button
                            type="button"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveItem(
                                "banner",
                                index,
                                "up"
                              )
                            }
                          >
                            <ArrowUp
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            disabled={
                              index ===
                              promotionalBanners.length -
                                1
                            }
                            onClick={() =>
                              moveItem(
                                "banner",
                                index,
                                "down"
                              )
                            }
                          >
                            <ArrowDown
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCollectionItem(
                                "banner",
                                banner._clientId
                              )
                            }
                            className="
                              text-red-500
                            "
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </div>

                      <div
                        className="
                          p-4
                        "
                      >
                        <div
                          className="
                            relative
                            aspect-[16/8]
                            overflow-hidden
                            rounded-2xl
                            bg-gray-100
                          "
                        >
                          {imageUrl && (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                banner.title
                              }
                              className="
                                h-full
                                w-full
                                object-cover
                              "
                            />
                          )}

                          {uploadingKey ===
                            `banner-${banner._clientId}` && (
                            <div
                              className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-white/90
                              "
                            >
                              <Loader2
                                className="
                                  animate-spin
                                "
                              />
                            </div>
                          )}
                        </div>

                        <div
                          className="
                            mt-3
                            flex
                            gap-2
                          "
                        >
                          <label
                            className="
                              cursor-pointer
                              rounded-xl
                              bg-[#172033]
                              px-4
                              py-2.5
                              text-xs
                              font-bold
                              text-white
                            "
                          >
                            <Upload
                              size={14}
                              className="
                                mr-2
                                inline
                              "
                            />

                            Upload / Replace

                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(
                                event
                              ) => {
                                const file =
                                  event
                                    .target
                                    .files?.[0];

                                if (
                                  file
                                ) {
                                  uploadCollectionImage(
                                    "banner",
                                    banner._clientId,
                                    file
                                  );
                                }

                                event.target.value =
                                  "";
                              }}
                            />
                          </label>

                          {banner.image && (
                            <button
                              type="button"
                              onClick={() =>
                                removeCollectionImage(
                                  "banner",
                                  banner._clientId
                                )
                              }
                              className="
                                rounded-xl
                                border
                                border-red-200
                                px-4
                                text-xs
                                font-bold
                                text-red-600
                              "
                            >
                              Remove
                            </button>
                          )}
                        </div>

                        <div
                          className="
                            mt-5
                            space-y-4
                          "
                        >
                          <TextInput
                            label="Heading"
                            value={
                              banner.title
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "banner",
                                banner._clientId,
                                "title",
                                value
                              )
                            }
                          />

                          <TextInput
                            label="Subtitle"
                            value={
                              banner.subtitle
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "banner",
                                banner._clientId,
                                "subtitle",
                                value
                              )
                            }
                          />

                          <div
                            className="
                              grid
                              grid-cols-2
                              gap-4
                            "
                          >
                            <TextInput
                              label="Button Text"
                              value={
                                banner.buttonText
                              }
                              onChange={(
                                value
                              ) =>
                                updateCollectionItem(
                                  "banner",
                                  banner._clientId,
                                  "buttonText",
                                  value
                                )
                              }
                            />

                            <TextInput
                              label="Button Link"
                              value={
                                banner.buttonUrl
                              }
                              onChange={(
                                value
                              ) =>
                                updateCollectionItem(
                                  "banner",
                                  banner._clientId,
                                  "buttonUrl",
                                  value
                                )
                              }
                              mono
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <div
              className="
                py-14
                text-center
                text-sm
                text-gray-400
              "
            >
              No Promotional
              Banners added.
            </div>
          )}
        </section>

        {/* =================================
            LARGE BANNER
        ================================= */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-[22px]
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              justify-between
              gap-4
              border-b
              border-gray-100
              px-6
              py-5
            "
          >
            <div>
              <h2
                className="
                  text-lg
                  font-black
                  text-[#172033]
                "
              >
                Large Promotional
                Banner
              </h2>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Banner below
                Trending Products.
              </p>
            </div>

            <Toggle
              checked={
                backgroundBanner
                  .isActive
              }
              onChange={(
                value
              ) =>
                updateBackgroundBanner(
                  "isActive",
                  value
                )
              }
            />
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-6
              p-6
              xl:grid-cols-[520px_1fr]
            "
          >
            <div>
              <div
                className="
                  relative
                  aspect-[16/7]
                  overflow-hidden
                  rounded-[20px]
                  bg-[#f5e6d0]
                "
              >
                {backgroundBanner
                  .image && (
                  <img
                    src={getImageUrl(
                      backgroundBanner
                        .image
                    )}
                    alt={
                      backgroundBanner
                        .title
                    }
                    className="
                      h-full
                      w-full
                      object-cover
                    "
                  />
                )}

                {uploadingKey ===
                  "background-banner" && (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-white/90
                    "
                  >
                    <Loader2
                      className="
                        animate-spin
                      "
                    />
                  </div>
                )}
              </div>

              <div
                className="
                  mt-3
                  flex
                  gap-2
                "
              >
                <label
                  className="
                    cursor-pointer
                    rounded-xl
                    bg-[#172033]
                    px-4
                    py-2.5
                    text-xs
                    font-bold
                    text-white
                  "
                >
                  <Upload
                    size={14}
                    className="
                      mr-2
                      inline
                    "
                  />

                  Upload / Replace

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(
                      event
                    ) => {
                      const file =
                        event
                          .target
                          .files?.[0];

                      if (file) {
                        uploadBackgroundImage(
                          file
                        );
                      }

                      event.target.value =
                        "";
                    }}
                  />
                </label>

                {backgroundBanner
                  .image && (
                  <button
                    type="button"
                    onClick={
                      removeBackgroundImage
                    }
                    className="
                      rounded-xl
                      border
                      border-red-200
                      px-4
                      text-xs
                      font-bold
                      text-red-600
                    "
                  >
                    Remove Image
                  </button>
                )}
              </div>
            </div>

            <div
              className="
                space-y-4
              "
            >
              <TextInput
                label="Small Title / Subtitle"
                value={
                  backgroundBanner
                    .subtitle
                }
                onChange={(
                  value
                ) =>
                  updateBackgroundBanner(
                    "subtitle",
                    value
                  )
                }
              />

              <TextInput
                label="Main Heading"
                value={
                  backgroundBanner
                    .title
                }
                onChange={(
                  value
                ) =>
                  updateBackgroundBanner(
                    "title",
                    value
                  )
                }
              />

              <div
                className="
                  grid
                  grid-cols-2
                  gap-4
                "
              >
                <TextInput
                  label="Button Text"
                  value={
                    backgroundBanner
                      .buttonText
                  }
                  onChange={(
                    value
                  ) =>
                    updateBackgroundBanner(
                      "buttonText",
                      value
                    )
                  }
                />

                <TextInput
                  label="Button Link"
                  value={
                    backgroundBanner
                      .buttonUrl
                  }
                  onChange={(
                    value
                  ) =>
                    updateBackgroundBanner(
                      "buttonUrl",
                      value
                    )
                  }
                  mono
                />
              </div>
            </div>
          </div>
        </section>

        {/* =================================
            TESTIMONIALS
        ================================= */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-[22px]
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              flex
              flex-col
              justify-between
              gap-4
              border-b
              border-gray-100
              px-6
              py-5
              lg:flex-row
              lg:items-center
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <MessageSquareQuote
                  size={21}
                  className="
                    text-[#6f9a37]
                  "
                />

                <h2
                  className="
                    text-lg
                    font-black
                    text-[#172033]
                  "
                >
                  Testimonials
                </h2>
              </div>

              <p
                className="
                  mt-1
                  text-sm
                  text-gray-500
                "
              >
                Customer reviews on
                the homepage.
              </p>
            </div>

            <button
              type="button"
              onClick={
                addTestimonial
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#6f9a37]
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
              "
            >
              <Plus size={17} />

              Add Testimonial
            </button>
          </div>

          {testimonials.length ===
          0 ? (
            <div
              className="
                py-14
                text-center
                text-sm
                text-gray-400
              "
            >
              No Testimonials added.
            </div>
          ) : (
            <div
              className="
                space-y-6
                p-5
              "
            >
              {testimonials.map(
                (
                  testimonial,
                  index
                ) => {
                  const imageUrl =
                    testimonial.image
                      ? getImageUrl(
                          testimonial.image
                        )
                      : "";

                  return (
                    <div
                      key={
                        testimonial._clientId
                      }
                      className="
                        overflow-hidden
                        rounded-[20px]
                        border
                        border-gray-200
                      "
                    >
                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          justify-between
                          gap-3
                          border-b
                          border-gray-100
                          p-4
                        "
                      >
                        <strong>
                          {testimonial
                            .name ||
                            `Testimonial ${index + 1}`}
                        </strong>

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <Toggle
                            checked={
                              testimonial
                                .isActive
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "testimonial",
                                testimonial._clientId,
                                "isActive",
                                value
                              )
                            }
                          />

                          <button
                            type="button"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveItem(
                                "testimonial",
                                index,
                                "up"
                              )
                            }
                          >
                            <ArrowUp
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            disabled={
                              index ===
                              testimonials.length -
                                1
                            }
                            onClick={() =>
                              moveItem(
                                "testimonial",
                                index,
                                "down"
                              )
                            }
                          >
                            <ArrowDown
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteCollectionItem(
                                "testimonial",
                                testimonial._clientId
                              )
                            }
                            className="
                              text-red-500
                            "
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </div>

                      <div
                        className="
                          grid
                          grid-cols-1
                          gap-6
                          p-5
                          lg:grid-cols-[220px_1fr]
                        "
                      >
                        <div>
                          <div
                            className="
                              relative
                              mx-auto
                              flex
                              aspect-square
                              max-w-[200px]
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-[22px]
                              bg-[#eef5dd]
                            "
                          >
                            {imageUrl ? (
                              <img
                                src={
                                  imageUrl
                                }
                                alt={
                                  testimonial.name
                                }
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                              />
                            ) : (
                              <span
                                className="
                                  text-5xl
                                  font-black
                                  text-[#6f9a37]
                                "
                              >
                                {testimonial
                                  .name
                                  ?.charAt(0)
                                  ?.toUpperCase() ||
                                  "C"}
                              </span>
                            )}

                            {uploadingKey ===
                              `testimonial-${testimonial._clientId}` && (
                              <div
                                className="
                                  absolute
                                  inset-0
                                  flex
                                  items-center
                                  justify-center
                                  bg-white/90
                                "
                              >
                                <Loader2
                                  className="
                                    animate-spin
                                  "
                                />
                              </div>
                            )}
                          </div>

                          <div
                            className="
                              mt-3
                              flex
                              justify-center
                              gap-2
                            "
                          >
                            <label
                              className="
                                cursor-pointer
                                rounded-xl
                                bg-[#172033]
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-white
                              "
                            >
                              <Upload
                                size={14}
                                className="
                                  mr-2
                                  inline
                                "
                              />

                              Upload / Replace

                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(
                                  event
                                ) => {
                                  const file =
                                    event
                                      .target
                                      .files?.[0];

                                  if (
                                    file
                                  ) {
                                    uploadCollectionImage(
                                      "testimonial",
                                      testimonial._clientId,
                                      file
                                    );
                                  }

                                  event.target.value =
                                    "";
                                }}
                              />
                            </label>

                            {testimonial
                              .image && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeCollectionImage(
                                    "testimonial",
                                    testimonial._clientId
                                  )
                                }
                                className="
                                  rounded-xl
                                  border
                                  border-red-200
                                  px-3
                                  text-xs
                                  font-bold
                                  text-red-600
                                "
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        <div
                          className="
                            space-y-4
                          "
                        >
                          <div
                            className="
                              grid
                              grid-cols-1
                              gap-4
                              md:grid-cols-2
                            "
                          >
                            <TextInput
                              label="Customer Name"
                              value={
                                testimonial.name
                              }
                              onChange={(
                                value
                              ) =>
                                updateCollectionItem(
                                  "testimonial",
                                  testimonial._clientId,
                                  "name",
                                  value
                                )
                              }
                            />

                            <TextInput
                              label="Role / Label"
                              value={
                                testimonial.role
                              }
                              onChange={(
                                value
                              ) =>
                                updateCollectionItem(
                                  "testimonial",
                                  testimonial._clientId,
                                  "role",
                                  value
                                )
                              }
                            />
                          </div>

                          <TextArea
                            label="Review / Comment"
                            value={
                              testimonial.comment
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "testimonial",
                                testimonial._clientId,
                                "comment",
                                value
                              )
                            }
                            rows={5}
                          />

                          <div>
                            <label
                              className="
                                mb-2
                                block
                                text-xs
                                font-black
                                uppercase
                                tracking-[0.08em]
                                text-gray-500
                              "
                            >
                              Rating
                            </label>

                            <div
                              className="
                                flex
                                gap-2
                              "
                            >
                              {[1, 2, 3, 4, 5].map(
                                (
                                  rating
                                ) => (
                                  <button
                                    key={
                                      rating
                                    }
                                    type="button"
                                    onClick={() =>
                                      updateCollectionItem(
                                        "testimonial",
                                        testimonial._clientId,
                                        "rating",
                                        rating
                                      )
                                    }
                                    className={`
                                      flex
                                      h-10
                                      w-10
                                      items-center
                                      justify-center
                                      rounded-xl
                                      border

                                      ${
                                        rating <=
                                        testimonial.rating
                                          ? "border-amber-200 bg-amber-50 text-amber-500"
                                          : "border-gray-200 text-gray-300"
                                      }
                                    `}
                                  >
                                    <Star
                                      size={18}
                                      fill={
                                        rating <=
                                        testimonial.rating
                                          ? "currentColor"
                                          : "none"
                                      }
                                    />
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>

        {/* =================================
            BRAND LOGOS
        ================================= */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-[22px]
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          {/* BRAND HEADER */}

          <div
            className="
              flex
              flex-col
              justify-between
              gap-4
              border-b
              border-gray-100
              px-6
              py-5
              lg:flex-row
              lg:items-center
            "
          >
            <div>
              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >
                <ImagePlus
                  size={21}
                  className="
                    text-[#6f9a37]
                  "
                />

                <h2
                  className="
                    text-lg
                    font-black
                    text-[#172033]
                  "
                >
                  Brand Logos
                </h2>
              </div>

              <p
                className="
                  mt-1.5
                  text-sm
                  text-gray-500
                "
              >
                Manage the brand
                logos displayed in
                the homepage logo
                slider.
              </p>
            </div>

            <button
              type="button"
              onClick={
                addBrandLogo
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#6f9a37]
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
                transition
                hover:bg-[#5e872e]
              "
            >
              <Plus size={17} />

              Add Brand
            </button>
          </div>

          {/* EMPTY */}

          {brandLogos.length ===
          0 ? (
            <div
              className="
                px-6
                py-16
                text-center
              "
            >
              <ImagePlus
                size={42}
                className="
                  mx-auto
                  text-gray-300
                "
              />

              <h3
                className="
                  mt-4
                  font-black
                  text-[#172033]
                "
              >
                No Brand Logos Yet
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                "
              >
                Add brands to
                display their logos
                on the homepage.
              </p>
            </div>
          ) : (
            <div
              className="
                grid
                grid-cols-1
                gap-5
                p-5
                lg:grid-cols-2
              "
            >
              {brandLogos.map(
                (
                  brand,
                  index
                ) => {
                  const imageUrl =
                    brand.image
                      ? getImageUrl(
                          brand.image
                        )
                      : "";

                  const isUploading =
                    uploadingKey ===
                    `brand-${brand._clientId}`;

                  return (
                    <div
                      key={
                        brand._clientId
                      }
                      className="
                        overflow-hidden
                        rounded-[20px]
                        border
                        border-gray-200
                        bg-[#fcfcfc]
                      "
                    >
                      {/* BRAND CARD HEADER */}

                      <div
                        className="
                          flex
                          flex-wrap
                          items-center
                          justify-between
                          gap-3
                          border-b
                          border-gray-100
                          bg-white
                          px-4
                          py-4
                        "
                      >
                        <div>
                          <div
                            className="
                              text-sm
                              font-black
                              text-[#172033]
                            "
                          >
                            {brand.name ||
                              `Brand ${index + 1}`}
                          </div>

                          <div
                            className="
                              mt-0.5
                              text-xs
                              text-gray-400
                            "
                          >
                            {brand.isActive
                              ? "Visible on website"
                              : "Hidden from website"}
                          </div>
                        </div>

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >
                          <Toggle
                            checked={
                              brand.isActive
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "brand",
                                brand._clientId,
                                "isActive",
                                value
                              )
                            }
                          />

                          <button
                            type="button"
                            title="Move up"
                            disabled={
                              index === 0
                            }
                            onClick={() =>
                              moveItem(
                                "brand",
                                index,
                                "up"
                              )
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-gray-200
                              bg-white
                              disabled:opacity-30
                            "
                          >
                            <ArrowUp
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            title="Move down"
                            disabled={
                              index ===
                              brandLogos.length -
                                1
                            }
                            onClick={() =>
                              moveItem(
                                "brand",
                                index,
                                "down"
                              )
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-gray-200
                              bg-white
                              disabled:opacity-30
                            "
                          >
                            <ArrowDown
                              size={16}
                            />
                          </button>

                          <button
                            type="button"
                            title="Delete brand"
                            onClick={() =>
                              deleteCollectionItem(
                                "brand",
                                brand._clientId
                              )
                            }
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-lg
                              border
                              border-red-200
                              bg-white
                              text-red-500
                              hover:bg-red-50
                            "
                          >
                            <Trash2
                              size={16}
                            />
                          </button>
                        </div>
                      </div>

                      {/* BRAND BODY */}

                      <div
                        className="
                          p-5
                        "
                      >
                        {/* LOGO PREVIEW */}

                        <div
                          className="
                            relative
                            flex
                            h-[150px]
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-2xl
                            border
                            border-gray-200
                            bg-white
                            p-6
                          "
                        >
                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                brand.name ||
                                "Brand logo"
                              }
                              className="
                                max-h-full
                                max-w-full
                                object-contain
                              "
                            />
                          ) : (
                            <div
                              className="
                                text-center
                                text-gray-300
                              "
                            >
                              <ImagePlus
                                size={34}
                                className="
                                  mx-auto
                                "
                              />

                              <div
                                className="
                                  mt-2
                                  text-xs
                                "
                              >
                                No logo uploaded
                              </div>
                            </div>
                          )}

                          {isUploading && (
                            <div
                              className="
                                absolute
                                inset-0
                                flex
                                items-center
                                justify-center
                                bg-white/90
                              "
                            >
                              <Loader2
                                size={28}
                                className="
                                  animate-spin
                                  text-[#6f9a37]
                                "
                              />
                            </div>
                          )}
                        </div>

                        {/* LOGO BUTTONS */}

                        <div
                          className="
                            mt-3
                            flex
                            flex-wrap
                            gap-2
                          "
                        >
                          <label
                            className={`
                              cursor-pointer
                              rounded-xl
                              bg-[#172033]
                              px-4
                              py-2.5
                              text-xs
                              font-bold
                              text-white

                              ${
                                isUploading
                                  ? "pointer-events-none opacity-50"
                                  : ""
                              }
                            `}
                          >
                            <Upload
                              size={14}
                              className="
                                mr-2
                                inline
                              "
                            />

                            {brand.image
                              ? "Replace Logo"
                              : "Upload Logo"}

                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(
                                event
                              ) => {
                                const file =
                                  event
                                    .target
                                    .files?.[0];

                                if (
                                  file
                                ) {
                                  uploadCollectionImage(
                                    "brand",
                                    brand._clientId,
                                    file
                                  );
                                }

                                event.target.value =
                                  "";
                              }}
                            />
                          </label>

                          {brand.image && (
                            <button
                              type="button"
                              onClick={() =>
                                removeCollectionImage(
                                  "brand",
                                  brand._clientId
                                )
                              }
                              className="
                                rounded-xl
                                border
                                border-red-200
                                bg-white
                                px-4
                                py-2.5
                                text-xs
                                font-bold
                                text-red-600
                              "
                            >
                              Remove Logo
                            </button>
                          )}
                        </div>

                        {/* BRAND FIELDS */}

                        <div
                          className="
                            mt-5
                            space-y-4
                          "
                        >
                          <TextInput
                            label="Brand Name"
                            value={
                              brand.name
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "brand",
                                brand._clientId,
                                "name",
                                value
                              )
                            }
                            placeholder="e.g. Nestle"
                          />

                          <TextInput
                            label="Brand Link"
                            value={
                              brand.url
                            }
                            onChange={(
                              value
                            ) =>
                              updateCollectionItem(
                                "brand",
                                brand._clientId,
                                "url",
                                value
                              )
                            }
                            placeholder="/shop or https://..."
                            mono
                          />

                          <p
                            className="
                              text-[11px]
                              leading-5
                              text-gray-400
                            "
                          >
                            Transparent PNG
                            logos usually give
                            the cleanest result
                            in the homepage
                            brand slider.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}

          <div
            className="
              border-t
              border-gray-100
              bg-[#fafafa]
              px-6
              py-4
              text-xs
              text-gray-500
            "
          >
            {brandLogos.length}{" "}
            brand logo
            {brandLogos.length !==
            1
              ? "s"
              : ""}{" "}
            configured.
          </div>
        </section>

        {/* =================================
            NEXT SECTION
        ================================= */}

        <div
          className="
            mt-7
            rounded-[20px]
            border
            border-dashed
            border-gray-300
            bg-white
            p-6
          "
        >
          <h3
            className="
              text-sm
              font-black
              text-[#172033]
            "
          >
            Next Homepage Section
          </h3>

          <p
            className="
              mt-2
              text-sm
              leading-6
              text-gray-500
            "
          >
            Next we will connect
            Blog / Positive For
            Story management.
          </p>
        </div>

        {/* =================================
            FLOATING SAVE
        ================================= */}

        {dirty && (
          <div
            className="
              fixed
              bottom-5
              left-1/2
              z-50
              flex
              w-[calc(100%-32px)]
              max-w-[620px]
              -translate-x-1/2
              items-center
              justify-between
              gap-4
              rounded-2xl
              border
              border-gray-200
              bg-white
              px-4
              py-3
              shadow-[0_18px_60px_rgba(15,23,42,0.18)]
            "
          >
            <div>
              <div
                className="
                  text-sm
                  font-black
                  text-[#172033]
                "
              >
                Unsaved Changes
              </div>

              <div
                className="
                  text-xs
                  text-gray-500
                "
              >
                Save to publish
                homepage content.
              </div>
            </div>

            <button
              type="button"
              onClick={
                saveChanges
              }
              disabled={
                saving ||
                Boolean(
                  uploadingKey
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-xl
                bg-[#6f9a37]
                px-4
                py-2.5
                text-sm
                font-bold
                text-white
                disabled:opacity-50
              "
            >
              {saving ? (
                <Loader2
                  size={16}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <Save size={16} />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        )}
      </div>
    );
  };

export default AdminWebsiteContentPage;