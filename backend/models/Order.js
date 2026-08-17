const mongoose = require("mongoose");

// ========================================
// ORDER ITEM SCHEMA
// ========================================

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    sku: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    // Product variant, if selected
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    variantName: {
      type: String,
      default: "",
      trim: true,
    },

    unit: {
      type: String,
      default: "piece",
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: [1, "Quantity must be at least 1"],
    },

    // Price at the time of order
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

// ========================================
// CUSTOMER SCHEMA
// ========================================

const customerSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
  },
  {
    _id: false,
  }
);

// ========================================
// SHIPPING ADDRESS SCHEMA
// ========================================

const addressSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
      trim: true,
    },

    area: {
      type: String,
      default: "",
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    province: {
      type: String,
      default: "",
      trim: true,
    },

    postalCode: {
      type: String,
      default: "",
      trim: true,
    },

    country: {
      type: String,
      default: "Pakistan",
      trim: true,
    },

    landmark: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);


// ========================================
// PACKING SELECTION SCHEMA
//
// Snapshot of the packing option selected
// when the order was placed. The display
// name/description can later change in
// Site Settings without changing old orders.
// ========================================

const packingSelectionSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },

    name: {
      type: String,
      default: "",
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

// ========================================
// MAIN ORDER SCHEMA
// ========================================

const orderSchema = new mongoose.Schema(
  {
    // ====================================
    // ORDER NUMBER
    // ====================================

    orderNumber: {
      type: String,
      unique: true,
      index: true,
    },

    // ====================================
    // CUSTOMER
    // ====================================

    customer: {
      type: customerSchema,
      required: true,
    },

    // ====================================
    // SHIPPING ADDRESS
    // ====================================

    shippingAddress: {
      type: addressSchema,
      required: true,
    },

    // ====================================
    // PRODUCTS
    // ====================================

    items: {
      type: [orderItemSchema],
      required: true,

      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },

        message:
          "Order must contain at least one product",
      },
    },

    // ====================================
    // AMOUNTS
    // ====================================

    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },

    deliveryFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ====================================
    // PACKING / PACKAGING
    //
    // The backend controller will validate
    // the selected packing code against the
    // active SiteSettings packing options.
    // The client will never be trusted to
    // provide the packing price directly.
    // ====================================

    packing: {
      type: packingSelectionSchema,
      default: () => ({}),
    },

    packingFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // ====================================
    // PAYMENT
    // ====================================

    paymentMethod: {
      type: String,

      enum: [
        "cod",
        "bank-transfer",
        "easypaisa",
        "jazzcash",
        "card",
      ],

      default: "cod",
    },

    paymentStatus: {
      type: String,

      enum: [
        "pending",
        "paid",
        "failed",
        "refunded",
      ],

      default: "pending",
    },

    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // ====================================
    // ORDER STATUS
    // ====================================

    orderStatus: {
      type: String,

      enum: [
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],

      default: "pending",
      index: true,
    },

    // ====================================
    // CUSTOMER NOTE
    // ====================================

    customerNote: {
      type: String,
      default: "",
      trim: true,
    },

    // ====================================
    // ADMIN NOTE
    // ====================================

    adminNote: {
      type: String,
      default: "",
      trim: true,
    },

    // ====================================
    // COURIER / TRACKING
    // ====================================

    courierName: {
      type: String,
      default: "",
      trim: true,
    },

    trackingNumber: {
      type: String,
      default: "",
      trim: true,
    },

    // ====================================
    // ORDER DATES
    // ====================================

    confirmedAt: {
      type: Date,
      default: null,
    },

    processingAt: {
      type: Date,
      default: null,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    // ====================================
    // CANCELLATION
    // ====================================

    cancellationReason: {
      type: String,
      default: "",
      trim: true,
    },

    // Prevent stock from being restored twice
    stockRestored: {
      type: Boolean,
      default: false,
    },

    // ====================================
    // SOURCE
    // ====================================

    source: {
      type: String,

      enum: [
        "website",
        "admin",
        "phone",
        "whatsapp",
      ],

      default: "website",
    },
  },
  {
    timestamps: true,
  }
);

// ========================================
// AUTO GENERATE ORDER NUMBER
//
// IMPORTANT:
// Mongoose 9 does NOT use next()
// in pre middleware.
// ========================================

orderSchema.pre("validate", function () {
  if (!this.orderNumber) {
    const now = new Date();

    const year = now
      .getFullYear()
      .toString();

    const month = String(
      now.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      now.getDate()
    ).padStart(2, "0");

    const randomNumber = Math.floor(
      100000 + Math.random() * 900000
    );

    this.orderNumber =
      `P17-${year}${month}${day}-${randomNumber}`;
  }
});

// ========================================
// INDEXES
// ========================================

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  "customer.phone": 1,
});

orderSchema.index({
  "customer.email": 1,
});

orderSchema.index({
  orderStatus: 1,
  createdAt: -1,
});

orderSchema.index({
  paymentStatus: 1,
});

orderSchema.index({
  paymentMethod: 1,
});

// ========================================
// MODEL
// ========================================

const Order = mongoose.model(
  "Order",
  orderSchema
);

module.exports = Order;