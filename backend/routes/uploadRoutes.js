const express = require("express");

const upload = require(
  "../middleware/uploadMiddleware"
);

const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteUploadedImage,
} = require(
  "../controllers/uploadController"
);

const {
  protectAdmin,
  requireAnyAdmin,
} = require(
  "../middleware/adminAuth"
);

const router = express.Router();

// ========================================
// PROTECT ALL UPLOAD ROUTES
// ========================================

router.use(
  protectAdmin,
  requireAnyAdmin
);

// ========================================
// SINGLE IMAGE
//
// POST /api/uploads/single
//
// form-data:
// image = file
// ========================================

router.post(
  "/single",
  upload.single("image"),
  uploadSingleImage
);

// ========================================
// MULTIPLE IMAGES
//
// POST /api/uploads/multiple
//
// form-data:
// images = files
//
// Maximum: 10
// ========================================

router.post(
  "/multiple",
  upload.array("images", 10),
  uploadMultipleImages
);

// ========================================
// DELETE IMAGE
//
// DELETE /api/uploads/:filename
// ========================================

router.delete(
  "/:filename",
  deleteUploadedImage
);

// ========================================
// EXPORT
// ========================================

module.exports = router;