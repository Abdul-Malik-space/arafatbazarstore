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
  /jpeg|jpg|png|webp|gif/;

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

  const mimetype =
    allowedExtensions.test(
      file.mimetype
    );

  if (extname && mimetype) {
    return cb(null, true);
  }

  return cb(
    new Error(
      "Only image files are allowed (jpg, jpeg, png, webp, gif)."
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
    // 5MB per image
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;
