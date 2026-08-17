const mongoose = require("mongoose");

const Category = require("../models/Category");
const Product = require("../models/Product");

// ========================================
// HELPERS
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

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

const normalizeParentCategory = (value) => {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return null;
  }

  return value;
};

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

  const numberValue = Number(value);

  if (
    Number.isNaN(numberValue) ||
    numberValue < 0
  ) {
    return null;
  }

  return numberValue;
};

const getCategoryIdString = (value) => {
  if (!value) {
    return null;
  }

  if (value._id) {
    return value._id.toString();
  }

  return value.toString();
};

const toPlainObject = (value) => {
  if (!value) {
    return value;
  }

  if (
    typeof value.toObject === "function"
  ) {
    return value.toObject({
      virtuals: true,
    });
  }

  return {
    ...value,
  };
};

// ========================================
// PRODUCT COUNT HELPERS
// ========================================
//
// Product documents are connected using:
//
// Product.category -> Category._id
//
// MAIN CATEGORY COUNT:
// Direct products
// +
// Products inside its subcategories
//
// Example:
//
// Personal Care
//   Direct = 2
//
// Bath Soap = 10
// Tooth Paste = 5
//
// Personal Care productCount = 17
//
// Returned fields:
//
// productCount
// productsCount
// totalProducts
//
// All 3 contain same value.
// ========================================

const buildProductCountContext = async ({
  activeOnly = false,
} = {}) => {
  // IMPORTANT:
  // MongoDB data may contain category IDs as ObjectId values or
  // legacy string values. Convert both sides to strings before
  // comparing so counting remains reliable for old/imported data.

  const categoryFilter = activeOnly
    ? {
        isActive: true,
      }
    : {};

  const productMatch = {
    category: {
      $ne: null,
    },
  };

  // Public/active category endpoints should count the same products
  // the storefront can actually display.
  if (activeOnly) {
    productMatch.isActive = true;
  }

  const [
    categoryRows,
    productCountRows,
  ] = await Promise.all([
    Category.find(categoryFilter)
      .select(
        "_id parentCategory"
      )
      .lean(),

    Product.aggregate([
      {
        $match: productMatch,
      },
      {
        $project: {
          categoryKey: {
            $convert: {
              input: "$category",
              to: "string",
              onError: "",
              onNull: "",
            },
          },
        },
      },
      {
        $match: {
          categoryKey: {
            $ne: "",
          },
        },
      },
      {
        $group: {
          _id: "$categoryKey",
          count: {
            $sum: 1,
          },
        },
      },
    ]),
  ]);

  // ----------------------------------------
  // DIRECT PRODUCT COUNTS
  // ----------------------------------------

  const directCountMap =
    new Map();

  for (
    const row of productCountRows
  ) {
    const categoryId =
      getCategoryIdString(
        row._id
      );

    if (categoryId) {
      directCountMap.set(
        categoryId,
        Number(row.count) || 0
      );
    }
  }

  // ----------------------------------------
  // CATEGORY -> CHILDREN MAP
  // ----------------------------------------

  const childrenMap =
    new Map();

  for (
    const category of categoryRows
  ) {
    const categoryId =
      getCategoryIdString(
        category._id
      );

    const parentId =
      getCategoryIdString(
        category.parentCategory
      );

    if (
      !categoryId ||
      !parentId
    ) {
      continue;
    }

    if (
      !childrenMap.has(
        parentId
      )
    ) {
      childrenMap.set(
        parentId,
        []
      );
    }

    childrenMap
      .get(parentId)
      .push(categoryId);
  }

  const totalCountCache =
    new Map();

  // ----------------------------------------
  // DIRECT COUNT
  // ----------------------------------------

  const getDirectCount = (
    categoryId
  ) => {
    const id =
      getCategoryIdString(
        categoryId
      );

    if (!id) {
      return 0;
    }

    return (
      directCountMap.get(id) ||
      0
    );
  };

  // ----------------------------------------
  // TOTAL COUNT
  //
  // Main category:
  // direct + child products
  //
  // Subcategory:
  // direct products
  //
  // Recursive on purpose so the API still gives the correct total
  // if legacy data contains more than two hierarchy levels.
  // ----------------------------------------

  const getTotalCount = (
    categoryId,
    visited = new Set()
  ) => {
    const id =
      getCategoryIdString(
        categoryId
      );

    if (!id) {
      return 0;
    }

    if (
      totalCountCache.has(id)
    ) {
      return totalCountCache.get(
        id
      );
    }

    // Protection against accidental circular category relations.
    if (
      visited.has(id)
    ) {
      return getDirectCount(
        id
      );
    }

    const nextVisited =
      new Set(visited);

    nextVisited.add(id);

    let total =
      getDirectCount(id);

    const childIds =
      childrenMap.get(id) ||
      [];

    for (
      const childId of childIds
    ) {
      total +=
        getTotalCount(
          childId,
          nextVisited
        );
    }

    totalCountCache.set(
      id,
      total
    );

    return total;
  };

  return {
    getDirectCount,
    getTotalCount,
  };
};

// ========================================
// ADD PRODUCT COUNT TO ONE CATEGORY
// ========================================

const addCountFields = (
  category,
  countContext
) => {
  const plainCategory =
    toPlainObject(
      category
    );

  const directProductCount =
    countContext.getDirectCount(
      plainCategory._id
    );

  const productCount =
    countContext.getTotalCount(
      plainCategory._id
    );

  return {
    ...plainCategory,

    directProductCount,

    productCount,

    productsCount:
      productCount,

    totalProducts:
      productCount,
  };
};

// ========================================
// ADD COUNTS TO FLAT CATEGORY LIST
// ========================================

const attachProductCounts =
  async (
    categories,
    {
      activeOnly = false,
      countContext = null,
    } = {}
  ) => {
    const context =
      countContext ||
      (await buildProductCountContext({
        activeOnly,
      }));

    return categories.map(
      (category) =>
        addCountFields(
          category,
          context
        )
    );
  };

// ========================================
// ADD COUNTS TO CATEGORY TREE
// ========================================

const attachProductCountsToTree =
  async (
    tree,
    {
      activeOnly = true,
      countContext = null,
    } = {}
  ) => {
    const context =
      countContext ||
      (await buildProductCountContext({
        activeOnly,
      }));

    const enrichNode = (
      node
    ) => {
      const plainNode =
        toPlainObject(
          node
        );

      const productCount =
        context.getTotalCount(
          plainNode._id
        );

      const children =
        Array.isArray(
          plainNode.children
        )
          ? plainNode.children.map(
              enrichNode
            )
          : plainNode.children;

      return {
        ...plainNode,

        productCount,

        productsCount:
          productCount,

        totalProducts:
          productCount,

        ...(children !==
        undefined
          ? {
              children,
            }
          : {}),
      };
    };

    return tree.map(
      enrichNode
    );
  };

// ========================================
// VALIDATE PARENT CATEGORY
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

        parentCategory:
          null,
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

    // Prevent:
    //
    // Main Category
    //     ↓
    // Subcategory
    //     ↓
    // Another Subcategory

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
    // NAME VALIDATION
    // ------------------------------------

    if (
      !name ||
      !name.toString().trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Category name is required",
        });
    }

    const cleanName =
      name
        .toString()
        .trim();

    const slug =
      createSlug(
        cleanName
      );

    if (!slug) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Unable to create a valid category slug",
        });
    }

    // ------------------------------------
    // ESCAPE REGEX
    // ------------------------------------

    const escapedName =
      cleanName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );

    // ------------------------------------
    // DUPLICATE CHECK
    // ------------------------------------

    const existingCategory =
      await Category.findOne({
        $or: [
          {
            name: {
              $regex:
                `^${escapedName}$`,

              $options:
                "i",
            },
          },

          {
            slug,
          },
        ],
      });

    if (existingCategory) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Category already exists",
        });
    }

    // ------------------------------------
    // PARENT CATEGORY
    // ------------------------------------

    const parentValidation =
      await validateParentCategory({
        parentCategoryId:
          parentCategory,
      });

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

    // ------------------------------------
    // SORT ORDER
    // ------------------------------------

    const normalizedSortOrder =
      normalizeSortOrder(
        sortOrder,
        0
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

    // ------------------------------------
    // CREATE
    // ------------------------------------

    const category =
      await Category.create({
        name:
          cleanName,

        slug,

        description:
          description
            ?.toString() ||
          "",

        image:
          image || "",

        parentCategory:
          parentValidation
            .parentCategory
            ?._id ||
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

        category: {
          ...toPlainObject(
            category
          ),

          productCount:
            0,

          productsCount:
            0,

          totalProducts:
            0,
        },
      });
  } catch (error) {
    console.error(
      "Create Category Error:",
      error
    );

    if (
      error?.code ===
      11000
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

        error:
          error.message,
      });
  }
};

// ========================================
// GET ALL CATEGORIES
//
// GET /api/categories
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

    // ------------------------------------
    // CALCULATE PRODUCTS
    // ------------------------------------

    const countContext =
      await buildProductCountContext({
        activeOnly: false,
      });

    const categoriesWithCounts =
      await attachProductCounts(
        categories,
        {
          countContext,
        }
      );

    return res
      .status(200)
      .json({
        success: true,

        count:
          categoriesWithCounts.length,

        categories:
          categoriesWithCounts,
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

        error:
          error.message,
      });
  }
};

// ========================================
// GET ACTIVE CATEGORIES
//
// GET /api/categories/active
// ========================================

const getActiveCategories =
  async (
    req,
    res
  ) => {
    try {
      const categories =
        await Category.find({
          isActive:
            true,
        })
          .populate(
            "parentCategory",
            "name slug isActive sortOrder"
          )
          .sort({
            sortOrder: 1,
            name: 1,
          });

      // ----------------------------------
      // CALCULATE PRODUCT COUNTS
      // ----------------------------------

      const countContext =
        await buildProductCountContext({
          activeOnly:
            true,
        });

      const categoriesWithCounts =
        await attachProductCounts(
          categories,
          {
            countContext,
          }
        );

      return res
        .status(200)
        .json({
          success: true,

          count:
            categoriesWithCounts.length,

          categories:
            categoriesWithCounts,
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

          error:
            error.message,
        });
    }
  };

// ========================================
// GET MAIN CATEGORIES
//
// GET /api/categories/main
//
// Main category count includes:
// direct products + subcategory products
// ========================================

const getMainCategories =
  async (
    req,
    res
  ) => {
    try {
      const categories =
        await Category.find({
          parentCategory:
            null,

          isActive:
            true,
        }).sort({
          sortOrder: 1,
          name: 1,
        });

      // ----------------------------------
      // PRODUCT COUNTS
      // ----------------------------------

      const countContext =
        await buildProductCountContext({
          activeOnly:
            true,
        });

      const categoriesWithCounts =
        await attachProductCounts(
          categories,
          {
            countContext,
          }
        );

      return res
        .status(200)
        .json({
          success: true,

          count:
            categoriesWithCounts.length,

          categories:
            categoriesWithCounts,
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

          error:
            error.message,
        });
    }
  };

// ========================================
// GET SUBCATEGORIES
//
// GET /api/categories/:id/subcategories
// ========================================

const getSubcategories =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      // ----------------------------------
      // VALIDATE ID
      // ----------------------------------

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid category ID",
          });
      }

      // ----------------------------------
      // FIND PARENT
      // ----------------------------------

      const parent =
        await Category.findById(
          id
        );

      if (!parent) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Main category not found",
          });
      }

      // ----------------------------------
      // MUST BE MAIN CATEGORY
      // ----------------------------------

      if (
        parent.parentCategory
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Subcategories can only be requested for a main category",
          });
      }

      // ----------------------------------
      // FIND SUBCATEGORIES
      // ----------------------------------

      const categories =
        await Category.find({
          parentCategory:
            parent._id,

          isActive:
            true,
        }).sort({
          sortOrder:
            1,

          name:
            1,
        });

      // ----------------------------------
      // PRODUCT COUNTS
      // ----------------------------------

      const countContext =
        await buildProductCountContext({
          activeOnly:
            true,
        });

      const categoriesWithCounts =
        await attachProductCounts(
          categories,
          {
            countContext,
          }
        );

      const parentWithCount =
        addCountFields(
          parent,
          countContext
        );

      return res
        .status(200)
        .json({
          success:
            true,

          parentCategory: {
            _id:
              parentWithCount._id,

            name:
              parentWithCount.name,

            slug:
              parentWithCount.slug,

            productCount:
              parentWithCount
                .productCount,

            productsCount:
              parentWithCount
                .productsCount,

            totalProducts:
              parentWithCount
                .totalProducts,
          },

          count:
            categoriesWithCounts.length,

          categories:
            categoriesWithCounts,
        });
    } catch (error) {
      console.error(
        "Get Subcategories Error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Failed to fetch subcategories",

          error:
            error.message,
        });
    }
  };

// ========================================
// GET CATEGORY TREE
//
// GET /api/categories/tree
// ========================================

const getCategoryTree =
  async (
    req,
    res
  ) => {
    try {
      // ----------------------------------
      // GET TREE
      // ----------------------------------

      const tree =
        await Category.getCategoryTree({
          activeOnly:
            true,
        });

      // ----------------------------------
      // PRODUCT COUNTS
      // ----------------------------------

      const countContext =
        await buildProductCountContext({
          activeOnly:
            true,
        });

      const treeWithCounts =
        await attachProductCountsToTree(
          tree,
          {
            countContext,
          }
        );

      return res
        .status(200)
        .json({
          success:
            true,

          count:
            treeWithCounts.length,

          categories:
            treeWithCounts,
        });
    } catch (error) {
      console.error(
        "Get Category Tree Error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Failed to fetch category tree",

          error:
            error.message,
        });
    }
  };

// ========================================
// GET SINGLE CATEGORY
//
// GET /api/categories/:id
// ========================================

const getCategoryById =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      // ----------------------------------
      // VALIDATE ID
      // ----------------------------------

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid category ID",
          });
      }

      // ----------------------------------
      // FIND CATEGORY
      // ----------------------------------

      const category =
        await Category.findById(
          id
        ).populate(
          "parentCategory",
          "name slug isActive sortOrder"
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Category not found",
          });
      }

      // ----------------------------------
      // CHILDREN
      // ----------------------------------

      let children =
        [];

      if (
        !category.parentCategory
      ) {
        children =
          await Category.find({
            parentCategory:
              category._id,
          }).sort({
            sortOrder:
              1,

            name:
              1,
          });
      }

      // ----------------------------------
      // PRODUCT COUNTS
      // ----------------------------------

      const countContext =
        await buildProductCountContext({
          activeOnly:
            false,
        });

      const categoryWithCount =
        addCountFields(
          category,
          countContext
        );

      const childrenWithCounts =
        await attachProductCounts(
          children,
          {
            countContext,
          }
        );

      return res
        .status(200)
        .json({
          success:
            true,

          category:
            categoryWithCount,

          children:
            childrenWithCounts,
        });
    } catch (error) {
      console.error(
        "Get Category By ID Error:",
        error
      );

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Failed to fetch category",

          error:
            error.message,
        });
    }
  };

// ========================================
// UPDATE CATEGORY
//
// PUT /api/categories/:id
// ========================================

const updateCategory =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      // ----------------------------------
      // VALIDATE ID
      // ----------------------------------

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid category ID",
          });
      }

      // ----------------------------------
      // FIND CATEGORY
      // ----------------------------------

      const category =
        await Category.findById(
          id
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success:
              false,

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

      // ----------------------------------
      // NAME
      // ----------------------------------

      if (
        name !== undefined
      ) {
        const cleanName =
          name
            .toString()
            .trim();

        if (!cleanName) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                "Category name cannot be empty",
            });
        }

        const newSlug =
          createSlug(
            cleanName
          );

        if (!newSlug) {
          return res
            .status(400)
            .json({
              success:
                false,

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

                  $options:
                    "i",
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
              success:
                false,

              message:
                "Another category with this name already exists",
            });
        }

        category.name =
          cleanName;

        category.slug =
          newSlug;
      }

      // ----------------------------------
      // DESCRIPTION
      // ----------------------------------

      if (
        description !==
        undefined
      ) {
        category.description =
          description
            ?.toString() ||
          "";
      }

      // ----------------------------------
      // IMAGE
      // ----------------------------------

      if (
        image !==
        undefined
      ) {
        category.image =
          image || "";
      }

      // ----------------------------------
      // PARENT CATEGORY
      // ----------------------------------

      if (
        parentCategory !==
        undefined
      ) {
        const parentValidation =
          await validateParentCategory({
            parentCategoryId:
              parentCategory,

            currentCategoryId:
              category._id,
          });

        if (
          !parentValidation.valid
        ) {
          return res
            .status(400)
            .json({
              success:
                false,

              message:
                parentValidation.message,
            });
        }

        // If category already has
        // subcategories it cannot
        // become a subcategory.

        if (
          parentValidation
            .parentCategory
        ) {
          const childCount =
            await Category.countDocuments({
              parentCategory:
                category._id,
            });

          if (
            childCount >
            0
          ) {
            return res
              .status(400)
              .json({
                success:
                  false,

                message:
                  "This category has subcategories. Move or delete its subcategories before converting it into a subcategory.",
              });
          }
        }

        category.parentCategory =
          parentValidation
            .parentCategory
            ?._id ||
          null;
      }

      // ----------------------------------
      // STATUS
      // ----------------------------------

      if (
        typeof isActive ===
        "boolean"
      ) {
        category.isActive =
          isActive;
      }

      // ----------------------------------
      // SORT ORDER
      // ----------------------------------

      if (
        sortOrder !==
        undefined
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
              success:
                false,

              message:
                "Sort order must be a valid non-negative number",
            });
        }

        category.sortOrder =
          normalizedSortOrder;
      }

      // ----------------------------------
      // SAVE
      // ----------------------------------

      const updatedCategory =
        await category.save();

      await updatedCategory.populate(
        "parentCategory",
        "name slug isActive sortOrder"
      );

      // ----------------------------------
      // RETURN UPDATED COUNT
      // ----------------------------------

      const countContext =
        await buildProductCountContext({
          activeOnly:
            false,
        });

      const updatedCategoryWithCount =
        addCountFields(
          updatedCategory,
          countContext
        );

      return res
        .status(200)
        .json({
          success:
            true,

          message:
            "Category updated successfully",

          category:
            updatedCategoryWithCount,
        });
    } catch (error) {
      console.error(
        "Update Category Error:",
        error
      );

      if (
        error?.code ===
        11000
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Category name or slug already exists",
          });
      }

      return res
        .status(500)
        .json({
          success:
            false,

          message:
            "Failed to update category",

          error:
            error.message,
        });
    }
  };

// ========================================
// DELETE CATEGORY
//
// DELETE /api/categories/:id
// ========================================

const deleteCategory =
  async (
    req,
    res
  ) => {
    try {
      const {
        id,
      } = req.params;

      // ----------------------------------
      // VALIDATE ID
      // ----------------------------------

      if (
        !isValidObjectId(
          id
        )
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              "Invalid category ID",
          });
      }

      // ----------------------------------
      // FIND CATEGORY
      // ----------------------------------

      const category =
        await Category.findById(
          id
        );

      if (!category) {
        return res
          .status(404)
          .json({
            success:
              false,

            message:
              "Category not found",
          });
      }

      // ----------------------------------
      // CHECK SUBCATEGORIES
      // ----------------------------------

      const subcategoryCount =
        await Category.countDocuments({
          parentCategory:
            category._id,
        });

      if (
        subcategoryCount >
        0
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              `This category has ${subcategoryCount} subcategor${
                subcategoryCount ===
                1
                  ? "y"
                  : "ies"
              }. Delete or move them first.`,
          });
      }

      // ----------------------------------
      // CHECK PRODUCTS
      // ----------------------------------

      const productCount =
        await Product.countDocuments({
          category:
            category._id,
        });

      if (
        productCount >
        0
      ) {
        return res
          .status(400)
          .json({
            success:
              false,

            message:
              `This category is used by ${productCount} product${
                productCount ===
                1
                  ? ""
                  : "s"
              }. Move those products to another category before deleting it.`,
          });
      }

      // ----------------------------------
      // DELETE
      // ----------------------------------

      await category.deleteOne();

      return res
        .status(200)
        .json({
          success:
            true,

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
          success:
            false,

          message:
            "Failed to delete category",

          error:
            error.message,
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