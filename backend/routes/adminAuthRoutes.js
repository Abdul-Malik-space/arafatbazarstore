const express =
  require("express");

const {
  rateLimit,
} = require(
  "express-rate-limit"
);

const {
  loginAdmin,
  logoutAdmin,
  getCurrentAdmin,
  changeAdminPassword,
} = require(
  "../controllers/adminAuthController"
);

const {
  protectAdmin,
} = require(
  "../middleware/adminAuth"
);

const router =
  express.Router();

// ========================================
// LOGIN RATE LIMITER
// ========================================

const adminLoginLimiter =
  rateLimit({
    // 15 minutes
    windowMs:
      15 * 60 * 1000,

    // Maximum 10 login requests
    // from one IP per window.
    limit: 10,

    standardHeaders:
      "draft-8",

    legacyHeaders: false,

    message: {
      success: false,

      code:
        "LOGIN_RATE_LIMITED",

      message:
        "Too many administrator login attempts. Please wait a few minutes and try again.",
    },
  });

// ========================================
// PASSWORD CHANGE RATE LIMITER
// ========================================

const passwordChangeLimiter =
  rateLimit({
    // 15 minutes
    windowMs:
      15 * 60 * 1000,

    // Protect this sensitive action
    limit: 5,

    standardHeaders:
      "draft-8",

    legacyHeaders: false,

    message: {
      success: false,

      code:
        "PASSWORD_CHANGE_RATE_LIMITED",

      message:
        "Too many password change attempts. Please wait before trying again.",
    },
  });

// ========================================
// NO CACHE FOR AUTH RESPONSES
// ========================================

router.use(
  (req, res, next) => {
    res.set(
      "Cache-Control",
      "no-store"
    );

    return next();
  }
);

// ========================================
// LOGIN
//
// POST /api/admin/auth/login
//
// Public route.
// Rate limited.
// ========================================

router.post(
  "/login",
  adminLoginLimiter,
  loginAdmin
);

// ========================================
// LOGOUT
//
// POST /api/admin/auth/logout
//
// We intentionally do not protect
// this route.
//
// Even if the JWT is expired or invalid,
// the browser must still be able to clear
// its authentication cookie.
// ========================================

router.post(
  "/logout",
  logoutAdmin
);

// ========================================
// CURRENT ADMIN
//
// GET /api/admin/auth/me
//
// Protected.
// Used by frontend when application loads
// to check whether admin is authenticated.
// ========================================

router.get(
  "/me",
  protectAdmin,
  getCurrentAdmin
);

// ========================================
// CHANGE PASSWORD
//
// PATCH /api/admin/auth/change-password
//
// Protected + rate limited.
// ========================================

router.patch(
  "/change-password",
  protectAdmin,
  passwordChangeLimiter,
  changeAdminPassword
);

// ========================================
// EXPORT
// ========================================

module.exports =
  router;