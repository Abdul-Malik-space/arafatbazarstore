const mongoose = require("mongoose");

const Category = require("../models/Category");
const Product = require("../models/Product");

// ========================================
// HELPER: CREATE SLUG
// ========================================

const createSlug = (text = "") => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

// ========================================
// HELPER: VALID OBJECT ID
// ========================================

const isValidObjectId = (value) => {
  return mongoose.Types.ObjectId.isValid(
    value
  );
};

// ========================================
// HELPER: NORMALIZE PARENT
//
// "", null, undefined => null
// ========================================

const normalizeParentCategory = (
  value
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return value;
};

// ========================================
// HELPER: NORMALIZE SORT ORDER
// ========================================

const normalizeSortOrder = (
  value,
  fallback = 0
) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return fallback;
  }

  const numberValue =
    Number(value);

  if (
    Number.isNaN(numberValue) ||
    numberValue < 0
  ) {
    return null;
  }

  return numberValue;
};

// ========================================
// HELPER: VALIDATE PARENT CATEGORY
//
// Rules:
//
// 1. Parent must exist
// 2. Parent must be a MAIN category
// 3. Category cannot be its own parent
//
// This keeps hierarchy limited to:
//
// Main Category
//      ↓
// Subcategory
//
// No third level.
// ========================================

const validateParentCategory =
  async ({
    parentCategoryId,
    currentCategoryId = null,
  }) => {
    const normalizedParent =
      normalizeParentCategory(
        parentCategoryId
      );

    if (!normalizedParent) {
      return {
        valid: true,
        parentCategory: null,
      };
    }

    if (
      !isValidObjectId(
        normalizedParent
      )
    ) {
      return {
        valid: false,

        message:
          "Invalid parent category ID",
      };
    }

    if (
      currentCategoryId &&
      normalizedParent.toString() ===
        currentCategoryId.toString()
    ) {
      return {
        valid: false,

        message:
          "A category cannot be its own parent",
      };
    }

    const parentCategory =
      await Category.findById(
        normalizedParent
      );

    if (!parentCategory) {
      return {
        valid: false,

        message:
          "Parent category not found",
      };
    }

    // ------------------------------------
    // Prevent subcategory inside another
    // subcategory.
    // ------------------------------------

    if (
      parentCategory.parentCategory
    ) {
      return {
        valid: false,

        message:
          "A subcategory can only belong to a main category",
      };
    }

    return {
      valid: true,

      parentCategory,
    };
  };

// ========================================
// CREATE CATEGORY
//
// POST /api/categories
//
// Main Category:
//
// parentCategory = null
//
// Subcategory:
//
// parentCategory = Main Category ID
// ========================================

const createCategory = async (
  req,
  res
) => {
  try {
    const {
      name,
      description,
      image,
      parentCategory,
      isActive,
      sortOrder,
    } = req.body;

    // ------------------------------------
    // NAME
    // ------------------------------------

    if (
      !name ||
      !name.toString().trim()
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Category name is required",
      });
    }

    const cleanName =
      name.toString().trim();

    const slug =
      createSlug(cleanName);

    if (!slug) {
      return res.status(400).json({
        success: false,

        message:
          "Unable to create a valid category slug",
      });
    }

    // ------------------------------------
    // DUPLICATE CHECK
    // ------------------------------------

    const existingCategory =
      await Category.findOne({
        $or: [
          {
            name: {
              $regex:
                `^${cleanName.replace(
                  /[.*+?^${}()|[\]\\]/g,
                  "\\$&"
                )}$`,

              $options: "i",
            },
          },

          {
            slug,
          },
        ],
      });

    if (existingCategory) {
      return res.status(400).json({
        success: false,

        message:
          "Category already exists",
      });
    }

    // ------------------------------------
    // PARENT VALIDATION
    // ------------------------------------

    const parentValidation =
      await validateParentCategory({
        parentCategoryId:
          parentCategory,
      });

    if (
      !parentValidation.valid
    ) {
      return res.status(400).json({
        success: false,

        message:
          parentValidation.message,
      });
    }

    // ------------------------------------
    // SORT ORDER
    // ------------------------------------

    const normalizedSortOrder =
      normalizeSortOrder(
        sortOrder,
        0
      );

    if (
      normalizedSortOrder === null
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Sort order must be a valid non-negative number",
      });
    }

    // ------------------------------------
    // CREATE
    // ------------------------------------

    const category =
      await Category.create({
        name:
          cleanName,

        slug,

        description:
          description?.toString() ||
          "",

        image:
          image || "",

        parentCategory:
          parentValidation
            .parentCategory?._id ||
          null,

        isActive:
          typeof isActive ===
          "boolean"
            ? isActive
            : true,

        sortOrder:
          normalizedSortOrder,
      });

    // ------------------------------------
    // POPULATE PARENT
    // ------------------------------------

    await category.populate(
      "parentCategory",
      "name slug isActive sortOrder"
    );

    return res
      .status(201)
      .json({
        success: true,

        message:
          category.parentCategory
            ? "Subcategory created successfully"
            : "Main category created successfully",

        category,
      });
  } catch (error) {
    console.error(
      "Create Category Error:",
      error
    );

    if (
      error?.code === 11000
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Category name or slug already exists",
        });
    }

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to create category",

        error: error.message,
      });
  }
};

// ========================================
// GET ALL CATEGORIES
//
// GET /api/categories
//
// Flat list.
// Useful for:
// - Admin
// - Select fields
// - Existing frontend compatibility
// ========================================

const getCategories = async (
  req,
  res
) => {
  try {
    const categories =
      await Category.find()
        .populate(
          "parentCategory",
          "name slug isActive sortOrder"
        )
        .sort({
          sortOrder: 1,
          name: 1,
        });

    return res
      .status(200)
      .json({
        success: true,

        count:
          categories.length,

        categories,
      });
  } catch (error) {
    console.error(
      "Get Categories Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to fetch categories",

        error: error.message,
      });
  }
};

// ========================================
// GET ACTIVE CATEGORIES
//
// GET /api/categories/active
//
// Flat active category list.
// ========================================

const getActiveCategories =
  async (req, res) => {
    try {
      const categories =
        await Category.find({
          isActive: true,
        })
          .populate(
            "parentCategory",
            "name slug isActive sortOrder"
          )
          .sort({
            sortOrder: 1,
            name: 1,
          });

      return res
        .status(200)
        .json({
          success: true,

          count:
            categories.length,

          categories,
        });
    } catch (error) {
      console.error(
        "Get Active Categories Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to fetch active categories",

          error: error.message,
        });
    }
  };

// ========================================
// GET MAIN CATEGORIES
//
// GET /api/categories/main
//
// Returns only:
//
// Grocery
// Personal Care
// Baby Care
// etc.
//
// These will be shown in the
// HEADER MAIN ROW.
// ========================================

const getMainCategories =
  async (req, res) => {
    try {
      const categories =
        await Category.find({
          parentCategory: null,
          isActive: true,
        }).sort({
          sortOrder: 1,
          name: 1,
        });

      return res
        .status(200)
        .json({
          success: true,

          count:
            categories.length,

          categories,
        });
    } catch (error) {
      console.error(
        "Get Main Categories Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to fetch main categories",

          error: error.message,
        });
    }
  };

// ========================================
// GET SUBCATEGORIES
//
// GET /api/categories/:id/subcategories
//
// Example:
//
// /api/categories/GROCERY_ID/subcategories
// ========================================

const getSubcategories =
  async (req, res) => {
    try {
      const {
        id,
      } = req.params;

      if (
        !isValidObjectId(id)
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Invalid category ID",
          });
      }

      const parent =
        await Category.findById(
          id
        );

      if (!parent) {
        return res
          .status(404)
          .json({
            success: false,

            message:
              "Main category not found",
          });
      }

      if (
        parent.parentCategory
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Subcategories can only be requested for a main category",
          });
      }

      const categories =
        await Category.find({
          parentCategory:
            parent._id,

          isActive: true,
        }).sort({
          sortOrder: 1,
          name: 1,
        });

      return res
        .status(200)
        .json({
          success: true,

          parentCategory: {
            _id:
              parent._id,

            name:
              parent.name,

            slug:
              parent.slug,
          },

          count:
            categories.length,

          categories,
        });
    } catch (error) {
      console.error(
        "Get Subcategories Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to fetch subcategories",

          error: error.message,
        });
    }
  };

// ========================================
// GET CATEGORY TREE
//
// GET /api/categories/tree
//
// Response:
//
// [
//   {
//     name: "Personal Care",
//     children: [
//       { name: "Bath Soap" },
//       { name: "Face Wash" }
//     ]
//   }
// ]
//
// This is the endpoint Header.jsx
// will use.
// ========================================

const getCategoryTree =
  async (req, res) => {
    try {
      const tree =
        await Category.getCategoryTree(
          {
            activeOnly: true,
          }
        );

      return res
        .status(200)
        .json({
          success: true,

          count:
            tree.length,

          categories:
            tree,
        });
    } catch (error) {
      console.error(
        "Get Category Tree Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Failed to fetch category tree",

          error: error.message,
        });
    }
  };

// ========================================
// GET SINGLE CATEGORY
//
// GET /api/categories/:id
// ========================================

const getCategoryById = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid category ID",
      });
    }

    const category =
      await Category.findById(
        id
      ).populate(
        "parentCategory",
        "name slug isActive sortOrder"
      );

    if (!category) {
      return res.status(404).json({
        success: false,

        message:
          "Category not found",
      });
    }

    // ------------------------------------
    // If main category, also return children
    // ------------------------------------

    let children = [];

    if (
      !category.parentCategory
    ) {
      children =
        await Category.find({
          parentCategory:
            category._id,
        }).sort({
          sortOrder: 1,
          name: 1,
        });
    }

    return res
      .status(200)
      .json({
        success: true,

        category,

        children,
      });
  } catch (error) {
    console.error(
      "Get Category By ID Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to fetch category",

        error: error.message,
      });
  }
};

// ========================================
// UPDATE CATEGORY
//
// PUT /api/categories/:id
// ========================================

const updateCategory = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid category ID",
      });
    }

    const category =
      await Category.findById(
        id
      );

    if (!category) {
      return res.status(404).json({
        success: false,

        message:
          "Category not found",
      });
    }

    const {
      name,
      description,
      image,
      parentCategory,
      isActive,
      sortOrder,
    } = req.body;

    // ------------------------------------
    // NAME
    // ------------------------------------

    if (name !== undefined) {
      const cleanName =
        name
          .toString()
          .trim();

      if (!cleanName) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Category name cannot be empty",
          });
      }

      const newSlug =
        createSlug(cleanName);

      if (!newSlug) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Unable to create a valid category slug",
          });
      }

      const escapedName =
        cleanName.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      const duplicateCategory =
        await Category.findOne({
          _id: {
            $ne:
              category._id,
          },

          $or: [
            {
              name: {
                $regex:
                  `^${escapedName}$`,

                $options: "i",
              },
            },

            {
              slug:
                newSlug,
            },
          ],
        });

      if (
        duplicateCategory
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Another category with this name already exists",
          });
      }

      category.name =
        cleanName;

      category.slug =
        newSlug;
    }

    // ------------------------------------
    // DESCRIPTION
    // ------------------------------------

    if (
      description !== undefined
    ) {
      category.description =
        description?.toString() ||
        "";
    }

    // ------------------------------------
    // IMAGE
    // ------------------------------------

    if (image !== undefined) {
      category.image =
        image || "";
    }

    // ------------------------------------
    // PARENT CATEGORY
    // ------------------------------------

    if (
      parentCategory !==
      undefined
    ) {
      const parentValidation =
        await validateParentCategory(
          {
            parentCategoryId:
              parentCategory,

            currentCategoryId:
              category._id,
          }
        );

      if (
        !parentValidation.valid
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              parentValidation.message,
          });
      }

      // ----------------------------------
      // If current category has children,
      // it cannot become a subcategory.
      //
      // Otherwise hierarchy could become:
      //
      // Parent
      //   ↓
      // Category
      //   ↓
      // Child
      //
      // which we do not allow.
      // ----------------------------------

      if (
        parentValidation
          .parentCategory
      ) {
        const childCount =
          await Category.countDocuments(
            {
              parentCategory:
                category._id,
            }
          );

        if (childCount > 0) {
          return res
            .status(400)
            .json({
              success: false,

              message:
                "This category has subcategories. Move or delete its subcategories before converting it into a subcategory.",
            });
        }
      }

      category.parentCategory =
        parentValidation
          .parentCategory?._id ||
        null;
    }

    // ------------------------------------
    // STATUS
    // ------------------------------------

    if (
      typeof isActive ===
      "boolean"
    ) {
      category.isActive =
        isActive;
    }

    // ------------------------------------
    // SORT ORDER
    // ------------------------------------

    if (
      sortOrder !== undefined
    ) {
      const normalizedSortOrder =
        normalizeSortOrder(
          sortOrder,
          category.sortOrder
        );

      if (
        normalizedSortOrder ===
        null
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Sort order must be a valid non-negative number",
          });
      }

      category.sortOrder =
        normalizedSortOrder;
    }

    // ------------------------------------
    // SAVE
    // ------------------------------------

    const updatedCategory =
      await category.save();

    await updatedCategory.populate(
      "parentCategory",
      "name slug isActive sortOrder"
    );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Category updated successfully",

        category:
          updatedCategory,
      });
  } catch (error) {
    console.error(
      "Update Category Error:",
      error
    );

    if (
      error?.code === 11000
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Category name or slug already exists",
        });
    }

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to update category",

        error: error.message,
      });
  }
};

// ========================================
// DELETE CATEGORY
//
// DELETE /api/categories/:id
//
// Protection:
//
// 1. Cannot delete Main Category
//    if it has Subcategories.
//
// 2. Cannot delete category if
//    Products are using it.
// ========================================

const deleteCategory = async (
  req,
  res
) => {
  try {
    const {
      id,
    } = req.params;

    if (
      !isValidObjectId(id)
    ) {
      return res.status(400).json({
        success: false,

        message:
          "Invalid category ID",
      });
    }

    const category =
      await Category.findById(
        id
      );

    if (!category) {
      return res.status(404).json({
        success: false,

        message:
          "Category not found",
      });
    }

    // ------------------------------------
    // CHECK SUBCATEGORIES
    // ------------------------------------

    const subcategoryCount =
      await Category.countDocuments({
        parentCategory:
          category._id,
      });

    if (
      subcategoryCount > 0
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            `This category has ${subcategoryCount} subcategor${
              subcategoryCount === 1
                ? "y"
                : "ies"
            }. Delete or move them first.`,
        });
    }

    // ------------------------------------
    // CHECK PRODUCTS
    // ------------------------------------

    const productCount =
      await Product.countDocuments({
        category:
          category._id,
      });

    if (productCount > 0) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            `This category is used by ${productCount} product${
              productCount === 1
                ? ""
                : "s"
            }. Move those products to another category before deleting it.`,
        });
    }

    // ------------------------------------
    // DELETE
    // ------------------------------------

    await category.deleteOne();

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Category deleted successfully",
      });
  } catch (error) {
    console.error(
      "Delete Category Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Failed to delete category",

        error: error.message,
      });
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createCategory,

  getCategories,

  getActiveCategories,

  getMainCategories,

  getSubcategories,

  getCategoryTree,

  getCategoryById,

  updateCategory,

  deleteCategory,
};