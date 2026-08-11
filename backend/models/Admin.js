const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// ========================================
// ADMIN SCHEMA
// ========================================

const adminSchema =
  new mongoose.Schema(
    {
      // ==================================
      // BASIC INFORMATION
      // ==================================

      name: {
        type: String,
        required: [
          true,
          "Admin name is required.",
        ],
        trim: true,
        maxlength: [
          100,
          "Admin name cannot exceed 100 characters.",
        ],
      },

      email: {
        type: String,
        required: [
          true,
          "Admin email is required.",
        ],
        unique: true,
        lowercase: true,
        trim: true,

        match: [
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          "Please enter a valid email address.",
        ],
      },

      // ==================================
      // PASSWORD
      // ==================================

      password: {
        type: String,
        required: [
          true,
          "Password is required.",
        ],

        minlength: [
          12,
          "Password must contain at least 12 characters.",
        ],

        select: false,
      },

      // ==================================
      // ROLE
      // ==================================

      role: {
        type: String,

        enum: [
          "super-admin",
          "admin",
        ],

        default: "admin",
      },

      // ==================================
      // ACCOUNT STATUS
      // ==================================

      isActive: {
        type: Boolean,
        default: true,
      },

      // ==================================
      // LOGIN SECURITY
      // ==================================

      loginAttempts: {
        type: Number,
        default: 0,
      },

      lockUntil: {
        type: Date,
        default: null,
      },

      lastLoginAt: {
        type: Date,
        default: null,
      },

      lastLoginIp: {
        type: String,
        trim: true,
        default: "",
      },

      // ==================================
      // PASSWORD SECURITY
      // ==================================

      passwordChangedAt: {
        type: Date,
        default: null,
      },

      // ==================================
      // AUDIT
      // ==================================

      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        default: null,
      },
    },
    {
      timestamps: true,
    }
  );



adminSchema.pre(
  "save",
  async function () {
    if (
      !this.isModified(
        "password"
      )
    ) {
      return;
    }

    const salt =
      await bcrypt.genSalt(12);

    this.password =
      await bcrypt.hash(
        this.password,
        salt
      );

    // Do not set this on first account creation.
    // Only set when an existing password changes.

    if (!this.isNew) {
      this.passwordChangedAt =
        new Date();
    }
  }
);

// ========================================
// COMPARE PASSWORD
// ========================================

adminSchema.methods.comparePassword =
  async function (
    candidatePassword
  ) {
    if (
      !candidatePassword ||
      !this.password
    ) {
      return false;
    }

    return bcrypt.compare(
      candidatePassword,
      this.password
    );
  };

// ========================================
// ACCOUNT LOCK CHECK
// ========================================

adminSchema.methods.isLocked =
  function () {
    if (!this.lockUntil) {
      return false;
    }

    return (
      this.lockUntil.getTime() >
      Date.now()
    );
  };

// ========================================
// RECORD FAILED LOGIN
// ========================================

adminSchema.methods.recordFailedLogin =
  async function () {
    const MAX_ATTEMPTS = 5;

    const LOCK_TIME =
      15 * 60 * 1000;

    // If old lock expired,
    // start again from zero.

    if (
      this.lockUntil &&
      this.lockUntil.getTime() <=
        Date.now()
    ) {
      this.loginAttempts = 0;
      this.lockUntil = null;
    }

    this.loginAttempts += 1;

    if (
      this.loginAttempts >=
      MAX_ATTEMPTS
    ) {
      this.lockUntil =
        new Date(
          Date.now() +
            LOCK_TIME
        );
    }

    await this.save({
      validateBeforeSave: false,
    });
  };

// ========================================
// RESET LOGIN ATTEMPTS
// ========================================

adminSchema.methods.resetLoginAttempts =
  async function (
    ipAddress = ""
  ) {
    this.loginAttempts = 0;
    this.lockUntil = null;
    this.lastLoginAt =
      new Date();

    this.lastLoginIp =
      ipAddress || "";

    await this.save({
      validateBeforeSave: false,
    });
  };

// ========================================
// CHECK IF JWT WAS ISSUED BEFORE
// PASSWORD CHANGE
// ========================================

adminSchema.methods.changedPasswordAfter =
  function (
    jwtIssuedAt
  ) {
    if (
      !this.passwordChangedAt
    ) {
      return false;
    }

    const changedTimestamp =
      Math.floor(
        this.passwordChangedAt.getTime() /
          1000
      );

    return (
      jwtIssuedAt <
      changedTimestamp
    );
  };

// ========================================
// SAFE ADMIN OBJECT
// ========================================

adminSchema.methods.toSafeObject =
  function () {
    return {
      _id: this._id,

      name: this.name,

      email: this.email,

      role: this.role,

      isActive:
        this.isActive,

      lastLoginAt:
        this.lastLoginAt,

      createdAt:
        this.createdAt,

      updatedAt:
        this.updatedAt,
    };
  };

// ========================================
// MODEL
// ========================================

const Admin =
  mongoose.model(
    "Admin",
    adminSchema
  );

module.exports = Admin;