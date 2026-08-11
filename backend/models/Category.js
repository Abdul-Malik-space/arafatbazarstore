const mongoose = require("mongoose");

// ========================================
// CATEGORY SCHEMA
//
// Structure:
//
// Main Category
//      ↓
// Subcategory
//
// Example:
//
// Grocery
//   ├── Cooking Oil
//   ├── Rice
//   └── Flour
//
// Personal Care
//   ├── Face Wash
//   └── Hair Care
// ========================================

const categorySchema = new mongoose.Schema(
  {
    // ====================================
    // CATEGORY NAME
    // ====================================

    name: {
      type: String,

      required: [
        true,
        "Category name is required",
      ],

      trim: true,
    },

    // ====================================
    // SLUG
    // ====================================

    slug: {
      type: String,

      required: [
        true,
        "Category slug is required",
      ],

      unique: true,

      lowercase: true,

      trim: true,
    },

    // ====================================
    // DESCRIPTION
    // ====================================

    description: {
      type: String,

      default: "",

      trim: true,
    },

    // ====================================
    // CATEGORY IMAGE
    // ====================================

    image: {
      type: String,

      default: "",
    },

    // ====================================
    // PARENT CATEGORY
    //
    // null:
    // Main Category
    //
    // ObjectId:
    // Subcategory
    // ====================================

    parentCategory: {
      type:
        mongoose.Schema.Types.ObjectId,

      ref: "Category",

      default: null,

      index: true,
    },

    // ====================================
    // ACTIVE STATUS
    // ====================================

    isActive: {
      type: Boolean,

      default: true,

      index: true,
    },

    // ====================================
    // SORT ORDER
    // ====================================

    sortOrder: {
      type: Number,

      default: 0,

      min: 0,

      index: true,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  }
);

// ========================================
// VIRTUAL: CATEGORY TYPE
// ========================================

categorySchema.virtual(
  "categoryType"
).get(function () {
  return this.parentCategory
    ? "sub"
    : "main";
});

// ========================================
// VIRTUAL: IS MAIN CATEGORY
// ========================================

categorySchema.virtual(
  "isMainCategory"
).get(function () {
  return !this.parentCategory;
});

// ========================================
// VIRTUAL: IS SUBCATEGORY
// ========================================

categorySchema.virtual(
  "isSubcategory"
).get(function () {
  return Boolean(
    this.parentCategory
  );
});

// ========================================
// PRE VALIDATE
//
// IMPORTANT:
//
// Mongoose 9 میں next() استعمال نہیں
// کریں گے.
//
// اگر category خود اپنی parent ہو
// تو error throw کریں گے.
// ========================================

categorySchema.pre(
  "validate",
  function () {
    if (
      !this.parentCategory ||
      !this._id
    ) {
      return;
    }

    const parentId =
      this.parentCategory?._id ||
      this.parentCategory;

    if (
      parentId.toString() ===
      this._id.toString()
    ) {
      throw new Error(
        "A category cannot be its own parent."
      );
    }
  }
);

// ========================================
// INDEXES
// ========================================

// Main/Sub category ordering

categorySchema.index({
  parentCategory: 1,
  isActive: 1,
  sortOrder: 1,
  name: 1,
});

// Active category ordering

categorySchema.index({
  isActive: 1,
  sortOrder: 1,
});

// ========================================
// STATIC: GET MAIN CATEGORIES
// ========================================

categorySchema.statics.getMainCategories =
  function ({
    activeOnly = true,
  } = {}) {
    const filter = {
      parentCategory: null,
    };

    if (activeOnly) {
      filter.isActive = true;
    }

    return this.find(
      filter
    ).sort({
      sortOrder: 1,
      name: 1,
    });
  };

// ========================================
// STATIC: GET SUBCATEGORIES
// ========================================

categorySchema.statics.getSubcategories =
  function (
    parentCategoryId,
    {
      activeOnly = true,
    } = {}
  ) {
    const filter = {
      parentCategory:
        parentCategoryId,
    };

    if (activeOnly) {
      filter.isActive = true;
    }

    return this.find(
      filter
    ).sort({
      sortOrder: 1,
      name: 1,
    });
  };

// ========================================
// STATIC: GET CATEGORY TREE
//
// Result:
//
// [
//   {
//     name: "Groceries",
//     children: [
//       {
//         name: "Cooking Oil"
//       }
//     ]
//   }
// ]
// ========================================

categorySchema.statics.getCategoryTree =
  async function ({
    activeOnly = true,
  } = {}) {
    const filter = {};

    if (activeOnly) {
      filter.isActive = true;
    }

    const categories =
      await this.find(filter)
        .sort({
          sortOrder: 1,
          name: 1,
        })
        .lean();

    // ------------------------------------
    // MAIN CATEGORIES
    // ------------------------------------

    const mainCategories =
      categories.filter(
        (category) =>
          !category.parentCategory
      );

    // ------------------------------------
    // SUBCATEGORIES
    // ------------------------------------

    const subcategories =
      categories.filter(
        (category) =>
          category.parentCategory
      );

    // ------------------------------------
    // BUILD TREE
    // ------------------------------------

    return mainCategories.map(
      (mainCategory) => {
        const children =
          subcategories
            .filter(
              (subcategory) =>
                subcategory.parentCategory
                  .toString() ===
                mainCategory._id
                  .toString()
            )
            .sort(
              (a, b) => {
                const orderDifference =
                  Number(
                    a.sortOrder || 0
                  ) -
                  Number(
                    b.sortOrder || 0
                  );

                if (
                  orderDifference !== 0
                ) {
                  return orderDifference;
                }

                return a.name.localeCompare(
                  b.name
                );
              }
            );

        return {
          ...mainCategory,

          children,
        };
      }
    );
  };

// ========================================
// MODEL
// ========================================

const Category =
  mongoose.model(
    "Category",
    categorySchema
  );

module.exports = Category;