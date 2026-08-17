const { PassThrough } = require("stream");

const cloudinary = require("../config/cloudinary");

// ========================================
// CLOUDINARY FOLDER
// ========================================

const CLOUDINARY_FOLDER =
  process.env.CLOUDINARY_FOLDER || "store-uploads";

// ========================================
// HELPERS
// ========================================

const clampNumber = (
  value,
  {
    fallback = 30,
    min = 1,
    max = 100,
  } = {}
) => {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(
    max,
    Math.max(min, parsed)
  );
};

const getPublicIdName = (publicId = "") => {
  const value = String(publicId || "");

  return (
    value.split("/").pop() || value
  );
};

const normalizeCloudinaryImage = (
  resource = {}
) => {
  const publicId =
    resource.public_id || "";

  return {
    _id: publicId,
    id: publicId,

    // Complete Cloudinary public_id.
    // Delete endpoint needs folder prefix too.
    filename: publicId,
    publicId,

    originalName:
      resource.display_name ||
      resource.original_filename ||
      getPublicIdName(publicId),

    url:
      resource.secure_url ||
      resource.url ||
      "",

    path:
      resource.secure_url ||
      resource.url ||
      "",

    secureUrl:
      resource.secure_url || "",

    format:
      resource.format || "",

    mimetype:
      resource.format
        ? `image/${resource.format}`
        : "image",

    width:
      Number(resource.width) || 0,

    height:
      Number(resource.height) || 0,

    size:
      Number(resource.bytes) || 0,

    bytes:
      Number(resource.bytes) || 0,

    createdAt:
      resource.created_at || null,

    created_at:
      resource.created_at || null,

    folder:
      resource.folder ||
      CLOUDINARY_FOLDER,

    resourceType:
      resource.resource_type ||
      "image",
  };
};

// ========================================
// HELPER: BUFFER -> CLOUDINARY
// ========================================

const uploadBufferToCloudinary = (
  buffer,
  file = {}
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

            use_filename: true,
            unique_filename: true,
            overwrite: false,

            context:
              file.originalname
                ? `original_name=${String(
                    file.originalname
                  ).replace(/[|=]/g, "-")}`
                : undefined,
          },
          (error, result) => {
            if (error) {
              return reject(error);
            }

            return resolve(result);
          }
        );

      const bufferStream =
        new PassThrough();

      bufferStream.end(buffer);
      bufferStream.pipe(uploadStream);
    }
  );
};

// ========================================
// GET MEDIA LIBRARY
//
// GET /api/uploads
//
// Query:
// limit=30
// cursor=<cloudinary next cursor>
// ========================================

const getUploadedImages = async (
  req,
  res
) => {
  try {
    const limit = clampNumber(
      req.query.limit,
      {
        fallback: 30,
        min: 1,
        max: 100,
      }
    );

    const nextCursor =
      String(
        req.query.cursor || ""
      ).trim();

    const options = {
      type: "upload",
      resource_type: "image",
      prefix: `${CLOUDINARY_FOLDER}/`,
      max_results: limit,
    };

    if (nextCursor) {
      options.next_cursor =
        nextCursor;
    }

    const result =
      await cloudinary.api.resources(
        options
      );

    const images = Array.isArray(
      result?.resources
    )
      ? result.resources
          .map(
            normalizeCloudinaryImage
          )
          .sort((a, b) => {
            const aTime = a.createdAt
              ? new Date(a.createdAt)
                  .getTime()
              : 0;

            const bTime = b.createdAt
              ? new Date(b.createdAt)
                  .getTime()
              : 0;

            return bTime - aTime;
          })
      : [];

    return res.status(200).json({
      success: true,
      count: images.length,
      images,
      files: images,

      pagination: {
        limit,

        hasMore: Boolean(
          result?.next_cursor
        ),

        nextCursor:
          result?.next_cursor ||
          null,
      },

      nextCursor:
        result?.next_cursor ||
        null,
    });
  } catch (error) {
    console.error(
      "Get Media Library Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to load media library",

      error: error.message,
    });
  }
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
      return res.status(400).json({
        success: false,

        message:
          "Please select an image",
      });
    }

    const result =
      await uploadBufferToCloudinary(
        req.file.buffer,
        req.file
      );

    const normalized =
      normalizeCloudinaryImage(
        result
      );

    const image = {
      ...normalized,

      originalName:
        req.file.originalname ||
        normalized.originalName,

      mimetype:
        req.file.mimetype ||
        "image",

      size:
        Number(req.file.size) ||
        Number(result.bytes) ||
        0,
    };

    return res.status(201).json({
      success: true,

      message:
        "Image uploaded successfully",

      image,

      file: image,
    });
  } catch (error) {
    console.error(
      "Single Image Upload Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to upload image",

      error: error.message,
    });
  }
};

// ========================================
// UPLOAD MULTIPLE IMAGES
//
// POST /api/uploads/multiple
// ========================================

const uploadMultipleImages = async (
  req,
  res
) => {
  try {
    if (
      !req.files ||
      req.files.length === 0
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Please select at least one image",
      });
    }

    const results =
      await Promise.all(
        req.files.map((file) =>
          uploadBufferToCloudinary(
            file.buffer,
            file
          )
        )
      );

    const images =
      results.map(
        (result, index) => {
          const file =
            req.files[index];

          const normalized =
            normalizeCloudinaryImage(
              result
            );

          return {
            ...normalized,

            originalName:
              file?.originalname ||
              normalized.originalName,

            mimetype:
              file?.mimetype ||
              normalized.mimetype,

            size:
              Number(file?.size) ||
              normalized.size,
          };
        }
      );

    return res.status(201).json({
      success: true,

      message:
        `${images.length} image(s) uploaded successfully`,

      count:
        images.length,

      images,

      files: images,
    });
  } catch (error) {
    console.error(
      "Multiple Image Upload Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to upload images",

      error: error.message,
    });
  }
};

// ========================================
// DELETE IMAGE
//
// DELETE /api/uploads/:filename
// ========================================

const deleteUploadedImage = async (
  req,
  res
) => {
  try {
    const publicId =
      decodeURIComponent(
        req.params.filename || ""
      ).trim();

    if (!publicId) {
      return res.status(400).json({
        success: false,

        message:
          "Image identifier is required",
      });
    }

    // Only delete media from configured folder
    const expectedPrefix =
      `${CLOUDINARY_FOLDER}/`;

    if (
      !publicId.startsWith(
        expectedPrefix
      )
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid media image identifier",
      });
    }

    const result =
      await cloudinary.uploader.destroy(
        publicId,
        {
          resource_type: "image",
          invalidate: true,
        }
      );

    if (
      result.result !== "ok" &&
      result.result !== "not found"
    ) {
      return res.status(500).json({
        success: false,

        message:
          "Failed to delete image",

        result,
      });
    }

    return res.status(200).json({
      success: true,

      message:
        result.result === "not found"
          ? "Image was already removed"
          : "Image deleted successfully",

      filename: publicId,

      publicId,
    });
  } catch (error) {
    console.error(
      "Delete Image Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to delete image",

      error: error.message,
    });
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  getUploadedImages,

  uploadSingleImage,

  uploadMultipleImages,

  deleteUploadedImage,
};