import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  ChevronDown,
  ChevronRight,
  Heart,
  Mail,
  Menu,
  PhoneCall,
  Search,
  ShoppingBag,
  User,
  X,
} from "lucide-react";

import {
  useSite,
} from "../../context/SiteContext";

import {
  useCart,
} from "../../context/CartContext";

import {
  getImageUrl,
} from "../../services/api";

// ========================================
// API
// ========================================

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api"
).replace(/\/+$/, "");

// ========================================
// HEADER
// ========================================

const Header = () => {
  const {
    settings,
  } = useSite();

  const {
    cartCount,
  } = useCart();

  const navigate =
    useNavigate();

  const location =
    useLocation();

  // ======================================
  // SEARCH
  // ======================================

  const [
    searchText,
    setSearchText,
  ] = useState("");

  // ======================================
  // MOBILE
  // ======================================

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [
    expandedMobileCategory,
    setExpandedMobileCategory,
  ] = useState("");

  // ======================================
  // CATEGORIES
  // ======================================

  const [
    categoryTree,
    setCategoryTree,
  ] = useState([]);

  const [
    categoriesLoading,
    setCategoriesLoading,
  ] = useState(true);

  // ======================================
  // CMS PAGES
  // ======================================

  const [
    pageTree,
    setPageTree,
  ] = useState([]);

  const [
    pagesLoading,
    setPagesLoading,
  ] = useState(true);

  const [
    expandedMobilePage,
    setExpandedMobilePage,
  ] = useState("");

  // ======================================
  // CLOSE MOBILE MENU
  // ======================================

  useEffect(() => {
    setMobileMenuOpen(false);
    setExpandedMobileCategory("");
    setExpandedMobilePage("");
  }, [location.pathname]);

  // ======================================
  // LOCK BODY WHEN DRAWER OPEN
  // ======================================

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow =
        "hidden";
    } else {
      document.body.style.overflow =
        "";
    }

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [mobileMenuOpen]);

  // ======================================
  // ESC CLOSE MOBILE MENU
  // ======================================

  useEffect(() => {
    const handleEscape = (
      event
    ) => {
      if (
        event.key === "Escape"
      ) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () =>
      window.removeEventListener(
        "keydown",
        handleEscape
      );
  }, []);

  // ======================================
  // LOAD CATEGORY TREE
  // ======================================

  useEffect(() => {
    let cancelled = false;

    const loadCategoryTree =
      async () => {
        try {
          setCategoriesLoading(true);

          const response =
            await fetch(
              `${API_BASE_URL}/categories/tree`,
              {
                method: "GET",

                credentials:
                  "include",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to load categories."
            );
          }

          if (cancelled) {
            return;
          }

          const categories =
            Array.isArray(
              data?.categories
            )
              ? data.categories
              : [];

          const normalized =
            categories
              .filter(
                (category) =>
                  category?.isActive !==
                  false
              )
              .map(
                (category) => ({
                  ...category,

                  children:
                    Array.isArray(
                      category.children
                    )
                      ? category.children.filter(
                          (child) =>
                            child?.isActive !==
                            false
                        )
                      : [],
                })
              );

          setCategoryTree(
            normalized
          );
        } catch (error) {
          console.error(
            "Header category error:",
            error
          );

          if (!cancelled) {
            setCategoryTree([]);
          }
        } finally {
          if (!cancelled) {
            setCategoriesLoading(
              false
            );
          }
        }
      };

    loadCategoryTree();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================
  // LOAD HEADER CMS PAGES
  //
  // Dashboard:
  // Admin → Pages → Header Menu
  //
  // Public API:
  // /api/page-content/header
  // ======================================

  useEffect(() => {
    let cancelled = false;

    const loadHeaderPages =
      async () => {
        try {
          setPagesLoading(true);

          const response =
            await fetch(
              `${API_BASE_URL}/page-content/header`,
              {
                method: "GET",

                headers: {
                  Accept:
                    "application/json",
                },
              }
            );

          const data =
            await response.json();

          if (!response.ok) {
            throw new Error(
              data?.message ||
                "Failed to load header pages."
            );
          }

          if (cancelled) {
            return;
          }

          const pages =
            Array.isArray(
              data?.pages
            )
              ? data.pages
              : Array.isArray(
                    data?.data
                      ?.pages
                  )
                ? data.data
                    .pages
                : [];

          const normalized =
            pages
              .filter(
                (page) =>
                  page?.isActive !==
                    false &&
                  page?.isPublished !==
                    false &&
                  page?.showInHeader !==
                    false
              )
              .map(
                (page) => ({
                  ...page,

                  children:
                    Array.isArray(
                      page.children
                    )
                      ? page.children.filter(
                          (child) =>
                            child?.isActive !==
                              false &&
                            child?.isPublished !==
                              false &&
                            child?.showInHeader !==
                              false
                        )
                      : [],
                })
              );

          setPageTree(
            normalized
          );
        } catch (error) {
          console.error(
            "Header CMS pages error:",
            error
          );

          if (!cancelled) {
            setPageTree([]);
          }
        } finally {
          if (!cancelled) {
            setPagesLoading(
              false
            );
          }
        }
      };

    loadHeaderPages();

    return () => {
      cancelled = true;
    };
  }, []);

  // ======================================
  // SEARCH
  // ======================================

  const handleSearch = (
    event
  ) => {
    event.preventDefault();

    const value =
      searchText.trim();

    if (!value) {
      navigate("/shop");
      return;
    }

    navigate(
      `/shop?search=${encodeURIComponent(
        value
      )}`
    );
  };

  // ======================================
  // BASIC SETTINGS
  // ======================================

  const logoUrl =
    settings.logo
      ? getImageUrl(
          settings.logo
        )
      : "";

  const phone =
    settings.phone || "";

  const email =
    settings.email || "";

  const offerText =
    settings.announcementText ||
    settings.estimatedDeliveryText ||
    "";

  // ======================================
  // CATEGORY URL
  // ======================================

  const getCategoryUrl = (
    category
  ) => {
    if (!category?.slug) {
      return "/shop";
    }

    return `/shop/category/${category.slug}`;
  };

  // ======================================
  // ACTIVE CATEGORY GROUP
  // ======================================

  const isCategoryGroupActive = (
    category
  ) => {
    if (
      location.pathname ===
      getCategoryUrl(category)
    ) {
      return true;
    }

    return (
      category.children || []
    ).some(
      (child) =>
        location.pathname ===
        getCategoryUrl(child)
    );
  };

  // ======================================
  // MOBILE ACCORDION
  // ======================================

  const toggleMobileCategory = (
    categoryId
  ) => {
    setExpandedMobileCategory(
      (current) =>
        current === categoryId
          ? ""
          : categoryId
    );
  };

  // ======================================
  // DESKTOP MAIN CATEGORY
  // ======================================

  const renderDesktopCategory = (
    category
  ) => {
    const children =
      Array.isArray(
        category.children
      )
        ? category.children
        : [];

    const hasChildren =
      children.length > 0;

    const active =
      isCategoryGroupActive(
        category
      );

    // ------------------------------------
    // NO SUBCATEGORIES
    // ------------------------------------

    if (!hasChildren) {
      return (
        <NavLink
          key={category._id}
          to={getCategoryUrl(
            category
          )}
          className={`
            relative
            flex
            h-full
            shrink-0
            items-center
            whitespace-nowrap
            text-[12px]
            font-bold
            uppercase
            tracking-[0.035em]
            transition-colors
            duration-200

            2xl:text-[13px]

            ${
              active
                ? "text-[var(--primary-color)]"
                : "text-[#182033] hover:text-[var(--primary-color)]"
            }
          `}
        >
          {category.name}

          <span
            className={`
              absolute
              bottom-[18px]
              left-0
              h-[2px]
              rounded-full
              bg-[var(--primary-color)]
              transition-all
              duration-200

              ${
                active
                  ? "w-full"
                  : "w-0"
              }
            `}
          />
        </NavLink>
      );
    }

    // ------------------------------------
    // WITH DROPDOWN
    // ------------------------------------

    return (
      <div
        key={category._id}
        className="
          group
          relative
          flex
          h-full
          shrink-0
          items-center
        "
      >
        <Link
          to={getCategoryUrl(
            category
          )}
          className={`
            relative
            flex
            h-full
            items-center
            gap-[5px]
            whitespace-nowrap
            text-[12px]
            font-bold
            uppercase
            tracking-[0.035em]
            transition-colors
            duration-200

            2xl:text-[13px]

            ${
              active
                ? "text-[var(--primary-color)]"
                : "text-[#182033] group-hover:text-[var(--primary-color)]"
            }
          `}
        >
          <span>
            {category.name}
          </span>

          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className="
              mt-[1px]
              transition-transform
              duration-200
              group-hover:rotate-180
            "
          />

          <span
            className={`
              absolute
              bottom-[18px]
              left-0
              h-[2px]
              rounded-full
              bg-[var(--primary-color)]
              transition-all
              duration-200

              ${
                active
                  ? "w-full"
                  : "w-0 group-hover:w-full"
              }
            `}
          />
        </Link>

        {/* =================================
            DROPDOWN
        ================================= */}

        <div
          className="
            invisible
            absolute
            left-0
            top-[calc(100%-2px)]
            z-[100]
            min-w-[235px]
            translate-y-[10px]
            overflow-hidden
            rounded-[14px]
            border
            border-[#eeeeee]
            bg-white
            opacity-0
            shadow-[0_18px_45px_rgba(15,23,42,0.13)]
            transition-all
            duration-200

            group-hover:visible
            group-hover:translate-y-0
            group-hover:opacity-100

            group-focus-within:visible
            group-focus-within:translate-y-0
            group-focus-within:opacity-100
          "
        >
          {/* ALL CATEGORY */}

          <Link
            to={getCategoryUrl(
              category
            )}
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-gray-100
              bg-[#fbfcfa]
              px-[18px]
              py-[14px]
              text-[13px]
              font-bold
              text-[#182033]
              transition
              hover:bg-[#f3f7ed]
              hover:text-[var(--primary-color)]
            "
          >
            <span>
              All {category.name}
            </span>

            <ChevronRight
              size={15}
              strokeWidth={2}
            />
          </Link>

          {/* SUBCATEGORIES */}

          <div
            className="
              py-[5px]
            "
          >
            {children.map(
              (child) => (
                <NavLink
                  key={child._id}
                  to={getCategoryUrl(
                    child
                  )}
                  className={({
                    isActive,
                  }) => `
                    group/sub
                    flex
                    items-center
                    justify-between
                    gap-4
                    px-[18px]
                    py-[11px]
                    text-[13px]
                    font-medium
                    transition-all
                    duration-150

                    ${
                      isActive
                        ? "bg-[#f3f7ed] text-[var(--primary-color)]"
                        : "text-[#555d6d] hover:bg-[#f8f9f7] hover:text-[var(--primary-color)]"
                    }
                  `}
                >
                  <span>
                    {child.name}
                  </span>

                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className="
                      opacity-30
                      transition
                      group-hover/sub:translate-x-[2px]
                      group-hover/sub:opacity-70
                    "
                  />
                </NavLink>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  // ======================================
  // CMS PAGE HELPERS
  // ======================================

  const getPageUrl = (
    page
  ) => {
    if (
      page?.routePath
    ) {
      return page.routePath;
    }

    if (page?.slug) {
      return `/page/${page.slug}`;
    }

    return "/";
  };

  const getPageLabel = (
    page
  ) => {
    return (
      page?.menuLabel ||
      page?.title ||
      "Page"
    );
  };

  const isPageGroupActive = (
    page
  ) => {
    if (
      location.pathname ===
      getPageUrl(page)
    ) {
      return true;
    }

    return (
      page.children || []
    ).some(
      (child) =>
        location.pathname ===
        getPageUrl(child)
    );
  };

  const toggleMobilePage = (
    pageId
  ) => {
    setExpandedMobilePage(
      (current) =>
        current === pageId
          ? ""
          : pageId
    );
  };

  // ======================================
  // DESKTOP CMS PAGE
  // ======================================

  const renderDesktopPage = (
    page
  ) => {
    const children =
      Array.isArray(
        page.children
      )
        ? page.children
        : [];

    const hasChildren =
      children.length > 0;

    const active =
      isPageGroupActive(
        page
      );

    const pageUrl =
      getPageUrl(page);

    const pageLabel =
      getPageLabel(page);

    // ------------------------------------
    // PAGE WITHOUT CHILDREN
    // ------------------------------------

    if (!hasChildren) {
      return (
        <NavLink
          key={page._id}
          to={pageUrl}
          target={
            page.openInNewTab
              ? "_blank"
              : undefined
          }
          rel={
            page.openInNewTab
              ? "noreferrer"
              : undefined
          }
          className={`
            relative
            flex
            h-full
            shrink-0
            items-center
            whitespace-nowrap
            text-[12px]
            font-bold
            uppercase
            tracking-[0.035em]
            transition-colors
            duration-200

            2xl:text-[13px]

            ${
              active
                ? "text-[var(--primary-color)]"
                : "text-[#182033] hover:text-[var(--primary-color)]"
            }
          `}
        >
          {pageLabel}

          <span
            className={`
              absolute
              bottom-[18px]
              left-0
              h-[2px]
              rounded-full
              bg-[var(--primary-color)]
              transition-all
              duration-200

              ${
                active
                  ? "w-full"
                  : "w-0"
              }
            `}
          />
        </NavLink>
      );
    }

    // ------------------------------------
    // PAGE WITH DROPDOWN
    // ------------------------------------

    return (
      <div
        key={page._id}
        className="
          group
          relative
          flex
          h-full
          shrink-0
          items-center
        "
      >
        <Link
          to={pageUrl}
          target={
            page.openInNewTab
              ? "_blank"
              : undefined
          }
          rel={
            page.openInNewTab
              ? "noreferrer"
              : undefined
          }
          className={`
            relative
            flex
            h-full
            items-center
            gap-[5px]
            whitespace-nowrap
            text-[12px]
            font-bold
            uppercase
            tracking-[0.035em]
            transition-colors
            duration-200

            2xl:text-[13px]

            ${
              active
                ? "text-[var(--primary-color)]"
                : "text-[#182033] group-hover:text-[var(--primary-color)]"
            }
          `}
        >
          <span>
            {pageLabel}
          </span>

          <ChevronDown
            size={14}
            strokeWidth={2.2}
            className="
              mt-[1px]
              transition-transform
              duration-200
              group-hover:rotate-180
            "
          />

          <span
            className={`
              absolute
              bottom-[18px]
              left-0
              h-[2px]
              rounded-full
              bg-[var(--primary-color)]
              transition-all
              duration-200

              ${
                active
                  ? "w-full"
                  : "w-0 group-hover:w-full"
              }
            `}
          />
        </Link>

        {/* CMS PAGE DROPDOWN */}

        <div
          className="
            invisible
            absolute
            left-0
            top-[calc(100%-2px)]
            z-[100]
            min-w-[245px]
            translate-y-[10px]
            overflow-hidden
            rounded-[14px]
            border
            border-[#eeeeee]
            bg-white
            opacity-0
            shadow-[0_18px_45px_rgba(15,23,42,0.13)]
            transition-all
            duration-200

            group-hover:visible
            group-hover:translate-y-0
            group-hover:opacity-100

            group-focus-within:visible
            group-focus-within:translate-y-0
            group-focus-within:opacity-100
          "
        >
          <Link
            to={pageUrl}
            target={
              page.openInNewTab
                ? "_blank"
                : undefined
            }
            rel={
              page.openInNewTab
                ? "noreferrer"
                : undefined
            }
            className="
              flex
              items-center
              justify-between
              gap-4
              border-b
              border-gray-100
              bg-[#fbfcfa]
              px-[18px]
              py-[14px]
              text-[13px]
              font-bold
              text-[#182033]
              transition
              hover:bg-[#f3f7ed]
              hover:text-[var(--primary-color)]
            "
          >
            <span>
              All {pageLabel}
            </span>

            <ChevronRight
              size={15}
              strokeWidth={2}
            />
          </Link>

          <div
            className="
              py-[5px]
            "
          >
            {children.map(
              (child) => (
                <NavLink
                  key={child._id}
                  to={getPageUrl(
                    child
                  )}
                  target={
                    child.openInNewTab
                      ? "_blank"
                      : undefined
                  }
                  rel={
                    child.openInNewTab
                      ? "noreferrer"
                      : undefined
                  }
                  className={({
                    isActive,
                  }) => `
                    group/sub
                    flex
                    items-center
                    justify-between
                    gap-4
                    px-[18px]
                    py-[11px]
                    text-[13px]
                    font-medium
                    transition-all
                    duration-150

                    ${
                      isActive
                        ? "bg-[#f3f7ed] text-[var(--primary-color)]"
                        : "text-[#555d6d] hover:bg-[#f8f9f7] hover:text-[var(--primary-color)]"
                    }
                  `}
                >
                  <span>
                    {getPageLabel(
                      child
                    )}
                  </span>

                  <ChevronRight
                    size={14}
                    strokeWidth={2}
                    className="
                      opacity-30
                      transition
                      group-hover/sub:translate-x-[2px]
                      group-hover/sub:opacity-70
                    "
                  />
                </NavLink>
              )
            )}
          </div>
        </div>
      </div>
    );
  };

  // ======================================
  // RETURN
  // ======================================

  return (
    <header
      className="
        relative
        z-50
        bg-white
      "
    >
      {/* =================================
          DESKTOP TOP
      ================================= */}

      <div
        className="
          hidden
          xl:block
        "
      >
        <div
          className="
            flex
            min-h-[150px]
            items-center
            gap-5
            px-[30px]

            2xl:min-h-[160px]
          "
        >
          {/* LOGO */}

          <Link
            to="/"
            className="
              flex
              w-[175px]
              shrink-0
              items-center
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
                  max-h-[76px]
                  max-w-[155px]
                  object-contain
                  object-left
                "
              />
            ) : (
              <div
                className="
                  text-[23px]
                  font-black
                  leading-[1.18]
                  tracking-[-0.02em]
                  text-[#101828]
                "
              >
                {settings.storeName ||
                  "General Store"}
              </div>
            )}
          </Link>

          {/* SEARCH */}

          <div
            className="
              flex
              min-w-0
              flex-1
              justify-center
              px-4

              2xl:px-10
            "
          >
            <form
              onSubmit={
                handleSearch
              }
              className="
                flex
                h-[56px]
                w-full
                max-w-[540px]
                overflow-hidden
                rounded-full
                border
                border-[#dddddd]
                bg-white
                transition
                focus-within:border-[var(--primary-color)]
                focus-within:shadow-[0_0_0_3px_rgba(111,154,55,0.08)]
              "
            >
              <input
                type="search"
                value={
                  searchText
                }
                onChange={(
                  event
                ) =>
                  setSearchText(
                    event.target.value
                  )
                }
                placeholder="Find our search"
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  px-[25px]
                  text-[15px]
                  text-[#444]
                  outline-none
                  placeholder:text-[#858b97]
                "
              />

              <button
                type="submit"
                className="
                  flex
                  w-[76px]
                  shrink-0
                  items-center
                  justify-center
                  bg-[var(--primary-color)]
                  text-white
                  transition
                  hover:brightness-95
                "
                aria-label="Search"
              >
                <Search
                  size={21}
                  strokeWidth={1.8}
                />
              </button>
            </form>
          </div>

          {/* CONTACT */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-[22px]

              2xl:gap-[38px]
            "
          >
            {/* PHONE */}

            <div
              className="
                flex
                items-center
                gap-[12px]
              "
            >
              <div
                className="
                  flex
                  h-[54px]
                  w-[54px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#ededed]
                  text-red-500
                "
              >
                <PhoneCall
                  size={19}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <div
                  className="
                    text-[16px]
                    font-semibold
                    text-[#222]
                  "
                >
                  Call now :
                </div>

                {phone ? (
                  <a
                    href={`tel:${phone}`}
                    className="
                      mt-1
                      block
                      text-[14px]
                      text-[#888]
                      transition
                      hover:text-[var(--primary-color)]
                    "
                  >
                    {phone}
                  </a>
                ) : (
                  <div
                    className="
                      mt-1
                      text-[14px]
                      text-[#999]
                    "
                  >
                    Contact number
                  </div>
                )}
              </div>
            </div>

            {/* EMAIL */}

            <div
              className="
                flex
                items-center
                gap-[12px]
              "
            >
              <div
                className="
                  flex
                  h-[54px]
                  w-[54px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border
                  border-[#ededed]
                  text-red-500
                "
              >
                <Mail
                  size={19}
                  strokeWidth={1.6}
                />
              </div>

              <div>
                <div
                  className="
                    text-[16px]
                    font-semibold
                    text-[#222]
                  "
                >
                  Email now :
                </div>

                {email ? (
                  <a
                    href={`mailto:${email}`}
                    className="
                      mt-1
                      block
                      max-w-[175px]
                      truncate
                      text-[14px]
                      text-[#888]
                      transition
                      hover:text-[var(--primary-color)]
                    "
                  >
                    {email}
                  </a>
                ) : (
                  <div
                    className="
                      mt-1
                      text-[14px]
                      text-[#999]
                    "
                  >
                    Email address
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================
          DESKTOP NAVIGATION
      ================================= */}

      <div
        className="
          relative
          z-40
          hidden
          px-[30px]
          xl:block
        "
      >
        <div
          className="
            flex
            h-[79px]
            items-center
            rounded-[42px]
            bg-[#faf8f5]
            px-[30px]
            shadow-[0_1px_0_rgba(0,0,0,0.015)]
          "
        >
          {/* LEFT NAV */}

          <nav
            className="
              flex
              h-full
              min-w-0
              flex-1
              items-center
              gap-[16px]
              pr-[18px]

              2xl:gap-[25px]
              2xl:pr-[30px]
            "
          >
            {/* HOME */}

            <NavLink
              to="/"
              end
              className={({
                isActive,
              }) => `
                relative
                flex
                h-full
                shrink-0
                items-center
                whitespace-nowrap
                text-[12px]
                font-bold
                uppercase
                tracking-[0.035em]
                transition-colors
                duration-200

                2xl:text-[13px]

                ${
                  isActive
                    ? "text-[var(--primary-color)]"
                    : "text-[#182033] hover:text-[var(--primary-color)]"
                }
              `}
            >
              {({
                isActive,
              }) => (
                <>
                  Home

                  <span
                    className={`
                      absolute
                      bottom-[18px]
                      left-0
                      h-[2px]
                      rounded-full
                      bg-[var(--primary-color)]
                      transition-all

                      ${
                        isActive
                          ? "w-full"
                          : "w-0"
                      }
                    `}
                  />
                </>
              )}
            </NavLink>

            {/* CATEGORIES */}

            {categoryTree.map(
              (category) =>
                renderDesktopCategory(
                  category
                )
            )}

            {/* CMS PAGES */}

            {pageTree.map(
              (page) =>
                renderDesktopPage(
                  page
                )
            )}

            {/* LOADING */}

            {(categoriesLoading ||
              pagesLoading) && (
              <div
                className="
                  h-[16px]
                  w-[90px]
                  animate-pulse
                  rounded-full
                  bg-gray-200
                "
              />
            )}
          </nav>

          {/* RIGHT ICONS */}

          <div
            className="
              ml-auto
              flex
              shrink-0
              items-center
              gap-[12px]

              2xl:gap-[18px]
            "
          >
            {offerText && (
              <div
                className="
                  hidden
                  max-w-[210px]
                  truncate
                  pr-2
                  text-[13px]
                  text-[#777]

                  min-[1530px]:block
                "
              >
                {offerText}
              </div>
            )}

            {/* ACCOUNT */}

            <button
              type="button"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-[#20252e]
                transition
                hover:bg-white
                hover:text-[var(--primary-color)]
                hover:shadow-sm
              "
              aria-label="Account"
            >
              <User
                size={20}
                strokeWidth={1.7}
              />
            </button>

            {/* WISHLIST */}

            <button
              type="button"
              className="
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-[#20252e]
                transition
                hover:bg-white
                hover:text-[var(--primary-color)]
                hover:shadow-sm
              "
              aria-label="Wishlist"
            >
              <Heart
                size={21}
                strokeWidth={1.7}
              />
            </button>

            {/* CART */}

            <Link
              to="/cart"
              className="
                relative
                flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-[#20252e]
                transition
                hover:bg-white
                hover:text-[var(--primary-color)]
                hover:shadow-sm
              "
              aria-label="Shopping cart"
            >
              <ShoppingBag
                size={20}
                strokeWidth={1.7}
              />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -right-[3px]
                    -top-[4px]
                    flex
                    h-[20px]
                    min-w-[20px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#edf7d9]
                    px-[4px]
                    text-[9px]
                    font-black
                    text-[var(--primary-color)]
                  "
                >
                  {cartCount > 99
                    ? "99+"
                    : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* =================================
          MOBILE / TABLET HEADER
      ================================= */}

      <div
        className="
          bg-white
          xl:hidden
        "
      >
        <div
          className="
            flex
            min-h-[70px]
            items-center
            gap-3
            border-b
            border-gray-100
            px-4
          "
        >
          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(true)
            }
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              text-[#222]
              transition
              hover:bg-gray-100
            "
            aria-label="Open menu"
          >
            <Menu size={23} />
          </button>

          <Link
            to="/"
            className="
              flex
              min-w-0
              flex-1
              items-center
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
                  max-h-[46px]
                  max-w-[135px]
                  object-contain
                  object-left
                "
              />
            ) : (
              <div
                className="
                  truncate
                  text-xl
                  font-black
                  text-[#172033]
                "
              >
                {settings.storeName ||
                  "General Store"}
              </div>
            )}
          </Link>

          <Link
            to="/cart"
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
            "
          >
            <ShoppingBag
              size={21}
            />

            {cartCount > 0 && (
              <span
                className="
                  absolute
                  -right-[1px]
                  -top-[1px]
                  flex
                  h-[18px]
                  min-w-[18px]
                  items-center
                  justify-center
                  rounded-full
                  bg-[var(--primary-color)]
                  px-1
                  text-[9px]
                  font-bold
                  text-white
                "
              >
                {cartCount > 99
                  ? "99+"
                  : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* MOBILE SEARCH */}

        <div
          className="
            px-4
            py-3
          "
        >
          <form
            onSubmit={
              handleSearch
            }
            className="
              flex
              h-[46px]
              overflow-hidden
              rounded-full
              border
              border-gray-200
              bg-white
              focus-within:border-[var(--primary-color)]
            "
          >
            <input
              type="search"
              value={
                searchText
              }
              onChange={(
                event
              ) =>
                setSearchText(
                  event.target.value
                )
              }
              placeholder="Find our search"
              className="
                min-w-0
                flex-1
                px-5
                text-sm
                outline-none
              "
            />

            <button
              type="submit"
              className="
                flex
                w-[58px]
                items-center
                justify-center
                bg-[var(--primary-color)]
                text-white
              "
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* =================================
          MOBILE DRAWER
      ================================= */}

      {mobileMenuOpen && (
        <div
          className="
            fixed
            inset-0
            z-[200]
            xl:hidden
          "
        >
          {/* OVERLAY */}

          <button
            type="button"
            onClick={() =>
              setMobileMenuOpen(
                false
              )
            }
            className="
              absolute
              inset-0
              bg-black/45
              backdrop-blur-[1px]
            "
            aria-label="Close menu"
          />

          {/* DRAWER */}

          <div
            className="
              absolute
              bottom-0
              left-0
              top-0
              w-[340px]
              max-w-[88vw]
              overflow-y-auto
              bg-white
              shadow-[12px_0_40px_rgba(0,0,0,0.15)]
            "
          >
            {/* DRAWER HEADER */}

            <div
              className="
                sticky
                top-0
                z-20
                flex
                h-[72px]
                items-center
                justify-between
                border-b
                border-gray-100
                bg-white
                px-5
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
                    max-h-[46px]
                    max-w-[135px]
                    object-contain
                  "
                />
              ) : (
                <strong
                  className="
                    text-lg
                    text-[#172033]
                  "
                >
                  {settings.storeName ||
                    "Menu"}
                </strong>
              )}

              <button
                type="button"
                onClick={() =>
                  setMobileMenuOpen(
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
                  bg-gray-50
                  text-gray-700
                "
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* MENU */}

            <nav>
              <NavLink
                to="/"
                end
                className={({
                  isActive,
                }) => `
                  flex
                  w-full
                  items-center
                  border-b
                  border-gray-100
                  px-5
                  py-[15px]
                  text-[13px]
                  font-bold
                  uppercase
                  tracking-[0.04em]

                  ${
                    isActive
                      ? "bg-[#f4f8ee] text-[var(--primary-color)]"
                      : "text-[#28303d]"
                  }
                `}
              >
                Home
              </NavLink>

              {categoryTree.map(
                (category) => {
                  const children =
                    Array.isArray(
                      category.children
                    )
                      ? category.children
                      : [];

                  const hasChildren =
                    children.length > 0;

                  const expanded =
                    expandedMobileCategory ===
                    category._id;

                  const active =
                    isCategoryGroupActive(
                      category
                    );

                  // ------------------------
                  // NO CHILDREN
                  // ------------------------

                  if (!hasChildren) {
                    return (
                      <NavLink
                        key={
                          category._id
                        }
                        to={getCategoryUrl(
                          category
                        )}
                        className={`
                          flex
                          items-center
                          justify-between
                          border-b
                          border-gray-100
                          px-5
                          py-[15px]
                          text-[13px]
                          font-bold
                          uppercase
                          tracking-[0.04em]

                          ${
                            active
                              ? "bg-[#f4f8ee] text-[var(--primary-color)]"
                              : "text-[#28303d]"
                          }
                        `}
                      >
                        {category.name}

                        <ChevronRight
                          size={16}
                        />
                      </NavLink>
                    );
                  }

                  return (
                    <div
                      key={
                        category._id
                      }
                      className="
                        border-b
                        border-gray-100
                      "
                    >
                      {/* MAIN */}

                      <div
                        className={`
                          flex
                          items-stretch

                          ${
                            active
                              ? "bg-[#f4f8ee]"
                              : "bg-white"
                          }
                        `}
                      >
                        <Link
                          to={getCategoryUrl(
                            category
                          )}
                          className={`
                            flex
                            min-w-0
                            flex-1
                            items-center
                            px-5
                            py-[15px]
                            text-[13px]
                            font-bold
                            uppercase
                            tracking-[0.04em]

                            ${
                              active
                                ? "text-[var(--primary-color)]"
                                : "text-[#28303d]"
                            }
                          `}
                        >
                          {category.name}
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            toggleMobileCategory(
                              category._id
                            )
                          }
                          className="
                            flex
                            w-[54px]
                            shrink-0
                            items-center
                            justify-center
                            border-l
                            border-gray-100
                            text-gray-500
                          "
                          aria-expanded={
                            expanded
                          }
                        >
                          <ChevronDown
                            size={17}
                            className={`
                              transition-transform
                              duration-200

                              ${
                                expanded
                                  ? "rotate-180"
                                  : ""
                              }
                            `}
                          />
                        </button>
                      </div>

                      {/* SUBMENU */}

                      {expanded && (
                        <div
                          className="
                            bg-[#fafbf9]
                          "
                        >
                          <Link
                            to={getCategoryUrl(
                              category
                            )}
                            className="
                              flex
                              items-center
                              gap-2
                              border-b
                              border-gray-100
                              px-7
                              py-3
                              text-[13px]
                              font-semibold
                              text-[#424956]
                            "
                          >
                            <ChevronRight
                              size={13}
                            />

                            All{" "}
                            {category.name}
                          </Link>

                          {children.map(
                            (child) => (
                              <NavLink
                                key={
                                  child._id
                                }
                                to={getCategoryUrl(
                                  child
                                )}
                                className={({
                                  isActive,
                                }) => `
                                  flex
                                  items-center
                                  gap-2
                                  border-b
                                  border-gray-100
                                  px-7
                                  py-3
                                  text-[13px]
                                  transition

                                  ${
                                    isActive
                                      ? "font-semibold text-[var(--primary-color)]"
                                      : "text-[#646b77]"
                                  }
                                `}
                              >
                                <ChevronRight
                                  size={13}
                                  className="
                                    opacity-50
                                  "
                                />

                                {child.name}
                              </NavLink>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}

              {/* =================================
                  CMS PAGES
              ================================= */}

              {pageTree.map(
                (page) => {
                  const children =
                    Array.isArray(
                      page.children
                    )
                      ? page.children
                      : [];

                  const hasChildren =
                    children.length >
                    0;

                  const expanded =
                    expandedMobilePage ===
                    page._id;

                  const active =
                    isPageGroupActive(
                      page
                    );

                  const pageUrl =
                    getPageUrl(
                      page
                    );

                  const pageLabel =
                    getPageLabel(
                      page
                    );

                  // ------------------------
                  // NO CHILD PAGES
                  // ------------------------

                  if (!hasChildren) {
                    return (
                      <NavLink
                        key={page._id}
                        to={pageUrl}
                        target={
                          page.openInNewTab
                            ? "_blank"
                            : undefined
                        }
                        rel={
                          page.openInNewTab
                            ? "noreferrer"
                            : undefined
                        }
                        className={`
                          flex
                          items-center
                          justify-between
                          border-b
                          border-gray-100
                          px-5
                          py-[15px]
                          text-[13px]
                          font-bold
                          uppercase
                          tracking-[0.04em]

                          ${
                            active
                              ? "bg-[#f4f8ee] text-[var(--primary-color)]"
                              : "text-[#28303d]"
                          }
                        `}
                      >
                        {pageLabel}

                        <ChevronRight
                          size={16}
                        />
                      </NavLink>
                    );
                  }

                  // ------------------------
                  // PARENT PAGE
                  // ------------------------

                  return (
                    <div
                      key={page._id}
                      className="
                        border-b
                        border-gray-100
                      "
                    >
                      <div
                        className={`
                          flex
                          items-stretch

                          ${
                            active
                              ? "bg-[#f4f8ee]"
                              : "bg-white"
                          }
                        `}
                      >
                        <Link
                          to={pageUrl}
                          target={
                            page.openInNewTab
                              ? "_blank"
                              : undefined
                          }
                          rel={
                            page.openInNewTab
                              ? "noreferrer"
                              : undefined
                          }
                          className={`
                            flex
                            min-w-0
                            flex-1
                            items-center
                            px-5
                            py-[15px]
                            text-[13px]
                            font-bold
                            uppercase
                            tracking-[0.04em]

                            ${
                              active
                                ? "text-[var(--primary-color)]"
                                : "text-[#28303d]"
                            }
                          `}
                        >
                          {pageLabel}
                        </Link>

                        <button
                          type="button"
                          onClick={() =>
                            toggleMobilePage(
                              page._id
                            )
                          }
                          className="
                            flex
                            w-[54px]
                            shrink-0
                            items-center
                            justify-center
                            border-l
                            border-gray-100
                            text-gray-500
                          "
                          aria-label={`Toggle ${pageLabel} submenu`}
                          aria-expanded={
                            expanded
                          }
                        >
                          <ChevronDown
                            size={17}
                            className={`
                              transition-transform
                              duration-200

                              ${
                                expanded
                                  ? "rotate-180"
                                  : ""
                              }
                            `}
                          />
                        </button>
                      </div>

                      {expanded && (
                        <div
                          className="
                            bg-[#fafbf9]
                          "
                        >
                          <Link
                            to={pageUrl}
                            target={
                              page.openInNewTab
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              page.openInNewTab
                                ? "noreferrer"
                                : undefined
                            }
                            className="
                              flex
                              items-center
                              gap-2
                              border-b
                              border-gray-100
                              px-7
                              py-3
                              text-[13px]
                              font-semibold
                              text-[#424956]
                            "
                          >
                            <ChevronRight
                              size={13}
                            />

                            All{" "}
                            {pageLabel}
                          </Link>

                          {children.map(
                            (child) => (
                              <NavLink
                                key={
                                  child._id
                                }
                                to={getPageUrl(
                                  child
                                )}
                                target={
                                  child.openInNewTab
                                    ? "_blank"
                                    : undefined
                                }
                                rel={
                                  child.openInNewTab
                                    ? "noreferrer"
                                    : undefined
                                }
                                className={({
                                  isActive,
                                }) => `
                                  flex
                                  items-center
                                  gap-2
                                  border-b
                                  border-gray-100
                                  px-7
                                  py-3
                                  text-[13px]
                                  transition

                                  ${
                                    isActive
                                      ? "font-semibold text-[var(--primary-color)]"
                                      : "text-[#646b77]"
                                  }
                                `}
                              >
                                <ChevronRight
                                  size={13}
                                  className="
                                    opacity-50
                                  "
                                />

                                {getPageLabel(
                                  child
                                )}
                              </NavLink>
                            )
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}

              {(categoriesLoading ||
                pagesLoading) && (
                <div
                  className="
                    space-y-3
                    px-5
                    py-5
                  "
                >
                  <div
                    className="
                      h-4
                      w-32
                      animate-pulse
                      rounded-full
                      bg-gray-200
                    "
                  />

                  <div
                    className="
                      h-4
                      w-24
                      animate-pulse
                      rounded-full
                      bg-gray-200
                    "
                  />
                </div>
              )}
            </nav>

            {/* CONTACT */}

            <div
              className="
                space-y-4
                border-t
                border-gray-100
                p-5
              "
            >
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    text-gray-700
                  "
                >
                  <PhoneCall
                    size={17}
                    className="
                      text-[var(--primary-color)]
                    "
                  />

                  {phone}
                </a>
              )}

              {email && (
                <a
                  href={`mailto:${email}`}
                  className="
                    flex
                    items-center
                    gap-3
                    text-sm
                    text-gray-700
                  "
                >
                  <Mail
                    size={17}
                    className="
                      shrink-0
                      text-[var(--primary-color)]
                    "
                  />

                  <span
                    className="
                      truncate
                    "
                  >
                    {email}
                  </span>
                </a>
              )}

              {offerText && (
                <p
                  className="
                    text-xs
                    leading-5
                    text-gray-500
                  "
                >
                  {offerText}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;