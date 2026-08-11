const express = require("express");

const {
  getSiteSettings,
  getPublicSiteSettings,
  updateSiteSettings,
  resetSiteSettings,
} = require("../controllers/siteSettingsController");

const {
  protectAdmin,
  requireAnyAdmin,
  requireSuperAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

// ========================================
// PUBLIC SITE SETTINGS
//
// Customer website use
//
// GET /api/site-settings/public
//
// IMPORTANT:
// یہ route public رہے گا کیونکہ
// customer frontend کو homepage,
// header, footer وغیرہ کی settings
// load کرنی ہیں.
// ========================================

router.get(
  "/public",
  getPublicSiteSettings
);

// ========================================
// PROTECT ALL ADMIN SETTINGS ROUTES
//
// یہاں سے نیچے آنے والی تمام routes
// کے لیے valid Admin session ضروری ہے.
//
// Allowed:
// - admin
// - super-admin
// ========================================

router.use(
  protectAdmin,
  requireAnyAdmin
);

// ========================================
// GET COMPLETE SITE SETTINGS
//
// Admin Dashboard use
//
// GET /api/site-settings
//
// Protected:
// admin + super-admin
// ========================================

router.get(
  "/",
  getSiteSettings
);

// ========================================
// UPDATE SITE SETTINGS
//
// Admin Dashboard use
//
// PUT /api/site-settings
//
// Protected:
// admin + super-admin
//
// یہی route بعد میں manage کرے گی:
//
// - Store Details
// - Logo
// - Hero Slides
// - Promotional Banners
// - Large Banner
// - Testimonials
// - Brand Logos
// - Blog / Stories
// - Footer
// - Social Links
// - Homepage Content
// ========================================

router.put(
  "/",
  updateSiteSettings
);

// ========================================
// RESET SITE SETTINGS
//
// POST /api/site-settings/reset
//
// IMPORTANT:
// Reset destructive operation ہے,
// اس لیے صرف Super Admin کو permission
// دی گئی ہے.
// ========================================

router.post(
  "/reset",
  requireSuperAdmin,
  resetSiteSettings
);

// ========================================
// EXPORT
// ========================================

module.exports = router;