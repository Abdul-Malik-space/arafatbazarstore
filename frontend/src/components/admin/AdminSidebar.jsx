import {
  ChevronRight,
  FileText,
  Files,
  Image,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Store,
  Tags,
  UsersRound,
  X,
} from "lucide-react";

import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

import {
  useAdminAuth,
} from "../../context/AdminAuthContext";

// ========================================
// MAIN MENU
// ========================================

const mainMenuItems = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },

  {
    label: "Products",
    path: "/admin/products",
    icon: Package,
  },

  {
    label: "Categories",
    path: "/admin/categories",
    icon: Tags,
  },

  {
    label: "Orders",
    path: "/admin/orders",
    icon: ShoppingBag,
  },

  {
    label: "Customers",
    path: "/admin/customers",
    icon: UsersRound,
  },
];

// ========================================
// WEBSITE MANAGEMENT MENU
// ========================================

const websiteMenuItems = [
  {
    label: "Website Content",
    path: "/admin/content",
    icon: FileText,
  },

  {
    label: "Pages",
    path: "/admin/pages",
    icon: Files,
  },

  {
    label: "Footer",
    path: "/admin/footer",
    icon: FileText,
  },

  {
    label: "Media",
    path: "/admin/media",
    icon: Image,
  },

  {
    label: "Store Settings",
    path: "/admin/settings",
    icon: Settings,
  },
];

// ========================================
// SIDEBAR LINK
// ========================================

const SidebarLink = ({
  item,
  onClose,
}) => {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) => `
        group
        flex
        min-h-[46px]
        items-center
        gap-3
        rounded-[10px]
        px-3
        text-[12px]
        font-semibold
        transition-all
        duration-200

        ${
          isActive
            ? `
                bg-[#f3f7ec]
                text-[var(--primary-color)]
              `
            : `
                text-[#666]
                hover:bg-[#f7f7f7]
                hover:text-[#222]
              `
        }
      `}
    >
      {({ isActive }) => (
        <>
          <span
            className={`
              flex
              h-8
              w-8
              shrink-0
              items-center
              justify-center
              rounded-[8px]
              transition

              ${
                isActive
                  ? `
                      bg-white
                      text-[var(--primary-color)]
                      shadow-sm
                    `
                  : `
                      bg-[#f7f7f7]
                      text-[#777]
                      group-hover:bg-white
                      group-hover:text-[#222]
                    `
              }
            `}
          >
            <Icon size={17} />
          </span>

          <span
            className="
              min-w-0
              flex-1
              truncate
            "
          >
            {item.label}
          </span>

          <ChevronRight
            size={14}
            className={`
              shrink-0
              transition

              ${
                isActive
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-50"
              }
            `}
          />
        </>
      )}
    </NavLink>
  );
};

// ========================================
// ADMIN SIDEBAR
// ========================================

const AdminSidebar = ({
  isOpen = false,
  onClose,
}) => {
  const navigate =
    useNavigate();

  const {
    admin,
    logout,
    actionLoading,
  } = useAdminAuth();

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
  // HANDLE LOGOUT
  // ======================================

  const handleLogout =
    async () => {
      try {
        await logout();
      } catch (error) {
        console.error(
          "Admin logout error:",
          error
        );
      } finally {
        onClose?.();

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
    <aside
      className={`
        fixed
        bottom-0
        left-0
        top-0
        z-50
        flex
        w-[270px]
        flex-col
        border-r
        border-[#e9e9e9]
        bg-white
        transition-transform
        duration-300
        ease-out

        lg:translate-x-0

        ${
          isOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }
      `}
    >
      {/* =================================
          BRAND
      ================================= */}

      <div
        className="
          flex
          h-[72px]
          shrink-0
          items-center
          justify-between
          border-b
          border-[#eeeeee]
          px-5
        "
      >
        <Link
          to="/admin/dashboard"
          onClick={onClose}
          className="
            flex
            min-w-0
            items-center
            gap-3
          "
        >
          <span
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[var(--primary-color)]
              text-white
            "
          >
            <ShieldCheck
              size={19}
            />
          </span>

          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                truncate
                text-[13px]
                font-black
                uppercase
                tracking-[0.06em]
                text-[#222]
              "
            >
              Store Admin
            </div>

            <div
              className="
                mt-0.5
                text-[9px]
                font-medium
                uppercase
                tracking-[0.12em]
                text-[#999]
              "
            >
              Management Panel
            </div>
          </div>
        </Link>

        {/* MOBILE CLOSE BUTTON */}

        <button
          type="button"
          onClick={onClose}
          aria-label="Close sidebar"
          className="
            flex
            h-9
            w-9
            shrink-0
            items-center
            justify-center
            rounded-full
            text-[#777]
            transition
            hover:bg-[#f5f5f5]
            hover:text-[#222]
            lg:hidden
          "
        >
          <X size={19} />
        </button>
      </div>

      {/* =================================
          SCROLLABLE NAVIGATION
      ================================= */}

      <div
        className="
          flex-1
          overflow-y-auto
          px-4
          py-5
        "
      >
        {/* ===============================
            STORE MANAGEMENT
        =============================== */}

        <div>
          <div
            className="
              mb-2
              px-3
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#aaa]
            "
          >
            Store Management
          </div>

          <nav
            className="
              space-y-1
            "
          >
            {mainMenuItems.map(
              (item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  onClose={onClose}
                />
              )
            )}
          </nav>
        </div>

        {/* ===============================
            WEBSITE MANAGEMENT
        =============================== */}

        <div
          className="
            mt-7
          "
        >
          <div
            className="
              mb-2
              px-3
              text-[9px]
              font-bold
              uppercase
              tracking-[0.16em]
              text-[#aaa]
            "
          >
            Website
          </div>

          <nav
            className="
              space-y-1
            "
          >
            {websiteMenuItems.map(
              (item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  onClose={onClose}
                />
              )
            )}
          </nav>
        </div>

        {/* ===============================
            VIEW STORE
        =============================== */}

        <div
          className="
            mt-7
            border-t
            border-[#eeeeee]
            pt-5
          "
        >
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            className="
              group
              flex
              min-h-[46px]
              items-center
              gap-3
              rounded-[10px]
              px-3
              text-[12px]
              font-semibold
              text-[#666]
              transition
              hover:bg-[#f7f7f7]
              hover:text-[#222]
            "
          >
            <span
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-[8px]
                bg-[#f7f7f7]
                text-[#777]
                transition
                group-hover:bg-white
                group-hover:text-[var(--primary-color)]
              "
            >
              <Store
                size={17}
              />
            </span>

            <span
              className="
                flex-1
              "
            >
              View Store
            </span>

            <ChevronRight
              size={14}
              className="
                opacity-0
                transition
                group-hover:opacity-50
              "
            />
          </Link>
        </div>
      </div>

      {/* =================================
          ADMIN ACCOUNT
      ================================= */}

      <div
        className="
          shrink-0
          border-t
          border-[#eeeeee]
          bg-[#fcfcfc]
          p-4
        "
      >
        {/* ADMIN DETAILS */}

        <div
          className="
            flex
            items-center
            gap-3
            rounded-[12px]
            bg-white
            p-3
          "
        >
          <div
            className="
              flex
              h-10
              w-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#f0f5e9]
              text-[14px]
              font-black
              text-[var(--primary-color)]
            "
          >
            {adminInitial}
          </div>

          <div
            className="
              min-w-0
              flex-1
            "
          >
            <div
              className="
                truncate
                text-[11px]
                font-bold
                text-[#333]
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
              {roleLabel}
            </div>
          </div>
        </div>

        {/* =================================
            LOGOUT BUTTON
        ================================= */}

        <button
          type="button"
          onClick={
            handleLogout
          }
          disabled={
            actionLoading
          }
          className="
            mt-3
            flex
            h-[43px]
            w-full
            items-center
            justify-center
            gap-2
            rounded-[10px]
            border
            border-[#eeeeee]
            bg-white
            text-[10px]
            font-bold
            uppercase
            tracking-[0.05em]
            text-[#666]
            transition
            hover:border-red-100
            hover:bg-red-50
            hover:text-red-600
            disabled:cursor-not-allowed
            disabled:opacity-60
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
                  border-[#ddd]
                  border-t-[#777]
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
    </aside>
  );
};

export default AdminSidebar;