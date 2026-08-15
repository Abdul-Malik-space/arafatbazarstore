import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CreditCard,
  LoaderCircle,
  Mail,
  MapPin,
  Package,
  Phone,
  Printer,
  ReceiptText,
  Truck,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  useSite,
} from "../../context/SiteContext";

import {
  getAdminOrder,
} from "../../services/adminOrders";

import {
  getImageUrl,
} from "../../services/api";

// ========================================
// HELPERS
// ========================================

const formatPKR = (value) => {
  const amount = Number(value || 0);

  return `PKR ${amount.toLocaleString(
    "en-PK",
    {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }
  )}`;
};

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

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

const formatStatus = (status) => {
  if (!status) {
    return "—";
  }

  if (status === "shipped") {
    return "Dispatched";
  }

  return (
    status.charAt(0).toUpperCase() +
    status.slice(1)
  );
};

const getPaymentMethodLabel = (
  method
) => {
  switch (method) {
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
      return method
        ? method
            .replace(/[-_]/g, " ")
            .replace(
              /\b\w/g,
              (letter) =>
                letter.toUpperCase()
            )
        : "—";
  }
};

const normalizeImage = (image) => {
  if (!image) {
    return "";
  }

  if (
    typeof image === "string"
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

const getCustomerName = (order) => {
  return [
    order?.customer?.firstName,
    order?.customer?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Customer";
};

const getShippingAddress = (order) => {
  const address =
    order?.shippingAddress;

  if (!address) {
    return "—";
  }

  return [
    address.address,
    address.area,
    address.city,
    address.province,
    address.postalCode,
    address.country,
  ]
    .filter(Boolean)
    .join(", ");
};

const buildInvoiceNumber = (
  order
) => {
  if (order?.invoiceNumber) {
    return order.invoiceNumber;
  }

  const source = String(
    order?.orderNumber ||
      order?._id ||
      ""
  );

  const cleaned = source
    .replace(/^ord[-_\s]?/i, "")
    .replace(/\s+/g, "");

  return `INV-${cleaned || "ORDER"}`;
};

const getStoreIdentity = (
  settings
) => {
  const name =
    settings?.storeName ||
    settings?.siteName ||
    settings?.businessName ||
    settings?.name ||
    "General Store";

  const phone =
    settings?.contactPhone ||
    settings?.storePhone ||
    settings?.phone ||
    settings?.whatsapp ||
    "";

  const email =
    settings?.contactEmail ||
    settings?.storeEmail ||
    settings?.email ||
    "";

  const address =
    settings?.storeAddress ||
    settings?.contactAddress ||
    settings?.address ||
    [
      settings?.addressLine1,
      settings?.addressLine2,
      settings?.city,
      settings?.province,
      settings?.country,
    ]
      .filter(Boolean)
      .join(", ");

  const logo =
    normalizeImage(
      settings?.logo ||
        settings?.storeLogo ||
        settings?.siteLogo ||
        settings?.headerLogo
    );

  return {
    name,
    phone,
    email,
    address,
    logo,
  };
};

// ========================================
// SMALL INFO ROW
// ========================================

const InfoRow = ({
  label,
  value,
}) => {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-5
        border-b
        border-slate-100
        py-2.5
        last:border-b-0
      "
    >
      <span
        className="
          text-[11px]
          font-medium
          text-slate-500
        "
      >
        {label}
      </span>

      <strong
        className="
          max-w-[62%]
          text-right
          text-[11px]
          font-bold
          text-slate-900
        "
      >
        {value || "—"}
      </strong>
    </div>
  );
};

// ========================================
// ADMIN ORDER INVOICE PAGE
// ========================================

const AdminOrderInvoicePage =
  () => {
    const {
      id,
    } = useParams();

    const {
      settings,
    } = useSite();

    const [order, setOrder] =
      useState(null);

    const [loading, setLoading] =
      useState(true);

    const [error, setError] =
      useState("");

    useEffect(() => {
      let active = true;

      const loadOrder =
        async () => {
          try {
            setLoading(true);
            setError("");

            const data =
              await getAdminOrder(
                id
              );

            if (active) {
              setOrder(
                data?.order ||
                  null
              );
            }
          } catch (requestError) {
            if (active) {
              setError(
                requestError
                  ?.message ||
                  "Failed to load invoice."
              );
            }
          } finally {
            if (active) {
              setLoading(false);
            }
          }
        };

      loadOrder();

      return () => {
        active = false;
      };
    }, [id]);

    const store =
      useMemo(
        () =>
          getStoreIdentity(
            settings
          ),
        [settings]
      );

    const invoiceNumber =
      useMemo(
        () =>
          buildInvoiceNumber(
            order
          ),
        [order]
      );

    if (loading) {
      return (
        <div
          className="
            flex
            min-h-[60vh]
            items-center
            justify-center
          "
        >
          <div
            className="
              text-center
            "
          >
            <LoaderCircle
              size={30}
              className="
                mx-auto
                animate-spin
                text-[#6f9f2f]
              "
            />

            <p
              className="
                mt-3
                text-[12px]
                font-medium
                text-slate-500
              "
            >
              Loading invoice...
            </p>
          </div>
        </div>
      );
    }

    if (
      error ||
      !order
    ) {
      return (
        <div
          className="
            mx-auto
            max-w-[760px]
            px-5
            py-12
          "
        >
          <div
            className="
              rounded-2xl
              border
              border-red-200
              bg-red-50
              p-6
            "
          >
            <h1
              className="
                text-lg
                font-black
                text-red-800
              "
            >
              Invoice unavailable
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-red-700
              "
            >
              {error ||
                "Order could not be found."}
            </p>

            <Link
              to="/admin/orders"
              className="
                mt-5
                inline-flex
                items-center
                gap-2
                rounded-lg
                bg-slate-900
                px-4
                py-2.5
                text-xs
                font-bold
                text-white
              "
            >
              <ArrowLeft
                size={15}
              />
              Back to orders
            </Link>
          </div>
        </div>
      );
    }

    const discount =
      Number(
        order.discount || 0
      );

    return (
      <>
        {/* =====================================
            PRINT RULES
        ====================================== */}

        <style>
          {`
            @page {
              size: A4 portrait;
              margin: 10mm;
            }

            @media print {
              html,
              body {
                background: #ffffff !important;
              }

              body * {
                visibility: hidden !important;
              }

              .invoice-print-root,
              .invoice-print-root * {
                visibility: visible !important;
              }

              .invoice-print-root {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                max-width: none !important;
                margin: 0 !important;
                padding: 0 !important;
                box-shadow: none !important;
                border: 0 !important;
                background: #ffffff !important;
              }

              .no-print {
                display: none !important;
              }

              .invoice-avoid-break {
                break-inside: avoid;
                page-break-inside: avoid;
              }

              .invoice-items-table {
                font-size: 10px !important;
              }

              * {
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
            }
          `}
        </style>

        <div
          className="
            bg-slate-50
            px-4
            py-6
            sm:px-6
            sm:py-8
          "
        >
          {/* =================================
              SCREEN ACTIONS
          ================================= */}

          <div
            className="
              no-print
              mx-auto
              mb-5
              flex
              max-w-[980px]
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <Link
              to="/admin/orders"
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                self-start
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
              "
            >
              <ArrowLeft
                size={15}
              />
              Back to orders
            </Link>

            <button
              type="button"
              onClick={() =>
                window.print()
              }
              className="
                inline-flex
                min-h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-[#6f9f2f]
                px-5
                text-[12px]
                font-bold
                text-white
                shadow-sm
                transition
                hover:bg-[#628d29]
              "
            >
              <Printer
                size={16}
              />
              Print invoice
            </button>
          </div>

          {/* =================================
              INVOICE SHEET
          ================================= */}

          <main
            className="
              invoice-print-root
              mx-auto
              max-w-[980px]
              bg-white
              p-5
              shadow-sm
              sm:p-8
              lg:p-10
            "
          >
            {/* =============================
                HEADER
            ============================= */}

            <header
              className="
                invoice-avoid-break
                flex
                flex-col
                gap-6
                border-b
                border-slate-200
                pb-7
                sm:flex-row
                sm:items-start
                sm:justify-between
              "
            >
              <div
                className="
                  flex
                  min-w-0
                  items-start
                  gap-4
                "
              >
                {store.logo ? (
                  <div
                    className="
                      flex
                      h-[70px]
                      w-[70px]
                      shrink-0
                      items-center
                      justify-center
                      overflow-hidden
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                    "
                  >
                    <img
                      src={getImageUrl(
                        store.logo
                      )}
                      alt={
                        store.name
                      }
                      className="
                        h-full
                        w-full
                        object-contain
                        p-2
                      "
                    />
                  </div>
                ) : (
                  <div
                    className="
                      flex
                      h-[58px]
                      w-[58px]
                      shrink-0
                      items-center
                      justify-center
                      rounded-xl
                      bg-[#6f9f2f]
                      text-white
                    "
                  >
                    <ReceiptText
                      size={27}
                    />
                  </div>
                )}

                <div
                  className="
                    min-w-0
                  "
                >
                  <h1
                    className="
                      text-[22px]
                      font-black
                      leading-tight
                      text-slate-950
                    "
                  >
                    {store.name}
                  </h1>

                  <div
                    className="
                      mt-2
                      space-y-1
                      text-[10px]
                      leading-5
                      text-slate-500
                    "
                  >
                    {store.address && (
                      <div>
                        {
                          store.address
                        }
                      </div>
                    )}

                    {store.phone && (
                      <div>
                        Phone:{" "}
                        {
                          store.phone
                        }
                      </div>
                    )}

                    {store.email && (
                      <div>
                        Email:{" "}
                        {
                          store.email
                        }
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div
                className="
                  text-left
                  sm:text-right
                "
              >
                <div
                  className="
                    text-[30px]
                    font-black
                    tracking-[-0.03em]
                    text-slate-950
                  "
                >
                  INVOICE
                </div>

                <div
                  className="
                    mt-2
                    inline-flex
                    rounded-lg
                    bg-slate-100
                    px-3
                    py-1.5
                    text-[11px]
                    font-black
                    text-slate-900
                  "
                >
                  {invoiceNumber}
                </div>
              </div>
            </header>

            {/* =============================
                ORDER META
            ============================= */}

            <section
              className="
                invoice-avoid-break
                grid
                grid-cols-1
                gap-4
                border-b
                border-slate-200
                py-6
                sm:grid-cols-2
                lg:grid-cols-4
              "
            >
              <div>
                <div
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Order number
                </div>

                <div
                  className="
                    mt-1.5
                    text-[12px]
                    font-black
                    text-slate-900
                  "
                >
                  {order.orderNumber ||
                    order._id}
                </div>
              </div>

              <div>
                <div
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Order date
                </div>

                <div
                  className="
                    mt-1.5
                    text-[11px]
                    font-bold
                    text-slate-900
                  "
                >
                  {formatDate(
                    order.createdAt
                  )}
                </div>
              </div>

              <div>
                <div
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Payment
                </div>

                <div
                  className="
                    mt-1.5
                    text-[11px]
                    font-bold
                    text-slate-900
                  "
                >
                  {getPaymentMethodLabel(
                    order.paymentMethod
                  )}
                </div>
              </div>

              <div>
                <div
                  className="
                    text-[9px]
                    font-bold
                    uppercase
                    tracking-[0.14em]
                    text-slate-400
                  "
                >
                  Status
                </div>

                <div
                  className="
                    mt-1.5
                    text-[11px]
                    font-bold
                    text-slate-900
                  "
                >
                  {formatStatus(
                    order.orderStatus
                  )}
                </div>
              </div>
            </section>

            {/* =============================
                CUSTOMER + DELIVERY
            ============================= */}

            <section
              className="
                invoice-avoid-break
                grid
                grid-cols-1
                gap-7
                border-b
                border-slate-200
                py-7
                md:grid-cols-2
              "
            >
              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-slate-900
                  "
                >
                  <Package
                    size={15}
                    className="text-[#6f9f2f]"
                  />
                  Customer
                </div>

                <div
                  className="
                    mt-4
                    text-[15px]
                    font-black
                    text-slate-950
                  "
                >
                  {getCustomerName(
                    order
                  )}
                </div>

                <div
                  className="
                    mt-3
                    space-y-2
                    text-[11px]
                    text-slate-600
                  "
                >
                  {order.customer
                    ?.phone && (
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <Phone
                        size={13}
                      />
                      {
                        order.customer
                          .phone
                      }
                    </div>
                  )}

                  {order.customer
                    ?.alternatePhone && (
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >
                      <Phone
                        size={13}
                      />
                      {
                        order.customer
                          .alternatePhone
                      }
                    </div>
                  )}

                  {order.customer
                    ?.email && (
                    <div
                      className="
                        flex
                        items-center
                        gap-2
                        break-all
                      "
                    >
                      <Mail
                        size={13}
                      />
                      {
                        order.customer
                          .email
                      }
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div
                  className="
                    flex
                    items-center
                    gap-2
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-slate-900
                  "
                >
                  <MapPin
                    size={15}
                    className="text-[#6f9f2f]"
                  />
                  Delivery address
                </div>

                <p
                  className="
                    mt-4
                    max-w-[440px]
                    text-[11px]
                    leading-6
                    text-slate-600
                  "
                >
                  {getShippingAddress(
                    order
                  )}
                </p>

                {order.shippingAddress
                  ?.landmark && (
                  <p
                    className="
                      mt-2
                      text-[10px]
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
              </div>
            </section>

            {/* =============================
                ITEMS TABLE
            ============================= */}

            <section
              className="
                py-7
              "
            >
              <div
                className="
                  mb-4
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >
                <div>
                  <h2
                    className="
                      text-[15px]
                      font-black
                      text-slate-950
                    "
                  >
                    Order items
                  </h2>

                  <p
                    className="
                      mt-1
                      text-[10px]
                      text-slate-500
                    "
                  >
                    Product and pricing details
                  </p>
                </div>

                <div
                  className="
                    text-[10px]
                    font-bold
                    text-slate-500
                  "
                >
                  {(order.items ||
                    []).length}{" "}
                  item
                  {(order.items ||
                    []).length === 1
                    ? ""
                    : "s"}
                </div>
              </div>

              <div
                className="
                  overflow-x-auto
                  border
                  border-slate-200
                "
              >
                <table
                  className="
                    invoice-items-table
                    w-full
                    min-w-[650px]
                    border-collapse
                  "
                >
                  <thead
                    className="
                      bg-slate-50
                    "
                  >
                    <tr>
                      <th
                        className="
                          px-4
                          py-3
                          text-left
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.08em]
                          text-slate-500
                        "
                      >
                        Product
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-center
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.08em]
                          text-slate-500
                        "
                      >
                        Qty
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-right
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.08em]
                          text-slate-500
                        "
                      >
                        Unit price
                      </th>

                      <th
                        className="
                          px-4
                          py-3
                          text-right
                          text-[9px]
                          font-black
                          uppercase
                          tracking-[0.08em]
                          text-slate-500
                        "
                      >
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {(order.items ||
                      []).map(
                      (
                        item,
                        index
                      ) => {
                        const qty =
                          Number(
                            item.quantity ||
                              1
                          );

                        const unitPrice =
                          Number(
                            item.unitPrice ??
                              item.price ??
                              0
                          );

                        const lineTotal =
                          Number(
                            item.subtotal ??
                              unitPrice *
                                qty
                          );

                        return (
                          <tr
                            key={
                              item._id ||
                              `${item.name}-${index}`
                            }
                            className="
                              border-t
                              border-slate-100
                            "
                          >
                            <td
                              className="
                                px-4
                                py-4
                              "
                            >
                              <div
                                className="
                                  text-[11px]
                                  font-bold
                                  text-slate-900
                                "
                              >
                                {item.name ||
                                  item.product
                                    ?.name ||
                                  "Product"}
                              </div>

                              <div
                                className="
                                  mt-1
                                  text-[9px]
                                  text-slate-500
                                "
                              >
                                {[
                                  item.variantName,
                                  item.sku
                                    ? `SKU: ${item.sku}`
                                    : "",
                                ]
                                  .filter(
                                    Boolean
                                  )
                                  .join(
                                    " • "
                                  ) ||
                                  "—"}
                              </div>
                            </td>

                            <td
                              className="
                                px-4
                                py-4
                                text-center
                                text-[11px]
                                font-bold
                                text-slate-800
                              "
                            >
                              {qty}
                            </td>

                            <td
                              className="
                                px-4
                                py-4
                                text-right
                                text-[11px]
                                font-semibold
                                text-slate-700
                              "
                            >
                              {formatPKR(
                                unitPrice
                              )}
                            </td>

                            <td
                              className="
                                px-4
                                py-4
                                text-right
                                text-[11px]
                                font-black
                                text-slate-950
                              "
                            >
                              {formatPKR(
                                lineTotal
                              )}
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* =============================
                BOTTOM SECTION
            ============================= */}

            <section
              className="
                invoice-avoid-break
                grid
                grid-cols-1
                gap-7
                border-t
                border-slate-200
                pt-7
                md:grid-cols-[1fr_340px]
              "
            >
              <div>
                <div
                  className="
                    text-[11px]
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-slate-900
                  "
                >
                  Order information
                </div>

                <div
                  className="
                    mt-4
                    max-w-[420px]
                    rounded-xl
                    bg-slate-50
                    px-4
                    py-2
                  "
                >
                  <InfoRow
                    label="Payment status"
                    value={formatStatus(
                      order.paymentStatus
                    )}
                  />

                  <InfoRow
                    label="Order status"
                    value={formatStatus(
                      order.orderStatus
                    )}
                  />

                  {order.courierName && (
                    <InfoRow
                      label="Courier"
                      value={
                        order.courierName
                      }
                    />
                  )}

                  {order.trackingNumber && (
                    <InfoRow
                      label="Tracking"
                      value={
                        order.trackingNumber
                      }
                    />
                  )}
                </div>

                {order.customerNote && (
                  <div
                    className="
                      mt-5
                      max-w-[460px]
                    "
                  >
                    <div
                      className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-[0.08em]
                        text-slate-800
                      "
                    >
                      Customer note
                    </div>

                    <p
                      className="
                        mt-2
                        text-[10px]
                        leading-5
                        text-slate-500
                      "
                    >
                      {
                        order.customerNote
                      }
                    </p>
                  </div>
                )}
              </div>

              <div
                className="
                  rounded-xl
                  border
                  border-slate-200
                  p-5
                "
              >
                <InfoRow
                  label="Subtotal"
                  value={formatPKR(
                    order.subtotal
                  )}
                />

                <InfoRow
                  label="Delivery"
                  value={
                    Number(
                      order.deliveryFee ||
                        0
                    ) === 0
                      ? "PKR 0"
                      : formatPKR(
                          order.deliveryFee
                        )
                  }
                />

                {discount > 0 && (
                  <InfoRow
                    label="Discount"
                    value={`- ${formatPKR(
                      discount
                    )}`}
                  />
                )}

                <div
                  className="
                    mt-3
                    flex
                    items-end
                    justify-between
                    gap-4
                    border-t-2
                    border-slate-900
                    pt-4
                  "
                >
                  <span
                    className="
                      text-[12px]
                      font-black
                      uppercase
                      tracking-[0.06em]
                      text-slate-900
                    "
                  >
                    Grand total
                  </span>

                  <strong
                    className="
                      text-[20px]
                      font-black
                      text-slate-950
                    "
                  >
                    {formatPKR(
                      order.totalAmount
                    )}
                  </strong>
                </div>
              </div>
            </section>

            {/* =============================
                FOOTER
            ============================= */}

            <footer
              className="
                invoice-avoid-break
                mt-10
                border-t
                border-slate-200
                pt-5
                text-center
              "
            >
              <div
                className="
                  flex
                  flex-wrap
                  items-center
                  justify-center
                  gap-x-5
                  gap-y-2
                  text-[9px]
                  text-slate-500
                "
              >
                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >
                  <CalendarDays
                    size={11}
                  />
                  Invoice date:{" "}
                  {formatDate(
                    order.createdAt
                  )}
                </span>

                <span
                  className="
                    inline-flex
                    items-center
                    gap-1.5
                  "
                >
                  <CreditCard
                    size={11}
                  />
                  {
                    getPaymentMethodLabel(
                      order.paymentMethod
                    )
                  }
                </span>

                {order.orderStatus ===
                  "shipped" && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                    "
                  >
                    <Truck
                      size={11}
                    />
                    Dispatched
                  </span>
                )}

                {order.paymentStatus ===
                  "paid" && (
                  <span
                    className="
                      inline-flex
                      items-center
                      gap-1.5
                    "
                  >
                    <BadgeCheck
                      size={11}
                    />
                    Paid
                  </span>
                )}
              </div>

              <p
                className="
                  mt-4
                  text-[9px]
                  leading-5
                  text-slate-400
                "
              >
                Thank you for your order.
                Please keep this invoice
                for your records. This
                invoice was generated
                electronically.
              </p>
            </footer>
          </main>
        </div>
      </>
    );
  };

export default AdminOrderInvoicePage;
