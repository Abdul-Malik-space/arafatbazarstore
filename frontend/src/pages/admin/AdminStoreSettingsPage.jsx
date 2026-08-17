import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Globe2,
  ImagePlus,
  Loader2,
  Mail,
  MapPin,
  Megaphone,
  Package,
  Phone,
  Plus,
  RefreshCcw,
  Save,
  Settings,
  ShoppingBag,
  Store,
  Trash2,
  Upload,
  X,
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
  updateAdminSiteSettings,
} from "../../services/adminSiteSettings";

import {
  extractSingleUploadedImage,
  uploadAdminSingleImage,
} from "../../services/adminUploads";

// ========================================
// DEFAULT FORM
// ========================================

const DEFAULT_FORM = {
  // Store identity
  storeName: "",
  storeTagline: "",
  logo: "",
  favicon: "",

  // Contact
  phone: "",
  alternatePhone: "",
  whatsapp: "",
  email: "",

  // Address
  address: "",
  city: "",
  province: "Punjab",
  country: "Pakistan",
  googleMapsUrl: "",

  // Store
  currency: "PKR",
  currencySymbol: "Rs.",

  deliveryFee: 200,

  freeDeliveryEnabled:
    false,

  freeDeliveryMinimum: 0,

  estimatedDeliveryText:
    "Delivery within 2-4 working days",

  // Packing / packaging
  packingEnabled: true,

  packingOptions: [
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

  // Announcement
  showAnnouncement: true,
  announcementText: "",

  // Store status
  storeEnabled: true,

  maintenanceMode:
    false,

  maintenanceMessage:
    "Our store is temporarily unavailable.",
};

// ========================================
// TOGGLE
// ========================================

const Toggle = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        onChange(!checked)
      }
      className={`
        relative
        h-[26px]
        w-[46px]
        shrink-0
        rounded-full
        transition-all
        duration-200

        ${
          checked
            ? "bg-[#6f9a37]"
            : "bg-[#d8d8d8]"
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
          h-5
          w-5
          rounded-full
          bg-white
          shadow-sm
          transition-all
          duration-200

          ${
            checked
              ? "left-[23px]"
              : "left-[3px]"
          }
        `}
      />
    </button>
  );
};

// ========================================
// FIELD LABEL
// ========================================

const FieldLabel = ({
  children,
}) => {
  return (
    <label
      className="
        mb-2
        block
        text-[9px]
        font-bold
        uppercase
        tracking-[0.06em]
        text-[#666]
      "
    >
      {children}
    </label>
  );
};

// ========================================
// CARD
// ========================================

const Card = ({
  title,
  description,
  icon: Icon,
  action,
  children,
}) => {
  return (
    <section
      className="
        overflow-hidden
        rounded-[18px]
        border
        border-[#e7e7e7]
        bg-white
      "
    >
      <div
        className="
          flex
          flex-wrap
          items-center
          justify-between
          gap-4
          border-b
          border-[#eeeeee]
          px-5
          py-4
        "
      >
        <div
          className="
            flex
            items-center
            gap-3
          "
        >
          {Icon && (
            <div
              className="
                flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-[11px]
                bg-[#f2f7eb]
                text-[#6f9a37]
              "
            >
              <Icon
                size={18}
              />
            </div>
          )}

          <div>
            <h3
              className="
                text-[14px]
                font-black
                text-[#222]
              "
            >
              {title}
            </h3>

            {description && (
              <p
                className="
                  mt-1
                  text-[9px]
                  leading-5
                  text-[#999]
                "
              >
                {description}
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div
        className="
          p-5
        "
      >
        {children}
      </div>
    </section>
  );
};

// ========================================
// TEXT INPUT
// ========================================

const TextInput = ({
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
}) => {
  return (
    <div>
      <FieldLabel>
        {label}
      </FieldLabel>

      <input
        type={type}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className="
          h-[44px]
          w-full
          rounded-[10px]
          border
          border-[#dddddd]
          bg-white
          px-4
          text-[11px]
          text-[#333]
          outline-none
          transition
          placeholder:text-[#aaa]
          focus:border-[#6f9a37]
          disabled:cursor-not-allowed
          disabled:bg-[#f6f6f6]
          disabled:text-[#999]
        "
      />
    </div>
  );
};

// ========================================
// IMAGE UPLOAD
// ========================================

const ImageUpload = ({
  label,
  image,
  uploadKey,
  uploadingKey,
  onUpload,
  onRemove,
  previewHeight =
    "h-[150px]",
}) => {
  const imageUrl =
    image
      ? getImageUrl(image)
      : "";

  const isUploading =
    uploadingKey === uploadKey;

  const inputId =
    `store-setting-${uploadKey}`;

  return (
    <div>
      <FieldLabel>
        {label}
      </FieldLabel>

      <div
        className="
          rounded-[14px]
          border
          border-[#e4e4e4]
          bg-[#fafafa]
          p-3
        "
      >
        <div
          className={`
            relative
            flex
            w-full
            items-center
            justify-center
            overflow-hidden
            rounded-[10px]
            bg-white

            ${previewHeight}
          `}
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={label}
              className="
                h-full
                w-full
                object-contain
                p-4
              "
            />
          ) : (
            <div
              className="
                text-center
                text-[#aaa]
              "
            >
              <ImagePlus
                size={30}
                className="
                  mx-auto
                "
              />

              <div
                className="
                  mt-2
                  text-[9px]
                "
              >
                No image uploaded
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
                size={26}
                className="
                  animate-spin
                  text-[#6f9a37]
                "
              />
            </div>
          )}
        </div>

        <div
          className="
            mt-3
            flex
            flex-wrap
            gap-2
          "
        >
          <label
            htmlFor={inputId}
            className="
              inline-flex
              h-9
              cursor-pointer
              items-center
              gap-2
              rounded-[9px]
              bg-[#282828]
              px-4
              text-[9px]
              font-bold
              uppercase
              text-white
              transition
              hover:bg-[#6f9a37]
            "
          >
            <Upload
              size={13}
            />

            {image
              ? "Replace"
              : "Upload"}
          </label>

          <input
            id={inputId}
            type="file"
            accept="image/*"
            disabled={isUploading}
            onChange={(event) => {
              const file =
                event.target
                  .files?.[0];

              if (file) {
                onUpload(file);
              }

              event.target.value =
                "";
            }}
            className="hidden"
          />

          {image && (
            <button
              type="button"
              disabled={isUploading}
              onClick={onRemove}
              className="
                inline-flex
                h-9
                items-center
                gap-2
                rounded-[9px]
                border
                border-red-100
                bg-red-50
                px-4
                text-[9px]
                font-bold
                uppercase
                text-red-600
              "
            >
              <X
                size={13}
              />

              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ========================================
// ADMIN STORE SETTINGS
// ========================================

const AdminStoreSettingsPage =
  () => {
    const navigate =
      useNavigate();

    // ======================================
    // STATE
    // ======================================

    const [
      activeTab,
      setActiveTab,
    ] = useState("identity");

    const [
      form,
      setForm,
    ] = useState(
      DEFAULT_FORM
    );

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

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
      errorMessage,
      setErrorMessage,
    ] = useState("");

    const [
      successMessage,
      setSuccessMessage,
    ] = useState("");

    // ======================================
    // SET FIELD
    // ======================================

    const setField = (
      field,
      value
    ) => {
      setForm(
        (current) => ({
          ...current,
          [field]: value,
        })
      );

      setDirty(true);

      setSuccessMessage("");
    };


    // ======================================
    // PACKING HELPERS
    // ======================================

    const normalizePackingCode = (
      value
    ) => {
      return String(value || "")
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
    };

    const createPackingClientId = () =>
      `packing-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}`;

    const normalizePackingOptions = (
      options
    ) => {
      const source = Array.isArray(options)
        ? options
        : [];

      return source.map(
        (option, index) => ({
          _id: option?._id || "",
          _clientId:
            option?._id ||
            option?._clientId ||
            createPackingClientId(),
          code:
            normalizePackingCode(
              option?.code
            ) ||
            `packing-${index + 1}`,
          name:
            option?.name || "",
          description:
            option?.description || "",
          price: Number(
            option?.price ?? 0
          ),
          isActive:
            option?.isActive !== false,
          isDefault:
            option?.isDefault === true,
          sortOrder:
            Number(
              option?.sortOrder ??
                index + 1
            ),
        })
      );
    };

    const updatePackingOption = (
      clientId,
      field,
      value
    ) => {
      setForm((current) => ({
        ...current,
        packingOptions:
          current.packingOptions.map(
            (option) =>
              option._clientId ===
              clientId
                ? {
                    ...option,
                    [field]: value,
                  }
                : option
          ),
      }));

      setDirty(true);
      setSuccessMessage("");
    };

    const addPackingOption = () => {
      setForm((current) => {
        const nextNumber =
          current.packingOptions.length +
          1;

        return {
          ...current,
          packingOptions: [
            ...current.packingOptions,
            {
              _id: "",
              _clientId:
                createPackingClientId(),
              code: `packing-${nextNumber}`,
              name: "New Packing Option",
              description: "",
              price: 0,
              isActive: true,
              isDefault:
                current.packingOptions
                  .length === 0,
              sortOrder: nextNumber,
            },
          ],
        };
      });

      setDirty(true);
      setSuccessMessage("");
    };

    const removePackingOption = (
      clientId
    ) => {
      setForm((current) => {
        const removed =
          current.packingOptions.find(
            (option) =>
              option._clientId ===
              clientId
          );

        const remaining =
          current.packingOptions
            .filter(
              (option) =>
                option._clientId !==
                clientId
            )
            .map((option, index) => ({
              ...option,
              sortOrder: index + 1,
            }));

        if (
          removed?.isDefault &&
          remaining.length > 0 &&
          !remaining.some(
            (option) =>
              option.isDefault
          )
        ) {
          remaining[0] = {
            ...remaining[0],
            isDefault: true,
          };
        }

        return {
          ...current,
          packingOptions: remaining,
        };
      });

      setDirty(true);
      setSuccessMessage("");
    };

    const setDefaultPackingOption = (
      clientId
    ) => {
      setForm((current) => ({
        ...current,
        packingOptions:
          current.packingOptions.map(
            (option) => ({
              ...option,
              isDefault:
                option._clientId ===
                clientId,
            })
          ),
      }));

      setDirty(true);
      setSuccessMessage("");
    };

    // ======================================
    // APPLY SETTINGS
    // ======================================

    const applySettings =
      useCallback(
        (settings = {}) => {
          setForm({
            storeName:
              settings.storeName ||
              "",

            storeTagline:
              settings.storeTagline ||
              "",

            logo:
              settings.logo ||
              "",

            favicon:
              settings.favicon ||
              "",

            phone:
              settings.phone ||
              "",

            alternatePhone:
              settings
                .alternatePhone ||
              "",

            whatsapp:
              settings.whatsapp ||
              "",

            email:
              settings.email ||
              "",

            address:
              settings.address ||
              "",

            city:
              settings.city ||
              "",

            province:
              settings.province ||
              "Punjab",

            country:
              settings.country ||
              "Pakistan",

            googleMapsUrl:
              settings
                .googleMapsUrl ||
              "",

            currency:
              settings.currency ||
              "PKR",

            currencySymbol:
              settings
                .currencySymbol ||
              "Rs.",

            deliveryFee:
              Number(
                settings
                  .deliveryFee ??
                  200
              ),

            freeDeliveryEnabled:
              settings
                .freeDeliveryEnabled ===
              true,

            freeDeliveryMinimum:
              Number(
                settings
                  .freeDeliveryMinimum ??
                  0
              ),

            estimatedDeliveryText:
              settings
                .estimatedDeliveryText ||
              "Delivery within 2-4 working days",

            packingEnabled:
              settings
                .packingEnabled !==
              false,

            packingOptions:
              normalizePackingOptions(
                settings
                  .packingOptions
              ).length > 0
                ? normalizePackingOptions(
                    settings
                      .packingOptions
                  )
                : normalizePackingOptions(
                    DEFAULT_FORM
                      .packingOptions
                  ),

            showAnnouncement:
              settings
                .showAnnouncement !==
              false,

            announcementText:
              settings
                .announcementText ||
              "",

            storeEnabled:
              settings
                .storeEnabled !==
              false,

            maintenanceMode:
              settings
                .maintenanceMode ===
              true,

            maintenanceMessage:
              settings
                .maintenanceMessage ||
              "Our store is temporarily unavailable.",
          });

          setDirty(false);
        },
        []
      );

    // ======================================
    // LOAD SETTINGS
    // ======================================

    const loadSettings =
      useCallback(
        async ({
          silent = false,
        } = {}) => {
          try {
            if (silent) {
              setRefreshing(true);
            } else {
              setLoading(true);
            }

            setErrorMessage("");

            const response =
              await getAdminSiteSettings();

            const settings =
              extractAdminSiteSettings(
                response
              );

            applySettings(
              settings || {}
            );
          } catch (error) {
            console.error(
              "Store settings load error:",
              error
            );

            if (
              isAdminSiteSettingsAuthError(
                error
              )
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
                "Unable to load store settings."
            );
          } finally {
            setLoading(false);

            setRefreshing(false);
          }
        },
        [
          applySettings,
          navigate,
        ]
      );

    useEffect(() => {
      loadSettings();
    }, [loadSettings]);

    // ======================================
    // IMAGE VALIDATION
    // ======================================

    const validateImage = (
      file
    ) => {
      if (!file) {
        return "Please select an image.";
      }

      if (
        !String(
          file.type || ""
        ).startsWith(
          "image/"
        )
      ) {
        return "Please select a valid image file.";
      }

      if (
        file.size >
        10 * 1024 * 1024
      ) {
        return "Image must be smaller than 10 MB.";
      }

      return "";
    };

    // ======================================
    // IMAGE UPLOAD
    // ======================================

    const uploadImage =
      async (
        file,
        field,
        uploadKey
      ) => {
        const validationError =
          validateImage(file);

        if (
          validationError
        ) {
          setErrorMessage(
            validationError
          );

          return;
        }

        try {
          setUploadingKey(
            uploadKey
          );

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

          if (
            !uploadedPath
          ) {
            throw new Error(
              "Image uploaded but no path was returned."
            );
          }

          setField(
            field,
            uploadedPath
          );

          setSuccessMessage(
            "Image uploaded. Click Save Changes to publish it."
          );
        } catch (error) {
          console.error(
            "Store image upload error:",
            error
          );

          if (
            error?.status ===
              401 ||
            error?.status ===
              403
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
              "Image upload failed."
          );
        } finally {
          setUploadingKey(
            ""
          );
        }
      };

    // ======================================
    // VALIDATE
    // ======================================

    const validateForm = () => {
      if (
        !form.storeName.trim()
      ) {
        return "Store name is required.";
      }

      if (
        form.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          form.email
        )
      ) {
        return "Please enter a valid email address.";
      }

      const deliveryFee =
        Number(
          form.deliveryFee
        );

      if (
        Number.isNaN(
          deliveryFee
        ) ||
        deliveryFee < 0
      ) {
        return "Delivery fee must be zero or greater.";
      }

      const minimum =
        Number(
          form
            .freeDeliveryMinimum
        );

      if (
        Number.isNaN(
          minimum
        ) ||
        minimum < 0
      ) {
        return "Free delivery minimum must be zero or greater.";
      }

      if (form.packingEnabled) {
        if (
          !Array.isArray(
            form.packingOptions
          ) ||
          form.packingOptions.length ===
            0
        ) {
          return "Add at least one packing option or disable packing.";
        }

        const codes = [];
        let activeCount = 0;
        let defaultCount = 0;

        for (
          const option of
          form.packingOptions
        ) {
          const code =
            normalizePackingCode(
              option.code
            );

          if (!code) {
            return "Every packing option needs a code.";
          }

          if (!option.name.trim()) {
            return "Every packing option needs a name.";
          }

          const price = Number(
            option.price
          );

          if (
            Number.isNaN(price) ||
            price < 0
          ) {
            return `Packing price for ${option.name || code} must be zero or greater.`;
          }

          if (codes.includes(code)) {
            return `Packing code "${code}" is duplicated. Each packing option needs a unique code.`;
          }

          codes.push(code);

          if (option.isActive) {
            activeCount += 1;
          }

          if (option.isDefault) {
            defaultCount += 1;

            if (!option.isActive) {
              return "The default packing option must also be active.";
            }
          }
        }

        if (activeCount === 0) {
          return "At least one packing option must be active.";
        }

        if (defaultCount !== 1) {
          return "Choose exactly one default packing option.";
        }
      }

      return "";
    };

    // ======================================
    // SAVE
    // ======================================

    const handleSave =
      async () => {
        const validationError =
          validateForm();

        if (
          validationError
        ) {
          setErrorMessage(
            validationError
          );

          return;
        }

        try {
          setSaving(true);

          setErrorMessage("");

          setSuccessMessage("");

          const payload = {
            storeName:
              form.storeName.trim(),

            storeTagline:
              form
                .storeTagline
                .trim(),

            logo:
              form.logo,

            favicon:
              form.favicon,

            phone:
              form.phone.trim(),

            alternatePhone:
              form
                .alternatePhone
                .trim(),

            whatsapp:
              form.whatsapp.trim(),

            email:
              form.email.trim(),

            address:
              form.address.trim(),

            city:
              form.city.trim(),

            province:
              form.province.trim(),

            country:
              form.country.trim(),

            googleMapsUrl:
              form
                .googleMapsUrl
                .trim(),

            currency:
              form.currency.trim(),

            currencySymbol:
              form
                .currencySymbol
                .trim(),

            deliveryFee:
              Number(
                form.deliveryFee
              ),

            freeDeliveryEnabled:
              form
                .freeDeliveryEnabled,

            freeDeliveryMinimum:
              Number(
                form
                  .freeDeliveryMinimum
              ),

            estimatedDeliveryText:
              form
                .estimatedDeliveryText
                .trim(),

            packingEnabled:
              form.packingEnabled,

            packingOptions:
              form.packingOptions.map(
                (option, index) => {
                  const payloadOption = {
                    code:
                      normalizePackingCode(
                        option.code
                      ),
                    name:
                      option.name.trim(),
                    description:
                      option.description.trim(),
                    price: Number(
                      option.price
                    ),
                    isActive:
                      option.isActive,
                    isDefault:
                      option.isDefault,
                    sortOrder:
                      index + 1,
                  };

                  if (option._id) {
                    payloadOption._id =
                      option._id;
                  }

                  return payloadOption;
                }
              ),

            showAnnouncement:
              form
                .showAnnouncement,

            announcementText:
              form
                .announcementText
                .trim(),

            storeEnabled:
              form.storeEnabled,

            maintenanceMode:
              form
                .maintenanceMode,

            maintenanceMessage:
              form
                .maintenanceMessage
                .trim(),
          };

          const response =
            await updateAdminSiteSettings(
              payload
            );

          const updated =
            extractAdminSiteSettings(
              response
            );

          if (updated) {
            applySettings(
              updated
            );
          } else {
            setDirty(false);
          }

          setSuccessMessage(
            "Store settings saved successfully."
          );
        } catch (error) {
          console.error(
            "Store settings save error:",
            error
          );

          if (
            isAdminSiteSettingsAuthError(
              error
            )
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
              "Store settings could not be saved."
          );
        } finally {
          setSaving(false);
        }
      };

    // ======================================
    // TABS
    // ======================================

    const tabs = [
      {
        key: "identity",
        label:
          "Store Identity",
      },

      {
        key: "contact",
        label:
          "Contact Details",
      },

      {
        key: "address",
        label:
          "Address",
      },

      {
        key: "store",
        label:
          "Store & Delivery",
      },

      {
        key: "packing",
        label:
          "Packing",
      },

      {
        key: "announcement",
        label:
          "Top Bar",
      },

      {
        key: "status",
        label:
          "Store Status",
      },
    ];

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
              size={30}
              className="
                mx-auto
                animate-spin
                text-[#6f9a37]
              "
            />

            <p
              className="
                mt-3
                text-[11px]
                text-[#888]
              "
            >
              Loading store
              settings...
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
          space-y-5
          pb-24
        "
      >
        {/* =================================
            HEADER
        ================================= */}

        <section
          className="
            flex
            flex-col
            justify-between
            gap-4
            lg:flex-row
            lg:items-end
          "
        >
          <div>
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-[#6f9a37]
              "
            >
              Store Management
            </div>

            <h1
              className="
                mt-2
                text-[28px]
                font-black
                text-[#222]
              "
            >
              Store Settings
            </h1>

            <p
              className="
                mt-2
                max-w-[700px]
                text-[11px]
                leading-6
                text-[#888]
              "
            >
              Manage store
              identity, header
              logo, contact
              details, delivery,
              announcement bar
              and store status.
            </p>
          </div>

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >
            <button
              type="button"
              disabled={
                refreshing
              }
              onClick={() =>
                loadSettings({
                  silent: true,
                })
              }
              className="
                flex
                h-[42px]
                items-center
                gap-2
                rounded-[10px]
                border
                border-[#dddddd]
                bg-white
                px-4
                text-[9px]
                font-bold
                uppercase
                text-[#555]
                transition
                hover:bg-[#f7f7f7]
                disabled:opacity-50
              "
            >
              <RefreshCcw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              disabled={
                saving ||
                !dirty
              }
              onClick={
                handleSave
              }
              className="
                flex
                h-[42px]
                min-w-[150px]
                items-center
                justify-center
                gap-2
                rounded-[10px]
                bg-[#6f9a37]
                px-5
                text-[9px]
                font-black
                uppercase
                text-white
                transition
                hover:brightness-95
                disabled:cursor-not-allowed
                disabled:opacity-45
              "
            >
              {saving ? (
                <Loader2
                  size={14}
                  className="
                    animate-spin
                  "
                />
              ) : (
                <Save
                  size={14}
                />
              )}

              {saving
                ? "Saving..."
                : "Save Changes"}
            </button>
          </div>
        </section>

        {/* =================================
            MESSAGES
        ================================= */}

        {errorMessage && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-[12px]
              border
              border-red-100
              bg-red-50
              p-4
            "
          >
            <AlertCircle
              size={17}
              className="
                mt-0.5
                shrink-0
                text-red-500
              "
            />

            <div
              className="
                flex-1
                text-[10px]
                leading-5
                text-red-600
              "
            >
              {errorMessage}
            </div>

            <button
              type="button"
              onClick={() =>
                setErrorMessage(
                  ""
                )
              }
            >
              <X
                size={15}
                className="
                  text-red-400
                "
              />
            </button>
          </div>
        )}

        {successMessage && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-[12px]
              border
              border-green-100
              bg-green-50
              p-4
            "
          >
            <CheckCircle2
              size={17}
              className="
                mt-0.5
                shrink-0
                text-green-600
              "
            />

            <div
              className="
                text-[10px]
                leading-5
                text-green-700
              "
            >
              {successMessage}
            </div>
          </div>
        )}

        {/* =================================
            TABS
        ================================= */}

        <div
          className="
            overflow-x-auto
            rounded-[14px]
            border
            border-[#e8e8e8]
            bg-white
            p-1.5
          "
        >
          <div
            className="
              flex
              min-w-max
              gap-1
            "
          >
            {tabs.map(
              (tab) => (
                <button
                  key={
                    tab.key
                  }
                  type="button"
                  onClick={() =>
                    setActiveTab(
                      tab.key
                    )
                  }
                  className={`
                    rounded-[9px]
                    px-4
                    py-2.5
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.04em]
                    transition

                    ${
                      activeTab ===
                      tab.key
                        ? "bg-[#282828] text-white"
                        : "text-[#777] hover:bg-[#f7f7f7]"
                    }
                  `}
                >
                  {tab.label}
                </button>
              )
            )}
          </div>
        </div>

        {/* =================================
            STORE IDENTITY
        ================================= */}

        {activeTab ===
          "identity" && (
          <div
            className="
              space-y-5
            "
          >
            <Card
              title="Store Identity"
              description="These details represent your store across the website."
              icon={Store}
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                "
              >
                <TextInput
                  label="Store Name"
                  value={
                    form.storeName
                  }
                  placeholder="Your store name"
                  onChange={(
                    value
                  ) =>
                    setField(
                      "storeName",
                      value
                    )
                  }
                />

                <TextInput
                  label="Store Tagline"
                  value={
                    form.storeTagline
                  }
                  placeholder="Short store tagline"
                  onChange={(
                    value
                  ) =>
                    setField(
                      "storeTagline",
                      value
                    )
                  }
                />
              </div>
            </Card>

            <Card
              title="Website Branding"
              description="Main logo appears in the website header. Footer logo can be managed separately from Footer Management."
              icon={ImagePlus}
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-6
                  lg:grid-cols-2
                "
              >
                <ImageUpload
                  label="Main Header Logo"
                  image={
                    form.logo
                  }
                  uploadKey="main-logo"
                  uploadingKey={
                    uploadingKey
                  }
                  onUpload={(
                    file
                  ) =>
                    uploadImage(
                      file,
                      "logo",
                      "main-logo"
                    )
                  }
                  onRemove={() =>
                    setField(
                      "logo",
                      ""
                    )
                  }
                />

                <ImageUpload
                  label="Website Favicon"
                  image={
                    form.favicon
                  }
                  uploadKey="favicon"
                  uploadingKey={
                    uploadingKey
                  }
                  previewHeight="h-[150px]"
                  onUpload={(
                    file
                  ) =>
                    uploadImage(
                      file,
                      "favicon",
                      "favicon"
                    )
                  }
                  onRemove={() =>
                    setField(
                      "favicon",
                      ""
                    )
                  }
                />
              </div>
            </Card>
          </div>
        )}

        {/* =================================
            CONTACT
        ================================= */}

        {activeTab ===
          "contact" && (
          <Card
            title="Contact Details"
            description="Phone and email entered here are used by the customer-facing header and contact areas."
            icon={Phone}
          >
            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
              "
            >
              <TextInput
                label="Main Phone Number"
                value={
                  form.phone
                }
                placeholder="+92..."
                onChange={(
                  value
                ) =>
                  setField(
                    "phone",
                    value
                  )
                }
              />

              <TextInput
                label="Alternate Phone"
                value={
                  form
                    .alternatePhone
                }
                placeholder="+92..."
                onChange={(
                  value
                ) =>
                  setField(
                    "alternatePhone",
                    value
                  )
                }
              />

              <TextInput
                label="WhatsApp Number"
                value={
                  form.whatsapp
                }
                placeholder="+92..."
                onChange={(
                  value
                ) =>
                  setField(
                    "whatsapp",
                    value
                  )
                }
              />

              <TextInput
                label="Email Address"
                type="email"
                value={
                  form.email
                }
                placeholder="info@example.com"
                onChange={(
                  value
                ) =>
                  setField(
                    "email",
                    value
                  )
                }
              />
            </div>

            <div
              className="
                mt-5
                rounded-[12px]
                border
                border-[#e7eedf]
                bg-[#f7faf3]
                p-4
              "
            >
              <div
                className="
                  flex
                  items-start
                  gap-3
                "
              >
                <Mail
                  size={17}
                  className="
                    mt-0.5
                    shrink-0
                    text-[#6f9a37]
                  "
                />

                <p
                  className="
                    text-[10px]
                    leading-6
                    text-[#666]
                  "
                >
                  Main phone and
                  email are
                  already connected
                  with the customer
                  Header settings.
                  Save here and the
                  website will use
                  the new values.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* =================================
            ADDRESS
        ================================= */}

        {activeTab ===
          "address" && (
          <Card
            title="Store Address"
            description="Manage the address used in contact information and other website sections."
            icon={MapPin}
          >
            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
              "
            >
              <div
                className="
                  md:col-span-2
                "
              >
                <FieldLabel>
                  Full Address
                </FieldLabel>

                <textarea
                  rows={4}
                  value={
                    form.address
                  }
                  placeholder="Store address"
                  onChange={(
                    event
                  ) =>
                    setField(
                      "address",
                      event.target
                        .value
                    )
                  }
                  className="
                    w-full
                    resize-none
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    bg-white
                    px-4
                    py-3
                    text-[11px]
                    leading-6
                    outline-none
                    focus:border-[#6f9a37]
                  "
                />
              </div>

              <TextInput
                label="City"
                value={
                  form.city
                }
                placeholder="City"
                onChange={(
                  value
                ) =>
                  setField(
                    "city",
                    value
                  )
                }
              />

              <TextInput
                label="Province / State"
                value={
                  form.province
                }
                placeholder="Punjab"
                onChange={(
                  value
                ) =>
                  setField(
                    "province",
                    value
                  )
                }
              />

              <TextInput
                label="Country"
                value={
                  form.country
                }
                placeholder="Pakistan"
                onChange={(
                  value
                ) =>
                  setField(
                    "country",
                    value
                  )
                }
              />

              <TextInput
                label="Google Maps URL"
                value={
                  form
                    .googleMapsUrl
                }
                placeholder="https://maps.google.com/..."
                onChange={(
                  value
                ) =>
                  setField(
                    "googleMapsUrl",
                    value
                  )
                }
              />
            </div>
          </Card>
        )}

        {/* =================================
            STORE + DELIVERY
        ================================= */}

        {activeTab ===
          "store" && (
          <div
            className="
              space-y-5
            "
          >
            <Card
              title="Currency"
              description="Control how product prices are presented on the store."
              icon={Globe2}
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                "
              >
                <TextInput
                  label="Currency Code"
                  value={
                    form.currency
                  }
                  placeholder="PKR"
                  onChange={(
                    value
                  ) =>
                    setField(
                      "currency",
                      value
                    )
                  }
                />

                <TextInput
                  label="Currency Symbol"
                  value={
                    form
                      .currencySymbol
                  }
                  placeholder="Rs."
                  onChange={(
                    value
                  ) =>
                    setField(
                      "currencySymbol",
                      value
                    )
                  }
                />
              </div>
            </Card>

            <Card
              title="Delivery Settings"
              description="Manage delivery charges and the delivery message shown to customers."
              icon={ShoppingBag}
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                "
              >
                <TextInput
                  label="Delivery Fee"
                  type="number"
                  value={
                    form.deliveryFee
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "deliveryFee",
                      value
                    )
                  }
                />

                <div
                  className="
                    flex
                    min-h-[72px]
                    items-center
                    justify-between
                    gap-4
                    rounded-[12px]
                    border
                    border-[#e7e7e7]
                    bg-[#fafafa]
                    px-4
                  "
                >
                  <div>
                    <div
                      className="
                        text-[10px]
                        font-bold
                        text-[#333]
                      "
                    >
                      Free Delivery
                    </div>

                    <div
                      className="
                        mt-1
                        text-[9px]
                        text-[#999]
                      "
                    >
                      Enable free
                      delivery above
                      a minimum
                      amount.
                    </div>
                  </div>

                  <Toggle
                    checked={
                      form
                        .freeDeliveryEnabled
                    }
                    onChange={(
                      value
                    ) =>
                      setField(
                        "freeDeliveryEnabled",
                        value
                      )
                    }
                  />
                </div>

                <TextInput
                  label="Free Delivery Minimum"
                  type="number"
                  disabled={
                    !form
                      .freeDeliveryEnabled
                  }
                  value={
                    form
                      .freeDeliveryMinimum
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "freeDeliveryMinimum",
                      value
                    )
                  }
                />

                <TextInput
                  label="Estimated Delivery Text"
                  value={
                    form
                      .estimatedDeliveryText
                  }
                  placeholder="Delivery within 2-4 working days"
                  onChange={(
                    value
                  ) =>
                    setField(
                      "estimatedDeliveryText",
                      value
                    )
                  }
                />
              </div>
            </Card>
          </div>
        )}



        {/* =================================
            PACKING / PACKAGING
        ================================= */}

        {activeTab ===
          "packing" && (
          <div
            className="
              space-y-5
            "
          >
            <Card
              title="Packing & Packaging"
              description="Offer customers professional packaging choices at checkout. Prices saved here are later re-validated by the backend when an order is created."
              icon={Package}
              action={
                <Toggle
                  checked={
                    form.packingEnabled
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "packingEnabled",
                      value
                    )
                  }
                />
              }
            >
              <div
                className={`
                  rounded-[12px]
                  border
                  p-4

                  ${
                    form.packingEnabled
                      ? "border-green-100 bg-green-50"
                      : "border-[#e7e7e7] bg-[#fafafa]"
                  }
                `}
              >
                <div
                  className="
                    flex
                    flex-col
                    justify-between
                    gap-4
                    md:flex-row
                    md:items-center
                  "
                >
                  <div>
                    <div
                      className={`
                        text-[10px]
                        font-black

                        ${
                          form.packingEnabled
                            ? "text-green-700"
                            : "text-[#666]"
                        }
                      `}
                    >
                      {form.packingEnabled
                        ? "Packing options are enabled"
                        : "Packing options are disabled"}
                    </div>

                    <p
                      className="
                        mt-1
                        max-w-[650px]
                        text-[9px]
                        leading-5
                        text-[#777]
                      "
                    >
                      When enabled, customers can choose one active packing option during checkout. One option must be marked as default.
                    </p>
                  </div>

                  <div
                    className="
                      shrink-0
                      rounded-[10px]
                      border
                      border-white
                      bg-white
                      px-4
                      py-2
                      text-[9px]
                      font-bold
                      text-[#555]
                      shadow-sm
                    "
                  >
                    {
                      form.packingOptions.filter(
                        (option) =>
                          option.isActive
                      ).length
                    } Active / {form.packingOptions.length} Total
                  </div>
                </div>
              </div>
            </Card>

            <Card
              title="Packing Options"
              description="Create, price and control the packaging choices available to customers."
              icon={Package}
              action={
                <button
                  type="button"
                  disabled={
                    !form.packingEnabled
                  }
                  onClick={
                    addPackingOption
                  }
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-2
                    rounded-[9px]
                    bg-[#282828]
                    px-4
                    text-[9px]
                    font-black
                    uppercase
                    text-white
                    transition
                    hover:bg-[#6f9a37]
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <Plus size={13} />
                  Add Option
                </button>
              }
            >
              {!form.packingEnabled && (
                <div
                  className="
                    mb-5
                    rounded-[11px]
                    border
                    border-amber-100
                    bg-amber-50
                    p-4
                    text-[9px]
                    leading-5
                    text-amber-700
                  "
                >
                  Packing is currently disabled. Existing options are kept safely and can be edited again after enabling packing.
                </div>
              )}

              {form.packingOptions.length ===
              0 ? (
                <div
                  className="
                    rounded-[14px]
                    border
                    border-dashed
                    border-[#d9d9d9]
                    bg-[#fafafa]
                    px-5
                    py-10
                    text-center
                  "
                >
                  <Package
                    size={30}
                    className="mx-auto text-[#aaa]"
                  />

                  <div
                    className="
                      mt-3
                      text-[11px]
                      font-black
                      text-[#444]
                    "
                  >
                    No packing options yet
                  </div>

                  <p
                    className="
                      mx-auto
                      mt-1
                      max-w-[430px]
                      text-[9px]
                      leading-5
                      text-[#888]
                    "
                  >
                    Add a free standard packing option first, then create paid secure or gift packaging if needed.
                  </p>
                </div>
              ) : (
                <div
                  className="
                    space-y-4
                  "
                >
                  {form.packingOptions.map(
                    (
                      option,
                      index
                    ) => (
                      <div
                        key={
                          option._clientId
                        }
                        className={`
                          overflow-hidden
                          rounded-[14px]
                          border
                          bg-white

                          ${
                            option.isDefault
                              ? "border-[#b9d694] shadow-[0_8px_30px_rgba(111,154,55,0.08)]"
                              : "border-[#e5e5e5]"
                          }
                        `}
                      >
                        <div
                          className="
                            flex
                            flex-col
                            justify-between
                            gap-3
                            border-b
                            border-[#eeeeee]
                            bg-[#fafafa]
                            px-4
                            py-3
                            md:flex-row
                            md:items-center
                          "
                        >
                          <div
                            className="
                              flex
                              items-center
                              gap-3
                            "
                          >
                            <div
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-[9px]
                                bg-white
                                text-[10px]
                                font-black
                                text-[#6f9a37]
                                shadow-sm
                              "
                            >
                              {index + 1}
                            </div>

                            <div>
                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-2
                                "
                              >
                                <span
                                  className="
                                    text-[10px]
                                    font-black
                                    text-[#333]
                                  "
                                >
                                  {option.name.trim() ||
                                    "Packing Option"}
                                </span>

                                {option.isDefault && (
                                  <span
                                    className="
                                      rounded-full
                                      bg-[#eaf3df]
                                      px-2
                                      py-1
                                      text-[8px]
                                      font-black
                                      uppercase
                                      text-[#5f8730]
                                    "
                                  >
                                    Default
                                  </span>
                                )}

                                {!option.isActive && (
                                  <span
                                    className="
                                      rounded-full
                                      bg-[#eeeeee]
                                      px-2
                                      py-1
                                      text-[8px]
                                      font-black
                                      uppercase
                                      text-[#777]
                                    "
                                  >
                                    Inactive
                                  </span>
                                )}
                              </div>

                              <div
                                className="
                                  mt-1
                                  font-mono
                                  text-[8px]
                                  text-[#999]
                                "
                              >
                                {normalizePackingCode(
                                  option.code
                                ) || "no-code"}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={
                              form.packingOptions
                                .length <= 1
                            }
                            onClick={() =>
                              removePackingOption(
                                option._clientId
                              )
                            }
                            className="
                              inline-flex
                              h-8
                              items-center
                              gap-2
                              rounded-[8px]
                              border
                              border-red-100
                              bg-red-50
                              px-3
                              text-[8px]
                              font-bold
                              uppercase
                              text-red-600
                              transition
                              hover:bg-red-100
                              disabled:cursor-not-allowed
                              disabled:opacity-35
                            "
                          >
                            <Trash2
                              size={12}
                            />
                            Delete
                          </button>
                        </div>

                        <div
                          className="
                            grid
                            grid-cols-1
                            gap-4
                            p-4
                            md:grid-cols-2
                          "
                        >
                          <TextInput
                            label="Option Name"
                            disabled={
                              !form.packingEnabled
                            }
                            value={
                              option.name
                            }
                            placeholder="Secure Packing"
                            onChange={(
                              value
                            ) =>
                              updatePackingOption(
                                option._clientId,
                                "name",
                                value
                              )
                            }
                          />

                          <TextInput
                            label="Stable Code"
                            disabled={
                              !form.packingEnabled
                            }
                            value={
                              option.code
                            }
                            placeholder="secure"
                            onChange={(
                              value
                            ) =>
                              updatePackingOption(
                                option._clientId,
                                "code",
                                normalizePackingCode(
                                  value
                                )
                              )
                            }
                          />

                          <TextInput
                            label={`Price (${form.currencySymbol || form.currency || "PKR"})`}
                            type="number"
                            disabled={
                              !form.packingEnabled
                            }
                            value={
                              option.price
                            }
                            onChange={(
                              value
                            ) =>
                              updatePackingOption(
                                option._clientId,
                                "price",
                                value
                              )
                            }
                          />

                          <div
                            className="
                              flex
                              min-h-[72px]
                              items-center
                              justify-between
                              gap-4
                              rounded-[12px]
                              border
                              border-[#e7e7e7]
                              bg-[#fafafa]
                              px-4
                            "
                          >
                            <div>
                              <div
                                className="
                                  text-[10px]
                                  font-bold
                                  text-[#333]
                                "
                              >
                                Active Option
                              </div>

                              <div
                                className="
                                  mt-1
                                  text-[9px]
                                  text-[#999]
                                "
                              >
                                Show this option at checkout.
                              </div>
                            </div>

                            <Toggle
                              disabled={
                                !form.packingEnabled ||
                                option.isDefault
                              }
                              checked={
                                option.isActive
                              }
                              onChange={(
                                value
                              ) =>
                                updatePackingOption(
                                  option._clientId,
                                  "isActive",
                                  value
                                )
                              }
                            />
                          </div>

                          <div
                            className="
                              md:col-span-2
                            "
                          >
                            <FieldLabel>
                              Description
                            </FieldLabel>

                            <textarea
                              rows={3}
                              disabled={
                                !form.packingEnabled
                              }
                              value={
                                option.description
                              }
                              placeholder="Explain what is included in this packing option."
                              onChange={(
                                event
                              ) =>
                                updatePackingOption(
                                  option._clientId,
                                  "description",
                                  event.target.value
                                )
                              }
                              className="
                                w-full
                                resize-none
                                rounded-[10px]
                                border
                                border-[#dddddd]
                                bg-white
                                px-4
                                py-3
                                text-[11px]
                                leading-6
                                outline-none
                                transition
                                focus:border-[#6f9a37]
                                disabled:cursor-not-allowed
                                disabled:bg-[#f6f6f6]
                                disabled:text-[#999]
                              "
                            />
                          </div>

                          <div
                            className="
                              flex
                              flex-col
                              gap-3
                              rounded-[12px]
                              border
                              border-[#e7eedf]
                              bg-[#f7faf3]
                              p-4
                              md:col-span-2
                              md:flex-row
                              md:items-center
                              md:justify-between
                            "
                          >
                            <div>
                              <div
                                className="
                                  text-[10px]
                                  font-black
                                  text-[#4f7425]
                                "
                              >
                                Default Packing
                              </div>

                              <p
                                className="
                                  mt-1
                                  text-[9px]
                                  leading-5
                                  text-[#70805f]
                                "
                              >
                                The default option will be preselected for the customer when checkout loads.
                              </p>
                            </div>

                            {option.isDefault ? (
                              <span
                                className="
                                  inline-flex
                                  h-9
                                  items-center
                                  rounded-[9px]
                                  bg-[#6f9a37]
                                  px-4
                                  text-[8px]
                                  font-black
                                  uppercase
                                  text-white
                                "
                              >
                                Current Default
                              </span>
                            ) : (
                              <button
                                type="button"
                                disabled={
                                  !form.packingEnabled ||
                                  !option.isActive
                                }
                                onClick={() =>
                                  setDefaultPackingOption(
                                    option._clientId
                                  )
                                }
                                className="
                                  inline-flex
                                  h-9
                                  items-center
                                  justify-center
                                  rounded-[9px]
                                  border
                                  border-[#bfd49f]
                                  bg-white
                                  px-4
                                  text-[8px]
                                  font-black
                                  uppercase
                                  text-[#5f8730]
                                  transition
                                  hover:bg-[#eef6e5]
                                  disabled:cursor-not-allowed
                                  disabled:opacity-40
                                "
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

              <div
                className="
                  mt-5
                  rounded-[12px]
                  border
                  border-[#e7eedf]
                  bg-[#f7faf3]
                  p-4
                "
              >
                <div
                  className="
                    flex
                    items-start
                    gap-3
                  "
                >
                  <Package
                    size={17}
                    className="
                      mt-0.5
                      shrink-0
                      text-[#6f9a37]
                    "
                  />

                  <p
                    className="
                      text-[9px]
                      leading-5
                      text-[#666]
                    "
                  >
                    Keep the code stable after orders begin using an option. You can safely change the customer-facing name, description and price later because each order stores its own packing snapshot.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* =================================
            TOP BAR
        ================================= */}

        {activeTab ===
          "announcement" && (
          <Card
            title="Top Announcement Bar"
            description="Control the promotional or information message shown in the website header."
            icon={Megaphone}
            action={
              <Toggle
                checked={
                  form
                    .showAnnouncement
                }
                onChange={(
                  value
                ) =>
                  setField(
                    "showAnnouncement",
                    value
                  )
                }
              />
            }
          >
            <div>
              <FieldLabel>
                Announcement Text
              </FieldLabel>

              <textarea
                rows={4}
                disabled={
                  !form
                    .showAnnouncement
                }
                value={
                  form
                    .announcementText
                }
                placeholder="Free delivery on selected orders..."
                onChange={(
                  event
                ) =>
                  setField(
                    "announcementText",
                    event.target
                      .value
                  )
                }
                className="
                  w-full
                  resize-none
                  rounded-[10px]
                  border
                  border-[#dddddd]
                  bg-white
                  px-4
                  py-3
                  text-[11px]
                  leading-6
                  outline-none
                  focus:border-[#6f9a37]
                  disabled:cursor-not-allowed
                  disabled:bg-[#f6f6f6]
                "
              />
            </div>

            <div
              className="
                mt-4
                rounded-[12px]
                border
                border-[#e7eedf]
                bg-[#f7faf3]
                p-4
              "
            >
              <div
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  text-[#6f9a37]
                "
              >
                Preview
              </div>

              <div
                className="
                  mt-2
                  rounded-[8px]
                  bg-[#6f9a37]
                  px-4
                  py-3
                  text-center
                  text-[10px]
                  font-medium
                  text-white
                "
              >
                {form
                  .announcementText
                  .trim() ||
                  form
                    .estimatedDeliveryText ||
                  "Your announcement will appear here."}
              </div>
            </div>
          </Card>
        )}

        {/* =================================
            STORE STATUS
        ================================= */}

        {activeTab ===
          "status" && (
          <div
            className="
              space-y-5
            "
          >
            <Card
              title="Store Availability"
              description="Turn the customer storefront on or off."
              icon={Store}
              action={
                <Toggle
                  checked={
                    form
                      .storeEnabled
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "storeEnabled",
                      value
                    )
                  }
                />
              }
            >
              <div
                className={`
                  rounded-[12px]
                  border
                  p-4

                  ${
                    form
                      .storeEnabled
                      ? "border-green-100 bg-green-50"
                      : "border-red-100 bg-red-50"
                  }
                `}
              >
                <div
                  className={`
                    text-[10px]
                    font-bold

                    ${
                      form
                        .storeEnabled
                        ? "text-green-700"
                        : "text-red-600"
                    }
                  `}
                >
                  {form
                    .storeEnabled
                    ? "Store is enabled"
                    : "Store is disabled"}
                </div>

                <p
                  className="
                    mt-1
                    text-[9px]
                    leading-5
                    text-[#777]
                  "
                >
                  Admin Panel
                  remains
                  accessible even
                  when the customer
                  store is disabled.
                </p>
              </div>
            </Card>

            <Card
              title="Maintenance Mode"
              description="Temporarily hide the customer store while updates are being made."
              icon={Settings}
              action={
                <Toggle
                  checked={
                    form
                      .maintenanceMode
                  }
                  onChange={(
                    value
                  ) =>
                    setField(
                      "maintenanceMode",
                      value
                    )
                  }
                />
              }
            >
              <div>
                <FieldLabel>
                  Maintenance
                  Message
                </FieldLabel>

                <textarea
                  rows={4}
                  disabled={
                    !form
                      .maintenanceMode
                  }
                  value={
                    form
                      .maintenanceMessage
                  }
                  onChange={(
                    event
                  ) =>
                    setField(
                      "maintenanceMessage",
                      event.target
                        .value
                    )
                  }
                  className="
                    w-full
                    resize-none
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    bg-white
                    px-4
                    py-3
                    text-[11px]
                    leading-6
                    outline-none
                    focus:border-[#6f9a37]
                    disabled:cursor-not-allowed
                    disabled:bg-[#f6f6f6]
                  "
                />
              </div>
            </Card>
          </div>
        )}

        {/* =================================
            UNSAVED STATUS
        ================================= */}

        {dirty && (
          <div
            className="
              fixed
              bottom-5
              right-5
              z-40
              flex
              items-center
              gap-3
              rounded-[12px]
              border
              border-amber-100
              bg-white
              px-4
              py-3
              shadow-[0_15px_45px_rgba(0,0,0,0.12)]
            "
          >
            <span
              className="
                h-2
                w-2
                rounded-full
                bg-amber-400
              "
            />

            <span
              className="
                text-[9px]
                font-bold
                uppercase
                text-[#666]
              "
            >
              Unsaved changes
            </span>
          </div>
        )}
      </div>
    );
  };

export default AdminStoreSettingsPage;