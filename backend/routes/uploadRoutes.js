const express = require("express");

const upload = require(
  "../middleware/uploadMiddleware"
);

const {
  getUploadedImages,
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
// PROTECT ALL MEDIA / UPLOAD ROUTES
// ========================================
//
// All routes below require an
// authenticated admin account.
//
// /api/uploads
// /api/uploads/single
// /api/uploads/multiple
// /api/uploads/:filename
// ========================================

router.use(
  protectAdmin,
  requireAnyAdmin
);

// ========================================
// GET MEDIA LIBRARY
//
// GET /api/uploads
//
// Optional query parameters:
//
// ?limit=30
// ?cursor=CLOUDINARY_CURSOR
//
// Returns:
// - Uploaded images
// - Image metadata
// - Pagination cursor
// ========================================

router.get(
  "/",
  getUploadedImages
);

// ========================================
// SINGLE IMAGE UPLOAD
//
// POST /api/uploads/single
//
// Content-Type:
// multipart/form-data
//
// Field:
// image = file
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
//
// Content-Type:
// multipart/form-data
//
// Field:
// images = files
//
// Maximum:
// 10 images per request
// ========================================

router.post(
  "/multiple",
  upload.array(
    "images",
    10
  ),
  uploadMultipleImages
);

// ========================================
// DELETE IMAGE
//
// DELETE /api/uploads/:filename
//
// IMPORTANT:
// Frontend must encode Cloudinary
// publicId using encodeURIComponent()
//
// Example:
//
// store-uploads/image-123
//
// becomes:
//
// store-uploads%2Fimage-123
// ========================================

router.delete(
  "/:filename",
  deleteUploadedImage
);

// ========================================
// EXPORT
// ========================================

module.exports = router;