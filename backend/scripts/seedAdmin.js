require("dotenv").config();

const mongoose =
  require("mongoose");

const Admin = require(
  "../models/Admin"
);

// ========================================
// ENV VALIDATION
// ========================================

const getRequiredEnv = (
  key
) => {
  const value =
    process.env[key];

  if (
    !value ||
    !String(value).trim()
  ) {
    throw new Error(
      `${key} is required in .env`
    );
  }

  return String(
    value
  ).trim();
};

// ========================================
// NORMALIZE EMAIL
// ========================================

const normalizeEmail = (
  email
) => {
  return String(email)
    .trim()
    .toLowerCase();
};

// ========================================
// DATABASE CONNECTION
// ========================================

const connectDatabase =
  async () => {
    const mongoUri =
      process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }

    await mongoose.connect(
      mongoUri
    );

    console.log(
      "MongoDB connected."
    );
  };

// ========================================
// CREATE FIRST SUPER ADMIN
// ========================================

const seedAdmin =
  async () => {
    try {
      // ==================================
      // CONNECT DB
      // ==================================

      await connectDatabase();

      // ==================================
      // READ ENV VALUES
      // ==================================

      const name =
        getRequiredEnv(
          "INITIAL_ADMIN_NAME"
        );

      const email =
        normalizeEmail(
          getRequiredEnv(
            "INITIAL_ADMIN_EMAIL"
          )
        );

      const password =
        getRequiredEnv(
          "INITIAL_ADMIN_PASSWORD"
        );

      // ==================================
      // BASIC PASSWORD CHECK
      // ==================================

      if (
        password.length < 12
      ) {
        throw new Error(
          "INITIAL_ADMIN_PASSWORD must contain at least 12 characters."
        );
      }

      // ==================================
      // CHECK EXISTING ADMIN
      // ==================================

      const existingAdmin =
        await Admin.findOne({
          email,
        });

      if (existingAdmin) {
        console.log(
          ""
        );

        console.log(
          "Admin already exists."
        );

        console.log(
          `Email: ${existingAdmin.email}`
        );

        console.log(
          `Role: ${existingAdmin.role}`
        );

        console.log(
          ""
        );

        process.exitCode = 0;

        return;
      }

      // ==================================
      // CREATE SUPER ADMIN
      // ==================================

      const admin =
        await Admin.create({
          name,

          email,

          password,

          role:
            "super-admin",

          isActive: true,
        });

      // ==================================
      // SUCCESS
      // ==================================

      console.log(
        ""
      );

      console.log(
        "========================================"
      );

      console.log(
        "SUPER ADMIN CREATED SUCCESSFULLY"
      );

      console.log(
        "========================================"
      );

      console.log(
        `Name: ${admin.name}`
      );

      console.log(
        `Email: ${admin.email}`
      );

      console.log(
        `Role: ${admin.role}`
      );

      console.log(
        `Admin ID: ${admin._id}`
      );

      console.log(
        ""
      );

      console.log(
        "IMPORTANT:"
      );

      console.log(
        "Remove INITIAL_ADMIN_PASSWORD from .env after confirming login."
      );

      console.log(
        ""
      );

      process.exitCode = 0;
    } catch (error) {
      console.error(
        ""
      );

      console.error(
        "========================================"
      );

      console.error(
        "SUPER ADMIN SEED FAILED"
      );

      console.error(
        "========================================"
      );

      console.error(
        error.message
      );

      console.error(
        ""
      );

      process.exitCode = 1;
    } finally {
      try {
        await mongoose.connection.close();

        console.log(
          "MongoDB connection closed."
        );
      } catch (
        closeError
      ) {
        console.error(
          "Unable to close MongoDB connection:",
          closeError.message
        );
      }
    }
  };

// ========================================
// RUN
// ========================================

seedAdmin();