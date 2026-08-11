const express = require("express");

const upload = require("../middleware/uploadMiddleware");

const {
  uploadSingleImage,
  uploadMultipleImages,
  deleteUploadedImage,
} = require("../controllers/uploadController");

const {
  protectAdmin,
  requireAnyAdmin,
} = require("../middleware/adminAuth");

const router = express.Router();

// ========================================
// PROTECT ALL UPLOAD ROUTES
// ========================================

router.use(
  protectAdmin,
  requireAnyAdmin
);

// ========================================
// SINGLE IMAGE UPLOAD
//
// POST /api/uploads/single
// Field name: image
// ========================================

router.post(
  "/single",
  upload.single("image"),
  uploadSingleImage
);

// ========================================
// MULTIPLE IMAGE UPLOAD
//
// POST /api/uploads/multiple
// Field name: images
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