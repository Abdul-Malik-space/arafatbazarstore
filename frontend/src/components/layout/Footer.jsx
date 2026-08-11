import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ArrowRight,
  Clock3,
  Mail,
  QrCode,
  Smartphone,
} from "lucide-react";

import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import {
  useSite,
} from "../../context/SiteContext";

import {
  getImageUrl,
} from "../../services/api";

// ========================================
// FOOTER
// VEGIST INDEX17 STYLE
// ========================================

const Footer = () => {
  const {
    settings,
  } = useSite();

  const [
    newsletterEmail,
    setNewsletterEmail,
  ] = useState("");

  // ======================================
  // LOGO
  // ======================================

  const logoUrl =
    settings.logo
      ? getImageUrl(
          settings.logo
        )
      : "";

  // ======================================
  // NEWSLETTER
  // ======================================

  const handleNewsletter = (
    event
  ) => {
    event.preventDefault();

    if (
      !newsletterEmail.trim()
    ) {
      return;
    }

    // Later:
    // newsletter API / dashboard
    setNewsletterEmail("");
  };

  // ======================================
  // SOCIAL ICON
  // ======================================

  const getSocialIcon = (
    platform = ""
  ) => {
    const value =
      platform.toLowerCase();

    if (
      value.includes(
        "facebook"
      )
    ) {
      return (
        <FaFacebookF />
      );
    }

    if (
      value.includes(
        "instagram"
      )
    ) {
      return (
        <FaInstagram />
      );
    }

    if (
      value === "x" ||
      value.includes(
        "twitter"
      )
    ) {
      return (
        <FaXTwitter />
      );
    }

    if (
      value.includes(
        "youtube"
      )
    ) {
      return (
        <FaYoutube />
      );
    }

    if (
      value.includes(
        "whatsapp"
      )
    ) {
      return (
        <FaWhatsapp />
      );
    }

    return null;
  };

  // ======================================
  // SOCIAL LINKS
  // ======================================

  const socialLinks =
    Array.isArray(
      settings.socialLinks
    )
      ? settings.socialLinks.filter(
          (social) =>
            social.isActive !==
            false
        )
      : [];

  // ======================================
  // FOOTER DESCRIPTION
  // ======================================

  const description =
    settings.footerDescription ||
    settings.aboutShort ||
    `Welcome to ${
      settings.storeName ||
      "our store"
    }. Shop everyday products easily and conveniently online.`;

  // ======================================
  // OPENING HOURS
  // Later controlled from dashboard
  // ======================================

  const openingHours =
    settings.openingHours || {
      mondayThursday:
        "8:30 AM to 8:30 PM",

      fridaySaturday:
        "8:30 AM to 4:30 PM",

      sunday:
        "Closed",
    };

  // ======================================
  // YEAR
  // ======================================

  const year =
    new Date().getFullYear();

  return (
    <>
      <footer
        className="
          bg-[#f7f7f7]
          text-[#555]
        "
      >
        {/* =================================
            FOOTER TOP
            NEWSLETTER + MOBILE APP
        ================================= */}

        <section
          className="
            border-b
            border-[#e4e4e4]
          "
        >
          <div
            className="
              mx-auto
              grid
              max-w-[1200px]
              grid-cols-1
              lg:grid-cols-2
            "
          >
            {/* =============================
                NEWSLETTER
            ============================= */}

            <div
              className="
                border-b
                border-[#e4e4e4]
                px-5
                py-10
                lg:border-b-0
                lg:border-r
                lg:px-10
              "
            >
              <div
                className="
                  flex
                  flex-col
                  gap-7
                "
              >
                {/* TITLE */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-5
                  "
                >
                  <div>
                    <h3
                      className="
                        text-[21px]
                        font-black
                        text-[#222]
                      "
                    >
                      Our subscribe
                      newsletter
                    </h3>

                    <p
                      className="
                        mt-2
                        text-[13px]
                        leading-6
                        text-[#777]
                      "
                    >
                      Don't miss any
                      promotion and get
                      the latest offers
                      from our store.
                    </p>
                  </div>

                  <Mail
                    size={38}
                    strokeWidth={1.3}
                    className="
                      shrink-0
                      text-[var(--primary-color)]
                    "
                  />
                </div>

                {/* EMAIL */}

                <form
                  onSubmit={
                    handleNewsletter
                  }
                  className="
                    flex
                    h-[52px]
                    overflow-hidden
                    rounded-[28px]
                    border
                    border-[#dddddd]
                    bg-white
                  "
                >
                  <input
                    type="email"
                    required
                    value={
                      newsletterEmail
                    }
                    onChange={(
                      event
                    ) =>
                      setNewsletterEmail(
                        event.target
                          .value
                      )
                    }
                    placeholder="Enter your email"
                    className="
                      min-w-0
                      flex-1
                      bg-transparent
                      px-5
                      text-[13px]
                      outline-none
                      placeholder:text-gray-400
                    "
                  />

                  <button
                    type="submit"
                    className="
                      flex
                      items-center
                      gap-2
                      bg-[#282828]
                      px-6
                      text-[12px]
                      font-bold
                      uppercase
                      text-white
                      transition
                      hover:bg-[var(--primary-color)]
                    "
                  >
                    Subscribe

                    <ArrowRight
                      size={14}
                    />
                  </button>
                </form>
              </div>
            </div>

            {/* =============================
                MOBILE APP AREA
                Images added later
                from Admin Dashboard
            ============================= */}

            <div
              className="
                flex
                flex-col
                justify-center
                px-5
                py-10
                lg:px-10
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-5
                "
              >
                {/* QR PLACEHOLDER */}

                <div
                  className="
                    flex
                    h-[78px]
                    w-[78px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-[10px]
                    bg-white
                    text-[var(--primary-color)]
                  "
                >
                  {settings.appQrImage ? (
                    <img
                      src={getImageUrl(
                        settings
                          .appQrImage
                      )}
                      alt="App QR Code"
                      className="
                        h-full
                        w-full
                        object-contain
                        p-2
                      "
                    />
                  ) : (
                    <QrCode
                      size={38}
                    />
                  )}
                </div>

                <div
                  className="
                    min-w-0
                    flex-1
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <Smartphone
                      size={28}
                      className="
                        text-[var(--primary-color)]
                      "
                    />

                    <h3
                      className="
                        text-[21px]
                        font-black
                        text-[#222]
                      "
                    >
                      Mobile app store
                    </h3>
                  </div>

                  <p
                    className="
                      mt-2
                      text-[13px]
                      leading-6
                      text-[#777]
                    "
                  >
                    Check promotions
                    and shop quickly
                    from your mobile.
                  </p>

                  {/* APP BUTTONS */}

                  <div
                    className="
                      mt-4
                      flex
                      flex-wrap
                      gap-2
                    "
                  >
                    {settings
                      .googlePlayImage ? (
                      <img
                        src={getImageUrl(
                          settings
                            .googlePlayImage
                        )}
                        alt="Google Play"
                        className="
                          h-[38px]
                          w-auto
                          object-contain
                        "
                      />
                    ) : (
                      <div
                        className="
                          rounded-[6px]
                          bg-[#282828]
                          px-4
                          py-2
                          text-[11px]
                          font-semibold
                          text-white
                        "
                      >
                        Google Play
                      </div>
                    )}

                    {settings
                      .appStoreImage ? (
                      <img
                        src={getImageUrl(
                          settings
                            .appStoreImage
                        )}
                        alt="App Store"
                        className="
                          h-[38px]
                          w-auto
                          object-contain
                        "
                      />
                    ) : (
                      <div
                        className="
                          rounded-[6px]
                          bg-[#282828]
                          px-4
                          py-2
                          text-[11px]
                          font-semibold
                          text-white
                        "
                      >
                        App Store
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================
            MAIN FOOTER
        ================================= */}

        <section
          className="
            py-[60px]
          "
        >
          <div
            className="
              mx-auto
              grid
              max-w-[1200px]
              grid-cols-1
              gap-10
              px-5
              sm:grid-cols-2
              lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.15fr]
            "
          >
            {/* =============================
                LOGO + DESCRIPTION
            ============================= */}

            <div>
              <Link
                to="/"
                className="
                  inline-flex
                "
              >
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={
                      settings.storeName ||
                      "Store"
                    }
                    className="
                      max-h-[72px]
                      max-w-[180px]
                      object-contain
                      object-left
                    "
                  />
                ) : (
                  <div
                    className="
                      text-[24px]
                      font-black
                      leading-tight
                      text-[#222]
                    "
                  >
                    {settings.storeName ||
                      "General Store"}
                  </div>
                )}
              </Link>

              <p
                className="
                  mt-5
                  max-w-[270px]
                  text-[13px]
                  leading-7
                  text-[#777]
                "
              >
                {description}
              </p>

              {/* SOCIAL */}

              <div
                className="
                  mt-6
                "
              >
                <span
                  className="
                    text-[13px]
                    font-semibold
                    text-[#333]
                  "
                >
                  Followed by :
                </span>

                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  {socialLinks.length >
                  0 ? (
                    socialLinks.map(
                      (social) => {
                        const icon =
                          getSocialIcon(
                            social.platform
                          );

                        if (!icon) {
                          return null;
                        }

                        return (
                          <a
                            key={
                              social._id ||
                              social.platform
                            }
                            href={
                              social.url
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="
                              flex
                              h-9
                              w-9
                              items-center
                              justify-center
                              rounded-full
                              bg-white
                              text-[#444]
                              transition
                              hover:bg-[var(--primary-color)]
                              hover:text-white
                            "
                          >
                            {icon}
                          </a>
                        );
                      }
                    )
                  ) : (
                    <>
                      <span
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-[#444]
                        "
                      >
                        <FaFacebookF />
                      </span>

                      <span
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          bg-white
                          text-[#444]
                        "
                      >
                        <FaInstagram />
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* =============================
                INFORMATION
            ============================= */}

            <FooterColumn
              title="Information"
              links={[
                {
                  label:
                    "About story",
                  url: "/about",
                },
                {
                  label:
                    "Privacy policy",
                  url:
                    "/privacy-policy",
                },
                {
                  label:
                    "Return policy",
                  url:
                    "/return-policy",
                },
                {
                  label:
                    "Track order",
                  url:
                    "/track-order",
                },
                {
                  label:
                    "Contact us",
                  url: "/contact",
                },
              ]}
            />

            {/* =============================
                MY ACCOUNT
            ============================= */}

            <FooterColumn
              title="My account"
              links={[
                {
                  label:
                    "My order",
                  url:
                    "/track-order",
                },
                {
                  label:
                    "Shopping cart",
                  url: "/cart",
                },
                {
                  label:
                    "Shop",
                  url: "/shop",
                },
                {
                  label:
                    "Wishlist",
                  url: "#",
                },
                {
                  label:
                    "Account details",
                  url: "#",
                },
              ]}
            />

            {/* =============================
                CUSTOMER CARE
            ============================= */}

            <FooterColumn
              title="Customer care"
              links={[
                {
                  label:
                    "Payment method",
                  url: "/checkout",
                },
                {
                  label:
                    "Help & support",
                  url: "/contact",
                },
                {
                  label:
                    "Terms & conditions",
                  url:
                    "/terms-conditions",
                },
                {
                  label:
                    "My wishlist",
                  url: "#",
                },
                {
                  label:
                    "Client reviews",
                  url: "/",
                },
              ]}
            />

            {/* =============================
                OPENING HOURS
            ============================= */}

            <div>
              <h3
                className="
                  text-[17px]
                  font-black
                  text-[#222]
                "
              >
                Opening hours
              </h3>

              <div
                className="
                  mt-5
                  space-y-4
                "
              >
                <div
                  className="
                    flex
                    gap-3
                  "
                >
                  <Clock3
                    size={17}
                    className="
                      mt-1
                      shrink-0
                      text-[var(--primary-color)]
                    "
                  />

                  <div
                    className="
                      text-[13px]
                      leading-6
                      text-[#777]
                    "
                  >
                    <strong
                      className="
                        block
                        text-[#444]
                      "
                    >
                      Monday to
                      Thursday
                    </strong>

                    {openingHours
                      .mondayThursday ||
                      "8:30 AM to 8:30 PM"}
                  </div>
                </div>

                <div
                  className="
                    flex
                    gap-3
                  "
                >
                  <Clock3
                    size={17}
                    className="
                      mt-1
                      shrink-0
                      text-[var(--primary-color)]
                    "
                  />

                  <div
                    className="
                      text-[13px]
                      leading-6
                      text-[#777]
                    "
                  >
                    <strong
                      className="
                        block
                        text-[#444]
                      "
                    >
                      Friday to
                      Saturday
                    </strong>

                    {openingHours
                      .fridaySaturday ||
                      "8:30 AM to 4:30 PM"}
                  </div>
                </div>

                <div
                  className="
                    flex
                    gap-3
                  "
                >
                  <Clock3
                    size={17}
                    className="
                      mt-1
                      shrink-0
                      text-[var(--primary-color)]
                    "
                  />

                  <div
                    className="
                      text-[13px]
                      leading-6
                      text-[#777]
                    "
                  >
                    <strong
                      className="
                        block
                        text-[#444]
                      "
                    >
                      Sunday
                    </strong>

                    <span
                      className="
                        text-red-500
                      "
                    >
                      {openingHours
                        .sunday ||
                        "Closed"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </footer>

      {/* =================================
          COPYRIGHT
      ================================= */}

      <section
        className="
          border-t
          border-[#eeeeee]
          bg-white
        "
      >
        <div
          className="
            mx-auto
            max-w-[1200px]
            px-5
            py-5
            text-center
          "
        >
          <p
            className="
              text-[12px]
              text-[#777]
            "
          >
            © {year}{" "}
            {settings.storeName ||
              "General Store"}.
            All rights reserved.
          </p>
        </div>
      </section>
    </>
  );
};

// ========================================
// FOOTER COLUMN
// ========================================

const FooterColumn = ({
  title,
  links,
}) => {
  return (
    <div>
      <h3
        className="
          text-[17px]
          font-black
          text-[#222]
        "
      >
        {title}
      </h3>

      <ul
        className="
          mt-5
          space-y-[13px]
        "
      >
        {links.map(
          (item) => (
            <li
              key={
                item.label
              }
            >
              {item.url ===
              "#" ? (
                <span
                  className="
                    cursor-default
                    text-[13px]
                    text-[#777]
                  "
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.url}
                  className="
                    text-[13px]
                    text-[#777]
                    transition
                    hover:text-[var(--primary-color)]
                  "
                >
                  {item.label}
                </Link>
              )}
            </li>
          )
        )}
      </ul>
    </div>
  );
};

export default Footer;