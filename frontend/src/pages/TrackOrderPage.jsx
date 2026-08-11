import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  Check,
  Clock3,
  CreditCard,
  MapPin,
  Package,
  Search,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

import {
  getImageUrl,
  trackOrder,
} from "../services/api";

import {
  useSite,
} from "../context/SiteContext";

// ========================================
// ORDER STATUS STEPS
// ========================================

const ORDER_STEPS = [
  {
    key: "pending",
    label: "Order placed",
  },
  {
    key: "confirmed",
    label: "Confirmed",
  },
  {
    key: "processing",
    label: "Processing",
  },
  {
    key: "shipped",
    label: "Shipped",
  },
  {
    key: "delivered",
    label: "Delivered",
  },
];

// ========================================
// PAYMENT METHOD LABEL
// ========================================

const getPaymentLabel = (
  method
) => {
  switch (method) {
    case "cod":
      return "Cash on delivery";

    case "bank-transfer":
      return "Bank transfer";

    case "easypaisa":
      return "Easypaisa";

    case "jazzcash":
      return "JazzCash";

    case "card":
      return "Card payment";

    default:
      return method || "—";
  }
};

// ========================================
// STATUS LABEL
// ========================================

const getStatusLabel = (
  status
) => {
  switch (status) {
    case "pending":
      return "Order placed";

    case "confirmed":
      return "Confirmed";

    case "processing":
      return "Processing";

    case "shipped":
      return "Shipped";

    case "delivered":
      return "Delivered";

    case "cancelled":
      return "Cancelled";

    default:
      return status || "Pending";
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
// NORMALIZE IMAGE
// ========================================

const normalizeImage = (
  image
) => {
  if (!image) {
    return "";
  }

  if (
    typeof image ===
    "string"
  ) {
    return image;
  }

  return (
    image.url ||
    image.path ||
    image.image ||
    ""
  );
};

// ========================================
// TRACK ORDER PAGE
// VEGIST / INDEX17 STYLE
// ========================================

const TrackOrderPage = () => {
  const {
    orderNumber:
      routeOrderNumber,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    formatPrice,
    settings,
  } = useSite();

  // ======================================
  // STATE
  // ======================================

  const [
    orderNumberInput,
    setOrderNumberInput,
  ] = useState(
    routeOrderNumber || ""
  );

  const [
    order,
    setOrder,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    hasSearched,
    setHasSearched,
  ] = useState(
    Boolean(routeOrderNumber)
  );

  // ======================================
  // LOAD ORDER
  // ======================================

  useEffect(() => {
    let cancelled = false;

    const loadOrder =
      async () => {
        if (
          !routeOrderNumber
        ) {
          setOrder(null);
          setError("");
          setHasSearched(
            false
          );

          return;
        }

        try {
          setLoading(true);
          setError("");
          setHasSearched(
            true
          );

          const response =
            await trackOrder(
              routeOrderNumber
            );

          if (cancelled) {
            return;
          }

          if (
            response?.success &&
            response?.order
          ) {
            setOrder(
              response.order
            );

            return;
          }

          setOrder(null);

          setError(
            response?.message ||
              "Order not found."
          );
        } catch (err) {
          if (cancelled) {
            return;
          }

          console.error(
            "Track Order Error:",
            err
          );

          setOrder(null);

          setError(
            err.response?.data
              ?.message ||
              "Order not found. Please check your order number."
          );
        } finally {
          if (!cancelled) {
            setLoading(false);
          }
        }
      };

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [routeOrderNumber]);

  // ======================================
  // SYNC INPUT
  // ======================================

  useEffect(() => {
    if (
      routeOrderNumber
    ) {
      setOrderNumberInput(
        routeOrderNumber
      );
    }
  }, [routeOrderNumber]);

  // ======================================
  // SEARCH
  // ======================================

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    const value =
      orderNumberInput.trim();

    if (!value) {
      setOrder(null);

      setError(
        "Please enter your order number."
      );

      setHasSearched(
        true
      );

      return;
    }

    navigate(
      `/track-order/${encodeURIComponent(
        value
      )}`
    );
  };

  // ======================================
  // STATUS
  // ======================================

  const currentStatus =
    order?.orderStatus ||
    "pending";

  const statusIndex =
    ORDER_STEPS.findIndex(
      (step) =>
        step.key ===
        currentStatus
    );

  const currentStepIndex =
    statusIndex < 0
      ? 0
      : statusIndex;

  const isCancelled =
    currentStatus ===
    "cancelled";

  // ======================================
  // CUSTOMER
  // ======================================

  const customerName = [
    order?.customer
      ?.firstName,

    order?.customer
      ?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  // ======================================
  // ADDRESS
  // ======================================

  const shippingAddress =
    order?.shippingAddress
      ? [
          order
            .shippingAddress
            .address,

          order
            .shippingAddress
            .area,

          order
            .shippingAddress
            .city,

          order
            .shippingAddress
            .province,

          order
            .shippingAddress
            .country,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

  // ======================================
  // PAGE
  // ======================================

  return (
    <div className="bg-white">
      {/* =================================
          PAGE TITLE
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
            py-11
            text-center
            sm:px-5
          "
        >
          <h1
            className="
              text-[34px]
              font-black
              text-[#222]
              sm:text-[38px]
            "
          >
            Track order
          </h1>

          <div
            className="
              mt-3
              flex
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
                transition
                hover:text-[var(--primary-color)]
              "
            >
              Home
            </Link>

            <span>/</span>

            <span
              className="
                text-[#333]
              "
            >
              Track order
            </span>
          </div>
        </div>
      </section>

      {/* =================================
          SEARCH SECTION
      ================================= */}

      <section
        className="
          py-[60px]
        "
      >
        <div
          className="
            mx-auto
            max-w-[900px]
            px-4
            sm:px-5
          "
        >
          <div
            className="
              border
              border-[#eeeeee]
              bg-white
              p-5
              sm:p-7
            "
          >
            <div
              className="
                flex
                items-center
                gap-3
              "
            >
              <div
                className="
                  flex
                  h-11
                  w-11
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f4f7ef]
                  text-[var(--primary-color)]
                "
              >
                <Package
                  size={19}
                />
              </div>

              <div>
                <h2
                  className="
                    text-[19px]
                    font-black
                    text-[#222]
                  "
                >
                  Find your order
                </h2>

                <p
                  className="
                    mt-1
                    text-[11px]
                    text-[#777]
                  "
                >
                  Enter the order
                  number received
                  after checkout.
                </p>
              </div>
            </div>

            {/* SEARCH FORM */}

            <form
              onSubmit={
                handleSubmit
              }
              className="
                mt-6
                flex
                flex-col
                gap-3
                sm:flex-row
              "
            >
              <input
                type="text"
                value={
                  orderNumberInput
                }
                onChange={(
                  event
                ) => {
                  setOrderNumberInput(
                    event.target
                      .value
                  );

                  if (error) {
                    setError("");
                  }
                }}
                placeholder="Enter order number"
                className="
                  h-[50px]
                  min-w-0
                  flex-1
                  rounded-[27px]
                  border
                  border-[#dddddd]
                  bg-white
                  px-5
                  text-[13px]
                  uppercase
                  text-[#555]
                  outline-none
                  placeholder:normal-case
                  focus:border-[var(--primary-color)]
                "
              />

              <button
                type="submit"
                disabled={loading}
                className="
                  flex
                  h-[50px]
                  items-center
                  justify-center
                  gap-3
                  rounded-[27px]
                  bg-[#282828]
                  px-8
                  text-[12px]
                  font-bold
                  uppercase
                  text-white
                  transition
                  hover:bg-[var(--primary-color)]
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {loading ? (
                  <>
                    <span
                      className="
                        h-4
                        w-4
                        animate-spin
                        rounded-full
                        border-2
                        border-white/30
                        border-t-white
                      "
                    />

                    Checking...
                  </>
                ) : (
                  <>
                    <Search
                      size={15}
                    />

                    Track order
                  </>
                )}
              </button>
            </form>

            {/* ERROR */}

            {error && (
              <div
                className="
                  mt-5
                  flex
                  items-start
                  gap-3
                  border
                  border-red-100
                  bg-red-50
                  p-4
                  text-[12px]
                  leading-6
                  text-red-600
                "
              >
                <XCircle
                  size={18}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                <span>
                  {error}
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* =================================
          ORDER FOUND
      ================================= */}

      {order &&
        !loading && (
          <section
            className="
              pb-[70px]
            "
          >
            <div
              className="
                mx-auto
                max-w-[1000px]
                px-4
                sm:px-5
              "
            >
              {/* =============================
                  ORDER TOP
              ============================= */}

              <div
                className="
                  border
                  border-[#eeeeee]
                  bg-white
                  p-5
                  sm:p-7
                "
              >
                <div
                  className="
                    flex
                    flex-col
                    gap-5
                    sm:flex-row
                    sm:items-start
                    sm:justify-between
                  "
                >
                  <div>
                    <div
                      className="
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.12em]
                        text-[#999]
                      "
                    >
                      Order number
                    </div>

                    <h2
                      className="
                        mt-1
                        text-[20px]
                        font-black
                        text-[#222]
                      "
                    >
                      {
                        order.orderNumber
                      }
                    </h2>

                    <p
                      className="
                        mt-2
                        text-[11px]
                        text-[#777]
                      "
                    >
                      Placed on{" "}
                      {formatDate(
                        order.createdAt
                      )}
                    </p>

                    {customerName && (
                      <p
                        className="
                          mt-2
                          text-[11px]
                          text-[#777]
                        "
                      >
                        Order for{" "}
                        <strong
                          className="
                            text-[#333]
                          "
                        >
                          {
                            customerName
                          }
                        </strong>
                      </p>
                    )}
                  </div>

                  {/* STATUS BADGE */}

                  <div
                    className={`
                      inline-flex
                      w-fit
                      rounded-full
                      px-5
                      py-2.5
                      text-[10px]
                      font-bold
                      uppercase
                      tracking-[0.08em]
                      ${
                        isCancelled
                          ? "bg-red-50 text-red-600"
                          : currentStatus ===
                              "delivered"
                            ? "bg-[#f4f7ef] text-[var(--primary-color)]"
                            : "bg-[#faf7f3] text-[#555]"
                      }
                    `}
                  >
                    {getStatusLabel(
                      currentStatus
                    )}
                  </div>
                </div>
              </div>

              {/* =================================
                  STATUS TRACKER
              ================================= */}

              <div
                className="
                  mt-7
                  border
                  border-[#eeeeee]
                  bg-white
                  p-5
                  sm:p-7
                "
              >
                <h3
                  className="
                    text-[20px]
                    font-black
                    text-[#222]
                  "
                >
                  Order status
                </h3>

                <div
                  className="
                    mt-3
                    h-[2px]
                    w-12
                    bg-[var(--primary-color)]
                  "
                />

                {/* CANCELLED */}

                {isCancelled ? (
                  <div
                    className="
                      mt-7
                      flex
                      gap-4
                      bg-red-50
                      p-5
                    "
                  >
                    <div
                      className="
                        flex
                        h-11
                        w-11
                        shrink-0
                        items-center
                        justify-center
                        rounded-full
                        bg-red-100
                        text-red-600
                      "
                    >
                      <XCircle
                        size={21}
                      />
                    </div>

                    <div>
                      <h4
                        className="
                          text-[14px]
                          font-black
                          text-red-700
                        "
                      >
                        Order cancelled
                      </h4>

                      <p
                        className="
                          mt-2
                          text-[11px]
                          leading-6
                          text-red-600
                        "
                      >
                        This order has
                        been cancelled.
                        Please contact
                        the store if you
                        need assistance.
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* =========================
                        DESKTOP TRACKER
                    ========================= */}

                    <div
                      className="
                        mt-9
                        hidden
                        grid-cols-5
                        md:grid
                      "
                    >
                      {ORDER_STEPS.map(
                        (
                          step,
                          index
                        ) => {
                          const complete =
                            index <=
                            currentStepIndex;

                          const active =
                            index ===
                            currentStepIndex;

                          return (
                            <div
                              key={
                                step.key
                              }
                              className="
                                relative
                                text-center
                              "
                            >
                              {/* LINE */}

                              {index !==
                                ORDER_STEPS.length -
                                  1 && (
                                <div
                                  className={`
                                    absolute
                                    left-1/2
                                    top-[20px]
                                    h-[2px]
                                    w-full
                                    ${
                                      index <
                                      currentStepIndex
                                        ? "bg-[var(--primary-color)]"
                                        : "bg-[#dddddd]"
                                    }
                                  `}
                                />
                              )}

                              {/* CIRCLE */}

                              <div
                                className={`
                                  relative
                                  z-10
                                  mx-auto
                                  flex
                                  h-10
                                  w-10
                                  items-center
                                  justify-center
                                  rounded-full
                                  border-2
                                  ${
                                    complete
                                      ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                                      : "border-[#dddddd] bg-white text-[#bbb]"
                                  }
                                `}
                              >
                                {complete ? (
                                  <Check
                                    size={17}
                                  />
                                ) : (
                                  <span
                                    className="
                                      h-2
                                      w-2
                                      rounded-full
                                      bg-current
                                    "
                                  />
                                )}
                              </div>

                              {/* LABEL */}

                              <div
                                className={`
                                  mt-3
                                  text-[11px]
                                  font-bold
                                  ${
                                    active ||
                                    complete
                                      ? "text-[#333]"
                                      : "text-[#aaa]"
                                  }
                                `}
                              >
                                {
                                  step.label
                                }
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>

                    {/* =========================
                        MOBILE TRACKER
                    ========================= */}

                    <div
                      className="
                        mt-7
                        md:hidden
                      "
                    >
                      {ORDER_STEPS.map(
                        (
                          step,
                          index
                        ) => {
                          const complete =
                            index <=
                            currentStepIndex;

                          return (
                            <div
                              key={
                                step.key
                              }
                              className="
                                relative
                                flex
                                gap-4
                                pb-7
                                last:pb-0
                              "
                            >
                              {index !==
                                ORDER_STEPS.length -
                                  1 && (
                                <div
                                  className={`
                                    absolute
                                    left-[19px]
                                    top-10
                                    h-[calc(100%-20px)]
                                    w-[2px]
                                    ${
                                      index <
                                      currentStepIndex
                                        ? "bg-[var(--primary-color)]"
                                        : "bg-[#dddddd]"
                                    }
                                  `}
                                />
                              )}

                              <div
                                className={`
                                  relative
                                  z-10
                                  flex
                                  h-10
                                  w-10
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  border-2
                                  ${
                                    complete
                                      ? "border-[var(--primary-color)] bg-[var(--primary-color)] text-white"
                                      : "border-[#dddddd] bg-white text-[#bbb]"
                                  }
                                `}
                              >
                                {complete ? (
                                  <Check
                                    size={16}
                                  />
                                ) : (
                                  <span
                                    className="
                                      h-2
                                      w-2
                                      rounded-full
                                      bg-current
                                    "
                                  />
                                )}
                              </div>

                              <div
                                className="
                                  pt-2.5
                                "
                              >
                                <div
                                  className={`
                                    text-[12px]
                                    font-bold
                                    ${
                                      complete
                                        ? "text-[#333]"
                                        : "text-[#aaa]"
                                    }
                                  `}
                                >
                                  {
                                    step.label
                                  }
                                </div>
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* =================================
                  ITEMS + SUMMARY
              ================================= */}

              <div
                className="
                  mt-7
                  grid
                  grid-cols-1
                  gap-7
                  lg:grid-cols-[1fr_330px]
                "
              >
                {/* =============================
                    ORDER ITEMS
                ============================= */}

                <div
                  className="
                    border
                    border-[#eeeeee]
                    bg-white
                    p-5
                    sm:p-7
                  "
                >
                  <h3
                    className="
                      text-[20px]
                      font-black
                      text-[#222]
                    "
                  >
                    Order items
                  </h3>

                  <div
                    className="
                      mt-3
                      h-[2px]
                      w-12
                      bg-[var(--primary-color)]
                    "
                  />

                  {Array.isArray(
                    order.items
                  ) &&
                  order.items.length >
                    0 ? (
                    <div
                      className="
                        mt-6
                        divide-y
                        divide-[#eeeeee]
                      "
                    >
                      {order.items.map(
                        (
                          item,
                          index
                        ) => {
                          const itemImage =
                            normalizeImage(
                              item.image ||
                                item
                                  .product
                                  ?.mainImage
                            );

                          const lineTotal =
                            item.subtotal !==
                              undefined &&
                            item.subtotal !==
                              null
                              ? Number(
                                  item.subtotal
                                )
                              : Number(
                                  item.price ||
                                    0
                                ) *
                                Number(
                                  item.quantity ||
                                    1
                                );

                          return (
                            <div
                              key={
                                item._id ||
                                `${item.product?._id || item.product || "product"}-${index}`
                              }
                              className="
                                flex
                                items-center
                                gap-4
                                py-5
                                first:pt-0
                                last:pb-0
                              "
                            >
                              {/* IMAGE */}

                              <div
                                className="
                                  flex
                                  h-[72px]
                                  w-[72px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  overflow-hidden
                                  rounded-[14px]
                                  bg-[#f7f7f7]
                                "
                              >
                                {itemImage ? (
                                  <img
                                    src={getImageUrl(
                                      itemImage
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
                                  <Package
                                    size={26}
                                    className="
                                      text-gray-300
                                    "
                                  />
                                )}
                              </div>

                              {/* INFO */}

                              <div
                                className="
                                  min-w-0
                                  flex-1
                                "
                              >
                                <div
                                  className="
                                    text-[13px]
                                    font-bold
                                    leading-6
                                    text-[#222]
                                  "
                                >
                                  {
                                    item.name
                                  }
                                </div>

                                {item.variantName && (
                                  <div
                                    className="
                                      mt-1
                                      text-[10px]
                                      text-[#999]
                                    "
                                  >
                                    {
                                      item.variantName
                                    }
                                  </div>
                                )}

                                <div
                                  className="
                                    mt-1
                                    text-[11px]
                                    text-[#777]
                                  "
                                >
                                  Qty:{" "}
                                  <strong
                                    className="
                                      text-[#444]
                                    "
                                  >
                                    {item.quantity ||
                                      1}
                                  </strong>
                                </div>
                              </div>

                              {/* PRICE */}

                              <div
                                className="
                                  shrink-0
                                  text-[13px]
                                  font-black
                                  text-[#222]
                                "
                              >
                                {formatPrice(
                                  lineTotal
                                )}
                              </div>
                            </div>
                          );
                        }
                      )}
                    </div>
                  ) : (
                    <p
                      className="
                        mt-6
                        text-[12px]
                        text-[#777]
                      "
                    >
                      Order items are
                      unavailable.
                    </p>
                  )}
                </div>

                {/* =============================
                    SUMMARY
                ============================= */}

                <aside
                  className="
                    self-start
                    rounded-[18px]
                    bg-[#faf7f3]
                    p-6
                  "
                >
                  <h3
                    className="
                      text-[20px]
                      font-black
                      text-[#222]
                    "
                  >
                    Order summary
                  </h3>

                  <div
                    className="
                      mt-3
                      h-[2px]
                      w-12
                      bg-[var(--primary-color)]
                    "
                  />

                  <div
                    className="
                      mt-6
                      space-y-4
                      text-[13px]
                    "
                  >
                    {/* SUBTOTAL */}

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                      "
                    >
                      <span
                        className="
                          text-[#777]
                        "
                      >
                        Subtotal
                      </span>

                      <strong
                        className="
                          text-[#333]
                        "
                      >
                        {formatPrice(
                          order.subtotal
                        )}
                      </strong>
                    </div>

                    {/* DELIVERY */}

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                      "
                    >
                      <span
                        className="
                          text-[#777]
                        "
                      >
                        Delivery
                      </span>

                      <strong
                        className={
                          Number(
                            order.deliveryFee
                          ) === 0
                            ? "text-[var(--primary-color)]"
                            : "text-[#333]"
                        }
                      >
                        {Number(
                          order.deliveryFee
                        ) === 0
                          ? "Free"
                          : formatPrice(
                              order.deliveryFee
                            )}
                      </strong>
                    </div>

                    {/* DISCOUNT */}

                    {Number(
                      order.discount
                    ) > 0 && (
                      <div
                        className="
                          flex
                          justify-between
                          gap-4
                        "
                      >
                        <span
                          className="
                            text-[#777]
                          "
                        >
                          Discount
                        </span>

                        <strong
                          className="
                            text-[var(--primary-color)]
                          "
                        >
                          -
                          {formatPrice(
                            order.discount
                          )}
                        </strong>
                      </div>
                    )}

                    {/* TOTAL */}

                    <div
                      className="
                        border-t
                        border-[#e5e2df]
                        pt-4
                      "
                    >
                      <div
                        className="
                          flex
                          items-end
                          justify-between
                          gap-4
                        "
                      >
                        <span
                          className="
                            text-[16px]
                            font-black
                            text-[#222]
                          "
                        >
                          Total
                        </span>

                        <span
                          className="
                            text-[23px]
                            font-black
                            text-[var(--primary-color)]
                          "
                        >
                          {formatPrice(
                            order.totalAmount
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* DELIVERY INFO */}

                  <div
                    className="
                      mt-6
                      rounded-[12px]
                      bg-white
                      p-4
                    "
                  >
                    <div
                      className="
                        flex
                        gap-3
                      "
                    >
                      <Truck
                        size={17}
                        className="
                          mt-0.5
                          shrink-0
                          text-[var(--primary-color)]
                        "
                      />

                      <div>
                        <div
                          className="
                            text-[11px]
                            font-bold
                            text-[#333]
                          "
                        >
                          Delivery
                          information
                        </div>

                        <p
                          className="
                            mt-1
                            text-[10px]
                            leading-5
                            text-[#777]
                          "
                        >
                          {settings.estimatedDeliveryText ||
                            "Delivery information will appear here."}
                        </p>
                      </div>
                    </div>
                  </div>
                </aside>
              </div>

              {/* =================================
                  PAYMENT / DELIVERY
              ================================= */}

              <div
                className="
                  mt-7
                  grid
                  grid-cols-1
                  gap-5
                  md:grid-cols-2
                "
              >
                {/* PAYMENT */}

                <div
                  className="
                    border
                    border-[#eeeeee]
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-[#f4f7ef]
                      text-[var(--primary-color)]
                    "
                  >
                    <CreditCard
                      size={18}
                    />
                  </div>

                  <h4
                    className="
                      mt-4
                      text-[15px]
                      font-black
                      text-[#222]
                    "
                  >
                    Payment
                  </h4>

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
                        gap-4
                      "
                    >
                      <span
                        className="
                          text-[#777]
                        "
                      >
                        Method
                      </span>

                      <strong
                        className="
                          text-right
                          text-[#333]
                        "
                      >
                        {getPaymentLabel(
                          order.paymentMethod
                        )}
                      </strong>
                    </div>

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                      "
                    >
                      <span
                        className="
                          text-[#777]
                        "
                      >
                        Status
                      </span>

                      <strong
                        className="
                          capitalize
                          text-[#333]
                        "
                      >
                        {order.paymentStatus ||
                          "Pending"}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* DELIVERY */}

                <div
                  className="
                    border
                    border-[#eeeeee]
                    p-5
                  "
                >
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-full
                      bg-[#f4f7ef]
                      text-[var(--primary-color)]
                    "
                  >
                    <Truck
                      size={18}
                    />
                  </div>

                  <h4
                    className="
                      mt-4
                      text-[15px]
                      font-black
                      text-[#222]
                    "
                  >
                    Delivery
                  </h4>

                  <div
                    className="
                      mt-4
                      space-y-3
                      text-[12px]
                    "
                  >
                    {order.courierName && (
                      <div
                        className="
                          flex
                          justify-between
                          gap-4
                        "
                      >
                        <span
                          className="
                            text-[#777]
                          "
                        >
                          Courier
                        </span>

                        <strong
                          className="
                            text-right
                            text-[#333]
                          "
                        >
                          {
                            order.courierName
                          }
                        </strong>
                      </div>
                    )}

                    {order.trackingNumber && (
                      <div
                        className="
                          flex
                          justify-between
                          gap-4
                        "
                      >
                        <span
                          className="
                            text-[#777]
                          "
                        >
                          Tracking
                        </span>

                        <strong
                          className="
                            break-all
                            text-right
                            text-[#333]
                          "
                        >
                          {
                            order.trackingNumber
                          }
                        </strong>
                      </div>
                    )}

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                      "
                    >
                      <span
                        className="
                          text-[#777]
                        "
                      >
                        Shipped
                      </span>

                      <strong
                        className="
                          text-right
                          text-[#333]
                        "
                      >
                        {formatDate(
                          order.shippedAt
                        )}
                      </strong>
                    </div>

                    <div
                      className="
                        flex
                        justify-between
                        gap-4
                      "
                    >
                      <span
                        className="
                          text-[#777]
                        "
                      >
                        Delivered
                      </span>

                      <strong
                        className="
                          text-right
                          text-[#333]
                        "
                      >
                        {formatDate(
                          order.deliveredAt
                        )}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* =================================
                  ADDRESS
              ================================= */}

              {shippingAddress && (
                <div
                  className="
                    mt-7
                    border
                    border-[#eeeeee]
                    p-5
                  "
                >
                  <MapPin
                    size={19}
                    className="
                      text-[var(--primary-color)]
                    "
                  />

                  <h4
                    className="
                      mt-4
                      text-[15px]
                      font-black
                      text-[#222]
                    "
                  >
                    Delivery address
                  </h4>

                  <p
                    className="
                      mt-3
                      text-[11px]
                      leading-6
                      text-[#777]
                    "
                  >
                    {shippingAddress}
                  </p>

                  {order
                    .shippingAddress
                    ?.landmark && (
                    <p
                      className="
                        mt-2
                        text-[10px]
                        text-[#999]
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
                </div>
              )}

              {/* =================================
                  HELP
              ================================= */}

              <div
                className="
                  mt-7
                  flex
                  gap-4
                  rounded-[14px]
                  bg-[#f4f7ef]
                  p-5
                "
              >
                <Clock3
                  size={19}
                  className="
                    mt-0.5
                    shrink-0
                    text-[var(--primary-color)]
                  "
                />

                <div>
                  <div
                    className="
                      text-[12px]
                      font-black
                      text-[#333]
                    "
                  >
                    Need help with
                    your order?
                  </div>

                  <p
                    className="
                      mt-1
                      text-[11px]
                      leading-6
                      text-[#777]
                    "
                  >
                    {settings.estimatedDeliveryText ||
                      "Delivery information will appear here."}
                  </p>

                  <Link
                    to="/contact"
                    className="
                      mt-2
                      inline-flex
                      text-[11px]
                      font-bold
                      uppercase
                      text-[var(--primary-color)]
                    "
                  >
                    Contact us
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

      {/* =================================
          INITIAL STATE
      ================================= */}

      {!order &&
        !loading &&
        !error &&
        !hasSearched && (
          <section
            className="
              pb-[70px]
            "
          >
            <div
              className="
                mx-auto
                max-w-[900px]
                px-4
                sm:px-5
              "
            >
              <div
                className="
                  border
                  border-[#eeeeee]
                  px-6
                  py-12
                  text-center
                "
              >
                <div
                  className="
                    mx-auto
                    flex
                    h-[80px]
                    w-[80px]
                    items-center
                    justify-center
                    rounded-full
                    bg-[#f4f7ef]
                    text-[var(--primary-color)]
                  "
                >
                  <ShoppingBag
                    size={34}
                  />
                </div>

                <h2
                  className="
                    mt-5
                    text-[22px]
                    font-black
                    text-[#222]
                  "
                >
                  Find your order
                </h2>

                <p
                  className="
                    mx-auto
                    mt-2
                    max-w-[450px]
                    text-[12px]
                    leading-6
                    text-[#777]
                  "
                >
                  Enter your order
                  number above to see
                  the current order
                  status, payment and
                  delivery information.
                </p>
              </div>
            </div>
          </section>
        )}
    </div>
  );
};

export default TrackOrderPage;