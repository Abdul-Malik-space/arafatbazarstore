const express = require("express");

// ========================================
// PRODUCT CONTROLLER
// ========================================

const {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals,
  getBestSellers,
  getDealProducts,
} = require("../controllers/productController");

// ========================================
// ADMIN AUTHENTICATION
// ========================================

const {
  protectAdmin,
  requireAnyAdmin,
} = require("../middleware/adminAuth");

// ========================================
// ROUTER
// ========================================

const router = express.Router();

// ========================================
// PUBLIC PRODUCT ROUTES
//
// Customer website ان routes کو بغیر
// Admin Login کے access کر سکتی ہے.
// ========================================

// ========================================
// GET ALL PRODUCTS
//
// GET /api/products
// ========================================

router.get(
  "/",
  getProducts
);

// ========================================
// HOME PAGE / SPECIAL PRODUCT ROUTES
//
// IMPORTANT:
//
// یہ تمام routes /:id سے پہلے رہیں گے
// ورنہ Express "featured" وغیرہ کو
// product ID سمجھ سکتا ہے.
// ========================================

// ========================================
// FEATURED PRODUCTS
//
// GET /api/products/featured
// ========================================

router.get(
  "/featured",
  getFeaturedProducts
);

// ========================================
// TRENDING PRODUCTS
//
// GET /api/products/trending
// ========================================

router.get(
  "/trending",
  getTrendingProducts
);

// ========================================
// NEW ARRIVALS
//
// GET /api/products/new-arrivals
// ========================================

router.get(
  "/new-arrivals",
  getNewArrivals
);

// ========================================
// BEST SELLERS
//
// GET /api/products/best-sellers
// ========================================

router.get(
  "/best-sellers",
  getBestSellers
);

// ========================================
// DEAL PRODUCTS
//
// GET /api/products/deals
// ========================================

router.get(
  "/deals",
  getDealProducts
);

// ========================================
// PRODUCT BY SLUG
//
// Example:
// GET /api/products/slug/premium-cooking-oil
// ========================================

router.get(
  "/slug/:slug",
  getProductBySlug
);

// ========================================
// ADMIN PRODUCT ROUTES
//
// نیچے والے routes صرف authenticated:
//
// - admin
// - super-admin
//
// استعمال کر سکتے ہیں.
// ========================================

// ========================================
// CREATE PRODUCT
//
// POST /api/products
// ========================================

router.post(
  "/",
  protectAdmin,
  requireAnyAdmin,
  createProduct
);

// ========================================
// STOCK MANAGEMENT
//
// PATCH /api/products/:id/stock
// ========================================

router.patch(
  "/:id/stock",
  protectAdmin,
  requireAnyAdmin,
  updateProductStock
);

// ========================================
// SINGLE PRODUCT ROUTES
//
// Dynamic /:id routes ہمیشہ static routes
// کے بعد رکھیں.
// ========================================

// ========================================
// GET SINGLE PRODUCT
//
// Public
//
// GET /api/products/:id
// ========================================

router.get(
  "/:id",
  getProductById
);

// ========================================
// UPDATE PRODUCT
//
// Admin Only
//
// PUT /api/products/:id
// ========================================

router.put(
  "/:id",
  protectAdmin,
  requireAnyAdmin,
  updateProduct
);

// ========================================
// DELETE PRODUCT
//
// Admin Only
//
// DELETE /api/products/:id
// ========================================

router.delete(
  "/:id",
  protectAdmin,
  requireAnyAdmin,
  deleteProduct
);

// ========================================
// EXPORT
// ========================================

module.exports = router;