import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Boxes,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Clock3,
  CreditCard,
  Eye,
  LoaderCircle,
  Mail,
  MapPin,
  PackageCheck,
  Phone,
  RefreshCw,
  ReceiptText,
  Search,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";

import {
  cancelAdminOrder,
  getAdminOrders,
  updateAdminOrderStatus,
  updateAdminPaymentStatus,
} from "../../services/adminOrders";

import {
  getImageUrl,
} from "../../services/api";

// ========================================
// HELPERS
// ========================================

const formatMoney = (value) => {
  const amount = Number(value || 0);

  return `Rs. ${amount.toLocaleString(
    "en-PK",
    {
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }
  );
};

const normalizeImage = (image) => {
  if (!image) return "";

  if (typeof image === "string") {
    return image;
  }

  return (
    image.url ||
    image.path ||
    image.image ||
    ""
  );
};

const getCustomerName = (order) => {
  return [
    order?.customer?.firstName,
    order?.customer?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Customer";
};

const getAddress = (order) => {
  const address =
    order?.shippingAddress;

  if (!address) return "—";

  return [
    address.address,
    address.area,
    address.city,
    address.province,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const STATUS_STYLES = {
  pending:
    "bg-amber-50 text-amber-700 ring-amber-200",
  confirmed:
    "bg-blue-50 text-blue-700 ring-blue-200",
  processing:
    "bg-violet-50 text-violet-700 ring-violet-200",
  shipped:
    "bg-cyan-50 text-cyan-700 ring-cyan-200",
  delivered:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelled:
    "bg-red-50 text-red-700 ring-red-200",
};

const PAYMENT_STYLES = {
  pending:
    "bg-amber-50 text-amber-700 ring-amber-200",
  paid:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  failed:
    "bg-red-50 text-red-700 ring-red-200",
  refunded:
    "bg-slate-100 text-slate-700 ring-slate-200",
};

const StatusBadge = ({ status }) => {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-[11px]
        font-bold
        capitalize
        ring-1
        ring-inset
        ${
          STATUS_STYLES[status] ||
          "bg-slate-100 text-slate-700 ring-slate-200"
        }
      `}
    >
      {status === "shipped"
        ? "Dispatched"
        : status || "Unknown"}
    </span>
  );
};

const PaymentBadge = ({ status }) => {
  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        px-2.5
        py-1
        text-[11px]
        font-bold
        capitalize
        ring-1
        ring-inset
        ${
          PAYMENT_STYLES[status] ||
          "bg-slate-100 text-slate-700 ring-slate-200"
        }
      `}
    >
      {status || "Unknown"}
    </span>
  );
};


// ========================================
// COMPACT ICON ACTION BUTTON
//
// - Small square icon button
// - Native title tooltip
// - Custom hover/focus tooltip
// - Accessible on keyboard/mobile via aria-label
// ========================================

const ACTION_BUTTON_STYLES = {
  neutral:
    "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900",
  primary:
    "border-[#6f9f2f] bg-[#6f9f2f] text-white hover:bg-[#628d29]",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300 hover:bg-emerald-100",
  danger:
    "border-red-200 bg-red-50 text-red-600 hover:border-red-300 hover:bg-red-100",
};

const IconActionButton = ({
  label,
  icon: Icon,
  onClick,
  disabled = false,
  variant = "neutral",
}) => {
  return (
    <span
      className="
        group
        relative
        inline-flex
      "
    >
      <button
        type="button"
        title={label}
        aria-label={label}
        disabled={disabled}
        onClick={onClick}
        className={`
          inline-flex
          h-8
          w-8
          shrink-0
          touch-manipulation
          items-center
          justify-center
          rounded-lg
          border
          transition
          duration-150
          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-[#6f9f2f]/30
          disabled:cursor-not-allowed
          disabled:opacity-40
          sm:h-[34px]
          sm:w-[34px]
          ${
            ACTION_BUTTON_STYLES[
              variant
            ] ||
            ACTION_BUTTON_STYLES.neutral
          }
        `}
      >
        <Icon
          size={14}
          strokeWidth={2}
        />

        <span className="sr-only">
          {label}
        </span>
      </button>

      <span
        role="tooltip"
        className="
          pointer-events-none
          absolute
          bottom-[calc(100%+7px)]
          left-1/2
          z-[80]
          -translate-x-1/2
          whitespace-nowrap
          rounded-md
          bg-slate-900
          px-2
          py-1
          text-[10px]
          font-semibold
          text-white
          opacity-0
          shadow-lg
          transition-opacity
          duration-150
          group-hover:opacity-100
          group-focus-within:opacity-100
        "
      >
        {label}

        <span
          className="
            absolute
            left-1/2
            top-full
            -translate-x-1/2
            border-4
            border-transparent
            border-t-slate-900
          "
        />
      </span>
    </span>
  );
};

// ========================================
// ORDER DETAILS MODAL
// ========================================

const OrderDetailsModal = ({
  order,
  onClose,
  onRefresh,
  setNotice,
}) => {
  const [courierName, setCourierName] =
    useState(order?.courierName || "");

  const [
    trackingNumber,
    setTrackingNumber,
  ] = useState(
    order?.trackingNumber || ""
  );

  const [adminNote, setAdminNote] =
    useState(order?.adminNote || "");

  const [saving, setSaving] =
    useState(false);

  if (!order) return null;

  const saveShippingDetails =
    async () => {
      if (
        order.orderStatus ===
        "cancelled"
      ) {
        return;
      }

      try {
        setSaving(true);

        await updateAdminOrderStatus(
          order._id,
          {
            orderStatus:
              order.orderStatus,
            courierName,
            trackingNumber,
            adminNote,
          }
        );

        setNotice({
          type: "success",
          text: "Order details saved successfully.",
        });

        await onRefresh();
        onClose();
      } catch (error) {
        setNotice({
          type: "error",
          text:
            error.message ||
            "Could not save order details.",
        });
      } finally {
        setSaving(false);
      }
    };

  const dispatchFromModal =
    async () => {
      try {
        setSaving(true);

        await updateAdminOrderStatus(
          order._id,
          {
            orderStatus: "shipped",
            courierName,
            trackingNumber,
            adminNote,
          }
        );

        setNotice({
          type: "success",
          text: "Order dispatched successfully.",
        });

        await onRefresh();
        onClose();
      } catch (error) {
        setNotice({
          type: "error",
          text:
            error.message ||
            "Could not dispatch order.",
        });
      } finally {
        setSaving(false);
      }
    };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/45
        p-4
      "
      onMouseDown={onClose}
    >
      <div
        className="
          max-h-[92vh]
          w-full
          max-w-[900px]
          overflow-y-auto
          rounded-[22px]
          bg-white
          shadow-2xl
        "
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div
          className="
            sticky
            top-0
            z-10
            flex
            items-start
            justify-between
            gap-4
            border-b
            border-slate-200
            bg-white
            px-6
            py-5
          "
        >
          <div>
            <div
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#6f9f2f]
              "
            >
              Order details
            </div>

            <h2
              className="
                mt-1
                text-[22px]
                font-black
                text-slate-900
              "
            >
              #
              {order.orderNumber ||
                order._id}
            </h2>

            <div
              className="
                mt-2
                flex
                flex-wrap
                gap-2
              "
            >
              <StatusBadge
                status={
                  order.orderStatus
                }
              />

              <PaymentBadge
                status={
                  order.paymentStatus
                }
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-full
              border
              border-slate-200
              text-slate-500
              transition
              hover:bg-slate-50
              hover:text-slate-900
            "
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="
            grid
            grid-cols-1
            gap-6
            p-6
            lg:grid-cols-[1fr_330px]
          "
        >
          <div
            className="
              space-y-6
            "
          >
            <section
              className="
                rounded-[18px]
                border
                border-slate-200
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[15px]
                  font-black
                  text-slate-900
                "
              >
                <Boxes
                  size={18}
                  className="text-[#6f9f2f]"
                />
                Order items
              </div>

              <div
                className="
                  mt-4
                  divide-y
                  divide-slate-100
                "
              >
                {(order.items || []).map(
                  (item, index) => {
                    const image =
                      normalizeImage(
                        item.image ||
                          item.product
                            ?.mainImage
                      );

                    return (
                      <div
                        key={
                          item._id ||
                          `${index}-${item.name}`
                        }
                        className="
                          flex
                          items-center
                          gap-4
                          py-4
                        "
                      >
                        <div
                          className="
                            flex
                            h-16
                            w-16
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-[14px]
                            bg-slate-50
                          "
                        >
                          {image ? (
                            <img
                              src={getImageUrl(
                                image
                              )}
                              alt={
                                item.name ||
                                "Product"
                              }
                              className="
                                h-full
                                w-full
                                object-contain
                                p-2
                              "
                            />
                          ) : (
                            <Boxes
                              size={22}
                              className="text-slate-300"
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
                              text-[13px]
                              font-bold
                              text-slate-900
                            "
                          >
                            {item.name ||
                              "Product"}
                          </div>

                          <div
                            className="
                              mt-1
                              text-[11px]
                              text-slate-500
                            "
                          >
                            Qty:{" "}
                            {item.quantity ||
                              1}
                            {item.variantName
                              ? ` • ${item.variantName}`
                              : ""}
                          </div>
                        </div>

                        <div
                          className="
                            text-right
                            text-[13px]
                            font-black
                            text-slate-900
                          "
                        >
                          {formatMoney(
                            item.subtotal ??
                              Number(
                                item.unitPrice ||
                                  0
                              ) *
                                Number(
                                  item.quantity ||
                                    1
                                )
                          )}
                        </div>
                      </div>
                    );
                  }
                )}
              </div>
            </section>

            <section
              className="
                rounded-[18px]
                border
                border-slate-200
                p-5
              "
            >
              <div
                className="
                  text-[15px]
                  font-black
                  text-slate-900
                "
              >
                Shipping management
              </div>

              <div
                className="
                  mt-4
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                "
              >
                <label>
                  <span
                    className="
                      mb-2
                      block
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Courier
                  </span>

                  <input
                    value={courierName}
                    onChange={(event) =>
                      setCourierName(
                        event.target.value
                      )
                    }
                    disabled={
                      order.orderStatus ===
                      "cancelled"
                    }
                    placeholder="e.g. TCS / Leopards"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-3
                      text-[13px]
                      outline-none
                      transition
                      focus:border-[#6f9f2f]
                    "
                  />
                </label>

                <label>
                  <span
                    className="
                      mb-2
                      block
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-slate-500
                    "
                  >
                    Tracking number
                  </span>

                  <input
                    value={
                      trackingNumber
                    }
                    onChange={(event) =>
                      setTrackingNumber(
                        event.target.value
                      )
                    }
                    disabled={
                      order.orderStatus ===
                      "cancelled"
                    }
                    placeholder="Courier tracking ID"
                    className="
                      h-11
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      px-3
                      text-[13px]
                      outline-none
                      transition
                      focus:border-[#6f9f2f]
                    "
                  />
                </label>
              </div>

              <label
                className="
                  mt-4
                  block
                "
              >
                <span
                  className="
                    mb-2
                    block
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-wide
                    text-slate-500
                  "
                >
                  Admin note
                </span>

                <textarea
                  value={adminNote}
                  onChange={(event) =>
                    setAdminNote(
                      event.target.value
                    )
                  }
                  disabled={
                    order.orderStatus ===
                    "cancelled"
                  }
                  rows={3}
                  placeholder="Internal note for this order"
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-slate-200
                    p-3
                    text-[13px]
                    outline-none
                    transition
                    focus:border-[#6f9f2f]
                  "
                />
              </label>

              {order.orderStatus !==
                "cancelled" && (
                <div
                  className="
                    mt-4
                    flex
                    flex-wrap
                    gap-3
                  "
                >
                  <button
                    type="button"
                    onClick={
                      saveShippingDetails
                    }
                    disabled={saving}
                    className="
                      inline-flex
                      h-11
                      items-center
                      justify-center
                      gap-2
                      rounded-xl
                      border
                      border-slate-200
                      px-4
                      text-[12px]
                      font-bold
                      text-slate-700
                      transition
                      hover:bg-slate-50
                      disabled:opacity-50
                    "
                  >
                    {saving ? (
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Check
                        size={15}
                      />
                    )}
                    Save details
                  </button>

                  {[
                    "pending",
                    "confirmed",
                    "processing",
                  ].includes(
                    order.orderStatus
                  ) && (
                    <button
                      type="button"
                      onClick={
                        dispatchFromModal
                      }
                      disabled={saving}
                      className="
                        inline-flex
                        h-11
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        bg-[#6f9f2f]
                        px-4
                        text-[12px]
                        font-bold
                        text-white
                        transition
                        hover:opacity-90
                        disabled:opacity-50
                      "
                    >
                      <Truck
                        size={15}
                      />
                      Dispatch order
                    </button>
                  )}
                </div>
              )}
            </section>
          </div>

          <aside
            className="
              space-y-4
              self-start
            "
          >
            <section
              className="
                rounded-[18px]
                bg-slate-50
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[14px]
                  font-black
                  text-slate-900
                "
              >
                <User size={17} />
                Customer
              </div>

              <div
                className="
                  mt-4
                  text-[13px]
                  font-bold
                  text-slate-900
                "
              >
                {getCustomerName(order)}
              </div>

              {order.customer?.phone && (
                <a
                  href={`tel:${order.customer.phone}`}
                  className="
                    mt-3
                    flex
                    items-center
                    gap-2
                    text-[12px]
                    text-slate-600
                    hover:text-[#6f9f2f]
                  "
                >
                  <Phone size={14} />
                  {order.customer.phone}
                </a>
              )}

              {order.customer?.email && (
                <a
                  href={`mailto:${order.customer.email}`}
                  className="
                    mt-2
                    flex
                    items-center
                    gap-2
                    break-all
                    text-[12px]
                    text-slate-600
                    hover:text-[#6f9f2f]
                  "
                >
                  <Mail size={14} />
                  {order.customer.email}
                </a>
              )}
            </section>

            <section
              className="
                rounded-[18px]
                border
                border-slate-200
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[14px]
                  font-black
                  text-slate-900
                "
              >
                <MapPin size={17} />
                Delivery address
              </div>

              <p
                className="
                  mt-3
                  text-[12px]
                  leading-6
                  text-slate-600
                "
              >
                {getAddress(order)}
              </p>

              {order.shippingAddress
                ?.landmark && (
                <p
                  className="
                    mt-2
                    text-[11px]
                    text-slate-500
                  "
                >
                  Landmark:{" "}
                  {
                    order
                      .shippingAddress
                      .landmark
                  }
                </p>
              )}
            </section>

            <section
              className="
                rounded-[18px]
                border
                border-slate-200
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[14px]
                  font-black
                  text-slate-900
                "
              >
                <CreditCard
                  size={17}
                />
                Payment
              </div>

              <div
                className="
                  mt-4
                  space-y-3
                  text-[12px]
                "
              >
                <div
                  className="
                    flex
                    justify-between
                    gap-3
                  "
                >
                  <span
                    className="text-slate-500"
                  >
                    Method
                  </span>
                  <strong
                    className="
                      uppercase
                      text-slate-900
                    "
                  >
                    {order.paymentMethod ||
                      "—"}
                  </strong>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                  "
                >
                  <span
                    className="text-slate-500"
                  >
                    Subtotal
                  </span>
                  <strong>
                    {formatMoney(
                      order.subtotal
                    )}
                  </strong>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                  "
                >
                  <span
                    className="text-slate-500"
                  >
                    Delivery
                  </span>
                  <strong>
                    {formatMoney(
                      order.deliveryFee
                    )}
                  </strong>
                </div>

                <div
                  className="
                    flex
                    justify-between
                    gap-3
                    border-t
                    border-slate-200
                    pt-3
                  "
                >
                  <span
                    className="
                      font-bold
                      text-slate-900
                    "
                  >
                    Total
                  </span>
                  <strong
                    className="
                      text-[15px]
                      text-[#6f9f2f]
                    "
                  >
                    {formatMoney(
                      order.totalAmount
                    )}
                  </strong>
                </div>
              </div>
            </section>

            <section
              className="
                rounded-[18px]
                border
                border-slate-200
                p-5
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2
                  text-[14px]
                  font-black
                  text-slate-900
                "
              >
                <CalendarDays
                  size={17}
                />
                Timeline
              </div>

              <div
                className="
                  mt-4
                  space-y-3
                  text-[11px]
                  text-slate-600
                "
              >
                <div>
                  <strong>
                    Ordered:
                  </strong>{" "}
                  {formatDate(
                    order.createdAt
                  )}
                </div>

                {order.shippedAt && (
                  <div>
                    <strong>
                      Dispatched:
                    </strong>{" "}
                    {formatDate(
                      order.shippedAt
                    )}
                  </div>
                )}

                {order.deliveredAt && (
                  <div>
                    <strong>
                      Delivered:
                    </strong>{" "}
                    {formatDate(
                      order.deliveredAt
                    )}
                  </div>
                )}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
};

// ========================================
// ADMIN ORDERS PAGE
// ========================================

const AdminOrdersPage = () => {
  const [orders, setOrders] =
    useState([]);

  const [summary, setSummary] =
    useState({
      totalOrders: 0,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalOrderValue: 0,
      deliveredRevenue: 0,
    });

  const [page, setPage] =
    useState(1);

  const [pages, setPages] =
    useState(1);

  const [search, setSearch] =
    useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [status, setStatus] =
    useState("all");

  const [
    paymentStatus,
    setPaymentStatus,
  ] = useState("all");

  const [sort, setSort] =
    useState("newest");

  const [loading, setLoading] =
    useState(true);

  const [
    actionOrderId,
    setActionOrderId,
  ] = useState("");

  const [
    selectedOrder,
    setSelectedOrder,
  ] = useState(null);

  const [notice, setNotice] =
    useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(
        search.trim()
      );
      setPage(1);
    }, 350);

    return () =>
      clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [
    status,
    paymentStatus,
    sort,
  ]);

  const loadOrders = useCallback(
    async () => {
      try {
        setLoading(true);

        const data =
          await getAdminOrders({
            page,
            limit: 15,
            status,
            paymentStatus,
            sort,
            search:
              debouncedSearch,
          });

        setOrders(
          Array.isArray(data.orders)
            ? data.orders
            : []
        );

        setPages(
          Number(data.pages) || 1
        );

        if (data.summary) {
          setSummary(data.summary);
        }
      } catch (error) {
        setNotice({
          type: "error",
          text:
            error.message ||
            "Could not load orders.",
        });

        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [
      page,
      status,
      paymentStatus,
      sort,
      debouncedSearch,
    ]
  );

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(
      () => setNotice(null),
      4000
    );

    return () =>
      clearTimeout(timer);
  }, [notice]);

  const summaryCards = useMemo(
    () => [
      {
        label: "Total orders",
        value: summary.totalOrders,
        icon: Boxes,
      },
      {
        label: "Pending",
        value: summary.pending,
        icon: Clock3,
      },
      {
        label: "Processing",
        value:
          Number(
            summary.confirmed || 0
          ) +
          Number(
            summary.processing || 0
          ),
        icon: PackageCheck,
      },
      {
        label: "Dispatched",
        value: summary.shipped,
        icon: Truck,
      },
      {
        label: "Delivered",
        value: summary.delivered,
        icon: CheckCircle2,
      },
    ],
    [summary]
  );

  const runStatusAction =
    async (
      order,
      nextStatus
    ) => {
      try {
        setActionOrderId(
          order._id
        );

        const result =
          await updateAdminOrderStatus(
            order._id,
            {
              orderStatus:
                nextStatus,
            }
          );

        setNotice({
          type: "success",
          text:
            result.message ||
            "Order updated.",
        });

        await loadOrders();
      } catch (error) {
        setNotice({
          type: "error",
          text:
            error.message ||
            "Could not update order.",
        });
      } finally {
        setActionOrderId("");
      }
    };

  const markPaid = async (
    order
  ) => {
    try {
      setActionOrderId(
        order._id
      );

      const result =
        await updateAdminPaymentStatus(
          order._id,
          {
            paymentStatus: "paid",
          }
        );

      setNotice({
        type: "success",
        text:
          result.message ||
          "Payment marked as paid.",
      });

      await loadOrders();
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error.message ||
          "Could not update payment.",
      });
    } finally {
      setActionOrderId("");
    }
  };

  const cancelOrder = async (
    order
  ) => {
    const reason = window.prompt(
      "Cancellation reason:",
      "Cancelled by admin"
    );

    if (reason === null) {
      return;
    }

    const confirmed =
      window.confirm(
        `Cancel order #${
          order.orderNumber ||
          order._id
        } and restore its stock?`
      );

    if (!confirmed) return;

    try {
      setActionOrderId(
        order._id
      );

      const result =
        await cancelAdminOrder(
          order._id,
          reason.trim() ||
            "Cancelled by admin"
        );

      setNotice({
        type: "success",
        text:
          result.message ||
          "Order cancelled.",
      });

      await loadOrders();
    } catch (error) {
      setNotice({
        type: "error",
        text:
          error.message ||
          "Could not cancel order.",
      });
    } finally {
      setActionOrderId("");
    }
  };

  return (
    <div
      className="
        min-h-full
        bg-[#f8f9f6]
        p-4
        sm:p-6
        xl:p-8
      "
    >
      {notice && (
        <div
          className={`
            fixed
            right-5
            top-5
            z-[120]
            max-w-[420px]
            rounded-2xl
            px-4
            py-3
            text-[13px]
            font-semibold
            shadow-xl
            ${
              notice.type ===
              "success"
                ? "bg-emerald-600 text-white"
                : "bg-red-600 text-white"
            }
          `}
        >
          {notice.text}
        </div>
      )}

      <div
        className="
          mx-auto
          max-w-[1600px]
        "
      >
        <div
          className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            <div
              className="
                text-[11px]
                font-bold
                uppercase
                tracking-[0.14em]
                text-[#6f9f2f]
              "
            >
              Order management
            </div>

            <h1
              className="
                mt-1
                text-[28px]
                font-black
                tracking-tight
                text-slate-900
              "
            >
              Customer Orders
            </h1>

            <p
              className="
                mt-1
                text-[12px]
                text-slate-500
              "
            >
              View, dispatch,
              deliver and manage
              customer orders from
              one place.
            </p>
          </div>

          <button
            type="button"
            onClick={loadOrders}
            disabled={loading}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-4
              text-[12px]
              font-bold
              text-slate-700
              shadow-sm
              transition
              hover:bg-slate-50
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={15}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh orders
          </button>
        </div>

        <div
          className="
            mt-6
            grid
            grid-cols-2
            gap-3
            lg:grid-cols-5
          "
        >
          {summaryCards.map(
            ({
              label,
              value,
              icon: Icon,
            }) => (
              <div
                key={label}
                className="
                  rounded-[18px]
                  border
                  border-slate-200
                  bg-white
                  p-4
                  shadow-sm
                "
              >
                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                >
                  <div>
                    <div
                      className="
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wide
                        text-slate-400
                      "
                    >
                      {label}
                    </div>

                    <div
                      className="
                        mt-2
                        text-[24px]
                        font-black
                        text-slate-900
                      "
                    >
                      {value || 0}
                    </div>
                  </div>

                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#f1f7e9]
                      text-[#6f9f2f]
                    "
                  >
                    <Icon
                      size={18}
                    />
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3
            rounded-[18px]
            border
            border-slate-200
            bg-white
            p-4
            shadow-sm
            md:grid-cols-[1fr_180px_180px_180px]
          "
        >
          <div
            className="
              relative
            "
          >
            <Search
              size={16}
              className="
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
              placeholder="Search order no, customer, phone or email..."
              className="
                h-11
                w-full
                rounded-xl
                border
                border-slate-200
                pl-10
                pr-3
                text-[12px]
                outline-none
                transition
                focus:border-[#6f9f2f]
              "
            />
          </div>

          <select
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            className="
              h-11
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-[12px]
              outline-none
              focus:border-[#6f9f2f]
            "
          >
            <option value="all">
              All statuses
            </option>
            <option value="pending">
              Pending
            </option>
            <option value="confirmed">
              Confirmed
            </option>
            <option value="processing">
              Processing
            </option>
            <option value="shipped">
              Dispatched
            </option>
            <option value="delivered">
              Delivered
            </option>
            <option value="cancelled">
              Cancelled
            </option>
          </select>

          <select
            value={paymentStatus}
            onChange={(event) =>
              setPaymentStatus(
                event.target.value
              )
            }
            className="
              h-11
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-[12px]
              outline-none
              focus:border-[#6f9f2f]
            "
          >
            <option value="all">
              All payments
            </option>
            <option value="pending">
              Payment pending
            </option>
            <option value="paid">
              Paid
            </option>
            <option value="failed">
              Failed
            </option>
            <option value="refunded">
              Refunded
            </option>
          </select>

          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value
              )
            }
            className="
              h-11
              rounded-xl
              border
              border-slate-200
              bg-white
              px-3
              text-[12px]
              outline-none
              focus:border-[#6f9f2f]
            "
          >
            <option value="newest">
              Newest first
            </option>
            <option value="oldest">
              Oldest first
            </option>
            <option value="amount-high">
              Amount high-low
            </option>
            <option value="amount-low">
              Amount low-high
            </option>
          </select>
        </div>

        <div
          className="
            mt-5
            overflow-hidden
            rounded-[20px]
            border
            border-slate-200
            bg-white
            shadow-sm
          "
        >
          {loading ? (
            <div
              className="
                flex
                min-h-[360px]
                flex-col
                items-center
                justify-center
                gap-3
                text-slate-500
              "
            >
              <LoaderCircle
                size={28}
                className="
                  animate-spin
                  text-[#6f9f2f]
                "
              />
              <span
                className="
                  text-[12px]
                  font-semibold
                "
              >
                Loading orders...
              </span>
            </div>
          ) : orders.length === 0 ? (
            <div
              className="
                flex
                min-h-[320px]
                flex-col
                items-center
                justify-center
                p-6
                text-center
              "
            >
              <Boxes
                size={38}
                className="text-slate-300"
              />

              <h3
                className="
                  mt-4
                  text-[17px]
                  font-black
                  text-slate-800
                "
              >
                No orders found
              </h3>

              <p
                className="
                  mt-2
                  text-[12px]
                  text-slate-500
                "
              >
                Try changing your
                filters or search.
              </p>
            </div>
          ) : (
            <>
              <div
                className="
                  hidden
                  overflow-x-auto
                  lg:block
                "
              >
                <table
                  className="
                    w-full
                    min-w-[940px]
                    border-collapse
                  "
                >
                  <thead>
                    <tr
                      className="
                        border-b
                        border-slate-200
                        bg-slate-50/80
                      "
                    >
                      {[
                        "Order",
                        "Customer",
                        "Date",
                        "Total",
                        "Payment",
                        "Status",
                        "Actions",
                      ].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="
                              px-5
                              py-4
                              text-left
                              text-[10px]
                              font-black
                              uppercase
                              tracking-[0.08em]
                              text-slate-400
                            "
                          >
                            {heading}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>

                  <tbody
                    className="
                      divide-y
                      divide-slate-100
                    "
                  >
                    {orders.map(
                      (order) => {
                        const busy =
                          actionOrderId ===
                          order._id;

                        const canDispatch =
                          [
                            "pending",
                            "confirmed",
                            "processing",
                          ].includes(
                            order.orderStatus
                          );

                        return (
                          <tr
                            key={
                              order._id
                            }
                            className="
                              transition
                              hover:bg-slate-50/60
                            "
                          >
                            <td
                              className="
                                px-5
                                py-4
                              "
                            >
                              <div
                                className="
                                  text-[12px]
                                  font-black
                                  text-slate-900
                                "
                              >
                                #
                                {order.orderNumber ||
                                  order._id}
                              </div>

                              <div
                                className="
                                  mt-1
                                  text-[10px]
                                  text-slate-400
                                "
                              >
                                {order.items
                                  ?.length ||
                                  0}{" "}
                                item(s)
                              </div>
                            </td>

                            <td
                              className="
                                px-5
                                py-4
                              "
                            >
                              <div
                                className="
                                  text-[12px]
                                  font-bold
                                  text-slate-800
                                "
                              >
                                {getCustomerName(
                                  order
                                )}
                              </div>

                              <div
                                className="
                                  mt-1
                                  text-[10px]
                                  text-slate-500
                                "
                              >
                                {order.customer
                                  ?.phone ||
                                  "No phone"}
                              </div>
                            </td>

                            <td
                              className="
                                px-5
                                py-4
                                text-[11px]
                                text-slate-600
                              "
                            >
                              {formatDate(
                                order.createdAt
                              )}
                            </td>

                            <td
                              className="
                                px-5
                                py-4
                                text-[13px]
                                font-black
                                text-slate-900
                              "
                            >
                              {formatMoney(
                                order.totalAmount
                              )}
                            </td>

                            <td
                              className="
                                px-5
                                py-4
                              "
                            >
                              <PaymentBadge
                                status={
                                  order.paymentStatus
                                }
                              />

                              <div
                                className="
                                  mt-1.5
                                  text-[9px]
                                  font-semibold
                                  uppercase
                                  text-slate-400
                                "
                              >
                                {order.paymentMethod ||
                                  "—"}
                              </div>
                            </td>

                            <td
                              className="
                                px-5
                                py-4
                              "
                            >
                              <StatusBadge
                                status={
                                  order.orderStatus
                                }
                              />
                            </td>

                            <td
                              className="
                                px-5
                                py-4
                              "
                            >
                              <div
                                className="
                                  flex
                                  flex-wrap
                                  items-center
                                  gap-1.5
                                "
                              >
                                {order.orderStatus ===
                                  "pending" && (
                                  <IconActionButton
                                    label="Confirm order"
                                    icon={Check}
                                    disabled={busy}
                                    variant="neutral"
                                    onClick={() =>
                                      runStatusAction(
                                        order,
                                        "confirmed"
                                      )
                                    }
                                  />
                                )}

                                {canDispatch && (
                                  <IconActionButton
                                    label="Dispatch order"
                                    icon={Truck}
                                    disabled={busy}
                                    variant="primary"
                                    onClick={() =>
                                      runStatusAction(
                                        order,
                                        "shipped"
                                      )
                                    }
                                  />
                                )}

                                {order.orderStatus ===
                                  "shipped" && (
                                  <IconActionButton
                                    label="Mark delivered"
                                    icon={CheckCircle2}
                                    disabled={busy}
                                    variant="success"
                                    onClick={() =>
                                      runStatusAction(
                                        order,
                                        "delivered"
                                      )
                                    }
                                  />
                                )}

                                {order.paymentStatus !==
                                  "paid" &&
                                  order.orderStatus !==
                                    "cancelled" && (
                                    <IconActionButton
                                      label="Mark payment paid"
                                      icon={BadgeCheck}
                                      disabled={busy}
                                      variant="success"
                                      onClick={() =>
                                        markPaid(
                                          order
                                        )
                                      }
                                    />
                                  )}

                                {![
                                  "delivered",
                                  "cancelled",
                                ].includes(
                                  order.orderStatus
                                ) && (
                                  <IconActionButton
                                    label="Cancel order"
                                    icon={XCircle}
                                    disabled={busy}
                                    variant="danger"
                                    onClick={() =>
                                      cancelOrder(
                                        order
                                      )
                                    }
                                  />
                                )}


                                <IconActionButton
                                  label="Open invoice"
                                  icon={ReceiptText}
                                  disabled={false}
                                  variant="neutral"
                                  onClick={() =>
                                    window.open(
                                      `/admin/orders/${order._id}/invoice`,
                                      "_blank",
                                      "noopener,noreferrer"
                                    )
                                  }
                                />

                                <IconActionButton
                                  label="View order details"
                                  icon={Eye}
                                  disabled={false}
                                  variant="neutral"
                                  onClick={() =>
                                    setSelectedOrder(
                                      order
                                    )
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>

              <div
                className="
                  divide-y
                  divide-slate-100
                  lg:hidden
                "
              >
                {orders.map(
                  (order) => {
                    const busy =
                      actionOrderId ===
                      order._id;

                    const canDispatch =
                      [
                        "pending",
                        "confirmed",
                        "processing",
                      ].includes(
                        order.orderStatus
                      );

                    return (
                      <div
                        key={order._id}
                        className="p-4"
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
                                text-[12px]
                                font-black
                                text-slate-900
                              "
                            >
                              #
                              {order.orderNumber ||
                                order._id}
                            </div>

                            <div
                              className="
                                mt-1
                                text-[11px]
                                text-slate-500
                              "
                            >
                              {getCustomerName(
                                order
                              )}
                            </div>
                          </div>

                          <StatusBadge
                            status={
                              order.orderStatus
                            }
                          />
                        </div>

                        <div
                          className="
                            mt-4
                            grid
                            grid-cols-2
                            gap-3
                            rounded-xl
                            bg-slate-50
                            p-3
                          "
                        >
                          <div>
                            <div
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                text-slate-400
                              "
                            >
                              Total
                            </div>

                            <div
                              className="
                                mt-1
                                text-[12px]
                                font-black
                              "
                            >
                              {formatMoney(
                                order.totalAmount
                              )}
                            </div>
                          </div>

                          <div>
                            <div
                              className="
                                text-[9px]
                                font-bold
                                uppercase
                                text-slate-400
                              "
                            >
                              Payment
                            </div>

                            <div
                              className="mt-1"
                            >
                              <PaymentBadge
                                status={
                                  order.paymentStatus
                                }
                              />
                            </div>
                          </div>
                        </div>

                        <div
                          className="
                            mt-4
                            flex
                            flex-wrap
                            items-center
                            gap-2
                          "
                        >
                          {order.orderStatus ===
                            "pending" && (
                            <IconActionButton
                              label="Confirm order"
                              icon={Check}
                              disabled={busy}
                              variant="neutral"
                              onClick={() =>
                                runStatusAction(
                                  order,
                                  "confirmed"
                                )
                              }
                            />
                          )}

                          {canDispatch && (
                            <IconActionButton
                              label="Dispatch order"
                              icon={Truck}
                              disabled={busy}
                              variant="primary"
                              onClick={() =>
                                runStatusAction(
                                  order,
                                  "shipped"
                                )
                              }
                            />
                          )}

                          {order.orderStatus ===
                            "shipped" && (
                            <IconActionButton
                              label="Mark delivered"
                              icon={CheckCircle2}
                              disabled={busy}
                              variant="success"
                              onClick={() =>
                                runStatusAction(
                                  order,
                                  "delivered"
                                )
                              }
                            />
                          )}

                          {order.paymentStatus !==
                            "paid" &&
                            order.orderStatus !==
                              "cancelled" && (
                              <IconActionButton
                                label="Mark payment paid"
                                icon={BadgeCheck}
                                disabled={busy}
                                variant="success"
                                onClick={() =>
                                  markPaid(
                                    order
                                  )
                                }
                              />
                            )}

                          {![
                            "delivered",
                            "cancelled",
                          ].includes(
                            order.orderStatus
                          ) && (
                            <IconActionButton
                              label="Cancel order"
                              icon={XCircle}
                              disabled={busy}
                              variant="danger"
                              onClick={() =>
                                cancelOrder(
                                  order
                                )
                              }
                            />
                          )}

                          <IconActionButton
                            label="Open invoice"
                            icon={ReceiptText}
                            variant="neutral"
                            onClick={() =>
                              window.open(
                                `/admin/orders/${order._id}/invoice`,
                                "_blank",
                                "noopener,noreferrer"
                              )
                            }
                          />

                          <IconActionButton
                            label="View order details"
                            icon={Eye}
                            variant="neutral"
                            onClick={() =>
                              setSelectedOrder(
                                order
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-t
                  border-slate-200
                  px-4
                  py-4
                "
              >
                <button
                  type="button"
                  disabled={
                    page <= 1 ||
                    loading
                  }
                  onClick={() =>
                    setPage((value) =>
                      Math.max(
                        value - 1,
                        1
                      )
                    )
                  }
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-1
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    text-[11px]
                    font-bold
                    text-slate-600
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  <ChevronLeft
                    size={14}
                  />
                  Previous
                </button>

                <div
                  className="
                    text-[11px]
                    font-semibold
                    text-slate-500
                  "
                >
                  Page{" "}
                  <strong
                    className="text-slate-900"
                  >
                    {page}
                  </strong>{" "}
                  of{" "}
                  <strong
                    className="text-slate-900"
                  >
                    {pages}
                  </strong>
                </div>

                <button
                  type="button"
                  disabled={
                    page >= pages ||
                    loading
                  }
                  onClick={() =>
                    setPage((value) =>
                      Math.min(
                        value + 1,
                        pages
                      )
                    )
                  }
                  className="
                    inline-flex
                    h-9
                    items-center
                    gap-1
                    rounded-lg
                    border
                    border-slate-200
                    px-3
                    text-[11px]
                    font-bold
                    text-slate-600
                    disabled:cursor-not-allowed
                    disabled:opacity-40
                  "
                >
                  Next
                  <ChevronRight
                    size={14}
                  />
                </button>
              </div>
            </>
          )}
        </div>

        <div
          className="
            mt-5
            grid
            grid-cols-1
            gap-3
            sm:grid-cols-2
          "
        >
          <div
            className="
              rounded-[18px]
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
            "
          >
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Active order value
            </div>

            <div
              className="
                mt-2
                text-[20px]
                font-black
                text-slate-900
              "
            >
              {formatMoney(
                summary.totalOrderValue
              )}
            </div>
          </div>

          <div
            className="
              rounded-[18px]
              border
              border-slate-200
              bg-white
              p-4
              shadow-sm
            "
          >
            <div
              className="
                text-[10px]
                font-bold
                uppercase
                tracking-wide
                text-slate-400
              "
            >
              Delivered revenue
            </div>

            <div
              className="
                mt-2
                text-[20px]
                font-black
                text-emerald-700
              "
            >
              {formatMoney(
                summary.deliveredRevenue
              )}
            </div>
          </div>
        </div>
      </div>

      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() =>
            setSelectedOrder(null)
          }
          onRefresh={loadOrders}
          setNotice={setNotice}
        />
      )}
    </div>
  );
};

export default AdminOrdersPage;
