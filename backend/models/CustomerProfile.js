const mongoose = require("mongoose");

// ========================================
// CUSTOMER PROFILE
//
// Orders remain the source of truth for
// transactional customer information.
// This collection stores admin-only CRM
// information such as tags, status/flags
// and internal notes.
// ========================================

const customerProfileSchema = new mongoose.Schema(
  {
    phoneKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["active", "vip", "blocked"],
      default: "active",
      index: true,
    },

    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (items) =>
          Array.isArray(items) && items.length <= 12,
        message: "A customer can have at most 12 tags.",
      },
    },

    internalNote: {
      type: String,
      default: "",
      trim: true,
      maxlength: 3000,
    },

    blockedReason: {
      type: String,
      default: "",
      trim: true,
      maxlength: 500,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
  },
  {
    timestamps: true,

    // Keep the MongoDB collection name explicit so
    // aggregation $lookup never depends on Mongoose's
    // pluralization/model internals.
    collection: "customerprofiles",
  }
);

customerProfileSchema.index({
  status: 1,
  updatedAt: -1,
});

const CustomerProfile = mongoose.model(
  "CustomerProfile",
  customerProfileSchema
);

module.exports = CustomerProfile;
