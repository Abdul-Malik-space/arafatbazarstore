const Admin = require(
  "../models/Admin"
);

const {
  createAdminToken,
  setAdminAuthCookie,
  clearAdminAuthCookie,
} = require(
  "../utils/adminToken"
);

// ========================================
// HELPERS
// ========================================

const normalizeEmail = (
  email = ""
) => {
  return String(email)
    .trim()
    .toLowerCase();
};

// ========================================
// PASSWORD VALIDATION
// ========================================

const validatePassword = (
  password
) => {
  if (
    typeof password !==
    "string"
  ) {
    return {
      valid: false,
      message:
        "Password is required.",
    };
  }

  if (
    password.length < 12
  ) {
    return {
      valid: false,
      message:
        "Password must contain at least 12 characters.",
    };
  }

  return {
    valid: true,
    message: "",
  };
};

// ========================================
// LOGIN ADMIN
// POST /api/admin/auth/login
// ========================================

const loginAdmin = async (
  req,
  res
) => {
  try {
    const {
      email,
      password,
    } = req.body || {};

    // ====================================
    // BASIC VALIDATION
    // ====================================

    if (
      !email ||
      !password
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Email and password are required.",
        });
    }

    const normalizedEmail =
      normalizeEmail(email);

    // ====================================
    // FIND ADMIN
    // Password is select:false
    // so explicitly include it.
    // ====================================

    const admin =
      await Admin.findOne({
        email:
          normalizedEmail,
      }).select("+password");

    // ====================================
    // GENERIC INVALID LOGIN
    // Do not reveal whether email exists.
    // ====================================

    if (!admin) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Invalid email or password.",
        });
    }

    // ====================================
    // ACCOUNT ACTIVE CHECK
    // ====================================

    if (
      admin.isActive ===
      false
    ) {
      return res
        .status(403)
        .json({
          success: false,

          message:
            "This administrator account is inactive.",
        });
    }

    // ====================================
    // ACCOUNT LOCK CHECK
    // ====================================

    if (
      admin.isLocked()
    ) {
      const remainingMs =
        admin.lockUntil.getTime() -
        Date.now();

      const remainingMinutes =
        Math.max(
          1,
          Math.ceil(
            remainingMs /
              60000
          )
        );

      return res
        .status(429)
        .json({
          success: false,

          message: `Too many failed login attempts. Please try again in approximately ${remainingMinutes} minute${
            remainingMinutes ===
            1
              ? ""
              : "s"
          }.`,
        });
    }

    // ====================================
    // VERIFY PASSWORD
    // ====================================

    const passwordCorrect =
      await admin.comparePassword(
        password
      );

    if (!passwordCorrect) {
      await admin.recordFailedLogin();

      return res
        .status(401)
        .json({
          success: false,

          message:
            "Invalid email or password.",
        });
    }

    // ====================================
    // LOGIN SUCCESS
    // ====================================

    const clientIp =
      req.ip ||
      req.socket
        ?.remoteAddress ||
      "";

    await admin.resetLoginAttempts(
      clientIp
    );

    // ====================================
    // CREATE JWT
    // ====================================

    const token =
      createAdminToken(
        admin
      );

    // ====================================
    // HTTPONLY COOKIE
    // ====================================

    setAdminAuthCookie(
      res,
      token
    );

    // ====================================
    // RESPONSE
    // ====================================

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Login successful.",

        admin:
          admin.toSafeObject(),
      });
  } catch (error) {
    console.error(
      "Admin Login Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to sign in at the moment.",
      });
  }
};

// ========================================
// LOGOUT ADMIN
// POST /api/admin/auth/logout
// ========================================

const logoutAdmin = async (
  req,
  res
) => {
  try {
    clearAdminAuthCookie(
      res
    );

    return res
      .status(200)
      .json({
        success: true,

        message:
          "Logout successful.",
      });
  } catch (error) {
    console.error(
      "Admin Logout Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to logout.",
      });
  }
};

// ========================================
// GET CURRENT ADMIN
// GET /api/admin/auth/me
//
// req.admin will be populated
// by adminAuth middleware.
// ========================================

const getCurrentAdmin =
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.admin?._id
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required.",
          });
      }

      const admin =
        await Admin.findById(
          req.admin._id
        );

      if (!admin) {
        clearAdminAuthCookie(
          res
        );

        return res
          .status(401)
          .json({
            success: false,

            message:
              "Administrator account was not found.",
          });
      }

      if (
        admin.isActive ===
        false
      ) {
        clearAdminAuthCookie(
          res
        );

        return res
          .status(403)
          .json({
            success: false,

            message:
              "Administrator account is inactive.",
          });
      }

      return res
        .status(200)
        .json({
          success: true,

          admin:
            admin.toSafeObject(),
        });
    } catch (error) {
      console.error(
        "Get Current Admin Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load administrator profile.",
        });
    }
  };

// ========================================
// CHANGE ADMIN PASSWORD
// PATCH /api/admin/auth/change-password
// ========================================

const changeAdminPassword =
  async (
    req,
    res
  ) => {
    try {
      if (
        !req.admin?._id
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Authentication required.",
          });
      }

      const {
        currentPassword,
        newPassword,
        confirmPassword,
      } = req.body || {};

      // ==================================
      // REQUIRED FIELDS
      // ==================================

      if (
        !currentPassword ||
        !newPassword ||
        !confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "Current password, new password and confirmation are required.",
          });
      }

      // ==================================
      // PASSWORD CONFIRMATION
      // ==================================

      if (
        newPassword !==
        confirmPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password and confirmation do not match.",
          });
      }

      // ==================================
      // VALIDATE NEW PASSWORD
      // ==================================

      const validation =
        validatePassword(
          newPassword
        );

      if (
        !validation.valid
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              validation.message,
          });
      }

      // ==================================
      // SAME PASSWORD CHECK
      // ==================================

      if (
        currentPassword ===
        newPassword
      ) {
        return res
          .status(400)
          .json({
            success: false,

            message:
              "New password must be different from the current password.",
          });
      }

      // ==================================
      // GET ADMIN WITH PASSWORD
      // ==================================

      const admin =
        await Admin.findById(
          req.admin._id
        ).select("+password");

      if (!admin) {
        clearAdminAuthCookie(
          res
        );

        return res
          .status(404)
          .json({
            success: false,

            message:
              "Administrator account was not found.",
          });
      }

      if (
        admin.isActive ===
        false
      ) {
        clearAdminAuthCookie(
          res
        );

        return res
          .status(403)
          .json({
            success: false,

            message:
              "Administrator account is inactive.",
          });
      }

      // ==================================
      // VERIFY CURRENT PASSWORD
      // ==================================

      const currentPasswordCorrect =
        await admin.comparePassword(
          currentPassword
        );

      if (
        !currentPasswordCorrect
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Current password is incorrect.",
          });
      }

      // ==================================
      // SAVE NEW PASSWORD
      //
      // Admin model pre-save hook:
      // 1. hashes password
      // 2. updates passwordChangedAt
      // ==================================

      admin.password =
        newPassword;

      await admin.save();

      // ==================================
      // ISSUE NEW JWT
      //
      // Old JWT will later become invalid
      // because middleware checks
      // passwordChangedAt.
      // ==================================

      const token =
        createAdminToken(
          admin
        );

      setAdminAuthCookie(
        res,
        token
      );

      // ==================================
      // RESPONSE
      // ==================================

      return res
        .status(200)
        .json({
          success: true,

          message:
            "Password changed successfully.",

          admin:
            admin.toSafeObject(),
        });
    } catch (error) {
      console.error(
        "Change Admin Password Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to change password.",
        });
    }
  };

// ========================================
// EXPORTS
// ========================================

module.exports = {
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  changeAdminPassword,
};