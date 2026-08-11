import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Edit3,
  ExternalLink,
  Filter,
  ImageOff,
  Package,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  Tags,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  deleteAdminProduct,
  extractProductPagination,
  extractProducts,
  getAdminProducts,
  isAdminProductAuthError,
  updateAdminProductStock,
} from "../../services/adminProducts";

import {
  getCategories,
  getImageUrl,
} from "../../services/api";

import {
  useAdminAuth,
} from "../../context/AdminAuthContext";

import {
  useSite,
} from "../../context/SiteContext";

// ========================================
// DEFAULT FILTERS
// ========================================

const DEFAULT_FILTERS = {
  search: "",
  category: "",
  stock: "",
  status: "",
  page: 1,
  limit: 10,
};

// ========================================
// SAFE NUMBER
// ========================================

const safeNumber = (
  value,
  fallback = 0
) => {
  const number =
    Number(value);

  return Number.isFinite(
    number
  )
    ? number
    : fallback;
};

// ========================================
// CATEGORY RESPONSE HELPER
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
// CATEGORY NAME
// ========================================

const getCategoryName = (
  product,
  categories
) => {
  if (
    product?.category &&
    typeof product.category ===
      "object"
  ) {
    return (
      product.category.name ||
      "Uncategorized"
    );
  }

  const categoryId =
    String(
      product?.category || ""
    );

  const category =
    categories.find(
      (item) =>
        String(item?._id) ===
        categoryId
    );

  return (
    category?.name ||
    "Uncategorized"
  );
};

// ========================================
// STOCK STATUS
//
// Product model کے virtual stockStatus
// کے مطابق same logic.
// ========================================

const getProductStockStatus = (
  product
) => {
  if (
    product?.trackInventory ===
    false
  ) {
    return {
      key: "in-stock",
      label: "In Stock",
      className:
        "border-green-100 bg-green-50 text-green-700",
    };
  }

  const stock =
    safeNumber(
      product?.stock
    );

  const threshold =
    safeNumber(
      product?.lowStockThreshold,
      5
    );

  if (stock <= 0) {
    if (
      product?.allowBackorder
    ) {
      return {
        key: "backorder",
        label: "Backorder",
        className:
          "border-blue-100 bg-blue-50 text-blue-700",
      };
    }

    return {
      key: "out-of-stock",
      label: "Out of Stock",
      className:
        "border-red-100 bg-red-50 text-red-600",
    };
  }

  if (
    stock <= threshold
  ) {
    return {
      key: "low-stock",
      label: "Low Stock",
      className:
        "border-amber-100 bg-amber-50 text-amber-700",
    };
  }

  return {
    key: "in-stock",
    label: "In Stock",
    className:
      "border-green-100 bg-green-50 text-green-700",
  };
};

// ========================================
// PRICE
// ========================================

const getSellingPrice = (
  product
) => {
  const price =
    safeNumber(
      product?.price
    );

  const salePrice =
    product?.salePrice ===
      null ||
    product?.salePrice ===
      undefined ||
    product?.salePrice ===
      ""
      ? null
      : safeNumber(
          product.salePrice
        );

  if (
    salePrice !== null &&
    salePrice >= 0 &&
    salePrice < price
  ) {
    return {
      current:
        salePrice,
      original:
        price,
      onSale: true,
    };
  }

  return {
    current: price,
    original: null,
    onSale: false,
  };
};

// ========================================
// PRODUCT IMAGE
// ========================================

const ProductImage = ({
  product,
}) => {
  const [failed, setFailed] =
    useState(false);

  const imageUrl =
    product?.mainImage
      ? getImageUrl(
          product.mainImage
        )
      : "";

  if (
    !imageUrl ||
    failed
  ) {
    return (
      <div
        className="
          flex
          h-12
          w-12
          shrink-0
          items-center
          justify-center
          rounded-[10px]
          bg-[#f5f5f5]
          text-[#aaa]
        "
      >
        <ImageOff
          size={17}
        />
      </div>
    );
  }

  return (
    <div
      className="
        h-12
        w-12
        shrink-0
        overflow-hidden
        rounded-[10px]
        border
        border-[#eeeeee]
        bg-[#f8f8f8]
      "
    >
      <img
        src={imageUrl}
        alt={
          product?.name ||
          "Product"
        }
        onError={() =>
          setFailed(true)
        }
        className="
          h-full
          w-full
          object-cover
        "
      />
    </div>
  );
};

// ========================================
// STOCK BADGE
// ========================================

const StockBadge = ({
  product,
}) => {
  const status =
    getProductStockStatus(
      product
    );

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-[8px]
        font-bold
        uppercase
        tracking-[0.04em]

        ${status.className}
      `}
    >
      {status.label}
    </span>
  );
};

// ========================================
// FEATURE BADGE
// ========================================

const FeatureBadge = ({
  active,
  icon: Icon,
  label,
}) => {
  if (!active) {
    return null;
  }

  return (
    <span
      className="
        inline-flex
        items-center
        gap-1
        rounded-full
        border
        border-[#e7ebdf]
        bg-[#f4f7ef]
        px-2
        py-1
        text-[7px]
        font-bold
        uppercase
        tracking-[0.04em]
        text-[var(--primary-color)]
      "
    >
      <Icon size={9} />

      {label}
    </span>
  );
};

// ========================================
// DELETE MODAL
// ========================================

const DeleteProductModal = ({
  product,
  deleting,
  onCancel,
  onConfirm,
}) => {
  if (!product) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        py-8
      "
    >
      <div
        className="
          w-full
          max-w-[450px]
          rounded-[18px]
          border
          border-[#eeeeee]
          bg-white
          p-6
          shadow-[0_25px_80px_rgba(0,0,0,0.18)]
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-red-500
            "
          >
            <Trash2
              size={20}
            />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-[#888]
              transition
              hover:bg-[#f5f5f5]
              hover:text-[#222]
            "
          >
            <X size={18} />
          </button>
        </div>

        <h3
          className="
            mt-5
            text-[20px]
            font-black
            text-[#222]
          "
        >
          Delete product?
        </h3>

        <p
          className="
            mt-2
            text-[11px]
            leading-6
            text-[#777]
          "
        >
          You are about to delete{" "}
          <strong
            className="
              text-[#333]
            "
          >
            {product.name}
          </strong>
          . This action cannot be
          undone.
        </p>

        <div
          className="
            mt-6
            flex
            justify-end
            gap-2
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="
              h-[42px]
              rounded-[10px]
              border
              border-[#dddddd]
              bg-white
              px-5
              text-[10px]
              font-bold
              uppercase
              text-[#555]
              transition
              hover:bg-[#f7f7f7]
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="
              flex
              h-[42px]
              items-center
              justify-center
              gap-2
              rounded-[10px]
              bg-red-600
              px-5
              text-[10px]
              font-bold
              uppercase
              text-white
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {deleting ? (
              <>
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                  "
                />

                Deleting...
              </>
            ) : (
              <>
                <Trash2
                  size={14}
                />

                Delete
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================================
// STOCK MODAL
// ========================================

const StockModal = ({
  product,
  saving,
  onCancel,
  onSave,
}) => {
  const [
    stock,
    setStock,
  ] = useState(
    product?.stock ?? 0
  );

  useEffect(() => {
    setStock(
      product?.stock ?? 0
    );
  }, [product]);

  if (!product) {
    return null;
  }

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const number =
      Number(stock);

    if (
      !Number.isFinite(number) ||
      number < 0
    ) {
      return;
    }

    onSave(number);
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        px-4
        py-8
      "
    >
      <form
        onSubmit={
          handleSubmit
        }
        className="
          w-full
          max-w-[430px]
          rounded-[18px]
          border
          border-[#eeeeee]
          bg-white
          p-6
          shadow-[0_25px_80px_rgba(0,0,0,0.18)]
        "
      >
        <div
          className="
            flex
            items-start
            justify-between
            gap-4
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-[#f3f7ed]
              text-[var(--primary-color)]
            "
          >
            <Boxes
              size={21}
            />
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              text-[#888]
              hover:bg-[#f5f5f5]
            "
          >
            <X size={18} />
          </button>
        </div>

        <h3
          className="
            mt-5
            text-[20px]
            font-black
            text-[#222]
          "
        >
          Update Stock
        </h3>

        <p
          className="
            mt-2
            text-[11px]
            leading-5
            text-[#777]
          "
        >
          {product.name}
        </p>

        <div
          className="
            mt-5
          "
        >
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
            Available Stock
          </label>

          <input
            type="number"
            min="0"
            step="1"
            value={stock}
            onChange={(event) =>
              setStock(
                event.target.value
              )
            }
            className="
              h-[48px]
              w-full
              rounded-[10px]
              border
              border-[#dddddd]
              bg-white
              px-4
              text-[13px]
              text-[#333]
              outline-none
              transition
              focus:border-[var(--primary-color)]
            "
          />

          <p
            className="
              mt-2
              text-[9px]
              text-[#999]
            "
          >
            Low stock threshold:{" "}
            {safeNumber(
              product.lowStockThreshold,
              5
            )}
          </p>
        </div>

        <div
          className="
            mt-6
            flex
            justify-end
            gap-2
          "
        >
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="
              h-[42px]
              rounded-[10px]
              border
              border-[#dddddd]
              px-5
              text-[10px]
              font-bold
              uppercase
              text-[#555]
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="
              flex
              h-[42px]
              items-center
              justify-center
              gap-2
              rounded-[10px]
              bg-[#282828]
              px-5
              text-[10px]
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
                <span
                  className="
                    h-4
                    w-4
                    animate-spin
                    rounded-full
                    border-2
                    border-white/30
                    border-t-white
                  "
                />

                Saving...
              </>
            ) : (
              "Update Stock"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// ========================================
// ADMIN PRODUCTS PAGE
// ========================================

const AdminProductsPage =
  () => {
    const navigate =
      useNavigate();

    const {
      setAdmin,
    } = useAdminAuth();

    const {
      formatPrice,
    } = useSite();

    // ====================================
    // STATE
    // ====================================

    const [
      products,
      setProducts,
    ] = useState([]);

    const [
      categories,
      setCategories,
    ] = useState([]);

    const [
      filters,
      setFilters,
    ] = useState(
      DEFAULT_FILTERS
    );

    const [
      searchInput,
      setSearchInput,
    ] = useState("");

    const [
      loading,
      setLoading,
    ] = useState(true);

    const [
      refreshing,
      setRefreshing,
    ] = useState(false);

    const [
      error,
      setError,
    ] = useState("");

    const [
      deleteTarget,
      setDeleteTarget,
    ] = useState(null);

    const [
      deleting,
      setDeleting,
    ] = useState(false);

    const [
      stockTarget,
      setStockTarget,
    ] = useState(null);

    const [
      savingStock,
      setSavingStock,
    ] = useState(false);

    const [
      pagination,
      setPagination,
    ] = useState({
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    });

    // ====================================
    // FORMAT PRICE
    // ====================================

    const formatMoney =
      useCallback(
        (value) => {
          const amount =
            safeNumber(value);

          if (
            typeof formatPrice ===
            "function"
          ) {
            return formatPrice(
              amount
            );
          }

          return `Rs. ${amount.toLocaleString(
            "en-PK"
          )}`;
        },
        [formatPrice]
      );

    // ====================================
    // LOAD CATEGORIES
    // ====================================

    useEffect(() => {
      let cancelled = false;

      const loadCategories =
        async () => {
          try {
            const response =
              await getCategories();

            if (!cancelled) {
              setCategories(
                extractCategories(
                  response
                )
              );
            }
          } catch (err) {
            console.error(
              "Admin Categories Load Error:",
              err
            );

            if (!cancelled) {
              setCategories([]);
            }
          }
        };

      loadCategories();

      return () => {
        cancelled = true;
      };
    }, []);

    // ====================================
    // SEARCH DEBOUNCE
    // ====================================

    useEffect(() => {
      const timer =
        window.setTimeout(
          () => {
            setFilters(
              (current) => ({
                ...current,
                search:
                  searchInput.trim(),
                page: 1,
              })
            );
          },
          400
        );

      return () =>
        window.clearTimeout(
          timer
        );
    }, [searchInput]);

    // ====================================
    // LOAD PRODUCTS
    // ====================================

    const loadProducts =
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

            setError("");

            const params = {
              page:
                filters.page,

              limit:
                filters.limit,

              search:
                filters.search,

              category:
                filters.category,

              isActive:
                filters.status,
            };

            const response =
              await getAdminProducts(
                params
              );

            let rows =
              extractProducts(
                response
              );

            // ----------------------------
            // STOCK FILTER
            //
            // Backend اگر stock filter
            // support نہ بھی کرے تو current
            // response پر filter لگ جائے گا.
            // ----------------------------

            if (
              filters.stock
            ) {
              rows =
                rows.filter(
                  (product) =>
                    getProductStockStatus(
                      product
                    ).key ===
                    filters.stock
                );
            }

            setProducts(rows);

            setPagination(
              extractProductPagination(
                response,
                filters.limit
              )
            );
          } catch (err) {
            console.error(
              "Admin Products Load Error:",
              err
            );

            if (
              isAdminProductAuthError(
                err
              )
            ) {
              setAdmin(null);

              navigate(
                "/admin/login",
                {
                  replace: true,
                  state: {
                    from:
                      "/admin/products",
                  },
                }
              );

              return;
            }

            setProducts([]);

            setError(
              err?.message ||
                "Unable to load products."
            );
          } finally {
            setLoading(false);
            setRefreshing(false);
          }
        },
        [
          filters,
          navigate,
          setAdmin,
        ]
      );

    useEffect(() => {
      loadProducts();
    }, [loadProducts]);

    // ====================================
    // FILTER CHANGE
    // ====================================

    const updateFilter =
      (key) =>
      (event) => {
        setFilters(
          (current) => ({
            ...current,
            [key]:
              event.target.value,
            page: 1,
          })
        );
      };

    // ====================================
    // RESET FILTERS
    // ====================================

    const resetFilters = () => {
      setSearchInput("");

      setFilters({
        ...DEFAULT_FILTERS,
      });
    };

    const hasFilters =
      Boolean(
        searchInput ||
          filters.category ||
          filters.stock ||
          filters.status
      );

    // ====================================
    // DELETE PRODUCT
    // ====================================

    const handleDelete =
      async () => {
        if (
          !deleteTarget?._id
        ) {
          return;
        }

        try {
          setDeleting(true);

          await deleteAdminProduct(
            deleteTarget._id
          );

          setDeleteTarget(
            null
          );

          await loadProducts({
            silent: true,
          });
        } catch (err) {
          console.error(
            "Delete Product Error:",
            err
          );

          if (
            isAdminProductAuthError(
              err
            )
          ) {
            setAdmin(null);

            navigate(
              "/admin/login",
              {
                replace: true,
                state: {
                  from:
                    "/admin/products",
                },
              }
            );

            return;
          }

          setError(
            err?.message ||
              "Product could not be deleted."
          );
        } finally {
          setDeleting(false);
        }
      };

    // ====================================
    // UPDATE STOCK
    // ====================================

    const handleSaveStock =
      async (stock) => {
        if (
          !stockTarget?._id
        ) {
          return;
        }

        try {
          setSavingStock(true);

          await updateAdminProductStock(
            stockTarget._id,
            {
              stock,
            }
          );

          setStockTarget(null);

          await loadProducts({
            silent: true,
          });
        } catch (err) {
          console.error(
            "Update Stock Error:",
            err
          );

          if (
            isAdminProductAuthError(
              err
            )
          ) {
            setAdmin(null);

            navigate(
              "/admin/login",
              {
                replace: true,
                state: {
                  from:
                    "/admin/products",
                },
              }
            );

            return;
          }

          setError(
            err?.message ||
              "Stock could not be updated."
          );
        } finally {
          setSavingStock(false);
        }
      };

    // ====================================
    // PAGE
    // ====================================

    return (
      <div
        className="
          space-y-5
        "
      >
        {/* ===============================
            HEADER
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
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-[0.15em]
                text-[var(--primary-color)]
              "
            >
              Store Management
            </div>

            <h2
              className="
                mt-2
                text-[26px]
                font-black
                text-[#222]
                sm:text-[29px]
              "
            >
              Products
            </h2>

            <p
              className="
                mt-2
                text-[11px]
                leading-6
                text-[#888]
              "
            >
              Manage your product
              catalog, prices,
              inventory and homepage
              visibility.
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
              onClick={() =>
                loadProducts({
                  silent: true,
                })
              }
              disabled={
                refreshing
              }
              className="
                flex
                h-[42px]
                items-center
                gap-2
                rounded-[10px]
                border
                border-[#e2e2e2]
                bg-white
                px-4
                text-[9px]
                font-bold
                uppercase
                tracking-[0.04em]
                text-[#555]
                transition
                hover:bg-[#f8f8f8]
                disabled:opacity-60
              "
            >
              <RefreshCw
                size={14}
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <Link
              to="/admin/products/new"
              aria-label="Add new product"
              className="
                flex
                h-[42px]
                min-w-[132px]
                items-center
                justify-center
                gap-2
                rounded-[10px]
                px-5
                text-[10px]
                font-black
                uppercase
                tracking-[0.04em]
                shadow-sm
                transition
                duration-200
                hover:brightness-95
                focus:outline-none
                focus:ring-2
                focus:ring-[#6f9a37]/25
              "
              style={{
                backgroundColor:
                  "#6f9a37",
                color:
                  "#ffffff",
              }}
            >
              <Plus
                size={15}
                strokeWidth={2.5}
                color="#ffffff"
              />

              <span
                style={{
                  color:
                    "#ffffff",
                }}
              >
                Add Product
              </span>
            </Link>
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
              rounded-[12px]
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

            <div
              className="
                flex-1
                text-[10px]
                leading-5
                text-red-600
              "
            >
              {error}
            </div>

            <button
              type="button"
              onClick={() =>
                setError("")
              }
              className="
                text-red-400
              "
            >
              <X
                size={15}
              />
            </button>
          </div>
        )}

        {/* ===============================
            FILTERS
        =============================== */}

        <section
          className="
            rounded-[16px]
            border
            border-[#e8e8e8]
            bg-white
            p-4
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-3
              md:grid-cols-2
              xl:grid-cols-[1.5fr_1fr_1fr_1fr_auto]
            "
          >
            {/* SEARCH */}

            <div
              className="
                relative
              "
            >
              <Search
                size={15}
                className="
                  absolute
                  left-3.5
                  top-1/2
                  -translate-y-1/2
                  text-[#aaa]
                "
              />

              <input
                type="text"
                value={
                  searchInput
                }
                onChange={(event) =>
                  setSearchInput(
                    event.target.value
                  )
                }
                placeholder="Search products, SKU, brand..."
                className="
                  h-[42px]
                  w-full
                  rounded-[10px]
                  border
                  border-[#dddddd]
                  bg-white
                  pl-10
                  pr-4
                  text-[10px]
                  text-[#444]
                  outline-none
                  transition
                  focus:border-[var(--primary-color)]
                "
              />
            </div>

            {/* CATEGORY */}

            <select
              value={
                filters.category
              }
              onChange={updateFilter(
                "category"
              )}
              className="
                h-[42px]
                rounded-[10px]
                border
                border-[#dddddd]
                bg-white
                px-3
                text-[10px]
                text-[#555]
                outline-none
              "
            >
              <option value="">
                All Categories
              </option>

              {categories.map(
                (category) => (
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

            {/* STOCK */}

            <select
              value={
                filters.stock
              }
              onChange={updateFilter(
                "stock"
              )}
              className="
                h-[42px]
                rounded-[10px]
                border
                border-[#dddddd]
                bg-white
                px-3
                text-[10px]
                text-[#555]
                outline-none
              "
            >
              <option value="">
                All Stock
              </option>

              <option value="in-stock">
                In Stock
              </option>

              <option value="low-stock">
                Low Stock
              </option>

              <option value="out-of-stock">
                Out of Stock
              </option>

              <option value="backorder">
                Backorder
              </option>
            </select>

            {/* STATUS */}

            <select
              value={
                filters.status
              }
              onChange={updateFilter(
                "status"
              )}
              className="
                h-[42px]
                rounded-[10px]
                border
                border-[#dddddd]
                bg-white
                px-3
                text-[10px]
                text-[#555]
                outline-none
              "
            >
              <option value="">
                All Status
              </option>

              <option value="true">
                Active
              </option>

              <option value="false">
                Inactive
              </option>
            </select>

            {/* RESET */}

            <button
              type="button"
              onClick={
                resetFilters
              }
              disabled={
                !hasFilters
              }
              className="
                flex
                h-[42px]
                items-center
                justify-center
                gap-2
                rounded-[10px]
                border
                border-[#dddddd]
                bg-white
                px-4
                text-[9px]
                font-bold
                uppercase
                text-[#666]
                transition
                hover:bg-[#f8f8f8]
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Filter
                size={13}
              />

              Reset
            </button>
          </div>
        </section>

        {/* ===============================
            PRODUCTS TABLE
        =============================== */}

        <section
          className="
            overflow-hidden
            rounded-[16px]
            border
            border-[#e8e8e8]
            bg-white
          "
        >
          {/* TABLE HEADER */}

          <div
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-[#eeeeee]
              px-5
              py-4
            "
          >
            <div>
              <h3
                className="
                  text-[13px]
                  font-black
                  text-[#222]
                "
              >
                Product Catalog
              </h3>

              <p
                className="
                  mt-1
                  text-[9px]
                  text-[#999]
                "
              >
                {pagination.total}{" "}
                product
                {pagination.total ===
                1
                  ? ""
                  : "s"}{" "}
                found
              </p>
            </div>

            <Package
              size={18}
              className="
                text-[var(--primary-color)]
              "
            />
          </div>

          {/* LOADING */}

          {loading ? (
            <div
              className="
                flex
                min-h-[350px]
                items-center
                justify-center
              "
            >
              <div
                className="
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    h-7
                    w-7
                    animate-spin
                    rounded-full
                    border-[3px]
                    border-[#e5e5e5]
                    border-t-[var(--primary-color)]
                  "
                />

                <p
                  className="
                    mt-3
                    text-[10px]
                    text-[#999]
                  "
                >
                  Loading products...
                </p>
              </div>
            </div>
          ) : products.length ===
            0 ? (
            <div
              className="
                flex
                min-h-[330px]
                flex-col
                items-center
                justify-center
                px-5
                text-center
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f4f6f1]
                  text-[var(--primary-color)]
                "
              >
                <Package
                  size={23}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-[14px]
                  font-black
                  text-[#333]
                "
              >
                No products found
              </h3>

              <p
                className="
                  mt-2
                  text-[10px]
                  text-[#999]
                "
              >
                Try changing the
                filters or add a new
                product.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP */}

              <div
                className="
                  hidden
                  overflow-x-auto
                  lg:block
                "
              >
                <table
                  className="
                    w-full
                    min-w-[1050px]
                    border-collapse
                  "
                >
                  <thead>
                    <tr
                      className="
                        bg-[#fafafa]
                      "
                    >
                      {[
                        "Product",
                        "Category",
                        "Price",
                        "Stock",
                        "Homepage",
                        "Status",
                        "Actions",
                      ].map(
                        (heading) => (
                          <th
                            key={
                              heading
                            }
                            className="
                              border-b
                              border-[#eeeeee]
                              px-4
                              py-3
                              text-left
                              text-[8px]
                              font-bold
                              uppercase
                              tracking-[0.08em]
                              text-[#999]
                            "
                          >
                            {
                              heading
                            }
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {products.map(
                      (product) => {
                        const price =
                          getSellingPrice(
                            product
                          );

                        return (
                          <tr
                            key={
                              product._id
                            }
                            className="
                              transition
                              hover:bg-[#fcfcfc]
                            "
                          >
                            {/* PRODUCT */}

                            <td
                              className="
                                border-b
                                border-[#f0f0f0]
                                px-4
                                py-4
                              "
                            >
                              <div
                                className="
                                  flex
                                  min-w-[240px]
                                  items-center
                                  gap-3
                                "
                              >
                                <ProductImage
                                  product={
                                    product
                                  }
                                />

                                <div
                                  className="
                                    min-w-0
                                  "
                                >
                                  <div
                                    className="
                                      max-w-[220px]
                                      truncate
                                      text-[10px]
                                      font-bold
                                      text-[#333]
                                    "
                                  >
                                    {
                                      product.name
                                    }
                                  </div>

                                  <div
                                    className="
                                      mt-1
                                      text-[8px]
                                      text-[#999]
                                    "
                                  >
                                    SKU:{" "}
                                    {product.sku ||
                                      "—"}
                                  </div>

                                  {product.brand && (
                                    <div
                                      className="
                                        mt-1
                                        max-w-[200px]
                                        truncate
                                        text-[8px]
                                        text-[#aaa]
                                      "
                                    >
                                      {
                                        product.brand
                                      }
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>

                            {/* CATEGORY */}

                            <td
                              className="
                                border-b
                                border-[#f0f0f0]
                                px-4
                                py-4
                              "
                            >
                              <span
                                className="
                                  inline-flex
                                  rounded-full
                                  bg-[#f7f7f7]
                                  px-2.5
                                  py-1.5
                                  text-[8px]
                                  font-semibold
                                  text-[#666]
                                "
                              >
                                {getCategoryName(
                                  product,
                                  categories
                                )}
                              </span>
                            </td>

                            {/* PRICE */}

                            <td
                              className="
                                border-b
                                border-[#f0f0f0]
                                px-4
                                py-4
                              "
                            >
                              <div
                                className="
                                  whitespace-nowrap
                                  text-[10px]
                                  font-black
                                  text-[#222]
                                "
                              >
                                {formatMoney(
                                  price.current
                                )}
                              </div>

                              {price.onSale && (
                                <div
                                  className="
                                    mt-1
                                    text-[8px]
                                    text-[#aaa]
                                    line-through
                                  "
                                >
                                  {formatMoney(
                                    price.original
                                  )}
                                </div>
                              )}
                            </td>

                            {/* STOCK */}

                            <td
                              className="
                                border-b
                                border-[#f0f0f0]
                                px-4
                                py-4
                              "
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setStockTarget(
                                    product
                                  )
                                }
                                className="
                                  text-left
                                "
                              >
                                <div
                                  className="
                                    text-[11px]
                                    font-black
                                    text-[#333]
                                  "
                                >
                                  {product.trackInventory ===
                                  false
                                    ? "—"
                                    : safeNumber(
                                        product.stock
                                      )}
                                </div>

                                <div
                                  className="
                                    mt-1.5
                                  "
                                >
                                  <StockBadge
                                    product={
                                      product
                                    }
                                  />
                                </div>
                              </button>
                            </td>

                            {/* HOMEPAGE */}

                            <td
                              className="
                                max-w-[220px]
                                border-b
                                border-[#f0f0f0]
                                px-4
                                py-4
                              "
                            >
                              <div
                                className="
                                  flex
                                  flex-wrap
                                  gap-1
                                "
                              >
                                <FeatureBadge
                                  active={
                                    product.isFeatured
                                  }
                                  icon={
                                    Star
                                  }
                                  label="Featured"
                                />

                                <FeatureBadge
                                  active={
                                    product.isTrending
                                  }
                                  icon={
                                    TrendingUp
                                  }
                                  label="Trending"
                                />

                                <FeatureBadge
                                  active={
                                    product.isNewArrival
                                  }
                                  icon={
                                    Sparkles
                                  }
                                  label="New"
                                />

                                <FeatureBadge
                                  active={
                                    product.isBestSeller
                                  }
                                  icon={
                                    CheckCircle2
                                  }
                                  label="Best"
                                />

                                <FeatureBadge
                                  active={
                                    product.isDealOfDay
                                  }
                                  icon={
                                    Tags
                                  }
                                  label="Deal"
                                />

                                {!product.isFeatured &&
                                  !product.isTrending &&
                                  !product.isNewArrival &&
                                  !product.isBestSeller &&
                                  !product.isDealOfDay && (
                                    <span
                                      className="
                                        text-[8px]
                                        text-[#aaa]
                                      "
                                    >
                                      —
                                    </span>
                                  )}
                              </div>
                            </td>

                            {/* STATUS */}

                            <td
                              className="
                                border-b
                                border-[#f0f0f0]
                                px-4
                                py-4
                              "
                            >
                              <span
                                className={`
                                  inline-flex
                                  rounded-full
                                  border
                                  px-2.5
                                  py-1.5
                                  text-[8px]
                                  font-bold
                                  uppercase

                                  ${
                                    product.isActive !==
                                    false
                                      ? "border-green-100 bg-green-50 text-green-700"
                                      : "border-gray-200 bg-gray-50 text-gray-500"
                                  }
                                `}
                              >
                                {product.isActive !==
                                false
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </td>

                            {/* ACTIONS */}

                            <td
                              className="
                                border-b
                                border-[#f0f0f0]
                                px-4
                                py-4
                              "
                            >
                              <div
                                className="
                                  flex
                                  items-center
                                  gap-1.5
                                "
                              >
                                {product.slug && (
                                  <Link
                                    to={`/product/${product.slug}`}
                                    target="_blank"
                                    className="
                                      flex
                                      h-8
                                      w-8
                                      items-center
                                      justify-center
                                      rounded-[8px]
                                      border
                                      border-[#eeeeee]
                                      text-[#777]
                                      transition
                                      hover:bg-[#f5f5f5]
                                      hover:text-[#222]
                                    "
                                    title="View product"
                                  >
                                    <ExternalLink
                                      size={13}
                                    />
                                  </Link>
                                )}

                                <Link
                                  to={`/admin/products/${product._id}/edit`}
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-[8px]
                                    border
                                    border-[#eeeeee]
                                    text-[#777]
                                    transition
                                    hover:border-[#dce7cf]
                                    hover:bg-[#f4f7ef]
                                    hover:text-[var(--primary-color)]
                                  "
                                  title="Edit product"
                                >
                                  <Edit3
                                    size={13}
                                  />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget(
                                      product
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
                                    border-[#eeeeee]
                                    text-[#999]
                                    transition
                                    hover:border-red-100
                                    hover:bg-red-50
                                    hover:text-red-600
                                  "
                                  title="Delete product"
                                >
                                  <Trash2
                                    size={13}
                                  />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              {/* MOBILE / TABLET */}

              <div
                className="
                  divide-y
                  divide-[#eeeeee]
                  lg:hidden
                "
              >
                {products.map(
                  (product) => {
                    const price =
                      getSellingPrice(
                        product
                      );

                    return (
                      <div
                        key={
                          product._id
                        }
                        className="
                          p-4
                        "
                      >
                        <div
                          className="
                            flex
                            gap-3
                          "
                        >
                          <ProductImage
                            product={
                              product
                            }
                          />

                          <div
                            className="
                              min-w-0
                              flex-1
                            "
                          >
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-3
                              "
                            >
                              <div>
                                <div
                                  className="
                                    font-bold
                                    text-[#333]
                                  "
                                >
                                  {
                                    product.name
                                  }
                                </div>

                                <div
                                  className="
                                    mt-1
                                    text-[9px]
                                    text-[#999]
                                  "
                                >
                                  {product.sku ||
                                    "No SKU"}
                                </div>
                              </div>

                              <span
                                className={`
                                  rounded-full
                                  px-2
                                  py-1
                                  text-[8px]
                                  font-bold

                                  ${
                                    product.isActive !==
                                    false
                                      ? "bg-green-50 text-green-700"
                                      : "bg-gray-100 text-gray-500"
                                  }
                                `}
                              >
                                {product.isActive !==
                                false
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>

                            <div
                              className="
                                mt-3
                                grid
                                grid-cols-2
                                gap-3
                              "
                            >
                              <div>
                                <div
                                  className="
                                    text-[8px]
                                    uppercase
                                    text-[#aaa]
                                  "
                                >
                                  Price
                                </div>

                                <div
                                  className="
                                    mt-1
                                    text-[10px]
                                    font-black
                                  "
                                >
                                  {formatMoney(
                                    price.current
                                  )}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() =>
                                  setStockTarget(
                                    product
                                  )
                                }
                                className="
                                  text-left
                                "
                              >
                                <div
                                  className="
                                    text-[8px]
                                    uppercase
                                    text-[#aaa]
                                  "
                                >
                                  Stock
                                </div>

                                <div
                                  className="
                                    mt-1
                                    text-[10px]
                                    font-black
                                  "
                                >
                                  {product.trackInventory ===
                                  false
                                    ? "Not tracked"
                                    : safeNumber(
                                        product.stock
                                      )}
                                </div>
                              </button>
                            </div>

                            <div
                              className="
                                mt-4
                                flex
                                items-center
                                justify-between
                                gap-3
                              "
                            >
                              <StockBadge
                                product={
                                  product
                                }
                              />

                              <div
                                className="
                                  flex
                                  gap-1.5
                                "
                              >
                                <Link
                                  to={`/admin/products/${product._id}/edit`}
                                  className="
                                    flex
                                    h-8
                                    w-8
                                    items-center
                                    justify-center
                                    rounded-[8px]
                                    bg-[#f4f7ef]
                                    text-[var(--primary-color)]
                                  "
                                >
                                  <Edit3
                                    size={13}
                                  />
                                </Link>

                                <button
                                  type="button"
                                  onClick={() =>
                                    setDeleteTarget(
                                      product
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
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </>
          )}

          {/* =============================
              PAGINATION
          ============================= */}

          {!loading &&
            pagination.totalPages >
              1 && (
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  border-t
                  border-[#eeeeee]
                  px-5
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                <div
                  className="
                    text-[9px]
                    text-[#999]
                  "
                >
                  Page{" "}
                  {pagination.page}{" "}
                  of{" "}
                  {
                    pagination.totalPages
                  }
                </div>

                <div
                  className="
                    flex
                    gap-2
                  "
                >
                  <button
                    type="button"
                    disabled={
                      !pagination.hasPrevPage
                    }
                    onClick={() =>
                      setFilters(
                        (current) => ({
                          ...current,
                          page:
                            Math.max(
                              1,
                              current.page -
                                1
                            ),
                        })
                      )
                    }
                    className="
                      flex
                      h-9
                      items-center
                      gap-1.5
                      rounded-[8px]
                      border
                      border-[#dddddd]
                      px-3
                      text-[9px]
                      font-bold
                      text-[#555]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    <ArrowLeft
                      size={12}
                    />

                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={
                      !pagination.hasNextPage
                    }
                    onClick={() =>
                      setFilters(
                        (current) => ({
                          ...current,
                          page:
                            current.page +
                            1,
                        })
                      )
                    }
                    className="
                      flex
                      h-9
                      items-center
                      gap-1.5
                      rounded-[8px]
                      border
                      border-[#dddddd]
                      px-3
                      text-[9px]
                      font-bold
                      text-[#555]
                      disabled:cursor-not-allowed
                      disabled:opacity-40
                    "
                  >
                    Next

                    <ArrowRight
                      size={12}
                    />
                  </button>
                </div>
              </div>
            )}
        </section>

        {/* ===============================
            DELETE MODAL
        =============================== */}

        <DeleteProductModal
          product={
            deleteTarget
          }
          deleting={
            deleting
          }
          onCancel={() =>
            !deleting &&
            setDeleteTarget(
              null
            )
          }
          onConfirm={
            handleDelete
          }
        />

        {/* ===============================
            STOCK MODAL
        =============================== */}

        <StockModal
          product={
            stockTarget
          }
          saving={
            savingStock
          }
          onCancel={() =>
            !savingStock &&
            setStockTarget(
              null
            )
          }
          onSave={
            handleSaveStock
          }
        />
      </div>
    );
  };

export default AdminProductsPage;