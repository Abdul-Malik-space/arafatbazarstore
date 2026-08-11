import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Grid2X2,
  Heart,
  List,
  Minus,
  Package,
  Plus,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  X,
} from "lucide-react";

import {
  getCategories,
  getImageUrl,
  getProducts,
} from "../services/api";

import {
  useCart,
} from "../context/CartContext";

import {
  useSite,
} from "../context/SiteContext";

// ========================================
// HELPERS
// ========================================

const getSellingPrice = (product) => {
  const regularPrice =
    Number(product?.price) || 0;

  const salePrice =
    product?.salePrice !== null &&
    product?.salePrice !== undefined
      ? Number(product.salePrice)
      : null;

  if (
    salePrice !== null &&
    salePrice > 0 &&
    salePrice < regularPrice
  ) {
    return salePrice;
  }

  return regularPrice;
};

const getDiscount = (product) => {
  const price =
    Number(product?.price) || 0;

  const salePrice =
    Number(product?.salePrice) || 0;

  if (
    price <= 0 ||
    salePrice <= 0 ||
    salePrice >= price
  ) {
    return 0;
  }

  return Math.round(
    ((price - salePrice) / price) *
      100
  );
};

// ========================================
// PRODUCT CARD
// INDEX17 STYLE
// ========================================

const ProductCard = ({
  product,
  formatPrice,
  addToCart,
  viewMode,
}) => {
  const navigate =
    useNavigate();

  const price =
    getSellingPrice(product);

  const discount =
    getDiscount(product);

  const imageUrl =
    product.mainImage
      ? getImageUrl(
          product.mainImage
        )
      : "";

  const hasVariants =
    Array.isArray(
      product.variants
    ) &&
    product.variants.some(
      (variant) =>
        variant.isActive !==
        false
    );

  const outOfStock =
    product.trackInventory &&
    !product.allowBackorder &&
    Number(product.stock) <= 0;

  const handleAddToCart = () => {
    if (hasVariants) {
      navigate(
        `/product/${product.slug}`
      );

      return;
    }

    if (outOfStock) {
      return;
    }

    addToCart(product, 1);
  };

  // ======================================
  // LIST VIEW
  // ======================================

  if (viewMode === "list") {
    return (
      <article
        className="
          group
          grid
          grid-cols-1
          gap-6
          border-b
          border-[#eeeeee]
          bg-white
          py-6
          last:border-b-0
          sm:grid-cols-[240px_1fr]
        "
      >
        {/* IMAGE */}

        <div
          className="
            relative
            overflow-hidden
            rounded-[18px]
            bg-[#f7f7f7]
          "
        >
          <Link
            to={`/product/${product.slug}`}
            className="
              flex
              aspect-square
              items-center
              justify-center
            "
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={product.name}
                className="
                  h-full
                  w-full
                  object-contain
                  p-5
                  transition
                  duration-500
                  group-hover:scale-105
                "
              />
            ) : (
              <Package
                size={55}
                className="
                  text-gray-300
                "
              />
            )}
          </Link>

          {discount > 0 && (
            <span
              className="
                absolute
                left-3
                top-3
                rounded-[4px]
                bg-[#e9532d]
                px-2.5
                py-1
                text-[11px]
                font-bold
                text-white
              "
            >
              {discount}% off
            </span>
          )}
        </div>

        {/* CONTENT */}

        <div
          className="
            flex
            flex-col
            justify-center
          "
        >
          {product.category?.name && (
            <Link
              to={`/shop/category/${product.category.slug}`}
              className="
                text-[12px]
                font-medium
                uppercase
                tracking-[0.08em]
                text-[var(--primary-color)]
              "
            >
              {
                product.category
                  .name
              }
            </Link>
          )}

          <h3
            className="
              mt-2
              text-[22px]
              font-black
              text-[#222]
            "
          >
            <Link
              to={`/product/${product.slug}`}
              className="
                transition
                hover:text-[var(--primary-color)]
              "
            >
              {product.name}
            </Link>
          </h3>

          {/* RATING */}

          <div
            className="
              mt-3
              flex
              items-center
              gap-[3px]
            "
          >
            {Array.from({
              length: 5,
            }).map(
              (_, index) => (
                <Star
                  key={index}
                  size={13}
                  className="
                    fill-[#f6b42b]
                    text-[#f6b42b]
                  "
                />
              )
            )}
          </div>

          {/* DESCRIPTION */}

          {product.shortDescription && (
            <p
              className="
                mt-4
                max-w-[700px]
                text-[14px]
                leading-7
                text-[#777]
              "
            >
              {
                product.shortDescription
              }
            </p>
          )}

          {/* PRICE */}

          <div
            className="
              mt-4
              flex
              items-center
              gap-3
            "
          >
            <span
              className="
                text-[18px]
                font-bold
                text-[var(--primary-color)]
              "
            >
              {formatPrice(price)}
            </span>

            {discount > 0 && (
              <span
                className="
                  text-[14px]
                  text-gray-400
                  line-through
                "
              >
                {formatPrice(
                  product.price
                )}
              </span>
            )}
          </div>

          {/* BUTTONS */}

          <div
            className="
              mt-5
              flex
              flex-wrap
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={
                handleAddToCart
              }
              disabled={outOfStock}
              className="
                inline-flex
                items-center
                gap-3
                rounded-full
                bg-[var(--primary-color)]
                px-6
                py-3
                text-[12px]
                font-bold
                uppercase
                text-white
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <ShoppingBag
                size={15}
              />

              {hasVariants
                ? "Select options"
                : outOfStock
                  ? "Out of stock"
                  : "Add to cart"}
            </button>

            <button
              type="button"
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-[#e6e6e6]
                bg-white
                text-[#333]
                transition
                hover:border-[var(--primary-color)]
                hover:bg-[var(--primary-color)]
                hover:text-white
              "
            >
              <Heart size={17} />
            </button>

            <Link
              to={`/product/${product.slug}`}
              className="
                flex
                h-11
                w-11
                items-center
                justify-center
                rounded-full
                border
                border-[#e6e6e6]
                bg-white
                text-[#333]
                transition
                hover:border-[var(--primary-color)]
                hover:bg-[var(--primary-color)]
                hover:text-white
              "
            >
              <Eye size={17} />
            </Link>
          </div>
        </div>
      </article>
    );
  }

  // ======================================
  // GRID VIEW
  // ======================================

  return (
    <article
      className="
        group
        min-w-0
        bg-white
      "
    >
      {/* IMAGE */}

      <div
        className="
          relative
          overflow-hidden
          rounded-[18px]
          bg-[#f7f7f7]
        "
      >
        <Link
          to={`/product/${product.slug}`}
          className="
            flex
            aspect-square
            items-center
            justify-center
          "
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              className="
                h-full
                w-full
                object-contain
                p-5
                transition
                duration-500
                group-hover:scale-105
              "
            />
          ) : (
            <Package
              size={55}
              className="
                text-gray-300
              "
            />
          )}
        </Link>

        {/* SALE */}

        {discount > 0 && (
          <span
            className="
              absolute
              left-3
              top-3
              rounded-[4px]
              bg-[#e9532d]
              px-2.5
              py-1
              text-[11px]
              font-bold
              text-white
            "
          >
            {discount}% off
          </span>
        )}

        {/* NEW */}

        {product.isNewArrival && (
          <span
            className="
              absolute
              right-3
              top-3
              rounded-[4px]
              bg-[var(--primary-color)]
              px-2.5
              py-1
              text-[10px]
              font-bold
              uppercase
              text-white
            "
          >
            New
          </span>
        )}

        {/* HOVER ACTIONS */}

        <div
          className="
            absolute
            bottom-4
            left-1/2
            flex
            -translate-x-1/2
            translate-y-4
            items-center
            gap-2
            opacity-0
            transition
            duration-300
            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          <button
            type="button"
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white
              text-[#222]
              shadow-md
              transition
              hover:bg-[var(--primary-color)]
              hover:text-white
            "
          >
            <Heart size={17} />
          </button>

          <Link
            to={`/product/${product.slug}`}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white
              text-[#222]
              shadow-md
              transition
              hover:bg-[var(--primary-color)]
              hover:text-white
            "
          >
            <Eye size={17} />
          </Link>

          <button
            type="button"
            disabled={outOfStock}
            onClick={
              handleAddToCart
            }
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              bg-white
              text-[#222]
              shadow-md
              transition
              hover:bg-[var(--primary-color)]
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <ShoppingBag
              size={17}
            />
          </button>
        </div>
      </div>

      {/* CONTENT */}

      <div
        className="
          pt-4
          text-center
        "
      >
        <h3
          className="
            min-h-[44px]
            text-[15px]
            font-semibold
            leading-6
            text-[#333]
          "
        >
          <Link
            to={`/product/${product.slug}`}
            className="
              transition
              hover:text-[var(--primary-color)]
            "
          >
            {product.name}
          </Link>
        </h3>

        {/* PRICE */}

        <div
          className="
            mt-1
            flex
            flex-wrap
            items-center
            justify-center
            gap-2
          "
        >
          <span
            className="
              text-[15px]
              font-bold
              text-[var(--primary-color)]
            "
          >
            {formatPrice(price)}
          </span>

          {discount > 0 && (
            <span
              className="
                text-[13px]
                text-gray-400
                line-through
              "
            >
              {formatPrice(
                product.price
              )}
            </span>
          )}
        </div>

        {/* STARS */}

        <div
          className="
            mt-2
            flex
            justify-center
            gap-[2px]
          "
        >
          {Array.from({
            length: 5,
          }).map(
            (_, index) => (
              <Star
                key={index}
                size={12}
                className="
                  fill-[#f6b42b]
                  text-[#f6b42b]
                "
              />
            )
          )}
        </div>

        {/* STOCK */}

        {outOfStock && (
          <div
            className="
              mt-2
              text-[11px]
              font-semibold
              text-red-500
            "
          >
            Out of stock
          </div>
        )}
      </div>
    </article>
  );
};

// ========================================
// FILTER BLOCK
// ========================================

const FilterBlock = ({
  title,
  children,
}) => {
  return (
    <div
      className="
        border-b
        border-[#eeeeee]
        py-6
        first:pt-0
        last:border-0
        last:pb-0
      "
    >
      <h3
        className="
          mb-4
          text-[16px]
          font-black
          text-[#222]
        "
      >
        {title}
      </h3>

      {children}
    </div>
  );
};

// ========================================
// SHOP PAGE
// ========================================

const ShopPage = () => {
  const {
    categorySlug,
  } = useParams();

  const navigate =
    useNavigate();

  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();

  const {
    formatPrice,
  } = useSite();

  const {
    addToCart,
  } = useCart();

  // ======================================
  // DATA
  // ======================================

  const [
    products,
    setProducts,
  ] = useState([]);

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    mobileFilterOpen,
    setMobileFilterOpen,
  ] = useState(false);

  const [
    viewMode,
    setViewMode,
  ] = useState("grid");

  // ======================================
  // PAGINATION
  // ======================================

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    pages: 0,
    total: 0,
    count: 0,
  });

  // ======================================
  // QUERY VALUES
  // ======================================

  const page =
    Number(
      searchParams.get("page")
    ) || 1;

  const search =
    searchParams.get("search") ||
    "";

  const sort =
    searchParams.get("sort") ||
    "newest";

  const minPrice =
    searchParams.get(
      "minPrice"
    ) || "";

  const maxPrice =
    searchParams.get(
      "maxPrice"
    ) || "";

  const inStock =
    searchParams.get(
      "inStock"
    ) === "true";

  const featured =
    searchParams.get(
      "isFeatured"
    ) === "true";

  const trending =
    searchParams.get(
      "isTrending"
    ) === "true";

  const deal =
    searchParams.get(
      "isDealOfDay"
    ) === "true";

  // ======================================
  // LOCAL INPUTS
  // ======================================

  const [
    searchInput,
    setSearchInput,
  ] = useState(search);

  const [
    minInput,
    setMinInput,
  ] = useState(minPrice);

  const [
    maxInput,
    setMaxInput,
  ] = useState(maxPrice);

  // ======================================
  // SYNC
  // ======================================

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    setMinInput(minPrice);
    setMaxInput(maxPrice);
  }, [
    minPrice,
    maxPrice,
  ]);

  // ======================================
  // LOAD CATEGORIES
  // ======================================

  useEffect(() => {
    const loadCategories =
      async () => {
        try {
          const response =
            await getCategories();

          setCategories(
            response?.categories ||
              []
          );
        } catch (error) {
          console.error(
            "Categories Error:",
            error
          );
        }
      };

    loadCategories();
  }, []);

  // ======================================
  // LOAD PRODUCTS
  // ======================================

  useEffect(() => {
    let cancelled = false;

    const loadProducts =
      async () => {
        try {
          setLoading(true);
          setError("");

          const params = {
            page,
            limit: 12,
            sort,
            isActive: true,
          };

          if (search) {
            params.search =
              search;
          }

          if (categorySlug) {
            params.category =
              categorySlug;
          }

          if (minPrice) {
            params.minPrice =
              minPrice;
          }

          if (maxPrice) {
            params.maxPrice =
              maxPrice;
          }

          if (inStock) {
            params.inStock =
              true;
          }

          if (featured) {
            params.isFeatured =
              true;
          }

          if (trending) {
            params.isTrending =
              true;
          }

          if (deal) {
            params.isDealOfDay =
              true;
          }

          const response =
            await getProducts(
              params
            );

          if (cancelled) {
            return;
          }

          setProducts(
            response?.products ||
              []
          );

          setPagination({
            page:
              response?.page || 1,

            pages:
              response?.pages || 0,

            total:
              response?.total || 0,

            count:
              response?.count || 0,
          });
        } catch (error) {
          if (!cancelled) {
            console.error(
              "Products Error:",
              error
            );

            setError(
              error.response?.data
                ?.message ||
                "Unable to load products."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [
    page,
    search,
    sort,
    minPrice,
    maxPrice,
    inStock,
    featured,
    trending,
    deal,
    categorySlug,
  ]);

  // ======================================
  // CURRENT CATEGORY
  // ======================================

  const currentCategory =
    useMemo(() => {
      if (!categorySlug) {
        return null;
      }

      return (
        categories.find(
          (category) =>
            category.slug ===
            categorySlug
        ) || null
      );
    }, [
      categories,
      categorySlug,
    ]);

  // ======================================
  // UPDATE QUERY
  // ======================================

  const updateQuery = (
    key,
    value
  ) => {
    const next =
      new URLSearchParams(
        searchParams
      );

    if (
      value === "" ||
      value === false ||
      value === null ||
      value === undefined
    ) {
      next.delete(key);
    } else {
      next.set(
        key,
        String(value)
      );
    }

    if (key !== "page") {
      next.delete("page");
    }

    setSearchParams(next);
  };

  // ======================================
  // SEARCH
  // ======================================

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    updateQuery(
      "search",
      searchInput.trim()
    );
  };

  // ======================================
  // PRICE
  // ======================================

  const handlePrice = (
    event
  ) => {
    event.preventDefault();

    const next =
      new URLSearchParams(
        searchParams
      );

    if (minInput) {
      next.set(
        "minPrice",
        minInput
      );
    } else {
      next.delete(
        "minPrice"
      );
    }

    if (maxInput) {
      next.set(
        "maxPrice",
        maxInput
      );
    } else {
      next.delete(
        "maxPrice"
      );
    }

    next.delete("page");

    setSearchParams(next);
  };

  // ======================================
  // CATEGORY
  // ======================================

  const selectCategory = (
    slug = ""
  ) => {
    setMobileFilterOpen(
      false
    );

    const query =
      searchParams.toString();

    if (!slug) {
      navigate(
        `/shop${
          query
            ? `?${query}`
            : ""
        }`
      );

      return;
    }

    navigate(
      `/shop/category/${slug}${
        query
          ? `?${query}`
          : ""
      }`
    );
  };

  // ======================================
  // CLEAR
  // ======================================

  const clearFilters = () => {
    setSearchInput("");
    setMinInput("");
    setMaxInput("");

    navigate("/shop");

    setMobileFilterOpen(
      false
    );
  };

  // ======================================
  // CHANGE PAGE
  // ======================================

  const changePage = (
    newPage
  ) => {
    if (
      newPage < 1 ||
      newPage >
        pagination.pages
    ) {
      return;
    }

    updateQuery(
      "page",
      newPage
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ======================================
  // ACTIVE FILTERS
  // ======================================

  const activeFilters = [
    search,
    categorySlug,
    minPrice,
    maxPrice,
    inStock,
    featured,
    trending,
    deal,
  ].filter(Boolean).length;

  // ======================================
  // SIDEBAR CONTENT
  // ======================================

  const SidebarContent = () => (
    <>
      {/* TITLE */}

      <div
        className="
          flex
          items-center
          justify-between
          border-b
          border-[#eeeeee]
          pb-5
        "
      >
        <div
          className="
            flex
            items-center
            gap-2
          "
        >
          <SlidersHorizontal
            size={18}
          />

          <span
            className="
              text-[17px]
              font-black
              text-[#222]
            "
          >
            Filter by
          </span>
        </div>

        {activeFilters > 0 && (
          <button
            type="button"
            onClick={
              clearFilters
            }
            className="
              text-[11px]
              font-semibold
              uppercase
              text-red-500
            "
          >
            Clear
          </button>
        )}
      </div>

      {/* CATEGORIES */}

      <FilterBlock
        title="Categories"
      >
        <ul
          className="
            space-y-3
          "
        >
          <li>
            <button
              type="button"
              onClick={() =>
                selectCategory()
              }
              className={`
                flex
                w-full
                items-center
                justify-between
                text-left
                text-[13px]
                transition
                ${
                  !categorySlug
                    ? "font-semibold text-[var(--primary-color)]"
                    : "text-[#666] hover:text-[var(--primary-color)]"
                }
              `}
            >
              <span>
                All products
              </span>

              <ChevronRight
                size={14}
              />
            </button>
          </li>

          {categories.map(
            (category) => (
              <li
                key={
                  category._id
                }
              >
                <button
                  type="button"
                  onClick={() =>
                    selectCategory(
                      category.slug
                    )
                  }
                  className={`
                    flex
                    w-full
                    items-center
                    justify-between
                    text-left
                    text-[13px]
                    transition
                    ${
                      categorySlug ===
                      category.slug
                        ? "font-semibold text-[var(--primary-color)]"
                        : "text-[#666] hover:text-[var(--primary-color)]"
                    }
                  `}
                >
                  <span>
                    {
                      category.name
                    }
                  </span>

                  <ChevronRight
                    size={14}
                  />
                </button>
              </li>
            )
          )}
        </ul>
      </FilterBlock>

      {/* PRICE */}

      <FilterBlock
        title="Price"
      >
        <form
          onSubmit={
            handlePrice
          }
        >
          <div
            className="
              grid
              grid-cols-2
              gap-2
            "
          >
            <input
              type="number"
              min="0"
              value={minInput}
              onChange={(
                event
              ) =>
                setMinInput(
                  event.target
                    .value
                )
              }
              placeholder="Min"
              className="
                w-full
                rounded-[4px]
                border
                border-[#dddddd]
                px-3
                py-2.5
                text-[13px]
                outline-none
                focus:border-[var(--primary-color)]
              "
            />

            <input
              type="number"
              min="0"
              value={maxInput}
              onChange={(
                event
              ) =>
                setMaxInput(
                  event.target
                    .value
                )
              }
              placeholder="Max"
              className="
                w-full
                rounded-[4px]
                border
                border-[#dddddd]
                px-3
                py-2.5
                text-[13px]
                outline-none
                focus:border-[var(--primary-color)]
              "
            />
          </div>

          <button
            type="submit"
            className="
              mt-3
              w-full
              rounded-full
              bg-[#282828]
              px-4
              py-2.5
              text-[11px]
              font-bold
              uppercase
              text-white
              transition
              hover:bg-[var(--primary-color)]
            "
          >
            Apply
          </button>
        </form>
      </FilterBlock>

      {/* AVAILABILITY */}

      <FilterBlock
        title="Availability"
      >
        <label
          className="
            flex
            cursor-pointer
            items-center
            gap-3
            text-[13px]
            text-[#666]
          "
        >
          <input
            type="checkbox"
            checked={inStock}
            onChange={(
              event
            ) =>
              updateQuery(
                "inStock",
                event.target
                  .checked
              )
            }
            className="
              h-4
              w-4
              accent-[var(--primary-color)]
            "
          />

          In stock
        </label>
      </FilterBlock>

      {/* PRODUCT TYPE */}

      <FilterBlock
        title="Product type"
      >
        <div
          className="
            space-y-3
          "
        >
          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              text-[13px]
              text-[#666]
            "
          >
            <input
              type="checkbox"
              checked={featured}
              onChange={(
                event
              ) =>
                updateQuery(
                  "isFeatured",
                  event.target
                    .checked
                )
              }
              className="
                h-4
                w-4
                accent-[var(--primary-color)]
              "
            />

            Featured
          </label>

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              text-[13px]
              text-[#666]
            "
          >
            <input
              type="checkbox"
              checked={trending}
              onChange={(
                event
              ) =>
                updateQuery(
                  "isTrending",
                  event.target
                    .checked
                )
              }
              className="
                h-4
                w-4
                accent-[var(--primary-color)]
              "
            />

            Trending
          </label>

          <label
            className="
              flex
              cursor-pointer
              items-center
              gap-3
              text-[13px]
              text-[#666]
            "
          >
            <input
              type="checkbox"
              checked={deal}
              onChange={(
                event
              ) =>
                updateQuery(
                  "isDealOfDay",
                  event.target
                    .checked
                )
              }
              className="
                h-4
                w-4
                accent-[var(--primary-color)]
              "
            />

            Deal of the day
          </label>
        </div>
      </FilterBlock>
    </>
  );

  return (
    <div
      className="
        bg-white
      "
    >
      {/* =================================
          PAGE TITLE
      ================================= */}

      <section
        className="
          border-b
          border-[#eeeeee]
          bg-[#fafafa]
        "
      >
        <div
          className="
            mx-auto
            max-w-[1200px]
            px-4
            py-11
            text-center
            sm:px-5
          "
        >
          <h1
            className="
              text-[34px]
              font-black
              text-[#222]
              sm:text-[38px]
            "
          >
            {currentCategory
              ? currentCategory.name
              : "Shop"}
          </h1>

          <div
            className="
              mt-3
              flex
              flex-wrap
              items-center
              justify-center
              gap-2
              text-[13px]
              text-[#777]
            "
          >
            <Link
              to="/"
              className="
                transition
                hover:text-[var(--primary-color)]
              "
            >
              Home
            </Link>

            <ChevronRight
              size={13}
            />

            <Link
              to="/shop"
              className="
                transition
                hover:text-[var(--primary-color)]
              "
            >
              Shop
            </Link>

            {currentCategory && (
              <>
                <ChevronRight
                  size={13}
                />

                <span
                  className="
                    text-[#333]
                  "
                >
                  {
                    currentCategory.name
                  }
                </span>
              </>
            )}
          </div>
        </div>
      </section>

      {/* =================================
          SHOP
      ================================= */}

      <section
        className="
          py-[65px]
        "
      >
        <div
          className="
            mx-auto
            max-w-[1200px]
            px-4
            sm:px-5
          "
        >
          {/* MOBILE FILTER */}

          <div
            className="
              mb-5
              lg:hidden
            "
          >
            <button
              type="button"
              onClick={() =>
                setMobileFilterOpen(
                  true
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                rounded-full
                bg-[#282828]
                px-5
                py-3
                text-[12px]
                font-bold
                uppercase
                text-white
              "
            >
              <Filter size={15} />

              Filter

              {activeFilters > 0 && (
                <span
                  className="
                    flex
                    h-5
                    min-w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-[var(--primary-color)]
                    px-1
                    text-[10px]
                  "
                >
                  {activeFilters}
                </span>
              )}
            </button>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-9
              lg:grid-cols-[235px_1fr]
            "
          >
            {/* =================================
                SIDEBAR
            ================================= */}

            <aside
              className="
                hidden
                self-start
                border
                border-[#eeeeee]
                bg-white
                p-5
                lg:block
              "
            >
              <SidebarContent />
            </aside>

            {/* =================================
                PRODUCTS
            ================================= */}

            <main>
              {/* SEARCH */}

              <form
                onSubmit={
                  handleSearch
                }
                className="
                  mb-5
                  flex
                  h-[50px]
                  overflow-hidden
                  rounded-[27px]
                  border
                  border-[#dddddd]
                "
              >
                <input
                  type="search"
                  value={
                    searchInput
                  }
                  onChange={(
                    event
                  ) =>
                    setSearchInput(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search products"
                  className="
                    min-w-0
                    flex-1
                    px-5
                    text-[13px]
                    outline-none
                  "
                />

                <button
                  type="submit"
                  className="
                    flex
                    w-[60px]
                    items-center
                    justify-center
                    bg-[var(--primary-color)]
                    text-white
                  "
                >
                  <Search size={18} />
                </button>
              </form>

              {/* =================================
                  TOOLBAR
              ================================= */}

              <div
                className="
                  mb-8
                  flex
                  flex-col
                  gap-4
                  border-y
                  border-[#eeeeee]
                  py-4
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                "
              >
                {/* LEFT */}

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(
                        "grid"
                      )
                    }
                    className={`
                      flex
                      h-38px
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      transition
                      ${
                        viewMode ===
                        "grid"
                          ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                          : "border-[#dddddd] bg-white text-[#666]"
                      }
                    `}
                  >
                    <Grid2X2
                      size={15}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setViewMode(
                        "list"
                      )
                    }
                    className={`
                      flex
                      h-9
                      w-9
                      items-center
                      justify-center
                      rounded-full
                      border
                      transition
                      ${
                        viewMode ===
                        "list"
                          ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                          : "border-[#dddddd] bg-white text-[#666]"
                      }
                    `}
                  >
                    <List size={16} />
                  </button>

                  <span
                    className="
                      ml-2
                      text-[13px]
                      text-[#777]
                    "
                  >
                    Showing{" "}
                    <strong
                      className="
                        text-[#333]
                      "
                    >
                      {
                        pagination.count
                      }
                    </strong>{" "}
                    of{" "}
                    <strong
                      className="
                        text-[#333]
                      "
                    >
                      {
                        pagination.total
                      }
                    </strong>{" "}
                    products
                  </span>
                </div>

                {/* SORT */}

                <div
                  className="
                    relative
                    min-w-[210px]
                  "
                >
                  <select
                    value={sort}
                    onChange={(
                      event
                    ) =>
                      updateQuery(
                        "sort",
                        event.target
                          .value
                      )
                    }
                    className="
                      h-[42px]
                      w-full
                      appearance-none
                      rounded-[22px]
                      border
                      border-[#dddddd]
                      bg-white
                      px-5
                      pr-10
                      text-[12px]
                      text-[#555]
                      outline-none
                      focus:border-[var(--primary-color)]
                    "
                  >
                    <option value="newest">
                      Sort by newest
                    </option>

                    <option value="oldest">
                      Sort by oldest
                    </option>

                    <option value="price-low">
                      Price low to high
                    </option>

                    <option value="price-high">
                      Price high to low
                    </option>

                    <option value="name-asc">
                      Name A to Z
                    </option>

                    <option value="name-desc">
                      Name Z to A
                    </option>
                  </select>

                  <ChevronDown
                    size={14}
                    className="
                      pointer-events-none
                      absolute
                      right-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-500
                    "
                  />
                </div>
              </div>

              {/* ERROR */}

              {error && (
                <div
                  className="
                    mb-6
                    border
                    border-red-100
                    bg-red-50
                    p-4
                    text-[13px]
                    text-red-600
                  "
                >
                  {error}
                </div>
              )}

              {/* =================================
                  PRODUCTS
              ================================= */}

              {loading ? (
                <div
                  className="
                    grid
                    grid-cols-2
                    gap-x-5
                    gap-y-9
                    md:grid-cols-3
                  "
                >
                  {Array.from({
                    length: 9,
                  }).map(
                    (_, index) => (
                      <div
                        key={index}
                      >
                        <div
                          className="
                            aspect-square
                            animate-pulse
                            rounded-[18px]
                            bg-gray-100
                          "
                        />

                        <div
                          className="
                            mx-auto
                            mt-4
                            h-4
                            w-2/3
                            animate-pulse
                            rounded
                            bg-gray-100
                          "
                        />
                      </div>
                    )
                  )}
                </div>
              ) : products.length >
                0 ? (
                <>
                  {viewMode ===
                  "grid" ? (
                    <div
                      className="
                        grid
                        grid-cols-2
                        gap-x-5
                        gap-y-9
                        md:grid-cols-3
                      "
                    >
                      {products.map(
                        (product) => (
                          <ProductCard
                            key={
                              product._id
                            }
                            product={
                              product
                            }
                            formatPrice={
                              formatPrice
                            }
                            addToCart={
                              addToCart
                            }
                            viewMode="grid"
                          />
                        )
                      )}
                    </div>
                  ) : (
                    <div>
                      {products.map(
                        (product) => (
                          <ProductCard
                            key={
                              product._id
                            }
                            product={
                              product
                            }
                            formatPrice={
                              formatPrice
                            }
                            addToCart={
                              addToCart
                            }
                            viewMode="list"
                          />
                        )
                      )}
                    </div>
                  )}

                  {/* =================================
                      PAGINATION
                  ================================= */}

                  {pagination.pages >
                    1 && (
                    <div
                      className="
                        mt-12
                        flex
                        flex-wrap
                        items-center
                        justify-center
                        gap-2
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          changePage(
                            pagination.page -
                              1
                          )
                        }
                        disabled={
                          pagination.page <=
                          1
                        }
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-[#dddddd]
                          bg-white
                          text-[#555]
                          transition
                          hover:border-[var(--primary-color)]
                          hover:bg-[var(--primary-color)]
                          hover:text-white
                          disabled:pointer-events-none
                          disabled:opacity-30
                        "
                      >
                        <ChevronLeft
                          size={16}
                        />
                      </button>

                      {Array.from(
                        {
                          length:
                            pagination.pages,
                        },
                        (
                          _,
                          index
                        ) =>
                          index + 1
                      ).map(
                        (
                          pageNumber
                        ) => (
                          <button
                            type="button"
                            key={
                              pageNumber
                            }
                            onClick={() =>
                              changePage(
                                pageNumber
                              )
                            }
                            className={`
                              flex
                              h-10
                              min-w-10
                              items-center
                              justify-center
                              rounded-full
                              border
                              px-3
                              text-[12px]
                              font-semibold
                              transition
                              ${
                                pagination.page ===
                                pageNumber
                                  ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                                  : "border-[#dddddd] bg-white text-[#555] hover:border-[var(--primary-color)]"
                              }
                            `}
                          >
                            {
                              pageNumber
                            }
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          changePage(
                            pagination.page +
                              1
                          )
                        }
                        disabled={
                          pagination.page >=
                          pagination.pages
                        }
                        className="
                          flex
                          h-10
                          w-10
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-[#dddddd]
                          bg-white
                          text-[#555]
                          transition
                          hover:border-[var(--primary-color)]
                          hover:bg-[var(--primary-color)]
                          hover:text-white
                          disabled:pointer-events-none
                          disabled:opacity-30
                        "
                      >
                        <ChevronRight
                          size={16}
                        />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                /* EMPTY */

                <div
                  className="
                    py-20
                    text-center
                  "
                >
                  <div
                    className="
                      mx-auto
                      flex
                      h-20
                      w-20
                      items-center
                      justify-center
                      rounded-full
                      bg-[#f4f7ef]
                      text-[var(--primary-color)]
                    "
                  >
                    <Package
                      size={35}
                    />
                  </div>

                  <h2
                    className="
                      mt-5
                      text-[22px]
                      font-black
                      text-[#222]
                    "
                  >
                    No products found
                  </h2>

                  <p
                    className="
                      mt-2
                      text-[13px]
                      text-[#777]
                    "
                  >
                    Try another search
                    or remove some
                    filters.
                  </p>

                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="
                      mt-6
                      rounded-full
                      bg-[var(--primary-color)]
                      px-7
                      py-3
                      text-[12px]
                      font-bold
                      uppercase
                      text-white
                    "
                  >
                    Show all products
                  </button>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      {/* =================================
          MOBILE FILTER DRAWER
      ================================= */}

      {mobileFilterOpen && (
        <div
          className="
            fixed
            inset-0
            z-[100]
            lg:hidden
          "
        >
          <button
            type="button"
            onClick={() =>
              setMobileFilterOpen(
                false
              )
            }
            className="
              absolute
              inset-0
              bg-black/45
            "
          />

          <aside
            className="
              absolute
              bottom-0
              left-0
              top-0
              w-[320px]
              max-w-[86vw]
              overflow-y-auto
              bg-white
              p-5
              shadow-2xl
            "
          >
            <div
              className="
                mb-5
                flex
                items-center
                justify-between
              "
            >
              <strong
                className="
                  text-[18px]
                  text-[#222]
                "
              >
                Filters
              </strong>

              <button
                type="button"
                onClick={() =>
                  setMobileFilterOpen(
                    false
                  )
                }
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f5f5f5]
                "
              >
                <X size={18} />
              </button>
            </div>

            <SidebarContent />
          </aside>
        </div>
      )}
    </div>
  );
};

export default ShopPage;