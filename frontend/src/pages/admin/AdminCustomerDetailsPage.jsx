import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  Ban,
  CalendarDays,
  Crown,
  Eye,
  FileText,
  LoaderCircle,
  Mail,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Save,
  ShieldCheck,
  ShoppingBag,
  Truck,
  WalletCards,
} from "lucide-react";

import {
  Link,
  useParams,
} from "react-router-dom";

import {
  getAdminCustomer,
  updateAdminCustomer,
} from "../../services/adminCustomers";

// ========================================
// HELPERS
// ========================================

const formatPKR = (value) =>
  `PKR ${Number(value || 0).toLocaleString(
    "en-PK",
    {
      maximumFractionDigits: 2,
    }
  )}`;

const formatDateTime = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const getName = (customer) =>
  [
    customer?.firstName,
    customer?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Customer";

const getAddress = (address) => {
  if (!address) return "—";

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

const getWhatsAppNumber = (phone) => {
  let digits = String(phone || "").replace(
    /\D/g,
    ""
  );

  if (digits.startsWith("0")) {
    digits = `92${digits.slice(1)}`;
  }

  if (
    digits.startsWith("3") &&
    digits.length === 10
  ) {
    digits = `92${digits}`;
  }

  return digits;
};

const getStatusLabel = (status) => {
  if (status === "shipped") {
    return "Dispatched";
  }

  return status
    ? `${status.charAt(0).toUpperCase()}${status.slice(1)}`
    : "—";
};

const ORDER_STATUS_STYLES = {
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

const OrderStatusBadge = ({ status }) => (
  <span
    className={`
      inline-flex
      rounded-full
      px-2.5
      py-1
      text-[9px]
      font-black
      uppercase
      ring-1
      ring-inset
      ${
        ORDER_STATUS_STYLES[status] ||
        "bg-slate-50 text-slate-600 ring-slate-200"
      }
    `}
  >
    {getStatusLabel(status)}
  </span>
);

const StatCard = ({
  label,
  value,
  icon: Icon,
}) => (
  <div
    className="
      rounded-[14px]
      border
      border-[#e8e8e8]
      bg-white
      p-4
    "
  >
    <Icon
      size={16}
      className="text-[var(--primary-color)]"
    />
    <div
      className="
        mt-3
        text-[18px]
        font-black
        text-[#222]
      "
    >
      {value}
    </div>
    <div
      className="
        mt-1
        text-[9px]
        font-black
        uppercase
        tracking-[0.06em]
        text-[#999]
      "
    >
      {label}
    </div>
  </div>
);

// ========================================
// PAGE
// ========================================

const AdminCustomerDetailsPage = () => {
  const { phoneKey } = useParams();

  const [data, setData] = useState(null);
  const [loading, setLoading] =
    useState(true);
  const [saving, setSaving] =
    useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] =
    useState("");

  const [form, setForm] = useState({
    status: "active",
    tags: "",
    internalNote: "",
    blockedReason: "",
  });

  const loadCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAdminCustomer(
        phoneKey
      );

      const customerData =
        response.customer || null;

      setData(customerData);

      setForm({
        status:
          customerData?.profile?.status ||
          "active",
        tags: (
          customerData?.profile?.tags || []
        ).join(", "),
        internalNote:
          customerData?.profile
            ?.internalNote || "",
        blockedReason:
          customerData?.profile
            ?.blockedReason || "",
      });
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Failed to load customer."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomer();
  }, [phoneKey]);

  const customer = data?.customer || {};
  const address = data?.shippingAddress;
  const stats = data?.stats || {};
  const orders = data?.orders || [];

  const whatsapp = useMemo(
    () => getWhatsAppNumber(customer.phone),
    [customer.phone]
  );

  const saveProfile = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const tags = form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      await updateAdminCustomer(phoneKey, {
        status: form.status,
        tags,
        internalNote: form.internalNote,
        blockedReason:
          form.status === "blocked"
            ? form.blockedReason
            : "",
      });

      setSuccess(
        "Customer profile saved successfully."
      );

      await loadCustomer();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Failed to save customer."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading && !data) {
    return (
      <div
        className="
          flex
          min-h-[55vh]
          items-center
          justify-center
        "
      >
        <div className="text-center">
          <LoaderCircle
            size={30}
            className="
              mx-auto
              animate-spin
              text-[var(--primary-color)]
            "
          />
          <div
            className="
              mt-3
              text-[11px]
              text-[#999]
            "
          >
            Loading customer...
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-4">
        <Link
          to="/admin/customers"
          className="
            inline-flex
            items-center
            gap-2
            text-[11px]
            font-bold
            text-[#666]
          "
        >
          <ArrowLeft size={14} />
          Back to customers
        </Link>

        <div
          className="
            rounded-[14px]
            border
            border-red-200
            bg-red-50
            p-5
            text-[11px]
            text-red-700
          "
        >
          {error || "Customer not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* =================================
          HEADER
      ================================= */}

      <section
        className="
          rounded-[18px]
          border
          border-[#e8e8e8]
          bg-white
          p-5
          sm:p-6
        "
      >
        <div
          className="
            flex
            flex-col
            gap-5
            lg:flex-row
            lg:items-start
            lg:justify-between
          "
        >
          <div>
            <Link
              to="/admin/customers"
              className="
                inline-flex
                items-center
                gap-1.5
                text-[10px]
                font-bold
                text-[#888]
                hover:text-[var(--primary-color)]
              "
            >
              <ArrowLeft size={13} />
              Customers
            </Link>

            <div
              className="
                mt-4
                flex
                items-center
                gap-4
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#f3f7ec]
                  text-[20px]
                  font-black
                  uppercase
                  text-[var(--primary-color)]
                "
              >
                {getName(customer)
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="min-w-0">
                <h1
                  className="
                    truncate
                    text-[24px]
                    font-black
                    tracking-[-0.03em]
                    text-[#222]
                  "
                >
                  {getName(customer)}
                </h1>

                <div
                  className="
                    mt-2
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  <span
                    className={`
                      inline-flex
                      rounded-full
                      px-2.5
                      py-1
                      text-[9px]
                      font-black
                      uppercase
                      ring-1
                      ring-inset
                      ${
                        form.status === "vip"
                          ? "bg-amber-50 text-amber-700 ring-amber-200"
                          : form.status === "blocked"
                          ? "bg-red-50 text-red-700 ring-red-200"
                          : "bg-emerald-50 text-emerald-700 ring-emerald-200"
                      }
                    `}
                  >
                    {form.status}
                  </span>

                  {stats.totalOrders >= 2 && (
                    <span
                      className="
                        inline-flex
                        rounded-full
                        bg-blue-50
                        px-2.5
                        py-1
                        text-[9px]
                        font-black
                        uppercase
                        text-blue-700
                        ring-1
                        ring-inset
                        ring-blue-200
                      "
                    >
                      Repeat customer
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {customer.phone && (
              <a
                href={`tel:${customer.phone}`}
                className="
                  inline-flex
                  min-h-10
                  items-center
                  gap-2
                  rounded-[10px]
                  border
                  border-[#e4e4e4]
                  px-4
                  text-[10px]
                  font-bold
                  text-[#555]
                "
              >
                <Phone size={14} />
                Call
              </a>
            )}

            {whatsapp && (
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="
                  inline-flex
                  min-h-10
                  items-center
                  gap-2
                  rounded-[10px]
                  border
                  border-emerald-200
                  bg-emerald-50
                  px-4
                  text-[10px]
                  font-bold
                  text-emerald-700
                "
              >
                <MessageCircle size={14} />
                WhatsApp
              </a>
            )}
          </div>
        </div>

        {form.status === "blocked" && (
          <div
            className="
              mt-5
              flex
              gap-3
              rounded-[12px]
              border
              border-red-200
              bg-red-50
              p-4
              text-[10px]
              leading-5
              text-red-700
            "
          >
            <Ban
              size={16}
              className="mt-0.5 shrink-0"
            />
            This customer is blocked. New website
            checkout attempts using this phone
            number will be rejected.
          </div>
        )}
      </section>

      {/* =================================
          STATS
      ================================= */}

      <section
        className="
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-4
        "
      >
        <StatCard
          label="Total Orders"
          value={stats.totalOrders || 0}
          icon={ShoppingBag}
        />
        <StatCard
          label="Delivered"
          value={stats.deliveredOrders || 0}
          icon={Truck}
        />
        <StatCard
          label="Delivered Value"
          value={formatPKR(stats.deliveredValue)}
          icon={WalletCards}
        />
        <StatCard
          label="Open Orders"
          value={stats.openOrders || 0}
          icon={Package}
        />
      </section>

      {/* =================================
          PROFILE + CRM
      ================================= */}

      <section
        className="
          grid
          grid-cols-1
          gap-5
          xl:grid-cols-[0.9fr_1.1fr]
        "
      >
        {/* CUSTOMER INFORMATION */}

        <div
          className="
            rounded-[16px]
            border
            border-[#e8e8e8]
            bg-white
            p-5
          "
        >
          <h2
            className="
              text-[14px]
              font-black
              text-[#222]
            "
          >
            Customer Information
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex gap-3">
              <Phone
                size={15}
                className="mt-0.5 shrink-0 text-[var(--primary-color)]"
              />
              <div>
                <div className="text-[9px] font-bold uppercase text-[#999]">
                  Phone
                </div>
                <div className="mt-1 text-[11px] font-bold text-[#333]">
                  {customer.phone || "—"}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Mail
                size={15}
                className="mt-0.5 shrink-0 text-[var(--primary-color)]"
              />
              <div className="min-w-0">
                <div className="text-[9px] font-bold uppercase text-[#999]">
                  Email
                </div>
                <div className="mt-1 break-all text-[11px] font-bold text-[#333]">
                  {customer.email || "No email provided"}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <MapPin
                size={15}
                className="mt-0.5 shrink-0 text-[var(--primary-color)]"
              />
              <div>
                <div className="text-[9px] font-bold uppercase text-[#999]">
                  Latest Delivery Address
                </div>
                <div className="mt-1 text-[11px] leading-5 text-[#555]">
                  {getAddress(address)}
                </div>
                {address?.landmark && (
                  <div className="mt-1 text-[9px] text-[#999]">
                    Landmark: {address.landmark}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 border-t border-[#eeeeee] pt-4">
              <div>
                <div className="text-[9px] uppercase text-[#999]">
                  First order
                </div>
                <div className="mt-1 text-[10px] font-bold text-[#444]">
                  {formatDateTime(stats.firstOrderAt)}
                </div>
              </div>
              <div>
                <div className="text-[9px] uppercase text-[#999]">
                  Last order
                </div>
                <div className="mt-1 text-[10px] font-bold text-[#444]">
                  {formatDateTime(stats.lastOrderAt)}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CRM MANAGEMENT */}

        <div
          className="
            rounded-[16px]
            border
            border-[#e8e8e8]
            bg-white
            p-5
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
              <h2 className="text-[14px] font-black text-[#222]">
                CRM Management
              </h2>
              <p className="mt-1 text-[9px] text-[#999]">
                Admin-only customer status, tags and notes.
              </p>
            </div>

            {form.status === "vip" ? (
              <Crown
                size={19}
                className="text-amber-500"
              />
            ) : form.status === "blocked" ? (
              <Ban
                size={19}
                className="text-red-500"
              />
            ) : (
              <ShieldCheck
                size={19}
                className="text-emerald-600"
              />
            )}
          </div>

          <div className="mt-5 space-y-4">
            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.06em] text-[#777]">
                Customer Status
              </label>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
                className="mt-2 min-h-11 w-full rounded-[10px] border border-[#e5e5e5] bg-white px-3 text-[11px] font-semibold text-[#444] outline-none"
              >
                <option value="active">Active</option>
                <option value="vip">VIP</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.06em] text-[#777]">
                Tags
              </label>
              <input
                value={form.tags}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    tags: event.target.value,
                  }))
                }
                placeholder="repeat buyer, wholesale, lahore"
                className="mt-2 min-h-11 w-full rounded-[10px] border border-[#e5e5e5] px-3 text-[11px] text-[#444] outline-none"
              />
              <div className="mt-1 text-[9px] text-[#aaa]">
                Separate tags with commas. Maximum 12 tags.
              </div>
            </div>

            {form.status === "blocked" && (
              <div>
                <label className="text-[9px] font-black uppercase tracking-[0.06em] text-red-600">
                  Block Reason
                </label>
                <input
                  value={form.blockedReason}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      blockedReason:
                        event.target.value,
                    }))
                  }
                  placeholder="Internal reason for blocking this customer"
                  className="mt-2 min-h-11 w-full rounded-[10px] border border-red-200 bg-red-50/40 px-3 text-[11px] text-[#444] outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-[9px] font-black uppercase tracking-[0.06em] text-[#777]">
                Internal Note
              </label>
              <textarea
                value={form.internalNote}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    internalNote:
                      event.target.value,
                  }))
                }
                rows={5}
                placeholder="Private note for store staff. Customer cannot see this."
                className="mt-2 w-full resize-y rounded-[10px] border border-[#e5e5e5] p-3 text-[11px] leading-5 text-[#444] outline-none"
              />
            </div>

            {error && (
              <div className="rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-[10px] text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="rounded-[10px] border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-[10px] text-emerald-700">
                {success}
              </div>
            )}

            <button
              type="button"
              onClick={saveProfile}
              disabled={saving}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--primary-color)] px-5 text-[11px] font-black text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              ) : (
                <Save size={15} />
              )}
              Save Customer Profile
            </button>
          </div>
        </div>
      </section>

      {/* =================================
          ORDER HISTORY
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
            <h2 className="text-[14px] font-black text-[#222]">
              Order History
            </h2>
            <p className="mt-1 text-[9px] text-[#999]">
              Complete order history for this customer.
            </p>
          </div>

          <div className="text-[10px] font-black text-[#777]">
            {orders.length} order
            {orders.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse">
            <thead className="bg-[#fafafa]">
              <tr>
                {[
                  "Order",
                  "Date",
                  "Items",
                  "Total",
                  "Payment",
                  "Status",
                  "Invoice",
                ].map((label) => (
                  <th
                    key={label}
                    className="border-b border-[#eeeeee] px-5 py-3 text-left text-[9px] font-black uppercase tracking-[0.08em] text-[#8d9ab0]"
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-[#f0f0f0] last:border-b-0"
                >
                  <td className="px-5 py-4">
                    <div className="text-[10px] font-black text-[#222]">
                      {order.orderNumber || order._id}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-[10px] text-[#666]">
                    {formatDateTime(order.createdAt)}
                  </td>

                  <td className="px-5 py-4 text-[10px] font-bold text-[#555]">
                    {(order.items || []).reduce(
                      (sum, item) =>
                        sum + Number(item.quantity || 0),
                      0
                    )}
                  </td>

                  <td className="px-5 py-4 text-[10px] font-black text-[#222]">
                    {formatPKR(order.totalAmount)}
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-[10px] font-semibold capitalize text-[#555]">
                      {order.paymentStatus || "pending"}
                    </div>
                    <div className="mt-1 text-[9px] uppercase text-[#999]">
                      {order.paymentMethod || "cod"}
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <OrderStatusBadge
                      status={order.orderStatus}
                    />
                  </td>

                  <td className="px-5 py-4">
                    <a
                      href={`/admin/orders/${order._id}/invoice`}
                      target="_blank"
                      rel="noreferrer"
                      title="Open invoice"
                      aria-label="Open invoice"
                      className="flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#e4e4e4] text-[#666] hover:bg-[#f7f7f7]"
                    >
                      <FileText size={13} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminCustomerDetailsPage;
