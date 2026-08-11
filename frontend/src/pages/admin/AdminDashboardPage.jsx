import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Box,
  Boxes,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  Tags,
  Truck,
  XCircle,
} from "lucide-react";

import {
  getAdminDashboardData,
  isAdminDashboardAuthError,
} from "../../services/adminDashboard";

import {
  getImageUrl,
} from "../../services/api";

import {
  useAdminAuth,
} from "../../context/AdminAuthContext";

import {
  useSite,
} from "../../context/SiteContext";

// ========================================
// ORDER STATUS CONFIGURATION
// ========================================

const ORDER_STATUS_CONFIG = {
  pending: {
    label: "Pending",
    icon: Clock3,
    badge:
      "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },

  confirmed: {
    label: "Confirmed",
    icon: CheckCircle2,
    badge:
      "bg-blue-50 text-blue-700 border-blue-100",
    dot: "bg-blue-500",
  },

  processing: {
    label: "Processing",
    icon: Boxes,
    badge:
      "bg-violet-50 text-violet-700 border-violet-100",
    dot: "bg-violet-500",
  },

  shipped: {
    label: "Shipped",
    icon: Truck,
    badge:
      "bg-cyan-50 text-cyan-700 border-cyan-100",
    dot: "bg-cyan-500",
  },

  delivered: {
    label: "Delivered",
    icon: CheckCircle2,
    badge:
      "bg-green-50 text-green-700 border-green-100",
    dot: "bg-green-500",
  },

  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    badge:
      "bg-red-50 text-red-600 border-red-100",
    dot: "bg-red-500",
  },
};

// ========================================
// PAYMENT METHOD LABEL
// ========================================

const getPaymentMethodLabel = (
  method
) => {
  switch (
    String(method || "")
      .trim()
      .toLowerCase()
  ) {
    case "cod":
      return "Cash on Delivery";

    case "bank-transfer":
      return "Bank Transfer";

    case "easypaisa":
      return "Easypaisa";

    case "jazzcash":
      return "JazzCash";

    case "card":
      return "Card Payment";

    default:
      return method || "—";
  }
};

// ========================================
// FORMAT DATE
// ========================================

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleString(
    "en-PK",
    {
      dateStyle: "medium",
      timeStyle: "short",
    }
  );
};

// ========================================
// STATUS BADGE
// ========================================

const OrderStatusBadge = ({
  status,
}) => {
  const normalizedStatus =
    String(
      status || "pending"
    )
      .trim()
      .toLowerCase();

  const config =
    ORDER_STATUS_CONFIG[
      normalizedStatus
    ] ||
    ORDER_STATUS_CONFIG.pending;

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        border
        px-2.5
        py-1.5
        text-[9px]
        font-bold
        uppercase
        tracking-[0.04em]

        ${config.badge}
      `}
    >
      <span
        className={`
          h-1.5
          w-1.5
          rounded-full

          ${config.dot}
        `}
      />

      {config.label}
    </span>
  );
};

// ========================================
// STATISTIC CARD
// ========================================

const StatisticCard = ({
  title,
  value,
  description,
  icon: Icon,
  path,
}) => {
  const content = (
    <div
      className="
        group
        h-full
        rounded-[16px]
        border
        border-[#e8e8e8]
        bg-white
        p-5
        transition
        duration-200
        hover:border-[#dddddd]
        hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]
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
            min-w-0
          "
        >
          <div
            className="
              text-[10px]
              font-bold
              uppercase
              tracking-[0.08em]
              text-[#999]
            "
          >
            {title}
          </div>

          <div
            className="
              mt-3
              break-words
              text-[26px]
              font-black
              leading-none
              text-[#222]
              xl:text-[29px]
            "
          >
            {value}
          </div>
        </div>

        <div
          className="
            flex
            h-11
            w-11
            shrink-0
            items-center
            justify-center
            rounded-[12px]
            bg-[#f3f7ed]
            text-[var(--primary-color)]
          "
        >
          <Icon
            size={20}
          />
        </div>
      </div>

      <div
        className="
          mt-5
          flex
          items-end
          justify-between
          gap-3
        "
      >
        <p
          className="
            text-[10px]
            leading-5
            text-[#999]
          "
        >
          {description}
        </p>

        {path && (
          <ChevronRight
            size={15}
            className="
              shrink-0
              text-[#bbb]
              transition
              group-hover:translate-x-0.5
              group-hover:text-[var(--primary-color)]
            "
          />
        )}
      </div>
    </div>
  );

  if (path) {
    return (
      <Link
        to={path}
        className="
          block
          h-full
        "
      >
        {content}
      </Link>
    );
  }

  return content;
};

// ========================================
// LOADING SKELETON
// ========================================

const DashboardLoading = () => {
  return (
    <div
      className="
        animate-pulse
        space-y-6
      "
    >
      <div>
        <div
          className="
            h-3
            w-24
            rounded
            bg-[#e6e6e6]
          "
        />

        <div
          className="
            mt-4
            h-8
            w-72
            max-w-full
            rounded
            bg-[#e6e6e6]
          "
        />

        <div
          className="
            mt-3
            h-4
            w-96
            max-w-full
            rounded
            bg-[#ededed]
          "
        />
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        {[1, 2, 3, 4].map(
          (item) => (
            <div
              key={item}
              className="
                h-[150px]
                rounded-[16px]
                border
                border-[#e9e9e9]
                bg-white
                p-5
              "
            >
              <div
                className="
                  h-3
                  w-24
                  rounded
                  bg-[#ececec]
                "
              />

              <div
                className="
                  mt-5
                  h-8
                  w-20
                  rounded
                  bg-[#e5e5e5]
                "
              />

              <div
                className="
                  mt-6
                  h-3
                  w-32
                  rounded
                  bg-[#eeeeee]
                "
              />
            </div>
          )
        )}
      </div>

      <div
        className="
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-[1.4fr_0.6fr]
        "
      >
        <div
          className="
            h-[360px]
            rounded-[16px]
            border
            border-[#e9e9e9]
            bg-white
          "
        />

        <div
          className="
            h-[360px]
            rounded-[16px]
            border
            border-[#e9e9e9]
            bg-white
          "
        />
      </div>
    </div>
  );
};

// ========================================
// EMPTY MESSAGE
// ========================================

const EmptyMessage = ({
  icon: Icon = Box,
  title,
  description,
}) => {
  return (
    <div
      className="
        flex
        min-h-[210px]
        flex-col
        items-center
        justify-center
        px-5
        py-8
        text-center
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
          bg-[#f5f6f3]
          text-[#999]
        "
      >
        <Icon
          size={20}
        />
      </div>

      <div
        className="
          mt-4
          text-[12px]
          font-bold
          text-[#444]
        "
      >
        {title}
      </div>

      <p
        className="
          mt-1
          max-w-[300px]
          text-[10px]
          leading-5
          text-[#999]
        "
      >
        {description}
      </p>
    </div>
  );
};

// ========================================
// ADMIN DASHBOARD PAGE
// ========================================

const AdminDashboardPage = () => {
  const navigate =
    useNavigate();

  const {
    admin,
    setAdmin,
  } = useAdminAuth();

  const {
    formatPrice,
  } = useSite();

  // ======================================
  // STATE
  // ======================================

  const [
    dashboard,
    setDashboard,
  ] = useState(null);

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

  // ======================================
  // PRICE FORMAT
  // ======================================

  const formatMoney =
    useCallback(
      (value) => {
        const amount =
          Number(value) || 0;

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
      [
        formatPrice,
      ]
    );

  // ======================================
  // LOAD DASHBOARD
  // ======================================

  const loadDashboard =
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

          const data =
            await getAdminDashboardData();

          setDashboard(
            data
          );
        } catch (err) {
          console.error(
            "Admin Dashboard Load Error:",
            err
          );

          if (
            isAdminDashboardAuthError(
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
                    "/admin/dashboard",
                },
              }
            );

            return;
          }

          setError(
            err?.message ||
              "Unable to load dashboard."
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [
        navigate,
        setAdmin,
      ]
    );

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    loadDashboard();
  }, [
    loadDashboard,
  ]);

  // ======================================
  // SAFE DASHBOARD DATA
  // ======================================

  const summary =
    dashboard?.summary || {};

  const orderStatus =
    dashboard?.orderStatus || {};

  const recentOrders =
    Array.isArray(
      dashboard?.recentOrders
    )
      ? dashboard.recentOrders
      : [];

  const lowStockProducts =
    Array.isArray(
      dashboard?.lowStockProducts
    )
      ? dashboard.lowStockProducts
      : [];

  const lowStockLimit =
    Number(
      dashboard?.meta
        ?.lowStockLimit
    ) || 5;

  // ======================================
  // ORDER STATUS TOTAL / MAX
  // ======================================

  const orderStatusData =
    useMemo(() => {
      return Object.keys(
        ORDER_STATUS_CONFIG
      ).map((key) => ({
        key,

        count:
          Number(
            orderStatus?.[key]
          ) || 0,

        ...ORDER_STATUS_CONFIG[
          key
        ],
      }));
    }, [
      orderStatus,
    ]);

  const largestStatusCount =
    useMemo(() => {
      return Math.max(
        1,
        ...orderStatusData.map(
          (item) =>
            item.count
        )
      );
    }, [
      orderStatusData,
    ]);

  // ======================================
  // ORDERS REQUIRING ATTENTION
  // ======================================

  const activeOrders =
    Number(
      orderStatus.pending
    ) +
    Number(
      orderStatus.confirmed
    ) +
    Number(
      orderStatus.processing
    ) +
    Number(
      orderStatus.shipped
    );

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <DashboardLoading />
    );
  }

  // ======================================
  // PAGE
  // ======================================

  return (
    <div
      className="
        space-y-6
      "
    >
      {/* =================================
          PAGE INTRODUCTION
      ================================= */}

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
            Store Overview
          </div>

          <h2
            className="
              mt-2
              text-[25px]
              font-black
              tracking-[-0.02em]
              text-[#222]
              sm:text-[29px]
            "
          >
            Welcome
            {admin?.name
              ? `, ${admin.name}`
              : ""}
          </h2>

          <p
            className="
              mt-2
              max-w-[650px]
              text-[11px]
              leading-6
              text-[#888]
            "
          >
            Here is the current
            overview of products,
            orders, revenue and
            inventory from your
            store database.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadDashboard({
              silent: true,
            })
          }
          disabled={
            refreshing
          }
          className="
            inline-flex
            h-[42px]
            items-center
            justify-center
            gap-2
            self-start
            rounded-[10px]
            border
            border-[#e4e4e4]
            bg-white
            px-4
            text-[10px]
            font-bold
            uppercase
            tracking-[0.04em]
            text-[#555]
            transition
            hover:bg-[#f8f8f8]
            disabled:cursor-not-allowed
            disabled:opacity-60
            lg:self-auto
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

          {refreshing
            ? "Refreshing..."
            : "Refresh Data"}
        </button>
      </section>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div
          className="
            flex
            flex-col
            gap-4
            rounded-[14px]
            border
            border-red-100
            bg-red-50
            p-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div
            className="
              flex
              items-start
              gap-3
            "
          >
            <AlertTriangle
              size={18}
              className="
                mt-0.5
                shrink-0
                text-red-500
              "
            />

            <div>
              <div
                className="
                  text-[11px]
                  font-bold
                  text-red-700
                "
              >
                Dashboard could not
                be updated
              </div>

              <p
                className="
                  mt-1
                  text-[10px]
                  leading-5
                  text-red-600
                "
              >
                {error}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              loadDashboard()
            }
            className="
              rounded-[9px]
              bg-red-600
              px-4
              py-2.5
              text-[9px]
              font-bold
              uppercase
              text-white
            "
          >
            Try Again
          </button>
        </div>
      )}

      {/* =================================
          MAIN STATISTICS
      ================================= */}

      <section
        className="
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <StatisticCard
          title="Products"
          value={
            Number(
              summary.totalProducts
            ) || 0
          }
          description="Products currently stored in your catalog."
          icon={Package}
          path="/admin/products"
        />

        <StatisticCard
          title="Categories"
          value={
            Number(
              summary.totalCategories
            ) || 0
          }
          description="Product categories available in the store."
          icon={Tags}
          path="/admin/categories"
        />

        <StatisticCard
          title="Orders"
          value={
            Number(
              summary.totalOrders
            ) || 0
          }
          description={`${activeOrders} currently active or in progress.`}
          icon={ShoppingBag}
          path="/admin/orders"
        />

        <StatisticCard
          title="Total Order Value"
          value={formatMoney(
            summary.totalRevenue
          )}
          description="Value of all non-cancelled orders."
          icon={Banknote}
        />
      </section>

      {/* =================================
          SECONDARY STATISTICS
      ================================= */}

      <section
        className="
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-4
        "
      >
        {/* TODAY ORDERS */}

        <div
          className="
            rounded-[14px]
            border
            border-[#e8e8e8]
            bg-white
            p-4
          "
        >
          <CalendarDays
            size={17}
            className="
              text-[var(--primary-color)]
            "
          />

          <div
            className="
              mt-3
              text-[21px]
              font-black
              text-[#222]
            "
          >
            {Number(
              summary.todayOrders
            ) || 0}
          </div>

          <div
            className="
              mt-1
              text-[9px]
              font-bold
              uppercase
              tracking-[0.06em]
              text-[#999]
            "
          >
            Today Orders
          </div>
        </div>

        {/* TODAY REVENUE */}

        <div
          className="
            rounded-[14px]
            border
            border-[#e8e8e8]
            bg-white
            p-4
          "
        >
          <Banknote
            size={17}
            className="
              text-[var(--primary-color)]
            "
          />

          <div
            className="
              mt-3
              text-[20px]
              font-black
              text-[#222]
            "
          >
            {formatMoney(
              summary.todayRevenue
            )}
          </div>

          <div
            className="
              mt-1
              text-[9px]
              font-bold
              uppercase
              tracking-[0.06em]
              text-[#999]
            "
          >
            Today Order Value
          </div>
        </div>

        {/* DELIVERED REVENUE */}

        <div
          className="
            rounded-[14px]
            border
            border-[#e8e8e8]
            bg-white
            p-4
          "
        >
          <CheckCircle2
            size={17}
            className="
              text-green-600
            "
          />

          <div
            className="
              mt-3
              text-[20px]
              font-black
              text-[#222]
            "
          >
            {formatMoney(
              summary.deliveredRevenue
            )}
          </div>

          <div
            className="
              mt-1
              text-[9px]
              font-bold
              uppercase
              tracking-[0.06em]
              text-[#999]
            "
          >
            Delivered Revenue
          </div>
        </div>

        {/* STOCK ALERTS */}

        <div
          className="
            rounded-[14px]
            border
            border-[#e8e8e8]
            bg-white
            p-4
          "
        >
          <AlertTriangle
            size={17}
            className="
              text-amber-500
            "
          />

          <div
            className="
              mt-3
              text-[21px]
              font-black
              text-[#222]
            "
          >
            {(Number(
              summary.lowStockCount
            ) || 0) +
              (Number(
                summary.outOfStockCount
              ) || 0)}
          </div>

          <div
            className="
              mt-1
              text-[9px]
              font-bold
              uppercase
              tracking-[0.06em]
              text-[#999]
            "
          >
            Stock Alerts
          </div>
        </div>
      </section>

      {/* =================================
          STATUS + STOCK
      ================================= */}

      <section
        className="
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-[1.2fr_0.8fr]
        "
      >
        {/* ===============================
            ORDER STATUS
        =============================== */}

        <div
          className="
            rounded-[16px]
            border
            border-[#e8e8e8]
            bg-white
          "
        >
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
                  text-[14px]
                  font-black
                  text-[#222]
                "
              >
                Order Status
              </h3>

              <p
                className="
                  mt-1
                  text-[9px]
                  text-[#999]
                "
              >
                Current order
                distribution
              </p>
            </div>

            <Link
              to="/admin/orders"
              className="
                flex
                items-center
                gap-1
                text-[9px]
                font-bold
                uppercase
                text-[var(--primary-color)]
              "
            >
              All Orders

              <ArrowRight
                size={12}
              />
            </Link>
          </div>

          <div
            className="
              space-y-5
              p-5
            "
          >
            {orderStatusData.map(
              (item) => {
                const Icon =
                  item.icon;

                const percentage =
                  Math.round(
                    (item.count /
                      largestStatusCount) *
                      100
                  );

                return (
                  <div
                    key={
                      item.key
                    }
                  >
                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-center
                          gap-2.5
                        "
                      >
                        <div
                          className="
                            flex
                            h-8
                            w-8
                            items-center
                            justify-center
                            rounded-[8px]
                            bg-[#f7f7f7]
                            text-[#777]
                          "
                        >
                          <Icon
                            size={14}
                          />
                        </div>

                        <span
                          className="
                            text-[10px]
                            font-semibold
                            text-[#555]
                          "
                        >
                          {item.label}
                        </span>
                      </div>

                      <strong
                        className="
                          text-[12px]
                          text-[#222]
                        "
                      >
                        {
                          item.count
                        }
                      </strong>
                    </div>

                    <div
                      className="
                        mt-2.5
                        h-1.5
                        overflow-hidden
                        rounded-full
                        bg-[#f0f0f0]
                      "
                    >
                      <div
                        className={`
                          h-full
                          rounded-full
                          transition-all
                          duration-500

                          ${
                            item.dot
                          }
                        `}
                        style={{
                          width:
                            item.count >
                            0
                              ? `${Math.max(
                                  percentage,
                                  7
                                )}%`
                              : "0%",
                        }}
                      />
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>

        {/* ===============================
            STOCK ALERTS
        =============================== */}

        <div
          className="
            rounded-[16px]
            border
            border-[#e8e8e8]
            bg-white
          "
        >
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
                  text-[14px]
                  font-black
                  text-[#222]
                "
              >
                Stock Alerts
              </h3>

              <p
                className="
                  mt-1
                  text-[9px]
                  text-[#999]
                "
              >
                Products with{" "}
                {lowStockLimit} or
                fewer units
              </p>
            </div>

            <Link
              to="/admin/products"
              className="
                flex
                items-center
                gap-1
                text-[9px]
                font-bold
                uppercase
                text-[var(--primary-color)]
              "
            >
              Products

              <ArrowRight
                size={12}
              />
            </Link>
          </div>

          {lowStockProducts.length ===
          0 ? (
            <EmptyMessage
              icon={
                CheckCircle2
              }
              title="Stock looks healthy"
              description="There are currently no products in the dashboard low-stock alert list."
            />
          ) : (
            <div
              className="
                divide-y
                divide-[#eeeeee]
              "
            >
              {lowStockProducts.map(
                (product) => {
                  const stock =
                    Number(
                      product.stock
                    ) || 0;

                  const image =
                    product.mainImage
                      ? getImageUrl(
                          product.mainImage
                        )
                      : "";

                  return (
                    <div
                      key={
                        product._id
                      }
                      className="
                        flex
                        items-center
                        gap-3
                        px-5
                        py-3.5
                      "
                    >
                      {/* IMAGE */}

                      <div
                        className="
                          flex
                          h-11
                          w-11
                          shrink-0
                          items-center
                          justify-center
                          overflow-hidden
                          rounded-[9px]
                          bg-[#f7f7f7]
                        "
                      >
                        {image ? (
                          <img
                            src={
                              image
                            }
                            alt={
                              product.name
                            }
                            className="
                              h-full
                              w-full
                              object-cover
                            "
                          />
                        ) : (
                          <Package
                            size={17}
                            className="
                              text-[#aaa]
                            "
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
                            truncate
                            text-[10px]
                            font-bold
                            text-[#333]
                          "
                        >
                          {product.name ||
                            "Product"}
                        </div>

                        <div
                          className="
                            mt-1
                            truncate
                            text-[8px]
                            text-[#999]
                          "
                        >
                          SKU:{" "}
                          {product.sku ||
                            "—"}
                        </div>
                      </div>

                      <div
                        className="
                          text-right
                        "
                      >
                        <div
                          className={`
                            text-[11px]
                            font-black

                            ${
                              stock <=
                              0
                                ? "text-red-600"
                                : "text-amber-600"
                            }
                          `}
                        >
                          {stock}
                        </div>

                        <div
                          className="
                            mt-0.5
                            text-[8px]
                            uppercase
                            text-[#aaa]
                          "
                        >
                          {stock <= 0
                            ? "Out"
                            : "Left"}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      </section>

      {/* =================================
          RECENT ORDERS
      ================================= */}

      <section
        className="
          overflow-hidden
          rounded-[16px]
          border
          border-[#e8e8e8]
          bg-white
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-[#eeeeee]
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <h3
              className="
                text-[14px]
                font-black
                text-[#222]
              "
            >
              Recent Orders
            </h3>

            <p
              className="
                mt-1
                text-[9px]
                text-[#999]
              "
            >
              Latest customer
              orders from the
              database
            </p>
          </div>

          <Link
            to="/admin/orders"
            className="
              inline-flex
              items-center
              gap-1.5
              self-start
              text-[9px]
              font-bold
              uppercase
              text-[var(--primary-color)]
            "
          >
            View All Orders

            <ArrowRight
              size={12}
            />
          </Link>
        </div>

        {recentOrders.length ===
        0 ? (
          <EmptyMessage
            icon={ShoppingBag}
            title="No orders yet"
            description="Recent customer orders will appear here after orders are placed."
          />
        ) : (
          <>
            {/* DESKTOP TABLE */}

            <div
              className="
                hidden
                overflow-x-auto
                md:block
              "
            >
              <table
                className="
                  w-full
                  min-w-[800px]
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
                      "Order",
                      "Customer",
                      "Amount",
                      "Payment",
                      "Status",
                      "Date",
                    ].map(
                      (heading) => (
                        <th
                          key={
                            heading
                          }
                          className="
                            border-b
                            border-[#eeeeee]
                            px-5
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
                  {recentOrders.map(
                    (order) => (
                      <tr
                        key={
                          order._id ||
                          order.orderNumber
                        }
                        className="
                          transition
                          hover:bg-[#fcfcfc]
                        "
                      >
                        <td
                          className="
                            border-b
                            border-[#f0f0f0]
                            px-5
                            py-4
                          "
                        >
                          <div
                            className="
                              text-[10px]
                              font-bold
                              text-[#333]
                            "
                          >
                            {order.orderNumber ||
                              "—"}
                          </div>
                        </td>

                        <td
                          className="
                            border-b
                            border-[#f0f0f0]
                            px-5
                            py-4
                          "
                        >
                          <div
                            className="
                              max-w-[170px]
                              truncate
                              text-[10px]
                              font-semibold
                              text-[#444]
                            "
                          >
                            {order.customerName ||
                              "Customer"}
                          </div>

                          <div
                            className="
                              mt-1
                              text-[8px]
                              text-[#999]
                            "
                          >
                            {order.customerPhone ||
                              "—"}
                          </div>
                        </td>

                        <td
                          className="
                            border-b
                            border-[#f0f0f0]
                            px-5
                            py-4
                          "
                        >
                          <strong
                            className="
                              whitespace-nowrap
                              text-[10px]
                              text-[#222]
                            "
                          >
                            {formatMoney(
                              order.totalAmount
                            )}
                          </strong>
                        </td>

                        <td
                          className="
                            border-b
                            border-[#f0f0f0]
                            px-5
                            py-4
                            text-[9px]
                            text-[#666]
                          "
                        >
                          {getPaymentMethodLabel(
                            order.paymentMethod
                          )}
                        </td>

                        <td
                          className="
                            border-b
                            border-[#f0f0f0]
                            px-5
                            py-4
                          "
                        >
                          <OrderStatusBadge
                            status={
                              order.orderStatus
                            }
                          />
                        </td>

                        <td
                          className="
                            whitespace-nowrap
                            border-b
                            border-[#f0f0f0]
                            px-5
                            py-4
                            text-[9px]
                            text-[#888]
                          "
                        >
                          {formatDate(
                            order.createdAt
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE ORDERS */}

            <div
              className="
                divide-y
                divide-[#eeeeee]
                md:hidden
              "
            >
              {recentOrders.map(
                (order) => (
                  <div
                    key={
                      order._id ||
                      order.orderNumber
                    }
                    className="
                      p-4
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
                            text-[10px]
                            font-bold
                            text-[#222]
                          "
                        >
                          {order.orderNumber ||
                            "—"}
                        </div>

                        <div
                          className="
                            mt-1
                            text-[9px]
                            text-[#777]
                          "
                        >
                          {order.customerName ||
                            "Customer"}
                        </div>
                      </div>

                      <OrderStatusBadge
                        status={
                          order.orderStatus
                        }
                      />
                    </div>

                    <div
                      className="
                        mt-4
                        flex
                        items-end
                        justify-between
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
                          Amount
                        </div>

                        <div
                          className="
                            mt-1
                            text-[11px]
                            font-black
                            text-[#222]
                          "
                        >
                          {formatMoney(
                            order.totalAmount
                          )}
                        </div>
                      </div>

                      <div
                        className="
                          text-right
                          text-[8px]
                          text-[#999]
                        "
                      >
                        {formatDate(
                          order.createdAt
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </>
        )}
      </section>

      {/* =================================
          QUICK ACTIONS
      ================================= */}

      <section>
        <div
          className="
            mb-3
          "
        >
          <h3
            className="
              text-[13px]
              font-black
              text-[#222]
            "
          >
            Quick Actions
          </h3>

          <p
            className="
              mt-1
              text-[9px]
              text-[#999]
            "
          >
            Jump directly to store
            management sections.
          </p>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
            xl:grid-cols-4
          "
        >
          {[
            {
              label:
                "Manage Products",
              description:
                "Create and update store products.",
              path:
                "/admin/products",
              icon: Package,
            },

            {
              label:
                "Manage Categories",
              description:
                "Organize product categories.",
              path:
                "/admin/categories",
              icon: Tags,
            },

            {
              label:
                "Manage Orders",
              description:
                "Review customer orders.",
              path:
                "/admin/orders",
              icon: ShoppingBag,
            },

            {
              label:
                "Store Content",
              description:
                "Manage website content.",
              path:
                "/admin/content",
              icon: Boxes,
            },
          ].map(
            (action) => {
              const Icon =
                action.icon;

              return (
                <Link
                  key={
                    action.path
                  }
                  to={
                    action.path
                  }
                  className="
                    group
                    flex
                    items-center
                    gap-3
                    rounded-[14px]
                    border
                    border-[#e8e8e8]
                    bg-white
                    p-4
                    transition
                    hover:border-[#dcdcdc]
                    hover:shadow-[0_8px_25px_rgba(0,0,0,0.035)]
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
                      rounded-[10px]
                      bg-[#f3f7ed]
                      text-[var(--primary-color)]
                    "
                  >
                    <Icon
                      size={17}
                    />
                  </div>

                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <div
                      className="
                        text-[10px]
                        font-bold
                        text-[#333]
                      "
                    >
                      {
                        action.label
                      }
                    </div>

                    <div
                      className="
                        mt-1
                        truncate
                        text-[8px]
                        text-[#999]
                      "
                    >
                      {
                        action.description
                      }
                    </div>
                  </div>

                  <ChevronRight
                    size={14}
                    className="
                      text-[#bbb]
                      transition
                      group-hover:translate-x-0.5
                      group-hover:text-[var(--primary-color)]
                    "
                  />
                </Link>
              );
            }
          )}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboardPage;