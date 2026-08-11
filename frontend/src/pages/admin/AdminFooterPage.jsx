import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Clock3,
  ImagePlus,
  Link2,
  Loader2,
  Mail,
  Plus,
  QrCode,
  RefreshCcw,
  Save,
  Smartphone,
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
// HELPERS
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
    .slice(2, 8)}`;
};

// ========================================
// DEFAULTS
// ========================================

const DEFAULT_NEWSLETTER = {
  isActive: true,

  title:
    "Our subscribe newsletter",

  description:
    "Don't miss any promotion and get the latest offers from our store.",

  placeholder:
    "Enter your email",

  buttonText:
    "Subscribe",
};

const DEFAULT_MOBILE_APP = {
  isActive: true,

  title:
    "Mobile app store",

  description:
    "Check promotions and shop quickly from your mobile.",

  qrImage: "",

  googlePlayImage: "",

  googlePlayUrl: "",

  appStoreImage: "",

  appStoreUrl: "",
};

const DEFAULT_HOURS = {
  mondayThursdayLabel:
    "Monday to Thursday",

  mondayThursday:
    "8:30 AM to 8:30 PM",

  fridaySaturdayLabel:
    "Friday to Saturday",

  fridaySaturday:
    "8:30 AM to 4:30 PM",

  sundayLabel:
    "Sunday",

  sunday:
    "Closed",
};

const DEFAULT_COLUMNS = [
  {
    _clientId:
      createClientId(
        "footer-column"
      ),

    title:
      "Information",

    isActive: true,

    links: [
      {
        _clientId:
          createClientId(
            "footer-link"
          ),

        label:
          "About story",

        url:
          "/about",

        openInNewTab:
          false,

        isActive:
          true,
      },

      {
        _clientId:
          createClientId(
            "footer-link"
          ),

        label:
          "Contact us",

        url:
          "/contact",

        openInNewTab:
          false,

        isActive:
          true,
      },
    ],
  },

  {
    _clientId:
      createClientId(
        "footer-column"
      ),

    title:
      "My account",

    isActive: true,

    links: [
      {
        _clientId:
          createClientId(
            "footer-link"
          ),

        label:
          "Shopping cart",

        url:
          "/cart",

        openInNewTab:
          false,

        isActive:
          true,
      },

      {
        _clientId:
          createClientId(
            "footer-link"
          ),

        label:
          "Shop",

        url:
          "/shop",

        openInNewTab:
          false,

        isActive:
          true,
      },
    ],
  },

  {
    _clientId:
      createClientId(
        "footer-column"
      ),

    title:
      "Customer care",

    isActive: true,

    links: [
      {
        _clientId:
          createClientId(
            "footer-link"
          ),

        label:
          "Help & support",

        url:
          "/contact",

        openInNewTab:
          false,

        isActive:
          true,
      },
    ],
  },
];

// ========================================
// NORMALIZERS
// ========================================

const normalizeLink = (
  link = {}
) => ({
  _id:
    link._id || "",

  _clientId:
    link._id ||
    createClientId(
      "footer-link"
    ),

  label:
    link.label || "",

  url:
    link.url || "",

  openInNewTab:
    link.openInNewTab ===
    true,

  isActive:
    link.isActive !== false,
});

const normalizeColumn = (
  column = {}
) => ({
  _id:
    column._id || "",

  _clientId:
    column._id ||
    createClientId(
      "footer-column"
    ),

  title:
    column.title || "",

  isActive:
    column.isActive !== false,

  links:
    Array.isArray(
      column.links
    )
      ? column.links.map(
          normalizeLink
        )
      : [],
});

const normalizeSocial = (
  social = {}
) => ({
  _id:
    social._id || "",

  _clientId:
    social._id ||
    createClientId(
      "social"
    ),

  platform:
    social.platform || "",

  url:
    social.url || "",

  isActive:
    social.isActive !== false,
});

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
        transition
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
// FORM LABEL
// ========================================

const FieldLabel = ({
  children,
}) => (
  <label
    className="
      mb-2
      block
      text-[10px]
      font-bold
      uppercase
      tracking-[0.05em]
      text-[#555]
    "
  >
    {children}
  </label>
);

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
        border-[#e8e8e8]
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
                items-center
                justify-center
                rounded-[11px]
                bg-[#f3f7ed]
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
// IMAGE UPLOADER
// ========================================

const ImageUploader = ({
  label,
  image,
  uploadKey,
  uploadingKey,
  onUpload,
  onRemove,
  previewClassName =
    "h-[120px]",
}) => {
  const imageUrl =
    image
      ? getImageUrl(image)
      : "";

  const isUploading =
    uploadingKey === uploadKey;

  const inputId =
    `footer-image-${uploadKey}`;

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

            ${previewClassName}
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
                p-3
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
                size={28}
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
                size={25}
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
              onClick={onRemove}
              disabled={
                isUploading
              }
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
              <Trash2
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
// ADMIN FOOTER PAGE
// ========================================

const AdminFooterPage = () => {
  const navigate =
    useNavigate();

  // ======================================
  // STATE
  // ======================================

  const [
    activeTab,
    setActiveTab,
  ] = useState("general");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    refreshing,
    setRefreshing,
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
  // GENERAL
  // ======================================

  const [
    footerLogo,
    setFooterLogo,
  ] = useState("");

  const [
    footerDescription,
    setFooterDescription,
  ] = useState("");

  const [
    footerCopyright,
    setFooterCopyright,
  ] = useState(
    "All rights reserved."
  );

  // ======================================
  // NEWSLETTER
  // ======================================

  const [
    showNewsletter,
    setShowNewsletter,
  ] = useState(true);

  const [
    footerNewsletter,
    setFooterNewsletter,
  ] = useState(
    DEFAULT_NEWSLETTER
  );

  // ======================================
  // MOBILE APP
  // ======================================

  const [
    footerMobileApp,
    setFooterMobileApp,
  ] = useState(
    DEFAULT_MOBILE_APP
  );

  // ======================================
  // COLUMNS
  // ======================================

  const [
    footerColumns,
    setFooterColumns,
  ] = useState(
    DEFAULT_COLUMNS
  );

  // ======================================
  // HOURS
  // ======================================

  const [
    showOpeningHours,
    setShowOpeningHours,
  ] = useState(true);

  const [
    openingHoursTitle,
    setOpeningHoursTitle,
  ] = useState(
    "Opening hours"
  );

  const [
    openingHours,
    setOpeningHours,
  ] = useState(
    DEFAULT_HOURS
  );

  // ======================================
  // SOCIAL
  // ======================================

  const [
    showFooterSocial,
    setShowFooterSocial,
  ] = useState(true);

  const [
    footerSocialTitle,
    setFooterSocialTitle,
  ] = useState(
    "Followed by :"
  );

  const [
    socialLinks,
    setSocialLinks,
  ] = useState([]);

  // ======================================
  // CMS PAGES
  // ======================================

  const [
    showCmsPagesInFooter,
    setShowCmsPagesInFooter,
  ] = useState(true);

  // ======================================
  // MARK DIRTY
  // ======================================

  const markDirty = () => {
    setDirty(true);

    setSuccessMessage("");
  };

  // ======================================
  // APPLY SETTINGS
  // ======================================

  const applySettings =
    useCallback(
      (settings = {}) => {
        setFooterLogo(
          settings.footerLogo ||
            ""
        );

        setFooterDescription(
          settings
            .footerDescription ||
            ""
        );

        setFooterCopyright(
          settings
            .footerCopyright ||
            "All rights reserved."
        );

        const newsletter = {
          ...DEFAULT_NEWSLETTER,

          ...(
            settings
              .footerNewsletter ||
            {}
          ),
        };

        setShowNewsletter(
          settings
            .showNewsletter !==
          false
        );

        setFooterNewsletter(
          newsletter
        );

        setFooterMobileApp({
          ...DEFAULT_MOBILE_APP,

          ...(
            settings
              .footerMobileApp ||
            {}
          ),

          qrImage:
            settings
              .footerMobileApp
              ?.qrImage ||
            settings.appQrImage ||
            "",

          googlePlayImage:
            settings
              .footerMobileApp
              ?.googlePlayImage ||
            settings
              .googlePlayImage ||
            "",

          googlePlayUrl:
            settings
              .footerMobileApp
              ?.googlePlayUrl ||
            settings
              .googlePlayUrl ||
            "",

          appStoreImage:
            settings
              .footerMobileApp
              ?.appStoreImage ||
            settings
              .appStoreImage ||
            "",

          appStoreUrl:
            settings
              .footerMobileApp
              ?.appStoreUrl ||
            settings
              .appStoreUrl ||
            "",
        });

        const columns =
          Array.isArray(
            settings
              .footerColumns
          ) &&
          settings
            .footerColumns
            .length > 0
            ? settings
                .footerColumns
                .map(
                  normalizeColumn
                )
            : DEFAULT_COLUMNS.map(
                (column) => ({
                  ...column,

                  _clientId:
                    createClientId(
                      "footer-column"
                    ),

                  links:
                    column.links.map(
                      (link) => ({
                        ...link,

                        _clientId:
                          createClientId(
                            "footer-link"
                          ),
                      })
                    ),
                })
              );

        setFooterColumns(
          columns
        );

        setShowOpeningHours(
          settings
            .showOpeningHours !==
          false
        );

        setOpeningHoursTitle(
          settings
            .openingHoursTitle ||
            "Opening hours"
        );

        setOpeningHours({
          ...DEFAULT_HOURS,

          ...(
            settings
              .openingHours ||
            {}
          ),
        });

        setShowFooterSocial(
          settings
            .showFooterSocial !==
          false
        );

        setFooterSocialTitle(
          settings
            .footerSocialTitle ||
            "Followed by :"
        );

        setSocialLinks(
          Array.isArray(
            settings.socialLinks
          )
            ? settings
                .socialLinks
                .map(
                  normalizeSocial
                )
            : []
        );

        setShowCmsPagesInFooter(
          settings
            .showCmsPagesInFooter !==
          false
        );

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
            "Footer settings load error:",
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
              "Unable to load footer settings."
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

    const maxSize =
      10 * 1024 * 1024;

    if (
      file.size > maxSize
    ) {
      return "Image must be smaller than 10 MB.";
    }

    return "";
  };

  // ======================================
  // UPLOAD IMAGE
  // ======================================

  const uploadImage =
    async (
      file,
      key,
      onUploaded
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

        const path =
          uploaded?.path ||
          uploaded?.url ||
          "";

        if (!path) {
          throw new Error(
            "Image uploaded but no image path was returned."
          );
        }

        onUploaded(path);

        markDirty();

        setSuccessMessage(
          "Image uploaded. Click Save Changes to publish it."
        );
      } catch (error) {
        console.error(
          "Footer image upload error:",
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
        setUploadingKey("");
      }
    };

  // ======================================
  // COLUMN FUNCTIONS
  // ======================================

  const addColumn = () => {
    setFooterColumns(
      (current) => [
        ...current,

        {
          _clientId:
            createClientId(
              "footer-column"
            ),

          title:
            "New column",

          isActive:
            true,

          links: [],
        },
      ]
    );

    markDirty();
  };

  const updateColumn = (
    columnId,
    field,
    value
  ) => {
    setFooterColumns(
      (current) =>
        current.map(
          (column) =>
            column
              ._clientId ===
            columnId
              ? {
                  ...column,

                  [field]:
                    value,
                }
              : column
        )
    );

    markDirty();
  };

  const removeColumn = (
    columnId
  ) => {
    setFooterColumns(
      (current) =>
        current.filter(
          (column) =>
            column
              ._clientId !==
            columnId
        )
    );

    markDirty();
  };

  const moveColumn = (
    index,
    direction
  ) => {
    const targetIndex =
      direction === "up"
        ? index - 1
        : index + 1;

    if (
      targetIndex < 0 ||
      targetIndex >=
        footerColumns.length
    ) {
      return;
    }

    setFooterColumns(
      (current) => {
        const next =
          [...current];

        [
          next[index],
          next[targetIndex],
        ] = [
          next[targetIndex],
          next[index],
        ];

        return next;
      }
    );

    markDirty();
  };

  // ======================================
  // LINK FUNCTIONS
  // ======================================

  const addLink = (
    columnId
  ) => {
    setFooterColumns(
      (current) =>
        current.map(
          (column) =>
            column
              ._clientId ===
            columnId
              ? {
                  ...column,

                  links: [
                    ...column.links,

                    {
                      _clientId:
                        createClientId(
                          "footer-link"
                        ),

                      label:
                        "New link",

                      url:
                        "/",

                      openInNewTab:
                        false,

                      isActive:
                        true,
                    },
                  ],
                }
              : column
        )
    );

    markDirty();
  };

  const updateLink = (
    columnId,
    linkId,
    field,
    value
  ) => {
    setFooterColumns(
      (current) =>
        current.map(
          (column) =>
            column
              ._clientId ===
            columnId
              ? {
                  ...column,

                  links:
                    column.links.map(
                      (link) =>
                        link
                          ._clientId ===
                        linkId
                          ? {
                              ...link,

                              [field]:
                                value,
                            }
                          : link
                    ),
                }
              : column
        )
    );

    markDirty();
  };

  const removeLink = (
    columnId,
    linkId
  ) => {
    setFooterColumns(
      (current) =>
        current.map(
          (column) =>
            column
              ._clientId ===
            columnId
              ? {
                  ...column,

                  links:
                    column.links.filter(
                      (link) =>
                        link
                          ._clientId !==
                        linkId
                    ),
                }
              : column
        )
    );

    markDirty();
  };

  const moveLink = (
    columnId,
    index,
    direction
  ) => {
    setFooterColumns(
      (current) =>
        current.map(
          (column) => {
            if (
              column
                ._clientId !==
              columnId
            ) {
              return column;
            }

            const targetIndex =
              direction === "up"
                ? index - 1
                : index + 1;

            if (
              targetIndex < 0 ||
              targetIndex >=
                column.links
                  .length
            ) {
              return column;
            }

            const links =
              [...column.links];

            [
              links[index],
              links[targetIndex],
            ] = [
              links[targetIndex],
              links[index],
            ];

            return {
              ...column,
              links,
            };
          }
        )
    );

    markDirty();
  };

  // ======================================
  // SOCIAL FUNCTIONS
  // ======================================

  const addSocial = () => {
    setSocialLinks(
      (current) => [
        ...current,

        normalizeSocial({
          platform:
            "Facebook",

          url: "",

          isActive:
            true,
        }),
      ]
    );

    markDirty();
  };

  const updateSocial = (
    id,
    field,
    value
  ) => {
    setSocialLinks(
      (current) =>
        current.map(
          (social) =>
            social._clientId ===
            id
              ? {
                  ...social,

                  [field]:
                    value,
                }
              : social
        )
    );

    markDirty();
  };

  const removeSocial = (
    id
  ) => {
    setSocialLinks(
      (current) =>
        current.filter(
          (social) =>
            social._clientId !==
            id
        )
    );

    markDirty();
  };

  // ======================================
  // VALIDATION
  // ======================================

  const validationMessage =
    useMemo(() => {
      for (
        const column of
        footerColumns
      ) {
        if (
          !column.title.trim()
        ) {
          return "Every footer column needs a title.";
        }

        for (
          const link of
          column.links
        ) {
          if (
            !link.label.trim()
          ) {
            return "Every footer link needs a label.";
          }
        }
      }

      return "";
    }, [footerColumns]);

  // ======================================
  // SAVE
  // ======================================

  const handleSave =
    async () => {
      if (
        validationMessage
      ) {
        setErrorMessage(
          validationMessage
        );

        return;
      }

      try {
        setSaving(true);

        setErrorMessage("");

        setSuccessMessage("");

        const payload = {
          footerLogo,

          footerDescription:
            footerDescription.trim(),

          footerCopyright:
            footerCopyright.trim(),

          showNewsletter,

          footerNewsletter: {
            ...footerNewsletter,

            isActive:
              showNewsletter,
          },

          footerMobileApp: {
            ...footerMobileApp,
          },

          footerColumns:
            footerColumns.map(
              (column) => ({
                title:
                  column.title.trim(),

                isActive:
                  column.isActive,

                links:
                  column.links.map(
                    (link) => ({
                      label:
                        link.label.trim(),

                      url:
                        link.url.trim() ||
                        "#",

                      openInNewTab:
                        link
                          .openInNewTab,

                      isActive:
                        link
                          .isActive,
                    })
                  ),
              })
            ),

          showOpeningHours,

          openingHoursTitle:
            openingHoursTitle.trim(),

          openingHours: {
            ...openingHours,
          },

          showFooterSocial,

          footerSocialTitle:
            footerSocialTitle.trim(),

          socialLinks:
            socialLinks.map(
              (social) => ({
                platform:
                  social.platform
                    .trim(),

                url:
                  social.url.trim(),

                isActive:
                  social.isActive,
              })
            ),

          showCmsPagesInFooter,
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
          "Footer settings saved successfully."
        );
      } catch (error) {
        console.error(
          "Footer save error:",
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
            "Footer settings could not be saved."
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
      key: "general",
      label:
        "General",
    },

    {
      key: "newsletter",
      label:
        "Newsletter & App",
    },

    {
      key: "columns",
      label:
        "Footer Columns",
    },

    {
      key: "hours",
      label:
        "Hours & Social",
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
            Loading footer
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
            Website
            Management
          </div>

          <h1
            className="
              mt-2
              text-[28px]
              font-black
              text-[#222]
            "
          >
            Footer
            Management
          </h1>

          <p
            className="
              mt-2
              max-w-[650px]
              text-[11px]
              leading-6
              text-[#888]
            "
          >
            Manage footer
            logo, newsletter,
            app links, menu
            columns, opening
            hours and social
            links.
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
              min-w-[140px]
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
          MESSAGE
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
              setErrorMessage("")
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
          GENERAL
      ================================= */}

      {activeTab ===
        "general" && (
        <div
          className="
            space-y-5
          "
        >
          <Card
            title="Footer Identity"
            description="Manage the logo and store description shown in the footer."
            icon={
              ImagePlus
            }
          >
            <div
              className="
                grid
                grid-cols-1
                gap-6
                lg:grid-cols-[320px_1fr]
              "
            >
              <ImageUploader
                label="Footer Logo"
                image={
                  footerLogo
                }
                uploadKey="footer-logo"
                uploadingKey={
                  uploadingKey
                }
                onUpload={(
                  file
                ) =>
                  uploadImage(
                    file,
                    "footer-logo",
                    (path) =>
                      setFooterLogo(
                        path
                      )
                  )
                }
                onRemove={() => {
                  setFooterLogo(
                    ""
                  );

                  markDirty();
                }}
              />

              <div
                className="
                  space-y-5
                "
              >
                <div>
                  <FieldLabel>
                    Footer
                    Description
                  </FieldLabel>

                  <textarea
                    value={
                      footerDescription
                    }
                    onChange={(
                      event
                    ) => {
                      setFooterDescription(
                        event.target
                          .value
                      );

                      markDirty();
                    }}
                    rows={6}
                    placeholder="Short description about your store..."
                    className="
                      w-full
                      resize-none
                      rounded-[11px]
                      border
                      border-[#dddddd]
                      bg-white
                      px-4
                      py-3
                      text-[11px]
                      leading-6
                      text-[#444]
                      outline-none
                      focus:border-[#6f9a37]
                    "
                  />
                </div>

                <div>
                  <FieldLabel>
                    Copyright
                    Text
                  </FieldLabel>

                  <input
                    type="text"
                    value={
                      footerCopyright
                    }
                    onChange={(
                      event
                    ) => {
                      setFooterCopyright(
                        event.target
                          .value
                      );

                      markDirty();
                    }}
                    placeholder="All rights reserved."
                    className="
                      h-[44px]
                      w-full
                      rounded-[10px]
                      border
                      border-[#dddddd]
                      px-4
                      text-[11px]
                      outline-none
                      focus:border-[#6f9a37]
                    "
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card
            title="CMS Footer Pages"
            description="Allow pages marked Show in Footer in Pages Management to appear in the website footer."
            icon={Link2}
            action={
              <Toggle
                checked={
                  showCmsPagesInFooter
                }
                onChange={(
                  value
                ) => {
                  setShowCmsPagesInFooter(
                    value
                  );

                  markDirty();
                }}
              />
            }
          >
            <p
              className="
                text-[10px]
                leading-6
                text-[#777]
              "
            >
              When enabled,
              pages that have
              <strong>
                {" "}
                Show in Footer
              </strong>{" "}
              enabled inside
              Pages Management
              can be added to
              the customer
              footer
              automatically.
            </p>
          </Card>
        </div>
      )}

      {/* =================================
          NEWSLETTER + APP
      ================================= */}

      {activeTab ===
        "newsletter" && (
        <div
          className="
            space-y-5
          "
        >
          <Card
            title="Newsletter"
            description="Manage the subscription area displayed at the top of the footer."
            icon={Mail}
            action={
              <Toggle
                checked={
                  showNewsletter
                }
                onChange={(
                  value
                ) => {
                  setShowNewsletter(
                    value
                  );

                  setFooterNewsletter(
                    (
                      current
                    ) => ({
                      ...current,

                      isActive:
                        value,
                    })
                  );

                  markDirty();
                }}
              />
            }
          >
            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
              "
            >
              <div>
                <FieldLabel>
                  Heading
                </FieldLabel>

                <input
                  value={
                    footerNewsletter
                      .title
                  }
                  onChange={(
                    event
                  ) => {
                    setFooterNewsletter(
                      (
                        current
                      ) => ({
                        ...current,

                        title:
                          event.target
                            .value,
                      })
                    );

                    markDirty();
                  }}
                  className="
                    h-[44px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    px-4
                    text-[11px]
                    outline-none
                    focus:border-[#6f9a37]
                  "
                />
              </div>

              <div>
                <FieldLabel>
                  Button Text
                </FieldLabel>

                <input
                  value={
                    footerNewsletter
                      .buttonText
                  }
                  onChange={(
                    event
                  ) => {
                    setFooterNewsletter(
                      (
                        current
                      ) => ({
                        ...current,

                        buttonText:
                          event.target
                            .value,
                      })
                    );

                    markDirty();
                  }}
                  className="
                    h-[44px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    px-4
                    text-[11px]
                    outline-none
                    focus:border-[#6f9a37]
                  "
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
                  value={
                    footerNewsletter
                      .description
                  }
                  onChange={(
                    event
                  ) => {
                    setFooterNewsletter(
                      (
                        current
                      ) => ({
                        ...current,

                        description:
                          event.target
                            .value,
                      })
                    );

                    markDirty();
                  }}
                  className="
                    w-full
                    resize-none
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    px-4
                    py-3
                    text-[11px]
                    leading-5
                    outline-none
                    focus:border-[#6f9a37]
                  "
                />
              </div>

              <div
                className="
                  md:col-span-2
                "
              >
                <FieldLabel>
                  Email Input
                  Placeholder
                </FieldLabel>

                <input
                  value={
                    footerNewsletter
                      .placeholder
                  }
                  onChange={(
                    event
                  ) => {
                    setFooterNewsletter(
                      (
                        current
                      ) => ({
                        ...current,

                        placeholder:
                          event.target
                            .value,
                      })
                    );

                    markDirty();
                  }}
                  className="
                    h-[44px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    px-4
                    text-[11px]
                    outline-none
                    focus:border-[#6f9a37]
                  "
                />
              </div>
            </div>
          </Card>

          <Card
            title="Mobile App Area"
            description="Manage QR code and mobile application store links."
            icon={
              Smartphone
            }
            action={
              <Toggle
                checked={
                  footerMobileApp
                    .isActive
                }
                onChange={(
                  value
                ) => {
                  setFooterMobileApp(
                    (
                      current
                    ) => ({
                      ...current,

                      isActive:
                        value,
                    })
                  );

                  markDirty();
                }}
              />
            }
          >
            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
              "
            >
              <div>
                <FieldLabel>
                  Heading
                </FieldLabel>

                <input
                  value={
                    footerMobileApp
                      .title
                  }
                  onChange={(
                    event
                  ) => {
                    setFooterMobileApp(
                      (
                        current
                      ) => ({
                        ...current,

                        title:
                          event.target
                            .value,
                      })
                    );

                    markDirty();
                  }}
                  className="
                    h-[44px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    px-4
                    text-[11px]
                    outline-none
                    focus:border-[#6f9a37]
                  "
                />
              </div>

              <div>
                <FieldLabel>
                  Description
                </FieldLabel>

                <input
                  value={
                    footerMobileApp
                      .description
                  }
                  onChange={(
                    event
                  ) => {
                    setFooterMobileApp(
                      (
                        current
                      ) => ({
                        ...current,

                        description:
                          event.target
                            .value,
                      })
                    );

                    markDirty();
                  }}
                  className="
                    h-[44px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    px-4
                    text-[11px]
                    outline-none
                    focus:border-[#6f9a37]
                  "
                />
              </div>

              <ImageUploader
                label="QR Code Image"
                image={
                  footerMobileApp
                    .qrImage
                }
                uploadKey="footer-qr"
                uploadingKey={
                  uploadingKey
                }
                previewClassName="h-[150px]"
                onUpload={(
                  file
                ) =>
                  uploadImage(
                    file,
                    "footer-qr",
                    (path) =>
                      setFooterMobileApp(
                        (
                          current
                        ) => ({
                          ...current,

                          qrImage:
                            path,
                        })
                      )
                  )
                }
                onRemove={() => {
                  setFooterMobileApp(
                    (
                      current
                    ) => ({
                      ...current,

                      qrImage:
                        "",
                    })
                  );

                  markDirty();
                }}
              />

              <div
                className="
                  flex
                  items-center
                  justify-center
                  rounded-[14px]
                  border
                  border-dashed
                  border-[#dddddd]
                  bg-[#fafafa]
                  p-5
                  text-center
                "
              >
                <div>
                  <QrCode
                    size={32}
                    className="
                      mx-auto
                      text-[#6f9a37]
                    "
                  />

                  <p
                    className="
                      mt-3
                      text-[10px]
                      leading-5
                      text-[#777]
                    "
                  >
                    Upload the
                    real QR code
                    used to open
                    your mobile
                    app.
                  </p>
                </div>
              </div>

              <div
                className="
                  space-y-4
                "
              >
                <ImageUploader
                  label="Google Play Image"
                  image={
                    footerMobileApp
                      .googlePlayImage
                  }
                  uploadKey="google-play"
                  uploadingKey={
                    uploadingKey
                  }
                  previewClassName="h-[100px]"
                  onUpload={(
                    file
                  ) =>
                    uploadImage(
                      file,
                      "google-play",
                      (path) =>
                        setFooterMobileApp(
                          (
                            current
                          ) => ({
                            ...current,

                            googlePlayImage:
                              path,
                          })
                        )
                    )
                  }
                  onRemove={() => {
                    setFooterMobileApp(
                      (
                        current
                      ) => ({
                        ...current,

                        googlePlayImage:
                          "",
                      })
                    );

                    markDirty();
                  }}
                />

                <div>
                  <FieldLabel>
                    Google Play
                    URL
                  </FieldLabel>

                  <input
                    value={
                      footerMobileApp
                        .googlePlayUrl
                    }
                    onChange={(
                      event
                    ) => {
                      setFooterMobileApp(
                        (
                          current
                        ) => ({
                          ...current,

                          googlePlayUrl:
                            event.target
                              .value,
                        })
                      );

                      markDirty();
                    }}
                    placeholder="https://..."
                    className="
                      h-[44px]
                      w-full
                      rounded-[10px]
                      border
                      border-[#dddddd]
                      px-4
                      text-[11px]
                      outline-none
                      focus:border-[#6f9a37]
                    "
                  />
                </div>
              </div>

              <div
                className="
                  space-y-4
                "
              >
                <ImageUploader
                  label="App Store Image"
                  image={
                    footerMobileApp
                      .appStoreImage
                  }
                  uploadKey="app-store"
                  uploadingKey={
                    uploadingKey
                  }
                  previewClassName="h-[100px]"
                  onUpload={(
                    file
                  ) =>
                    uploadImage(
                      file,
                      "app-store",
                      (path) =>
                        setFooterMobileApp(
                          (
                            current
                          ) => ({
                            ...current,

                            appStoreImage:
                              path,
                          })
                        )
                    )
                  }
                  onRemove={() => {
                    setFooterMobileApp(
                      (
                        current
                      ) => ({
                        ...current,

                        appStoreImage:
                          "",
                      })
                    );

                    markDirty();
                  }}
                />

                <div>
                  <FieldLabel>
                    App Store URL
                  </FieldLabel>

                  <input
                    value={
                      footerMobileApp
                        .appStoreUrl
                    }
                    onChange={(
                      event
                    ) => {
                      setFooterMobileApp(
                        (
                          current
                        ) => ({
                          ...current,

                          appStoreUrl:
                            event.target
                              .value,
                        })
                      );

                      markDirty();
                    }}
                    placeholder="https://..."
                    className="
                      h-[44px]
                      w-full
                      rounded-[10px]
                      border
                      border-[#dddddd]
                      px-4
                      text-[11px]
                      outline-none
                      focus:border-[#6f9a37]
                    "
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =================================
          FOOTER COLUMNS
      ================================= */}

      {activeTab ===
        "columns" && (
        <Card
          title="Footer Menu Columns"
          description="Create footer columns and manage every link without editing code."
          icon={Link2}
          action={
            <button
              type="button"
              onClick={
                addColumn
              }
              className="
                flex
                h-9
                items-center
                gap-2
                rounded-[9px]
                bg-[#6f9a37]
                px-4
                text-[9px]
                font-bold
                uppercase
                text-white
              "
            >
              <Plus
                size={13}
              />

              Add Column
            </button>
          }
        >
          <div
            className="
              space-y-5
            "
          >
            {footerColumns.map(
              (
                column,
                columnIndex
              ) => (
                <div
                  key={
                    column
                      ._clientId
                  }
                  className="
                    overflow-hidden
                    rounded-[14px]
                    border
                    border-[#e7e7e7]
                  "
                >
                  <div
                    className="
                      flex
                      flex-wrap
                      items-center
                      justify-between
                      gap-3
                      bg-[#fafafa]
                      p-4
                    "
                  >
                    <div
                      className="
                        flex
                        min-w-0
                        flex-1
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
                          rounded-[8px]
                          bg-white
                          text-[10px]
                          font-black
                          text-[#6f9a37]
                        "
                      >
                        {columnIndex +
                          1}
                      </div>

                      <input
                        value={
                          column.title
                        }
                        onChange={(
                          event
                        ) =>
                          updateColumn(
                            column
                              ._clientId,

                            "title",

                            event
                              .target
                              .value
                          )
                        }
                        className="
                          h-9
                          min-w-0
                          flex-1
                          rounded-[8px]
                          border
                          border-[#dddddd]
                          bg-white
                          px-3
                          text-[11px]
                          font-bold
                          outline-none
                          focus:border-[#6f9a37]
                        "
                      />
                    </div>

                    <div
                      className="
                        flex
                        items-center
                        gap-1.5
                      "
                    >
                      <Toggle
                        checked={
                          column
                            .isActive
                        }
                        onChange={(
                          value
                        ) =>
                          updateColumn(
                            column
                              ._clientId,

                            "isActive",

                            value
                          )
                        }
                      />

                      <button
                        type="button"
                        disabled={
                          columnIndex ===
                          0
                        }
                        onClick={() =>
                          moveColumn(
                            columnIndex,
                            "up"
                          )
                        }
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-[8px]
                          border
                          border-[#e2e2e2]
                          bg-white
                          text-[#777]
                          disabled:opacity-30
                        "
                      >
                        <ArrowUp
                          size={13}
                        />
                      </button>

                      <button
                        type="button"
                        disabled={
                          columnIndex ===
                          footerColumns.length -
                            1
                        }
                        onClick={() =>
                          moveColumn(
                            columnIndex,
                            "down"
                          )
                        }
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-[8px]
                          border
                          border-[#e2e2e2]
                          bg-white
                          text-[#777]
                          disabled:opacity-30
                        "
                      >
                        <ArrowDown
                          size={13}
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeColumn(
                            column
                              ._clientId
                          )
                        }
                        className="
                          flex
                          h-8
                          w-8
                          items-center
                          justify-center
                          rounded-[8px]
                          bg-red-50
                          text-red-500
                        "
                      >
                        <Trash2
                          size={13}
                        />
                      </button>
                    </div>
                  </div>

                  <div
                    className="
                      space-y-3
                      p-4
                    "
                  >
                    {column.links
                      .length ===
                    0 ? (
                      <div
                        className="
                          rounded-[10px]
                          border
                          border-dashed
                          border-[#dddddd]
                          px-4
                          py-8
                          text-center
                          text-[10px]
                          text-[#999]
                        "
                      >
                        No links
                        added to
                        this column.
                      </div>
                    ) : (
                      column.links.map(
                        (
                          link,
                          linkIndex
                        ) => (
                          <div
                            key={
                              link
                                ._clientId
                            }
                            className="
                              grid
                              grid-cols-1
                              gap-3
                              rounded-[11px]
                              border
                              border-[#eeeeee]
                              bg-[#fcfcfc]
                              p-3
                              xl:grid-cols-[1fr_1.4fr_auto_auto]
                              xl:items-end
                            "
                          >
                            <div>
                              <FieldLabel>
                                Link
                                Label
                              </FieldLabel>

                              <input
                                value={
                                  link.label
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateLink(
                                    column
                                      ._clientId,

                                    link
                                      ._clientId,

                                    "label",

                                    event
                                      .target
                                      .value
                                  )
                                }
                                className="
                                  h-[40px]
                                  w-full
                                  rounded-[8px]
                                  border
                                  border-[#dddddd]
                                  bg-white
                                  px-3
                                  text-[10px]
                                  outline-none
                                  focus:border-[#6f9a37]
                                "
                              />
                            </div>

                            <div>
                              <FieldLabel>
                                URL /
                                Route
                              </FieldLabel>

                              <input
                                value={
                                  link.url
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateLink(
                                    column
                                      ._clientId,

                                    link
                                      ._clientId,

                                    "url",

                                    event
                                      .target
                                      .value
                                  )
                                }
                                placeholder="/page/privacy-policy"
                                className="
                                  h-[40px]
                                  w-full
                                  rounded-[8px]
                                  border
                                  border-[#dddddd]
                                  bg-white
                                  px-3
                                  text-[10px]
                                  outline-none
                                  focus:border-[#6f9a37]
                                "
                              />
                            </div>

                            <div
                              className="
                                flex
                                items-center
                                gap-3
                                pb-1
                              "
                            >
                              <div
                                className="
                                  text-center
                                "
                              >
                                <div
                                  className="
                                    mb-1
                                    text-[7px]
                                    font-bold
                                    uppercase
                                    text-[#aaa]
                                  "
                                >
                                  Active
                                </div>

                                <Toggle
                                  checked={
                                    link
                                      .isActive
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateLink(
                                      column
                                        ._clientId,

                                      link
                                        ._clientId,

                                      "isActive",

                                      value
                                    )
                                  }
                                />
                              </div>

                              <div
                                className="
                                  text-center
                                "
                              >
                                <div
                                  className="
                                    mb-1
                                    text-[7px]
                                    font-bold
                                    uppercase
                                    text-[#aaa]
                                  "
                                >
                                  New Tab
                                </div>

                                <Toggle
                                  checked={
                                    link
                                      .openInNewTab
                                  }
                                  onChange={(
                                    value
                                  ) =>
                                    updateLink(
                                      column
                                        ._clientId,

                                      link
                                        ._clientId,

                                      "openInNewTab",

                                      value
                                    )
                                  }
                                />
                              </div>
                            </div>

                            <div
                              className="
                                flex
                                gap-1.5
                                pb-1
                              "
                            >
                              <button
                                type="button"
                                disabled={
                                  linkIndex ===
                                  0
                                }
                                onClick={() =>
                                  moveLink(
                                    column
                                      ._clientId,

                                    linkIndex,

                                    "up"
                                  )
                                }
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-[7px]
                                  border
                                  border-[#dddddd]
                                  bg-white
                                  disabled:opacity-30
                                "
                              >
                                <ArrowUp
                                  size={12}
                                />
                              </button>

                              <button
                                type="button"
                                disabled={
                                  linkIndex ===
                                  column.links
                                    .length -
                                    1
                                }
                                onClick={() =>
                                  moveLink(
                                    column
                                      ._clientId,

                                    linkIndex,

                                    "down"
                                  )
                                }
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-[7px]
                                  border
                                  border-[#dddddd]
                                  bg-white
                                  disabled:opacity-30
                                "
                              >
                                <ArrowDown
                                  size={12}
                                />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  removeLink(
                                    column
                                      ._clientId,

                                    link
                                      ._clientId
                                  )
                                }
                                className="
                                  flex
                                  h-8
                                  w-8
                                  items-center
                                  justify-center
                                  rounded-[7px]
                                  bg-red-50
                                  text-red-500
                                "
                              >
                                <Trash2
                                  size={12}
                                />
                              </button>
                            </div>
                          </div>
                        )
                      )
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        addLink(
                          column
                            ._clientId
                        )
                      }
                      className="
                        flex
                        h-9
                        items-center
                        gap-2
                        rounded-[9px]
                        border
                        border-[#dce7cf]
                        bg-[#f5f8f0]
                        px-4
                        text-[9px]
                        font-bold
                        uppercase
                        text-[#6f9a37]
                      "
                    >
                      <Plus
                        size={13}
                      />

                      Add Link
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>
      )}

      {/* =================================
          HOURS + SOCIAL
      ================================= */}

      {activeTab ===
        "hours" && (
        <div
          className="
            space-y-5
          "
        >
          <Card
            title="Opening Hours"
            description="Control the business hours shown in the footer."
            icon={Clock3}
            action={
              <Toggle
                checked={
                  showOpeningHours
                }
                onChange={(
                  value
                ) => {
                  setShowOpeningHours(
                    value
                  );

                  markDirty();
                }}
              />
            }
          >
            <div
              className="
                space-y-5
              "
            >
              <div>
                <FieldLabel>
                  Section Title
                </FieldLabel>

                <input
                  value={
                    openingHoursTitle
                  }
                  onChange={(
                    event
                  ) => {
                    setOpeningHoursTitle(
                      event.target
                        .value
                    );

                    markDirty();
                  }}
                  className="
                    h-[44px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    px-4
                    text-[11px]
                    outline-none
                    focus:border-[#6f9a37]
                  "
                />
              </div>

              {[
                {
                  labelKey:
                    "mondayThursdayLabel",

                  valueKey:
                    "mondayThursday",
                },

                {
                  labelKey:
                    "fridaySaturdayLabel",

                  valueKey:
                    "fridaySaturday",
                },

                {
                  labelKey:
                    "sundayLabel",

                  valueKey:
                    "sunday",
                },
              ].map(
                (
                  item,
                  index
                ) => (
                  <div
                    key={
                      item.valueKey
                    }
                    className="
                      grid
                      grid-cols-1
                      gap-3
                      rounded-[12px]
                      border
                      border-[#eeeeee]
                      bg-[#fafafa]
                      p-4
                      md:grid-cols-2
                    "
                  >
                    <div>
                      <FieldLabel>
                        Day Label{" "}
                        {index +
                          1}
                      </FieldLabel>

                      <input
                        value={
                          openingHours[
                            item
                              .labelKey
                          ]
                        }
                        onChange={(
                          event
                        ) => {
                          setOpeningHours(
                            (
                              current
                            ) => ({
                              ...current,

                              [item.labelKey]:
                                event
                                  .target
                                  .value,
                            })
                          );

                          markDirty();
                        }}
                        className="
                          h-[42px]
                          w-full
                          rounded-[9px]
                          border
                          border-[#dddddd]
                          bg-white
                          px-3
                          text-[10px]
                          outline-none
                          focus:border-[#6f9a37]
                        "
                      />
                    </div>

                    <div>
                      <FieldLabel>
                        Hours
                      </FieldLabel>

                      <input
                        value={
                          openingHours[
                            item
                              .valueKey
                          ]
                        }
                        onChange={(
                          event
                        ) => {
                          setOpeningHours(
                            (
                              current
                            ) => ({
                              ...current,

                              [item.valueKey]:
                                event
                                  .target
                                  .value,
                            })
                          );

                          markDirty();
                        }}
                        className="
                          h-[42px]
                          w-full
                          rounded-[9px]
                          border
                          border-[#dddddd]
                          bg-white
                          px-3
                          text-[10px]
                          outline-none
                          focus:border-[#6f9a37]
                        "
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          </Card>

          <Card
            title="Social Media"
            description="Manage the social icons displayed in the footer."
            icon={Link2}
            action={
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <Toggle
                  checked={
                    showFooterSocial
                  }
                  onChange={(
                    value
                  ) => {
                    setShowFooterSocial(
                      value
                    );

                    markDirty();
                  }}
                />

                <button
                  type="button"
                  onClick={
                    addSocial
                  }
                  className="
                    flex
                    h-9
                    items-center
                    gap-2
                    rounded-[9px]
                    bg-[#6f9a37]
                    px-4
                    text-[9px]
                    font-bold
                    uppercase
                    text-white
                  "
                >
                  <Plus
                    size={13}
                  />

                  Add Social
                </button>
              </div>
            }
          >
            <div>
              <div
                className="
                  mb-5
                "
              >
                <FieldLabel>
                  Social Section
                  Title
                </FieldLabel>

                <input
                  value={
                    footerSocialTitle
                  }
                  onChange={(
                    event
                  ) => {
                    setFooterSocialTitle(
                      event.target
                        .value
                    );

                    markDirty();
                  }}
                  className="
                    h-[44px]
                    w-full
                    rounded-[10px]
                    border
                    border-[#dddddd]
                    px-4
                    text-[11px]
                    outline-none
                    focus:border-[#6f9a37]
                  "
                />
              </div>

              <div
                className="
                  space-y-3
                "
              >
                {socialLinks.length ===
                0 ? (
                  <div
                    className="
                      rounded-[12px]
                      border
                      border-dashed
                      border-[#dddddd]
                      py-10
                      text-center
                      text-[10px]
                      text-[#999]
                    "
                  >
                    No social
                    links added.
                  </div>
                ) : (
                  socialLinks.map(
                    (
                      social,
                      index
                    ) => (
                      <div
                        key={
                          social
                            ._clientId
                        }
                        className="
                          grid
                          grid-cols-1
                          gap-3
                          rounded-[11px]
                          border
                          border-[#eeeeee]
                          bg-[#fafafa]
                          p-3
                          md:grid-cols-[180px_1fr_auto_auto]
                          md:items-end
                        "
                      >
                        <div>
                          <FieldLabel>
                            Platform
                          </FieldLabel>

                          <input
                            value={
                              social
                                .platform
                            }
                            onChange={(
                              event
                            ) =>
                              updateSocial(
                                social
                                  ._clientId,

                                "platform",

                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="Facebook"
                            className="
                              h-[40px]
                              w-full
                              rounded-[8px]
                              border
                              border-[#dddddd]
                              bg-white
                              px-3
                              text-[10px]
                              outline-none
                              focus:border-[#6f9a37]
                            "
                          />
                        </div>

                        <div>
                          <FieldLabel>
                            Profile URL
                          </FieldLabel>

                          <input
                            value={
                              social.url
                            }
                            onChange={(
                              event
                            ) =>
                              updateSocial(
                                social
                                  ._clientId,

                                "url",

                                event
                                  .target
                                  .value
                              )
                            }
                            placeholder="https://..."
                            className="
                              h-[40px]
                              w-full
                              rounded-[8px]
                              border
                              border-[#dddddd]
                              bg-white
                              px-3
                              text-[10px]
                              outline-none
                              focus:border-[#6f9a37]
                            "
                          />
                        </div>

                        <div
                          className="
                            pb-1
                          "
                        >
                          <FieldLabel>
                            Active
                          </FieldLabel>

                          <Toggle
                            checked={
                              social
                                .isActive
                            }
                            onChange={(
                              value
                            ) =>
                              updateSocial(
                                social
                                  ._clientId,

                                "isActive",

                                value
                              )
                            }
                          />
                        </div>

                        <div
                          className="
                            flex
                            items-end
                            gap-2
                            pb-1
                          "
                        >
                          <span
                            className="
                              text-[8px]
                              text-[#aaa]
                            "
                          >
                            #{index +
                              1}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeSocial(
                                social
                                  ._clientId
                              )
                            }
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-[8px]
                              bg-red-50
                              text-red-500
                            "
                          >
                            <Trash2
                              size={13}
                            />
                          </button>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* =================================
          STICKY STATUS
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

export default AdminFooterPage;