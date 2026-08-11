const mongoose = require("mongoose");
const Product = require("../models/Product");
const Category = require("../models/Category");

// ========================================
// HELPERS
// ========================================

const createSlug = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

const parseBoolean = (value) => {
  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;
  return undefined;
};

const normalizeTags = (tags) => {
  if (!tags) return [];

  if (Array.isArray(tags)) {
    return tags
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

// ========================================
// CREATE PRODUCT
// POST /api/products
// ========================================

const createProduct = async (req, res) => {
  try {
    const {
      name,
      sku,
      barcode,
      brand,
      category,
      shortDescription,
      description,
      price,
      salePrice,
      costPrice,
      stock,
      lowStockThreshold,
      trackInventory,
      allowBackorder,
      unit,
      mainImage,
      images,
      variants,
      tags,
      isFeatured,
      isTrending,
      isNewArrival,
      isBestSeller,
      isDealOfDay,
      dealEndsAt,
      isActive,
      sortOrder,
      metaTitle,
      metaDescription,
    } = req.body;

    // ------------------------------
    // Required fields
    // ------------------------------

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
      });
    }

    if (!sku || !sku.trim()) {
      return res.status(400).json({
        success: false,
        message: "Product SKU is required",
      });
    }

    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Product category is required",
      });
    }

    if (!isValidObjectId(category)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID",
      });
    }

    if (
      price === undefined ||
      price === null ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid product price is required",
      });
    }

    // ------------------------------
    // Check category
    // ------------------------------

    const categoryExists = await Category.findById(category);

    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // ------------------------------
    // Slug
    // ------------------------------

    const slug = createSlug(name);
    const normalizedSku = sku.trim().toUpperCase();

    // ------------------------------
    // Duplicate check
    // ------------------------------

    const existingProduct = await Product.findOne({
      $or: [
        { slug },
        { sku: normalizedSku },
      ],
    });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message:
          existingProduct.sku === normalizedSku
            ? "Product SKU already exists"
            : "Product with this name already exists",
      });
    }

    // ------------------------------
    // Sale price validation
    // ------------------------------

    if (
      salePrice !== undefined &&
      salePrice !== null &&
      Number(salePrice) >= Number(price)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Sale price must be lower than regular price",
      });
    }

    // ------------------------------
    // Create product
    // ------------------------------

    const product = await Product.create({
      name: name.trim(),
      slug,
      sku: normalizedSku,
      barcode: barcode || "",
      brand: brand || "",
      category,

      shortDescription: shortDescription || "",
      description: description || "",

      price: Number(price),

      salePrice:
        salePrice !== undefined &&
        salePrice !== null &&
        salePrice !== ""
          ? Number(salePrice)
          : null,

      costPrice:
        costPrice !== undefined && costPrice !== ""
          ? Number(costPrice)
          : 0,

      stock:
        stock !== undefined && stock !== ""
          ? Number(stock)
          : 0,

      lowStockThreshold:
        lowStockThreshold !== undefined
          ? Number(lowStockThreshold)
          : 5,

      trackInventory:
        parseBoolean(trackInventory) ?? true,

      allowBackorder:
        parseBoolean(allowBackorder) ?? false,

      unit: unit || "piece",

      mainImage: mainImage || "",

      images: Array.isArray(images)
        ? images
        : [],

      variants: Array.isArray(variants)
        ? variants
        : [],

      tags: normalizeTags(tags),

      isFeatured:
        parseBoolean(isFeatured) ?? false,

      isTrending:
        parseBoolean(isTrending) ?? false,

      isNewArrival:
        parseBoolean(isNewArrival) ?? false,

      isBestSeller:
        parseBoolean(isBestSeller) ?? false,

      isDealOfDay:
        parseBoolean(isDealOfDay) ?? false,

      dealEndsAt: dealEndsAt || null,

      isActive:
        parseBoolean(isActive) ?? true,

      sortOrder:
        sortOrder !== undefined
          ? Number(sortOrder)
          : 0,

      metaTitle: metaTitle || "",
      metaDescription: metaDescription || "",
    });

    await product.populate(
      "category",
      "name slug image"
    );

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create Product Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create product",
      error: error.message,
    });
  }
};

// ========================================
// GET ALL PRODUCTS
// GET /api/products
// ========================================

const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      isFeatured,
      isTrending,
      isNewArrival,
      isBestSeller,
      isDealOfDay,
      isActive,
      inStock,
      sort = "newest",
    } = req.query;

    const query = {};

    // ------------------------------
    // Search
    // ------------------------------

    if (search && search.trim()) {
      query.$text = {
        $search: search.trim(),
      };
    }

    // ------------------------------
    // Category
    // Supports category ID or slug
    // ------------------------------

    if (category) {
      if (isValidObjectId(category)) {
        query.category = category;
      } else {
        const categoryData =
          await Category.findOne({
            slug: category.toLowerCase(),
          });

        if (!categoryData) {
          return res.status(200).json({
            success: true,
            count: 0,
            total: 0,
            page: Number(page),
            pages: 0,
            products: [],
          });
        }

        query.category = categoryData._id;
      }
    }

    // ------------------------------
    // Brand
    // ------------------------------

    if (brand) {
      query.brand = {
        $regex: brand,
        $options: "i",
      };
    }

    // ------------------------------
    // Price filter
    // ------------------------------

    if (
      minPrice !== undefined ||
      maxPrice !== undefined
    ) {
      query.price = {};

      if (minPrice !== undefined) {
        query.price.$gte = Number(minPrice);
      }

      if (maxPrice !== undefined) {
        query.price.$lte = Number(maxPrice);
      }
    }

    // ------------------------------
    // Boolean filters
    // ------------------------------

    const featuredValue =
      parseBoolean(isFeatured);

    const trendingValue =
      parseBoolean(isTrending);

    const newArrivalValue =
      parseBoolean(isNewArrival);

    const bestSellerValue =
      parseBoolean(isBestSeller);

    const dealValue =
      parseBoolean(isDealOfDay);

    const activeValue =
      parseBoolean(isActive);

    if (featuredValue !== undefined) {
      query.isFeatured = featuredValue;
    }

    if (trendingValue !== undefined) {
      query.isTrending = trendingValue;
    }

    if (newArrivalValue !== undefined) {
      query.isNewArrival = newArrivalValue;
    }

    if (bestSellerValue !== undefined) {
      query.isBestSeller = bestSellerValue;
    }

    if (dealValue !== undefined) {
      query.isDealOfDay = dealValue;
    }

    if (activeValue !== undefined) {
      query.isActive = activeValue;
    }

    // ------------------------------
    // Stock filter
    // ------------------------------

    if (parseBoolean(inStock) === true) {
      query.$or = [
        {
          trackInventory: false,
        },
        {
          stock: { $gt: 0 },
        },
        {
          allowBackorder: true,
        },
      ];
    }

    // ------------------------------
    // Sorting
    // ------------------------------

    let sortOptions = {
      createdAt: -1,
    };

    switch (sort) {
      case "oldest":
        sortOptions = {
          createdAt: 1,
        };
        break;

      case "price-low":
        sortOptions = {
          price: 1,
        };
        break;

      case "price-high":
        sortOptions = {
          price: -1,
        };
        break;

      case "name-asc":
        sortOptions = {
          name: 1,
        };
        break;

      case "name-desc":
        sortOptions = {
          name: -1,
        };
        break;

      case "stock-low":
        sortOptions = {
          stock: 1,
        };
        break;

      case "stock-high":
        sortOptions = {
          stock: -1,
        };
        break;

      case "custom":
        sortOptions = {
          sortOrder: 1,
          createdAt: -1,
        };
        break;
    }

    const currentPage = Math.max(
      Number(page),
      1
    );

    const pageLimit = Math.min(
      Math.max(Number(limit), 1),
      100
    );

    const skip =
      (currentPage - 1) * pageLimit;

    const total =
      await Product.countDocuments(query);

    const products = await Product.find(query)
      .populate(
        "category",
        "name slug image"
      )
      .sort(sortOptions)
      .skip(skip)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,
      count: products.length,
      total,
      page: currentPage,
      pages: Math.ceil(total / pageLimit),
      products,
    });
  } catch (error) {
    console.error("Get Products Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

// ========================================
// GET SINGLE PRODUCT BY ID
// GET /api/products/:id
// ========================================

const getProductById = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(
      req.params.id
    ).populate(
      "category",
      "name slug image description"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get Product By ID Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ========================================
// GET PRODUCT BY SLUG
// GET /api/products/slug/:slug
// ========================================

const getProductBySlug = async (
  req,
  res
) => {
  try {
    const product = await Product.findOne({
      slug: req.params.slug.toLowerCase(),
      isActive: true,
    }).populate(
      "category",
      "name slug image description"
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error(
      "Get Product By Slug Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE PRODUCT
// PUT /api/products/:id
// ========================================

const updateProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const data = req.body;

    // ------------------------------
    // Name / Slug
    // ------------------------------

    if (data.name !== undefined) {
      if (!data.name.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "Product name cannot be empty",
        });
      }

      const newSlug = createSlug(data.name);

      const duplicateSlug =
        await Product.findOne({
          _id: { $ne: product._id },
          slug: newSlug,
        });

      if (duplicateSlug) {
        return res.status(400).json({
          success: false,
          message:
            "Another product with this name already exists",
        });
      }

      product.name = data.name.trim();
      product.slug = newSlug;
    }

    // ------------------------------
    // SKU
    // ------------------------------

    if (data.sku !== undefined) {
      const newSku = data.sku
        .trim()
        .toUpperCase();

      if (!newSku) {
        return res.status(400).json({
          success: false,
          message: "SKU cannot be empty",
        });
      }

      const duplicateSku =
        await Product.findOne({
          _id: { $ne: product._id },
          sku: newSku,
        });

      if (duplicateSku) {
        return res.status(400).json({
          success: false,
          message:
            "Another product with this SKU already exists",
        });
      }

      product.sku = newSku;
    }

    // ------------------------------
    // Category
    // ------------------------------

    if (data.category !== undefined) {
      if (!isValidObjectId(data.category)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category ID",
        });
      }

      const categoryExists =
        await Category.findById(
          data.category
        );

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }

      product.category = data.category;
    }

    // ------------------------------
    // Price validation
    // ------------------------------

    const finalRegularPrice =
      data.price !== undefined
        ? Number(data.price)
        : product.price;

    const finalSalePrice =
      data.salePrice !== undefined
        ? data.salePrice === "" ||
          data.salePrice === null
          ? null
          : Number(data.salePrice)
        : product.salePrice;

    if (finalRegularPrice < 0) {
      return res.status(400).json({
        success: false,
        message:
          "Product price cannot be negative",
      });
    }

    if (
      finalSalePrice !== null &&
      finalSalePrice >= finalRegularPrice
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Sale price must be lower than regular price",
      });
    }

    product.price = finalRegularPrice;
    product.salePrice = finalSalePrice;

    // ------------------------------
    // Basic fields
    // ------------------------------

    if (data.barcode !== undefined)
      product.barcode = data.barcode;

    if (data.brand !== undefined)
      product.brand = data.brand;

    if (
      data.shortDescription !== undefined
    )
      product.shortDescription =
        data.shortDescription;

    if (data.description !== undefined)
      product.description =
        data.description;

    if (data.costPrice !== undefined)
      product.costPrice = Number(
        data.costPrice
      );

    if (data.stock !== undefined)
      product.stock = Math.max(
        Number(data.stock),
        0
      );

    if (
      data.lowStockThreshold !== undefined
    )
      product.lowStockThreshold = Math.max(
        Number(data.lowStockThreshold),
        0
      );

    if (data.unit !== undefined)
      product.unit = data.unit;

    if (data.mainImage !== undefined)
      product.mainImage = data.mainImage;

    if (Array.isArray(data.images))
      product.images = data.images;

    if (Array.isArray(data.variants))
      product.variants = data.variants;

    if (data.tags !== undefined)
      product.tags = normalizeTags(
        data.tags
      );

    if (data.sortOrder !== undefined)
      product.sortOrder = Number(
        data.sortOrder
      );

    if (data.dealEndsAt !== undefined)
      product.dealEndsAt =
        data.dealEndsAt || null;

    if (data.metaTitle !== undefined)
      product.metaTitle =
        data.metaTitle;

    if (
      data.metaDescription !== undefined
    )
      product.metaDescription =
        data.metaDescription;

    // ------------------------------
    // Boolean fields
    // ------------------------------

    const booleanFields = [
      "trackInventory",
      "allowBackorder",
      "isFeatured",
      "isTrending",
      "isNewArrival",
      "isBestSeller",
      "isDealOfDay",
      "isActive",
    ];

    booleanFields.forEach((field) => {
      if (data[field] !== undefined) {
        const value = parseBoolean(
          data[field]
        );

        if (value !== undefined) {
          product[field] = value;
        }
      }
    });

    const updatedProduct =
      await product.save();

    await updatedProduct.populate(
      "category",
      "name slug image"
    );

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "Update Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update product",
      error: error.message,
    });
  }
};

// ========================================
// DELETE PRODUCT
// DELETE /api/products/:id
// ========================================

const deleteProduct = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(
      req.params.id
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.deleteOne();

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete Product Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to delete product",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE PRODUCT STOCK
// PATCH /api/products/:id/stock
// ========================================

const updateProductStock = async (
  req,
  res
) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const { stock } = req.body;

    if (
      stock === undefined ||
      Number(stock) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid stock quantity is required",
      });
    }

    const product =
      await Product.findByIdAndUpdate(
        req.params.id,
        {
          stock: Number(stock),
        },
        {
          new: true,
          runValidators: true,
        }
      ).populate(
        "category",
        "name slug image"
      );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "Product stock updated successfully",
      product,
    });
  } catch (error) {
    console.error(
      "Update Stock Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update product stock",
      error: error.message,
    });
  }
};

// ========================================
// HOME PAGE PRODUCT SECTIONS
// ========================================

const getFeaturedProducts = async (
  req,
  res
) => {
  try {
    const products = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .populate(
        "category",
        "name slug image"
      )
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .limit(Number(req.query.limit) || 12);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch featured products",
      error: error.message,
    });
  }
};

const getTrendingProducts = async (
  req,
  res
) => {
  try {
    const products = await Product.find({
      isTrending: true,
      isActive: true,
    })
      .populate(
        "category",
        "name slug image"
      )
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .limit(Number(req.query.limit) || 12);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch trending products",
      error: error.message,
    });
  }
};

const getNewArrivals = async (
  req,
  res
) => {
  try {
    const products = await Product.find({
      isNewArrival: true,
      isActive: true,
    })
      .populate(
        "category",
        "name slug image"
      )
      .sort({
        createdAt: -1,
      })
      .limit(Number(req.query.limit) || 12);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch new arrivals",
      error: error.message,
    });
  }
};

const getBestSellers = async (
  req,
  res
) => {
  try {
    const products = await Product.find({
      isBestSeller: true,
      isActive: true,
    })
      .populate(
        "category",
        "name slug image"
      )
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .limit(Number(req.query.limit) || 12);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch best sellers",
      error: error.message,
    });
  }
};

const getDealProducts = async (
  req,
  res
) => {
  try {
    const now = new Date();

    const products = await Product.find({
      isDealOfDay: true,
      isActive: true,

      $or: [
        {
          dealEndsAt: null,
        },
        {
          dealEndsAt: {
            $gte: now,
          },
        },
      ],
    })
      .populate(
        "category",
        "name slug image"
      )
      .sort({
        sortOrder: 1,
        createdAt: -1,
      })
      .limit(Number(req.query.limit) || 12);

    return res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch deal products",
      error: error.message,
    });
  }
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
  updateProduct,
  deleteProduct,
  updateProductStock,
  getFeaturedProducts,
  getTrendingProducts,
  getNewArrivals,
  getBestSellers,
  getDealProducts,
};