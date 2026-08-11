import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowRight,
  ChevronDown,
  FileText,
  Loader2,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getImageUrl,
} from "../services/api";

import {
  extractPageContent,
  getActiveFaqItems,
  getActivePageSections,
  getPublicPageBySlug,
  getPublicSystemPage,
  isExternalPageLink,
  isPageNotFoundError,
} from "../services/pageContent";

// ========================================
// DYNAMIC PAGE
//
// Universal renderer for:
//
// Custom Pages:
// /page/privacy-policy
// /page/delivery-information
// /page/returns-refunds
//
// Future System Pages:
//
// About
// Contact
// Shop
// Track Order
//
// Supported content:
//
// Hero
// Main Content
// Text Sections
// Image + Text
// Banner
// CTA
// FAQ
// SEO
// ========================================

const DynamicPage = ({
  systemKey = "",
}) => {
  const {
    slug,
  } = useParams();

  const [
    page,
    setPage,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    notFound,
    setNotFound,
  ] = useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    openFaq,
    setOpenFaq,
  ] = useState(null);

  // ======================================
  // LOAD PAGE
  // ======================================

  useEffect(() => {
    let cancelled = false;

    const loadPage =
      async () => {
        try {
          setLoading(true);
          setNotFound(false);
          setErrorMessage("");
          setPage(null);
          setOpenFaq(null);

          let response;

          // =================================
          // SYSTEM PAGE
          // =================================

          if (systemKey) {
            response =
              await getPublicSystemPage(
                systemKey
              );
          }

          // =================================
          // CUSTOM PAGE
          // =================================

          else {
            if (!slug) {
              setNotFound(true);
              return;
            }

            response =
              await getPublicPageBySlug(
                slug
              );
          }

          if (cancelled) {
            return;
          }

          const loadedPage =
            extractPageContent(
              response
            );

          if (!loadedPage) {
            setNotFound(true);
            return;
          }

          setPage(
            loadedPage
          );
        } catch (error) {
          if (cancelled) {
            return;
          }

          if (
            isPageNotFoundError(
              error
            )
          ) {
            setNotFound(true);
            return;
          }

          console.error(
            "Dynamic page load error:",
            error
          );

          setErrorMessage(
            error?.message ||
              "Unable to load this page."
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadPage();

    return () => {
      cancelled = true;
    };
  }, [
    slug,
    systemKey,
  ]);

  // ======================================
  // ACTIVE SECTIONS
  // ======================================

  const sections =
    useMemo(
      () =>
        getActivePageSections(
          page
        ),
      [page]
    );

  // ======================================
  // ACTIVE FAQ
  // ======================================

  const faqItems =
    useMemo(
      () =>
        getActiveFaqItems(
          page
        ),
      [page]
    );

  // ======================================
  // SEO
  // ======================================

  useEffect(() => {
    if (!page) {
      return;
    }

    const previousTitle =
      document.title;

    const pageTitle =
      page.metaTitle ||
      page.title ||
      "Page";

    document.title =
      pageTitle;

    // =====================================
    // META DESCRIPTION
    // =====================================

    let descriptionMeta =
      document.querySelector(
        'meta[name="description"]'
      );

    const createdDescription =
      !descriptionMeta;

    if (!descriptionMeta) {
      descriptionMeta =
        document.createElement(
          "meta"
        );

      descriptionMeta.setAttribute(
        "name",
        "description"
      );

      document.head.appendChild(
        descriptionMeta
      );
    }

    const oldDescription =
      descriptionMeta.getAttribute(
        "content"
      );

    descriptionMeta.setAttribute(
      "content",
      page.metaDescription ||
        page.shortDescription ||
        ""
    );

    // =====================================
    // CLEANUP
    // =====================================

    return () => {
      document.title =
        previousTitle;

      if (
        createdDescription
      ) {
        descriptionMeta.remove();
      } else {
        descriptionMeta.setAttribute(
          "content",
          oldDescription || ""
        );
      }
    };
  }, [page]);

  // ======================================
  // BUTTON / LINK
  // ======================================

  const renderButton = ({
    text,
    url,
    light = false,
  }) => {
    if (
      !text ||
      !url
    ) {
      return null;
    }

    const className = `
      inline-flex
      items-center
      justify-center
      gap-2
      rounded-full
      px-6
      py-3
      text-[13px]
      font-bold
      transition

      ${
        light
          ? `
              bg-white
              text-[#172033]
              hover:bg-gray-100
            `
          : `
              bg-[#172033]
              text-white
              hover:bg-[var(--primary-color)]
            `
      }
    `;

    if (
      isExternalPageLink(
        url
      )
    ) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={
            className
          }
        >
          {text}

          <ArrowRight
            size={15}
          />
        </a>
      );
    }

    return (
      <Link
        to={url}
        className={
          className
        }
      >
        {text}

        <ArrowRight
          size={15}
        />
      </Link>
    );
  };

  // ======================================
  // TEXT ALIGNMENT
  // ======================================

  const getTextAlignClass =
    (alignment) => {
      if (
        alignment ===
        "center"
      ) {
        return "text-center";
      }

      if (
        alignment ===
        "right"
      ) {
        return "text-right";
      }

      return "text-left";
    };

  // ======================================
  // TEXT BLOCK
  // ======================================

  const renderTextContent = (
    section
  ) => {
    const alignment =
      getTextAlignClass(
        section.textAlign
      );

    return (
      <div
        className={`
          ${alignment}
        `}
      >
        {section.subheading && (
          <div
            className="
              mb-2
              text-[12px]
              font-black
              uppercase
              tracking-[0.12em]
              text-[var(--primary-color)]
            "
          >
            {
              section.subheading
            }
          </div>
        )}

        {section.heading && (
          <h2
            className="
              text-[27px]
              font-black
              leading-[1.2]
              tracking-[-0.02em]
              text-[#172033]

              sm:text-[32px]
              lg:text-[36px]
            "
          >
            {
              section.heading
            }
          </h2>
        )}

        {section.content && (
          <div
            className="
              mt-4
              whitespace-pre-line
              text-[15px]
              leading-8
              text-[#687080]
            "
          >
            {
              section.content
            }
          </div>
        )}

        {section.buttonText &&
          section.buttonUrl && (
            <div
              className="
                mt-6
              "
            >
              {renderButton({
                text:
                  section.buttonText,

                url:
                  section.buttonUrl,
              })}
            </div>
          )}
      </div>
    );
  };

  // ======================================
  // TEXT SECTION
  // ======================================

  const renderTextSection = (
    section
  ) => {
    return (
      <section
        key={
          section._id
        }
        className="
          py-10
          sm:py-14
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1180px]
            px-5
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              mx-auto
              max-w-[900px]
            "
          >
            {renderTextContent(
              section
            )}
          </div>
        </div>
      </section>
    );
  };

  // ======================================
  // IMAGE + TEXT SECTION
  // ======================================

  const renderImageTextSection =
    (section) => {
      const imageUrl =
        section.image
          ? getImageUrl(
              section.image
            )
          : "";

      // Background image variation

      if (
        section.imagePosition ===
          "background" &&
        imageUrl
      ) {
        return (
          <section
            key={
              section._id
            }
            className="
              py-8
              sm:py-12
            "
          >
            <div
              className="
                mx-auto
                w-full
                max-w-[1180px]
                px-5
                sm:px-6
                lg:px-8
              "
            >
              <div
                className="
                  relative
                  min-h-[400px]
                  overflow-hidden
                  rounded-[24px]
                "
              >
                <img
                  src={
                    imageUrl
                  }
                  alt={
                    section.imageAlt ||
                    section.heading ||
                    ""
                  }
                  loading="lazy"
                  className="
                    absolute
                    inset-0
                    h-full
                    w-full
                    object-cover
                  "
                />

                <div
                  className="
                    absolute
                    inset-0
                    bg-black/50
                  "
                />

                <div
                  className="
                    relative
                    z-10
                    flex
                    min-h-[400px]
                    items-center
                    p-7
                    text-white
                    sm:p-10
                    lg:p-14
                  "
                >
                  <div
                    className="
                      max-w-[650px]
                    "
                  >
                    {section.subheading && (
                      <div
                        className="
                          mb-2
                          text-xs
                          font-black
                          uppercase
                          tracking-[0.12em]
                          text-white/80
                        "
                      >
                        {
                          section.subheading
                        }
                      </div>
                    )}

                    {section.heading && (
                      <h2
                        className="
                          text-[30px]
                          font-black
                          leading-tight

                          sm:text-[40px]
                        "
                      >
                        {
                          section.heading
                        }
                      </h2>
                    )}

                    {section.content && (
                      <p
                        className="
                          mt-4
                          whitespace-pre-line
                          text-[15px]
                          leading-8
                          text-white/85
                        "
                      >
                        {
                          section.content
                        }
                      </p>
                    )}

                    {section.buttonText &&
                      section.buttonUrl && (
                        <div
                          className="
                            mt-6
                          "
                        >
                          {renderButton({
                            text:
                              section.buttonText,

                            url:
                              section.buttonUrl,

                            light: true,
                          })}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      }

      const imageFirst =
        section.imagePosition ===
        "left";

      return (
        <section
          key={
            section._id
          }
          className="
            py-10
            sm:py-14
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1180px]
              px-5
              sm:px-6
              lg:px-8
            "
          >
            <div
              className={`
                grid
                items-center
                gap-8

                lg:grid-cols-2
                lg:gap-14

                ${
                  section.imagePosition ===
                  "top"
                    ? "lg:grid-cols-1"
                    : ""
                }
              `}
            >
              {imageUrl && (
                <div
                  className={`
                    ${
                      imageFirst
                        ? "lg:order-1"
                        : section.imagePosition ===
                            "right"
                          ? "lg:order-2"
                          : ""
                    }
                  `}
                >
                  <div
                    className="
                      overflow-hidden
                      rounded-[22px]
                      bg-[#f5f6f4]
                    "
                  >
                    <img
                      src={
                        imageUrl
                      }
                      alt={
                        section.imageAlt ||
                        section.heading ||
                        ""
                      }
                      loading="lazy"
                      className="
                        h-auto
                        max-h-[520px]
                        w-full
                        object-cover
                        object-center
                      "
                    />
                  </div>
                </div>
              )}

              <div
                className={`
                  ${
                    imageFirst
                      ? "lg:order-2"
                      : section.imagePosition ===
                          "right"
                        ? "lg:order-1"
                        : ""
                  }
                `}
              >
                {renderTextContent(
                  section
                )}
              </div>
            </div>
          </div>
        </section>
      );
    };

  // ======================================
  // BANNER SECTION
  // ======================================

  const renderBannerSection = (
    section
  ) => {
    const imageUrl =
      section.image
        ? getImageUrl(
            section.image
          )
        : "";

    return (
      <section
        key={
          section._id
        }
        className="
          py-8
          sm:py-12
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1180px]
            px-5
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              relative
              min-h-[330px]
              overflow-hidden
              rounded-[24px]
              bg-[#172033]
            "
          >
            {imageUrl && (
              <img
                src={
                  imageUrl
                }
                alt={
                  section.imageAlt ||
                  section.heading ||
                  ""
                }
                loading="lazy"
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
                absolute
                inset-0
                bg-gradient-to-r
                from-black/70
                via-black/45
                to-black/20
              "
            />

            <div
              className="
                relative
                z-10
                flex
                min-h-[330px]
                items-center
                px-7
                py-10
                sm:px-10
                lg:px-14
              "
            >
              <div
                className="
                  max-w-[650px]
                  text-white
                "
              >
                {section.subheading && (
                  <div
                    className="
                      mb-2
                      text-[12px]
                      font-black
                      uppercase
                      tracking-[0.14em]
                      text-white/75
                    "
                  >
                    {
                      section.subheading
                    }
                  </div>
                )}

                {section.heading && (
                  <h2
                    className="
                      text-[30px]
                      font-black
                      leading-[1.15]

                      sm:text-[40px]
                      lg:text-[46px]
                    "
                  >
                    {
                      section.heading
                    }
                  </h2>
                )}

                {section.content && (
                  <p
                    className="
                      mt-4
                      max-w-[570px]
                      whitespace-pre-line
                      text-[15px]
                      leading-7
                      text-white/85
                    "
                  >
                    {
                      section.content
                    }
                  </p>
                )}

                {section.buttonText &&
                  section.buttonUrl && (
                    <div
                      className="
                        mt-6
                      "
                    >
                      {renderButton({
                        text:
                          section.buttonText,

                        url:
                          section.buttonUrl,

                        light: true,
                      })}
                    </div>
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // ======================================
  // CTA SECTION
  // ======================================

  const renderCtaSection = (
    section
  ) => {
    return (
      <section
        key={
          section._id
        }
        className="
          py-10
          sm:py-14
        "
      >
        <div
          className="
            mx-auto
            w-full
            max-w-[1180px]
            px-5
            sm:px-6
            lg:px-8
          "
        >
          <div
            className="
              rounded-[24px]
              bg-[#f2f6ed]
              px-6
              py-10
              text-center

              sm:px-10
              sm:py-12
            "
          >
            {section.subheading && (
              <div
                className="
                  mb-2
                  text-[12px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-[var(--primary-color)]
                "
              >
                {
                  section.subheading
                }
              </div>
            )}

            {section.heading && (
              <h2
                className="
                  mx-auto
                  max-w-[760px]
                  text-[28px]
                  font-black
                  leading-tight
                  text-[#172033]

                  sm:text-[36px]
                "
              >
                {
                  section.heading
                }
              </h2>
            )}

            {section.content && (
              <p
                className="
                  mx-auto
                  mt-4
                  max-w-[720px]
                  whitespace-pre-line
                  text-[15px]
                  leading-7
                  text-[#687080]
                "
              >
                {
                  section.content
                }
              </p>
            )}

            {section.buttonText &&
              section.buttonUrl && (
                <div
                  className="
                    mt-7
                  "
                >
                  {renderButton({
                    text:
                      section.buttonText,

                    url:
                      section.buttonUrl,
                  })}
                </div>
              )}
          </div>
        </div>
      </section>
    );
  };

  // ======================================
  // FAQ SECTION HEADING
  //
  // sectionType "faq" can be used as
  // introduction before actual FAQ items.
  // ======================================

  const renderFaqHeadingSection =
    (section) => {
      return (
        <section
          key={
            section._id
          }
          className="
            pt-10
            sm:pt-14
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[900px]
              px-5
              text-center
              sm:px-6
            "
          >
            {section.subheading && (
              <div
                className="
                  text-[12px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-[var(--primary-color)]
                "
              >
                {
                  section.subheading
                }
              </div>
            )}

            {section.heading && (
              <h2
                className="
                  mt-2
                  text-[28px]
                  font-black
                  text-[#172033]

                  sm:text-[36px]
                "
              >
                {
                  section.heading
                }
              </h2>
            )}

            {section.content && (
              <p
                className="
                  mt-3
                  whitespace-pre-line
                  text-[15px]
                  leading-7
                  text-[#687080]
                "
              >
                {
                  section.content
                }
              </p>
            )}
          </div>
        </section>
      );
    };

  // ======================================
  // SECTION SWITCH
  // ======================================

  const renderSection = (
    section
  ) => {
    switch (
      section.sectionType
    ) {
      case "imageText":
        return renderImageTextSection(
          section
        );

      case "banner":
        return renderBannerSection(
          section
        );

      case "cta":
        return renderCtaSection(
          section
        );

      case "faq":
        return renderFaqHeadingSection(
          section
        );

      case "text":
      default:
        return renderTextSection(
          section
        );
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
          min-h-[520px]
          items-center
          justify-center
          bg-white
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
              text-[var(--primary-color)]
            "
          />

          <p
            className="
              mt-3
              text-sm
              font-semibold
              text-gray-400
            "
          >
            Loading page...
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // NOT FOUND
  // ======================================

  if (notFound) {
    return (
      <section
        className="
          flex
          min-h-[520px]
          items-center
          justify-center
          px-5
          py-16
        "
      >
        <div
          className="
            max-w-[500px]
            text-center
          "
        >
          <div
            className="
              mx-auto
              flex
              h-16
              w-16
              items-center
              justify-center
              rounded-2xl
              bg-[#f2f6ed]
              text-[var(--primary-color)]
            "
          >
            <FileText
              size={28}
            />
          </div>

          <h1
            className="
              mt-5
              text-[28px]
              font-black
              text-[#172033]
            "
          >
            Page Not Found
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-7
              text-gray-500
            "
          >
            This page may have
            been removed,
            unpublished or is no
            longer available.
          </p>

          <Link
            to="/"
            className="
              mt-6
              inline-flex
              items-center
              gap-2
              rounded-full
              bg-[#172033]
              px-6
              py-3
              text-sm
              font-bold
              text-white
              transition
              hover:bg-[var(--primary-color)]
            "
          >
            Back to Home

            <ArrowRight
              size={15}
            />
          </Link>
        </div>
      </section>
    );
  }

  // ======================================
  // ERROR
  // ======================================

  if (
    errorMessage ||
    !page
  ) {
    return (
      <section
        className="
          flex
          min-h-[520px]
          items-center
          justify-center
          px-5
          py-16
        "
      >
        <div
          className="
            max-w-[500px]
            text-center
          "
        >
          <h1
            className="
              text-[28px]
              font-black
              text-[#172033]
            "
          >
            Unable to Load Page
          </h1>

          <p
            className="
              mt-3
              text-sm
              leading-7
              text-gray-500
            "
          >
            {errorMessage ||
              "Something went wrong while loading this page."}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="
              mt-6
              rounded-full
              bg-[#172033]
              px-6
              py-3
              text-sm
              font-bold
              text-white
            "
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  // ======================================
  // HERO
  // ======================================

  const hero =
    page.hero || {};

  const heroImage =
    hero.image
      ? getImageUrl(
          hero.image
        )
      : "";

  const showHero =
    hero.isEnabled !==
      false &&
    Boolean(
      hero.heading ||
        hero.subheading ||
        hero.image
    );

  // ======================================
  // PAGE
  // ======================================

  return (
    <div
      className="
        bg-white
      "
    >
      {/* =================================
          HERO
      ================================= */}

      {showHero && (
        <section
          className="
            relative
            overflow-hidden
            bg-[#f4f6f2]
          "
        >
          {heroImage && (
            <>
              <img
                src={
                  heroImage
                }
                alt={
                  hero.imageAlt ||
                  hero.heading ||
                  page.title ||
                  ""
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

              <div
                className="
                  absolute
                  inset-0
                  bg-black/40
                "
              />
            </>
          )}

          <div
            className="
              relative
              z-10
              mx-auto
              flex
              min-h-[300px]
              w-full
              max-w-[1180px]
              items-center
              px-5
              py-14

              sm:min-h-[340px]
              sm:px-6

              lg:min-h-[380px]
              lg:px-8
            "
          >
            <div
              className={`
                max-w-[720px]

                ${
                  heroImage
                    ? "text-white"
                    : "text-[#172033]"
                }
              `}
            >
              {hero.subheading && (
                <div
                  className={`
                    mb-3
                    text-[12px]
                    font-black
                    uppercase
                    tracking-[0.14em]

                    ${
                      heroImage
                        ? "text-white/80"
                        : "text-[var(--primary-color)]"
                    }
                  `}
                >
                  {
                    hero.subheading
                  }
                </div>
              )}

              <h1
                className="
                  text-[34px]
                  font-black
                  leading-[1.1]
                  tracking-[-0.03em]

                  sm:text-[44px]
                  lg:text-[52px]
                "
              >
                {hero.heading ||
                  page.title}
              </h1>

              {hero.buttonText &&
                hero.buttonUrl && (
                  <div
                    className="
                      mt-7
                    "
                  >
                    {renderButton({
                      text:
                        hero.buttonText,

                      url:
                        hero.buttonUrl,

                      light:
                        Boolean(
                          heroImage
                        ),
                    })}
                  </div>
                )}
            </div>
          </div>
        </section>
      )}

      {/* =================================
          PAGE TITLE WITHOUT HERO
      ================================= */}

      {!showHero && (
        <section
          className="
            border-b
            border-gray-100
            bg-[#f7f8f6]
            py-12

            sm:py-16
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[1180px]
              px-5
              sm:px-6
              lg:px-8
            "
          >
            <h1
              className="
                text-[34px]
                font-black
                leading-tight
                text-[#172033]

                sm:text-[42px]
              "
            >
              {page.title}
            </h1>

            {page.shortDescription && (
              <p
                className="
                  mt-3
                  max-w-[760px]
                  text-[15px]
                  leading-7
                  text-[#687080]
                "
              >
                {
                  page.shortDescription
                }
              </p>
            )}
          </div>
        </section>
      )}

      {/* =================================
          INTRO / MAIN CONTENT
      ================================= */}

      {(page.shortDescription ||
        page.content) && (
        <section
          className="
            py-10
            sm:py-14
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[900px]
              px-5
              sm:px-6
              lg:px-8
            "
          >
            {showHero &&
              page.shortDescription && (
                <p
                  className="
                    mb-5
                    text-[18px]
                    font-semibold
                    leading-8
                    text-[#394252]
                  "
                >
                  {
                    page.shortDescription
                  }
                </p>
              )}

            {page.content && (
              <div
                className="
                  whitespace-pre-line
                  text-[15px]
                  leading-8
                  text-[#687080]
                "
              >
                {
                  page.content
                }
              </div>
            )}
          </div>
        </section>
      )}

      {/* =================================
          DYNAMIC SECTIONS
      ================================= */}

      {sections.map(
        (section) =>
          renderSection(
            section
          )
      )}

      {/* =================================
          FAQ ITEMS
      ================================= */}

      {faqItems.length >
        0 && (
        <section
          className="
            py-12
            sm:py-16
          "
        >
          <div
            className="
              mx-auto
              w-full
              max-w-[900px]
              px-5
              sm:px-6
              lg:px-8
            "
          >
            <div
              className="
                mb-8
                text-center
              "
            >
              <div
                className="
                  text-[12px]
                  font-black
                  uppercase
                  tracking-[0.12em]
                  text-[var(--primary-color)]
                "
              >
                Need Help?
              </div>

              <h2
                className="
                  mt-2
                  text-[30px]
                  font-black
                  text-[#172033]

                  sm:text-[36px]
                "
              >
                Frequently Asked
                Questions
              </h2>
            </div>

            <div
              className="
                space-y-3
              "
            >
              {faqItems.map(
                (
                  item,
                  index
                ) => {
                  const isOpen =
                    openFaq ===
                    index;

                  return (
                    <div
                      key={
                        item._id ||
                        index
                      }
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-200
                        bg-white
                      "
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setOpenFaq(
                            isOpen
                              ? null
                              : index
                          )
                        }
                        className="
                          flex
                          w-full
                          items-center
                          justify-between
                          gap-5
                          px-5
                          py-5
                          text-left

                          sm:px-6
                        "
                      >
                        <span
                          className="
                            text-[15px]
                            font-bold
                            leading-6
                            text-[#172033]
                          "
                        >
                          {
                            item.question
                          }
                        </span>

                        <span
                          className="
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            bg-[#f2f6ed]
                            text-[var(--primary-color)]
                          "
                        >
                          <ChevronDown
                            size={17}
                            className={`
                              transition-transform
                              duration-300

                              ${
                                isOpen
                                  ? "rotate-180"
                                  : ""
                              }
                            `}
                          />
                        </span>
                      </button>

                      <div
                        className={`
                          grid
                          transition-all
                          duration-300

                          ${
                            isOpen
                              ? "grid-rows-[1fr]"
                              : "grid-rows-[0fr]"
                          }
                        `}
                      >
                        <div
                          className="
                            overflow-hidden
                          "
                        >
                          <div
                            className="
                              border-t
                              border-gray-100
                              px-5
                              py-5
                              whitespace-pre-line
                              text-[14px]
                              leading-7
                              text-[#687080]

                              sm:px-6
                            "
                          >
                            {
                              item.answer
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default DynamicPage;