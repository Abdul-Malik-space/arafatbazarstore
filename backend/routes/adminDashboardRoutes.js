const express = require("express");

const {
  protectAdmin,
  requireAnyAdmin,
} = require("../middleware/adminAuth");

const {
  getAdminDashboardOverview,
} = require("../controllers/adminDashboardController");

// ========================================
// ROUTER
// ========================================

const router = express.Router();

// ========================================
// ADMIN DASHBOARD
//
// GET /api/admin/dashboard
//
// Access:
// - admin
// - super-admin
// ========================================

router.get(
  "/",
  protectAdmin,
  requireAnyAdmin,
  getAdminDashboardOverview
);

// ========================================
// EXPORT
// ========================================

module.exports = router;