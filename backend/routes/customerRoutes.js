const express = require("express");

const {
  getCustomers,
  getCustomerByPhoneKey,
  updateCustomerProfile,
} = require("../controllers/customerController");

const {
  protectAdmin,
  requireAnyAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

// All customer CRM routes are admin-only.
router.use(protectAdmin, requireAnyAdmin);

// GET /api/admin/customers
router.get("/", getCustomers);

// GET /api/admin/customers/:phoneKey
router.get("/:phoneKey", getCustomerByPhoneKey);

// PATCH /api/admin/customers/:phoneKey
router.patch("/:phoneKey", updateCustomerProfile);

module.exports = router;
