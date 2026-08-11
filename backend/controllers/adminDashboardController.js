const Product = require("../models/Product");
const Category = require("../models/Category");
const Order = require("../models/Order");

// ========================================
// CONFIGURATION
// ========================================

const LOW_STOCK_LIMIT = 5;

// ========================================
// SAFE NUMBER
// ========================================

const safeNumber = (value) => {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
};

// ========================================
// SAFE STRING
// ========================================

const safeString = (value) => {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
};

// ========================================
// CUSTOMER NAME
//
// Order schema میں customer کی structure
// مختلف ہونے کی صورت میں بھی dashboard
// crash نہیں کرے گا.
// ========================================

const getCustomerName = (order) => {
  return (
    order?.customer?.name ||
    order?.customerName ||
    order?.shippingAddress?.name ||
    order?.billingAddress?.name ||
    "Customer"
  );
};

// ========================================
// CUSTOMER PHONE
// ========================================

const getCustomerPhone = (order) => {
  return (
    order?.customer?.phone ||
    order?.customerPhone ||
    order?.shippingAddress?.phone ||
    order?.billingAddress?.phone ||
    ""
  );
};

// ========================================
// NORMALIZE RECENT ORDER
// ========================================

const normalizeRecentOrder = (
  order
) => {
  return {
    _id:
      order?._id || null,

    orderNumber:
      order?.orderNumber ||
      order?.orderNo ||
      "",

    customerName:
      getCustomerName(order),

    customerPhone:
      getCustomerPhone(order),

    totalAmount:
      safeNumber(
        order?.totalAmount
      ),

    subtotal:
      safeNumber(
        order?.subtotal
      ),

    deliveryFee:
      safeNumber(
        order?.deliveryFee
      ),

    discount:
      safeNumber(
        order?.discount
      ),

    orderStatus:
      safeString(
        order?.orderStatus ||
          "pending"
      ).toLowerCase(),

    paymentMethod:
      safeString(
        order?.paymentMethod
      ),

    paymentStatus:
      safeString(
        order?.paymentStatus
      ),

    createdAt:
      order?.createdAt ||
      null,
  };
};

// ========================================
// NORMALIZE LOW STOCK PRODUCT
// ========================================

const normalizeLowStockProduct = (
  product
) => {
  return {
    _id:
      product?._id || null,

    name:
      product?.name || "",

    slug:
      product?.slug || "",

    sku:
      product?.sku || "",

    stock:
      safeNumber(
        product?.stock
      ),

    price:
      safeNumber(
        product?.price
      ),

    salePrice:
      safeNumber(
        product?.salePrice
      ),

    mainImage:
      product?.mainImage || "",
  };
};

// ========================================
// GET ADMIN DASHBOARD OVERVIEW
//
// GET /api/admin/dashboard
// ========================================

const getAdminDashboardOverview =
  async (req, res) => {
    try {
      // ==================================
      // BASIC COUNTS
      // ==================================

      const [
        totalProducts,
        totalCategories,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        lowStockCount,
        outOfStockCount,
      ] = await Promise.all([
        Product.countDocuments(),

        Category.countDocuments(),

        Order.countDocuments(),

        Order.countDocuments({
          orderStatus: "pending",
        }),

        Order.countDocuments({
          orderStatus: "confirmed",
        }),

        Order.countDocuments({
          orderStatus: "processing",
        }),

        Order.countDocuments({
          orderStatus: "shipped",
        }),

        Order.countDocuments({
          orderStatus: "delivered",
        }),

        Order.countDocuments({
          orderStatus: "cancelled",
        }),

        Product.countDocuments({
          stock: {
            $gt: 0,
            $lte:
              LOW_STOCK_LIMIT,
          },
        }),

        Product.countDocuments({
          stock: {
            $lte: 0,
          },
        }),
      ]);

      // ==================================
      // REVENUE
      //
      // Cancelled orders کو revenue میں
      // شامل نہیں کیا جا رہا.
      // ==================================

      const revenueResult =
        await Order.aggregate([
          {
            $match: {
              orderStatus: {
                $ne: "cancelled",
              },
            },
          },

          {
            $group: {
              _id: null,

              totalRevenue: {
                $sum: {
                  $ifNull: [
                    "$totalAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]);

      const totalRevenue =
        safeNumber(
          revenueResult?.[0]
            ?.totalRevenue
        );

      // ==================================
      // DELIVERED REVENUE
      // ==================================

      const deliveredRevenueResult =
        await Order.aggregate([
          {
            $match: {
              orderStatus:
                "delivered",
            },
          },

          {
            $group: {
              _id: null,

              deliveredRevenue: {
                $sum: {
                  $ifNull: [
                    "$totalAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]);

      const deliveredRevenue =
        safeNumber(
          deliveredRevenueResult?.[0]
            ?.deliveredRevenue
        );

      // ==================================
      // TODAY
      // ==================================

      const now =
        new Date();

      const todayStart =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );

      const tomorrowStart =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate() + 1
        );

      // ==================================
      // TODAY ORDERS
      // ==================================

      const todayOrders =
        await Order.countDocuments({
          createdAt: {
            $gte: todayStart,
            $lt: tomorrowStart,
          },
        });

      // ==================================
      // TODAY REVENUE
      // ==================================

      const todayRevenueResult =
        await Order.aggregate([
          {
            $match: {
              createdAt: {
                $gte: todayStart,
                $lt: tomorrowStart,
              },

              orderStatus: {
                $ne: "cancelled",
              },
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: {
                  $ifNull: [
                    "$totalAmount",
                    0,
                  ],
                },
              },
            },
          },
        ]);

      const todayRevenue =
        safeNumber(
          todayRevenueResult?.[0]
            ?.total
        );

      // ==================================
      // RECENT ORDERS
      // ==================================

      const recentOrdersRaw =
        await Order.find()
          .sort({
            createdAt: -1,
          })
          .limit(6)
          .lean();

      const recentOrders =
        recentOrdersRaw.map(
          normalizeRecentOrder
        );

      // ==================================
      // LOW STOCK PRODUCTS
      // ==================================

      const lowStockProductsRaw =
        await Product.find({
          stock: {
            $lte:
              LOW_STOCK_LIMIT,
          },
        })
          .sort({
            stock: 1,
            createdAt: -1,
          })
          .limit(6)
          .lean();

      const lowStockProducts =
        lowStockProductsRaw.map(
          normalizeLowStockProduct
        );

      // ==================================
      // ORDER STATUS BREAKDOWN
      // ==================================

      const orderStatusBreakdown = {
        pending:
          pendingOrders,

        confirmed:
          confirmedOrders,

        processing:
          processingOrders,

        shipped:
          shippedOrders,

        delivered:
          deliveredOrders,

        cancelled:
          cancelledOrders,
      };

      // ==================================
      // RESPONSE
      // ==================================

      return res
        .status(200)
        .json({
          success: true,

          dashboard: {
            // =============================
            // SUMMARY
            // =============================

            summary: {
              totalProducts,
              totalCategories,
              totalOrders,

              totalRevenue,
              deliveredRevenue,

              todayOrders,
              todayRevenue,

              lowStockCount,
              outOfStockCount,
            },

            // =============================
            // ORDER STATUS
            // =============================

            orderStatus:
              orderStatusBreakdown,

            // =============================
            // RECENT ORDERS
            // =============================

            recentOrders,

            // =============================
            // STOCK ALERTS
            // =============================

            lowStockProducts,

            // =============================
            // SETTINGS
            // =============================

            meta: {
              lowStockLimit:
                LOW_STOCK_LIMIT,

              generatedAt:
                new Date(),
            },
          },
        });
    } catch (error) {
      console.error(
        "Admin Dashboard Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load administrator dashboard.",

          ...(process.env
            .NODE_ENV ===
          "development"
            ? {
                error:
                  error.message,
              }
            : {}),
        });
    }
  };

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getAdminDashboardOverview,
};