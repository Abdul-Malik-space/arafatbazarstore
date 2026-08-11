import {
  useMemo,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  MapPin,
  Package,
  Phone,
  ShoppingBag,
  Truck,
  User,
} from "lucide-react";

import {
  useCart,
} from "../context/CartContext";

import {
  useSite,
} from "../context/SiteContext";

import {
  getImageUrl,
  placeOrder,
} from "../services/api";

// ========================================
// INPUT COMPONENT
// ========================================

const CheckoutInput = ({
  label,
  required = false,
  error,
  ...props
}) => {
  return (
    <div>
      <label
        className="
          mb-2
          block
          text-[12px]
          font-semibold
          text-[#444]
        "
      >
        {label}

        {required && (
          <span className="text-red-500">
            {" "}
            *
          </span>
        )}
      </label>

      <input
        {...props}
        className={`
          h-[48px]
          w-full
          rounded-[25px]
          border
          bg-white
          px-5
          text-[13px]
          text-[#555]
          outline-none
          transition
          ${
            error
              ? "border-red-400"
              : "border-[#dddddd] focus:border-[var(--primary-color)]"
          }
        `}
      />

      {error && (
        <p
          className="
            mt-1.5
            text-[11px]
            text-red-500
          "
        >
          {error}
        </p>
      )}
    </div>
  );
};

// ========================================
// CHECKOUT PAGE
// VEGIST INDEX17 STYLE
// ========================================

const CheckoutPage = () => {
  const navigate =
    useNavigate();

  const {
    cartItems,
    subtotal,
    deliveryFee,
    totalAmount,
    getCheckoutItems,
    clearCart,
    isCartEmpty,
  } = useCart();

  const {
    settings,
    formatPrice,
  } = useSite();

  // ======================================
  // FORM
  // ======================================

  const [
    formData,
    setFormData,
  ] = useState({
    firstName: "",
    lastName: "",

    phone: "",
    alternatePhone: "",
    email: "",

    address: "",
    area: "",

    city:
      settings.city || "",

    province:
      settings.province ||
      "Punjab",

    postalCode: "",

    country:
      settings.country ||
      "Pakistan",

    landmark: "",

    paymentMethod: "cod",

    customerNote: "",
  });

  const [
    errors,
    setErrors,
  ] = useState({});

  const [
    serverError,
    setServerError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  // ======================================
  // PAYMENT METHODS
  // ======================================

  const paymentMethods =
    useMemo(() => {
      const methods = [];

      if (
        settings.paymentMethods
          ?.cod !== false
      ) {
        methods.push({
          value: "cod",
          title:
            "Cash on delivery",
          description:
            "Pay when your order arrives.",
        });
      }

      if (
        settings.paymentMethods
          ?.bankTransfer
      ) {
        methods.push({
          value:
            "bank-transfer",
          title:
            "Bank transfer",
          description:
            "Transfer payment to our bank account.",
        });
      }

      if (
        settings.paymentMethods
          ?.easypaisa
      ) {
        methods.push({
          value:
            "easypaisa",
          title:
            "Easypaisa",
          description:
            "Pay using Easypaisa.",
        });
      }

      if (
        settings.paymentMethods
          ?.jazzcash
      ) {
        methods.push({
          value:
            "jazzcash",
          title:
            "JazzCash",
          description:
            "Pay using JazzCash.",
        });
      }

      if (
        settings.paymentMethods
          ?.card
      ) {
        methods.push({
          value: "card",
          title:
            "Card payment",
          description:
            "Pay securely using your card.",
        });
      }

      return methods;
    }, [
      settings.paymentMethods,
    ]);

  // ======================================
  // CHANGE
  // ======================================

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

    if (errors[name]) {
      setErrors(
        (previous) => ({
          ...previous,
          [name]: "",
        })
      );
    }

    if (serverError) {
      setServerError("");
    }
  };

  // ======================================
  // VALIDATION
  // ======================================

  const validateForm = () => {
    const nextErrors = {};

    if (
      !formData.firstName.trim()
    ) {
      nextErrors.firstName =
        "First name is required.";
    }

    if (
      !formData.phone.trim()
    ) {
      nextErrors.phone =
        "Phone number is required.";
    }

    if (
      formData.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email
      )
    ) {
      nextErrors.email =
        "Enter a valid email.";
    }

    if (
      !formData.address.trim()
    ) {
      nextErrors.address =
        "Address is required.";
    }

    if (
      !formData.city.trim()
    ) {
      nextErrors.city =
        "City is required.";
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  };

  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (isCartEmpty) {
      setServerError(
        "Your cart is empty."
      );

      return;
    }

    try {
      setSubmitting(true);
      setServerError("");

      const payload = {
        customer: {
          firstName:
            formData.firstName.trim(),

          lastName:
            formData.lastName.trim(),

          phone:
            formData.phone.trim(),

          alternatePhone:
            formData.alternatePhone.trim(),

          email:
            formData.email.trim(),
        },

        shippingAddress: {
          address:
            formData.address.trim(),

          area:
            formData.area.trim(),

          city:
            formData.city.trim(),

          province:
            formData.province.trim(),

          postalCode:
            formData.postalCode.trim(),

          country:
            formData.country.trim() ||
            "Pakistan",

          landmark:
            formData.landmark.trim(),
        },

        items:
          getCheckoutItems(),

        paymentMethod:
          formData.paymentMethod,

        customerNote:
          formData.customerNote.trim(),
      };

      const response =
        await placeOrder(
          payload
        );

      if (
        !response?.success ||
        !response?.order
      ) {
        throw new Error(
          response?.message ||
            "Unable to place order."
        );
      }

      const order =
        response.order;

      clearCart();

      navigate(
        `/order-success/${order.orderNumber}`,
        {
          replace: true,

          state: {
            order,
          },
        }
      );
    } catch (error) {
      console.error(
        "Checkout Error:",
        error
      );

      setServerError(
        error.response?.data
          ?.message ||
          error.message ||
          "Unable to place your order."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ======================================
  // EMPTY CART
  // ======================================

  if (isCartEmpty) {
    return (
      <section
        className="
          flex
          min-h-[600px]
          items-center
          justify-center
          bg-white
          px-5
        "
      >
        <div className="text-center">
          <div
            className="
              mx-auto
              flex
              h-[90px]
              w-[90px]
              items-center
              justify-center
              rounded-full
              bg-[#f4f7ef]
              text-[var(--primary-color)]
            "
          >
            <ShoppingBag
              size={38}
            />
          </div>

          <h1
            className="
              mt-6
              text-[27px]
              font-black
              text-[#222]
            "
          >
            Your cart is empty
          </h1>

          <Link
            to="/shop"
            className="
              mt-7
              inline-flex
              rounded-full
              bg-[#282828]
              px-7
              py-3.5
              text-[12px]
              font-bold
              uppercase
              text-white
              transition
              hover:bg-[var(--primary-color)]
            "
          >
            Go to shop
          </Link>
        </div>
      </section>
    );
  }

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
            Checkout
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
                hover:text-[var(--primary-color)]
              "
            >
              Home
            </Link>

            <span>/</span>

            <Link
              to="/cart"
              className="
                hover:text-[var(--primary-color)]
              "
            >
              Cart
            </Link>

            <span>/</span>

            <span className="text-[#333]">
              Checkout
            </span>
          </div>
        </div>
      </section>

      {/* ERROR */}

      {serverError && (
        <div
          className="
            mx-auto
            max-w-[1200px]
            px-4
            pt-8
            sm:px-5
          "
        >
          <div
            className="
              border
              border-red-100
              bg-red-50
              px-5
              py-4
              text-[12px]
              text-red-600
            "
          >
            {serverError}
          </div>
        </div>
      )}

      {/* =================================
          CHECKOUT
      ================================= */}

      <form
        onSubmit={
          handleSubmit
        }
      >
        <section
          className="
            py-[65px]
          "
        >
          <div
            className="
              mx-auto
              grid
              max-w-[1200px]
              grid-cols-1
              gap-8
              px-4
              sm:px-5
              lg:grid-cols-[1fr_370px]
            "
          >
            {/* =================================
                LEFT FORM
            ================================= */}

            <div
              className="
                space-y-7
              "
            >
              {/* =============================
                  CUSTOMER DETAILS
              ============================= */}

              <div
                className="
                  border
                  border-[#eeeeee]
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
                    <User
                      size={19}
                    />
                  </div>

                  <div>
                    <h2
                      className="
                        text-[20px]
                        font-black
                        text-[#222]
                      "
                    >
                      Billing details
                    </h2>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        text-[#777]
                      "
                    >
                      Enter your contact
                      information.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-7
                    grid
                    grid-cols-1
                    gap-5
                    sm:grid-cols-2
                  "
                >
                  <CheckoutInput
                    label="First name"
                    required
                    name="firstName"
                    value={
                      formData.firstName
                    }
                    onChange={
                      handleChange
                    }
                    error={
                      errors.firstName
                    }
                    placeholder="First name"
                  />

                  <CheckoutInput
                    label="Last name"
                    name="lastName"
                    value={
                      formData.lastName
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Last name"
                  />

                  <CheckoutInput
                    label="Phone number"
                    required
                    type="tel"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    error={
                      errors.phone
                    }
                    placeholder="03XXXXXXXXX"
                  />

                  <CheckoutInput
                    label="Alternate phone"
                    type="tel"
                    name="alternatePhone"
                    value={
                      formData.alternatePhone
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Optional"
                  />

                  <div
                    className="
                      sm:col-span-2
                    "
                  >
                    <CheckoutInput
                      label="Email address"
                      type="email"
                      name="email"
                      value={
                        formData.email
                      }
                      onChange={
                        handleChange
                      }
                      error={
                        errors.email
                      }
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* =============================
                  SHIPPING ADDRESS
              ============================= */}

              <div
                className="
                  border
                  border-[#eeeeee]
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
                    <MapPin
                      size={19}
                    />
                  </div>

                  <div>
                    <h2
                      className="
                        text-[20px]
                        font-black
                        text-[#222]
                      "
                    >
                      Shipping address
                    </h2>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        text-[#777]
                      "
                    >
                      Enter your delivery
                      location.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-7
                    grid
                    grid-cols-1
                    gap-5
                    sm:grid-cols-2
                  "
                >
                  {/* ADDRESS */}

                  <div
                    className="
                      sm:col-span-2
                    "
                  >
                    <label
                      className="
                        mb-2
                        block
                        text-[12px]
                        font-semibold
                        text-[#444]
                      "
                    >
                      Full address
                      <span className="text-red-500">
                        {" "}
                        *
                      </span>
                    </label>

                    <textarea
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      rows="3"
                      placeholder="House, street, road..."
                      className={`
                        w-full
                        resize-none
                        rounded-[18px]
                        border
                        bg-white
                        px-5
                        py-4
                        text-[13px]
                        text-[#555]
                        outline-none
                        ${
                          errors.address
                            ? "border-red-400"
                            : "border-[#dddddd] focus:border-[var(--primary-color)]"
                        }
                      `}
                    />

                    {errors.address && (
                      <p
                        className="
                          mt-1.5
                          text-[11px]
                          text-red-500
                        "
                      >
                        {
                          errors.address
                        }
                      </p>
                    )}
                  </div>

                  <CheckoutInput
                    label="Area"
                    name="area"
                    value={
                      formData.area
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Area / locality"
                  />

                  <CheckoutInput
                    label="City"
                    required
                    name="city"
                    value={
                      formData.city
                    }
                    onChange={
                      handleChange
                    }
                    error={
                      errors.city
                    }
                    placeholder="City"
                  />

                  {/* PROVINCE */}

                  <div>
                    <label
                      className="
                        mb-2
                        block
                        text-[12px]
                        font-semibold
                        text-[#444]
                      "
                    >
                      Province
                    </label>

                    <select
                      name="province"
                      value={
                        formData.province
                      }
                      onChange={
                        handleChange
                      }
                      className="
                        h-[48px]
                        w-full
                        rounded-[25px]
                        border
                        border-[#dddddd]
                        bg-white
                        px-5
                        text-[13px]
                        text-[#555]
                        outline-none
                        focus:border-[var(--primary-color)]
                      "
                    >
                      <option value="Punjab">
                        Punjab
                      </option>

                      <option value="Sindh">
                        Sindh
                      </option>

                      <option value="Khyber Pakhtunkhwa">
                        Khyber Pakhtunkhwa
                      </option>

                      <option value="Balochistan">
                        Balochistan
                      </option>

                      <option value="Islamabad">
                        Islamabad
                      </option>

                      <option value="Azad Kashmir">
                        Azad Kashmir
                      </option>

                      <option value="Gilgit-Baltistan">
                        Gilgit-Baltistan
                      </option>
                    </select>
                  </div>

                  <CheckoutInput
                    label="Postal code"
                    name="postalCode"
                    value={
                      formData.postalCode
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Optional"
                  />

                  <div
                    className="
                      sm:col-span-2
                    "
                  >
                    <CheckoutInput
                      label="Nearby landmark"
                      name="landmark"
                      value={
                        formData.landmark
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Near main market"
                    />
                  </div>
                </div>
              </div>

              {/* =============================
                  PAYMENT
              ============================= */}

              <div
                className="
                  border
                  border-[#eeeeee]
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
                    <CreditCard
                      size={19}
                    />
                  </div>

                  <div>
                    <h2
                      className="
                        text-[20px]
                        font-black
                        text-[#222]
                      "
                    >
                      Payment method
                    </h2>

                    <p
                      className="
                        mt-1
                        text-[11px]
                        text-[#777]
                      "
                    >
                      Select how you
                      would like to pay.
                    </p>
                  </div>
                </div>

                <div
                  className="
                    mt-6
                    space-y-3
                  "
                >
                  {paymentMethods.map(
                    (method) => (
                      <label
                        key={
                          method.value
                        }
                        className={`
                          flex
                          cursor-pointer
                          items-start
                          gap-4
                          rounded-[14px]
                          border
                          p-4
                          transition
                          ${
                            formData.paymentMethod ===
                            method.value
                              ? "border-[var(--primary-color)] bg-[#f4f7ef]"
                              : "border-[#eeeeee] bg-white hover:border-[var(--primary-color)]"
                          }
                        `}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={
                            method.value
                          }
                          checked={
                            formData.paymentMethod ===
                            method.value
                          }
                          onChange={
                            handleChange
                          }
                          className="
                            mt-1
                            h-4
                            w-4
                            accent-[var(--primary-color)]
                          "
                        />

                        <div>
                          <div
                            className="
                              text-[13px]
                              font-bold
                              text-[#222]
                            "
                          >
                            {
                              method.title
                            }
                          </div>

                          <p
                            className="
                              mt-1
                              text-[11px]
                              leading-5
                              text-[#777]
                            "
                          >
                            {
                              method.description
                            }
                          </p>
                        </div>
                      </label>
                    )
                  )}
                </div>

                {formData.paymentMethod ===
                  "bank-transfer" &&
                  settings.bankAccountDetails && (
                    <div
                      className="
                        mt-4
                        rounded-[12px]
                        bg-[#fafafa]
                        p-4
                        text-[12px]
                        leading-6
                        text-[#666]
                      "
                    >
                      {
                        settings.bankAccountDetails
                      }
                    </div>
                  )}

                {formData.paymentMethod ===
                  "easypaisa" &&
                  settings.easypaisaNumber && (
                    <div
                      className="
                        mt-4
                        rounded-[12px]
                        bg-[#fafafa]
                        p-4
                        text-[12px]
                        text-[#666]
                      "
                    >
                      Easypaisa:{" "}
                      <strong>
                        {
                          settings.easypaisaNumber
                        }
                      </strong>
                    </div>
                  )}

                {formData.paymentMethod ===
                  "jazzcash" &&
                  settings.jazzcashNumber && (
                    <div
                      className="
                        mt-4
                        rounded-[12px]
                        bg-[#fafafa]
                        p-4
                        text-[12px]
                        text-[#666]
                      "
                    >
                      JazzCash:{" "}
                      <strong>
                        {
                          settings.jazzcashNumber
                        }
                      </strong>
                    </div>
                  )}
              </div>

              {/* NOTE */}

              <div
                className="
                  border
                  border-[#eeeeee]
                  p-5
                  sm:p-7
                "
              >
                <label
                  className="
                    mb-3
                    block
                    text-[14px]
                    font-black
                    text-[#222]
                  "
                >
                  Order note
                </label>

                <textarea
                  name="customerNote"
                  value={
                    formData.customerNote
                  }
                  onChange={
                    handleChange
                  }
                  rows="4"
                  placeholder="Any special instructions?"
                  className="
                    w-full
                    resize-none
                    rounded-[18px]
                    border
                    border-[#dddddd]
                    px-5
                    py-4
                    text-[13px]
                    text-[#555]
                    outline-none
                    focus:border-[var(--primary-color)]
                  "
                />
              </div>
            </div>

            {/* =================================
                RIGHT ORDER SUMMARY
            ================================= */}

            <aside
              className="
                self-start
                rounded-[18px]
                bg-[#faf7f3]
                p-6
                lg:sticky
                lg:top-6
              "
            >
              <h2
                className="
                  text-[21px]
                  font-black
                  text-[#222]
                "
              >
                Your order
              </h2>

              <div
                className="
                  mt-3
                  h-[2px]
                  w-12
                  bg-[var(--primary-color)]
                "
              />

              {/* ITEMS */}

              <div
                className="
                  mt-6
                  max-h-[330px]
                  space-y-4
                  overflow-y-auto
                  pr-1
                "
              >
                {cartItems.map(
                  (item) => {
                    const imageUrl =
                      item.image
                        ? getImageUrl(
                            item.image
                          )
                        : "";

                    return (
                      <div
                        key={
                          item.cartKey
                        }
                        className="
                          flex
                          gap-3
                          border-b
                          border-[#e8e5e2]
                          pb-4
                          last:border-0
                        "
                      >
                        <div
                          className="
                            relative
                            flex
                            h-[62px]
                            w-[62px]
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-[12px]
                            bg-white
                          "
                        >
                          {imageUrl ? (
                            <img
                              src={
                                imageUrl
                              }
                              alt={
                                item.name
                              }
                              className="
                                h-full
                                w-full
                                object-contain
                                p-1.5
                              "
                            />
                          ) : (
                            <Package
                              size={24}
                              className="
                                text-gray-300
                              "
                            />
                          )}

                          <span
                            className="
                              absolute
                              right-0
                              top-0
                              flex
                              h-5
                              min-w-5
                              items-center
                              justify-center
                              rounded-full
                              bg-[#282828]
                              px-1
                              text-[9px]
                              font-bold
                              text-white
                            "
                          >
                            {
                              item.quantity
                            }
                          </span>
                        </div>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <div
                            className="
                              line-clamp-2
                              text-[12px]
                              font-bold
                              leading-5
                              text-[#333]
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
                              text-[12px]
                              font-bold
                              text-[var(--primary-color)]
                            "
                          >
                            {formatPrice(
                              Number(
                                item.price
                              ) *
                                Number(
                                  item.quantity
                                )
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  }
                )}
              </div>

              {/* TOTALS */}

              <div
                className="
                  mt-6
                  space-y-4
                  text-[13px]
                "
              >
                <div
                  className="
                    flex
                    justify-between
                    gap-3
                  "
                >
                  <span className="text-[#777]">
                    Subtotal
                  </span>

                  <strong className="text-[#333]">
                    {formatPrice(
                      subtotal
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
                  <span className="text-[#777]">
                    Delivery
                  </span>

                  <strong
                    className={
                      Number(
                        deliveryFee
                      ) === 0
                        ? "text-[var(--primary-color)]"
                        : "text-[#333]"
                    }
                  >
                    {Number(
                      deliveryFee
                    ) === 0
                      ? "Free"
                      : formatPrice(
                          deliveryFee
                        )}
                  </strong>
                </div>

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
                        totalAmount
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* PLACE ORDER */}

              <button
                type="submit"
                disabled={
                  submitting
                }
                className="
                  mt-7
                  flex
                  h-[50px]
                  w-full
                  items-center
                  justify-center
                  gap-3
                  rounded-[27px]
                  bg-[#282828]
                  px-5
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
                {submitting ? (
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

                    Placing order...
                  </>
                ) : (
                  <>
                    <CheckCircle2
                      size={16}
                    />

                    Place order
                  </>
                )}
              </button>

              {/* DELIVERY */}

              <div
                className="
                  mt-5
                  rounded-[12px]
                  bg-white
                  p-4
                "
              >
                <div
                  className="
                    flex
                    gap-3
                    text-[11px]
                    leading-5
                    text-[#777]
                  "
                >
                  <Truck
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-[var(--primary-color)]
                    "
                  />

                  <span>
                    {settings.estimatedDeliveryText ||
                      "Delivery information will appear here."}
                  </span>
                </div>

                <div
                  className="
                    mt-3
                    flex
                    gap-3
                    text-[11px]
                    leading-5
                    text-[#777]
                  "
                >
                  <Phone
                    size={16}
                    className="
                      mt-0.5
                      shrink-0
                      text-[var(--primary-color)]
                    "
                  />

                  <span>
                    We may contact you
                    to confirm your
                    order.
                  </span>
                </div>
              </div>

              <Link
                to="/cart"
                className="
                  mt-5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-[11px]
                  font-bold
                  uppercase
                  text-[#555]
                  transition
                  hover:text-[var(--primary-color)]
                "
              >
                <ArrowLeft
                  size={14}
                />

                Back to cart
              </Link>
            </aside>
          </div>
        </section>
      </form>
    </div>
  );
};

export default CheckoutPage;