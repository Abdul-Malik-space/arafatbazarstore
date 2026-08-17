// ========================================
// ADMIN UPLOADS / MEDIA SERVICE
// ========================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:5000/api";

// ========================================
// SAFE FILE CHECK
// ========================================

const isFile = (value) => {
  return (
    typeof File !== "undefined" &&
    value instanceof File
  );
};

// ========================================
// SAFE FILE LIST
// ========================================

const normalizeFiles = (files) => {
  if (!files) {
    return [];
  }

  if (Array.isArray(files)) {
    return files.filter((file) =>
      isFile(file)
    );
  }

  if (
    typeof FileList !== "undefined" &&
    files instanceof FileList
  ) {
    return Array.from(files).filter(
      (file) => isFile(file)
    );
  }

  if (isFile(files)) {
    return [files];
  }

  return [];
};

// ========================================
// MEDIA ITEM NORMALIZER
// ========================================

export const normalizeAdminMediaItem = (
  item
) => {
  if (!item) {
    return null;
  }

  if (typeof item === "string") {
    return {
      _id: item,
      id: item,

      publicId: item,
      filename: item,

      originalName:
        item.split("/").pop() ||
        item,

      url: item,
      path: item,
      secureUrl: item,

      width: 0,
      height: 0,

      size: 0,
      bytes: 0,

      format: "",

      createdAt: null,
    };
  }

  if (typeof item !== "object") {
    return null;
  }

  const url =
    item.url ||
    item.path ||
    item.secureUrl ||
    item.secure_url ||
    item.location ||
    "";

  const publicId =
    item.publicId ||
    item.public_id ||
    item.filename ||
    item.id ||
    item._id ||
    "";

  const filename =
    item.filename ||
    publicId ||
    "";

  return {
    ...item,

    _id:
      item._id ||
      publicId ||
      url,

    id:
      item.id ||
      publicId ||
      url,

    publicId,

    filename,

    originalName:
      item.originalName ||
      item.original_name ||
      item.name ||
      item.displayName ||
      item.display_name ||
      (publicId
        ? publicId
            .split("/")
            .pop()
        : "") ||
      (url
        ? url
            .split("/")
            .pop()
        : "") ||
      "Image",

    url,

    path:
      item.path ||
      url,

    secureUrl:
      item.secureUrl ||
      item.secure_url ||
      url,

    width:
      Number(item.width) ||
      0,

    height:
      Number(item.height) ||
      0,

    size:
      Number(
        item.size ??
          item.bytes
      ) || 0,

    bytes:
      Number(
        item.bytes ??
          item.size
      ) || 0,

    format:
      item.format ||
      "",

    createdAt:
      item.createdAt ||
      item.created_at ||
      null,
  };
};

// ========================================
// ADMIN MEDIA REQUEST
// ========================================

const adminUploadRequest =
  async (
    endpoint,
    options = {}
  ) => {
    const {
      headers,
      ...restOptions
    } = options;

    try {
      const response =
        await fetch(
          `${API_BASE_URL}${endpoint}`,
          {
            ...restOptions,

            // =================================
            // ADMIN AUTH COOKIE
            // =================================

            credentials:
              "include",

            // =================================
            // IMPORTANT
            //
            // FormData کے لیے Content-Type
            // manually set نہیں کرنا۔
            // Browser خود multipart boundary
            // بنائے گا۔
            // =================================

            headers: {
              Accept:
                "application/json",

              ...(headers || {}),
            },
          }
        );

      // =================================
      // RESPONSE PARSING
      // =================================

      let data = null;

      const contentType =
        response.headers.get(
          "content-type"
        ) || "";

      if (
        contentType.includes(
          "application/json"
        )
      ) {
        try {
          data =
            await response.json();
        } catch {
          data = null;
        }
      } else {
        try {
          const text =
            await response.text();

          data = text
            ? {
                message: text,
              }
            : null;
        } catch {
          data = null;
        }
      }

      // =================================
      // ERROR RESPONSE
      // =================================

      if (!response.ok) {
        const error =
          new Error(
            data?.message ||
              "Media request failed."
          );

        error.status =
          response.status;

        error.code =
          data?.code ||
          null;

        error.data =
          data;

        throw error;
      }

      return data;
    } catch (error) {
      if (!error.status) {
        const networkError =
          new Error(
            error?.message ||
              "Unable to connect to the server."
          );

        networkError.cause =
          error;

        throw networkError;
      }

      throw error;
    }
  };

// ========================================
// GET MEDIA LIBRARY
//
// GET /api/uploads
//
// Query:
// limit=30
// cursor=<cloudinary cursor>
// ========================================

export const getAdminMediaLibrary =
  async ({
    limit = 30,
    cursor = "",
  } = {}) => {
    const params =
      new URLSearchParams();

    const safeLimit =
      Math.min(
        100,
        Math.max(
          1,
          Number.parseInt(
            limit,
            10
          ) || 30
        )
      );

    params.set(
      "limit",
      String(safeLimit)
    );

    const safeCursor =
      String(
        cursor || ""
      ).trim();

    if (safeCursor) {
      params.set(
        "cursor",
        safeCursor
      );
    }

    const response =
      await adminUploadRequest(
        `/uploads?${params.toString()}`,
        {
          method: "GET",
        }
      );

    const rawImages =
      response?.images ||
      response?.files ||
      response?.data
        ?.images ||
      response?.data
        ?.files ||
      [];

    const images =
      Array.isArray(
        rawImages
      )
        ? rawImages
            .map(
              normalizeAdminMediaItem
            )
            .filter(Boolean)
        : [];

    const nextCursor =
      response?.pagination
        ?.nextCursor ||
      response?.nextCursor ||
      response?.next_cursor ||
      null;

    const hasMore =
      response?.pagination
        ?.hasMore !==
      undefined
        ? Boolean(
            response
              .pagination
              .hasMore
          )
        : Boolean(
            nextCursor
          );

    return {
      ...response,

      images,

      files:
        images,

      count:
        Number(
          response?.count
        ) ||
        images.length,

      pagination: {
        limit:
          safeLimit,

        hasMore,

        nextCursor,
      },

      nextCursor,
    };
  };

// ========================================
// SINGLE IMAGE UPLOAD
//
// POST /api/uploads/single
//
// field:
// image
// ========================================

export const uploadAdminSingleImage =
  async (file) => {
    if (!isFile(file)) {
      throw new Error(
        "Please select a valid image file."
      );
    }

    const formData =
      new FormData();

    formData.append(
      "image",
      file
    );

    const response =
      await adminUploadRequest(
        "/uploads/single",
        {
          method: "POST",

          body:
            formData,
        }
      );

    const image =
      extractSingleUploadedImage(
        response
      );

    return {
      ...response,

      ...(image
        ? {
            image,
            file: image,
          }
        : {}),
    };
  };

// ========================================
// MULTIPLE IMAGE UPLOAD
//
// POST /api/uploads/multiple
//
// field:
// images
//
// Maximum:
// 10 images
// ========================================

export const uploadAdminMultipleImages =
  async (files) => {
    const normalizedFiles =
      normalizeFiles(
        files
      );

    if (
      normalizedFiles.length ===
      0
    ) {
      throw new Error(
        "Please select at least one image."
      );
    }

    if (
      normalizedFiles.length >
      10
    ) {
      throw new Error(
        "A maximum of 10 images can be uploaded at one time."
      );
    }

    const formData =
      new FormData();

    normalizedFiles.forEach(
      (file) => {
        formData.append(
          "images",
          file
        );
      }
    );

    const response =
      await adminUploadRequest(
        "/uploads/multiple",
        {
          method: "POST",

          body:
            formData,
        }
      );

    const images =
      extractMultipleUploadedImages(
        response
      );

    return {
      ...response,

      images,

      files:
        images,

      count:
        images.length,
    };
  };

// ========================================
// CLOUDINARY PUBLIC ID FROM URL
// ========================================

const getCloudinaryPublicIdFromUrl =
  (url) => {
    try {
      const parsedUrl =
        new URL(url);

      const parts =
        parsedUrl.pathname
          .split("/")
          .filter(Boolean);

      const uploadIndex =
        parts.indexOf(
          "upload"
        );

      if (
        uploadIndex === -1
      ) {
        return "";
      }

      let cloudinaryParts =
        parts.slice(
          uploadIndex + 1
        );

      // =================================
      // Example:
      //
      // /image/upload/
      // v123456/
      // store-uploads/
      // image.jpg
      //
      // Public ID:
      // store-uploads/image
      // =================================

      const versionIndex =
        cloudinaryParts
          .findIndex(
            (part) =>
              /^v\d+$/.test(
                part
              )
          );

      if (
        versionIndex >= 0
      ) {
        cloudinaryParts =
          cloudinaryParts.slice(
            versionIndex +
              1
          );
      }

      if (
        cloudinaryParts.length ===
        0
      ) {
        return "";
      }

      const lastIndex =
        cloudinaryParts.length -
        1;

      cloudinaryParts[
        lastIndex
      ] =
        cloudinaryParts[
          lastIndex
        ].replace(
          /\.[^.]+$/,
          ""
        );

      return decodeURIComponent(
        cloudinaryParts.join(
          "/"
        )
      );
    } catch {
      return "";
    }
  };

// ========================================
// GET MEDIA IDENTIFIER
//
// Supports:
//
// media object
// Cloudinary public ID
// Cloudinary URL
// legacy filename
// ========================================

export const getAdminMediaIdentifier =
  (value) => {
    if (!value) {
      return "";
    }

    // =================================
    // OBJECT
    // =================================

    if (
      typeof value ===
      "object"
    ) {
      const directId =
        value.publicId ||
        value.public_id ||
        value.filename ||
        value.id ||
        value._id ||
        "";

      if (directId) {
        return String(
          directId
        ).trim();
      }

      return getAdminMediaIdentifier(
        value.url ||
          value.path ||
          value.secureUrl ||
          value.secure_url ||
          ""
      );
    }

    // =================================
    // STRING
    // =================================

    const stringValue =
      String(
        value
      ).trim();

    if (!stringValue) {
      return "";
    }

    // =================================
    // URL
    // =================================

    if (
      stringValue.startsWith(
        "http://"
      ) ||
      stringValue.startsWith(
        "https://"
      )
    ) {
      const cloudinaryId =
        getCloudinaryPublicIdFromUrl(
          stringValue
        );

      if (cloudinaryId) {
        return cloudinaryId;
      }

      return getUploadFilenameFromUrl(
        stringValue
      );
    }

    // Already public ID / filename
    return stringValue;
  };

// ========================================
// DELETE IMAGE
//
// DELETE /api/uploads/:filename
//
// Accepts:
//
// deleteAdminImage(mediaObject)
//
// OR
//
// deleteAdminImage(
//   "store-uploads/image123"
// )
//
// OR
//
// deleteAdminImage(
//   "https://res.cloudinary.com/..."
// )
// ========================================

export const deleteAdminImage =
  async (
    imageOrIdentifier
  ) => {
    const identifier =
      getAdminMediaIdentifier(
        imageOrIdentifier
      );

    if (!identifier) {
      throw new Error(
        "Image identifier is required."
      );
    }

    return adminUploadRequest(
      `/uploads/${encodeURIComponent(
        identifier
      )}`,
      {
        method:
          "DELETE",
      }
    );
  };

// ========================================
// AUTH ERROR HELPER
// ========================================

export const isAdminUploadAuthError =
  (error) => {
    return (
      error?.status ===
        401 ||
      error?.status ===
        403
    );
  };

// ========================================
// EXTRACT SINGLE UPLOADED IMAGE
// ========================================

export const extractSingleUploadedImage =
  (response) => {
    const candidate =
      response?.image ||
      response?.file ||
      response?.data
        ?.image ||
      response?.data
        ?.file ||
      response?.url ||
      response?.path ||
      null;

    return normalizeAdminMediaItem(
      candidate
    );
  };

// ========================================
// EXTRACT MULTIPLE UPLOADED IMAGES
// ========================================

export const extractMultipleUploadedImages =
  (response) => {
    const candidates =
      response?.images ||
      response?.files ||
      response?.data
        ?.images ||
      response?.data
        ?.files ||
      [];

    if (
      !Array.isArray(
        candidates
      )
    ) {
      return [];
    }

    return candidates
      .map(
        normalizeAdminMediaItem
      )
      .filter(Boolean);
  };

// ========================================
// EXTRACT MEDIA LIBRARY
// ========================================

export const extractAdminMediaLibrary =
  (response) => {
    const candidates =
      response?.images ||
      response?.files ||
      response?.data
        ?.images ||
      response?.data
        ?.files ||
      [];

    if (
      !Array.isArray(
        candidates
      )
    ) {
      return [];
    }

    return candidates
      .map(
        normalizeAdminMediaItem
      )
      .filter(Boolean);
  };

// ========================================
// GET FILENAME / PUBLIC ID FROM URL
//
// Cloudinary:
//
// https://.../upload/v123/
// store-uploads/image.jpg
//
// returns:
//
// store-uploads/image
//
// Legacy/local:
//
// /uploads/image.jpg
//
// returns:
//
// image.jpg
// ========================================

export const getUploadFilenameFromUrl =
  (url) => {
    if (!url) {
      return "";
    }

    const rawValue =
      String(
        url
      ).trim();

    if (!rawValue) {
      return "";
    }

    // =================================
    // CLOUDINARY URL
    // =================================

    if (
      rawValue.startsWith(
        "http://"
      ) ||
      rawValue.startsWith(
        "https://"
      )
    ) {
      const cloudinaryId =
        getCloudinaryPublicIdFromUrl(
          rawValue
        );

      if (cloudinaryId) {
        return cloudinaryId;
      }
    }

    // =================================
    // LEGACY URL
    // =================================

    try {
      const cleanUrl =
        rawValue
          .split("?")[0]
          .split("#")[0];

      return decodeURIComponent(
        cleanUrl
          .split("/")
          .pop() ||
          ""
      );
    } catch {
      return "";
    }
  };

// ========================================
// IMAGE VALIDATION
// ========================================

export const validateAdminImageFile =
  (
    file,
    {
      maxSizeMB = 5,
    } = {}
  ) => {
    if (!isFile(file)) {
      return {
        valid: false,

        message:
          "Please select a valid file.",
      };
    }

    if (
      !file.type?.startsWith(
        "image/"
      )
    ) {
      return {
        valid: false,

        message:
          "Only image files are allowed.",
      };
    }

    const maxBytes =
      maxSizeMB *
      1024 *
      1024;

    if (
      file.size >
      maxBytes
    ) {
      return {
        valid: false,

        message:
          `Image size must be ${maxSizeMB} MB or smaller.`,
      };
    }

    return {
      valid: true,
      message: "",
    };
  };

// ========================================
// DEFAULT EXPORT
// ========================================

export default {
  getAdminMediaLibrary,

  uploadAdminSingleImage,

  uploadAdminMultipleImages,

  deleteAdminImage,

  isAdminUploadAuthError,

  normalizeAdminMediaItem,

  extractSingleUploadedImage,

  extractMultipleUploadedImages,

  extractAdminMediaLibrary,

  getAdminMediaIdentifier,

  getUploadFilenameFromUrl,

  validateAdminImageFile,
};