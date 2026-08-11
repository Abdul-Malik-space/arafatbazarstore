// ========================================
// ADMIN UPLOADS SERVICE
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

  if (
    Array.isArray(files)
  ) {
    return files.filter(
      (file) => isFile(file)
    );
  }

  if (
    typeof FileList !==
      "undefined" &&
    files instanceof FileList
  ) {
    return Array.from(
      files
    ).filter(
      (file) => isFile(file)
    );
  }

  if (isFile(files)) {
    return [files];
  }

  return [];
};

// ========================================
// ADMIN UPLOAD REQUEST
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

            // HttpOnly admin cookie
            credentials:
              "include",

            // IMPORTANT:
            // FormData upload میں
            // Content-Type manually set
            // نہیں کرنا.
            headers: {
              Accept:
                "application/json",

              ...(headers || {}),
            },
          }
        );

      // ==================================
      // RESPONSE
      // ==================================

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

      // ==================================
      // ERROR
      // ==================================

      if (!response.ok) {
        const error =
          new Error(
            data?.message ||
              "Upload request failed."
          );

        error.status =
          response.status;

        error.code =
          data?.code || null;

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

    return adminUploadRequest(
      "/uploads/single",
      {
        method: "POST",
        body: formData,
      }
    );
  };

// ========================================
// MULTIPLE IMAGE UPLOAD
//
// POST /api/uploads/multiple
//
// field:
// images
//
// backend maximum:
// 10 images
// ========================================

export const uploadAdminMultipleImages =
  async (files) => {
    const normalizedFiles =
      normalizeFiles(files);

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

    return adminUploadRequest(
      "/uploads/multiple",
      {
        method: "POST",
        body: formData,
      }
    );
  };

// ========================================
// DELETE IMAGE
//
// DELETE /api/uploads/:filename
// ========================================

export const deleteAdminImage =
  async (filename) => {
    const safeFilename =
      String(
        filename || ""
      ).trim();

    if (!safeFilename) {
      throw new Error(
        "Image filename is required."
      );
    }

    return adminUploadRequest(
      `/uploads/${encodeURIComponent(
        safeFilename
      )}`,
      {
        method: "DELETE",
      }
    );
  };

// ========================================
// AUTH ERROR HELPER
// ========================================

export const isAdminUploadAuthError =
  (error) => {
    return (
      error?.status === 401 ||
      error?.status === 403
    );
  };

// ========================================
// EXTRACT SINGLE IMAGE URL
//
// Different controller response shapes
// safely support کرتا ہے.
// ========================================

export const extractSingleUploadedImage =
  (response) => {
    const candidate =
      response?.image ||
      response?.file ||
      response?.data?.image ||
      response?.data?.file ||
      response?.url ||
      response?.path ||
      null;

    if (
      typeof candidate ===
      "string"
    ) {
      return {
        url: candidate,
        filename:
          candidate
            .split("/")
            .pop() || "",
      };
    }

    if (
      candidate &&
      typeof candidate ===
        "object"
    ) {
      const url =
        candidate.url ||
        candidate.path ||
        candidate.location ||
        "";

      const filename =
        candidate.filename ||
        candidate.name ||
        url
          .split("/")
          .pop() ||
        "";

      return {
        ...candidate,
        url,
        filename,
      };
    }

    return null;
  };

// ========================================
// EXTRACT MULTIPLE IMAGES
// ========================================

export const extractMultipleUploadedImages =
  (response) => {
    const candidates =
      response?.images ||
      response?.files ||
      response?.data?.images ||
      response?.data?.files ||
      [];

    if (
      !Array.isArray(
        candidates
      )
    ) {
      return [];
    }

    return candidates
      .map((item) => {
        if (
          typeof item ===
          "string"
        ) {
          return {
            url: item,

            filename:
              item
                .split("/")
                .pop() || "",
          };
        }

        if (
          item &&
          typeof item ===
            "object"
        ) {
          const url =
            item.url ||
            item.path ||
            item.location ||
            "";

          return {
            ...item,

            url,

            filename:
              item.filename ||
              item.name ||
              url
                .split("/")
                .pop() ||
              "",
          };
        }

        return null;
      })
      .filter(Boolean);
  };

// ========================================
// GET FILENAME FROM URL
//
// Example:
//
// /uploads/product.jpg
// http://localhost:5000/uploads/product.jpg
//
// دونوں صورتوں میں:
// product.jpg
// ========================================

export const getUploadFilenameFromUrl =
  (url) => {
    if (!url) {
      return "";
    }

    try {
      const cleanUrl =
        String(url)
          .split("?")[0]
          .split("#")[0];

      return (
        decodeURIComponent(
          cleanUrl
            .split("/")
            .pop() || ""
        )
      );
    } catch {
      return "";
    }
  };

// ========================================
// IMAGE VALIDATION HELPER
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
        message: `Image size must be ${maxSizeMB} MB or smaller.`,
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
  uploadAdminSingleImage,
  uploadAdminMultipleImages,
  deleteAdminImage,
  isAdminUploadAuthError,
  extractSingleUploadedImage,
  extractMultipleUploadedImages,
  getUploadFilenameFromUrl,
  validateAdminImageFile,
};