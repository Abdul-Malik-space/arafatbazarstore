import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowRight,
  Eye,
  Heart,
  Headphones,
  Mail,
  Package,
  RefreshCcw,
  ShoppingBag,
  Star,
  Truck,
} from "lucide-react";

import {
  getCategories,
  getDealProducts,
  getImageUrl,
  getTrendingProducts,
} from "../services/api";

import {
  useCart,
} from "../context/CartContext";

import {
  useSite,
} from "../context/SiteContext";

import ProductImage from "../components/product/ProductImage";

// ========================================
// HELPERS
// ========================================

const getSellingPrice = (product) => {
  const regular =
    Number(product?.price) || 0;

  const sale =
    product?.salePrice !== null &&
    product?.salePrice !== undefined
      ? Number(product.salePrice)
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

const getDiscount = (product) => {
  const price =
    Number(product?.price) || 0;

  const sale =
    Number(product?.salePrice) || 0;

  if (
    !price ||
    !sale ||
    sale >= price
  ) {
    return 0;
  }

  return Math.round(
    ((price - sale) / price) *
      100
  );
};

// ========================================
// SECTION TITLE
// Index17 style:
// Trending products
// Shop by category
// Deal of the day
// ========================================

const SectionTitle = ({
  first,
  second,
}) => {
  return (
    <div
      className="
        mb-8
        text-center
      "
    >
      <h2
        className="
          text-[30px]
          font-black
          leading-tight
          text-[#222]
          sm:text-[34px]
          lg:text-[38px]
        "
      >
        {first}{" "}
        <span
          className="
            font-medium
            text-[var(--primary-color)]
          "
        >
          {second}
        </span>
      </h2>
    </div>
  );
};

// ========================================
// PRODUCT CARD
// VEGIST INDEX17 STYLE
// ========================================

const ProductCard = ({
  product,
  formatPrice,
  addToCart,
}) => {
  const navigate =
    useNavigate();

  const price =
    getSellingPrice(product);

  const discount =
    getDiscount(product);

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

  const handleCart = () => {
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

  return (
    <div
      className="
        group
        min-w-[230px]
        flex-1
        bg-white
        sm:min-w-[260px]
        xl:min-w-0
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
          className="block"
          aria-label={`View ${product.name}`}
        >
          <ProductImage
            src={product.mainImage}
            alt={product.name}
            fit="contain"
            padding
            imageClassName="group-hover:scale-105"
          />
        </Link>

        {/* DISCOUNT */}

        {discount > 0 && (
          <div
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
          </div>
        )}

        {/* ACTIONS */}

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
            aria-label="Wishlist"
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
            aria-label="View product"
          >
            <Eye size={17} />
          </Link>

          <button
            type="button"
            disabled={outOfStock}
            onClick={handleCart}
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
              disabled:opacity-50
            "
            aria-label="Add to cart"
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
            text-[15px]
            font-semibold
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
            mt-2
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

        {/* RATING */}

        <div
          className="
            mt-2
            flex
            items-center
            justify-center
            gap-[2px]
          "
        >
          {Array.from({
            length: 5,
          }).map((_, index) => (
            <Star
              key={index}
              size={12}
              className="
                fill-[#f7b32b]
                text-[#f7b32b]
              "
            />
          ))}
        </div>
      </div>
    </div>
  );
};

// ========================================
// HOME PAGE
// ========================================

const HomePage = () => {
  const {
    settings,
    formatPrice,
  } = useSite();

  const {
    addToCart,
  } = useCart();

  // ======================================
  // STATE
  // ======================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    trendingProducts,
    setTrendingProducts,
  ] = useState([]);

  const [
    dealProducts,
    setDealProducts,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    activeHero,
    setActiveHero,
  ] = useState(0);

  // ======================================
  // LOAD DATA
  // ======================================

  useEffect(() => {
    let cancelled = false;

    const loadData =
      async () => {
        try {
          setLoading(true);

          const results =
            await Promise.allSettled([
              getCategories(),
              getTrendingProducts(
                10
              ),
              getDealProducts(10),
            ]);

          if (cancelled) {
            return;
          }

          const [
            categoryResult,
            trendingResult,
            dealResult,
          ] = results;

          if (
            categoryResult.status ===
            "fulfilled"
          ) {
            setCategories(
              categoryResult.value
                ?.categories || []
            );
          }

          if (
            trendingResult.status ===
            "fulfilled"
          ) {
            setTrendingProducts(
              trendingResult.value
                ?.products || []
            );
          }

          if (
            dealResult.status ===
            "fulfilled"
          ) {
            setDealProducts(
              dealResult.value
                ?.products || []
            );
          }
        } catch (error) {
          console.error(
            "Home page error:",
            error
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================
  // HERO SLIDES
  // ======================================

  const heroSlides =
    useMemo(() => {
      if (
        Array.isArray(
          settings.heroSlides
        ) &&
        settings.heroSlides.length >
          0
      ) {
        return settings.heroSlides.filter(
          (slide) =>
            slide.isActive !==
            false
        );
      }

      // ----------------------------------
      // TEMPORARY FALLBACK
      // Keeps original Index17 layout
      // until dashboard hero is added.
      // ----------------------------------

      return [
        {
          _id: "fallback-hero",
          title:
            settings.storeName ||
            "General Store",

          subtitle:
            settings.storeTagline ||
            "Everything you need, all in one place.",

          priceText: "",

          buttonText:
            "Shop now",

          buttonUrl: "/shop",

          image: "",
        },
      ];
    }, [
      settings.heroSlides,
      settings.storeName,
      settings.storeTagline,
    ]);

  // ======================================
  // HERO AUTO SLIDE
  // ======================================

  useEffect(() => {
    if (
      heroSlides.length <= 1
    ) {
      return undefined;
    }

    const timer =
      setInterval(() => {
        setActiveHero(
          (current) =>
            (current + 1) %
            heroSlides.length
        );
      }, 5000);

    return () =>
      clearInterval(timer);
  }, [heroSlides.length]);

  const currentHero =
    heroSlides[activeHero];

  // ======================================
  // TESTIMONIALS
  // ======================================

  const testimonials =
    Array.isArray(
      settings.testimonials
    )
      ? settings.testimonials.filter(
          (item) =>
            item.isActive !==
            false
        )
      : [];

  // ======================================
  // BRANDS
  // ======================================

  const brandLogos =
    Array.isArray(
      settings.brandLogos
    )
      ? settings.brandLogos.filter(
          (item) =>
            item.isActive !==
            false
        )
      : [];

  // ======================================
  // STORIES / BLOGS
  // ======================================

  const stories =
    Array.isArray(
      settings.blogPosts
    )
      ? settings.blogPosts.filter(
          (item) =>
            item.isActive !==
            false
        )
      : [];

  // ======================================
  // MARQUEE
  // ======================================

  const marqueeItems = [
    settings.announcementText ||
      "Special offers available now",

    "Quality products for everyday shopping",

    settings.estimatedDeliveryText ||
      "Fast delivery available",

    "Shop online with ease",

    settings.storeName
      ? `Welcome to ${settings.storeName}`
      : "Welcome to our store",
  ];

  return (
    <div
      className="
        overflow-hidden
        bg-white
      "
    >
      {/* =================================
          1. HERO SLIDER
          Exact Index17 hierarchy
      ================================= */}
{/* =================================
    1. HERO SLIDER
================================= */}

<section
  className="
    relative
    -mt-[39px]
    bg-[#f5f5f5]
    pt-[39px]
    xl:-mt-[39px]
  "
>
  <div
    className="
      relative
      h-[340px]
      overflow-hidden

      sm:h-[390px]
      lg:h-[430px]
      xl:h-[460px]
    "
  >
    {/* =================================
        HERO IMAGE
    ================================= */}

    {currentHero?.image && (
      <img
        src={getImageUrl(
          currentHero.image
        )}
        alt={
          currentHero.title ||
          "Hero Banner"
        }
        className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          object-center
        "
      />
    )}

    {/* =================================
        FALLBACK
    ================================= */}

    {!currentHero?.image && (
      <div
        className="
          absolute
          inset-0
          bg-[#e4572d]
        "
      />
    )}

    {/* =================================
        CONTENT
    ================================= */}

    <div
      className="
        relative
        z-10
        mx-auto
        flex
        h-full
        max-w-[1200px]
        items-center
        px-6

        lg:px-10
      "
    >
      <div
        className="
          max-w-[500px]
          text-white
        "
      >
        {currentHero?.title && (
          <h1
            className="
              text-[34px]
              font-black
              leading-[1.08]
              tracking-[-0.02em]

              sm:text-[42px]
              lg:text-[50px]
            "
          >
            {currentHero.title}
          </h1>
        )}

        {currentHero?.subtitle && (
          <p
            className="
              mt-3
              max-w-[450px]
              text-[16px]
              leading-[1.5]
              text-white/95

              sm:text-[18px]
            "
          >
            {currentHero.subtitle}
          </p>
        )}

        {currentHero?.priceText && (
          <div
            className="
              mt-4
              text-[17px]
              font-semibold
            "
          >
            {currentHero.priceText}
          </div>
        )}

        {currentHero?.buttonText && (
          <Link
            to={
              currentHero.buttonUrl ||
              "/shop"
            }
            className="
              mt-6
              inline-flex
              items-center
              gap-4
              rounded-full
              bg-[#272727]
              px-7
              py-[14px]
              text-[13px]
              font-bold
              uppercase
              text-white
              transition

              hover:bg-[var(--primary-color)]
            "
          >
            {currentHero.buttonText}

            <ShoppingBag
              size={16}
            />
          </Link>
        )}
      </div>
    </div>

    {/* =================================
        SLIDER DOTS
    ================================= */}

    {heroSlides.length > 1 && (
      <div
        className="
          absolute
          bottom-5
          left-1/2
          z-20
          flex
          -translate-x-1/2
          gap-2
        "
      >
        {heroSlides.map(
          (slide, index) => (
            <button
              key={
                slide._id ||
                index
              }
              type="button"
              onClick={() =>
                setActiveHero(
                  index
                )
              }
              aria-label={`Show slide ${
                index + 1
              }`}
              className={`
                h-2.5
                rounded-full
                transition-all

                ${
                  index ===
                  activeHero
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/60"
                }
              `}
            />
          )
        )}
      </div>
    )}
  </div>
</section>

      {/* =================================
          2. MARQUEE OFFERS
      ================================= */}

      <section
        className="
          overflow-hidden
          border-b
          border-gray-100
          bg-white
          py-[18px]
        "
      >
        <div
          className="
            flex
            w-max
            animate-[marquee_28s_linear_infinite]
          "
        >
          {[...marqueeItems,
            ...marqueeItems,
          ].map(
            (item, index) => (
              <div
                key={index}
                className="
                  flex
                  items-center
                  whitespace-nowrap
                  px-8
                  text-[14px]
                  font-medium
                  text-[#333]
                "
              >
                <span
                  className="
                    mr-8
                    h-[6px]
                    w-[6px]
                    rounded-full
                    bg-[var(--primary-color)]
                  "
                />

                {item}
              </div>
            )
          )}
        </div>
      </section>

      {/* =================================
          3. SHOP BY CATEGORY
      ================================= */}

      <section
        className="
          bg-[#fbfbfb]
          py-[75px]
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
          <SectionTitle
            first="Shop by"
            second="category"
          />

          {categories.length > 0 ? (
            <div
              className="
                grid
                grid-cols-1
                gap-4
                sm:grid-cols-2
                lg:grid-cols-3
                xl:grid-cols-4
              "
            >
              {categories.map(
                (category) => {
                  const image =
                    category.image
                      ? getImageUrl(
                          category.image
                        )
                      : "";

                  return (
                    <Link
                      key={category._id}
                      to={`/shop/category/${category.slug}`}
                      className="
                        group
                        flex
                        min-w-0
                        items-center
                        gap-4
                        rounded-[16px]
                        border
                        border-[#e8e8e8]
                        bg-white
                        p-4
                        transition-all
                        duration-200
                        hover:-translate-y-[2px]
                        hover:border-[var(--primary-color)]
                        hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]
                      "
                    >
                      {/* CATEGORY IMAGE */}

                      <div
                        className="
                          flex
                          h-[78px]
                          w-[78px]
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-[14px]
                          border
                          border-[#eef0eb]
                          bg-[#f7f9f4]
                          p-[5px]
                        "
                      >
                        {image ? (
                          <img
                            src={image}
                            alt={category.name}
                            loading="lazy"
                            className="
                              h-full
                              w-full
                              object-contain
                              object-center
                              transition-transform
                              duration-300
                              group-hover:scale-[1.04]
                            "
                          />
                        ) : (
                          <Package
                            size={29}
                            className="
                              text-[var(--primary-color)]
                            "
                          />
                        )}
                      </div>

                      {/* CONTENT */}

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <div
                          className="
                            text-[11px]
                            text-gray-400
                            2xl:text-[12px]
                          "
                        >
                          {category.productCount ||
                            category.count ||
                            "0+"}{" "}
                          Product
                        </div>

                        <div
                          className="
                            mt-1
                            line-clamp-2
                            text-[15px]
                            font-bold
                            leading-[1.3]
                            text-[#222]
                            2xl:text-[16px]
                          "
                        >
                          {category.name}
                        </div>
                      </div>

                      {/* ARROW */}

                      <div
                        className="
                          flex
                          h-9
                          w-9
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-gray-200
                          text-gray-600
                          transition-all
                          duration-200
                          group-hover:border-[var(--primary-color)]
                          group-hover:bg-[var(--primary-color)]
                          group-hover:text-white
                        "
                      >
                        <ArrowRight
                          size={15}
                        />
                      </div>
                    </Link>
                  );
                }
              )}
            </div>
          ) : (
            <div
              className="
                w-full
                py-8
                text-center
                text-sm
                text-gray-400
              "
            >
              Categories will appear here.
            </div>
          )}
        </div>
      </section>

      {/* =================================
          4. TRENDING PRODUCTS
      ================================= */}

      <section
        className="
          py-[75px]
        "
      >
        <div
          className="
            px-4
            sm:px-7
          "
        >
          <SectionTitle
            first="Trending"
            second="products"
          />

          {loading ? (
            <div
              className="
                grid
                grid-cols-2
                gap-5
                lg:grid-cols-4
                xl:grid-cols-5
              "
            >
              {Array.from({
                length: 5,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="
                      aspect-[0.75]
                      animate-pulse
                      rounded-[18px]
                      bg-gray-100
                    "
                  />
                )
              )}
            </div>
          ) : trendingProducts.length >
            0 ? (
            <div
              className="
                flex
                gap-5
                overflow-x-auto
                pb-4
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                xl:grid
                xl:grid-cols-5
                xl:overflow-visible
              "
            >
              {trendingProducts
                .slice(0, 10)
                .map(
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
                    />
                  )
                )}
            </div>
          ) : (
            <div
              className="
                py-10
                text-center
                text-sm
                text-gray-400
              "
            >
              Trending products
              will appear here.
            </div>
          )}
        </div>
      </section>

      {/* =================================
          5. LARGE BACKGROUND BANNER
      ================================= */}

      <section
        className="
          px-4
          pb-[65px]
          sm:px-5
        "
      >
        <div
          className="
            relative
            mx-auto
            min-h-[280px]
            max-w-[1200px]
            overflow-hidden
            rounded-[22px]
            bg-[#f5e6d0]
          "
        >
          {settings.backgroundBanner
            ?.image && (
            <img
              src={getImageUrl(
                settings
                  .backgroundBanner
                  .image
              )}
              alt="Promotion"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />
          )}

          <div
            className="
              relative
              z-10
              flex
              min-h-[280px]
              flex-col
              justify-center
              px-8
              py-10
              sm:px-12
              lg:px-16
            "
          >
            <span
              className="
                text-[13px]
                font-bold
                uppercase
                tracking-[0.16em]
                text-[var(--primary-color)]
              "
            >
              {settings
                .backgroundBanner
                ?.subtitle ||
                "100% quality items"}
            </span>

            <h2
              className="
                mt-3
                max-w-[480px]
                text-[34px]
                font-black
                leading-[1.1]
                text-[#222]
                sm:text-[42px]
              "
            >
              {settings
                .backgroundBanner
                ?.title ||
                "The everyday grocery store !"}
            </h2>

            <Link
              to={
                settings
                  .backgroundBanner
                  ?.buttonUrl ||
                "/shop"
              }
              className="
                mt-7
                inline-flex
                w-fit
                items-center
                gap-4
                rounded-full
                bg-[var(--primary-color)]
                px-7
                py-3.5
                text-[13px]
                font-bold
                uppercase
                text-white
              "
            >
              Buy now

              <ShoppingBag
                size={15}
              />
            </Link>
          </div>
        </div>
      </section>

      {/* =================================
          7. SERVICE STRIP
      ================================= */}

      <section
        className="
          border-y
          border-gray-100
          bg-white
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1200px]
            grid-cols-1
            px-4
            py-8
            sm:grid-cols-2
            sm:px-5
            lg:grid-cols-4
          "
        >
          {[
            {
              icon: Truck,
              title:
                settings.freeDeliveryEnabled
                  ? "Free delivery"
                  : "Fast delivery",
              text:
                settings.estimatedDeliveryText ||
                "Orders from all items",
            },

            {
              icon: RefreshCcw,
              title:
                "Return & refund",
              text:
                "Easy shopping support",
            },

            {
              icon: Headphones,
              title:
                "Customer support",
              text:
                settings.phone ||
                "We are here to help",
            },

            {
              icon: Mail,
              title:
                "Join newsletter",
              text:
                "Get offers and updates",
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
                  border-gray-100
                  px-4
                  py-5
                  last:border-0
                  sm:border-b-0
                  lg:border-r
                  lg:last:border-r-0
                "
              >
                <div
                  className="
                    flex
                    h-[52px]
                    w-[52px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    bg-[#f4f7ef]
                    text-[var(--primary-color)]
                  "
                >
                  <Icon
                    size={23}
                  />
                </div>

                <div>
                  <h4
                    className="
                      text-[15px]
                      font-bold
                      text-[#222]
                    "
                  >
                    {title}
                  </h4>

                  <p
                    className="
                      mt-1
                      text-[12px]
                      text-gray-500
                    "
                  >
                    {text}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* =================================
          7. TESTIMONIALS
      ================================= */}

      <section
        className="
          bg-[#fbfbfb]
          py-[75px]
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
          <SectionTitle
            first="Happy client"
            second="love"
          />

          <div
            className="
              flex
              gap-5
              overflow-x-auto
              pb-3
              [scrollbar-width:none]
              [&::-webkit-scrollbar]:hidden
            "
          >
            {(testimonials.length >
            0
              ? testimonials
              : [
                  {
                    _id:
                      "testimonial-placeholder",
                    name:
                      "Store customer",
                    role:
                      "Customer",
                    comment:
                      `Thank you for shopping with ${settings.storeName || "our store"}. Customer reviews will appear here.`,
                  },
                ]
            ).map(
              (testimonial) => (
                <div
                  key={
                    testimonial._id
                  }
                  className="
                    min-w-[310px]
                    rounded-[18px]
                    bg-white
                    p-7
                    shadow-sm
                    sm:min-w-[360px]
                  "
                >
                  <div
                    className="
                      text-[54px]
                      font-black
                      leading-none
                      text-[var(--primary-color)]
                    "
                  >
                    “
                  </div>

                  <div
                    className="
                      mt-1
                      flex
                      gap-1
                    "
                  >
                    {Array.from({
                      length: 5,
                    }).map(
                      (_, index) => (
                        <Star
                          key={
                            index
                          }
                          size={13}
                          className="
                            fill-[#f5b52b]
                            text-[#f5b52b]
                          "
                        />
                      )
                    )}
                  </div>

                  <p
                    className="
                      mt-4
                      text-[14px]
                      leading-7
                      text-gray-600
                    "
                  >
                    {
                      testimonial.comment
                    }
                  </p>

                  <div
                    className="
                      mt-6
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <div
                      className="
                        flex
                        h-12
                        w-12
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        bg-[#eef5dd]
                      "
                    >
                      {testimonial.image ? (
                        <img
                          src={getImageUrl(
                            testimonial.image
                          )}
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
                            font-black
                            text-[var(--primary-color)]
                          "
                        >
                          {testimonial.name
                            ?.charAt(0)
                            ?.toUpperCase() ||
                            "C"}
                        </span>
                      )}
                    </div>

                    <div>
                      <div
                        className="
                          text-sm
                          font-bold
                          text-[#222]
                        "
                      >
                        {
                          testimonial.name
                        }
                      </div>

                      <div
                        className="
                          mt-1
                          text-xs
                          text-gray-400
                        "
                      >
                        {
                          testimonial.role
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* =================================
          8. DEAL OF THE DAY
      ================================= */}

      <section
        className="
          py-[75px]
        "
      >
        <div
          className="
            px-4
            sm:px-7
          "
        >
          <SectionTitle
            first="Deal of"
            second="the day"
          />

          {dealProducts.length >
          0 ? (
            <div
              className="
                flex
                gap-5
                overflow-x-auto
                pb-4
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
                xl:grid
                xl:grid-cols-4
                xl:overflow-visible
              "
            >
              {dealProducts
                .slice(0, 8)
                .map(
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
                    />
                  )
                )}
            </div>
          ) : (
            <div
              className="
                py-8
                text-center
                text-sm
                text-gray-400
              "
            >
              Deal products will
              appear here.
            </div>
          )}
        </div>
      </section>

      {/* =================================
          9. BRAND LOGOS
      ================================= */}

      {brandLogos.length > 0 && (
        <section
          className="
            border-t
            border-gray-100
            py-[60px]
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
                flex
                items-center
                gap-12
                overflow-x-auto
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              {brandLogos.map(
                (brand) => (
                  <div
                    key={
                      brand._id
                    }
                    className="
                      flex
                      min-w-[150px]
                      items-center
                      justify-center
                    "
                  >
                    <img
                      src={getImageUrl(
                        brand.image
                      )}
                      alt={
                        brand.name ||
                        "Brand"
                      }
                      className="
                        max-h-[65px]
                        max-w-[140px]
                        object-contain
                        opacity-70
                        transition
                        hover:opacity-100
                      "
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </section>
      )}

      {/* =================================
          BRAND OFFER STRIP
          Original Index17 places this
          under brand logos
      ================================= */}

      <section
        className="
          bg-[#202020]
          py-6
          text-white
        "
      >
        <div
          className="
            mx-auto
            flex
            max-w-[1200px]
            flex-col
            items-center
            justify-between
            gap-4
            px-4
            text-center
            sm:px-5
            lg:flex-row
            lg:text-left
          "
        >
          <div
            className="
              text-[17px]
              font-semibold
            "
          >
            Celebrate shopping
            with special offers!
          </div>

          <div
            className="
              text-sm
              text-white/70
            "
          >
            {settings.storeName ||
              "General Store"}{" "}
            — don't miss today's
            deals
          </div>

          <Link
            to="/shop"
            className="
              rounded-full
              bg-[var(--primary-color)]
              px-6
              py-2.5
              text-xs
              font-bold
              uppercase
              text-white
            "
          >
            Shop now
          </Link>
        </div>
      </section>

      {/* =================================
          10. POSITIVE FOR STORY / BLOG
      ================================= */}

      {stories.length > 0 && (
        <section
          className="
            bg-white
            py-[75px]
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
            <SectionTitle
              first="Positive"
              second="for story"
            />

            <div
              className="
                grid
                grid-cols-1
                gap-6
                md:grid-cols-2
                lg:grid-cols-3
              "
            >
              {stories
                .slice(0, 3)
                .map(
                  (story) => (
                    <article
                      key={
                        story._id
                      }
                      className="
                        overflow-hidden
                        rounded-[18px]
                        border
                        border-gray-100
                        bg-white
                      "
                    >
                      {story.image && (
                        <div
                          className="
                            aspect-[1.5]
                            overflow-hidden
                            bg-gray-100
                          "
                        >
                          <img
                            src={getImageUrl(
                              story.image
                            )}
                            alt={
                              story.title
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                              transition
                              duration-500
                              hover:scale-105
                            "
                          />
                        </div>
                      )}

                      <div
                        className="
                          p-6
                        "
                      >
                        <h3
                          className="
                            text-[20px]
                            font-black
                            leading-7
                            text-[#222]
                          "
                        >
                          {
                            story.title
                          }
                        </h3>

                        {story.description && (
                          <p
                            className="
                              mt-3
                              line-clamp-2
                              text-sm
                              leading-6
                              text-gray-500
                            "
                          >
                            {
                              story.description
                            }
                          </p>
                        )}

                        <Link
                          to={
                            story.url ||
                            "/shop"
                          }
                          className="
                            mt-5
                            inline-flex
                            items-center
                            gap-2
                            text-sm
                            font-bold
                            text-[#222]
                            transition
                            hover:text-[var(--primary-color)]
                          "
                        >
                          Continue

                          <ArrowRight
                            size={15}
                          />
                        </Link>
                      </div>
                    </article>
                  )
                )}
            </div>
          </div>
        </section>
      )}

      {/* =================================
          MARQUEE CSS
      ================================= */}

      <style>
        {`
          @keyframes marquee {
            0% {
              transform: translateX(0);
            }

            100% {
              transform: translateX(-50%);
            }
          }
        `}
      </style>
    </div>
  );
};

export default HomePage;