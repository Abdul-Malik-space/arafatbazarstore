const fs = require("fs");
const path = require("path");

// ========================================
// HELPER: CREATE PUBLIC IMAGE URL
// ========================================

const getFileUrl = (
  req,
  filename
) => {
  return `${req.protocol}://${req.get(
    "host"
  )}/uploads/${filename}`;
};

// ========================================
// UPLOAD SINGLE IMAGE
//
// POST /api/uploads/single
// ========================================

const uploadSingleImage = async (
  req,
  res
) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Please select an image",
        });
    }

    const image = {
      filename:
        req.file.filename,

      originalName:
        req.file.originalname,

      mimetype:
        req.file.mimetype,

      size:
        req.file.size,

      path:
        `/uploads/${req.file.filename}`,

      url:
        getFileUrl(
          req,
          req.file.filename
        ),
    };

    return res
      .status(201)
      .json({
        success: true,

        message:
          "Image uploaded successfully",

        image,
      });
  } catch (error) {
    console.error(
      "Single Image Upload Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to upload image",

        error:
          error.message,
      });
  }
};

// ========================================
// UPLOAD MULTIPLE IMAGES
//
// POST /api/uploads/multiple
// ========================================

const uploadMultipleImages =
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.files ||
        req.files.length === 0
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Please select at least one image",
          });
      }

      const images =
        req.files.map(
          (file) => ({
            filename:
              file.filename,

            originalName:
              file.originalname,

            mimetype:
              file.mimetype,

            size:
              file.size,

            path:
              `/uploads/${file.filename}`,

            url:
              getFileUrl(
                req,
                file.filename
              ),
          })
        );

      return res
        .status(201)
        .json({
          success: true,

          message:
            `${images.length} image(s) uploaded successfully`,

          count:
            images.length,

          images,
        });
    } catch (error) {
      console.error(
        "Multiple Image Upload Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to upload images",

          error:
            error.message,
        });
    }
  };

// ========================================
// DELETE UPLOADED IMAGE
//
// DELETE /api/uploads/:filename
// ========================================

const deleteUploadedImage =
  async (
    req,
    res
  ) => {
    try {
      const filename =
        path.basename(
          req.params.filename
        );

      if (!filename) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Image filename is required",
          });
      }

      const filePath =
        path.join(
          __dirname,
          "../uploads",
          filename
        );

      if (
        !fs.existsSync(
          filePath
        )
      ) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Image not found",
          });
      }

      fs.unlinkSync(
        filePath
      );

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Image deleted successfully",
        });
    } catch (error) {
      console.error(
        "Delete Image Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to delete image",

          error:
            error.message,
        });
    }
  };

// ========================================
// EXPORTS
// ========================================

module.exports = {
  uploadSingleImage,
  uploadMultipleImages,
  deleteUploadedImage,
};