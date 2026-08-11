import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  ChevronRight,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Send,
} from "lucide-react";

import {
  useSite,
} from "../context/SiteContext";

// ========================================
// CONTACT PAGE
// ========================================

const ContactPage = () => {
  const {
    settings,
    getWhatsAppLink,
  } = useSite();

  const [formData, setFormData] =
    useState({
      name: "",
      phone: "",
      email: "",
      subject: "",
      message: "",
    });

  const [errors, setErrors] =
    useState({});

  // ======================================
  // ADDRESS
  // ======================================

  const fullAddress = [
    settings.address,
    settings.city,
    settings.province,
    settings.country,
  ]
    .filter(Boolean)
    .join(", ");

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
  };

  // ======================================
  // VALIDATE
  // ======================================

  const validateForm = () => {
    const nextErrors = {};

    if (
      !formData.name.trim()
    ) {
      nextErrors.name =
        "Name is required.";
    }

    if (
      !formData.phone.trim() &&
      !formData.email.trim()
    ) {
      nextErrors.phone =
        "Phone or email is required.";
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
      !formData.message.trim()
    ) {
      nextErrors.message =
        "Message is required.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  };

  // ======================================
  // SEND MESSAGE
  // ======================================

  const handleSubmit = (
    event
  ) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    const message = `
Hello,

Name: ${formData.name}
Phone: ${formData.phone || "-"}
Email: ${formData.email || "-"}
Subject: ${formData.subject || "General Inquiry"}

Message:
${formData.message}
    `.trim();

    // ------------------------------------
    // WHATSAPP FIRST
    // ------------------------------------

    if (settings.whatsapp) {
      const whatsappUrl =
        getWhatsAppLink(
          message
        );

      window.open(
        whatsappUrl,
        "_blank",
        "noopener,noreferrer"
      );

      return;
    }

    // ------------------------------------
    // EMAIL FALLBACK
    // ------------------------------------

    if (settings.email) {
      const subject =
        encodeURIComponent(
          formData.subject ||
            "Website Contact Inquiry"
        );

      const body =
        encodeURIComponent(
          message
        );

      window.location.href =
        `mailto:${settings.email}?subject=${subject}&body=${body}`;
    }
  };

  return (
    <div className="bg-white">
      {/* =================================
          PAGE TITLE
      ================================= */}

      <section
        className="
          border-b
          border-gray-100
          bg-[#f7f8f5]
        "
      >
        <div
          className="
            mx-auto
            max-w-[1320px]
            px-4
            py-10
            text-center
            sm:px-5
            lg:py-12
          "
        >
          <h1
            className="
              text-3xl
              font-black
              text-gray-900
              sm:text-4xl
            "
          >
            Contact Us
          </h1>

          <div
            className="
              mt-3
              flex
              items-center
              justify-center
              gap-2
              text-sm
              text-gray-500
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

            <ChevronRight
              size={14}
            />

            <span
              className="
                text-gray-800
              "
            >
              Contact Us
            </span>
          </div>
        </div>
      </section>

      {/* =================================
          CONTACT INFORMATION
      ================================= */}

      <section
        className="
          py-12
          lg:py-16
        "
      >
        <div
          className="
            mx-auto
            max-w-[1320px]
            px-4
            sm:px-5
          "
        >
          <div
            className="
              grid
              grid-cols-1
              gap-5
              md:grid-cols-2
              lg:grid-cols-4
            "
          >
            {/* PHONE */}

            <div
              className="
                rounded-xl
                border
                border-gray-100
                bg-white
                p-6
                text-center
                transition
                hover:shadow-md
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-green-50
                  text-[var(--primary-color)]
                "
              >
                <Phone
                  size={23}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-black
                  text-gray-900
                "
              >
                Phone
              </h3>

              {settings.phone ? (
                <a
                  href={`tel:${settings.phone}`}
                  className="
                    mt-2
                    block
                    text-sm
                    text-gray-500
                    transition
                    hover:text-[var(--primary-color)]
                  "
                >
                  {settings.phone}
                </a>
              ) : (
                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-400
                  "
                >
                  Contact number
                </p>
              )}
            </div>

            {/* WHATSAPP */}

            <div
              className="
                rounded-xl
                border
                border-gray-100
                bg-white
                p-6
                text-center
                transition
                hover:shadow-md
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-green-50
                  text-[var(--primary-color)]
                "
              >
                <MessageCircle
                  size={23}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-black
                  text-gray-900
                "
              >
                WhatsApp
              </h3>

              {settings.whatsapp ? (
                <a
                  href={getWhatsAppLink(
                    "Hello, I want to contact you."
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    mt-2
                    block
                    text-sm
                    text-gray-500
                    transition
                    hover:text-[var(--primary-color)]
                  "
                >
                  {settings.whatsapp}
                </a>
              ) : (
                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-400
                  "
                >
                  WhatsApp support
                </p>
              )}
            </div>

            {/* EMAIL */}

            <div
              className="
                rounded-xl
                border
                border-gray-100
                bg-white
                p-6
                text-center
                transition
                hover:shadow-md
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-green-50
                  text-[var(--primary-color)]
                "
              >
                <Mail
                  size={23}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-black
                  text-gray-900
                "
              >
                Email
              </h3>

              {settings.email ? (
                <a
                  href={`mailto:${settings.email}`}
                  className="
                    mt-2
                    block
                    break-all
                    text-sm
                    text-gray-500
                    transition
                    hover:text-[var(--primary-color)]
                  "
                >
                  {settings.email}
                </a>
              ) : (
                <p
                  className="
                    mt-2
                    text-sm
                    text-gray-400
                  "
                >
                  Email support
                </p>
              )}
            </div>

            {/* ADDRESS */}

            <div
              className="
                rounded-xl
                border
                border-gray-100
                bg-white
                p-6
                text-center
                transition
                hover:shadow-md
              "
            >
              <div
                className="
                  mx-auto
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-green-50
                  text-[var(--primary-color)]
                "
              >
                <MapPin
                  size={23}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-black
                  text-gray-900
                "
              >
                Address
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  leading-6
                  text-gray-500
                "
              >
                {fullAddress ||
                  "Store location"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =================================
          FORM + INFO
      ================================= */}

      <section
        className="
          border-t
          border-gray-100
          bg-[#fafafa]
          py-12
          lg:py-16
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-[1320px]
            grid-cols-1
            gap-10
            px-4
            sm:px-5
            lg:grid-cols-[0.85fr_1.15fr]
            lg:gap-16
          "
        >
          {/* LEFT */}

          <div>
            <span
              className="
                text-sm
                font-bold
                uppercase
                tracking-[0.18em]
                text-[var(--primary-color)]
              "
            >
              Get In Touch
            </span>

            <h2
              className="
                mt-3
                text-3xl
                font-black
                leading-tight
                text-gray-900
                sm:text-4xl
              "
            >
              We’d Love to Hear
              From You
            </h2>

            <div
              className="
                mt-4
                h-[3px]
                w-14
                rounded-full
                bg-[var(--primary-color)]
              "
            />

            <p
              className="
                mt-6
                text-[15px]
                leading-8
                text-gray-600
              "
            >
              Have a question about a
              product, your order or
              delivery? Send us a
              message and our team will
              help you.
            </p>

            {settings.estimatedDeliveryText && (
              <div
                className="
                  mt-7
                  rounded-xl
                  bg-white
                  p-5
                  shadow-sm
                "
              >
                <div
                  className="
                    text-xs
                    font-bold
                    uppercase
                    tracking-wide
                    text-gray-400
                  "
                >
                  Delivery Information
                </div>

                <p
                  className="
                    mt-2
                    text-sm
                    leading-6
                    text-gray-700
                  "
                >
                  {
                    settings.estimatedDeliveryText
                  }
                </p>
              </div>
            )}

            {settings.googleMapsUrl && (
              <a
                href={
                  settings.googleMapsUrl
                }
                target="_blank"
                rel="noopener noreferrer"
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  text-sm
                  font-bold
                  text-[var(--primary-color)]
                "
              >
                <MapPin size={17} />
                View on Map
              </a>
            )}
          </div>

          {/* FORM */}

          <div
            className="
              rounded-2xl
              border
              border-gray-100
              bg-white
              p-5
              shadow-sm
              sm:p-7
            "
          >
            <h3
              className="
                text-xl
                font-black
                text-gray-900
              "
            >
              Send a Message
            </h3>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              Fill in the form below
              and contact our store.
            </p>

            <form
              onSubmit={
                handleSubmit
              }
              className="
                mt-6
                grid
                grid-cols-1
                gap-5
                sm:grid-cols-2
              "
            >
              {/* NAME */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={
                    formData.name
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="Your name"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    errors.name
                      ? "border-red-400"
                      : "border-gray-200 focus:border-[var(--primary-color)]"
                  }`}
                />

                {errors.name && (
                  <p
                    className="
                      mt-1
                      text-xs
                      text-red-500
                    "
                  >
                    {errors.name}
                  </p>
                )}
              </div>

              {/* PHONE */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={
                    formData.phone
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="03XXXXXXXXX"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    errors.phone
                      ? "border-red-400"
                      : "border-gray-200 focus:border-[var(--primary-color)]"
                  }`}
                />

                {errors.phone && (
                  <p
                    className="
                      mt-1
                      text-xs
                      text-red-500
                    "
                  >
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* EMAIL */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={
                    formData.email
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="you@example.com"
                  className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition ${
                    errors.email
                      ? "border-red-400"
                      : "border-gray-200 focus:border-[var(--primary-color)]"
                  }`}
                />

                {errors.email && (
                  <p
                    className="
                      mt-1
                      text-xs
                      text-red-500
                    "
                  >
                    {errors.email}
                  </p>
                )}
              </div>

              {/* SUBJECT */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Subject
                </label>

                <input
                  type="text"
                  name="subject"
                  value={
                    formData.subject
                  }
                  onChange={
                    handleChange
                  }
                  placeholder="How can we help?"
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[var(--primary-color)]
                  "
                />
              </div>

              {/* MESSAGE */}

              <div
                className="
                  sm:col-span-2
                "
              >
                <label
                  className="
                    mb-2
                    block
                    text-sm
                    font-semibold
                    text-gray-700
                  "
                >
                  Message *
                </label>

                <textarea
                  name="message"
                  value={
                    formData.message
                  }
                  onChange={
                    handleChange
                  }
                  rows="6"
                  placeholder="Write your message..."
                  className={`w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${
                    errors.message
                      ? "border-red-400"
                      : "border-gray-200 focus:border-[var(--primary-color)]"
                  }`}
                />

                {errors.message && (
                  <p
                    className="
                      mt-1
                      text-xs
                      text-red-500
                    "
                  >
                    {
                      errors.message
                    }
                  </p>
                )}
              </div>

              {/* SUBMIT */}

              <div
                className="
                  sm:col-span-2
                "
              >
                <button
                  type="submit"
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-full
                    bg-[var(--primary-color)]
                    px-7
                    py-3.5
                    text-sm
                    font-bold
                    text-white
                    transition
                    hover:opacity-90
                  "
                >
                  <Send size={17} />

                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;