import { Outlet } from "react-router-dom";

import Header from "./Header";
import Footer from "./Footer";
import FloatingWhatsApp from "./FloatingWhatsApp";

import { useCart } from "../../context/CartContext";

// ========================================
// MAIN WEBSITE LAYOUT
// ========================================

const MainLayout = () => {
  const { cartMessage } = useCart();

  return (
    <div
      className="
        flex
        min-h-screen
        flex-col
        bg-white
        text-gray-800
      "
    >
      {/* =================================
          HEADER
      ================================= */}

      <Header />

      {/* =================================
          PAGE CONTENT
      ================================= */}

      <main className="flex-1">
        <Outlet />
      </main>

      {/* =================================
          FOOTER
      ================================= */}

      <Footer />

      {/* =================================
          FLOATING WHATSAPP / CALL
      ================================= */}

      <FloatingWhatsApp />

      {/* =================================
          CART MESSAGE / TOAST

          Mobile:
          Toast stays above WhatsApp button.

          Desktop:
          Toast stays to the left of the
          WhatsApp button so both remain
          visible at the same time.
      ================================= */}

      {cartMessage && (
        <div
          className="
            fixed
            bottom-24
            right-4
            z-[998]
            max-w-[calc(100vw-2rem)]
            rounded-xl
            bg-[#222]
            px-5
            py-3.5
            text-sm
            font-medium
            text-white
            shadow-2xl
            sm:bottom-6
            sm:right-24
            sm:max-w-[320px]
          "
        >
          <div className="flex items-center gap-3">
            <span
              className="
                flex
                h-6
                w-6
                shrink-0
                items-center
                justify-center
                rounded-full
                bg-[var(--primary-color)]
                text-xs
                font-bold
              "
            >
              ✓
            </span>

            <span>{cartMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainLayout;
