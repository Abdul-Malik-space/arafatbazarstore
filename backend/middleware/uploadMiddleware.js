const multer = require("multer");

// ========================================
// MEMORY STORAGE
//
// IMPORTANT:
// We no longer write files to disk
// (diskStorage). Vercel's filesystem
// is read-only / temporary, so any
// file saved there disappears.
//
// Instead we keep the file in memory
// (req.file.buffer) and stream it
// straight to Cloudinary from the
// controller.
// ========================================

const storage =
  multer.memoryStorage();

// ========================================
// FILE FILTER
// Only allow image files.
// ========================================

const allowedExtensions =
  /jpeg|jpg|png|webp|gif|heic|heif/;

const fileFilter = (
  req,
  file,
  cb
) => {
  const extname =
    allowedExtensions.test(
      file.originalname
        .toLowerCase()
    );

  // Some mobile browsers send
  // HEIC/HEIF photos with a
  // generic or missing mimetype
  // (e.g. "application/octet-stream"),
  // so we accept the file as long
  // as EITHER the extension OR the
  // mimetype looks like an image.
  const mimetype =
    allowedExtensions.test(
      file.mimetype
    ) ||
    file.mimetype.startsWith(
      "image/"
    );

  if (extname || mimetype) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only image files are allowed (jpg, jpeg, png, webp, gif, heic, heif)."
    )
  );
};

// ========================================
// MULTER INSTANCE
// ========================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    // 10MB per image — mobile
    // camera photos are often
    // larger than 5MB.
    fileSize: 10 * 1024 * 1024,
  },
});

module.exports = upload;
