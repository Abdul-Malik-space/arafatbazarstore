import { Link } from "react-router-dom";

import {
  ChevronRight,
  Headphones,
  PackageCheck,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import { useSite } from "../context/SiteContext";
import { getImageUrl } from "../services/api";

// ========================================
// ABOUT PAGE
// ========================================

const AboutPage = () => {
  const { settings } = useSite();

  // ======================================
  // OPTIONAL STORE IMAGE
  //
  // اگر بعد میں dashboard سے کوئی about
  // image field add کریں تو یہاں استعمال
  // کر سکتے ہیں۔
  // فی الحال promotional banner image
  // fallback کے طور پر لے رہے ہیں۔
  // ======================================

  const aboutImage =
    settings.promotionalBanners?.find(
      (banner) =>
        banner.isActive !== false &&
        banner.image
    )?.image || "";

  const imageUrl = aboutImage
    ? getImageUrl(aboutImage)
    : "";

  // ======================================
  // STORE ADDRESS
  // ======================================

  const locationText = [
    settings.address,
    settings.city,
    settings.province,
    settings.country,
  ]
    .filter(Boolean)
    .join(", ");

  // ======================================
  // BENEFITS
  // ======================================

  const benefits = [
    {
      icon: PackageCheck,
      title: "Quality Products",
      description:
        "We focus on reliable everyday products for your home and family.",
    },

    {
      icon: Truck,
      title: "Fast Delivery",
      description:
        settings.estimatedDeliveryText ||
        "Fast and reliable delivery to your doorstep.",
    },

    {
      icon: ShieldCheck,
      title: "Secure Shopping",
      description:
        "Shop with confidence through a simple and reliable ordering process.",
    },

    {
      icon: Headphones,
      title: "Customer Support",
      description:
        settings.phone
          ? `Need help? Contact us at ${settings.phone}.`
          : "Our team is available to help with your orders.",
    },
  ];

  return (
    <div className="bg-white">
      {/* =================================
          PAGE TITLE / BREADCRUMB
      ================================= */}

      <section
        className="
          border-b
          border-gray-100
          bg-[#f7f8f5]
        "
      >
        <div
          className="
            mx-auto
            max-w-[1320px]
            px-4
            py-10
            text-center
            sm:px-5
            lg:py-12
          "
        >
          <h1
            className="
              text-3xl
              font-black
              text-gray-900
              sm:text-4xl
            "
          >
            About Us
          </h1>

          <div
            className="
              mt-3
              flex
              items-center
              justify-center
              gap-2
              text-sm
              text-gray-500
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

            <ChevronRight size={14} />

            <span className="text-gray-800">
              About Us
            </span>
          </div>
        </div>
      </section>

      {/* =================================
          ABOUT MAIN SECTION
      ================================= */}

      <section
        className="
          py-12
          lg:py-16
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1320px]
            grid-cols-1
            items-center
            gap-10
            px-4
            sm:px-5
            lg:grid-cols-2
            lg:gap-16
          "
        >
          {/* IMAGE */}

          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              bg-[#f4f8ef]
            "
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={
                  settings.storeName ||
                  "General Store"
                }
                className="
                  h-full
                  min-h-[420px]
                  w-full
                  object-cover
                "
              />
            ) : (
              <div
                className="
                  flex
                  min-h-[420px]
                  items-center
                  justify-center
                  bg-gradient-to-br
                  from-[#edf5e7]
                  to-[#f8faf6]
                "
              >
                <div className="text-center">
                  <div
                    className="
                      mx-auto
                      flex
                      h-24
                      w-24
                      items-center
                      justify-center
                      rounded-full
                      bg-white
                      text-[var(--primary-color)]
                      shadow-sm
                    "
                  >
                    <ShoppingBag
                      size={42}
                    />
                  </div>

                  <div
                    className="
                      mt-5
                      text-2xl
                      font-black
                      text-gray-900
                    "
                  >
                    {settings.storeName ||
                      "General Store"}
                  </div>

                  {settings.storeTagline && (
                    <p
                      className="
                        mt-2
                        text-sm
                        text-gray-500
                      "
                    >
                      {settings.storeTagline}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* CONTENT */}

          <div>
            <span
              className="
                text-sm
                font-bold
                uppercase
                tracking-[0.18em]
                text-[var(--primary-color)]
              "
            >
              About Our Store
            </span>

            <h2
              className="
                mt-3
                text-3xl
                font-black
                leading-tight
                text-gray-900
                sm:text-4xl
              "
            >
              Welcome to{" "}
              {settings.storeName ||
                "General Store"}
            </h2>

            <div
              className="
                mt-4
                h-[3px]
                w-14
                rounded-full
                bg-[var(--primary-color)]
              "
            />

            <div
              className="
                mt-6
                space-y-5
                text-[15px]
                leading-8
                text-gray-600
              "
            >
              <p>
                {settings.aboutShort ||
                  `${settings.storeName || "Our store"} is your convenient destination for everyday grocery, household and general store products.`}
              </p>

              {settings.aboutFull ? (
                <div className="whitespace-pre-line">
                  {settings.aboutFull}
                </div>
              ) : (
                <>
                  <p>
                    Our goal is to make
                    everyday shopping easy,
                    simple and reliable. You
                    can browse products,
                    check prices, add items
                    to your cart and place
                    your order directly
                    through our website.
                  </p>

                  <p>
                    We aim to provide
                    dependable products,
                    clear pricing and
                    convenient delivery for
                    our customers.
                  </p>
                </>
              )}
            </div>

            {/* LOCATION */}

            {locationText && (
              <div
                className="
                  mt-7
                  rounded-xl
                  bg-[#f7f8f5]
                  p-5
                "
              >
                <div
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-gray-400
                  "
                >
                  Our Location
                </div>

                <div
                  className="
                    mt-2
                    text-sm
                    font-semibold
                    leading-6
                    text-gray-800
                  "
                >
                  {locationText}
                </div>
              </div>
            )}

            <Link
              to="/shop"
              className="
                mt-8
                inline-flex
                items-center
                justify-center
                rounded-full
                bg-[var(--primary-color)]
                px-7
                py-3.5
                text-sm
                font-bold
                text-white
                transition
                hover:opacity-90
              "
            >
              Shop Now
            </Link>
          </div>
        </div>
      </section>

      {/* =================================
          STORE BENEFITS
      ================================= */}

      <section
        className="
          border-y
          border-gray-100
          bg-[#fafafa]
          py-10
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1320px]
            grid-cols-1
            gap-6
            px-4
            sm:grid-cols-2
            sm:px-5
            lg:grid-cols-4
          "
        >
          {benefits.map(
            ({
              icon: Icon,
              title,
              description,
            }) => (
              <div
                key={title}
                className="
                  flex
                  items-start
                  gap-4
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
                    bg-green-50
                    text-[var(--primary-color)]
                  "
                >
                  <Icon size={22} />
                </div>

                <div>
                  <h3
                    className="
                      text-sm
                      font-bold
                      text-gray-900
                    "
                  >
                    {title}
                  </h3>

                  <p
                    className="
                      mt-1
                      text-xs
                      leading-6
                      text-gray-500
                    "
                  >
                    {description}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* =================================
          WHY CHOOSE US
      ================================= */}

      <section
        className="
          py-12
          lg:py-16
        "
      >
        <div
          className="
            mx-auto
            max-w-[1000px]
            px-4
            text-center
            sm:px-5
          "
        >
          <span
            className="
              text-sm
              font-bold
              uppercase
              tracking-[0.18em]
              text-[var(--primary-color)]
            "
          >
            Why Choose Us
          </span>

          <h2
            className="
              mt-3
              text-3xl
              font-black
              text-gray-900
            "
          >
            Simple Shopping for
            Everyday Needs
          </h2>

          <p
            className="
              mx-auto
              mt-5
              max-w-2xl
              text-sm
              leading-7
              text-gray-500
            "
          >
            Browse products, add them
            to your cart, place your
            order and track it from one
            convenient website.
          </p>

          <div
            className="
              mt-8
              flex
              flex-col
              items-center
              justify-center
              gap-3
              sm:flex-row
            "
          >
            <Link
              to="/shop"
              className="
                inline-flex
                min-w-[150px]
                items-center
                justify-center
                rounded-full
                bg-[var(--primary-color)]
                px-6
                py-3
                text-sm
                font-bold
                text-white
              "
            >
              Visit Shop
            </Link>

            <Link
              to="/contact"
              className="
                inline-flex
                min-w-[150px]
                items-center
                justify-center
                rounded-full
                border
                border-gray-200
                px-6
                py-3
                text-sm
                font-bold
                text-gray-700
                transition
                hover:border-[var(--primary-color)]
                hover:text-[var(--primary-color)]
              "
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;