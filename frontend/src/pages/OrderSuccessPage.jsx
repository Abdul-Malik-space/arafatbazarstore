import {
  Link,
  useLocation,
  useParams,
} from "react-router-dom";

import {
  ArrowRight,
  Check,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  useSite,
} from "../context/SiteContext";

import {
  getImageUrl,
} from "../services/api";

// ========================================
// HELPERS
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
// ORDER SUCCESS PAGE
// VEGIST / INDEX17 STYLE
// ========================================

const OrderSuccessPage = () => {
  const {
    orderNumber,
  } = useParams();

  const location =
    useLocation();

  const {
    formatPrice,
    settings,
  } = useSite();

  const order =
    location.state?.order ||
    null;

  // ======================================
  // CUSTOMER NAME
  // ======================================

  const customerName = [
    order?.customer?.firstName,
    order?.customer?.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  // ======================================
  // ADDRESS
  // ======================================

  const shippingAddress =
    order?.shippingAddress
      ? [
          order.shippingAddress
            .address,

          order.shippingAddress
            .area,

          order.shippingAddress
            .city,

          order.shippingAddress
            .province,

          order.shippingAddress
            .country,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

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
            Order confirmed
          </h1>

          <div
            className="
              mt-3
              flex
              flex-wrap
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
              Order confirmed
            </span>
          </div>
        </div>
      </section>

      {/* =================================
          SUCCESS CONTENT
      ================================= */}

      <section
        className="
          py-[65px]
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
          {/* =================================
              SUCCESS MESSAGE
          ================================= */}

          <div
            className="
              border
              border-[#eeeeee]
              bg-white
              px-5
              py-10
              text-center
              sm:px-10
              sm:py-12
            "
          >
            {/* ICON */}

            <div
              className="
                mx-auto
                flex
                h-[86px]
                w-[86px]
                items-center
                justify-center
                rounded-full
                bg-[#f4f7ef]
                text-[var(--primary-color)]
              "
            >
              <CheckCircle2
                size={42}
                strokeWidth={1.6}
              />
            </div>

            <div
              className="
                mt-6
                text-[12px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-[var(--primary-color)]
              "
            >
              Order successfully placed
            </div>

            <h2
              className="
                mt-3
                text-[30px]
                font-black
                leading-tight
                text-[#222]
                sm:text-[36px]
              "
            >
              Thank you
              {customerName
                ? `, ${customerName}`
                : ""}
              !
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-[620px]
                text-[13px]
                leading-7
                text-[#777]
              "
            >
              Your order has been
              received successfully.
              Keep your order number
              safe so you can track
              your delivery status.
            </p>

            {/* ORDER NUMBER */}

            <div
              className="
                mx-auto
                mt-7
                inline-flex
                flex-wrap
                items-center
                justify-center
                gap-3
                rounded-full
                bg-[#faf7f3]
                px-6
                py-3
              "
            >
              <span
                className="
                  text-[12px]
                  text-[#777]
                "
              >
                Order number
              </span>

              <span
                className="
                  text-[13px]
                  font-black
                  text-[var(--primary-color)]
                "
              >
                {orderNumber}
              </span>
            </div>
          </div>

          {/* =================================
              ORDER AVAILABLE
          ================================= */}

          {order ? (
            <>
              {/* =============================
                  ORDER INFO CARDS
              ============================= */}

              <div
                className="
                  mt-7
                  grid
                  grid-cols-1
                  gap-4
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >
                {/* ORDER STATUS */}

                <div
                  className="
                    border
                    border-[#eeeeee]
                    bg-white
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
                    <ShoppingBag
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      mt-4
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                      text-[#999]
                    "
                  >
                    Order status
                  </div>

                  <div
                    className="
                      mt-1
                      text-[13px]
                      font-black
                      text-[#222]
                    "
                  >
                    {getStatusLabel(
                      order.orderStatus
                    )}
                  </div>
                </div>

                {/* PAYMENT */}

                <div
                  className="
                    border
                    border-[#eeeeee]
                    bg-white
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

                  <div
                    className="
                      mt-4
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                      text-[#999]
                    "
                  >
                    Payment method
                  </div>

                  <div
                    className="
                      mt-1
                      text-[13px]
                      font-black
                      text-[#222]
                    "
                  >
                    {getPaymentLabel(
                      order.paymentMethod
                    )}
                  </div>
                </div>

                {/* PAYMENT STATUS */}

                <div
                  className="
                    border
                    border-[#eeeeee]
                    bg-white
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
                    <Check
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      mt-4
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                      text-[#999]
                    "
                  >
                    Payment status
                  </div>

                  <div
                    className="
                      mt-1
                      text-[13px]
                      font-black
                      capitalize
                      text-[#222]
                    "
                  >
                    {order.paymentStatus ||
                      "Pending"}
                  </div>
                </div>

                {/* TOTAL */}

                <div
                  className="
                    border
                    border-[#eeeeee]
                    bg-white
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
                    <Package
                      size={18}
                    />
                  </div>

                  <div
                    className="
                      mt-4
                      text-[10px]
                      font-semibold
                      uppercase
                      tracking-[0.08em]
                      text-[#999]
                    "
                  >
                    Order total
                  </div>

                  <div
                    className="
                      mt-1
                      text-[15px]
                      font-black
                      text-[var(--primary-color)]
                    "
                  >
                    {formatPrice(
                      order.totalAmount
                    )}
                  </div>
                </div>
              </div>

              {/* =================================
                  MAIN GRID
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
                    ORDER PRODUCTS
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
                          const image =
                            normalizeImage(
                              item.image ||
                                item.product
                                  ?.mainImage
                            );

                          const itemTotal =
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
                                `${item.product?._id || item.product || "item"}-${index}`
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
                                  h-[78px]
                                  w-[78px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  overflow-hidden
                                  rounded-[14px]
                                  bg-[#f7f7f7]
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
                                  <Package
                                    size={27}
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
                                  {item.name ||
                                    "Product"}
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
                                  Quantity:{" "}
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

                              {/* TOTAL */}

                              <div
                                className="
                                  shrink-0
                                  text-right
                                "
                              >
                                <div
                                  className="
                                    text-[13px]
                                    font-black
                                    text-[#222]
                                  "
                                >
                                  {formatPrice(
                                    itemTotal
                                  )}
                                </div>
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
                        text-[13px]
                        text-[#777]
                      "
                    >
                      Order item
                      information is
                      unavailable.
                    </p>
                  )}
                </div>

                {/* =============================
                    ORDER SUMMARY
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
                  CUSTOMER / DELIVERY DETAILS
              ================================= */}

              {(customerName ||
                shippingAddress) && (
                <div
                  className="
                    mt-7
                    grid
                    grid-cols-1
                    gap-5
                    sm:grid-cols-2
                  "
                >
                  {/* CUSTOMER */}

                  <div
                    className="
                      border
                      border-[#eeeeee]
                      p-5
                    "
                  >
                    <ShoppingBag
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
                      Customer
                      information
                    </h4>

                    {customerName && (
                      <div
                        className="
                          mt-3
                          text-[12px]
                          font-semibold
                          text-[#444]
                        "
                      >
                        {customerName}
                      </div>
                    )}

                    {order.customer
                      ?.phone && (
                      <div
                        className="
                          mt-2
                          text-[11px]
                          text-[#777]
                        "
                      >
                        {
                          order.customer
                            .phone
                        }
                      </div>
                    )}

                    {order.customer
                      ?.email && (
                      <div
                        className="
                          mt-1
                          break-all
                          text-[11px]
                          text-[#777]
                        "
                      >
                        {
                          order.customer
                            .email
                        }
                      </div>
                    )}
                  </div>

                  {/* ADDRESS */}

                  {shippingAddress && (
                    <div
                      className="
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
                        Delivery
                        address
                      </h4>

                      <p
                        className="
                          mt-3
                          text-[11px]
                          leading-6
                          text-[#777]
                        "
                      >
                        {
                          shippingAddress
                        }
                      </p>

                      {order.shippingAddress
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
                </div>
              )}
            </>
          ) : (
            /* =================================
               PAGE REFRESH FALLBACK
            ================================= */

            <div
              className="
                mt-7
                border
                border-[#eeeeee]
                bg-white
                px-5
                py-9
                text-center
              "
            >
              <Package
                size={33}
                className="
                  mx-auto
                  text-[var(--primary-color)]
                "
              />

              <h3
                className="
                  mt-4
                  text-[18px]
                  font-black
                  text-[#222]
                "
              >
                Your order has been
                received
              </h3>

              <p
                className="
                  mx-auto
                  mt-2
                  max-w-[520px]
                  text-[12px]
                  leading-6
                  text-[#777]
                "
              >
                Detailed order
                information is no
                longer available in
                this browser session,
                but you can still use
                your order number to
                track the order.
              </p>
            </div>
          )}

          {/* =================================
              ACTIONS
          ================================= */}

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
              to={`/track-order/${orderNumber}`}
              className="
                inline-flex
                min-h-[50px]
                min-w-[190px]
                items-center
                justify-center
                gap-3
                rounded-[27px]
                bg-[var(--primary-color)]
                px-7
                text-[12px]
                font-bold
                uppercase
                text-white
                transition
                hover:opacity-90
              "
            >
              <Truck
                size={16}
              />

              Track order
            </Link>

            <Link
              to="/shop"
              className="
                inline-flex
                min-h-[50px]
                min-w-[190px]
                items-center
                justify-center
                gap-3
                rounded-[27px]
                bg-[#282828]
                px-7
                text-[12px]
                font-bold
                uppercase
                text-white
                transition
                hover:bg-[var(--primary-color)]
              "
            >
              Continue shopping

              <ArrowRight
                size={15}
              />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OrderSuccessPage;