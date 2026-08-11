const mongoose = require("mongoose");

// ========================================
// PRODUCT VARIANT SCHEMA
// Example:
// 500g, 1kg, Small, Large, Pack of 6 etc.
// ========================================
const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    price: {
      type: Number,
      min: 0,
      required: true,
    },

    salePrice: {
      type: Number,
      min: 0,
      default: null,
    },

    stock: {
      type: Number,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: false,
  }
);

// ========================================
// PRODUCT IMAGE SCHEMA
// ========================================
const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
    },

    alt: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: true,
  }
);

// ========================================
// PRODUCT SCHEMA
// ========================================
const productSchema = new mongoose.Schema(
  {
    // ------------------------------------
    // BASIC INFORMATION
    // ------------------------------------
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    sku: {
      type: String,
      required: [true, "Product SKU is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },

    barcode: {
      type: String,
      trim: true,
      default: "",
    },

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    // ------------------------------------
    // CATEGORY
    // ------------------------------------
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Product category is required"],
      index: true,
    },

    // ------------------------------------
    // DESCRIPTION
    // ------------------------------------
    shortDescription: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // ------------------------------------
    // PRICE
    // ------------------------------------
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    salePrice: {
      type: Number,
      min: [0, "Sale price cannot be negative"],
      default: null,
    },

    // Admin use only
    costPrice: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ------------------------------------
    // STOCK
    // ------------------------------------
    stock: {
      type: Number,
      min: [0, "Stock cannot be negative"],
      default: 0,
    },

    lowStockThreshold: {
      type: Number,
      min: 0,
      default: 5,
    },

    trackInventory: {
      type: Boolean,
      default: true,
    },

    allowBackorder: {
      type: Boolean,
      default: false,
    },

    // ------------------------------------
    // PRODUCT UNIT
    // Examples:
    // piece, kg, gram, litre, pack, box
    // ------------------------------------
    unit: {
      type: String,
      trim: true,
      default: "piece",
    },

    // ------------------------------------
    // IMAGES
    // ------------------------------------
    mainImage: {
      type: String,
      default: "",
    },

    images: {
      type: [imageSchema],
      default: [],
    },

    // ------------------------------------
    // VARIANTS
    // Example:
    // 500g / 1kg
    // Small / Medium / Large
    // ------------------------------------
    variants: {
      type: [variantSchema],
      default: [],
    },

    // ------------------------------------
    // TAGS
    // ------------------------------------
    tags: {
      type: [String],
      default: [],
    },

    // ------------------------------------
    // PAGE 17 HOME SECTIONS
    // ------------------------------------
    isFeatured: {
      type: Boolean,
      default: false,
    },

    isTrending: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    isDealOfDay: {
      type: Boolean,
      default: false,
    },

    dealEndsAt: {
      type: Date,
      default: null,
    },

    // ------------------------------------
    // PRODUCT STATUS
    // ------------------------------------
    isActive: {
      type: Boolean,
      default: true,
    },

    sortOrder: {
      type: Number,
      default: 0,
    },

    // ------------------------------------
    // RATINGS
    // ------------------------------------
    averageRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    reviewCount: {
      type: Number,
      min: 0,
      default: 0,
    },

    // ------------------------------------
    // SEO
    // ------------------------------------
    metaTitle: {
      type: String,
      trim: true,
      default: "",
    },

    metaDescription: {
      type: String,
      trim: true,
      default: "",
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
// DISCOUNT PERCENTAGE
// Automatically calculated
// ========================================
productSchema.virtual("discountPercentage").get(function () {
  if (
    this.salePrice !== null &&
    this.salePrice < this.price &&
    this.price > 0
  ) {
    return Math.round(
      ((this.price - this.salePrice) / this.price) * 100
    );
  }

  return 0;
});

// ========================================
// FINAL SELLING PRICE
// ========================================
productSchema.virtual("finalPrice").get(function () {
  if (
    this.salePrice !== null &&
    this.salePrice >= 0 &&
    this.salePrice < this.price
  ) {
    return this.salePrice;
  }

  return this.price;
});

// ========================================
// STOCK STATUS
// ========================================
productSchema.virtual("stockStatus").get(function () {
  if (!this.trackInventory) {
    return "in-stock";
  }

  if (this.stock <= 0) {
    return this.allowBackorder
      ? "backorder"
      : "out-of-stock";
  }

  if (this.stock <= this.lowStockThreshold) {
    return "low-stock";
  }

  return "in-stock";
});

// ========================================
// INDEXES FOR SEARCH / FILTER
// ========================================
productSchema.index({
  name: "text",
  brand: "text",
  tags: "text",
  shortDescription: "text",
});

productSchema.index({
  category: 1,
  isActive: 1,
});

productSchema.index({
  isTrending: 1,
  isActive: 1,
});

productSchema.index({
  isFeatured: 1,
  isActive: 1,
});

productSchema.index({
  createdAt: -1,
});

// ========================================
// PRODUCT MODEL
// ========================================
const Product = mongoose.model(
  "Product",
  productSchema
);

module.exports = Product;