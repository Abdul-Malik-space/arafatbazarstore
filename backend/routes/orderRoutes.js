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

const router = express.Router();

// ========================================
// CREATE ORDER
// POST /api/orders
// ========================================

router.post("/", createOrder);

// ========================================
// GET ALL ORDERS
// GET /api/orders
// ========================================

router.get("/", getOrders);

// ========================================
// TRACK ORDER BY ORDER NUMBER
// IMPORTANT:
// Keep this before /:id
// ========================================

router.get(
  "/track/:orderNumber",
  getOrderByNumber
);

// ========================================
// UPDATE ORDER STATUS
// PATCH /api/orders/:id/status
// ========================================

router.patch(
  "/:id/status",
  updateOrderStatus
);

// ========================================
// UPDATE PAYMENT STATUS
// PATCH /api/orders/:id/payment
// ========================================

router.patch(
  "/:id/payment",
  updatePaymentStatus
);

// ========================================
// CANCEL ORDER + RESTORE STOCK
// PATCH /api/orders/:id/cancel
// ========================================

router.patch(
  "/:id/cancel",
  cancelOrder
);

// ========================================
// GET SINGLE ORDER
// Keep /:id route at the bottom
// ========================================

router.get(
  "/:id",
  getOrderById
);

module.exports = router;