const streamifier = require("streamifier");

const cloudinary = require("../config/cloudinary");

// ========================================
// CLOUDINARY FOLDER
//
// Optional: set CLOUDINARY_FOLDER in
// .env to organize uploads, e.g.
// "arafat-bazar-store" or
// "mobile-accessories-store".
// ========================================

const CLOUDINARY_FOLDER =
  process.env
    .CLOUDINARY_FOLDER ||
  "store-uploads";

// ========================================
// HELPER: STREAM BUFFER TO CLOUDINARY
// ========================================

const uploadBufferToCloudinary = (
  buffer
) => {
  return new Promise(
    (resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder:
              CLOUDINARY_FOLDER,

            resource_type:
              "image",
          },

          (error, result) => {
            if (error) {
              return reject(
                error
              );
            }

            return resolve(
              result
            );
          }
        );

      streamifier
        .createReadStream(
          buffer
        )
        .pipe(uploadStream);
    }
  );
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

    const result =
      await uploadBufferToCloudinary(
        req.file.buffer
      );

    const image = {
      // public_id — needed later
      // to delete this image from
      // Cloudinary.
      filename:
        result.public_id,

      originalName:
        req.file.originalname,

      mimetype:
        req.file.mimetype,

      size:
        req.file.size,

      // Full Cloudinary URL.
      // Frontend's getImageUrl()
      // already returns URLs as-is
      // when they start with
      // http(s):// — no frontend
      // changes needed.
      path:
        result.secure_url,

      url:
        result.secure_url,
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

      const results =
        await Promise.all(
          req.files.map(
            (file) =>
              uploadBufferToCloudinary(
                file.buffer
              )
          )
        );

      const images =
        results.map(
          (result, index) => ({
            filename:
              result.public_id,

            originalName:
              req.files[index]
                .originalname,

            mimetype:
              req.files[index]
                .mimetype,

            size:
              req.files[index]
                .size,

            path:
              result.secure_url,

            url:
              result.secure_url,
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
//
// IMPORTANT:
// "filename" here must be the
// Cloudinary public_id that was
// returned when the image was
// uploaded (the "filename" field
// in the upload response). Because
// public_id can contain a "/"
// (folder/name), the frontend must
// send it URL-encoded:
//
// encodeURIComponent(image.filename)
// ========================================

const deleteUploadedImage =
  async (
    req,
    res
  ) => {
    try {
      const publicId =
        decodeURIComponent(
          req.params.filename ||
            ""
        );

      if (!publicId) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Image identifier is required",
          });
      }

      const result =
        await cloudinary.uploader.destroy(
          publicId,
          {
            resource_type:
              "image",
          }
        );

      if (
        result.result !==
          "ok" &&
        result.result !==
          "not found"
      ) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "Failed to delete image",

            result,
          });
      }

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
