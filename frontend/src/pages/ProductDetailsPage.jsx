import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  ChevronRight,
  Eye,
  Heart,
  Minus,
  Package,
  Plus,
  RefreshCcw,
  Share2,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

import {
  getImageUrl,
  getProductBySlug,
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

const getSellingPrice = (
  regularPrice,
  salePrice
) => {
  const regular =
    Number(regularPrice) || 0;

  const sale =
    salePrice !== null &&
    salePrice !== undefined
      ? Number(salePrice)
      : null;

  if (
    sale !== null &&
    sale > 0 &&
    sale < regular
  ) {
    return sale;
  }

  return regular;
};

const getDiscount = (
  regularPrice,
  salePrice
) => {
  const regular =
    Number(regularPrice) || 0;

  const sale =
    Number(salePrice) || 0;

  if (
    regular <= 0 ||
    sale <= 0 ||
    sale >= regular
  ) {
    return 0;
  }

  return Math.round(
    ((regular - sale) /
      regular) *
      100
  );
};

const normalizeImage = (
  image
) => {
  if (!image) {
    return "";
  }

  // IMPORTANT:
  // Product cards elsewhere in the store already pass
  // product.mainImage directly to getImageUrl().
  // Do the same here first so object-based upload values,
  // relative /uploads paths and absolute URLs all resolve
  // through one shared image URL system.
  try {
    const resolved =
      getImageUrl(image);

    if (
      typeof resolved ===
        "string" &&
      resolved.trim() &&
      !resolved.includes(
        "[object Object]"
      )
    ) {
      return resolved;
    }
  } catch (error) {
    // Fall through to legacy object fields below.
  }

  const raw =
    typeof image === "string"
      ? image
      : image.url ||
        image.path ||
        image.image ||
        image.src ||
        image.location ||
        image.file ||
        image.filename ||
        "";

  if (!raw) {
    return "";
  }

  try {
    const resolved =
      getImageUrl(raw);

    return typeof resolved ===
      "string"
      ? resolved
      : "";
  } catch (error) {
    return String(raw || "");
  }
};

// ========================================
// RELATED PRODUCT CARD
// ========================================

const RelatedProductCard = ({
  product,
  formatPrice,
  addToCart,
}) => {
  const regularPrice =
    Number(product.price) || 0;

  const sellingPrice =
    getSellingPrice(
      product.price,
      product.salePrice
    );

  const discount =
    getDiscount(
      product.price,
      product.salePrice
    );

  const image =
    normalizeImage(
      product.mainImage
    );

  const outOfStock =
    product.trackInventory &&
    !product.allowBackorder &&
    Number(product.stock) <= 0;

  return (
    <article
      className="
        group
        min-w-[230px]
        flex-1
        bg-white
        lg:min-w-0
      "
    >
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
          {image ? (
            <img
              src={image}
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
              size={50}
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
              shadow
              transition
              hover:bg-[var(--primary-color)]
              hover:text-white
            "
          >
            <Heart size={16} />
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
              shadow
              transition
              hover:bg-[var(--primary-color)]
              hover:text-white
            "
          >
            <Eye size={16} />
          </Link>

          <button
            type="button"
            disabled={outOfStock}
            onClick={() =>
              addToCart(
                product,
                1
              )
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
              shadow
              transition
              hover:bg-[var(--primary-color)]
              hover:text-white
              disabled:opacity-40
            "
          >
            <ShoppingBag
              size={16}
            />
          </button>
        </div>
      </div>

      <div
        className="
          pt-4
          text-center
        "
      >
        <h3
          className="
            min-h-[42px]
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

        <div
          className="
            mt-1
            flex
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
            {formatPrice(
              sellingPrice
            )}
          </span>

          {sellingPrice <
            regularPrice && (
            <span
              className="
                text-[13px]
                text-gray-400
                line-through
              "
            >
              {formatPrice(
                regularPrice
              )}
            </span>
          )}
        </div>

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
      </div>
    </article>
  );
};

// ========================================
// PRODUCT DETAILS PAGE
// ========================================

const ProductDetailsPage = () => {
  const {
    slug,
  } = useParams();

  const {
    addToCart,
  } = useCart();

  const {
    formatPrice,
    settings,
  } = useSite();

  // ======================================
  // STATE
  // ======================================

  const [
    product,
    setProduct,
  ] = useState(null);

  const [
    relatedProducts,
    setRelatedProducts,
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
    selectedImage,
    setSelectedImage,
  ] = useState("");

  const [
    selectedVariant,
    setSelectedVariant,
  ] = useState(null);

  const [
    quantity,
    setQuantity,
  ] = useState(1);

  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "description"
  );

  // ======================================
  // LOAD PRODUCT
  // ======================================

  useEffect(() => {
    let cancelled = false;

    const loadProduct =
      async () => {
        try {
          setLoading(true);
          setError("");

          const response =
            await getProductBySlug(
              slug
            );

          if (cancelled) {
            return;
          }

          const loadedProduct =
            response?.product;

          if (!loadedProduct) {
            setProduct(null);

            setError(
              "Product not found."
            );

            return;
          }

          setProduct(
            loadedProduct
          );

          // ===============================
          // MAIN IMAGE
          // ===============================

          const mainImage =
            normalizeImage(
              loadedProduct.mainImage
            );

          const firstGallery =
            normalizeImage(
              loadedProduct
                .images?.[0] ||
                loadedProduct
                  .galleryImages?.[0] ||
                loadedProduct
                  .gallery?.[0]
            );

          setSelectedImage(
            mainImage ||
              firstGallery ||
              ""
          );

          // ===============================
          // FIRST ACTIVE VARIANT
          // ===============================

          const firstVariant =
            Array.isArray(
              loadedProduct.variants
            )
              ? loadedProduct.variants.find(
                  (variant) =>
                    variant.isActive !==
                    false
                )
              : null;

          setSelectedVariant(
            firstVariant ||
              null
          );

          setQuantity(1);
          setActiveTab(
            "description"
          );

          // ===============================
          // RELATED PRODUCTS
          // ===============================

          if (
            loadedProduct.category
              ?.slug
          ) {
            try {
              const relatedResponse =
                await getProducts({
                  category:
                    loadedProduct
                      .category.slug,

                  limit: 5,

                  isActive: true,

                  sort: "newest",
                });

              if (!cancelled) {
                setRelatedProducts(
                  (
                    relatedResponse
                      ?.products || []
                  )
                    .filter(
                      (item) =>
                        item._id !==
                        loadedProduct._id
                    )
                    .slice(0, 4)
                );
              }
            } catch (
              relatedError
            ) {
              console.error(
                "Related Products Error:",
                relatedError
              );
            }
          } else {
            setRelatedProducts(
              []
            );
          }
        } catch (err) {
          if (!cancelled) {
            console.error(
              "Product Details Error:",
              err
            );

            setError(
              err.response?.data
                ?.message ||
                "Unable to load product."
            );
          }
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    if (slug) {
      loadProduct();
    }

    return () => {
      cancelled = true;
    };
  }, [slug]);

  // ======================================
  // GALLERY
  // ======================================

  const galleryImages =
    useMemo(() => {
      if (!product) {
        return [];
      }

      const images = [];

      const addImage = (
        image
      ) => {
        const value =
          normalizeImage(
            image
          );

        if (
          value &&
          !images.includes(
            value
          )
        ) {
          images.push(value);
        }
      };

      addImage(
        product.mainImage
      );

      if (
        Array.isArray(
          product.images
        )
      ) {
        product.images.forEach(
          addImage
        );
      }

      if (
        Array.isArray(
          product.galleryImages
        )
      ) {
        product.galleryImages.forEach(
          addImage
        );
      }

      if (
        Array.isArray(
          product.gallery
        )
      ) {
        product.gallery.forEach(
          addImage
        );
      }

      if (
        selectedVariant
          ?.image
      ) {
        addImage(
          selectedVariant.image
        );
      }

      return images;
    }, [
      product,
      selectedVariant,
    ]);

  // ======================================
  // ACTIVE VARIANTS
  // ======================================

  const activeVariants =
    useMemo(() => {
      if (
        !Array.isArray(
          product?.variants
        )
      ) {
        return [];
      }

      return product.variants.filter(
        (variant) =>
          variant.isActive !==
          false
      );
    }, [product]);

  // ======================================
  // PRICE
  // ======================================

  const regularPrice =
    selectedVariant
      ? Number(
          selectedVariant.price
        ) ||
        Number(
          product?.price
        ) ||
        0
      : Number(
          product?.price
        ) || 0;

  const salePrice =
    selectedVariant?.salePrice !==
      undefined &&
    selectedVariant?.salePrice !==
      null
      ? selectedVariant.salePrice
      : product?.salePrice;

  const sellingPrice =
    getSellingPrice(
      regularPrice,
      salePrice
    );

  const discount =
    getDiscount(
      regularPrice,
      salePrice
    );

  // ======================================
  // INVENTORY
  // ======================================

  const availableStock =
    selectedVariant
      ? Number(
          selectedVariant.stock
        ) || 0
      : Number(
          product?.stock
        ) || 0;

  const outOfStock =
    Boolean(
      product?.trackInventory
    ) &&
    !product?.allowBackorder &&
    availableStock <= 0;

  const lowStock =
    Boolean(
      product?.trackInventory
    ) &&
    availableStock > 0 &&
    availableStock <=
      Number(
        product
          ?.lowStockThreshold ||
          5
      );

  // ======================================
  // VARIANT
  // ======================================

  const selectVariant = (
    variant
  ) => {
    setSelectedVariant(
      variant
    );

    setQuantity(1);

    const variantImage =
      normalizeImage(
        variant.image
      );

    if (variantImage) {
      setSelectedImage(
        variantImage
      );
    }
  };

  // ======================================
  // QUANTITY
  // ======================================

  const decreaseQuantity =
    () => {
      setQuantity(
        (current) =>
          Math.max(
            1,
            current - 1
          )
      );
    };

  const increaseQuantity =
    () => {
      if (outOfStock) {
        return;
      }

      if (
        product.trackInventory &&
        !product.allowBackorder &&
        quantity >=
          availableStock
      ) {
        return;
      }

      setQuantity(
        (current) =>
          current + 1
      );
    };

  const updateQuantity = (
    value
  ) => {
    let nextValue =
      parseInt(
        value,
        10
      );

    if (
      !Number.isFinite(
        nextValue
      ) ||
      nextValue < 1
    ) {
      nextValue = 1;
    }

    if (
      product.trackInventory &&
      !product.allowBackorder &&
      availableStock > 0
    ) {
      nextValue =
        Math.min(
          nextValue,
          availableStock
        );
    }

    setQuantity(
      nextValue
    );
  };

  // ======================================
  // ADD TO CART
  // ======================================

  const handleAddToCart =
    () => {
      if (
        !product ||
        outOfStock
      ) {
        return;
      }

      if (
        activeVariants.length >
          0 &&
        !selectedVariant
      ) {
        return;
      }

      addToCart(
        product,
        quantity,
        selectedVariant
      );
    };

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div
        className="
          bg-white
          py-[70px]
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1200px]
            grid-cols-1
            gap-10
            px-4
            sm:px-5
            lg:grid-cols-2
          "
        >
          <div
            className="
              aspect-square
              animate-pulse
              rounded-[20px]
              bg-gray-100
            "
          />

          <div>
            <div
              className="
                h-4
                w-28
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                mt-5
                h-12
                w-4/5
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                mt-5
                h-7
                w-40
                animate-pulse
                rounded
                bg-gray-100
              "
            />

            <div
              className="
                mt-7
                h-28
                animate-pulse
                rounded
                bg-gray-100
              "
            />
          </div>
        </div>
      </div>
    );
  }

  // ======================================
  // ERROR
  // ======================================

  if (
    error ||
    !product
  ) {
    return (
      <section
        className="
          flex
          min-h-[60vh]
          items-center
          justify-center
          bg-white
          px-5
          py-16
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
              size={34}
            />
          </div>

          <h1
            className="
              mt-5
              text-[27px]
              font-black
              text-[#222]
            "
          >
            Product not found
          </h1>

          <p
            className="
              mt-2
              text-[13px]
              text-[#777]
            "
          >
            {error}
          </p>

          <Link
            to="/shop"
            className="
              mt-6
              inline-flex
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
            Back to shop
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-white">
      {/* =================================
          PAGE TITLE / BREADCRUMB
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
            py-10
            text-center
            sm:px-5
          "
        >
          <h1
            className="
              text-[32px]
              font-black
              text-[#222]
              sm:text-[36px]
            "
          >
            Product
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
                hover:text-[var(--primary-color)]
              "
            >
              Shop
            </Link>

            {product.category && (
              <>
                <ChevronRight
                  size={13}
                />

                <Link
                  to={`/shop/category/${product.category.slug}`}
                  className="
                    hover:text-[var(--primary-color)]
                  "
                >
                  {
                    product.category
                      .name
                  }
                </Link>
              </>
            )}

            <ChevronRight
              size={13}
            />

            <span
              className="
                text-[#333]
              "
            >
              {product.name}
            </span>
          </div>
        </div>
      </section>

      {/* =================================
          PRODUCT MAIN
      ================================= */}

      <section
        className="
          py-[65px]
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1200px]
            grid-cols-1
            gap-10
            px-4
            sm:px-5
            lg:grid-cols-2
            lg:gap-[60px]
          "
        >
          {/* ===============================
              PRODUCT GALLERY
          =============================== */}

          <div
            className={`
              grid
              grid-cols-1
              gap-4

              ${
                galleryImages.length > 1
                  ? "sm:grid-cols-[84px_minmax(0,1fr)]"
                  : "sm:grid-cols-1"
              }
            `}
          >
            {/* THUMBNAILS */}

            {galleryImages.length >
              1 && (
              <div
                className="
                  order-2
                  flex
                  gap-3
                  overflow-x-auto
                  sm:order-1
                  sm:flex-col
                "
              >
                {galleryImages.map(
                  (
                    image,
                    index
                  ) => (
                    <button
                      type="button"
                      key={`${image}-${index}`}
                      onClick={() =>
                        setSelectedImage(
                          image
                        )
                      }
                      className={`
                        flex
                        h-[78px]
                        w-[78px]
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-[12px]
                        border
                        bg-[#f7f7f7]
                        p-2
                        transition
                        ${
                          selectedImage ===
                          image
                            ? "border-[var(--primary-color)]"
                            : "border-[#eeeeee] hover:border-[var(--primary-color)]"
                        }
                      `}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="
                          h-full
                          w-full
                          object-contain
                        "
                      />
                    </button>
                  )
                )}
              </div>
            )}

            {/* MAIN IMAGE */}

            <div
              className={`
                relative
                order-1
                flex
                aspect-square
                min-w-0
                items-center
                justify-center
                overflow-hidden
                rounded-[20px]
                bg-[#f7f7f7]

                ${
                  galleryImages.length > 1
                    ? "sm:order-2 sm:col-start-2"
                    : "sm:order-1 sm:col-start-1"
                }
              `}
            >
              {selectedImage ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="
                    h-full
                    w-full
                    object-contain
                    object-center
                    p-5
                    sm:p-8
                  "
                />
              ) : (
                <Package
                  size={85}
                  className="
                    text-gray-300
                  "
                />
              )}

              {discount > 0 && (
                <span
                  className="
                    absolute
                    left-4
                    top-4
                    rounded-[4px]
                    bg-[#e9532d]
                    px-3
                    py-1.5
                    text-[11px]
                    font-bold
                    text-white
                  "
                >
                  {discount}% off
                </span>
              )}

              {product.isNewArrival && (
                <span
                  className="
                    absolute
                    right-4
                    top-4
                    rounded-[4px]
                    bg-[var(--primary-color)]
                    px-3
                    py-1.5
                    text-[10px]
                    font-bold
                    uppercase
                    text-white
                  "
                >
                  New
                </span>
              )}
            </div>
          </div>

          {/* ===============================
              PRODUCT INFORMATION
          =============================== */}

          <div>
            {/* CATEGORY */}

            {product.category && (
              <Link
                to={`/shop/category/${product.category.slug}`}
                className="
                  text-[12px]
                  font-bold
                  uppercase
                  tracking-[0.12em]
                  text-[var(--primary-color)]
                "
              >
                {
                  product.category
                    .name
                }
              </Link>
            )}

            {/* TITLE */}

            <h1
              className="
                mt-3
                text-[32px]
                font-black
                leading-[1.15]
                text-[#222]
                sm:text-[38px]
              "
            >
              {product.name}
            </h1>

            {/* RATING */}

            <div
              className="
                mt-4
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  gap-[2px]
                "
              >
                {Array.from({
                  length: 5,
                }).map(
                  (_, index) => (
                    <Star
                      key={index}
                      size={14}
                      className="
                        fill-[#f6b42b]
                        text-[#f6b42b]
                      "
                    />
                  )
                )}
              </div>

              <span
                className="
                  text-[12px]
                  text-[#888]
                "
              >
                {Number(
                  product.averageRating ||
                    0
                ).toFixed(1)}
              </span>

              <span
                className="
                  h-4
                  w-px
                  bg-[#dddddd]
                "
              />

              <span
                className="
                  text-[12px]
                  text-[#777]
                "
              >
                {product.reviewCount ||
                  0}{" "}
                Reviews
              </span>
            </div>

            {/* PRICE */}

            <div
              className="
                mt-5
                flex
                flex-wrap
                items-center
                gap-3
              "
            >
              <span
                className="
                  text-[26px]
                  font-black
                  text-[var(--primary-color)]
                "
              >
                {formatPrice(
                  sellingPrice
                )}
              </span>

              {discount > 0 && (
                <span
                  className="
                    text-[17px]
                    text-[#999]
                    line-through
                  "
                >
                  {formatPrice(
                    regularPrice
                  )}
                </span>
              )}

              {discount > 0 && (
                <span
                  className="
                    rounded-[4px]
                    bg-[#fff0eb]
                    px-2.5
                    py-1
                    text-[11px]
                    font-bold
                    text-[#e9532d]
                  "
                >
                  Save {discount}%
                </span>
              )}
            </div>

            {/* SHORT DESCRIPTION */}

            {product.shortDescription && (
              <p
                className="
                  mt-5
                  text-[14px]
                  leading-7
                  text-[#666]
                "
              >
                {
                  product.shortDescription
                }
              </p>
            )}

            {/* STOCK */}

            <div
              className="
                mt-5
                flex
                items-center
                gap-2
              "
            >
              <span
                className="
                  text-[13px]
                  font-semibold
                  text-[#333]
                "
              >
                Availability:
              </span>

              {outOfStock ? (
                <span
                  className="
                    text-[13px]
                    font-semibold
                    text-red-500
                  "
                >
                  Out of stock
                </span>
              ) : lowStock ? (
                <span
                  className="
                    text-[13px]
                    font-semibold
                    text-[#e78c23]
                  "
                >
                  Only{" "}
                  {availableStock}{" "}
                  left
                </span>
              ) : (
                <span
                  className="
                    text-[13px]
                    font-semibold
                    text-[var(--primary-color)]
                  "
                >
                  In stock
                  {product.trackInventory
                    ? ` (${availableStock})`
                    : ""}
                </span>
              )}
            </div>

            {/* SKU */}

            {(selectedVariant?.sku ||
              product.sku) && (
              <div
                className="
                  mt-2
                  text-[13px]
                  text-[#777]
                "
              >
                <strong
                  className="
                    font-semibold
                    text-[#333]
                  "
                >
                  SKU:
                </strong>{" "}
                {selectedVariant?.sku ||
                  product.sku}
              </div>
            )}

            {/* =================================
                VARIANTS
            ================================= */}

            {activeVariants.length >
              0 && (
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
                    mb-3
                    text-[14px]
                    font-black
                    text-[#222]
                  "
                >
                  Select option
                </div>

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {activeVariants.map(
                    (variant) => {
                      const variantOut =
                        product.trackInventory &&
                        !product.allowBackorder &&
                        Number(
                          variant.stock
                        ) <= 0;

                      return (
                        <button
                          type="button"
                          key={
                            variant._id
                          }
                          disabled={
                            variantOut
                          }
                          onClick={() =>
                            selectVariant(
                              variant
                            )
                          }
                          className={`
                            rounded-[22px]
                            border
                            px-5
                            py-2.5
                            text-[12px]
                            font-semibold
                            transition
                            ${
                              selectedVariant?._id ===
                              variant._id
                                ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                                : "border-[#dddddd] bg-white text-[#555] hover:border-[var(--primary-color)]"
                            }
                            disabled:cursor-not-allowed
                            disabled:bg-[#f5f5f5]
                            disabled:text-gray-300
                          `}
                        >
                          {variant.name}

                          {variantOut
                            ? " - Out"
                            : ""}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            )}

            {/* =================================
                QUANTITY + CART
            ================================= */}

            <div
              className="
                mt-7
                border-t
                border-[#eeeeee]
                pt-7
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-3
                  sm:flex-row
                  sm:items-center
                "
              >
                {/* QUANTITY */}

                <div
                  className="
                    flex
                    h-[50px]
                    w-[145px]
                    overflow-hidden
                    rounded-[27px]
                    border
                    border-[#dddddd]
                    bg-white
                  "
                >
                  <button
                    type="button"
                    onClick={
                      decreaseQuantity
                    }
                    disabled={
                      quantity <= 1
                    }
                    className="
                      flex
                      w-[45px]
                      items-center
                      justify-center
                      text-[#555]
                      transition
                      hover:text-[var(--primary-color)]
                      disabled:opacity-30
                    "
                  >
                    <Minus
                      size={15}
                    />
                  </button>

                  <input
                    type="number"
                    min="1"
                    value={
                      quantity
                    }
                    onChange={(
                      event
                    ) =>
                      updateQuantity(
                        event.target
                          .value
                      )
                    }
                    className="
                      min-w-0
                      flex-1
                      border-x
                      border-[#eeeeee]
                      bg-white
                      text-center
                      text-[13px]
                      font-bold
                      outline-none
                    "
                  />

                  <button
                    type="button"
                    onClick={
                      increaseQuantity
                    }
                    disabled={
                      outOfStock ||
                      (product.trackInventory &&
                        !product.allowBackorder &&
                        quantity >=
                          availableStock)
                    }
                    className="
                      flex
                      w-[45px]
                      items-center
                      justify-center
                      text-[#555]
                      transition
                      hover:text-[var(--primary-color)]
                      disabled:opacity-30
                    "
                  >
                    <Plus
                      size={15}
                    />
                  </button>
                </div>

                {/* ADD TO CART */}

                <button
                  type="button"
                  onClick={
                    handleAddToCart
                  }
                  disabled={
                    outOfStock
                  }
                  className="
                    flex
                    h-[50px]
                    flex-1
                    items-center
                    justify-center
                    gap-3
                    rounded-[27px]
                    bg-[var(--primary-color)]
                    px-7
                    text-[12px]
                    font-bold
                    uppercase
                    text-white
                    transition
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:bg-gray-300
                  "
                >
                  <ShoppingBag
                    size={17}
                  />

                  {outOfStock
                    ? "Out of stock"
                    : "Add to cart"}
                </button>

                {/* WISHLIST */}

                <button
                  type="button"
                  className="
                    flex
                    h-[50px]
                    w-[50px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#dddddd]
                    bg-white
                    text-[#333]
                    transition
                    hover:border-[var(--primary-color)]
                    hover:bg-[var(--primary-color)]
                    hover:text-white
                  "
                  aria-label="Wishlist"
                >
                  <Heart size={18} />
                </button>
              </div>
            </div>

            {/* =================================
                META
            ================================= */}

            <div
              className="
                mt-7
                space-y-3
                border-t
                border-[#eeeeee]
                pt-6
                text-[13px]
                text-[#777]
              "
            >
              {product.brand && (
                <div>
                  <strong
                    className="
                      font-semibold
                      text-[#333]
                    "
                  >
                    Brand:
                  </strong>{" "}
                  {product.brand}
                </div>
              )}

              {product.category && (
                <div>
                  <strong
                    className="
                      font-semibold
                      text-[#333]
                    "
                  >
                    Category:
                  </strong>{" "}

                  <Link
                    to={`/shop/category/${product.category.slug}`}
                    className="
                      hover:text-[var(--primary-color)]
                    "
                  >
                    {
                      product.category
                        .name
                    }
                  </Link>
                </div>
              )}

              {product.unit && (
                <div>
                  <strong
                    className="
                      font-semibold
                      text-[#333]
                    "
                  >
                    Unit:
                  </strong>{" "}
                  {product.unit}
                </div>
              )}

              {Array.isArray(
                product.tags
              ) &&
                product.tags.length >
                  0 && (
                  <div>
                    <strong
                      className="
                        font-semibold
                        text-[#333]
                      "
                    >
                      Tags:
                    </strong>{" "}

                    {product.tags.join(
                      ", "
                    )}
                  </div>
                )}

              <div
                className="
                  flex
                  items-center
                  gap-3
                  pt-2
                "
              >
                <strong
                  className="
                    font-semibold
                    text-[#333]
                  "
                >
                  Share:
                </strong>

                <button
                  type="button"
                  className="
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border
                    border-[#dddddd]
                    transition
                    hover:border-[var(--primary-color)]
                    hover:text-[var(--primary-color)]
                  "
                >
                  <Share2
                    size={14}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          SERVICES
      ================================= */}

      <section
        className="
          border-y
          border-[#eeeeee]
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1200px]
            grid-cols-1
            px-4
            sm:grid-cols-2
            sm:px-5
            lg:grid-cols-4
          "
        >
          {[
            {
              icon: Truck,
              title:
                "Fast delivery",
              text:
                settings.estimatedDeliveryText ||
                "Delivery service available",
            },
            {
              icon:
                RefreshCcw,
              title:
                "Easy support",
              text:
                "Contact us for order assistance",
            },
            {
              icon:
                ShieldCheck,
              title:
                "Secure shopping",
              text:
                "Reliable ordering experience",
            },
            {
              icon: Package,
              title:
                "Quality products",
              text:
                "Carefully managed products",
            },
          ].map(
            ({
              icon: Icon,
              title,
              text,
            }) => (
              <div
                key={title}
                className="
                  flex
                  items-center
                  gap-4
                  border-b
                  border-[#eeeeee]
                  px-4
                  py-7
                  last:border-0
                  sm:border-b-0
                  lg:border-r
                  lg:last:border-r-0
                "
              >
                <div
                  className="
                    flex
                    h-12
                    w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#f4f7ef]
                    text-[var(--primary-color)]
                  "
                >
                  <Icon
                    size={21}
                  />
                </div>

                <div>
                  <div
                    className="
                      text-[14px]
                      font-bold
                      text-[#222]
                    "
                  >
                    {title}
                  </div>

                  <div
                    className="
                      mt-1
                      text-[11px]
                      leading-5
                      text-[#777]
                    "
                  >
                    {text}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* =================================
          PRODUCT TABS
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
          {/* TAB BUTTONS */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-center
              gap-6
              border-b
              border-[#eeeeee]
            "
          >
            {[
              {
                id:
                  "description",
                label:
                  "Description",
              },
              {
                id:
                  "information",
                label:
                  "Additional information",
              },
              {
                id:
                  "shipping",
                label:
                  "Shipping & delivery",
              },
            ].map(
              (tab) => (
                <button
                  type="button"
                  key={tab.id}
                  onClick={() =>
                    setActiveTab(
                      tab.id
                    )
                  }
                  className={`
                    relative
                    pb-4
                    text-[14px]
                    font-bold
                    transition
                    ${
                      activeTab ===
                      tab.id
                        ? "text-[var(--primary-color)]"
                        : "text-[#555] hover:text-[var(--primary-color)]"
                    }
                  `}
                >
                  {tab.label}

                  {activeTab ===
                    tab.id && (
                    <span
                      className="
                        absolute
                        bottom-[-1px]
                        left-0
                        h-[2px]
                        w-full
                        bg-[var(--primary-color)]
                      "
                    />
                  )}
                </button>
              )
            )}
          </div>

          {/* TAB CONTENT */}

          <div
            className="
              mx-auto
              max-w-[900px]
              py-9
            "
          >
            {activeTab ===
              "description" && (
              <div>
                <h3
                  className="
                    text-[20px]
                    font-black
                    text-[#222]
                  "
                >
                  Product description
                </h3>

                <div
                  className="
                    mt-4
                    whitespace-pre-line
                    text-[14px]
                    leading-8
                    text-[#666]
                  "
                >
                  {product.description ||
                    product.shortDescription ||
                    "Product details will appear here."}
                </div>
              </div>
            )}

            {activeTab ===
              "information" && (
              <div>
                <h3
                  className="
                    mb-5
                    text-[20px]
                    font-black
                    text-[#222]
                  "
                >
                  Additional information
                </h3>

                <div
                  className="
                    overflow-hidden
                    border
                    border-[#eeeeee]
                  "
                >
                  {[
                    [
                      "Brand",
                      product.brand ||
                        "—",
                    ],
                    [
                      "SKU",
                      selectedVariant?.sku ||
                        product.sku ||
                        "—",
                    ],
                    [
                      "Category",
                      product.category
                        ?.name ||
                        "—",
                    ],
                    [
                      "Unit",
                      product.unit ||
                        "—",
                    ],
                    [
                      "Stock",
                      product.trackInventory
                        ? availableStock
                        : "Available",
                    ],
                  ].map(
                    ([
                      label,
                      value,
                    ]) => (
                      <div
                        key={
                          label
                        }
                        className="
                          grid
                          grid-cols-[140px_1fr]
                          border-b
                          border-[#eeeeee]
                          last:border-b-0
                        "
                      >
                        <div
                          className="
                            bg-[#fafafa]
                            px-5
                            py-4
                            text-[13px]
                            font-semibold
                            text-[#333]
                          "
                        >
                          {label}
                        </div>

                        <div
                          className="
                            px-5
                            py-4
                            text-[13px]
                            text-[#666]
                          "
                        >
                          {value}
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {activeTab ===
              "shipping" && (
              <div>
                <h3
                  className="
                    text-[20px]
                    font-black
                    text-[#222]
                  "
                >
                  Shipping & delivery
                </h3>

                <p
                  className="
                    mt-4
                    text-[14px]
                    leading-8
                    text-[#666]
                  "
                >
                  {settings.estimatedDeliveryText ||
                    "Delivery information will be shown here."}
                </p>

                <p
                  className="
                    mt-3
                    text-[14px]
                    leading-8
                    text-[#666]
                  "
                >
                  Delivery charges and
                  the final order total
                  are calculated during
                  checkout.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================
          RELATED PRODUCTS
      ================================= */}

      {relatedProducts.length >
        0 && (
        <section
          className="
            bg-[#fafafa]
            py-[70px]
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
            <div
              className="
                mb-9
                text-center
              "
            >
              <h2
                className="
                  text-[31px]
                  font-black
                  text-[#222]
                  sm:text-[36px]
                "
              >
                Related{" "}
                <span
                  className="
                    font-medium
                    text-[var(--primary-color)]
                  "
                >
                  products
                </span>
              </h2>
            </div>

            <div
              className="
                flex
                gap-5
                overflow-x-auto
                pb-3
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                lg:grid
                lg:grid-cols-4
              "
            >
              {relatedProducts.map(
                (item) => (
                  <RelatedProductCard
                    key={
                      item._id
                    }
                    product={
                      item
                    }
                    formatPrice={
                      formatPrice
                    }
                    addToCart={
                      addToCart
                    }
                  />
                )
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailsPage;