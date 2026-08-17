import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CheckCircle2,
  Copy,
  Eye,
  FileImage,
  ImagePlus,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  deleteAdminImage,
  getAdminMediaLibrary,
  isAdminUploadAuthError,
  uploadAdminMultipleImages,
  uploadAdminSingleImage,
  validateAdminImageFile,
} from "../../services/adminUploads";

// ========================================
// HELPERS
// ========================================

const getMediaKey = (
  image,
  index = 0
) => {
  return (
    image?.publicId ||
    image?.public_id ||
    image?.filename ||
    image?._id ||
    image?.id ||
    image?.url ||
    `media-${index}`
  );
};

// ========================================
// MEDIA NAME
// ========================================

const getMediaName = (
  image
) => {
  return (
    image?.originalName ||
    image?.displayName ||
    image?.display_name ||
    image?.filename
      ?.split("/")
      ?.pop() ||
    image?.publicId
      ?.split("/")
      ?.pop() ||
    image?.url
      ?.split("/")
      ?.pop() ||
    "Image"
  );
};

// ========================================
// FORMAT FILE SIZE
// ========================================

const formatFileSize = (
  value
) => {
  const bytes =
    Number(value) || 0;

  if (bytes <= 0) {
    return "—";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (
    bytes <
    1024 * 1024
  ) {
    return `${(
      bytes / 1024
    ).toFixed(1)} KB`;
  }

  return `${(
    bytes /
    (1024 * 1024)
  ).toFixed(2)} MB`;
};

// ========================================
// FORMAT DATE
// ========================================

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-PK",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
};

// ========================================
// REMOVE DUPLICATE MEDIA
// ========================================

const mergeUniqueMedia = (
  currentImages,
  nextImages
) => {
  const map =
    new Map();

  [
    ...currentImages,
    ...nextImages,
  ].forEach(
    (image, index) => {
      const key =
        getMediaKey(
          image,
          index
        );

      map.set(
        key,
        image
      );
    }
  );

  return Array.from(
    map.values()
  );
};

// ========================================
// PAGE ALERT
// ========================================

const PageAlert = ({
  type = "success",
  message,
  onClose,
}) => {
  if (!message) {
    return null;
  }

  const success =
    type === "success";

  return (
    <div
      className={`
        mb-5
        flex
        items-start
        justify-between
        gap-4
        rounded-[14px]
        border
        px-4
        py-3.5

        ${
          success
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-red-200 bg-red-50 text-red-700"
        }
      `}
    >
      <div
        className="
          flex
          min-w-0
          items-start
          gap-3
        "
      >
        {success ? (
          <CheckCircle2
            size={19}
            className="
              mt-0.5
              shrink-0
            "
          />
        ) : (
          <X
            size={19}
            className="
              mt-0.5
              shrink-0
            "
          />
        )}

        <span
          className="
            text-[13px]
            font-semibold
            leading-5
          "
        >
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="
          shrink-0
          opacity-70
          transition
          hover:opacity-100
        "
        aria-label="Close message"
      >
        <X size={17} />
      </button>
    </div>
  );
};

// ========================================
// MEDIA CARD
// ========================================

const MediaCard = ({
  image,
  onPreview,
  onCopy,
  onDelete,
  deleting = false,
}) => {
  const imageUrl =
    image?.url ||
    image?.secureUrl ||
    image?.secure_url ||
    image?.path ||
    "";

  const imageName =
    getMediaName(
      image
    );

  const format =
    String(
      image?.format || ""
    ).toUpperCase();

  const width =
    Number(
      image?.width
    ) || 0;

  const height =
    Number(
      image?.height
    ) || 0;

  const size =
    Number(
      image?.size ??
        image?.bytes
    ) || 0;

  return (
    <article
      className="
        group
        min-w-0
        overflow-hidden
        rounded-[15px]
        border
        border-[#e7e7e7]
        bg-white
        transition
        duration-200
        hover:border-[#d8d8d8]
        hover:shadow-[0_8px_28px_rgba(0,0,0,0.05)]
      "
    >
      {/* ===============================
          IMAGE
      =============================== */}

      <div
        className="
          relative
          aspect-square
          overflow-hidden
          bg-[#f7f8f5]
        "
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageName}
            loading="lazy"
            className="
              h-full
              w-full
              object-contain
              p-2
              transition
              duration-300
              group-hover:scale-[1.02]
            "
          />
        ) : (
          <div
            className="
              flex
              h-full
              w-full
              items-center
              justify-center
              text-gray-300
            "
          >
            <FileImage
              size={45}
            />
          </div>
        )}

        {/* =============================
            HOVER ACTIONS
        ============================= */}

        <div
          className="
            absolute
            inset-x-0
            bottom-0
            flex
            translate-y-full
            items-center
            justify-center
            gap-2
            bg-black/60
            px-3
            py-3
            opacity-0
            backdrop-blur-[2px]
            transition-all
            duration-200

            group-hover:translate-y-0
            group-hover:opacity-100
          "
        >
          <button
            type="button"
            onClick={() =>
              onPreview(image)
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white
              text-[#333]
              transition
              hover:bg-[var(--primary-color)]
              hover:text-white
            "
            title="Preview"
          >
            <Eye size={15} />
          </button>

          <button
            type="button"
            onClick={() =>
              onCopy(image)
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white
              text-[#333]
              transition
              hover:bg-[var(--primary-color)]
              hover:text-white
            "
            title="Copy image URL"
          >
            <Copy size={14} />
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={() =>
              onDelete(image)
            }
            className="
              flex
              h-9
              w-9
              items-center
              justify-center
              rounded-full
              bg-white
              text-red-500
              transition
              hover:bg-red-500
              hover:text-white
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
            title="Delete image"
          >
            {deleting ? (
              <Loader2
                size={15}
                className="
                  animate-spin
                "
              />
            ) : (
              <Trash2
                size={14}
              />
            )}
          </button>
        </div>
      </div>

      {/* ===============================
          INFORMATION
      =============================== */}

      <div
        className="
          min-w-0
          p-3.5
        "
      >
        <div
          className="
            truncate
            text-[12px]
            font-bold
            text-[#333]
          "
          title={imageName}
        >
          {imageName}
        </div>

        <div
          className="
            mt-2
            flex
            flex-wrap
            items-center
            gap-x-2
            gap-y-1
            text-[10px]
            text-[#999]
          "
        >
          {format && (
            <span>
              {format}
            </span>
          )}

          {width > 0 &&
            height > 0 && (
              <>
                <span>
                  •
                </span>

                <span>
                  {width} ×{" "}
                  {height}
                </span>
              </>
            )}

          {size > 0 && (
            <>
              <span>
                •
              </span>

              <span>
                {formatFileSize(
                  size
                )}
              </span>
            </>
          )}
        </div>

        <div
          className="
            mt-2
            text-[10px]
            text-[#aaa]
          "
        >
          {formatDate(
            image?.createdAt ||
              image?.created_at
          )}
        </div>
      </div>
    </article>
  );
};

// ========================================
// PREVIEW MODAL
// ========================================

const PreviewModal = ({
  image,
  onClose,
  onCopy,
}) => {
  if (!image) {
    return null;
  }

  const imageUrl =
    image?.url ||
    image?.secureUrl ||
    image?.secure_url ||
    image?.path ||
    "";

  const imageName =
    getMediaName(
      image
    );

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/70
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(
        event
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-[1000px]
          flex-col
          overflow-hidden
          rounded-[18px]
          bg-white
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            border-b
            border-[#eeeeee]
            px-5
            py-4
          "
        >
          <div
            className="
              min-w-0
            "
          >
            <div
              className="
                truncate
                text-[14px]
                font-black
                text-[#222]
              "
            >
              {imageName}
            </div>

            <div
              className="
                mt-1
                text-[10px]
                text-[#999]
              "
            >
              Media preview
            </div>
          </div>

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
            "
          >
            <button
              type="button"
              onClick={() =>
                onCopy(image)
              }
              className="
                flex
                h-9
                items-center
                gap-2
                rounded-[9px]
                border
                border-[#e5e5e5]
                bg-white
                px-3
                text-[11px]
                font-semibold
                text-[#555]
                transition
                hover:border-[var(--primary-color)]
                hover:text-[var(--primary-color)]
              "
            >
              <Copy size={14} />

              Copy URL
            </button>

            <button
              type="button"
              onClick={onClose}
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-[9px]
                bg-[#f5f5f5]
                text-[#555]
                transition
                hover:bg-[#eeeeee]
              "
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* IMAGE */}

        <div
          className="
            flex
            min-h-0
            flex-1
            items-center
            justify-center
            overflow-auto
            bg-[#f4f5f2]
            p-5
          "
        >
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={imageName}
              className="
                max-h-[72vh]
                max-w-full
                object-contain
              "
            />
          ) : (
            <FileImage
              size={70}
              className="
                text-gray-300
              "
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ========================================
// ADMIN MEDIA PAGE
// ========================================

const AdminMediaPage = () => {
  const navigate =
    useNavigate();

  const fileInputRef =
    useRef(null);

  // ======================================
  // LIBRARY STATE
  // ======================================

  const [
    images,
    setImages,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadingMore,
    setLoadingMore,
  ] = useState(false);

  const [
    pagination,
    setPagination,
  ] = useState({
    hasMore: false,
    nextCursor: null,
  });

  // ======================================
  // UPLOAD STATE
  // ======================================

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState([]);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    dragActive,
    setDragActive,
  ] = useState(false);

  // ======================================
  // OTHER STATE
  // ======================================

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    previewImage,
    setPreviewImage,
  ] = useState(null);

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  // ======================================
  // AUTH ERROR
  // ======================================

  const handleAuthError =
    useCallback(
      (requestError) => {
        if (
          isAdminUploadAuthError(
            requestError
          )
        ) {
          navigate(
            "/admin/login",
            {
              replace: true,
            }
          );

          return true;
        }

        return false;
      },
      [navigate]
    );

  // ======================================
  // LOAD MEDIA
  // ======================================

  const loadMedia =
    useCallback(
      async ({
        append = false,
        cursor = "",
      } = {}) => {
        try {
          if (append) {
            setLoadingMore(
              true
            );
          } else {
            setLoading(true);
          }

          setError("");

          const response =
            await getAdminMediaLibrary({
              limit: 30,
              cursor,
            });

          const nextImages =
            Array.isArray(
              response?.images
            )
              ? response.images
              : [];

          if (append) {
            setImages(
              (current) =>
                mergeUniqueMedia(
                  current,
                  nextImages
                )
            );
          } else {
            setImages(
              nextImages
            );
          }

          setPagination({
            hasMore:
              Boolean(
                response
                  ?.pagination
                  ?.hasMore
              ),

            nextCursor:
              response
                ?.pagination
                ?.nextCursor ||
              response
                ?.nextCursor ||
              null,
          });
        } catch (
          requestError
        ) {
          console.error(
            "Media Library Error:",
            requestError
          );

          if (
            handleAuthError(
              requestError
            )
          ) {
            return;
          }

          setError(
            requestError
              ?.message ||
              "Unable to load media library."
          );
        } finally {
          if (append) {
            setLoadingMore(
              false
            );
          } else {
            setLoading(false);
          }
        }
      },
      [handleAuthError]
    );

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    loadMedia();
  }, [loadMedia]);

  // ======================================
  // FILE VALIDATION / SELECTION
  // ======================================

  const acceptFiles =
    useCallback(
      (fileList) => {
        const incoming =
          Array.from(
            fileList || []
          );

        if (
          incoming.length ===
          0
        ) {
          return;
        }

        if (
          incoming.length >
          10
        ) {
          setError(
            "You can upload a maximum of 10 images at one time."
          );

          return;
        }

        const validFiles =
          [];

        for (
          const file of incoming
        ) {
          const validation =
            validateAdminImageFile(
              file,
              {
                maxSizeMB: 5,
              }
            );

          if (
            !validation.valid
          ) {
            setError(
              `${file.name}: ${validation.message}`
            );

            return;
          }

          validFiles.push(
            file
          );
        }

        setSelectedFiles(
          validFiles
        );

        setError("");
        setSuccess("");
      },
      []
    );

  // ======================================
  // FILE INPUT
  // ======================================

  const handleFileChange = (
    event
  ) => {
    acceptFiles(
      event.target.files
    );
  };

  // ======================================
  // DRAG / DROP
  // ======================================

  const handleDragOver = (
    event
  ) => {
    event.preventDefault();

    setDragActive(true);
  };

  const handleDragLeave = (
    event
  ) => {
    event.preventDefault();

    setDragActive(false);
  };

  const handleDrop = (
    event
  ) => {
    event.preventDefault();

    setDragActive(false);

    acceptFiles(
      event.dataTransfer.files
    );
  };

  // ======================================
  // REMOVE SELECTED FILE
  // ======================================

  const removeSelectedFile = (
    index
  ) => {
    setSelectedFiles(
      (current) =>
        current.filter(
          (_, fileIndex) =>
            fileIndex !==
            index
        )
    );

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  };

  // ======================================
  // CLEAR FILES
  // ======================================

  const clearSelectedFiles =
    () => {
      setSelectedFiles([]);

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

  // ======================================
  // UPLOAD
  // ======================================

  const handleUpload =
    async () => {
      if (
        selectedFiles.length ===
        0
      ) {
        setError(
          "Please select at least one image."
        );

        return;
      }

      try {
        setUploading(true);
        setError("");
        setSuccess("");

        if (
          selectedFiles.length ===
          1
        ) {
          await uploadAdminSingleImage(
            selectedFiles[0]
          );
        } else {
          await uploadAdminMultipleImages(
            selectedFiles
          );
        }

        const uploadedCount =
          selectedFiles.length;

        clearSelectedFiles();

        setSuccess(
          `${uploadedCount} image${
            uploadedCount === 1
              ? ""
              : "s"
          } uploaded successfully.`
        );

        await loadMedia({
          append: false,
        });
      } catch (
        requestError
      ) {
        console.error(
          "Media Upload Error:",
          requestError
        );

        if (
          handleAuthError(
            requestError
          )
        ) {
          return;
        }

        setError(
          requestError
            ?.message ||
            "Unable to upload image."
        );
      } finally {
        setUploading(false);
      }
    };

  // ======================================
  // REFRESH
  // ======================================

  const handleRefresh =
    async () => {
      setSuccess("");

      await loadMedia({
        append: false,
      });
    };

  // ======================================
  // LOAD MORE
  // ======================================

  const handleLoadMore =
    async () => {
      if (
        !pagination.hasMore ||
        !pagination.nextCursor ||
        loadingMore
      ) {
        return;
      }

      await loadMedia({
        append: true,

        cursor:
          pagination.nextCursor,
      });
    };

  // ======================================
  // COPY URL
  // ======================================

  const handleCopyUrl =
    async (image) => {
      const url =
        image?.url ||
        image?.secureUrl ||
        image?.secure_url ||
        image?.path ||
        "";

      if (!url) {
        setError(
          "Image URL is not available."
        );

        return;
      }

      try {
        if (
          navigator.clipboard &&
          window.isSecureContext
        ) {
          await navigator.clipboard.writeText(
            url
          );
        } else {
          const textarea =
            document.createElement(
              "textarea"
            );

          textarea.value =
            url;

          textarea.style.position =
            "fixed";

          textarea.style.opacity =
            "0";

          document.body.appendChild(
            textarea
          );

          textarea.focus();
          textarea.select();

          document.execCommand(
            "copy"
          );

          document.body.removeChild(
            textarea
          );
        }

        setError("");

        setSuccess(
          "Image URL copied to clipboard."
        );
      } catch (
        copyError
      ) {
        console.error(
          "Copy URL Error:",
          copyError
        );

        setError(
          "Unable to copy image URL."
        );
      }
    };

  // ======================================
  // DELETE
  // ======================================

  const handleDelete =
    async (image) => {
      const imageName =
        getMediaName(
          image
        );

      const confirmed =
        window.confirm(
          `Delete "${imageName}"?\n\nThis will permanently remove the image from the media library.`
        );

      if (!confirmed) {
        return;
      }

      const key =
        getMediaKey(
          image
        );

      try {
        setDeletingId(
          key
        );

        setError("");
        setSuccess("");

        await deleteAdminImage(
          image
        );

        setImages(
          (current) =>
            current.filter(
              (
                currentImage,
                index
              ) =>
                getMediaKey(
                  currentImage,
                  index
                ) !== key
            )
        );

        if (
          getMediaKey(
            previewImage
          ) === key
        ) {
          setPreviewImage(
            null
          );
        }

        setSuccess(
          "Image deleted successfully."
        );
      } catch (
        requestError
      ) {
        console.error(
          "Delete Media Error:",
          requestError
        );

        if (
          handleAuthError(
            requestError
          )
        ) {
          return;
        }

        setError(
          requestError
            ?.message ||
            "Unable to delete image."
        );
      } finally {
        setDeletingId(
          ""
        );
      }
    };

  // ======================================
  // FILTERED MEDIA
  // ======================================

  const filteredImages =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return images;
      }

      return images.filter(
        (image) => {
          const searchable =
            [
              getMediaName(
                image
              ),

              image?.publicId,

              image?.public_id,

              image?.filename,

              image?.format,
            ]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();

          return searchable.includes(
            query
          );
        }
      );
    }, [
      images,
      search,
    ]);

  // ======================================
  // PAGE
  // ======================================

  return (
    <>
      {/* =================================
          ALERTS
      ================================= */}

      <PageAlert
        type="success"
        message={success}
        onClose={() =>
          setSuccess("")
        }
      />

      <PageAlert
        type="error"
        message={error}
        onClose={() =>
          setError("")
        }
      />

      {/* =================================
          UPLOAD CARD
      ================================= */}

      <section
        className="
          overflow-hidden
          rounded-[16px]
          border
          border-[#e4e5e2]
          bg-white
          shadow-[0_2px_10px_rgba(0,0,0,0.025)]
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-[#eeeeee]
            px-5
            py-5
            sm:flex-row
            sm:items-center
            sm:justify-between
            lg:px-6
          "
        >
          <div>
            <h1
              className="
                text-[20px]
                font-black
                text-[#222]
              "
            >
              Media Library
            </h1>

            <p
              className="
                mt-1
                text-[11px]
                leading-5
                text-[#888]
              "
            >
              Upload and manage
              store images from
              one place.
            </p>
          </div>

          <button
            type="button"
            disabled={
              loading ||
              uploading
            }
            onClick={
              handleRefresh
            }
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-[10px]
              border
              border-[#e1e1e1]
              bg-white
              px-4
              text-[11px]
              font-bold
              text-[#555]
              transition
              hover:border-[var(--primary-color)]
              hover:text-[var(--primary-color)]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RefreshCw
              size={14}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />

            Refresh
          </button>
        </div>

        {/* UPLOAD AREA */}

        <div
          className="
            p-5
            lg:p-6
          "
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={
              handleFileChange
            }
            className="hidden"
          />

          <div
            onDragOver={
              handleDragOver
            }
            onDragLeave={
              handleDragLeave
            }
            onDrop={
              handleDrop
            }
            className={`
              rounded-[15px]
              border-2
              border-dashed
              px-5
              py-8
              text-center
              transition

              ${
                dragActive
                  ? "border-[var(--primary-color)] bg-[#f5f9ee]"
                  : "border-[#dfe3d9] bg-[#fafbf8]"
              }
            `}
          >
            <div
              className="
                mx-auto
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-full
                bg-[#eef5e4]
                text-[var(--primary-color)]
              "
            >
              <UploadCloud
                size={25}
              />
            </div>

            <h2
              className="
                mt-4
                text-[15px]
                font-black
                text-[#252525]
              "
            >
              Upload images
            </h2>

            <p
              className="
                mx-auto
                mt-2
                max-w-[500px]
                text-[11px]
                leading-5
                text-[#888]
              "
            >
              Drag and drop
              images here, or
              choose files from
              your computer.
              Maximum 10 images
              per upload and 5 MB
              per image.
            </p>

            <button
              type="button"
              disabled={uploading}
              onClick={() =>
                fileInputRef
                  .current
                  ?.click()
              }
              className="
                mt-5
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-[10px]
                bg-[var(--primary-color)]
                px-5
                text-[11px]
                font-bold
                text-white
                transition
                hover:opacity-90
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              <ImagePlus
                size={15}
              />

              Choose images
            </button>
          </div>

          {/* =============================
              SELECTED FILES
          ============================= */}

          {selectedFiles.length >
            0 && (
            <div
              className="
                mt-5
                rounded-[14px]
                border
                border-[#eeeeee]
                bg-white
              "
            >
              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                  border-b
                  border-[#eeeeee]
                  px-4
                  py-3
                "
              >
                <div>
                  <div
                    className="
                      text-[12px]
                      font-bold
                      text-[#333]
                    "
                  >
                    Selected images
                  </div>

                  <div
                    className="
                      mt-0.5
                      text-[10px]
                      text-[#999]
                    "
                  >
                    {
                      selectedFiles.length
                    }{" "}
                    file
                    {selectedFiles.length ===
                    1
                      ? ""
                      : "s"}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={
                    uploading
                  }
                  onClick={
                    clearSelectedFiles
                  }
                  className="
                    text-[10px]
                    font-bold
                    text-red-500
                    transition
                    hover:text-red-600
                    disabled:opacity-50
                  "
                >
                  Clear all
                </button>
              </div>

              <div
                className="
                  divide-y
                  divide-[#eeeeee]
                "
              >
                {selectedFiles.map(
                  (
                    file,
                    index
                  ) => (
                    <div
                      key={`${file.name}-${file.size}-${index}`}
                      className="
                        flex
                        items-center
                        gap-3
                        px-4
                        py-3
                      "
                    >
                      <div
                        className="
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-[9px]
                          bg-[#f2f6ec]
                          text-[var(--primary-color)]
                        "
                      >
                        <FileImage
                          size={18}
                        />
                      </div>

                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >
                        <div
                          className="
                            truncate
                            text-[11px]
                            font-semibold
                            text-[#444]
                          "
                        >
                          {
                            file.name
                          }
                        </div>

                        <div
                          className="
                            mt-1
                            text-[9px]
                            text-[#aaa]
                          "
                        >
                          {formatFileSize(
                            file.size
                          )}
                        </div>
                      </div>

                      <button
                        type="button"
                        disabled={
                          uploading
                        }
                        onClick={() =>
                          removeSelectedFile(
                            index
                          )
                        }
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-full
                          text-[#999]
                          transition
                          hover:bg-red-50
                          hover:text-red-500
                          disabled:opacity-40
                        "
                      >
                        <X
                          size={15}
                        />
                      </button>
                    </div>
                  )
                )}
              </div>

              <div
                className="
                  flex
                  justify-end
                  border-t
                  border-[#eeeeee]
                  bg-[#fafafa]
                  px-4
                  py-3
                "
              >
                <button
                  type="button"
                  disabled={
                    uploading
                  }
                  onClick={
                    handleUpload
                  }
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-[10px]
                    bg-[var(--primary-color)]
                    px-5
                    text-[11px]
                    font-bold
                    text-white
                    transition
                    hover:opacity-90
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {uploading ? (
                    <>
                      <Loader2
                        size={15}
                        className="
                          animate-spin
                        "
                      />

                      Uploading...
                    </>
                  ) : (
                    <>
                      <UploadCloud
                        size={15}
                      />

                      Upload{" "}
                      {
                        selectedFiles.length
                      }{" "}
                      image
                      {selectedFiles.length ===
                      1
                        ? ""
                        : "s"}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =================================
          MEDIA LIBRARY CARD
      ================================= */}

      <section
        className="
          mt-5
          overflow-hidden
          rounded-[16px]
          border
          border-[#e4e5e2]
          bg-white
          shadow-[0_2px_10px_rgba(0,0,0,0.025)]
        "
      >
        {/* LIBRARY HEADER */}

        <div
          className="
            flex
            flex-col
            gap-4
            border-b
            border-[#eeeeee]
            px-5
            py-5
            md:flex-row
            md:items-center
            md:justify-between
            lg:px-6
          "
        >
          <div>
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <h2
                className="
                  text-[16px]
                  font-black
                  text-[#222]
                "
              >
                Uploaded media
              </h2>

              <span
                className="
                  rounded-full
                  bg-[#f1f5eb]
                  px-2.5
                  py-1
                  text-[9px]
                  font-bold
                  text-[var(--primary-color)]
                "
              >
                {images.length}
              </span>
            </div>

            <p
              className="
                mt-1
                text-[10px]
                text-[#999]
              "
            >
              Browse, preview,
              copy or remove your
              uploaded images.
            </p>
          </div>

          {/* SEARCH */}

          <div
            className="
              relative
              w-full
              md:max-w-[300px]
            "
          >
            <Search
              size={14}
              className="
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-[#aaa]
              "
            />

            <input
              type="text"
              value={search}
              onChange={(
                event
              ) =>
                setSearch(
                  event.target
                    .value
                )
              }
              placeholder="Search media..."
              className="
                h-10
                w-full
                rounded-[10px]
                border
                border-[#e2e2e2]
                bg-white
                pl-9
                pr-9
                text-[11px]
                text-[#444]
                outline-none
                transition
                placeholder:text-[#aaa]
                focus:border-[var(--primary-color)]
              "
            />

            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                className="
                  absolute
                  right-3
                  top-1/2
                  -translate-y-1/2
                  text-[#aaa]
                  hover:text-[#555]
                "
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ===============================
            LIBRARY CONTENT
        =============================== */}

        <div
          className="
            p-5
            lg:p-6
          "
        >
          {/* LOADING */}

          {loading ? (
            <div
              className="
                grid
                grid-cols-2
                gap-3
                sm:grid-cols-3
                md:grid-cols-4
                xl:grid-cols-5
                2xl:grid-cols-6
              "
            >
              {Array.from({
                length: 12,
              }).map(
                (_, index) => (
                  <div
                    key={index}
                    className="
                      overflow-hidden
                      rounded-[15px]
                      border
                      border-[#eeeeee]
                      bg-white
                    "
                  >
                    <div
                      className="
                        aspect-square
                        animate-pulse
                        bg-[#f2f2f2]
                      "
                    />

                    <div
                      className="
                        p-3
                      "
                    >
                      <div
                        className="
                          h-3
                          w-4/5
                          animate-pulse
                          rounded
                          bg-[#eeeeee]
                        "
                      />

                      <div
                        className="
                          mt-2
                          h-2.5
                          w-1/2
                          animate-pulse
                          rounded
                          bg-[#f1f1f1]
                        "
                      />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : filteredImages.length >
            0 ? (
            <>
              <div
                className="
                  grid
                  grid-cols-2
                  gap-3
                  sm:grid-cols-3
                  md:grid-cols-4
                  xl:grid-cols-5
                  2xl:grid-cols-6
                "
              >
                {filteredImages.map(
                  (
                    image,
                    index
                  ) => {
                    const key =
                      getMediaKey(
                        image,
                        index
                      );

                    return (
                      <MediaCard
                        key={key}
                        image={
                          image
                        }
                        deleting={
                          deletingId ===
                          key
                        }
                        onPreview={
                          setPreviewImage
                        }
                        onCopy={
                          handleCopyUrl
                        }
                        onDelete={
                          handleDelete
                        }
                      />
                    );
                  }
                )}
              </div>

              {/* ===========================
                  LOAD MORE
              =========================== */}

              {!search &&
                pagination.hasMore && (
                  <div
                    className="
                      mt-7
                      flex
                      justify-center
                    "
                  >
                    <button
                      type="button"
                      disabled={
                        loadingMore
                      }
                      onClick={
                        handleLoadMore
                      }
                      className="
                        inline-flex
                        h-10
                        items-center
                        justify-center
                        gap-2
                        rounded-[10px]
                        border
                        border-[#dedede]
                        bg-white
                        px-5
                        text-[11px]
                        font-bold
                        text-[#555]
                        transition
                        hover:border-[var(--primary-color)]
                        hover:text-[var(--primary-color)]
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                      "
                    >
                      {loadingMore ? (
                        <>
                          <Loader2
                            size={14}
                            className="
                              animate-spin
                            "
                          />

                          Loading...
                        </>
                      ) : (
                        <>
                          <ImagePlus
                            size={14}
                          />

                          Load more
                        </>
                      )}
                    </button>
                  </div>
                )}
            </>
          ) : (
            /* EMPTY */

            <div
              className="
                flex
                min-h-[300px]
                flex-col
                items-center
                justify-center
                rounded-[14px]
                border
                border-dashed
                border-[#e1e4dc]
                bg-[#fafbf8]
                px-5
                py-10
                text-center
              "
            >
              <div
                className="
                  flex
                  h-14
                  w-14
                  items-center
                  justify-center
                  rounded-full
                  bg-[#eef5e4]
                  text-[var(--primary-color)]
                "
              >
                <FileImage
                  size={25}
                />
              </div>

              <h3
                className="
                  mt-4
                  text-[14px]
                  font-black
                  text-[#333]
                "
              >
                {search
                  ? "No matching media found"
                  : "No media uploaded yet"}
              </h3>

              <p
                className="
                  mt-2
                  max-w-[380px]
                  text-[11px]
                  leading-5
                  text-[#999]
                "
              >
                {search
                  ? "Try another search term or clear the search."
                  : "Upload your first image using the upload area above."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* =================================
          PREVIEW
      ================================= */}

      <PreviewModal
        image={previewImage}
        onClose={() =>
          setPreviewImage(
            null
          )
        }
        onCopy={
          handleCopyUrl
        }
      />
    </>
  );
};

export default AdminMediaPage;