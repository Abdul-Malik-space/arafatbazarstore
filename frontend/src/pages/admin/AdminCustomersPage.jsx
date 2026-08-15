import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowRight,
  Ban,
  Crown,
  Eye,
  LoaderCircle,
  MessageCircle,
  Phone,
  RefreshCw,
  Repeat2,
  Search,
  ShieldCheck,
  UsersRound,
  WalletCards,
} from "lucide-react";

import {
  Link,
} from "react-router-dom";

import {
  getAdminCustomers,
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

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getCustomerName = (customer) =>
  [
    customer?.firstName,
    customer?.lastName,
  ]
    .filter(Boolean)
    .join(" ") || "Customer";

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

const STATUS_STYLES = {
  active:
    "bg-emerald-50 text-emerald-700 ring-emerald-200",
  vip:
    "bg-amber-50 text-amber-700 ring-amber-200",
  blocked:
    "bg-red-50 text-red-700 ring-red-200",
};

const StatusBadge = ({ status }) => (
  <span
    className={`
      inline-flex
      items-center
      rounded-full
      px-2.5
      py-1
      text-[10px]
      font-black
      uppercase
      tracking-[0.06em]
      ring-1
      ring-inset
      ${
        STATUS_STYLES[status] ||
        STATUS_STYLES.active
      }
    `}
  >
    {status || "active"}
  </span>
);

const SummaryCard = ({
  label,
  value,
  hint,
  icon: Icon,
}) => (
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
        items-start
        justify-between
        gap-4
      "
    >
      <div>
        <div
          className="
            text-[9px]
            font-black
            uppercase
            tracking-[0.1em]
            text-[#999]
          "
        >
          {label}
        </div>

        <div
          className="
            mt-2
            text-[24px]
            font-black
            tracking-[-0.03em]
            text-[#222]
          "
        >
          {value}
        </div>

        {hint && (
          <div
            className="
              mt-1
              text-[9px]
              leading-4
              text-[#999]
            "
          >
            {hint}
          </div>
        )}
      </div>

      <div
        className="
          flex
          h-10
          w-10
          shrink-0
          items-center
          justify-center
          rounded-[12px]
          bg-[#f3f7ec]
          text-[var(--primary-color)]
        "
      >
        <Icon size={18} />
      </div>
    </div>
  </div>
);

// ========================================
// PAGE
// ========================================

const AdminCustomersPage = () => {
  const [customers, setCustomers] =
    useState([]);

  const [summary, setSummary] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    vipCustomers: 0,
    blockedCustomers: 0,
    repeatCustomers: 0,
    deliveredValue: 0,
  });

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [repeatOnly, setRepeatOnly] =
    useState(false);

  const [sort, setSort] =
    useState("recent");

  const [page, setPage] =
    useState(1);

  const [pages, setPages] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAdminCustomers({
        page,
        limit: 20,
        search: debouncedSearch,
        status,
        repeatOnly,
        sort,
      });

      setCustomers(data.customers || []);
      setSummary(
        data.summary || {
          totalCustomers: 0,
          activeCustomers: 0,
          vipCustomers: 0,
          blockedCustomers: 0,
          repeatCustomers: 0,
          deliveredValue: 0,
        }
      );
      setPages(Number(data.pages) || 1);
      setTotal(Number(data.total) || 0);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Failed to load customers."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [
    page,
    debouncedSearch,
    status,
    repeatOnly,
    sort,
  ]);

  const hasFilters = useMemo(
    () =>
      Boolean(
        debouncedSearch ||
          status ||
          repeatOnly ||
          sort !== "recent"
      ),
    [
      debouncedSearch,
      status,
      repeatOnly,
      sort,
    ]
  );

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("");
    setRepeatOnly(false);
    setSort("recent");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* =================================
          PAGE INTRO
      ================================= */}

      <section
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <div
            className="
              text-[10px]
              font-black
              uppercase
              tracking-[0.14em]
              text-[var(--primary-color)]
            "
          >
            Customer CRM
          </div>

          <h1
            className="
              mt-1
              text-[26px]
              font-black
              tracking-[-0.03em]
              text-[#222]
            "
          >
            Customer Management
          </h1>

          <p
            className="
              mt-1
              max-w-[650px]
              text-[11px]
              leading-5
              text-[#888]
            "
          >
            Every customer is built automatically
            from order history. View spending,
            repeat orders, notes, tags and account
            status from one place.
          </p>
        </div>

        <button
          type="button"
          onClick={loadCustomers}
          disabled={loading}
          className="
            inline-flex
            min-h-10
            items-center
            justify-center
            gap-2
            rounded-[10px]
            border
            border-[#e4e4e4]
            bg-white
            px-4
            text-[11px]
            font-bold
            text-[#555]
            transition
            hover:bg-[#fafafa]
            disabled:opacity-50
          "
        >
          <RefreshCw
            size={14}
            className={
              loading ? "animate-spin" : ""
            }
          />
          Refresh
        </button>
      </section>

      {/* =================================
          SUMMARY
      ================================= */}

      <section
        className="
          grid
          grid-cols-2
          gap-3
          lg:grid-cols-3
          xl:grid-cols-6
        "
      >
        <SummaryCard
          label="Customers"
          value={summary.totalCustomers || 0}
          hint="Unique buyers"
          icon={UsersRound}
        />

        <SummaryCard
          label="Repeat"
          value={summary.repeatCustomers || 0}
          hint="2+ orders"
          icon={Repeat2}
        />

        <SummaryCard
          label="VIP"
          value={summary.vipCustomers || 0}
          hint="Priority customers"
          icon={Crown}
        />

        <SummaryCard
          label="Blocked"
          value={summary.blockedCustomers || 0}
          hint="Checkout restricted"
          icon={Ban}
        />

        <SummaryCard
          label="Active"
          value={summary.activeCustomers || 0}
          hint="Normal customers"
          icon={ShieldCheck}
        />

        <SummaryCard
          label="Delivered Value"
          value={formatPKR(
            summary.deliveredValue
          )}
          hint="Delivered orders"
          icon={WalletCards}
        />
      </section>

      {/* =================================
          FILTER BAR
      ================================= */}

      <section
        className="
          rounded-[16px]
          border
          border-[#e8e8e8]
          bg-white
          p-4
        "
      >
        <div
          className="
            grid
            grid-cols-1
            gap-3
            md:grid-cols-2
            xl:grid-cols-[minmax(280px,1fr)_180px_200px_auto]
          "
        >
          <label
            className="
              flex
              min-h-11
              items-center
              gap-2.5
              rounded-[10px]
              border
              border-[#e8e8e8]
              bg-[#fafafa]
              px-3
            "
          >
            <Search
              size={15}
              className="text-[#999]"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search name, phone, email or city..."
              className="
                w-full
                bg-transparent
                text-[11px]
                text-[#333]
                outline-none
                placeholder:text-[#aaa]
              "
            />
          </label>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="
              min-h-11
              rounded-[10px]
              border
              border-[#e8e8e8]
              bg-white
              px-3
              text-[11px]
              font-semibold
              text-[#555]
              outline-none
            "
          >
            <option value="">All statuses</option>
            <option value="active">Active</option>
            <option value="vip">VIP</option>
            <option value="blocked">Blocked</option>
          </select>

          <select
            value={sort}
            onChange={(event) => {
              setSort(event.target.value);
              setPage(1);
            }}
            className="
              min-h-11
              rounded-[10px]
              border
              border-[#e8e8e8]
              bg-white
              px-3
              text-[11px]
              font-semibold
              text-[#555]
              outline-none
            "
          >
            <option value="recent">
              Recently ordered
            </option>
            <option value="orders-high">
              Most orders
            </option>
            <option value="spend-high">
              Highest spend
            </option>
            <option value="name">
              Customer name
            </option>
            <option value="oldest">
              Oldest customer
            </option>
          </select>

          <label
            className="
              flex
              min-h-11
              cursor-pointer
              items-center
              gap-2
              rounded-[10px]
              border
              border-[#e8e8e8]
              px-3
              text-[11px]
              font-semibold
              text-[#555]
            "
          >
            <input
              type="checkbox"
              checked={repeatOnly}
              onChange={(event) => {
                setRepeatOnly(
                  event.target.checked
                );
                setPage(1);
              }}
              className="h-4 w-4"
            />
            Repeat only
          </label>
        </div>

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-3
          "
        >
          <div
            className="
              text-[10px]
              text-[#999]
            "
          >
            {total} customer
            {total === 1 ? "" : "s"} found
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="
                text-[10px]
                font-bold
                text-[var(--primary-color)]
              "
            >
              Clear filters
            </button>
          )}
        </div>
      </section>

      {/* =================================
          ERROR
      ================================= */}

      {error && (
        <div
          className="
            rounded-[12px]
            border
            border-red-200
            bg-red-50
            px-4
            py-3
            text-[11px]
            font-medium
            text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* =================================
          DESKTOP TABLE
      ================================= */}

      <section
        className="
          hidden
          overflow-hidden
          rounded-[16px]
          border
          border-[#e8e8e8]
          bg-white
          lg:block
        "
      >
        <div className="overflow-x-auto">
          <table
            className="
              w-full
              min-w-[1050px]
              border-collapse
            "
          >
            <thead className="bg-[#fafafa]">
              <tr>
                {[
                  "Customer",
                  "Contact",
                  "Location",
                  "Orders",
                  "Delivered Value",
                  "Last Order",
                  "Status",
                  "Actions",
                ].map((label) => (
                  <th
                    key={label}
                    className="
                      border-b
                      border-[#eeeeee]
                      px-5
                      py-3.5
                      text-left
                      text-[9px]
                      font-black
                      uppercase
                      tracking-[0.08em]
                      text-[#8d9ab0]
                    "
                  >
                    {label}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center"
                  >
                    <LoaderCircle
                      size={28}
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
                      Loading customers...
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-16 text-center"
                  >
                    <UsersRound
                      size={32}
                      className="
                        mx-auto
                        text-[#ccd2da]
                      "
                    />
                    <div
                      className="
                        mt-3
                        text-[12px]
                        font-bold
                        text-[#555]
                      "
                    >
                      No customers found
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((item) => {
                  const customer = item.customer || {};
                  const phone = customer.phone || "";
                  const whatsapp = getWhatsAppNumber(
                    phone
                  );

                  return (
                    <tr
                      key={item.phoneKey}
                      className="
                        border-b
                        border-[#f0f0f0]
                        last:border-b-0
                        hover:bg-[#fcfcfc]
                      "
                    >
                      <td className="px-5 py-4">
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
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-[#f3f7ec]
                              text-[12px]
                              font-black
                              uppercase
                              text-[var(--primary-color)]
                            "
                          >
                            {getCustomerName(customer)
                              .charAt(0)
                              .toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <Link
                              to={`/admin/customers/${encodeURIComponent(
                                item.phoneKey
                              )}`}
                              className="
                                block
                                max-w-[190px]
                                truncate
                                text-[11px]
                                font-black
                                text-[#222]
                                hover:text-[var(--primary-color)]
                              "
                            >
                              {getCustomerName(customer)}
                            </Link>

                            <div
                              className="
                                mt-1
                                text-[9px]
                                text-[#999]
                              "
                            >
                              Since {formatDate(
                                item.firstOrderAt
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className="
                            text-[10px]
                            font-semibold
                            text-[#555]
                          "
                        >
                          {phone || "—"}
                        </div>
                        <div
                          className="
                            mt-1
                            max-w-[180px]
                            truncate
                            text-[9px]
                            text-[#999]
                          "
                        >
                          {customer.email || "No email"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className="
                            max-w-[150px]
                            truncate
                            text-[10px]
                            font-semibold
                            text-[#555]
                          "
                        >
                          {item.shippingAddress?.city || "—"}
                        </div>
                        <div
                          className="
                            mt-1
                            max-w-[150px]
                            truncate
                            text-[9px]
                            text-[#999]
                          "
                        >
                          {item.shippingAddress?.area ||
                            item.shippingAddress?.province ||
                            "Pakistan"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className="
                            text-[12px]
                            font-black
                            text-[#222]
                          "
                        >
                          {item.totalOrders || 0}
                        </div>
                        <div
                          className="
                            mt-1
                            text-[9px]
                            text-[#999]
                          "
                        >
                          {item.deliveredOrders || 0} delivered
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className="
                            text-[11px]
                            font-black
                            text-[#222]
                          "
                        >
                          {formatPKR(
                            item.deliveredValue
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className="
                            text-[10px]
                            font-semibold
                            text-[#555]
                          "
                        >
                          {formatDate(item.lastOrderAt)}
                        </div>
                        <div
                          className="
                            mt-1
                            text-[9px]
                            text-[#999]
                          "
                        >
                          {item.lastOrderNumber || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={item.status} />
                      </td>

                      <td className="px-5 py-4">
                        <div
                          className="
                            flex
                            items-center
                            gap-1.5
                          "
                        >
                          {phone && (
                            <a
                              href={`tel:${phone}`}
                              title="Call customer"
                              aria-label="Call customer"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-[8px]
                                border
                                border-[#e4e4e4]
                                text-[#666]
                                hover:bg-[#f7f7f7]
                              "
                            >
                              <Phone size={13} />
                            </a>
                          )}

                          {whatsapp && (
                            <a
                              href={`https://wa.me/${whatsapp}`}
                              target="_blank"
                              rel="noreferrer"
                              title="Open WhatsApp"
                              aria-label="Open WhatsApp"
                              className="
                                flex
                                h-8
                                w-8
                                items-center
                                justify-center
                                rounded-[8px]
                                border
                                border-emerald-200
                                bg-emerald-50
                                text-emerald-700
                                hover:bg-emerald-100
                              "
                            >
                              <MessageCircle size={13} />
                            </a>
                          )}

                          <Link
                            to={`/admin/customers/${encodeURIComponent(
                              item.phoneKey
                            )}`}
                            title="View customer"
                            aria-label="View customer"
                            className="
                              flex
                              h-8
                              w-8
                              items-center
                              justify-center
                              rounded-[8px]
                              border
                              border-[#e4e4e4]
                              text-[#666]
                              hover:bg-[#f7f7f7]
                            "
                          >
                            <Eye size={13} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* =================================
          MOBILE CARDS
      ================================= */}

      <section className="space-y-3 lg:hidden">
        {loading ? (
          <div
            className="
              rounded-[16px]
              border
              border-[#e8e8e8]
              bg-white
              py-14
              text-center
            "
          >
            <LoaderCircle
              size={26}
              className="
                mx-auto
                animate-spin
                text-[var(--primary-color)]
              "
            />
          </div>
        ) : customers.length === 0 ? (
          <div
            className="
              rounded-[16px]
              border
              border-[#e8e8e8]
              bg-white
              py-14
              text-center
              text-[11px]
              text-[#999]
            "
          >
            No customers found.
          </div>
        ) : (
          customers.map((item) => {
            const customer = item.customer || {};
            const phone = customer.phone || "";
            const whatsapp = getWhatsAppNumber(phone);

            return (
              <article
                key={item.phoneKey}
                className="
                  rounded-[16px]
                  border
                  border-[#e8e8e8]
                  bg-white
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
                  <div className="min-w-0">
                    <div
                      className="
                        truncate
                        text-[13px]
                        font-black
                        text-[#222]
                      "
                    >
                      {getCustomerName(customer)}
                    </div>

                    <div
                      className="
                        mt-1
                        text-[10px]
                        text-[#777]
                      "
                    >
                      {phone || "No phone"}
                    </div>
                  </div>

                  <StatusBadge status={item.status} />
                </div>

                <div
                  className="
                    mt-4
                    grid
                    grid-cols-3
                    gap-2
                  "
                >
                  <div className="rounded-[10px] bg-[#fafafa] p-3">
                    <div className="text-[9px] text-[#999]">
                      Orders
                    </div>
                    <div className="mt-1 text-[13px] font-black text-[#222]">
                      {item.totalOrders || 0}
                    </div>
                  </div>

                  <div className="rounded-[10px] bg-[#fafafa] p-3">
                    <div className="text-[9px] text-[#999]">
                      Delivered
                    </div>
                    <div className="mt-1 text-[13px] font-black text-[#222]">
                      {item.deliveredOrders || 0}
                    </div>
                  </div>

                  <div className="rounded-[10px] bg-[#fafafa] p-3">
                    <div className="text-[9px] text-[#999]">
                      Last order
                    </div>
                    <div className="mt-1 text-[10px] font-bold text-[#222]">
                      {formatDate(item.lastOrderAt)}
                    </div>
                  </div>
                </div>

                <div
                  className="
                    mt-4
                    flex
                    items-center
                    justify-between
                    gap-3
                    border-t
                    border-[#eeeeee]
                    pt-4
                  "
                >
                  <div>
                    <div className="text-[9px] text-[#999]">
                      Delivered value
                    </div>
                    <div className="mt-1 text-[12px] font-black text-[#222]">
                      {formatPKR(item.deliveredValue)}
                    </div>
                  </div>

                  <div className="flex gap-1.5">
                    {phone && (
                      <a
                        href={`tel:${phone}`}
                        className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-[#e4e4e4] text-[#666]"
                        aria-label="Call customer"
                      >
                        <Phone size={14} />
                      </a>
                    )}

                    {whatsapp && (
                      <a
                        href={`https://wa.me/${whatsapp}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-[9px] border border-emerald-200 bg-emerald-50 text-emerald-700"
                        aria-label="Open WhatsApp"
                      >
                        <MessageCircle size={14} />
                      </a>
                    )}

                    <Link
                      to={`/admin/customers/${encodeURIComponent(
                        item.phoneKey
                      )}`}
                      className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[var(--primary-color)] text-white"
                      aria-label="View customer"
                    >
                      <Eye size={14} />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </section>

      {/* =================================
          PAGINATION
      ================================= */}

      <section
        className="
          flex
          items-center
          justify-between
          gap-4
          rounded-[14px]
          border
          border-[#e8e8e8]
          bg-white
          px-4
          py-3
        "
      >
        <button
          type="button"
          disabled={page <= 1 || loading}
          onClick={() =>
            setPage((current) =>
              Math.max(current - 1, 1)
            )
          }
          className="
            inline-flex
            min-h-9
            items-center
            gap-1.5
            rounded-[9px]
            border
            border-[#e6e6e6]
            px-3
            text-[10px]
            font-bold
            text-[#666]
            disabled:opacity-35
          "
        >
          <ArrowLeft size={13} />
          Previous
        </button>

        <div
          className="
            text-[10px]
            font-bold
            text-[#667085]
          "
        >
          Page {page} of {pages}
        </div>

        <button
          type="button"
          disabled={page >= pages || loading}
          onClick={() =>
            setPage((current) =>
              Math.min(current + 1, pages)
            )
          }
          className="
            inline-flex
            min-h-9
            items-center
            gap-1.5
            rounded-[9px]
            border
            border-[#e6e6e6]
            px-3
            text-[10px]
            font-bold
            text-[#666]
            disabled:opacity-35
          "
        >
          Next
          <ArrowRight size={13} />
        </button>
      </section>
    </div>
  );
};

export default AdminCustomersPage;
