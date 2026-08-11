import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Edit3,
  FolderTree,
  ImagePlus,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  Trash2,
  Upload,
  X,
  XCircle,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import {
  getImageUrl,
} from "../../services/api";

import {
  buildCategoryPayload,
  createAdminCategory,
  deleteAdminCategory,
  extractAdminCategories,
  getAdminCategories,
  getMainAdminCategories,
  getParentCategoryId,
  getParentCategoryName,
  isAdminCategoryAuthError,
  isMainCategory,
  updateAdminCategory,
} from "../../services/adminCategories";

import {
  deleteAdminImage,
  extractSingleUploadedImage,
  uploadAdminSingleImage,
} from "../../services/adminUploads";

// ========================================
// EMPTY FORM
// ========================================

const createEmptyForm = () => ({
  name: "",
  description: "",
  image: "",

  categoryType: "main",

  parentCategory: "",

  sortOrder: 0,

  isActive: true,

  _newUploadFilename: "",
});

// ========================================
// FILE NAME FROM UPLOAD PATH
// ========================================

const getFilenameFromImage = (
  value
) => {
  if (!value) {
    return "";
  }

  try {
    return decodeURIComponent(
      value
        .split("/")
        .pop()
        .split("?")[0]
    );
  } catch {
    return "";
  }
};

// ========================================
// IMAGE VALIDATION
// ========================================

const validateImageFile = (
  file
) => {
  if (!file) {
    return "Please select an image.";
  }

  if (
    !file.type?.startsWith(
      "image/"
    )
  ) {
    return "Please select a valid image file.";
  }

  const maxSize =
    5 * 1024 * 1024;

  if (file.size > maxSize) {
    return "Image size must be 5 MB or less.";
  }

  return "";
};

// ========================================
// ALERT
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
        mb-6
        flex
        items-start
        justify-between
        gap-4
        rounded-2xl
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
          items-start
          gap-3
        "
      >
        {success ? (
          <CheckCircle2
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />
        ) : (
          <XCircle
            size={20}
            className="
              mt-0.5
              shrink-0
            "
          />
        )}

        <span
          className="
            text-sm
            font-semibold
          "
        >
          {message}
        </span>
      </div>

      <button
        type="button"
        onClick={onClose}
      >
        <X size={18} />
      </button>
    </div>
  );
};

// ========================================
// TOGGLE
// ========================================

const Toggle = ({
  checked,
  onChange,
  disabled = false,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() =>
        onChange(!checked)
      }
      className={`
        relative
        h-6
        w-11
        rounded-full
        transition

        ${
          checked
            ? "bg-[#6f9a37]"
            : "bg-gray-300"
        }

        ${
          disabled
            ? "cursor-not-allowed opacity-50"
            : ""
        }
      `}
    >
      <span
        className={`
          absolute
          top-[3px]
          h-[18px]
          w-[18px]
          rounded-full
          bg-white
          shadow
          transition-all

          ${
            checked
              ? "left-[23px]"
              : "left-[3px]"
          }
        `}
      />
    </button>
  );
};

// ========================================
// ADMIN CATEGORIES PAGE
// ========================================

const AdminCategoriesPage = () => {
  const navigate =
    useNavigate();

  // ======================================
  // DATA
  // ======================================

  const [
    categories,
    setCategories,
  ] = useState([]);

  const [
    mainCategories,
    setMainCategories,
  ] = useState([]);

  // ======================================
  // FORM
  // ======================================

  const [
    form,
    setForm,
  ] = useState(
    createEmptyForm()
  );

  const [
    editingId,
    setEditingId,
  ] = useState("");

  // ======================================
  // UI
  // ======================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    uploading,
    setUploading,
  ] = useState(false);

  const [
    deletingId,
    setDeletingId,
  ] = useState("");

  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const [
    expandedCategories,
    setExpandedCategories,
  ] = useState({});

  // ======================================
  // AUTH ERROR
  // ======================================

  const handleAuthError = (
    error
  ) => {
    if (
      isAdminCategoryAuthError(
        error
      ) ||
      error?.status === 401 ||
      error?.status === 403
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
  };

  // ======================================
  // LOAD CATEGORIES
  // ======================================

  const loadCategories =
    async ({
      showLoader = true,
    } = {}) => {
      try {
        if (showLoader) {
          setLoading(true);
        }

        setErrorMessage("");

        const [
          allResponse,
          mainResponse,
        ] =
          await Promise.all([
            getAdminCategories(),
            getMainAdminCategories(),
          ]);

        setCategories(
          extractAdminCategories(
            allResponse
          )
        );

        setMainCategories(
          extractAdminCategories(
            mainResponse
          )
        );
      } catch (error) {
        if (
          handleAuthError(error)
        ) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "Failed to load categories."
        );
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    };

  // ======================================
  // INITIAL LOAD
  // ======================================

  useEffect(() => {
    loadCategories();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ======================================
  // CATEGORY TREE
  // ======================================

  const categoryTree =
    useMemo(() => {
      const mains =
        categories.filter(
          (category) =>
            isMainCategory(
              category
            )
        );

      const children =
        categories.filter(
          (category) =>
            !isMainCategory(
              category
            )
        );

      return mains
        .map((main) => ({
          ...main,

          children:
            children
              .filter(
                (child) => {
                  const parentId =
                    getParentCategoryId(
                      child
                    );

                  return (
                    parentId?.toString() ===
                    main._id?.toString()
                  );
                }
              )
              .sort(
                (a, b) =>
                  Number(
                    a.sortOrder || 0
                  ) -
                    Number(
                      b.sortOrder || 0
                    ) ||
                  a.name.localeCompare(
                    b.name
                  )
              ),
        }))
        .sort(
          (a, b) =>
            Number(
              a.sortOrder || 0
            ) -
              Number(
                b.sortOrder || 0
              ) ||
            a.name.localeCompare(
              b.name
            )
        );
    }, [categories]);

  // ======================================
  // COUNTS
  // ======================================

  const mainCount =
    useMemo(
      () =>
        categories.filter(
          (category) =>
            isMainCategory(
              category
            )
        ).length,
      [categories]
    );

  const subcategoryCount =
    categories.length -
    mainCount;

  // ======================================
  // UPDATE FORM
  // ======================================

  const updateForm = (
    field,
    value
  ) => {
    setForm(
      (current) => ({
        ...current,

        [field]: value,
      })
    );

    setSuccessMessage("");
  };

  // ======================================
  // CATEGORY TYPE CHANGE
  // ======================================

  const changeCategoryType = (
    type
  ) => {
    setForm(
      (current) => ({
        ...current,

        categoryType: type,

        parentCategory:
          type === "main"
            ? ""
            : current.parentCategory,
      })
    );
  };

  // ======================================
  // DELETE TEMP UPLOAD
  // ======================================

  const deleteTemporaryUpload =
    async (filename) => {
      if (!filename) {
        return;
      }

      try {
        await deleteAdminImage(
          filename
        );
      } catch {
        // Non-blocking cleanup.
      }
    };

  // ======================================
  // UPLOAD IMAGE
  // ======================================

  const handleImageUpload =
    async (file) => {
      const validationError =
        validateImageFile(file);

      if (validationError) {
        setErrorMessage(
          validationError
        );

        return;
      }

      try {
        setUploading(true);

        setErrorMessage("");
        setSuccessMessage("");

        const response =
          await uploadAdminSingleImage(
            file
          );

        const uploaded =
          extractSingleUploadedImage(
            response
          );

        const uploadedPath =
          uploaded?.path ||
          uploaded?.url ||
          "";

        if (!uploadedPath) {
          throw new Error(
            "Image uploaded but no path was returned."
          );
        }

        if (
          form._newUploadFilename
        ) {
          await deleteTemporaryUpload(
            form._newUploadFilename
          );
        }

        const filename =
          uploaded?.filename ||
          getFilenameFromImage(
            uploadedPath
          );

        setForm(
          (current) => ({
            ...current,

            image:
              uploadedPath,

            _newUploadFilename:
              filename,
          })
        );

        setSuccessMessage(
          "Category image uploaded. Save the category to publish it."
        );
      } catch (error) {
        if (
          handleAuthError(error)
        ) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "Failed to upload category image."
        );
      } finally {
        setUploading(false);
      }
    };

  // ======================================
  // REMOVE IMAGE
  // ======================================

  const removeImage =
    async () => {
      if (
        form._newUploadFilename
      ) {
        await deleteTemporaryUpload(
          form._newUploadFilename
        );
      }

      setForm(
        (current) => ({
          ...current,

          image: "",

          _newUploadFilename:
            "",
        })
      );
    };

  // ======================================
  // RESET FORM
  // ======================================

  const resetForm =
    async ({
      cleanupUpload = true,
    } = {}) => {
      if (
        cleanupUpload &&
        form._newUploadFilename
      ) {
        await deleteTemporaryUpload(
          form._newUploadFilename
        );
      }

      setForm(
        createEmptyForm()
      );

      setEditingId("");
    };

  // ======================================
  // EDIT CATEGORY
  // ======================================

  const handleEdit =
    async (category) => {
      if (
        form._newUploadFilename
      ) {
        await deleteTemporaryUpload(
          form._newUploadFilename
        );
      }

      const parentId =
        getParentCategoryId(
          category
        );

      setEditingId(
        category._id
      );

      setForm({
        name:
          category.name || "",

        description:
          category.description ||
          "",

        image:
          category.image || "",

        categoryType:
          parentId
            ? "sub"
            : "main",

        parentCategory:
          parentId || "",

        sortOrder:
          Number(
            category.sortOrder ||
              0
          ),

        isActive:
          category.isActive !==
          false,

        _newUploadFilename:
          "",
      });

      setErrorMessage("");
      setSuccessMessage("");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

  // ======================================
  // VALIDATE
  // ======================================

  const validateForm = () => {
    if (
      !form.name?.trim()
    ) {
      setErrorMessage(
        "Category name is required."
      );

      return false;
    }

    if (
      form.categoryType ===
        "sub" &&
      !form.parentCategory
    ) {
      setErrorMessage(
        "Please select a Parent Category for this subcategory."
      );

      return false;
    }

    if (
      Number(form.sortOrder) < 0
    ) {
      setErrorMessage(
        "Sort order cannot be negative."
      );

      return false;
    }

    return true;
  };

  // ======================================
  // SAVE CATEGORY
  // ======================================

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        setSaving(true);

        setErrorMessage("");
        setSuccessMessage("");

        const payload =
          buildCategoryPayload(
            form
          );

        if (editingId) {
          await updateAdminCategory(
            editingId,
            payload
          );

          setSuccessMessage(
            "Category updated successfully."
          );
        } else {
          await createAdminCategory(
            payload
          );

          setSuccessMessage(
            form.categoryType ===
              "sub"
              ? "Subcategory created successfully."
              : "Main category created successfully."
          );
        }

        await resetForm({
          cleanupUpload: false,
        });

        await loadCategories({
          showLoader: false,
        });
      } catch (error) {
        if (
          handleAuthError(error)
        ) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "Failed to save category."
        );
      } finally {
        setSaving(false);
      }
    };

  // ======================================
  // DELETE CATEGORY
  // ======================================

  const handleDelete =
    async (category) => {
      const categoryType =
        isMainCategory(
          category
        )
          ? "main category"
          : "subcategory";

      const confirmed =
        window.confirm(
          `Delete ${category.name}?\n\nThis ${categoryType} will be permanently removed if it is not being used by products or subcategories.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setDeletingId(
          category._id
        );

        setErrorMessage("");
        setSuccessMessage("");

        await deleteAdminCategory(
          category._id
        );

        if (
          editingId ===
          category._id
        ) {
          await resetForm();
        }

        await loadCategories({
          showLoader: false,
        });

        setSuccessMessage(
          "Category deleted successfully."
        );
      } catch (error) {
        if (
          handleAuthError(error)
        ) {
          return;
        }

        setErrorMessage(
          error?.message ||
            "Failed to delete category."
        );
      } finally {
        setDeletingId("");
      }
    };

  // ======================================
  // EXPAND CATEGORY
  // ======================================

  const toggleExpanded = (
    id
  ) => {
    setExpandedCategories(
      (current) => ({
        ...current,

        [id]:
          current[id] === false
            ? true
            : !current[id],
      })
    );
  };

  // ======================================
  // AVAILABLE PARENTS
  //
  // Do not allow currently edited main
  // category to select itself.
  // ======================================

  const availableParents =
    mainCategories.filter(
      (category) =>
        category._id !==
        editingId
    );

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[500px]
          items-center
          justify-center
        "
      >
        <div
          className="
            text-center
          "
        >
          <Loader2
            size={34}
            className="
              mx-auto
              animate-spin
              text-[#6f9a37]
            "
          />

          <p
            className="
              mt-3
              text-sm
              text-gray-500
            "
          >
            Loading categories...
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // PAGE
  // ======================================

  return (
    <div
      className="
        mx-auto
        max-w-[1500px]
        pb-16
      "
    >
      {/* =================================
          PAGE HEADER
      ================================= */}

      <div
        className="
          mb-7
          flex
          flex-col
          justify-between
          gap-4
          xl:flex-row
          xl:items-center
        "
      >
        <div>
          <div
            className="
              flex
              items-center
              gap-2
              text-xs
              font-black
              uppercase
              tracking-[0.14em]
              text-[#6f9a37]
            "
          >
            <FolderTree
              size={16}
            />

            Catalog
          </div>

          <h1
            className="
              mt-2
              text-2xl
              font-black
              tracking-tight
              text-[#172033]
              sm:text-3xl
            "
          >
            Categories
          </h1>

          <p
            className="
              mt-2
              max-w-[760px]
              text-sm
              leading-6
              text-gray-500
            "
          >
            Create Main Categories
            and organize
            Subcategories underneath
            them for the storefront
            navigation.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadCategories()
          }
          disabled={
            saving ||
            uploading
          }
          className="
            inline-flex
            items-center
            gap-2
            self-start
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-2.5
            text-sm
            font-bold
            text-gray-700
            shadow-sm
            disabled:opacity-50
          "
        >
          <RefreshCcw
            size={17}
          />

          Refresh
        </button>
      </div>

      {/* =================================
          ALERTS
      ================================= */}

      <PageAlert
        type="success"
        message={
          successMessage
        }
        onClose={() =>
          setSuccessMessage("")
        }
      />

      <PageAlert
        type="error"
        message={
          errorMessage
        }
        onClose={() =>
          setErrorMessage("")
        }
      />

      {/* =================================
          STATS
      ================================= */}

      <div
        className="
          mb-7
          grid
          grid-cols-1
          gap-4
          sm:grid-cols-3
        "
      >
        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.08em]
              text-gray-400
            "
          >
            Total Categories
          </div>

          <div
            className="
              mt-2
              text-3xl
              font-black
              text-[#172033]
            "
          >
            {categories.length}
          </div>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.08em]
              text-gray-400
            "
          >
            Main Categories
          </div>

          <div
            className="
              mt-2
              text-3xl
              font-black
              text-[#6f9a37]
            "
          >
            {mainCount}
          </div>
        </div>

        <div
          className="
            rounded-2xl
            border
            border-gray-200
            bg-white
            p-5
            shadow-sm
          "
        >
          <div
            className="
              text-xs
              font-black
              uppercase
              tracking-[0.08em]
              text-gray-400
            "
          >
            Subcategories
          </div>

          <div
            className="
              mt-2
              text-3xl
              font-black
              text-[#172033]
            "
          >
            {subcategoryCount}
          </div>
        </div>
      </div>

      {/* =================================
          MAIN GRID
      ================================= */}

      <div
        className="
          grid
          grid-cols-1
          gap-7
          xl:grid-cols-[430px_1fr]
        "
      >
        {/* =================================
            CATEGORY FORM
        ================================= */}

        <div>
          <form
            onSubmit={
              handleSubmit
            }
            className="
              sticky
              top-5
              overflow-hidden
              rounded-[22px]
              border
              border-gray-200
              bg-white
              shadow-sm
            "
          >
            {/* FORM HEADER */}

            <div
              className="
                flex
                items-center
                justify-between
                gap-3
                border-b
                border-gray-100
                px-5
                py-5
              "
            >
              <div>
                <h2
                  className="
                    text-lg
                    font-black
                    text-[#172033]
                  "
                >
                  {editingId
                    ? "Edit Category"
                    : "Add Category"}
                </h2>

                <p
                  className="
                    mt-1
                    text-xs
                    text-gray-500
                  "
                >
                  {editingId
                    ? "Update the selected category."
                    : "Create a Main Category or Subcategory."}
                </p>
              </div>

              {editingId && (
                <button
                  type="button"
                  onClick={() =>
                    resetForm()
                  }
                  className="
                    flex
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-gray-200
                    text-gray-500
                  "
                >
                  <X size={17} />
                </button>
              )}
            </div>

            <div
              className="
                space-y-5
                p-5
              "
            >
              {/* CATEGORY TYPE */}

              <div>
                <label
                  className="
                    mb-2
                    block
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-gray-500
                  "
                >
                  Category Type
                </label>

                <div
                  className="
                    grid
                    grid-cols-2
                    gap-3
                  "
                >
                  <button
                    type="button"
                    onClick={() =>
                      changeCategoryType(
                        "main"
                      )
                    }
                    className={`
                      rounded-xl
                      border
                      px-4
                      py-3
                      text-sm
                      font-bold
                      transition

                      ${
                        form.categoryType ===
                        "main"
                          ? "border-[#6f9a37] bg-[#f2f7e9] text-[#5e872e]"
                          : "border-gray-200 bg-white text-gray-600"
                      }
                    `}
                  >
                    Main Category
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      changeCategoryType(
                        "sub"
                      )
                    }
                    className={`
                      rounded-xl
                      border
                      px-4
                      py-3
                      text-sm
                      font-bold
                      transition

                      ${
                        form.categoryType ===
                        "sub"
                          ? "border-[#6f9a37] bg-[#f2f7e9] text-[#5e872e]"
                          : "border-gray-200 bg-white text-gray-600"
                      }
                    `}
                  >
                    Subcategory
                  </button>
                </div>
              </div>

              {/* PARENT */}

              {form.categoryType ===
                "sub" && (
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.08em]
                      text-gray-500
                    "
                  >
                    Parent Category
                  </label>

                  <select
                    value={
                      form.parentCategory
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "parentCategory",
                        event.target
                          .value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      px-4
                      py-3
                      text-sm
                      text-[#172033]
                      outline-none
                      focus:border-[#6f9a37]
                      focus:ring-2
                      focus:ring-[#6f9a37]/10
                    "
                  >
                    <option value="">
                      Select Main
                      Category
                    </option>

                    {availableParents.map(
                      (category) => (
                        <option
                          key={
                            category._id
                          }
                          value={
                            category._id
                          }
                        >
                          {category.name}
                        </option>
                      )
                    )}
                  </select>

                  {availableParents.length ===
                    0 && (
                    <p
                      className="
                        mt-2
                        text-xs
                        text-amber-600
                      "
                    >
                      Create a Main
                      Category first.
                    </p>
                  )}
                </div>
              )}

              {/* NAME */}

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-gray-500
                  "
                >
                  Category Name
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder={
                    form.categoryType ===
                    "main"
                      ? "e.g. Personal Care"
                      : "e.g. Face Wash"
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    outline-none
                    focus:border-[#6f9a37]
                    focus:ring-2
                    focus:ring-[#6f9a37]/10
                  "
                />
              </div>

              {/* DESCRIPTION */}

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-gray-500
                  "
                >
                  Description
                </label>

                <textarea
                  rows={4}
                  value={
                    form.description
                  }
                  onChange={(
                    event
                  ) =>
                    updateForm(
                      "description",
                      event.target.value
                    )
                  }
                  placeholder="Short category description..."
                  className="
                    w-full
                    resize-none
                    rounded-xl
                    border
                    border-gray-200
                    px-4
                    py-3
                    text-sm
                    leading-6
                    outline-none
                    focus:border-[#6f9a37]
                    focus:ring-2
                    focus:ring-[#6f9a37]/10
                  "
                />
              </div>

              {/* IMAGE */}

              <div>
                <label
                  className="
                    mb-1.5
                    block
                    text-xs
                    font-black
                    uppercase
                    tracking-[0.08em]
                    text-gray-500
                  "
                >
                  Category Image
                </label>

                <div
                  className="
                    relative
                    flex
                    h-[180px]
                    items-center
                    justify-center
                    overflow-hidden
                    rounded-2xl
                    border
                    border-gray-200
                    bg-[#fafafa]
                    p-4
                  "
                >
                  {form.image ? (
                    <img
                      src={getImageUrl(
                        form.image
                      )}
                      alt={
                        form.name ||
                        "Category"
                      }
                      className="
                        h-full
                        w-full
                        object-contain
                      "
                    />
                  ) : (
                    <div
                      className="
                        text-center
                        text-gray-300
                      "
                    >
                      <ImagePlus
                        size={38}
                        className="
                          mx-auto
                        "
                      />

                      <div
                        className="
                          mt-2
                          text-xs
                        "
                      >
                        No image
                      </div>
                    </div>
                  )}

                  {uploading && (
                    <div
                      className="
                        absolute
                        inset-0
                        flex
                        items-center
                        justify-center
                        bg-white/90
                      "
                    >
                      <Loader2
                        size={28}
                        className="
                          animate-spin
                          text-[#6f9a37]
                        "
                      />
                    </div>
                  )}
                </div>

                <div
                  className="
                    mt-3
                    flex
                    flex-wrap
                    gap-2
                  "
                >
                  <label
                    className={`
                      inline-flex
                      cursor-pointer
                      items-center
                      gap-2
                      rounded-xl
                      bg-[#172033]
                      px-4
                      py-2.5
                      text-xs
                      font-bold
                      text-white

                      ${
                        uploading
                          ? "pointer-events-none opacity-50"
                          : ""
                      }
                    `}
                  >
                    <Upload
                      size={14}
                    />

                    {form.image
                      ? "Replace Image"
                      : "Upload Image"}

                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(
                        event
                      ) => {
                        const file =
                          event
                            .target
                            .files?.[0];

                        if (file) {
                          handleImageUpload(
                            file
                          );
                        }

                        event.target.value =
                          "";
                      }}
                    />
                  </label>

                  {form.image && (
                    <button
                      type="button"
                      onClick={
                        removeImage
                      }
                      className="
                        rounded-xl
                        border
                        border-red-200
                        bg-white
                        px-4
                        py-2.5
                        text-xs
                        font-bold
                        text-red-600
                      "
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>

              {/* SORT + ACTIVE */}

              <div
                className="
                  grid
                  grid-cols-[1fr_auto]
                  items-end
                  gap-4
                "
              >
                <div>
                  <label
                    className="
                      mb-1.5
                      block
                      text-xs
                      font-black
                      uppercase
                      tracking-[0.08em]
                      text-gray-500
                    "
                  >
                    Sort Order
                  </label>

                  <input
                    type="number"
                    min="0"
                    value={
                      form.sortOrder
                    }
                    onChange={(
                      event
                    ) =>
                      updateForm(
                        "sortOrder",
                        event.target.value
                      )
                    }
                    className="
                      w-full
                      rounded-xl
                      border
                      border-gray-200
                      px-4
                      py-3
                      text-sm
                      outline-none
                      focus:border-[#6f9a37]
                    "
                  />
                </div>

                <div
                  className="
                    pb-3
                  "
                >
                  <div
                    className="
                      mb-2
                      text-xs
                      font-black
                      uppercase
                      text-gray-500
                    "
                  >
                    Active
                  </div>

                  <Toggle
                    checked={
                      form.isActive
                    }
                    onChange={(
                      value
                    ) =>
                      updateForm(
                        "isActive",
                        value
                      )
                    }
                  />
                </div>
              </div>

              {/* SAVE */}

              <button
                type="submit"
                disabled={
                  saving ||
                  uploading
                }
                className="
                  flex
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  bg-[#6f9a37]
                  px-5
                  py-3
                  text-sm
                  font-black
                  text-white
                  transition
                  hover:bg-[#5e872e]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                {saving ? (
                  <Loader2
                    size={17}
                    className="
                      animate-spin
                    "
                  />
                ) : editingId ? (
                  <Save size={17} />
                ) : (
                  <Plus size={17} />
                )}

                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Category"
                  : "Create Category"}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() =>
                    resetForm()
                  }
                  disabled={
                    saving
                  }
                  className="
                    w-full
                    rounded-xl
                    border
                    border-gray-200
                    px-5
                    py-3
                    text-sm
                    font-bold
                    text-gray-600
                  "
                >
                  Cancel Editing
                </button>
              )}
            </div>
          </form>
        </div>

        {/* =================================
            CATEGORY TREE LIST
        ================================= */}

        <section
          className="
            overflow-hidden
            rounded-[22px]
            border
            border-gray-200
            bg-white
            shadow-sm
          "
        >
          <div
            className="
              border-b
              border-gray-100
              px-6
              py-5
            "
          >
            <div
              className="
                flex
                items-center
                gap-2
              "
            >
              <FolderTree
                size={20}
                className="
                  text-[#6f9a37]
                "
              />

              <h2
                className="
                  text-lg
                  font-black
                  text-[#172033]
                "
              >
                Category Structure
              </h2>
            </div>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              Main Categories will
              appear in the website
              navigation. Their
              Subcategories will
              appear inside
              dropdowns.
            </p>
          </div>

          {categoryTree.length ===
          0 ? (
            <div
              className="
                px-6
                py-20
                text-center
              "
            >
              <FolderTree
                size={46}
                className="
                  mx-auto
                  text-gray-300
                "
              />

              <h3
                className="
                  mt-4
                  font-black
                  text-[#172033]
                "
              >
                No Categories Yet
              </h3>

              <p
                className="
                  mt-2
                  text-sm
                  text-gray-500
                "
              >
                Create your first
                Main Category from
                the form.
              </p>
            </div>
          ) : (
            <div
              className="
                space-y-4
                p-5
              "
            >
              {categoryTree.map(
                (mainCategory) => {
                  const children =
                    mainCategory.children ||
                    [];

                  const expanded =
                    expandedCategories[
                      mainCategory._id
                    ] !== false;

                  return (
                    <div
                      key={
                        mainCategory._id
                      }
                      className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-gray-200
                      "
                    >
                      {/* MAIN CATEGORY */}

                      <div
                        className="
                          flex
                          flex-col
                          gap-4
                          bg-[#fafafa]
                          px-4
                          py-4
                          lg:flex-row
                          lg:items-center
                          lg:justify-between
                        "
                      >
                        <div
                          className="
                            flex
                            min-w-0
                            items-center
                            gap-4
                          "
                        >
                          {/* EXPAND */}

                          <button
                            type="button"
                            onClick={() =>
                              toggleExpanded(
                                mainCategory._id
                              )
                            }
                            className="
                              flex
                              h-9
                              w-9
                              shrink-0
                              items-center
                              justify-center
                              rounded-xl
                              border
                              border-gray-200
                              bg-white
                            "
                          >
                            {expanded ? (
                              <ChevronDown
                                size={17}
                              />
                            ) : (
                              <ChevronRight
                                size={17}
                              />
                            )}
                          </button>

                          {/* IMAGE */}

                          <div
                            className="
                              flex
                              h-14
                              w-14
                              shrink-0
                              items-center
                              justify-center
                              overflow-hidden
                              rounded-xl
                              border
                              border-gray-200
                              bg-white
                              p-1
                            "
                          >
                            {mainCategory.image ? (
                              <img
                                src={getImageUrl(
                                  mainCategory.image
                                )}
                                alt={
                                  mainCategory.name
                                }
                                className="
                                  h-full
                                  w-full
                                  object-contain
                                "
                              />
                            ) : (
                              <FolderTree
                                size={22}
                                className="
                                  text-gray-300
                                "
                              />
                            )}
                          </div>

                          {/* INFO */}

                          <div
                            className="
                              min-w-0
                            "
                          >
                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >
                              <h3
                                className="
                                  truncate
                                  font-black
                                  text-[#172033]
                                "
                              >
                                {
                                  mainCategory.name
                                }
                              </h3>

                              <span
                                className="
                                  rounded-full
                                  bg-[#edf7d9]
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-black
                                  uppercase
                                  text-[#5f872f]
                                "
                              >
                                Main
                              </span>

                              <span
                                className={`
                                  rounded-full
                                  px-2.5
                                  py-1
                                  text-[10px]
                                  font-black
                                  uppercase

                                  ${
                                    mainCategory.isActive !==
                                    false
                                      ? "bg-emerald-50 text-emerald-600"
                                      : "bg-gray-100 text-gray-500"
                                  }
                                `}
                              >
                                {mainCategory.isActive !==
                                false
                                  ? "Active"
                                  : "Inactive"}
                              </span>
                            </div>

                            <div
                              className="
                                mt-1
                                flex
                                flex-wrap
                                gap-x-4
                                gap-y-1
                                text-xs
                                text-gray-500
                              "
                            >
                              <span>
                                Sort:{" "}
                                {mainCategory.sortOrder ||
                                  0}
                              </span>

                              <span>
                                {
                                  children.length
                                }{" "}
                                subcategor
                                {children.length ===
                                1
                                  ? "y"
                                  : "ies"}
                              </span>

                              <span>
                                /
                                {
                                  mainCategory.slug
                                }
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ACTIONS */}

                        <div
                          className="
                            flex
                            shrink-0
                            gap-2
                          "
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleEdit(
                                mainCategory
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-gray-200
                              bg-white
                              px-3
                              py-2
                              text-xs
                              font-bold
                              text-gray-700
                            "
                          >
                            <Edit3
                              size={14}
                            />

                            Edit
                          </button>

                          <button
                            type="button"
                            disabled={
                              deletingId ===
                              mainCategory._id
                            }
                            onClick={() =>
                              handleDelete(
                                mainCategory
                              )
                            }
                            className="
                              inline-flex
                              items-center
                              gap-2
                              rounded-xl
                              border
                              border-red-200
                              bg-white
                              px-3
                              py-2
                              text-xs
                              font-bold
                              text-red-600
                              disabled:opacity-50
                            "
                          >
                            {deletingId ===
                            mainCategory._id ? (
                              <Loader2
                                size={14}
                                className="
                                  animate-spin
                                "
                              />
                            ) : (
                              <Trash2
                                size={14}
                              />
                            )}

                            Delete
                          </button>
                        </div>
                      </div>

                      {/* SUBCATEGORIES */}

                      {expanded && (
                        <div
                          className="
                            border-t
                            border-gray-100
                            bg-white
                          "
                        >
                          {children.length ===
                          0 ? (
                            <div
                              className="
                                px-6
                                py-7
                                text-center
                                text-sm
                                text-gray-400
                              "
                            >
                              No subcategories
                              under{" "}
                              {
                                mainCategory.name
                              }
                              .
                            </div>
                          ) : (
                            <div
                              className="
                                divide-y
                                divide-gray-100
                              "
                            >
                              {children.map(
                                (
                                  child
                                ) => (
                                  <div
                                    key={
                                      child._id
                                    }
                                    className="
                                      flex
                                      flex-col
                                      gap-4
                                      px-5
                                      py-4
                                      sm:flex-row
                                      sm:items-center
                                      sm:justify-between
                                    "
                                  >
                                    <div
                                      className="
                                        flex
                                        min-w-0
                                        items-center
                                        gap-4
                                        pl-3
                                        sm:pl-10
                                      "
                                    >
                                      <div
                                        className="
                                          h-8
                                          w-[2px]
                                          shrink-0
                                          bg-[#dfe9cd]
                                        "
                                      />

                                      <div
                                        className="
                                          flex
                                          h-11
                                          w-11
                                          shrink-0
                                          items-center
                                          justify-center
                                          overflow-hidden
                                          rounded-xl
                                          border
                                          border-gray-100
                                          bg-[#fafafa]
                                          p-1
                                        "
                                      >
                                        {child.image ? (
                                          <img
                                            src={getImageUrl(
                                              child.image
                                            )}
                                            alt={
                                              child.name
                                            }
                                            className="
                                              h-full
                                              w-full
                                              object-contain
                                            "
                                          />
                                        ) : (
                                          <ImagePlus
                                            size={18}
                                            className="
                                              text-gray-300
                                            "
                                          />
                                        )}
                                      </div>

                                      <div
                                        className="
                                          min-w-0
                                        "
                                      >
                                        <div
                                          className="
                                            flex
                                            flex-wrap
                                            items-center
                                            gap-2
                                          "
                                        >
                                          <span
                                            className="
                                              truncate
                                              text-sm
                                              font-black
                                              text-[#172033]
                                            "
                                          >
                                            {
                                              child.name
                                            }
                                          </span>

                                          <span
                                            className="
                                              rounded-full
                                              bg-blue-50
                                              px-2
                                              py-1
                                              text-[9px]
                                              font-black
                                              uppercase
                                              text-blue-600
                                            "
                                          >
                                            Subcategory
                                          </span>

                                          {child.isActive ===
                                            false && (
                                            <span
                                              className="
                                                rounded-full
                                                bg-gray-100
                                                px-2
                                                py-1
                                                text-[9px]
                                                font-black
                                                uppercase
                                                text-gray-500
                                              "
                                            >
                                              Inactive
                                            </span>
                                          )}
                                        </div>

                                        <div
                                          className="
                                            mt-1
                                            flex
                                            flex-wrap
                                            gap-x-3
                                            text-xs
                                            text-gray-400
                                          "
                                        >
                                          <span>
                                            Parent:{" "}
                                            {getParentCategoryName(
                                              child
                                            ) ||
                                              mainCategory.name}
                                          </span>

                                          <span>
                                            Sort:{" "}
                                            {child.sortOrder ||
                                              0}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div
                                      className="
                                        flex
                                        gap-2
                                        sm:shrink-0
                                      "
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleEdit(
                                            child
                                          )
                                        }
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          rounded-lg
                                          border
                                          border-gray-200
                                          px-3
                                          py-2
                                          text-xs
                                          font-bold
                                          text-gray-600
                                        "
                                      >
                                        <Edit3
                                          size={13}
                                        />

                                        Edit
                                      </button>

                                      <button
                                        type="button"
                                        disabled={
                                          deletingId ===
                                          child._id
                                        }
                                        onClick={() =>
                                          handleDelete(
                                            child
                                          )
                                        }
                                        className="
                                          inline-flex
                                          items-center
                                          gap-2
                                          rounded-lg
                                          border
                                          border-red-200
                                          px-3
                                          py-2
                                          text-xs
                                          font-bold
                                          text-red-600
                                          disabled:opacity-50
                                        "
                                      >
                                        {deletingId ===
                                        child._id ? (
                                          <Loader2
                                            size={13}
                                            className="
                                              animate-spin
                                            "
                                          />
                                        ) : (
                                          <Trash2
                                            size={13}
                                          />
                                        )}

                                        Delete
                                      </button>
                                    </div>
                                  </div>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminCategoriesPage;