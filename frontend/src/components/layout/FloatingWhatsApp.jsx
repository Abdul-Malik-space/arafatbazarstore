import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Phone,
  X,
} from "lucide-react";

import {
  useSite,
} from "../../context/SiteContext";

// ========================================
// HELPERS
// ========================================

const FALLBACK_WHATSAPP_NUMBER =
  "03116140666";

const normalizePakistanPhone = (
  value
) => {
  let digits = String(
    value || ""
  ).replace(/\D/g, "");

  if (!digits) {
    digits =
      FALLBACK_WHATSAPP_NUMBER.replace(
        /\D/g,
        ""
      );
  }

  // 0092xxxxxxxxxx -> 92xxxxxxxxxx
  if (
    digits.startsWith(
      "0092"
    )
  ) {
    digits =
      digits.slice(2);
  }

  // Already international.
  if (
    digits.startsWith(
      "92"
    )
  ) {
    return digits;
  }

  // Pakistani local number.
  // 03xxxxxxxxx -> 923xxxxxxxxx
  if (
    digits.startsWith(
      "0"
    )
  ) {
    return `92${digits.slice(
      1
    )}`;
  }

  // 3xxxxxxxxx -> 923xxxxxxxxx
  if (
    digits.startsWith(
      "3"
    )
  ) {
    return `92${digits}`;
  }

  return digits;
};

// ========================================
// WHATSAPP ICON
// ========================================

const WhatsAppIcon = ({
  size = 28,
}) => {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="currentColor"
    >
      <path d="M19.11 17.21c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.62.14-.18.27-.7.89-.86 1.07-.16.18-.32.2-.59.07-.28-.14-1.16-.43-2.21-1.37-.82-.73-1.37-1.63-1.53-1.9-.16-.28-.02-.42.12-.56.13-.12.28-.32.41-.48.14-.16.18-.28.28-.46.09-.18.05-.34-.02-.48-.07-.14-.62-1.49-.85-2.05-.22-.53-.45-.46-.62-.47h-.52c-.18 0-.48.07-.73.34-.25.28-.96.94-.96 2.28s.99 2.64 1.12 2.82c.14.18 1.94 2.96 4.7 4.15.66.28 1.17.45 1.57.58.66.21 1.26.18 1.73.11.53-.08 1.63-.67 1.86-1.31.23-.64.23-1.19.16-1.31-.07-.11-.25-.18-.53-.32Z" />
      <path d="M16.04 3C8.9 3 3.1 8.79 3.1 15.94c0 2.28.59 4.51 1.72 6.47L3 29l6.76-1.77a12.9 12.9 0 0 0 6.27 1.6h.01c7.14 0 12.94-5.79 12.94-12.94C28.98 8.79 23.18 3 16.04 3Zm0 23.65h-.01a10.7 10.7 0 0 1-5.46-1.49l-.39-.23-4.01 1.05 1.07-3.91-.25-.4a10.72 10.72 0 1 1 9.05 4.98Z" />
    </svg>
  );
};

// ========================================
// FLOATING WHATSAPP
// ========================================

const FloatingWhatsApp = () => {
  const {
    settings,
  } = useSite();

  const [isOpen, setIsOpen] =
    useState(false);

  const wrapperRef =
    useRef(null);

  const rawNumber =
    settings?.whatsapp ||
    FALLBACK_WHATSAPP_NUMBER;

  const internationalNumber =
    useMemo(
      () =>
        normalizePakistanPhone(
          rawNumber
        ),
      [rawNumber]
    );

  const displayNumber =
    settings?.whatsapp ||
    FALLBACK_WHATSAPP_NUMBER;

  const storeName =
    settings?.storeName ||
    "our store";

  const whatsappMessage =
    encodeURIComponent(
      `Assalam-o-Alaikum, I need help with a product or order from ${storeName}.`
    );

  const whatsappUrl =
    `https://wa.me/${internationalNumber}?text=${whatsappMessage}`;

  const phoneUrl =
    `tel:+${internationalNumber}`;

  // Close the small contact card when
  // the customer clicks outside it.
  useEffect(() => {
    const handleOutsideClick = (
      event
    ) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick
    );

    document.addEventListener(
      "touchstart",
      handleOutsideClick
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick
      );

      document.removeEventListener(
        "touchstart",
        handleOutsideClick
      );
    };
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="
        fixed
        bottom-5
        right-4
        z-[999]
        sm:bottom-7
        sm:right-6
      "
    >
      {/* =================================
          POPUP CONTACT CARD
      ================================= */}

      <div
        className={`
          absolute
          bottom-[74px]
          right-0
          w-[285px]
          origin-bottom-right
          overflow-hidden
          rounded-2xl
          border
          border-black/5
          bg-white
          shadow-[0_18px_55px_rgba(0,0,0,0.18)]
          transition-all
          duration-200
          ${
            isOpen
              ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
              : "pointer-events-none translate-y-2 scale-95 opacity-0"
          }
        `}
        aria-hidden={
          !isOpen
        }
      >
        <div
          className="
            bg-[#25D366]
            px-5
            py-4
            text-white
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
              <p
                className="
                  text-[15px]
                  font-black
                  leading-tight
                "
              >
                Need help?
              </p>

              <p
                className="
                  mt-1
                  text-[12px]
                  font-medium
                  leading-5
                  text-white/90
                "
              >
                Chat with us on
                WhatsApp or call us
                directly.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsOpen(false)
              }
              className="
                inline-flex
                h-8
                w-8
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-white/15
                text-white
                transition
                hover:bg-white/25
              "
              aria-label="Close contact options"
            >
              <X
                size={17}
              />
            </button>
          </div>
        </div>

        <div
          className="
            p-3
          "
        >
          <a
            href={
              whatsappUrl
            }
            target="_blank"
            rel="noreferrer"
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-[#25D366]/20
              bg-[#25D366]/[0.07]
              px-4
              py-3.5
              text-[#1d1d1d]
              transition
              hover:border-[#25D366]/40
              hover:bg-[#25D366]/[0.12]
            "
          >
            <span
              className="
                inline-flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#25D366]
                text-white
              "
            >
              <WhatsAppIcon
                size={23}
              />
            </span>

            <span
              className="
                min-w-0
                flex-1
              "
            >
              <span
                className="
                  block
                  text-[13px]
                  font-black
                "
              >
                WhatsApp Chat
              </span>

              <span
                className="
                  mt-0.5
                  block
                  truncate
                  text-[11px]
                  font-medium
                  text-[#777]
                "
              >
                {
                  displayNumber
                }
              </span>
            </span>
          </a>

          <a
            href={
              phoneUrl
            }
            className="
              mt-2
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-[#e9e9e9]
              bg-white
              px-4
              py-3.5
              text-[#1d1d1d]
              transition
              hover:border-[#d8d8d8]
              hover:bg-[#fafafa]
            "
          >
            <span
              className="
                inline-flex
                h-10
                w-10
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[#1f2937]
                text-white
              "
            >
              <Phone
                size={19}
              />
            </span>

            <span
              className="
                min-w-0
                flex-1
              "
            >
              <span
                className="
                  block
                  text-[13px]
                  font-black
                "
              >
                Call Now
              </span>

              <span
                className="
                  mt-0.5
                  block
                  truncate
                  text-[11px]
                  font-medium
                  text-[#777]
                "
              >
                {
                  displayNumber
                }
              </span>
            </span>
          </a>
        </div>
      </div>

      {/* =================================
          SMALL DESKTOP LABEL
      ================================= */}

      <div
        className={`
          pointer-events-none
          absolute
          right-[70px]
          top-1/2
          hidden
          -translate-y-1/2
          whitespace-nowrap
          rounded-full
          bg-[#1f2937]
          px-3
          py-2
          text-[11px]
          font-bold
          text-white
          shadow-lg
          transition-all
          sm:block
          ${
            isOpen
              ? "translate-x-2 opacity-0"
              : "translate-x-0 opacity-100"
          }
        `}
      >
        Chat / Call us
      </div>

      {/* =================================
          FLOATING BUTTON
      ================================= */}

      <button
        type="button"
        onClick={() =>
          setIsOpen(
            (current) =>
              !current
          )
        }
        className="
          group
          relative
          inline-flex
          h-[58px]
          w-[58px]
          items-center
          justify-center
          rounded-full
          bg-[#25D366]
          text-white
          shadow-[0_10px_30px_rgba(37,211,102,0.38)]
          transition
          duration-200
          hover:-translate-y-1
          hover:scale-105
          hover:bg-[#20bd5a]
          focus:outline-none
          focus:ring-4
          focus:ring-[#25D366]/25
          sm:h-[62px]
          sm:w-[62px]
        "
        aria-label="Open WhatsApp and call options"
        aria-expanded={
          isOpen
        }
      >
        {/* Animated pulse / popping ring */}
        <span
          className="
            absolute
            inset-0
            -z-10
            animate-ping
            rounded-full
            bg-[#25D366]/35
          "
        />

        <span
          className="
            absolute
            inset-[-5px]
            -z-10
            rounded-full
            border
            border-[#25D366]/30
          "
        />

        <WhatsAppIcon
          size={31}
        />
      </button>
    </div>
  );
};

export default FloatingWhatsApp;
