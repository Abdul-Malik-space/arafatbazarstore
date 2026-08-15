import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ChevronDown,
  ExternalLink,
  LogOut,
  Menu,
  ShieldCheck,
  Store,
  UserRound,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAdminAuth,
} from "../../context/AdminAuthContext";

import {
  useSite,
} from "../../context/SiteContext";

// ========================================
// PAGE TITLES
// ========================================

const PAGE_TITLES = {
  "/admin/dashboard": {
    title: "Dashboard",
    description:
      "Overview of your online store.",
  },

  "/admin/products": {
    title: "Products",
    description:
      "Manage your store products.",
  },

  "/admin/categories": {
    title: "Categories",
    description:
      "Manage product categories.",
  },

  "/admin/orders": {
    title: "Orders",
    description:
      "View and manage customer orders.",
  },

  "/admin/customers": {
    title: "Customers",
    description:
      "Manage customer relationships and history.",
  },

  "/admin/content": {
    title: "Website Content",
    description:
      "Manage homepage and website content.",
  },

  "/admin/media": {
    title: "Media",
    description:
      "Manage store images and media.",
  },

  "/admin/settings": {
    title: "Store Settings",
    description:
      "Manage general store configuration.",
  },
};

// ========================================
// GET PAGE INFORMATION
// ========================================

const getPageInformation = (
  pathname
) => {
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }

  if (
    pathname.startsWith(
      "/admin/products/"
    )
  ) {
    return {
      title: "Product",
      description:
        "Manage product information.",
    };
  }

  if (
    pathname.startsWith(
      "/admin/orders/"
    )
  ) {
    return {
      title: "Order Details",
      description:
        "View and manage order information.",
    };
  }

  if (
    pathname.startsWith(
      "/admin/customers/"
    )
  ) {
    return {
      title: "Customer Details",
      description:
        "Review customer history and CRM notes.",
    };
  }

  if (
    pathname.startsWith(
      "/admin/categories/"
    )
  ) {
    return {
      title: "Category",
      description:
        "Manage category information.",
    };
  }

  return {
    title: "Admin Panel",
    description:
      "Manage your online store.",
  };
};

// ========================================
// ADMIN HEADER
// ========================================

const AdminHeader = ({
  onOpenSidebar,
}) => {
  const location =
    useLocation();

  const navigate =
    useNavigate();

  const dropdownRef =
    useRef(null);

  const {
    admin,
    logout,
    actionLoading,
  } = useAdminAuth();

  const {
    settings,
  } = useSite();

  // ======================================
  // PROFILE DROPDOWN
  // ======================================

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  // ======================================
  // CURRENT PAGE
  // ======================================

  const pageInformation =
    useMemo(
      () =>
        getPageInformation(
          location.pathname
        ),
      [
        location.pathname,
      ]
    );

  // ======================================
  // ADMIN INITIAL
  // ======================================

  const adminInitial =
    String(
      admin?.name ||
        admin?.email ||
        "A"
    )
      .trim()
      .charAt(0)
      .toUpperCase();

  // ======================================
  // ROLE LABEL
  // ======================================

  const roleLabel =
    admin?.role ===
    "super-admin"
      ? "Super Admin"
      : "Administrator";

  // ======================================
  // STORE NAME
  // ======================================

  const storeName =
    settings?.storeName ||
    "Online Store";

  // ======================================
  // STORE STATUS
  // ======================================

  const storeStatus =
    useMemo(() => {
      if (
        settings?.storeEnabled ===
        false
      ) {
        return {
          label:
            "Store Disabled",
          dotClass:
            "bg-red-500",
          textClass:
            "text-red-600",
          bgClass:
            "bg-red-50",
        };
      }

      if (
        settings?.maintenanceMode
      ) {
        return {
          label:
            "Maintenance",
          dotClass:
            "bg-amber-500",
          textClass:
            "text-amber-700",
          bgClass:
            "bg-amber-50",
        };
      }

      return {
        label:
          "Store Online",
        dotClass:
          "bg-green-500",
        textClass:
          "text-green-700",
        bgClass:
          "bg-green-50",
      };
    }, [
      settings?.storeEnabled,
      settings?.maintenanceMode,
    ]);

  // ======================================
  // CLOSE DROPDOWN ON ROUTE CHANGE
  // ======================================

  useEffect(() => {
    setProfileOpen(false);
  }, [
    location.pathname,
  ]);

  // ======================================
  // CLICK OUTSIDE
  // ======================================

  useEffect(() => {
    const handleOutsideClick =
      (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {
          setProfileOpen(false);
        }
      };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );
    };
  }, []);

  // ======================================
  // ESCAPE KEY
  // ======================================

  useEffect(() => {
    const handleKeyDown =
      (event) => {
        if (
          event.key ===
          "Escape"
        ) {
          setProfileOpen(false);
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // ======================================
  // LOGOUT
  // ======================================

  const handleLogout =
    async () => {
      try {
        setProfileOpen(false);

        await logout();
      } catch (error) {
        console.error(
          "Admin logout error:",
          error
        );
      } finally {
        navigate(
          "/admin/login",
          {
            replace: true,
          }
        );
      }
    };

  // ======================================
  // PAGE
  // ======================================

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-[72px]
        items-center
        border-b
        border-[#e9e9e9]
        bg-white/95
        px-4
        backdrop-blur
        sm:px-5
        lg:px-7
        xl:px-8
      "
    >
      <div
        className="
          mx-auto
          flex
          w-full
          max-w-[1600px]
          items-center
          justify-between
          gap-4
        "
      >
        {/* =================================
            LEFT SIDE
        ================================= */}

        <div
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          {/* MOBILE MENU */}

          <button
            type="button"
            onClick={
              onOpenSidebar
            }
            aria-label="Open sidebar"
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-[10px]
              border
              border-[#eeeeee]
              bg-white
              text-[#555]
              transition
              hover:bg-[#f7f7f7]
              hover:text-[#222]
              lg:hidden
            "
          >
            <Menu
              size={20}
            />
          </button>

          {/* PAGE TITLE */}

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <h1
                className="
                  truncate
                  text-[18px]
                  font-black
                  text-[#222]
                  sm:text-[20px]
                "
              >
                {
                  pageInformation.title
                }
              </h1>
            </div>

            <p
              className="
                mt-0.5
                hidden
                truncate
                text-[10px]
                text-[#999]
                sm:block
              "
            >
              {
                pageInformation.description
              }
            </p>
          </div>
        </div>

        {/* =================================
            RIGHT SIDE
        ================================= */}

        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
            sm:gap-3
          "
        >
          {/* ===============================
              STORE STATUS
          =============================== */}

          <div
            className={`
              hidden
              h-[38px]
              items-center
              gap-2
              rounded-full
              px-3
              md:flex

              ${
                storeStatus.bgClass
              }
            `}
          >
            <span
              className={`
                h-2
                w-2
                rounded-full

                ${
                  storeStatus.dotClass
                }
              `}
            />

            <span
              className={`
                text-[9px]
                font-bold
                uppercase
                tracking-[0.06em]

                ${
                  storeStatus.textClass
                }
              `}
            >
              {
                storeStatus.label
              }
            </span>
          </div>

          {/* ===============================
              VIEW STORE
          =============================== */}

          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="
              hidden
              h-[40px]
              items-center
              gap-2
              rounded-[10px]
              border
              border-[#eeeeee]
              bg-white
              px-3
              text-[10px]
              font-semibold
              text-[#666]
              transition
              hover:border-[#dddddd]
              hover:bg-[#f8f8f8]
              hover:text-[#222]
              sm:flex
            "
          >
            <Store
              size={15}
            />

            <span
              className="
                hidden
                xl:inline
              "
            >
              View Store
            </span>

            <ExternalLink
              size={12}
              className="
                text-[#aaa]
              "
            />
          </Link>

          {/* ===============================
              PROFILE
          =============================== */}

          <div
            ref={
              dropdownRef
            }
            className="
              relative
            "
          >
            <button
              type="button"
              onClick={() =>
                setProfileOpen(
                  (current) =>
                    !current
                )
              }
              aria-expanded={
                profileOpen
              }
              className="
                flex
                h-[44px]
                items-center
                gap-2
                rounded-[12px]
                border
                border-transparent
                px-1.5
                transition
                hover:border-[#eeeeee]
                hover:bg-[#fafafa]
                sm:pr-3
              "
            >
              {/* AVATAR */}

              <span
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f0f5e9]
                  text-[13px]
                  font-black
                  text-[var(--primary-color)]
                "
              >
                {adminInitial}
              </span>

              {/* NAME */}

              <span
                className="
                  hidden
                  min-w-0
                  text-left
                  sm:block
                "
              >
                <span
                  className="
                    block
                    max-w-[130px]
                    truncate
                    text-[10px]
                    font-bold
                    text-[#333]
                  "
                >
                  {admin?.name ||
                    "Administrator"}
                </span>

                <span
                  className="
                    mt-0.5
                    block
                    text-[8px]
                    uppercase
                    tracking-[0.06em]
                    text-[#999]
                  "
                >
                  {roleLabel}
                </span>
              </span>

              <ChevronDown
                size={14}
                className={`
                  hidden
                  text-[#999]
                  transition-transform
                  sm:block

                  ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  }
                `}
              />
            </button>

            {/* =============================
                PROFILE DROPDOWN
            ============================= */}

            {profileOpen && (
              <div
                className="
                  absolute
                  right-0
                  top-[52px]
                  z-50
                  w-[280px]
                  overflow-hidden
                  rounded-[14px]
                  border
                  border-[#e9e9e9]
                  bg-white
                  shadow-[0_18px_50px_rgba(0,0,0,0.12)]
                "
              >
                {/* ADMIN INFO */}

                <div
                  className="
                    border-b
                    border-[#eeeeee]
                    p-4
                  "
                >
                  <div
                    className="
                      flex
                      items-center
                      gap-3
                    "
                  >
                    <span
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-[var(--primary-color)]
                        text-[15px]
                        font-black
                        text-white
                      "
                    >
                      {adminInitial}
                    </span>

                    <div
                      className="
                        min-w-0
                        flex-1
                      "
                    >
                      <div
                        className="
                          truncate
                          text-[12px]
                          font-bold
                          text-[#222]
                        "
                      >
                        {admin?.name ||
                          "Administrator"}
                      </div>

                      <div
                        className="
                          mt-0.5
                          truncate
                          text-[9px]
                          text-[#999]
                        "
                      >
                        {admin?.email ||
                          ""}
                      </div>
                    </div>
                  </div>

                  {/* ROLE */}

                  <div
                    className="
                      mt-3
                      flex
                      items-center
                      gap-2
                      rounded-[9px]
                      bg-[#f8f8f8]
                      px-3
                      py-2
                    "
                  >
                    <ShieldCheck
                      size={14}
                      className="
                        text-[var(--primary-color)]
                      "
                    />

                    <span
                      className="
                        text-[9px]
                        font-semibold
                        text-[#666]
                      "
                    >
                      {roleLabel}
                    </span>
                  </div>
                </div>

                {/* STORE INFO */}

                <div
                  className="
                    border-b
                    border-[#eeeeee]
                    px-3
                    py-3
                  "
                >
                  <div
                    className="
                      px-2
                      pb-2
                      text-[8px]
                      font-bold
                      uppercase
                      tracking-[0.12em]
                      text-[#aaa]
                    "
                  >
                    Store
                  </div>

                  <Link
                    to="/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() =>
                      setProfileOpen(
                        false
                      )
                    }
                    className="
                      flex
                      min-h-[42px]
                      items-center
                      gap-3
                      rounded-[9px]
                      px-3
                      text-[10px]
                      font-semibold
                      text-[#555]
                      transition
                      hover:bg-[#f7f7f7]
                      hover:text-[#222]
                    "
                  >
                    <Store
                      size={15}
                      className="
                        text-[#999]
                      "
                    />

                    <span
                      className="
                        min-w-0
                        flex-1
                        truncate
                      "
                    >
                      {storeName}
                    </span>

                    <ExternalLink
                      size={12}
                      className="
                        text-[#aaa]
                      "
                    />
                  </Link>
                </div>

                {/* ACCOUNT */}

                <div
                  className="
                    px-3
                    py-3
                  "
                >
                  <Link
                    to="/admin/dashboard"
                    onClick={() =>
                      setProfileOpen(
                        false
                      )
                    }
                    className="
                      flex
                      min-h-[42px]
                      items-center
                      gap-3
                      rounded-[9px]
                      px-3
                      text-[10px]
                      font-semibold
                      text-[#555]
                      transition
                      hover:bg-[#f7f7f7]
                      hover:text-[#222]
                    "
                  >
                    <UserRound
                      size={15}
                      className="
                        text-[#999]
                      "
                    />

                    Admin Dashboard
                  </Link>

                  {/* LOGOUT */}

                  <button
                    type="button"
                    onClick={
                      handleLogout
                    }
                    disabled={
                      actionLoading
                    }
                    className="
                      mt-1
                      flex
                      min-h-[42px]
                      w-full
                      items-center
                      gap-3
                      rounded-[9px]
                      px-3
                      text-left
                      text-[10px]
                      font-semibold
                      text-red-500
                      transition
                      hover:bg-red-50
                      hover:text-red-600
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                    "
                  >
                    {actionLoading ? (
                      <>
                        <span
                          className="
                            h-4
                            w-4
                            animate-spin
                            rounded-full
                            border-2
                            border-red-100
                            border-t-red-500
                          "
                        />

                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut
                          size={15}
                        />

                        Sign Out
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;