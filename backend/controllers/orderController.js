const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

// ========================================
// HELPERS
// ========================================

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const getSellingPrice = (price, salePrice) => {
  if (
    salePrice !== null &&
    salePrice !== undefined &&
    Number(salePrice) >= 0 &&
    Number(salePrice) < Number(price)
  ) {
    return Number(salePrice);
  }

  return Number(price);
};

const getVariantById = (product, variantId) => {
  if (!variantId || !product?.variants?.id) {
    return null;
  }

  return product.variants.id(variantId);
};

const buildOrderSummary = async () => {
  const [result] = await Order.aggregate([
    {
      $facet: {
        totalOrders: [{ $count: "count" }],
        statusCounts: [
          {
            $group: {
              _id: "$orderStatus",
              count: { $sum: 1 },
            },
          },
        ],
        totalOrderValue: [
          {
            $match: {
              orderStatus: { $ne: "cancelled" },
            },
          },
          {
            $group: {
              _id: null,
              value: { $sum: "$totalAmount" },
            },
          },
        ],
        deliveredRevenue: [
          {
            $match: {
              orderStatus: "delivered",
            },
          },
          {
            $group: {
              _id: null,
              value: { $sum: "$totalAmount" },
            },
          },
        ],
      },
    },
  ]);

  const summary = {
    totalOrders: result?.totalOrders?.[0]?.count || 0,
    pending: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    totalOrderValue: result?.totalOrderValue?.[0]?.value || 0,
    deliveredRevenue: result?.deliveredRevenue?.[0]?.value || 0,
  };

  for (const row of result?.statusCounts || []) {
    if (Object.prototype.hasOwnProperty.call(summary, row._id)) {
      summary[row._id] = row.count;
    }
  }

  return summary;
};

// ========================================
// CREATE ORDER
// POST /api/orders
// Public checkout route
// ========================================

const createOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const {
      customer,
      shippingAddress,
      items,
      paymentMethod = "cod",
      customerNote = "",
    } = req.body;

    if (!customer?.firstName || !customer?.phone) {
      return res.status(400).json({
        success: false,
        message: "Customer name and phone number are required",
      });
    }

    if (!shippingAddress?.address || !shippingAddress?.city) {
      return res.status(400).json({
        success: false,
        message: "Complete delivery address is required",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart must contain at least one product",
      });
    }

    let createdOrder = null;

    await session.withTransaction(async () => {
      const orderItems = [];
      let subtotal = 0;

      for (const cartItem of items) {
        if (!cartItem.product || !isValidObjectId(cartItem.product)) {
          throw new Error("Invalid product in cart");
        }

        const quantity = Number(cartItem.quantity);

        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new Error("Product quantity must be at least 1");
        }

        const product = await Product.findById(cartItem.product).session(session);

        if (!product) {
          throw new Error("One of the products no longer exists");
        }

        if (!product.isActive) {
          throw new Error(`${product.name} is currently unavailable`);
        }

        let variant = null;
        let unitPrice = 0;
        let availableStock = 0;
        let variantName = "";
        let variantId = null;

        if (cartItem.variantId) {
          if (!isValidObjectId(cartItem.variantId)) {
            throw new Error(`Invalid variant selected for ${product.name}`);
          }

          variant = getVariantById(product, cartItem.variantId);

          if (!variant) {
            throw new Error(`Selected variant for ${product.name} was not found`);
          }

          if (!variant.isActive) {
            throw new Error(`Selected variant of ${product.name} is unavailable`);
          }

          unitPrice = getSellingPrice(variant.price, variant.salePrice);
          availableStock = Number(variant.stock) || 0;
          variantName = variant.name || "";
          variantId = variant._id;
        } else {
          unitPrice = getSellingPrice(product.price, product.salePrice);
          availableStock = Number(product.stock) || 0;
        }

        if (
          product.trackInventory &&
          availableStock < quantity &&
          !product.allowBackorder
        ) {
          throw new Error(
            `${product.name} has only ${availableStock} item(s) available`
          );
        }

        const itemSubtotal = unitPrice * quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          product: product._id,
          name: product.name,
          sku: variant?.sku || product.sku || "",
          image: product.mainImage || "",
          variantId,
          variantName,
          unit: product.unit || "piece",
          quantity,
          unitPrice,
          subtotal: itemSubtotal,
        });

        if (product.trackInventory) {
          if (variant) {
            variant.stock = Math.max(Number(variant.stock) - quantity, 0);
          } else {
            product.stock = Math.max(Number(product.stock) - quantity, 0);
          }

          await product.save({ session });
        }
      }

      const deliveryFee = Number(process.env.DEFAULT_DELIVERY_FEE || 0);
      const discount = 0;
      const totalAmount = Math.max(subtotal + deliveryFee - discount, 0);

      const orders = await Order.create(
        [
          {
            customer: {
              firstName: customer.firstName.trim(),
              lastName: customer.lastName || "",
              phone: customer.phone.trim(),
              alternatePhone: customer.alternatePhone || "",
              email: customer.email || "",
            },
            shippingAddress: {
              address: shippingAddress.address,
              area: shippingAddress.area || "",
              city: shippingAddress.city,
              province: shippingAddress.province || "",
              postalCode: shippingAddress.postalCode || "",
              country: shippingAddress.country || "Pakistan",
              landmark: shippingAddress.landmark || "",
            },
            items: orderItems,
            subtotal,
            deliveryFee,
            discount,
            totalAmount,
            paymentMethod,
            paymentStatus: "pending",
            orderStatus: "pending",
            customerNote,
            source: "website",
          },
        ],
        { session }
      );

      createdOrder = orders[0];
    });

    await createdOrder.populate(
      "items.product",
      "name slug mainImage sku"
    );

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: createdOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to place order",
    });
  } finally {
    await session.endSession();
  }
};

// ========================================
// GET ALL ORDERS
// GET /api/orders
// Admin only (protected in routes)
// ========================================

const getOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      paymentStatus,
      paymentMethod,
      search,
      sort = "newest",
    } = req.query;

    const query = {};

    if (status && status !== "all") {
      query.orderStatus = status;
    }

    if (paymentStatus && paymentStatus !== "all") {
      query.paymentStatus = paymentStatus;
    }

    if (paymentMethod && paymentMethod !== "all") {
      query.paymentMethod = paymentMethod;
    }

    if (search?.trim()) {
      const searchText = search.trim();

      query.$or = [
        { orderNumber: { $regex: searchText, $options: "i" } },
        { "customer.firstName": { $regex: searchText, $options: "i" } },
        { "customer.lastName": { $regex: searchText, $options: "i" } },
        { "customer.phone": { $regex: searchText, $options: "i" } },
        { "customer.email": { $regex: searchText, $options: "i" } },
      ];
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const skip = (currentPage - 1) * pageLimit;

    let sortOptions = { createdAt: -1 };

    if (sort === "oldest") sortOptions = { createdAt: 1 };
    if (sort === "amount-high") sortOptions = { totalAmount: -1 };
    if (sort === "amount-low") sortOptions = { totalAmount: 1 };

    const [total, orders, summary] = await Promise.all([
      Order.countDocuments(query),
      Order.find(query)
        .populate("items.product", "name slug mainImage sku")
        .sort(sortOptions)
        .skip(skip)
        .limit(pageLimit),
      buildOrderSummary(),
    ]);

    return res.status(200).json({
      success: true,
      count: orders.length,
      total,
      page: currentPage,
      pages: Math.max(Math.ceil(total / pageLimit), 1),
      summary,
      orders,
    });
  } catch (error) {
    console.error("Get Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

// ========================================
// GET SINGLE ORDER BY ID
// GET /api/orders/:id
// Admin only
// ========================================

const getOrderById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const order = await Order.findById(req.params.id).populate(
      "items.product",
      "name slug mainImage sku"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

// ========================================
// TRACK ORDER BY NUMBER
// GET /api/orders/track/:orderNumber
// Public route
// ========================================

const getOrderByNumber = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderNumber: req.params.orderNumber,
    }).populate(
      "items.product",
      "name slug mainImage"
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      order: {
        orderNumber: order.orderNumber,
        customer: {
          firstName: order.customer.firstName,
        },
        items: order.items,
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        discount: order.discount,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
        courierName: order.courierName,
        trackingNumber: order.trackingNumber,
        createdAt: order.createdAt,
        shippedAt: order.shippedAt,
        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error) {
    console.error("Track Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to track order",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
// Admin only
// ========================================

const updateOrderStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const {
      orderStatus,
      courierName,
      trackingNumber,
      adminNote,
    } = req.body;

    const allowedStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];

    if (!allowedStatuses.includes(orderStatus)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid order status. Use the cancel endpoint for cancelled orders.",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.orderStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cancelled order cannot be reopened",
      });
    }

    if (
      order.orderStatus === "delivered" &&
      orderStatus !== "delivered"
    ) {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be moved back to another status",
      });
    }

    order.orderStatus = orderStatus;

    if (courierName !== undefined) {
      order.courierName = String(courierName || "").trim();
    }

    if (trackingNumber !== undefined) {
      order.trackingNumber = String(trackingNumber || "").trim();
    }

    if (adminNote !== undefined) {
      order.adminNote = String(adminNote || "").trim();
    }

    if (orderStatus === "shipped") {
      order.shippedAt = order.shippedAt || new Date();
    }

    if (orderStatus === "delivered") {
      order.shippedAt = order.shippedAt || new Date();
      order.deliveredAt = order.deliveredAt || new Date();

      if (
        order.paymentMethod === "cod" &&
        order.paymentStatus !== "paid"
      ) {
        order.paymentStatus = "paid";
        order.paidAt = new Date();
      }
    }

    await order.save();

    await order.populate(
      "items.product",
      "name slug mainImage sku"
    );

    return res.status(200).json({
      success: true,
      message:
        orderStatus === "shipped"
          ? "Order dispatched successfully"
          : orderStatus === "delivered"
          ? "Order marked as delivered"
          : "Order status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Order Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE PAYMENT STATUS
// PATCH /api/orders/:id/payment
// Admin only
// ========================================

const updatePaymentStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    const {
      paymentStatus,
      paymentReference,
    } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "failed",
      "refunded",
    ];

    if (!allowedStatuses.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.paymentStatus = paymentStatus;

    if (paymentReference !== undefined) {
      order.paymentReference = String(paymentReference || "").trim();
    }

    order.paidAt =
      paymentStatus === "paid"
        ? order.paidAt || new Date()
        : null;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment status updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update Payment Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment status",
      error: error.message,
    });
  }
};

// ========================================
// CANCEL ORDER + RESTORE STOCK
// PATCH /api/orders/:id/cancel
// Admin only
// ========================================

const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order ID",
      });
    }

    let updatedOrder = null;

    await session.withTransaction(async () => {
      const order = await Order.findById(req.params.id).session(session);

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.orderStatus === "cancelled") {
        throw new Error("Order is already cancelled");
      }

      if (order.orderStatus === "delivered") {
        throw new Error("Delivered order cannot be cancelled");
      }

      if (!order.stockRestored) {
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);

          if (!product || !product.trackInventory) {
            continue;
          }

          if (item.variantId) {
            const variant = getVariantById(product, item.variantId);

            if (variant) {
              variant.stock =
                Number(variant.stock || 0) +
                Number(item.quantity || 0);
            }
          } else {
            product.stock =
              Number(product.stock || 0) +
              Number(item.quantity || 0);
          }

          await product.save({ session });
        }

        order.stockRestored = true;
      }

      order.orderStatus = "cancelled";
      order.cancelledAt = new Date();
      order.cancellationReason =
        String(req.body.cancellationReason || "Cancelled by admin").trim();

      updatedOrder = await order.save({ session });
    });

    return res.status(200).json({
      success: true,
      message: "Order cancelled and stock restored successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    const statusCode =
      error.message === "Order not found" ? 404 : 400;

    return res.status(statusCode).json({
      success: false,
      message: error.message || "Failed to cancel order",
    });
  } finally {
    await session.endSession();
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
};
