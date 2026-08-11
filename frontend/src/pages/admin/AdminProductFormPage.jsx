import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  Boxes,
  Check,
  ImageIcon,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Save,
  Sparkles,
  Star,
  Tags,
  Trash2,
  TrendingUp,
  UploadCloud,
  X,
} from "lucide-react";

import {
  getCategories,
  getImageUrl,
} from "../../services/api";

import {
  createAdminProduct,
  getAdminProductById,
  isAdminProductAuthError,
  updateAdminProduct,
} from "../../services/adminProducts";

import {
  deleteAdminImage,
  extractMultipleUploadedImages,
  extractSingleUploadedImage,
  getUploadFilenameFromUrl,
  isAdminUploadAuthError,
  uploadAdminMultipleImages,
  uploadAdminSingleImage,
  validateAdminImageFile,
} from "../../services/adminUploads";

import {
  useAdminAuth,
} from "../../context/AdminAuthContext";

// ========================================
// INITIAL PRODUCT FORM
// ========================================

const createInitialForm = () => ({
  name: "",
  slug: "",
  sku: "",
  barcode: "",
  brand: "",

  category: "",

  shortDescription: "",
  description: "",

  price: "",
  salePrice: "",
  costPrice: "",

  stock: "0",
  lowStockThreshold: "5",

  trackInventory: true,
  allowBackorder: false,

  unit: "piece",

  mainImage: "",

  isFeatured: false,
  isTrending: false,
  isNewArrival: false,
  isBestSeller: false,
  isDealOfDay: false,

  dealEndsAt: "",

  isActive: true,

  sortOrder: "0",

  metaTitle: "",
  metaDescription: "",
});

// ========================================
// EMPTY VARIANT
// ========================================

const createEmptyVariant = () => ({
  localId:
    `${Date.now()}-${Math.random()}`,

  name: "",
  sku: "",
  price: "",
  salePrice: "",
  stock: "0",
  isActive: true,
});

// ========================================
// SLUG
// ========================================

const createSlug = (value) => {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// ========================================
// DATETIME LOCAL
// ========================================

const toDateTimeLocal = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const pad = (number) =>
    String(number).padStart(
      2,
      "0"
    );

  return `${date.getFullYear()}-${pad(
    date.getMonth() + 1
  )}-${pad(
    date.getDate()
  )}T${pad(
    date.getHours()
  )}:${pad(
    date.getMinutes()
  )}`;
};

// ========================================
// SAFE NUMBER
// ========================================

const safeNumber = (
  value,
  fallback = 0
) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return fallback;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : fallback;
};

// ========================================
// NULLABLE NUMBER
// ========================================

const nullableNumber = (
  value
) => {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : null;
};

// ========================================
// CATEGORY HELPER
// ========================================

const extractCategories = (
  response
) => {
  if (
    Array.isArray(response)
  ) {
    return response;
  }

  if (
    Array.isArray(
      response?.categories
    )
  ) {
    return response.categories;
  }

  if (
    Array.isArray(
      response?.data?.categories
    )
  ) {
    return response.data
      .categories;
  }

  if (
    Array.isArray(
      response?.data
    )
  ) {
    return response.data;
  }

  return [];
};

// ========================================
// PRODUCT RESPONSE HELPER
// ========================================

const extractProductFromResponse = (
  response
) => {
  if (
    response?.product
  ) {
    return response.product;
  }

  if (
    response?.data?.product
  ) {
    return response.data.product;
  }

  if (
    response?.data?._id
  ) {
    return response.data;
  }

  if (
    response?._id
  ) {
    return response;
  }

  return null;
};

// ========================================
// IMAGE PREVIEW URL
// ========================================

const resolveImageUrl = (
  value
) => {
  if (!value) {
    return "";
  }

  try {
    return (
      getImageUrl(value) ||
      value
    );
  } catch {
    return value;
  }
};

// ========================================
// FIELD WRAPPER
// ========================================

const FormField = ({
  label,
  required = false,
  error = "",
  help = "",
  children,
}) => {
  return (
    <div>
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
        {label}

        {required && (
          <span
            className="
              ml-1
              text-red-500
            "
          >
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p
          className="
            mt-1.5
            text-[9px]
            text-red-500
          "
        >
          {error}
        </p>
      ) : help ? (
        <p
          className="
            mt-1.5
            text-[9px]
            leading-4
            text-[#999]
          "
        >
          {help}
        </p>
      ) : null}
    </div>
  );
};

// ========================================
// SECTION
// ========================================

const FormSection = ({
  title,
  description,
  icon: Icon,
  children,
}) => {
  return (
    <section
      className="
        overflow-hidden
        rounded-[16px]
        border
        border-[#e8e8e8]
        bg-white
      "
    >
      <div
        className="
          flex
          items-center
          gap-3
          border-b
          border-[#eeeeee]
          px-5
          py-4
        "
      >
        {Icon && (
          <div
            className="
              flex
              h-9
              w-9
              shrink-0
              items-center
              justify-center
              rounded-[9px]
              bg-[#f3f7ed]
              text-[var(--primary-color)]
            "
          >
            <Icon size={16} />
          </div>
        )}

        <div>
          <h3
            className="
              text-[13px]
              font-black
              text-[#222]
            "
          >
            {title}
          </h3>

          {description && (
            <p
              className="
                mt-0.5
                text-[9px]
                leading-4
                text-[#999]
              "
            >
              {description}
            </p>
          )}
        </div>
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
// TOGGLE
// ========================================

const ToggleOption = ({
  label,
  description,
  checked,
  onChange,
  icon: Icon,
}) => {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(!checked)
      }
      className={`
        flex
        w-full
        items-center
        gap-3
        rounded-[12px]
        border
        p-3
        text-left
        transition

        ${
          checked
            ? `
                border-[#dce8cc]
                bg-[#f5f8f0]
              `
            : `
                border-[#eeeeee]
                bg-white
                hover:bg-[#fafafa]
              `
        }
      `}
    >
      {Icon && (
        <span
          className={`
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-[9px]

            ${
              checked
                ? `
                    bg-white
                    text-[var(--primary-color)]
                  `
                : `
                    bg-[#f6f6f6]
                    text-[#999]
                  `
            }
          `}
        >
          <Icon size={16} />
        </span>
      )}

      <span
        className="
          min-w-0
          flex-1
        "
      >
        <span
          className="
            block
            text-[10px]
            font-bold
            text-[#444]
          "
        >
          {label}
        </span>

        {description && (
          <span
            className="
              mt-1
              block
              text-[8px]
              leading-4
              text-[#999]
            "
          >
            {description}
          </span>
        )}
      </span>

      <span
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition

          ${
            checked
              ? "bg-[var(--primary-color)]"
              : "bg-[#dddddd]"
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
            transition-all

            ${
              checked
                ? "left-[22px]"
                : "left-[3px]"
            }
          `}
        />
      </span>
    </button>
  );
};

// ========================================
// ADMIN PRODUCT FORM
// ========================================

const AdminProductFormPage =
  () => {
    const {
      id: productId,
    } = useParams();

    const navigate =
      useNavigate();

    const {
      setAdmin,
    } = useAdminAuth();

    const isEdit =
      Boolean(productId);

    const mainImageInputRef =
      useRef(null);

    const galleryInputRef =
      useRef(null);

    // ====================================
    // STATE
    // ====================================

    const [
      form,
      setForm,
    ] = useState(
      createInitialForm
    );

    const [
      categories,
      setCategories,
    ] = useState([]);

    const [
      variants,
      setVariants,
    ] = useState([]);

    const [
      galleryImages,
      setGalleryImages,
    ] = useState([]);

    const [
      tagsInput,
      setTagsInput,
    ] = useState("");

    const [
      mainImageIsNew,
      setMainImageIsNew,
    ] = useState(false);

    const [
      slugManuallyEdited,
      setSlugManuallyEdited,
    ] = useState(
      Boolean(productId)
    );

    const [
      loading,
      setLoading,
    ] = useState(
      Boolean(productId)
    );

    const [
      categoriesLoading,
      setCategoriesLoading,
    ] = useState(true);

    const [
      saving,
      setSaving,
    ] = useState(false);

    const [
      mainImageUploading,
      setMainImageUploading,
    ] = useState(false);

    const [
      galleryUploading,
      setGalleryUploading,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState("");

    const [
      fieldErrors,
      setFieldErrors,
    ] = useState({});

    // ====================================
    // INPUT CLASS
    // ====================================

    const inputClass = `
      h-[46px]
      w-full
      rounded-[10px]
      border
      border-[#dddddd]
      bg-white
      px-3.5
      text-[11px]
      text-[#333]
      outline-none
      transition
      placeholder:text-[#aaa]
      focus:border-[var(--primary-color)]
    `;

    const textareaClass = `
      w-full
      rounded-[10px]
      border
      border-[#dddddd]
      bg-white
      px-3.5
      py-3
      text-[11px]
      leading-6
      text-[#333]
      outline-none
      transition
      placeholder:text-[#aaa]
      focus:border-[var(--primary-color)]
    `;

    // ====================================
    // AUTH FAILURE
    // ====================================

    const handleAuthFailure =
      useCallback(
        (requestError) => {
          if (
            !isAdminProductAuthError(
              requestError
            ) &&
            !isAdminUploadAuthError(
              requestError
            )
          ) {
            return false;
          }

          setAdmin(null);

          navigate(
            "/admin/login",
            {
              replace: true,

              state: {
                from: isEdit
                  ? `/admin/products/${productId}/edit`
                  : "/admin/products/new",
              },
            }
          );

          return true;
        },
        [
          isEdit,
          navigate,
          productId,
          setAdmin,
        ]
      );

    // ====================================
    // LOAD CATEGORIES
    // ====================================

    useEffect(() => {
      let cancelled = false;

      const loadCategories =
        async () => {
          try {
            setCategoriesLoading(
              true
            );

            const response =
              await getCategories();

            if (!cancelled) {
              setCategories(
                extractCategories(
                  response
                )
              );
            }
          } catch (requestError) {
            console.error(
              "Category Load Error:",
              requestError
            );

            if (!cancelled) {
              setCategories([]);
            }
          } finally {
            if (!cancelled) {
              setCategoriesLoading(
                false
              );
            }
          }
        };

      loadCategories();

      return () => {
        cancelled = true;
      };
    }, []);

    // ====================================
    // LOAD PRODUCT FOR EDIT
    // ====================================

    useEffect(() => {
      if (!productId) {
        setLoading(false);
        return;
      }

      let cancelled = false;

      const loadProduct =
        async () => {
          try {
            setLoading(true);
            setError("");

            const response =
              await getAdminProductById(
                productId
              );

            if (cancelled) {
              return;
            }

            const product =
              extractProductFromResponse(
                response
              );

            if (!product) {
              throw new Error(
                "Product could not be found."
              );
            }

            setForm({
              name:
                product.name || "",

              slug:
                product.slug || "",

              sku:
                product.sku || "",

              barcode:
                product.barcode || "",

              brand:
                product.brand || "",

              category:
                typeof product.category ===
                "object"
                  ? product.category
                      ?._id || ""
                  : product.category ||
                    "",

              shortDescription:
                product.shortDescription ||
                "",

              description:
                product.description ||
                "",

              price:
                product.price ??
                "",

              salePrice:
                product.salePrice ??
                "",

              costPrice:
                product.costPrice ??
                0,

              stock:
                product.stock ??
                0,

              lowStockThreshold:
                product.lowStockThreshold ??
                5,

              trackInventory:
                product.trackInventory !==
                false,

              allowBackorder:
                Boolean(
                  product.allowBackorder
                ),

              unit:
                product.unit ||
                "piece",

              mainImage:
                product.mainImage ||
                "",

              isFeatured:
                Boolean(
                  product.isFeatured
                ),

              isTrending:
                Boolean(
                  product.isTrending
                ),

              isNewArrival:
                Boolean(
                  product.isNewArrival
                ),

              isBestSeller:
                Boolean(
                  product.isBestSeller
                ),

              isDealOfDay:
                Boolean(
                  product.isDealOfDay
                ),

              dealEndsAt:
                toDateTimeLocal(
                  product.dealEndsAt
                ),

              isActive:
                product.isActive !==
                false,

              sortOrder:
                product.sortOrder ??
                0,

              metaTitle:
                product.metaTitle ||
                "",

              metaDescription:
                product.metaDescription ||
                "",
            });

            setTagsInput(
              Array.isArray(
                product.tags
              )
                ? product.tags.join(
                    ", "
                  )
                : ""
            );

            setGalleryImages(
              Array.isArray(
                product.images
              )
                ? product.images.map(
                    (image) => ({
                      _id:
                        image._id,

                      url:
                        image.url ||
                        "",

                      alt:
                        image.alt ||
                        "",

                      isNew:
                        false,
                    })
                  )
                : []
            );

            setVariants(
              Array.isArray(
                product.variants
              )
                ? product.variants.map(
                    (
                      variant,
                      index
                    ) => ({
                      localId:
                        variant._id ||
                        `${Date.now()}-${index}`,

                      name:
                        variant.name ||
                        "",

                      sku:
                        variant.sku ||
                        "",

                      price:
                        variant.price ??
                        "",

                      salePrice:
                        variant.salePrice ??
                        "",

                      stock:
                        variant.stock ??
                        0,

                      isActive:
                        variant.isActive !==
                        false,
                    })
                  )
                : []
            );

            setMainImageIsNew(
              false
            );

            setSlugManuallyEdited(
              true
            );
          } catch (requestError) {
            console.error(
              "Product Load Error:",
              requestError
            );

            if (
              handleAuthFailure(
                requestError
              )
            ) {
              return;
            }

            setError(
              requestError?.message ||
                "Unable to load product."
            );
          } finally {
            if (!cancelled) {
              setLoading(false);
            }
          }
        };

      loadProduct();

      return () => {
        cancelled = true;
      };
    }, [
      handleAuthFailure,
      productId,
    ]);

    // ====================================
    // UPDATE FIELD
    // ====================================

    const updateField =
      (name, value) => {
        setForm(
          (current) => ({
            ...current,
            [name]: value,
          })
        );

        setFieldErrors(
          (current) => ({
            ...current,
            [name]: "",
          })
        );
      };

    // ====================================
    // NAME CHANGE
    // ====================================

    const handleNameChange = (
      event
    ) => {
      const value =
        event.target.value;

      setForm(
        (current) => ({
          ...current,

          name: value,

          ...(!slugManuallyEdited
            ? {
                slug:
                  createSlug(
                    value
                  ),
              }
            : {}),
        })
      );

      setFieldErrors(
        (current) => ({
          ...current,
          name: "",
          slug: "",
        })
      );
    };

    // ====================================
    // SLUG CHANGE
    // ====================================

    const handleSlugChange = (
      event
    ) => {
      setSlugManuallyEdited(
        true
      );

      updateField(
        "slug",
        createSlug(
          event.target.value
        )
      );
    };

    // ====================================
    // SKU
    // ====================================

    const handleSkuChange = (
      event
    ) => {
      updateField(
        "sku",
        event.target.value
          .toUpperCase()
      );
    };

    // ====================================
    // MAIN IMAGE UPLOAD
    // ====================================

    const handleMainImageUpload =
      async (event) => {
        const file =
          event.target
            .files?.[0];

        event.target.value =
          "";

        if (!file) {
          return;
        }

        const validation =
          validateAdminImageFile(
            file
          );

        if (
          !validation.valid
        ) {
          setError(
            validation.message
          );
          return;
        }

        try {
          setMainImageUploading(
            true
          );

          setError("");

          const response =
            await uploadAdminSingleImage(
              file
            );

          const uploaded =
            extractSingleUploadedImage(
              response
            );

          if (
            !uploaded?.url
          ) {
            throw new Error(
              "Image uploaded but no image URL was returned."
            );
          }

          // Previous unsaved upload cleanup.
          if (
            mainImageIsNew &&
            form.mainImage
          ) {
            const filename =
              getUploadFilenameFromUrl(
                form.mainImage
              );

            if (filename) {
              try {
                await deleteAdminImage(
                  filename
                );
              } catch (
                cleanupError
              ) {
                console.warn(
                  "Old temporary main image cleanup failed:",
                  cleanupError
                );
              }
            }
          }

          updateField(
            "mainImage",
            uploaded.url
          );

          setMainImageIsNew(
            true
          );
        } catch (requestError) {
          console.error(
            "Main Image Upload Error:",
            requestError
          );

          if (
            handleAuthFailure(
              requestError
            )
          ) {
            return;
          }

          setError(
            requestError?.message ||
              "Main image could not be uploaded."
          );
        } finally {
          setMainImageUploading(
            false
          );
        }
      };

    // ====================================
    // REMOVE MAIN IMAGE
    // ====================================

    const handleRemoveMainImage =
      async () => {
        const currentImage =
          form.mainImage;

        updateField(
          "mainImage",
          ""
        );

        if (
          mainImageIsNew &&
          currentImage
        ) {
          const filename =
            getUploadFilenameFromUrl(
              currentImage
            );

          if (filename) {
            try {
              await deleteAdminImage(
                filename
              );
            } catch (
              cleanupError
            ) {
              console.warn(
                "Temporary image cleanup failed:",
                cleanupError
              );
            }
          }
        }

        setMainImageIsNew(
          false
        );
      };

    // ====================================
    // GALLERY UPLOAD
    // ====================================

    const handleGalleryUpload =
      async (event) => {
        const files =
          Array.from(
            event.target.files ||
              []
          );

        event.target.value =
          "";

        if (
          files.length === 0
        ) {
          return;
        }

        if (
          galleryImages.length +
            files.length >
          10
        ) {
          setError(
            "A product can contain a maximum of 10 gallery images."
          );
          return;
        }

        for (const file of files) {
          const validation =
            validateAdminImageFile(
              file
            );

          if (
            !validation.valid
          ) {
            setError(
              `${file.name}: ${validation.message}`
            );

            return;
          }
        }

        try {
          setGalleryUploading(
            true
          );

          setError("");

          const response =
            await uploadAdminMultipleImages(
              files
            );

          const uploadedImages =
            extractMultipleUploadedImages(
              response
            );

          if (
            uploadedImages.length ===
            0
          ) {
            throw new Error(
              "Images uploaded but no image URLs were returned."
            );
          }

          setGalleryImages(
            (current) => [
              ...current,

              ...uploadedImages.map(
                (
                  image,
                  index
                ) => ({
                  localId:
                    `${Date.now()}-${index}`,

                  url:
                    image.url,

                  alt: "",

                  isNew: true,
                })
              ),
            ]
          );
        } catch (requestError) {
          console.error(
            "Gallery Upload Error:",
            requestError
          );

          if (
            handleAuthFailure(
              requestError
            )
          ) {
            return;
          }

          setError(
            requestError?.message ||
              "Gallery images could not be uploaded."
          );
        } finally {
          setGalleryUploading(
            false
          );
        }
      };

    // ====================================
    // REMOVE GALLERY IMAGE
    // ====================================

    const removeGalleryImage =
      async (index) => {
        const image =
          galleryImages[
            index
          ];

        setGalleryImages(
          (current) =>
            current.filter(
              (_, itemIndex) =>
                itemIndex !==
                index
            )
        );

        // Only physically delete images
        // uploaded during this unsaved session.
        if (
          image?.isNew &&
          image?.url
        ) {
          const filename =
            getUploadFilenameFromUrl(
              image.url
            );

          if (filename) {
            try {
              await deleteAdminImage(
                filename
              );
            } catch (
              cleanupError
            ) {
              console.warn(
                "Temporary gallery cleanup failed:",
                cleanupError
              );
            }
          }
        }
      };

    // ====================================
    // GALLERY ALT
    // ====================================

    const updateGalleryAlt = (
      index,
      value
    ) => {
      setGalleryImages(
        (current) =>
          current.map(
            (
              image,
              itemIndex
            ) =>
              itemIndex === index
                ? {
                    ...image,
                    alt: value,
                  }
                : image
          )
      );
    };

    // ====================================
    // VARIANTS
    // ====================================

    const addVariant = () => {
      setVariants(
        (current) => [
          ...current,
          createEmptyVariant(),
        ]
      );
    };

    const removeVariant = (
      index
    ) => {
      setVariants(
        (current) =>
          current.filter(
            (_, itemIndex) =>
              itemIndex !==
              index
          )
      );
    };

    const updateVariant = (
      index,
      field,
      value
    ) => {
      setVariants(
        (current) =>
          current.map(
            (
              variant,
              itemIndex
            ) =>
              itemIndex === index
                ? {
                    ...variant,

                    [field]:
                      field ===
                      "sku"
                        ? String(
                            value
                          ).toUpperCase()
                        : value,
                  }
                : variant
          )
      );
    };

    // ====================================
    // VALIDATE
    // ====================================

    const validateForm = () => {
      const errors = {};

      if (
        !form.name.trim()
      ) {
        errors.name =
          "Product name is required.";
      }

      if (
        !form.slug.trim()
      ) {
        errors.slug =
          "Product slug is required.";
      }

      if (
        !form.sku.trim()
      ) {
        errors.sku =
          "Product SKU is required.";
      }

      if (!form.category) {
        errors.category =
          "Product category is required.";
      }

      const price =
        Number(form.price);

      if (
        form.price === "" ||
        !Number.isFinite(
          price
        ) ||
        price < 0
      ) {
        errors.price =
          "Enter a valid product price.";
      }

      const salePrice =
        nullableNumber(
          form.salePrice
        );

      if (
        form.salePrice !==
          "" &&
        (salePrice === null ||
          salePrice < 0)
      ) {
        errors.salePrice =
          "Enter a valid sale price.";
      }

      if (
        salePrice !== null &&
        Number.isFinite(
          price
        ) &&
        salePrice >= price
      ) {
        errors.salePrice =
          "Sale price should be lower than regular price.";
      }

      if (
        safeNumber(
          form.costPrice
        ) < 0
      ) {
        errors.costPrice =
          "Cost price cannot be negative.";
      }

      if (
        safeNumber(
          form.stock
        ) < 0
      ) {
        errors.stock =
          "Stock cannot be negative.";
      }

      if (
        safeNumber(
          form.lowStockThreshold
        ) < 0
      ) {
        errors.lowStockThreshold =
          "Low stock threshold cannot be negative.";
      }

      variants.forEach(
        (
          variant,
          index
        ) => {
          if (
            !String(
              variant.name
            ).trim()
          ) {
            errors[
              `variant-name-${index}`
            ] =
              "Variant name is required.";
          }

          if (
            variant.price ===
              "" ||
            safeNumber(
              variant.price,
              -1
            ) < 0
          ) {
            errors[
              `variant-price-${index}`
            ] =
              "Valid price is required.";
          }

          const variantSale =
            nullableNumber(
              variant.salePrice
            );

          if (
            variantSale !==
              null &&
            variantSale >=
              safeNumber(
                variant.price
              )
          ) {
            errors[
              `variant-sale-${index}`
            ] =
              "Sale price should be lower than price.";
          }

          if (
            safeNumber(
              variant.stock
            ) < 0
          ) {
            errors[
              `variant-stock-${index}`
            ] =
              "Stock cannot be negative.";
          }
        }
      );

      setFieldErrors(
        errors
      );

      return (
        Object.keys(
          errors
        ).length === 0
      );
    };

    // ====================================
    // PAYLOAD
    // ====================================

    const buildPayload =
      () => {
        const tags =
          tagsInput
            .split(",")
            .map((tag) =>
              tag.trim()
            )
            .filter(Boolean);

        const uniqueTags = [
          ...new Set(tags),
        ];

        return {
          name:
            form.name.trim(),

          slug:
            createSlug(
              form.slug
            ),

          sku:
            form.sku
              .trim()
              .toUpperCase(),

          barcode:
            form.barcode.trim(),

          brand:
            form.brand.trim(),

          category:
            form.category,

          shortDescription:
            form.shortDescription.trim(),

          description:
            form.description,

          price:
            safeNumber(
              form.price
            ),

          salePrice:
            nullableNumber(
              form.salePrice
            ),

          costPrice:
            safeNumber(
              form.costPrice
            ),

          stock:
            safeNumber(
              form.stock
            ),

          lowStockThreshold:
            safeNumber(
              form.lowStockThreshold,
              5
            ),

          trackInventory:
            Boolean(
              form.trackInventory
            ),

          allowBackorder:
            Boolean(
              form.allowBackorder
            ),

          unit:
            form.unit.trim() ||
            "piece",

          mainImage:
            form.mainImage,

          images:
            galleryImages
              .filter(
                (image) =>
                  image.url
              )
              .map(
                (image) => ({
                  url:
                    image.url,

                  alt:
                    String(
                      image.alt ||
                        ""
                    ).trim(),
                })
              ),

          variants:
            variants.map(
              (variant) => ({
                name:
                  String(
                    variant.name
                  ).trim(),

                sku:
                  String(
                    variant.sku ||
                      ""
                  )
                    .trim()
                    .toUpperCase(),

                price:
                  safeNumber(
                    variant.price
                  ),

                salePrice:
                  nullableNumber(
                    variant.salePrice
                  ),

                stock:
                  safeNumber(
                    variant.stock
                  ),

                isActive:
                  variant.isActive !==
                  false,
              })
            ),

          tags:
            uniqueTags,

          isFeatured:
            Boolean(
              form.isFeatured
            ),

          isTrending:
            Boolean(
              form.isTrending
            ),

          isNewArrival:
            Boolean(
              form.isNewArrival
            ),

          isBestSeller:
            Boolean(
              form.isBestSeller
            ),

          isDealOfDay:
            Boolean(
              form.isDealOfDay
            ),

          dealEndsAt:
            form.isDealOfDay &&
            form.dealEndsAt
              ? new Date(
                  form.dealEndsAt
                ).toISOString()
              : null,

          isActive:
            Boolean(
              form.isActive
            ),

          sortOrder:
            safeNumber(
              form.sortOrder
            ),

          metaTitle:
            form.metaTitle.trim(),

          metaDescription:
            form.metaDescription.trim(),
        };
      };

    // ====================================
    // SAVE
    // ====================================

    const handleSubmit =
      async (event) => {
        event.preventDefault();

        setError("");

        if (
          !validateForm()
        ) {
          setError(
            "Please correct the highlighted fields before saving."
          );

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });

          return;
        }

        try {
          setSaving(true);

          const payload =
            buildPayload();

          if (isEdit) {
            await updateAdminProduct(
              productId,
              payload
            );
          } else {
            await createAdminProduct(
              payload
            );
          }

          navigate(
            "/admin/products",
            {
              replace: true,
            }
          );
        } catch (requestError) {
          console.error(
            "Save Product Error:",
            requestError
          );

          if (
            handleAuthFailure(
              requestError
            )
          ) {
            return;
          }

          setError(
            requestError?.message ||
              "Product could not be saved."
          );

          window.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        } finally {
          setSaving(false);
        }
      };

    // ====================================
    // SELLING PRICE PREVIEW
    // ====================================

    const sellingPrice =
      useMemo(() => {
        const price =
          safeNumber(
            form.price
          );

        const salePrice =
          nullableNumber(
            form.salePrice
          );

        if (
          salePrice !== null &&
          salePrice >= 0 &&
          salePrice < price
        ) {
          return salePrice;
        }

        return price;
      }, [
        form.price,
        form.salePrice,
      ]);

    // ====================================
    // PAGE LOADING
    // ====================================

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
              size={28}
              className="
                mx-auto
                animate-spin
                text-[var(--primary-color)]
              "
            />

            <p
              className="
                mt-3
                text-[10px]
                font-semibold
                text-[#888]
              "
            >
              Loading product...
            </p>
          </div>
        </div>
      );
    }

    // ====================================
    // PAGE
    // ====================================

    return (
      <form
        onSubmit={
          handleSubmit
        }
        className="
          space-y-5
        "
      >
        {/* ===============================
            PAGE HEADER
        =============================== */}

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
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
              className="
                mb-3
                inline-flex
                items-center
                gap-1.5
                text-[9px]
                font-bold
                uppercase
                text-[#888]
                transition
                hover:text-[var(--primary-color)]
              "
            >
              <ArrowLeft
                size={13}
              />

              Back to Products
            </button>

            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-[var(--primary-color)]
              "
            >
              Product Management
            </div>

            <h2
              className="
                mt-2
                text-[27px]
                font-black
                text-[#222]
              "
            >
              {isEdit
                ? "Edit Product"
                : "Add New Product"}
            </h2>

            <p
              className="
                mt-2
                text-[11px]
                leading-6
                text-[#888]
              "
            >
              {isEdit
                ? "Update product information, inventory, images and store visibility."
                : "Create a new product for your online store."}
            </p>
          </div>

          <div
            className="
              flex
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                navigate(
                  "/admin/products"
                )
              }
              disabled={saving}
              className="
                h-[43px]
                rounded-[10px]
                border
                border-[#dddddd]
                bg-white
                px-5
                text-[9px]
                font-bold
                uppercase
                text-[#555]
                transition
                hover:bg-[#f7f7f7]
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                mainImageUploading ||
                galleryUploading
              }
              className="
                flex
                h-[43px]
                items-center
                justify-center
                gap-2
                rounded-[10px]
                bg-[#282828]
                px-6
                text-[9px]
                font-bold
                uppercase
                tracking-[0.04em]
                text-white
                transition
                hover:bg-[var(--primary-color)]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {saving ? (
                <>
                  <Loader2
                    size={14}
                    className="
                      animate-spin
                    "
                  />

                  Saving...
                </>
              ) : (
                <>
                  <Save
                    size={14}
                  />

                  {isEdit
                    ? "Save Changes"
                    : "Create Product"}
                </>
              )}
            </button>
          </div>
        </section>

        {/* ===============================
            ERROR
        =============================== */}

        {error && (
          <div
            className="
              flex
              items-start
              gap-3
              rounded-[13px]
              border
              border-red-100
              bg-red-50
              p-4
            "
          >
            <AlertTriangle
              size={17}
              className="
                mt-0.5
                shrink-0
                text-red-500
              "
            />

            <p
              className="
                flex-1
                text-[10px]
                leading-5
                text-red-600
              "
            >
              {error}
            </p>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="
                text-red-400
              "
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* ===============================
            MAIN GRID
        =============================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            xl:grid-cols-[minmax(0,1fr)_330px]
          "
        >
          {/* =============================
              LEFT COLUMN
          ============================= */}

          <div
            className="
              space-y-5
            "
          >
            {/* BASIC INFORMATION */}

            <FormSection
              title="Basic Information"
              description="Product identity and category."
              icon={Package}
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                "
              >
                <div
                  className="
                    md:col-span-2
                  "
                >
                  <FormField
                    label="Product Name"
                    required
                    error={
                      fieldErrors.name
                    }
                  >
                    <input
                      type="text"
                      value={
                        form.name
                      }
                      onChange={
                        handleNameChange
                      }
                      placeholder="Premium Cooking Oil"
                      className={
                        inputClass
                      }
                    />
                  </FormField>
                </div>

                <FormField
                  label="Slug"
                  required
                  error={
                    fieldErrors.slug
                  }
                  help="Used in the product page URL."
                >
                  <input
                    type="text"
                    value={
                      form.slug
                    }
                    onChange={
                      handleSlugChange
                    }
                    placeholder="premium-cooking-oil"
                    className={
                      inputClass
                    }
                  />
                </FormField>

                <FormField
                  label="SKU"
                  required
                  error={
                    fieldErrors.sku
                  }
                >
                  <input
                    type="text"
                    value={
                      form.sku
                    }
                    onChange={
                      handleSkuChange
                    }
                    placeholder="OIL-001"
                    className={
                      inputClass
                    }
                  />
                </FormField>

                <FormField
                  label="Category"
                  required
                  error={
                    fieldErrors.category
                  }
                >
                  <select
                    value={
                      form.category
                    }
                    disabled={
                      categoriesLoading
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "category",
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "Select category"}
                    </option>

                    {categories.map(
                      (
                        category
                      ) => (
                        <option
                          key={
                            category._id
                          }
                          value={
                            category._id
                          }
                        >
                          {
                            category.name
                          }
                        </option>
                      )
                    )}
                  </select>
                </FormField>

                <FormField
                  label="Brand"
                >
                  <input
                    type="text"
                    value={
                      form.brand
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "brand",
                        event.target
                          .value
                      )
                    }
                    placeholder="Brand name"
                    className={
                      inputClass
                    }
                  />
                </FormField>

                <FormField
                  label="Barcode"
                >
                  <input
                    type="text"
                    value={
                      form.barcode
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "barcode",
                        event.target
                          .value
                      )
                    }
                    placeholder="Barcode"
                    className={
                      inputClass
                    }
                  />
                </FormField>

                <FormField
                  label="Unit"
                  help="piece, kg, bottle, pack, box etc."
                >
                  <input
                    type="text"
                    list="product-unit-options"
                    value={
                      form.unit
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "unit",
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  />

                  <datalist
                    id="product-unit-options"
                  >
                    <option value="piece" />
                    <option value="kg" />
                    <option value="gram" />
                    <option value="litre" />
                    <option value="ml" />
                    <option value="bottle" />
                    <option value="pack" />
                    <option value="box" />
                    <option value="dozen" />
                  </datalist>
                </FormField>
              </div>
            </FormSection>

            {/* DESCRIPTION */}

            <FormSection
              title="Description"
              description="Content displayed on the product page."
              icon={Tags}
            >
              <div
                className="
                  space-y-4
                "
              >
                <FormField
                  label="Short Description"
                >
                  <textarea
                    rows={3}
                    value={
                      form.shortDescription
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "shortDescription",
                        event.target
                          .value
                      )
                    }
                    placeholder="Short summary of the product..."
                    className={
                      textareaClass
                    }
                  />
                </FormField>

                <FormField
                  label="Full Description"
                >
                  <textarea
                    rows={8}
                    value={
                      form.description
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "description",
                        event.target
                          .value
                      )
                    }
                    placeholder="Complete product description..."
                    className={
                      textareaClass
                    }
                  />
                </FormField>
              </div>
            </FormSection>

            {/* PRICING */}

            <FormSection
              title="Pricing"
              description="Regular, sale and internal cost price."
              icon={BadgeCheck}
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-3
                "
              >
                <FormField
                  label="Regular Price"
                  required
                  error={
                    fieldErrors.price
                  }
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.price
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "price",
                        event.target
                          .value
                      )
                    }
                    placeholder="0"
                    className={
                      inputClass
                    }
                  />
                </FormField>

                <FormField
                  label="Sale Price"
                  error={
                    fieldErrors.salePrice
                  }
                  help="Leave empty when there is no sale."
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.salePrice
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "salePrice",
                        event.target
                          .value
                      )
                    }
                    placeholder="Optional"
                    className={
                      inputClass
                    }
                  />
                </FormField>

                <FormField
                  label="Cost Price"
                  error={
                    fieldErrors.costPrice
                  }
                  help="Admin use only."
                >
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      form.costPrice
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "costPrice",
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </FormField>
              </div>

              <div
                className="
                  mt-4
                  rounded-[11px]
                  bg-[#f8f8f8]
                  px-4
                  py-3
                "
              >
                <span
                  className="
                    text-[9px]
                    text-[#999]
                  "
                >
                  Current selling
                  price:
                </span>

                <strong
                  className="
                    ml-2
                    text-[11px]
                    text-[#333]
                  "
                >
                  Rs.{" "}
                  {sellingPrice.toLocaleString(
                    "en-PK"
                  )}
                </strong>
              </div>
            </FormSection>

            {/* INVENTORY */}

            <FormSection
              title="Inventory"
              description="Stock tracking and availability settings."
              icon={Boxes}
            >
              <div
                className="
                  grid
                  grid-cols-1
                  gap-4
                  md:grid-cols-2
                "
              >
                <FormField
                  label="Stock"
                  error={
                    fieldErrors.stock
                  }
                >
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.stock
                    }
                    disabled={
                      !form.trackInventory
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "stock",
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </FormField>

                <FormField
                  label="Low Stock Threshold"
                  error={
                    fieldErrors.lowStockThreshold
                  }
                >
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      form.lowStockThreshold
                    }
                    disabled={
                      !form.trackInventory
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "lowStockThreshold",
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </FormField>
              </div>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-3
                  md:grid-cols-2
                "
              >
                <ToggleOption
                  label="Track Inventory"
                  description="Track available product quantity."
                  checked={
                    form.trackInventory
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "trackInventory",
                      value
                    )
                  }
                  icon={Boxes}
                />

                <ToggleOption
                  label="Allow Backorder"
                  description="Allow ordering when stock reaches zero."
                  checked={
                    form.allowBackorder
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "allowBackorder",
                      value
                    )
                  }
                  icon={Package}
                />
              </div>
            </FormSection>

            {/* IMAGES */}

            <FormSection
              title="Product Images"
              description="Upload the main product image and gallery."
              icon={ImageIcon}
            >
              {/* MAIN IMAGE */}

              <div>
                <div
                  className="
                    mb-3
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.05em]
                    text-[#555]
                  "
                >
                  Main Image
                </div>

                <input
                  ref={
                    mainImageInputRef
                  }
                  type="file"
                  accept="image/*"
                  onChange={
                    handleMainImageUpload
                  }
                  className="hidden"
                />

                {form.mainImage ? (
                  <div
                    className="
                      flex
                      flex-col
                      gap-4
                      rounded-[14px]
                      border
                      border-[#eeeeee]
                      p-4
                      sm:flex-row
                      sm:items-center
                    "
                  >
                    <div
                      className="
                        h-28
                        w-28
                        shrink-0
                        overflow-hidden
                        rounded-[12px]
                        border
                        border-[#eeeeee]
                        bg-[#f8f8f8]
                      "
                    >
                      <img
                        src={resolveImageUrl(
                          form.mainImage
                        )}
                        alt={
                          form.name ||
                          "Main product"
                        }
                        className="
                          h-full
                          w-full
                          object-cover
                        "
                      />
                    </div>

                    <div
                      className="
                        flex-1
                      "
                    >
                      <div
                        className="
                          text-[10px]
                          font-bold
                          text-[#333]
                        "
                      >
                        Main product
                        image
                      </div>

                      <p
                        className="
                          mt-1
                          break-all
                          text-[8px]
                          leading-4
                          text-[#999]
                        "
                      >
                        {
                          form.mainImage
                        }
                      </p>

                      <div
                        className="
                          mt-3
                          flex
                          flex-wrap
                          gap-2
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            mainImageInputRef.current?.click()
                          }
                          disabled={
                            mainImageUploading
                          }
                          className="
                            h-9
                            rounded-[9px]
                            border
                            border-[#dddddd]
                            px-3
                            text-[8px]
                            font-bold
                            uppercase
                            text-[#555]
                          "
                        >
                          Replace
                        </button>

                        <button
                          type="button"
                          onClick={
                            handleRemoveMainImage
                          }
                          disabled={
                            mainImageUploading
                          }
                          className="
                            h-9
                            rounded-[9px]
                            bg-red-50
                            px-3
                            text-[8px]
                            font-bold
                            uppercase
                            text-red-500
                          "
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      mainImageInputRef.current?.click()
                    }
                    disabled={
                      mainImageUploading
                    }
                    className="
                      flex
                      min-h-[160px]
                      w-full
                      flex-col
                      items-center
                      justify-center
                      rounded-[14px]
                      border
                      border-dashed
                      border-[#d8d8d8]
                      bg-[#fafafa]
                      px-5
                      text-center
                      transition
                      hover:border-[var(--primary-color)]
                    "
                  >
                    {mainImageUploading ? (
                      <Loader2
                        size={25}
                        className="
                          animate-spin
                          text-[var(--primary-color)]
                        "
                      />
                    ) : (
                      <UploadCloud
                        size={26}
                        className="
                          text-[var(--primary-color)]
                        "
                      />
                    )}

                    <div
                      className="
                        mt-3
                        text-[10px]
                        font-bold
                        text-[#444]
                      "
                    >
                      {mainImageUploading
                        ? "Uploading..."
                        : "Upload Main Image"}
                    </div>

                    <p
                      className="
                        mt-1
                        text-[8px]
                        text-[#999]
                      "
                    >
                      Select an image
                      from your computer.
                    </p>
                  </button>
                )}
              </div>

              {/* GALLERY */}

              <div
                className="
                  mt-7
                  border-t
                  border-[#eeeeee]
                  pt-6
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <div>
                    <div
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-[0.05em]
                        text-[#555]
                      "
                    >
                      Gallery Images
                    </div>

                    <p
                      className="
                        mt-1
                        text-[8px]
                        text-[#999]
                      "
                    >
                      Up to 10 gallery
                      images.
                    </p>
                  </div>

                  <input
                    ref={
                      galleryInputRef
                    }
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      handleGalleryUpload
                    }
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      galleryInputRef.current?.click()
                    }
                    disabled={
                      galleryUploading ||
                      galleryImages.length >=
                        10
                    }
                    className="
                      flex
                      h-9
                      items-center
                      gap-1.5
                      rounded-[9px]
                      border
                      border-[#dddddd]
                      px-3
                      text-[8px]
                      font-bold
                      uppercase
                      text-[#555]
                      disabled:opacity-50
                    "
                  >
                    {galleryUploading ? (
                      <Loader2
                        size={13}
                        className="
                          animate-spin
                        "
                      />
                    ) : (
                      <ImagePlus
                        size={13}
                      />
                    )}

                    Add Images
                  </button>
                </div>

                {galleryImages.length ===
                0 ? (
                  <div
                    className="
                      mt-4
                      rounded-[12px]
                      bg-[#fafafa]
                      px-4
                      py-8
                      text-center
                      text-[9px]
                      text-[#999]
                    "
                  >
                    No gallery images
                    added.
                  </div>
                ) : (
                  <div
                    className="
                      mt-4
                      grid
                      grid-cols-1
                      gap-3
                      md:grid-cols-2
                    "
                  >
                    {galleryImages.map(
                      (
                        image,
                        index
                      ) => (
                        <div
                          key={
                            image._id ||
                            image.localId ||
                            `${image.url}-${index}`
                          }
                          className="
                            rounded-[12px]
                            border
                            border-[#eeeeee]
                            p-3
                          "
                        >
                          <div
                            className="
                              flex
                              gap-3
                            "
                          >
                            <div
                              className="
                                h-20
                                w-20
                                shrink-0
                                overflow-hidden
                                rounded-[9px]
                                bg-[#f7f7f7]
                              "
                            >
                              <img
                                src={resolveImageUrl(
                                  image.url
                                )}
                                alt={
                                  image.alt ||
                                  form.name ||
                                  "Product"
                                }
                                className="
                                  h-full
                                  w-full
                                  object-cover
                                "
                              />
                            </div>

                            <div
                              className="
                                min-w-0
                                flex-1
                              "
                            >
                              <input
                                type="text"
                                value={
                                  image.alt
                                }
                                onChange={(
                                  event
                                ) =>
                                  updateGalleryAlt(
                                    index,
                                    event.target
                                      .value
                                  )
                                }
                                placeholder="Image alt text"
                                className="
                                  h-9
                                  w-full
                                  rounded-[8px]
                                  border
                                  border-[#dddddd]
                                  px-3
                                  text-[9px]
                                  outline-none
                                  focus:border-[var(--primary-color)]
                                "
                              />

                              <button
                                type="button"
                                onClick={() =>
                                  removeGalleryImage(
                                    index
                                  )
                                }
                                className="
                                  mt-2
                                  flex
                                  items-center
                                  gap-1
                                  text-[8px]
                                  font-bold
                                  uppercase
                                  text-red-500
                                "
                              >
                                <Trash2
                                  size={11}
                                />

                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </FormSection>

            {/* VARIANTS */}

            <FormSection
              title="Product Variants"
              description="Optional sizes, weights, packs or other variations."
              icon={Boxes}
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <p
                  className="
                    text-[9px]
                    text-[#999]
                  "
                >
                  {variants.length}{" "}
                  variant
                  {variants.length ===
                  1
                    ? ""
                    : "s"}{" "}
                  added
                </p>

                <button
                  type="button"
                  onClick={
                    addVariant
                  }
                  className="
                    flex
                    h-9
                    items-center
                    gap-1.5
                    rounded-[9px]
                    border
                    border-[#dddddd]
                    px-3
                    text-[8px]
                    font-bold
                    uppercase
                    text-[#555]
                    transition
                    hover:border-[var(--primary-color)]
                    hover:text-[var(--primary-color)]
                  "
                >
                  <Plus size={13} />

                  Add Variant
                </button>
              </div>

              {variants.length ===
              0 ? (
                <div
                  className="
                    mt-4
                    rounded-[12px]
                    bg-[#fafafa]
                    px-4
                    py-8
                    text-center
                    text-[9px]
                    text-[#999]
                  "
                >
                  This product has no
                  variants.
                </div>
              ) : (
                <div
                  className="
                    mt-4
                    space-y-3
                  "
                >
                  {variants.map(
                    (
                      variant,
                      index
                    ) => (
                      <div
                        key={
                          variant.localId
                        }
                        className="
                          rounded-[13px]
                          border
                          border-[#e8e8e8]
                          p-4
                        "
                      >
                        <div
                          className="
                            mb-4
                            flex
                            items-center
                            justify-between
                          "
                        >
                          <div
                            className="
                              text-[10px]
                              font-black
                              text-[#333]
                            "
                          >
                            Variant{" "}
                            {index + 1}
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeVariant(
                                index
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

                        <div
                          className="
                            grid
                            grid-cols-1
                            gap-3
                            md:grid-cols-2
                            xl:grid-cols-3
                          "
                        >
                          <FormField
                            label="Variant Name"
                            required
                            error={
                              fieldErrors[
                                `variant-name-${index}`
                              ]
                            }
                          >
                            <input
                              type="text"
                              value={
                                variant.name
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "name",
                                  event.target
                                    .value
                                )
                              }
                              placeholder="1kg"
                              className={
                                inputClass
                              }
                            />
                          </FormField>

                          <FormField
                            label="Variant SKU"
                          >
                            <input
                              type="text"
                              value={
                                variant.sku
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "sku",
                                  event.target
                                    .value
                                )
                              }
                              placeholder="OIL-1KG"
                              className={
                                inputClass
                              }
                            />
                          </FormField>

                          <FormField
                            label="Price"
                            required
                            error={
                              fieldErrors[
                                `variant-price-${index}`
                              ]
                            }
                          >
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                variant.price
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "price",
                                  event.target
                                    .value
                                )
                              }
                              className={
                                inputClass
                              }
                            />
                          </FormField>

                          <FormField
                            label="Sale Price"
                            error={
                              fieldErrors[
                                `variant-sale-${index}`
                              ]
                            }
                          >
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                variant.salePrice
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "salePrice",
                                  event.target
                                    .value
                                )
                              }
                              className={
                                inputClass
                              }
                            />
                          </FormField>

                          <FormField
                            label="Stock"
                            error={
                              fieldErrors[
                                `variant-stock-${index}`
                              ]
                            }
                          >
                            <input
                              type="number"
                              min="0"
                              step="1"
                              value={
                                variant.stock
                              }
                              onChange={(
                                event
                              ) =>
                                updateVariant(
                                  index,
                                  "stock",
                                  event.target
                                    .value
                                )
                              }
                              className={
                                inputClass
                              }
                            />
                          </FormField>

                          <div
                            className="
                              flex
                              items-end
                            "
                          >
                            <ToggleOption
                              label="Active"
                              description="Available to customers."
                              checked={
                                variant.isActive
                              }
                              onChange={(
                                value
                              ) =>
                                updateVariant(
                                  index,
                                  "isActive",
                                  value
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </FormSection>

            {/* TAGS */}

            <FormSection
              title="Tags"
              description="Comma-separated product keywords."
              icon={Tags}
            >
              <FormField
                label="Product Tags"
                help="Example: oil, grocery, cooking"
              >
                <input
                  type="text"
                  value={
                    tagsInput
                  }
                  onChange={(
                    event
                  ) =>
                    setTagsInput(
                      event.target
                        .value
                    )
                  }
                  placeholder="oil, grocery, cooking"
                  className={
                    inputClass
                  }
                />
              </FormField>
            </FormSection>

            {/* SEO */}

            <FormSection
              title="Search Engine Optimization"
              description="Optional metadata for search engines."
              icon={Sparkles}
            >
              <div
                className="
                  space-y-4
                "
              >
                <FormField
                  label="Meta Title"
                >
                  <input
                    type="text"
                    value={
                      form.metaTitle
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "metaTitle",
                        event.target
                          .value
                      )
                    }
                    placeholder="SEO page title"
                    className={
                      inputClass
                    }
                  />
                </FormField>

                <FormField
                  label="Meta Description"
                >
                  <textarea
                    rows={4}
                    value={
                      form.metaDescription
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "metaDescription",
                        event.target
                          .value
                      )
                    }
                    placeholder="SEO page description..."
                    className={
                      textareaClass
                    }
                  />
                </FormField>
              </div>
            </FormSection>
          </div>

          {/* =============================
              RIGHT COLUMN
          ============================= */}

          <aside
            className="
              space-y-5
            "
          >
            {/* STATUS */}

            <FormSection
              title="Product Status"
              description="Control product visibility."
              icon={Check}
            >
              <ToggleOption
                label="Active Product"
                description="Customers can see and purchase this product."
                checked={
                  form.isActive
                }
                onChange={(
                  value
                ) =>
                  updateField(
                    "isActive",
                    value
                  )
                }
                icon={Check}
              />

              <div
                className="
                  mt-4
                "
              >
                <FormField
                  label="Sort Order"
                  help="Lower numbers appear first where sorting uses this field."
                >
                  <input
                    type="number"
                    value={
                      form.sortOrder
                    }
                    onChange={(
                      event
                    ) =>
                      updateField(
                        "sortOrder",
                        event.target
                          .value
                      )
                    }
                    className={
                      inputClass
                    }
                  />
                </FormField>
              </div>
            </FormSection>

            {/* PAGE17 */}

            <FormSection
              title="Homepage Sections"
              description="Control Page17 homepage product sections."
              icon={Star}
            >
              <div
                className="
                  space-y-2
                "
              >
                <ToggleOption
                  label="Featured"
                  description="Show in featured product areas."
                  checked={
                    form.isFeatured
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "isFeatured",
                      value
                    )
                  }
                  icon={Star}
                />

                <ToggleOption
                  label="Trending"
                  description="Show in Trending Products."
                  checked={
                    form.isTrending
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "isTrending",
                      value
                    )
                  }
                  icon={
                    TrendingUp
                  }
                />

                <ToggleOption
                  label="New Arrival"
                  description="Mark as a new arrival."
                  checked={
                    form.isNewArrival
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "isNewArrival",
                      value
                    )
                  }
                  icon={
                    Sparkles
                  }
                />

                <ToggleOption
                  label="Best Seller"
                  description="Mark product as a best seller."
                  checked={
                    form.isBestSeller
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "isBestSeller",
                      value
                    )
                  }
                  icon={
                    BadgeCheck
                  }
                />

                <ToggleOption
                  label="Deal of the Day"
                  description="Include in Deal of the Day section."
                  checked={
                    form.isDealOfDay
                  }
                  onChange={(
                    value
                  ) =>
                    updateField(
                      "isDealOfDay",
                      value
                    )
                  }
                  icon={Tags}
                />
              </div>

              {form.isDealOfDay && (
                <div
                  className="
                    mt-4
                  "
                >
                  <FormField
                    label="Deal Ends At"
                  >
                    <input
                      type="datetime-local"
                      value={
                        form.dealEndsAt
                      }
                      onChange={(
                        event
                      ) =>
                        updateField(
                          "dealEndsAt",
                          event.target
                            .value
                        )
                      }
                      className={
                        inputClass
                      }
                    />
                  </FormField>
                </div>
              )}
            </FormSection>

            {/* SUMMARY */}

            <FormSection
              title="Product Summary"
              description="Review before saving."
              icon={Package}
            >
              <div
                className="
                  space-y-3
                  text-[10px]
                "
              >
                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    border-b
                    border-[#eeeeee]
                    pb-3
                  "
                >
                  <span
                    className="
                      text-[#999]
                    "
                  >
                    Name
                  </span>

                  <strong
                    className="
                      max-w-[170px]
                      truncate
                      text-[#333]
                    "
                  >
                    {form.name ||
                      "—"}
                  </strong>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    border-b
                    border-[#eeeeee]
                    pb-3
                  "
                >
                  <span
                    className="
                      text-[#999]
                    "
                  >
                    SKU
                  </span>

                  <strong
                    className="
                      text-[#333]
                    "
                  >
                    {form.sku ||
                      "—"}
                  </strong>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    border-b
                    border-[#eeeeee]
                    pb-3
                  "
                >
                  <span
                    className="
                      text-[#999]
                    "
                  >
                    Selling Price
                  </span>

                  <strong
                    className="
                      text-[#333]
                    "
                  >
                    Rs.{" "}
                    {sellingPrice.toLocaleString(
                      "en-PK"
                    )}
                  </strong>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    border-b
                    border-[#eeeeee]
                    pb-3
                  "
                >
                  <span
                    className="
                      text-[#999]
                    "
                  >
                    Stock
                  </span>

                  <strong
                    className="
                      text-[#333]
                    "
                  >
                    {form.trackInventory
                      ? safeNumber(
                          form.stock
                        )
                      : "Not tracked"}
                  </strong>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                  "
                >
                  <span
                    className="
                      text-[#999]
                    "
                  >
                    Variants
                  </span>

                  <strong
                    className="
                      text-[#333]
                    "
                  >
                    {
                      variants.length
                    }
                  </strong>
                </div>
              </div>
            </FormSection>
          </aside>
        </div>

        {/* ===============================
            BOTTOM ACTIONS
        =============================== */}

        <div
          className="
            flex
            flex-col
            justify-end
            gap-2
            rounded-[14px]
            border
            border-[#e8e8e8]
            bg-white
            p-4
            sm:flex-row
          "
        >
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            disabled={saving}
            className="
              h-[44px]
              rounded-[10px]
              border
              border-[#dddddd]
              px-5
              text-[9px]
              font-bold
              uppercase
              text-[#555]
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={
              saving ||
              mainImageUploading ||
              galleryUploading
            }
            className="
              flex
              h-[44px]
              items-center
              justify-center
              gap-2
              rounded-[10px]
              bg-[#282828]
              px-6
              text-[9px]
              font-bold
              uppercase
              text-white
              transition
              hover:bg-[var(--primary-color)]
              disabled:opacity-60
            "
          >
            {saving ? (
              <>
                <Loader2
                  size={14}
                  className="
                    animate-spin
                  "
                />

                Saving...
              </>
            ) : (
              <>
                <Save
                  size={14}
                />

                {isEdit
                  ? "Save Changes"
                  : "Create Product"}
              </>
            )}
          </button>
        </div>
      </form>
    );
  };

export default AdminProductFormPage;