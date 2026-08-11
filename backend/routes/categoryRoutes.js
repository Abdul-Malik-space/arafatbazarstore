const express = require("express");

const {
  createCategory,
  getCategories,
  getActiveCategories,
  getMainCategories,
  getSubcategories,
  getCategoryTree,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const {
  protectAdmin,
  requireAnyAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

// ========================================
// PUBLIC CATEGORY ROUTES
// ========================================

// ----------------------------------------
// GET CATEGORY TREE
//
// GET /api/categories/tree
//
// Main categories with their children.
//
// Example:
//
// [
//   {
//     name: "Personal Care",
//     children: [
//       { name: "Bath Soap" },
//       { name: "Face Wash" }
//     ]
//   }
// ]
//
// IMPORTANT:
// Keep this route ABOVE "/:id".
// ========================================

router.get(
  "/tree",
  getCategoryTree
);

// ========================================
// GET MAIN CATEGORIES
//
// GET /api/categories/main
//
// Only:
// Grocery
// Personal Care
// Baby Care
// etc.
// ========================================

router.get(
  "/main",
  getMainCategories
);

// ========================================
// GET ACTIVE CATEGORIES
//
// GET /api/categories/active
// ========================================

router.get(
  "/active",
  getActiveCategories
);

// ========================================
// GET ALL CATEGORIES
//
// GET /api/categories
//
// Kept public for current frontend
// compatibility.
//
// Later customer navigation will mainly
// use /tree.
// ========================================

router.get(
  "/",
  getCategories
);

// ========================================
// GET SUBCATEGORIES OF MAIN CATEGORY
//
// GET /api/categories/:id/subcategories
//
// Example:
//
// /api/categories/123/subcategories
// ========================================

router.get(
  "/:id/subcategories",
  getSubcategories
);

// ========================================
// GET SINGLE CATEGORY
//
// GET /api/categories/:id
//
// IMPORTANT:
// Dynamic route stays AFTER:
// /tree
// /main
// /active
// ========================================

router.get(
  "/:id",
  getCategoryById
);

// ========================================
// ADMIN PROTECTED ROUTES
// ========================================

// ----------------------------------------
// CREATE CATEGORY
//
// POST /api/categories
//
// Supports:
// Main Category
// Subcategory
// ----------------------------------------

router.post(
  "/",
  protectAdmin,
  requireAnyAdmin,
  createCategory
);

// ----------------------------------------
// UPDATE CATEGORY
//
// PUT /api/categories/:id
// ----------------------------------------

router.put(
  "/:id",
  protectAdmin,
  requireAnyAdmin,
  updateCategory
);

// ----------------------------------------
// DELETE CATEGORY
//
// DELETE /api/categories/:id
// ----------------------------------------

router.delete(
  "/:id",
  protectAdmin,
  requireAnyAdmin,
  deleteCategory
);

module.exports = router;