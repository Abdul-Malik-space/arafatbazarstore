const express = require("express");

const {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByNumber,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder,
} = require("../controllers/orderController");

const {
  protectAdmin,
  requireAnyAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

// ========================================
// PUBLIC ORDER ROUTES
// ========================================

// Customer places an order
// POST /api/orders
router.post("/", createOrder);

// Customer tracks an order
// GET /api/orders/track/:orderNumber
// Keep this before /:id
router.get(
  "/track/:orderNumber",
  getOrderByNumber
);

// ========================================
// ADMIN-ONLY ROUTES
// Everything below this line requires
// an authenticated admin.
// ========================================

router.use(
  protectAdmin,
  requireAnyAdmin
);

// Admin order list
// GET /api/orders
router.get("/", getOrders);

// Update order status
// PATCH /api/orders/:id/status
router.patch(
  "/:id/status",
  updateOrderStatus
);

// Update payment status
// PATCH /api/orders/:id/payment
router.patch(
  "/:id/payment",
  updatePaymentStatus
);

// Cancel order and restore stock
// PATCH /api/orders/:id/cancel
router.patch(
  "/:id/cancel",
  cancelOrder
);

// Admin single order
// GET /api/orders/:id
// Keep this at the bottom.
router.get(
  "/:id",
  getOrderById
);

module.exports = router;
