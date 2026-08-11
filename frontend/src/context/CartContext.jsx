import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useSite } from "./SiteContext";

// ========================================
// CART CONTEXT
// ========================================

const CartContext = createContext(null);

// ========================================
// LOCAL STORAGE KEY
// ========================================

const CART_STORAGE_KEY =
  "page17_general_store_cart";

// ========================================
// HELPER: GET INITIAL CART
// ========================================

const getInitialCart = () => {
  try {
    const savedCart =
      localStorage.getItem(
        CART_STORAGE_KEY
      );

    if (!savedCart) {
      return [];
    }

    const parsed =
      JSON.parse(savedCart);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed;
  } catch (error) {
    console.error(
      "Cart LocalStorage Error:",
      error
    );

    return [];
  }
};

// ========================================
// HELPER: GET PRODUCT SELLING PRICE
// ========================================

const getProductPrice = (
  product,
  variant = null
) => {
  // --------------------------------------
  // VARIANT PRICE
  // --------------------------------------

  if (variant) {
    const regularPrice =
      Number(variant.price) || 0;

    const salePrice =
      variant.salePrice !== null &&
      variant.salePrice !== undefined
        ? Number(variant.salePrice)
        : null;

    if (
      salePrice !== null &&
      salePrice >= 0 &&
      salePrice < regularPrice
    ) {
      return salePrice;
    }

    return regularPrice;
  }

  // --------------------------------------
  // NORMAL PRODUCT PRICE
  // --------------------------------------

  const regularPrice =
    Number(product.price) || 0;

  const salePrice =
    product.salePrice !== null &&
    product.salePrice !== undefined
      ? Number(product.salePrice)
      : null;

  if (
    salePrice !== null &&
    salePrice >= 0 &&
    salePrice < regularPrice
  ) {
    return salePrice;
  }

  return regularPrice;
};

// ========================================
// HELPER: GET AVAILABLE STOCK
// ========================================

const getAvailableStock = (
  product,
  variant = null
) => {
  if (variant) {
    return Number(variant.stock) || 0;
  }

  return Number(product.stock) || 0;
};

// ========================================
// HELPER: BUILD UNIQUE CART KEY
// ========================================

const createCartKey = (
  productId,
  variantId = null
) => {
  return variantId
    ? `${productId}_${variantId}`
    : productId;
};

// ========================================
// PROVIDER
// ========================================

export const CartProvider = ({
  children,
}) => {
  const {
    calculateDeliveryFee,
  } = useSite();

  const [cartItems, setCartItems] =
    useState(getInitialCart);

  const [cartMessage, setCartMessage] =
    useState("");

  // ======================================
  // SAVE CART TO LOCAL STORAGE
  // ======================================

  useEffect(() => {
    try {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cartItems)
      );
    } catch (error) {
      console.error(
        "Cart Save Error:",
        error
      );
    }
  }, [cartItems]);

  // ======================================
  // CLEAR MESSAGE
  // ======================================

  useEffect(() => {
    if (!cartMessage) {
      return;
    }

    const timer = setTimeout(() => {
      setCartMessage("");
    }, 2500);

    return () =>
      clearTimeout(timer);
  }, [cartMessage]);

  // ======================================
  // ADD TO CART
  //
  // addToCart(product, quantity, variant)
  // ======================================

  const addToCart = useCallback(
    (
      product,
      quantity = 1,
      variant = null
    ) => {
      if (!product?._id) {
        return {
          success: false,
          message:
            "Invalid product",
        };
      }

      if (!product.isActive) {
        return {
          success: false,
          message:
            "This product is currently unavailable",
        };
      }

      const requestedQuantity =
        Math.max(
          1,
          Number(quantity) || 1
        );

      // -----------------------------------
      // If product has variants,
      // selected variant must be active
      // -----------------------------------

      if (
        variant &&
        variant.isActive === false
      ) {
        return {
          success: false,
          message:
            "Selected option is unavailable",
        };
      }

      const availableStock =
        getAvailableStock(
          product,
          variant
        );

      // -----------------------------------
      // STOCK CHECK
      // -----------------------------------

      if (
        product.trackInventory &&
        !product.allowBackorder &&
        availableStock <= 0
      ) {
        setCartMessage(
          "Product is out of stock"
        );

        return {
          success: false,
          message:
            "Product is out of stock",
        };
      }

      const variantId =
        variant?._id || null;

      const cartKey =
        createCartKey(
          product._id,
          variantId
        );

      let addedSuccessfully = true;
      let resultMessage =
        "Product added to cart";

      setCartItems(
        (currentItems) => {
          const existingItem =
            currentItems.find(
              (item) =>
                item.cartKey ===
                cartKey
            );

          // -------------------------------
          // PRODUCT ALREADY IN CART
          // -------------------------------

          if (existingItem) {
            let newQuantity =
              existingItem.quantity +
              requestedQuantity;

            if (
              product.trackInventory &&
              !product.allowBackorder &&
              newQuantity >
                availableStock
            ) {
              newQuantity =
                availableStock;

              resultMessage =
                `Only ${availableStock} item(s) available`;
            }

            return currentItems.map(
              (item) =>
                item.cartKey ===
                cartKey
                  ? {
                      ...item,

                      quantity:
                        newQuantity,

                      stock:
                        availableStock,
                    }
                  : item
            );
          }

          // -------------------------------
          // NEW CART ITEM
          // -------------------------------

          let finalQuantity =
            requestedQuantity;

          if (
            product.trackInventory &&
            !product.allowBackorder &&
            finalQuantity >
              availableStock
          ) {
            finalQuantity =
              availableStock;

            resultMessage =
              `Only ${availableStock} item(s) available`;
          }

          if (finalQuantity <= 0) {
            addedSuccessfully =
              false;

            return currentItems;
          }

          const sellingPrice =
            getProductPrice(
              product,
              variant
            );

          const newItem = {
            cartKey,

            productId:
              product._id,

            slug:
              product.slug || "",

            name:
              product.name || "",

            sku:
              variant?.sku ||
              product.sku ||
              "",

            image:
              product.mainImage ||
              "",

            unit:
              product.unit ||
              "piece",

            quantity:
              finalQuantity,

            price:
              sellingPrice,

            regularPrice:
              variant
                ? Number(
                    variant.price
                  ) || 0
                : Number(
                    product.price
                  ) || 0,

            variantId,

            variantName:
              variant?.name || "",

            stock:
              availableStock,

            trackInventory:
              Boolean(
                product.trackInventory
              ),

            allowBackorder:
              Boolean(
                product.allowBackorder
              ),
          };

          return [
            ...currentItems,
            newItem,
          ];
        }
      );

      setCartMessage(
        resultMessage
      );

      return {
        success:
          addedSuccessfully,

        message:
          resultMessage,
      };
    },
    []
  );

  // ======================================
  // REMOVE ITEM
  // ======================================

  const removeFromCart =
    useCallback((cartKey) => {
      setCartItems(
        (currentItems) =>
          currentItems.filter(
            (item) =>
              item.cartKey !==
              cartKey
          )
      );

      setCartMessage(
        "Product removed from cart"
      );
    }, []);

  // ======================================
  // SET ITEM QUANTITY
  // ======================================

  const updateQuantity =
    useCallback(
      (
        cartKey,
        newQuantity
      ) => {
        const quantity =
          Number(newQuantity);

        if (
          !Number.isFinite(
            quantity
          )
        ) {
          return;
        }

        if (quantity <= 0) {
          removeFromCart(
            cartKey
          );

          return;
        }

        setCartItems(
          (currentItems) =>
            currentItems.map(
              (item) => {
                if (
                  item.cartKey !==
                  cartKey
                ) {
                  return item;
                }

                let finalQuantity =
                  Math.max(
                    1,
                    Math.floor(
                      quantity
                    )
                  );

                if (
                  item.trackInventory &&
                  !item.allowBackorder &&
                  finalQuantity >
                    item.stock
                ) {
                  finalQuantity =
                    item.stock;

                  setCartMessage(
                    `Only ${item.stock} item(s) available`
                  );
                }

                return {
                  ...item,
                  quantity:
                    finalQuantity,
                };
              }
            )
        );
      },
      [removeFromCart]
    );

  // ======================================
  // INCREASE QUANTITY
  // ======================================

  const increaseQuantity =
    useCallback(
      (cartKey) => {
        const item =
          cartItems.find(
            (cartItem) =>
              cartItem.cartKey ===
              cartKey
          );

        if (!item) {
          return;
        }

        updateQuantity(
          cartKey,
          item.quantity + 1
        );
      },
      [
        cartItems,
        updateQuantity,
      ]
    );

  // ======================================
  // DECREASE QUANTITY
  // ======================================

  const decreaseQuantity =
    useCallback(
      (cartKey) => {
        const item =
          cartItems.find(
            (cartItem) =>
              cartItem.cartKey ===
              cartKey
          );

        if (!item) {
          return;
        }

        if (
          item.quantity <= 1
        ) {
          removeFromCart(
            cartKey
          );

          return;
        }

        updateQuantity(
          cartKey,
          item.quantity - 1
        );
      },
      [
        cartItems,
        removeFromCart,
        updateQuantity,
      ]
    );

  // ======================================
  // CHECK PRODUCT IN CART
  // ======================================

  const isInCart =
    useCallback(
      (
        productId,
        variantId = null
      ) => {
        const cartKey =
          createCartKey(
            productId,
            variantId
          );

        return cartItems.some(
          (item) =>
            item.cartKey ===
            cartKey
        );
      },
      [cartItems]
    );

  // ======================================
  // GET CART ITEM
  // ======================================

  const getCartItem =
    useCallback(
      (
        productId,
        variantId = null
      ) => {
        const cartKey =
          createCartKey(
            productId,
            variantId
          );

        return (
          cartItems.find(
            (item) =>
              item.cartKey ===
              cartKey
          ) || null
        );
      },
      [cartItems]
    );

  // ======================================
  // CLEAR CART
  // ======================================

  const clearCart =
    useCallback(() => {
      setCartItems([]);

      try {
        localStorage.removeItem(
          CART_STORAGE_KEY
        );
      } catch (error) {
        console.error(
          "Clear Cart Error:",
          error
        );
      }

      setCartMessage(
        "Cart cleared"
      );
    }, []);

  // ======================================
  // CART ITEM COUNT
  //
  // Example:
  // Oil x2 + Milk x3 = 5
  // ======================================

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity
          ),
        0
      ),
    [cartItems]
  );

  // ======================================
  // UNIQUE PRODUCTS COUNT
  // ======================================

  const uniqueItemCount =
    cartItems.length;

  // ======================================
  // CART SUBTOTAL
  // ======================================

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => {
          return (
            total +
            Number(item.price) *
              Number(
                item.quantity
              )
          );
        },
        0
      ),
    [cartItems]
  );

  // ======================================
  // DELIVERY FEE
  // Site Settings controlled
  // ======================================

  const deliveryFee =
    useMemo(
      () =>
        calculateDeliveryFee(
          subtotal
        ),
      [
        subtotal,
        calculateDeliveryFee,
      ]
    );

  // ======================================
  // TOTAL
  // ======================================

  const totalAmount =
    useMemo(
      () =>
        Number(subtotal) +
        Number(deliveryFee),
      [
        subtotal,
        deliveryFee,
      ]
    );

  // ======================================
  // PREPARE CART FOR BACKEND ORDER
  //
  // Backend only needs:
  // product id
  // variant id
  // quantity
  //
  // Price backend خود verify کرے گا
  // ======================================

  const getCheckoutItems =
    useCallback(() => {
      return cartItems.map(
        (item) => ({
          product:
            item.productId,

          ...(item.variantId
            ? {
                variantId:
                  item.variantId,
              }
            : {}),

          quantity:
            item.quantity,
        })
      );
    }, [cartItems]);

  // ======================================
  // CONTEXT VALUE
  // ======================================

  const value = useMemo(
    () => ({
      cartItems,

      cartCount,
      uniqueItemCount,

      subtotal,
      deliveryFee,
      totalAmount,

      cartMessage,

      addToCart,
      removeFromCart,

      updateQuantity,
      increaseQuantity,
      decreaseQuantity,

      clearCart,

      isInCart,
      getCartItem,

      getCheckoutItems,

      isCartEmpty:
        cartItems.length === 0,
    }),
    [
      cartItems,
      cartCount,
      uniqueItemCount,
      subtotal,
      deliveryFee,
      totalAmount,
      cartMessage,

      addToCart,
      removeFromCart,
      updateQuantity,
      increaseQuantity,
      decreaseQuantity,
      clearCart,
      isInCart,
      getCartItem,
      getCheckoutItems,
    ]
  );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
};

// ========================================
// CUSTOM HOOK
// ========================================

export const useCart = () => {
  const context =
    useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
};

export default CartContext;