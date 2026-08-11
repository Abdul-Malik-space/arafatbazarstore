const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ========================================
// UPLOAD DIRECTORY
// ========================================

const uploadPath = path.join(
  __dirname,
  "../uploads"
);

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, {
    recursive: true,
  });
}

// ========================================
// STORAGE
// ========================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },

  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9);

    const extension =
      path.extname(file.originalname);

    cb(
      null,
      uniqueName + extension
    );
  },
});

// ========================================
// IMAGE FILTER
// ========================================

const fileFilter = (
  req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  if (
    allowedTypes.includes(file.mimetype)
  ) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only JPG, JPEG, PNG, WEBP and GIF images are allowed"
      ),
      false
    );
  }
};

// ========================================
// MULTER CONFIG
// ========================================

const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

module.exports = upload;