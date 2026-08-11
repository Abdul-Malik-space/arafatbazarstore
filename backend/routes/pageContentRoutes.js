const express = require("express");

const {
  createPage,
  getPages,
  getPageById,
  getHeaderPages,
  getPublicPageBySlug,
  getSystemPage,
  updatePage,
  deletePage,
} = require("../controllers/pageContentController");

const {
  protectAdmin,
  requireAnyAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

// ========================================
// PUBLIC ROUTES
//
// IMPORTANT:
// ان routes کو "/:id" سے پہلے رکھنا ضروری ہے.
// ========================================

// ========================================
// GET HEADER PAGE MENU
//
// Public
//
// GET /api/page-content/header
//
// Example response:
//
// [
//   {
//     title: "Customer Care",
//     routePath: "/page/customer-care",
//     children: [
//       {
//         title: "FAQ",
//         routePath: "/page/faq"
//       },
//       {
//         title: "Contact Us",
//         routePath: "/contact"
//       }
//     ]
//   }
// ]
// ========================================

router.get(
  "/header",
  getHeaderPages
);

// ========================================
// GET PUBLIC PAGE BY SLUG
//
// Public
//
// Example:
//
// GET /api/page-content/public/privacy-policy
//
// GET /api/page-content/public/faq
// ========================================

router.get(
  "/public/:slug",
  getPublicPageBySlug
);

// ========================================
// GET SYSTEM PAGE
//
// Public
//
// Examples:
//
// GET /api/page-content/system/about
//
// GET /api/page-content/system/contact
//
// GET /api/page-content/system/shop
// ========================================

router.get(
  "/system/:systemKey",
  getSystemPage
);

// ========================================
// ADMIN AUTHENTICATION
//
// اس کے نیچے تمام routes protected ہیں.
// ========================================

router.use(
  protectAdmin,
  requireAnyAdmin
);

// ========================================
// GET ALL PAGES
//
// Admin
//
// GET /api/page-content
//
// Returns:
//
// System Pages
// Custom Pages
// Main Menu Pages
// Dropdown Pages
// Published / Unpublished
// Active / Inactive
// ========================================

router.get(
  "/",
  getPages
);

// ========================================
// CREATE PAGE
//
// Admin
//
// POST /api/page-content
// ========================================

router.post(
  "/",
  createPage
);

// ========================================
// GET SINGLE PAGE
//
// Admin
//
// GET /api/page-content/:id
//
// IMPORTANT:
// "/:id" ہمیشہ static routes کے بعد ہے.
// ========================================

router.get(
  "/:id",
  getPageById
);

// ========================================
// UPDATE PAGE
//
// Admin
//
// PUT /api/page-content/:id
// ========================================

router.put(
  "/:id",
  updatePage
);

// ========================================
// DELETE PAGE
//
// Admin
//
// DELETE /api/page-content/:id
//
// System Pages delete نہیں ہوں گے.
// ========================================

router.delete(
  "/:id",
  deletePage
);

module.exports = router;