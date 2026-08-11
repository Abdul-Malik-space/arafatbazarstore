import { Link } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from "lucide-react";

import {
  useCart,
} from "../context/CartContext";

import {
  useSite,
} from "../context/SiteContext";

import {
  getImageUrl,
} from "../services/api";

// ========================================
// CART PAGE
// VEGIST INDEX17 STYLE
// ========================================

const CartPage = () => {
  const {
    cartItems,
    cartCount,

    subtotal,
    deliveryFee,
    totalAmount,

    increaseQuantity,
    decreaseQuantity,
    updateQuantity,
    removeFromCart,
    clearCart,

    isCartEmpty,
  } = useCart();

  const {
    settings,
    formatPrice,
  } = useSite();

  // ======================================
  // FREE DELIVERY
  // ======================================

  const freeDeliveryMinimum =
    Number(
      settings.freeDeliveryMinimum
    ) || 0;

  const amountRemaining =
    Math.max(
      freeDeliveryMinimum -
        Number(subtotal),
      0
    );

  const freeDeliveryUnlocked =
    settings.freeDeliveryEnabled &&
    freeDeliveryMinimum > 0 &&
    Number(subtotal) >=
      freeDeliveryMinimum;

  // ======================================
  // EMPTY CART
  // ======================================

  if (isCartEmpty) {
    return (
      <div className="bg-white">
        {/* PAGE TITLE */}

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
              Shopping cart
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

              <span className="text-[#333]">
                Shopping cart
              </span>
            </div>
          </div>
        </section>

        {/* EMPTY */}

        <section
          className="
            flex
            min-h-[520px]
            items-center
            justify-center
            px-5
            py-16
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

            <h2
              className="
                mt-6
                text-[27px]
                font-black
                text-[#222]
              "
            >
              Your cart is empty
            </h2>

            <p
              className="
                mt-2
                text-[13px]
                text-[#777]
              "
            >
              Add some products to
              your cart and continue
              shopping.
            </p>

            <Link
              to="/shop"
              className="
                mt-7
                inline-flex
                items-center
                gap-3
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
              Shop now

              <ArrowRight
                size={15}
              />
            </Link>
          </div>
        </section>
      </div>
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
            Shopping cart
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

            <span className="text-[#333]">
              Shopping cart
            </span>
          </div>
        </div>
      </section>

      {/* =================================
          CART CONTENT
      ================================= */}

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
            lg:grid-cols-[1fr_360px]
          "
        >
          {/* =================================
              LEFT
          ================================= */}

          <div>
            {/* CART HEADER */}

            <div
              className="
                mb-5
                flex
                flex-wrap
                items-center
                justify-between
                gap-4
              "
            >
              <div>
                <h2
                  className="
                    text-[20px]
                    font-black
                    text-[#222]
                  "
                >
                  Your products
                </h2>

                <p
                  className="
                    mt-1
                    text-[12px]
                    text-[#777]
                  "
                >
                  {cartCount} item
                  {cartCount !== 1
                    ? "s"
                    : ""}{" "}
                  in your cart
                </p>
              </div>

              <button
                type="button"
                onClick={clearCart}
                className="
                  flex
                  items-center
                  gap-2
                  text-[12px]
                  font-semibold
                  text-red-500
                  transition
                  hover:text-red-600
                "
              >
                <Trash2
                  size={15}
                />

                Clear cart
              </button>
            </div>

            {/* =================================
                DESKTOP CART TABLE
            ================================= */}

            <div
              className="
                hidden
                overflow-hidden
                border
                border-[#eeeeee]
                md:block
              "
            >
              {/* TABLE HEAD */}

              <div
                className="
                  grid
                  grid-cols-[1fr_120px_150px_120px_45px]
                  items-center
                  gap-4
                  bg-[#fafafa]
                  px-5
                  py-4
                  text-[11px]
                  font-bold
                  uppercase
                  text-[#555]
                "
              >
                <div>
                  Product
                </div>

                <div className="text-center">
                  Price
                </div>

                <div className="text-center">
                  Quantity
                </div>

                <div className="text-right">
                  Total
                </div>

                <div />
              </div>

              {/* ITEMS */}

              {cartItems.map(
                (item) => {
                  const imageUrl =
                    item.image
                      ? getImageUrl(
                          item.image
                        )
                      : "";

                  const lineTotal =
                    Number(
                      item.price
                    ) *
                    Number(
                      item.quantity
                    );

                  const regularPrice =
                    Number(
                      item.regularPrice
                    ) || 0;

                  const hasDiscount =
                    regularPrice >
                    Number(
                      item.price
                    );

                  return (
                    <div
                      key={
                        item.cartKey
                      }
                      className="
                        grid
                        grid-cols-[1fr_120px_150px_120px_45px]
                        items-center
                        gap-4
                        border-t
                        border-[#eeeeee]
                        px-5
                        py-5
                      "
                    >
                      {/* PRODUCT */}

                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-4
                        "
                      >
                        <Link
                          to={
                            item.slug
                              ? `/product/${item.slug}`
                              : "/shop"
                          }
                          className="
                            flex
                            h-[85px]
                            w-[85px]
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-[14px]
                            bg-[#f7f7f7]
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
                                p-2
                              "
                            />
                          ) : (
                            <Package
                              size={30}
                              className="
                                text-gray-300
                              "
                            />
                          )}
                        </Link>

                        <div className="min-w-0">
                          <Link
                            to={
                              item.slug
                                ? `/product/${item.slug}`
                                : "/shop"
                            }
                            className="
                              line-clamp-2
                              text-[14px]
                              font-bold
                              leading-6
                              text-[#222]
                              transition
                              hover:text-[var(--primary-color)]
                            "
                          >
                            {
                              item.name
                            }
                          </Link>

                          {item.variantName && (
                            <div
                              className="
                                mt-1
                                text-[11px]
                                text-[#888]
                              "
                            >
                              {
                                item.variantName
                              }
                            </div>
                          )}

                          {item.sku && (
                            <div
                              className="
                                mt-1
                                text-[10px]
                                text-[#aaa]
                              "
                            >
                              SKU:{" "}
                              {
                                item.sku
                              }
                            </div>
                          )}
                        </div>
                      </div>

                      {/* PRICE */}

                      <div className="text-center">
                        <div
                          className="
                            text-[14px]
                            font-bold
                            text-[var(--primary-color)]
                          "
                        >
                          {formatPrice(
                            item.price
                          )}
                        </div>

                        {hasDiscount && (
                          <div
                            className="
                              mt-1
                              text-[11px]
                              text-[#aaa]
                              line-through
                            "
                          >
                            {formatPrice(
                              regularPrice
                            )}
                          </div>
                        )}
                      </div>

                      {/* QUANTITY */}

                      <div
                        className="
                          mx-auto
                          flex
                          h-[44px]
                          w-[130px]
                          overflow-hidden
                          rounded-[24px]
                          border
                          border-[#dddddd]
                        "
                      >
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(
                              item.cartKey
                            )
                          }
                          className="
                            flex
                            w-10
                            items-center
                            justify-center
                            text-[#555]
                          "
                        >
                          <Minus
                            size={14}
                          />
                        </button>

                        <input
                          type="number"
                          min="1"
                          value={
                            item.quantity
                          }
                          onChange={(
                            event
                          ) =>
                            updateQuantity(
                              item.cartKey,
                              event
                                .target
                                .value
                            )
                          }
                          className="
                            min-w-0
                            flex-1
                            border-x
                            border-[#eeeeee]
                            text-center
                            text-[12px]
                            font-bold
                            outline-none
                          "
                        />

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(
                              item.cartKey
                            )
                          }
                          disabled={
                            item.trackInventory &&
                            !item.allowBackorder &&
                            item.quantity >=
                              item.stock
                          }
                          className="
                            flex
                            w-10
                            items-center
                            justify-center
                            text-[#555]
                            disabled:opacity-30
                          "
                        >
                          <Plus
                            size={14}
                          />
                        </button>
                      </div>

                      {/* TOTAL */}

                      <div
                        className="
                          text-right
                          text-[14px]
                          font-black
                          text-[#222]
                        "
                      >
                        {formatPrice(
                          lineTotal
                        )}
                      </div>

                      {/* REMOVE */}

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(
                            item.cartKey
                          )
                        }
                        className="
                          flex
                          h-9
                          w-9
                          items-center
                          justify-center
                          rounded-full
                          text-[#aaa]
                          transition
                          hover:bg-red-50
                          hover:text-red-500
                        "
                      >
                        <Trash2
                          size={16}
                        />
                      </button>
                    </div>
                  );
                }
              )}
            </div>

            {/* =================================
                MOBILE CART
            ================================= */}

            <div
              className="
                space-y-4
                md:hidden
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

                  const lineTotal =
                    Number(
                      item.price
                    ) *
                    Number(
                      item.quantity
                    );

                  return (
                    <div
                      key={
                        item.cartKey
                      }
                      className="
                        border
                        border-[#eeeeee]
                        p-4
                      "
                    >
                      <div
                        className="
                          flex
                          gap-4
                        "
                      >
                        <Link
                          to={
                            item.slug
                              ? `/product/${item.slug}`
                              : "/shop"
                          }
                          className="
                            flex
                            h-[90px]
                            w-[90px]
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-[14px]
                            bg-[#f7f7f7]
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
                                p-2
                              "
                            />
                          ) : (
                            <Package
                              size={28}
                              className="
                                text-gray-300
                              "
                            />
                          )}
                        </Link>

                        <div
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <div
                            className="
                              flex
                              items-start
                              justify-between
                              gap-2
                            "
                          >
                            <Link
                              to={
                                item.slug
                                  ? `/product/${item.slug}`
                                  : "/shop"
                              }
                              className="
                                text-[14px]
                                font-bold
                                leading-6
                                text-[#222]
                              "
                            >
                              {
                                item.name
                              }
                            </Link>

                            <button
                              type="button"
                              onClick={() =>
                                removeFromCart(
                                  item.cartKey
                                )
                              }
                              className="
                                text-[#aaa]
                              "
                            >
                              <Trash2
                                size={16}
                              />
                            </button>
                          </div>

                          <div
                            className="
                              mt-2
                              text-[14px]
                              font-bold
                              text-[var(--primary-color)]
                            "
                          >
                            {formatPrice(
                              item.price
                            )}
                          </div>
                        </div>
                      </div>

                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-between
                          gap-4
                        "
                      >
                        <div
                          className="
                            flex
                            h-[42px]
                            w-[125px]
                            overflow-hidden
                            rounded-full
                            border
                            border-[#dddddd]
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              decreaseQuantity(
                                item.cartKey
                              )
                            }
                            className="
                              flex
                              w-10
                              items-center
                              justify-center
                            "
                          >
                            <Minus
                              size={14}
                            />
                          </button>

                          <input
                            type="number"
                            min="1"
                            value={
                              item.quantity
                            }
                            onChange={(
                              event
                            ) =>
                              updateQuantity(
                                item.cartKey,
                                event
                                  .target
                                  .value
                              )
                            }
                            className="
                              min-w-0
                              flex-1
                              border-x
                              border-[#eeeeee]
                              text-center
                              text-[12px]
                              font-bold
                              outline-none
                            "
                          />

                          <button
                            type="button"
                            onClick={() =>
                              increaseQuantity(
                                item.cartKey
                              )
                            }
                            className="
                              flex
                              w-10
                              items-center
                              justify-center
                            "
                          >
                            <Plus
                              size={14}
                            />
                          </button>
                        </div>

                        <strong
                          className="
                            text-[15px]
                            text-[#222]
                          "
                        >
                          {formatPrice(
                            lineTotal
                          )}
                        </strong>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {/* CONTINUE */}

            <Link
              to="/shop"
              className="
                mt-6
                inline-flex
                items-center
                gap-2
                text-[12px]
                font-bold
                uppercase
                text-[#333]
                transition
                hover:text-[var(--primary-color)]
              "
            >
              <ArrowLeft
                size={15}
              />

              Continue shopping
            </Link>
          </div>

          {/* =================================
              ORDER SUMMARY
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
              Order summary
            </h2>

            <div
              className="
                mt-3
                h-[2px]
                w-12
                bg-[var(--primary-color)]
              "
            />

            {/* FREE DELIVERY */}

            {settings.freeDeliveryEnabled &&
              freeDeliveryMinimum >
                0 && (
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
                      size={19}
                      className="
                        mt-0.5
                        shrink-0
                        text-[var(--primary-color)]
                      "
                    />

                    <div className="flex-1">
                      {freeDeliveryUnlocked ? (
                        <>
                          <div
                            className="
                              text-[12px]
                              font-bold
                              text-[var(--primary-color)]
                            "
                          >
                            Free delivery
                            unlocked
                          </div>

                          <p
                            className="
                              mt-1
                              text-[11px]
                              leading-5
                              text-[#777]
                            "
                          >
                            Your order
                            qualifies for
                            free delivery.
                          </p>
                        </>
                      ) : (
                        <>
                          <div
                            className="
                              text-[12px]
                              font-semibold
                              text-[#444]
                            "
                          >
                            Add{" "}
                            <strong
                              className="
                                text-[var(--primary-color)]
                              "
                            >
                              {formatPrice(
                                amountRemaining
                              )}
                            </strong>{" "}
                            for free
                            delivery
                          </div>

                          <div
                            className="
                              mt-3
                              h-[6px]
                              overflow-hidden
                              rounded-full
                              bg-[#eeeeee]
                            "
                          >
                            <div
                              className="
                                h-full
                                bg-[var(--primary-color)]
                              "
                              style={{
                                width: `${Math.min(
                                  (Number(
                                    subtotal
                                  ) /
                                    freeDeliveryMinimum) *
                                    100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

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
                  gap-4
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
                  gap-4
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

            {/* CHECKOUT */}

            <Link
              to="/checkout"
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
              "
            >
              Proceed to checkout

              <ArrowRight
                size={15}
              />
            </Link>

            <div
              className="
                mt-5
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
                  "Delivery information will be shown here."}
              </span>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
};

export default CartPage;