const Admin = require(
  "../models/Admin"
);

const {
  verifyAdminToken,
  getAdminCookieName,
  clearAdminAuthCookie,
} = require(
  "../utils/adminToken"
);

// ========================================
// GET TOKEN FROM REQUEST
// ========================================

const getTokenFromRequest = (
  req
) => {
  // ======================================
  // 1. HTTPONLY COOKIE
  // Primary authentication method
  // ======================================

  const cookieName =
    getAdminCookieName();

  const cookieToken =
    req.cookies?.[
      cookieName
    ];

  if (cookieToken) {
    return cookieToken;
  }

  // ======================================
  // 2. AUTHORIZATION HEADER
  //
  // Useful for Postman / API testing.
  // Frontend normally uses HttpOnly cookie.
  // ======================================

  const authorization =
    req.headers
      ?.authorization;

  if (
    authorization &&
    authorization.startsWith(
      "Bearer "
    )
  ) {
    const token =
      authorization
        .slice(7)
        .trim();

    if (token) {
      return token;
    }
  }

  return null;
};

// ========================================
// PROTECT ADMIN ROUTE
// ========================================

const protectAdmin = async (
  req,
  res,
  next
) => {
  try {
    // ====================================
    // GET TOKEN
    // ====================================

    const token =
      getTokenFromRequest(
        req
      );

    if (!token) {
      return res
        .status(401)
        .json({
          success: false,

          message:
            "Administrator authentication is required.",
        });
    }

    // ====================================
    // VERIFY JWT
    // ====================================

    let decoded;

    try {
      decoded =
        verifyAdminToken(
          token
        );
    } catch (error) {
      // Invalid / expired cookie
      // should be removed.

      clearAdminAuthCookie(
        res
      );

      if (
        error?.name ===
        "TokenExpiredError"
      ) {
        return res
          .status(401)
          .json({
            success: false,

            code:
              "ADMIN_SESSION_EXPIRED",

            message:
              "Your administrator session has expired. Please sign in again.",
          });
      }

      return res
        .status(401)
        .json({
          success: false,

          code:
            "INVALID_ADMIN_SESSION",

          message:
            "Invalid administrator session. Please sign in again.",
        });
    }

    // ====================================
    // TOKEN PURPOSE CHECK
    // ====================================

    if (
      decoded?.type !==
      "admin-auth"
    ) {
      clearAdminAuthCookie(
        res
      );

      return res
        .status(401)
        .json({
          success: false,

          code:
            "INVALID_TOKEN_TYPE",

          message:
            "Invalid administrator authentication token.",
        });
    }

    // ====================================
    // ADMIN ID CHECK
    // ====================================

    if (!decoded?.sub) {
      clearAdminAuthCookie(
        res
      );

      return res
        .status(401)
        .json({
          success: false,

          message:
            "Invalid administrator session.",
        });
    }

    // ====================================
    // FIND ADMIN
    //
    // Important:
    // Always read role/status from DB,
    // not blindly from JWT.
    // ====================================

    const admin =
      await Admin.findById(
        decoded.sub
      );

    if (!admin) {
      clearAdminAuthCookie(
        res
      );

      return res
        .status(401)
        .json({
          success: false,

          code:
            "ADMIN_NOT_FOUND",

          message:
            "Administrator account no longer exists.",
        });
    }

    // ====================================
    // ACTIVE ACCOUNT CHECK
    // ====================================

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

          code:
            "ADMIN_INACTIVE",

          message:
            "This administrator account is inactive.",
        });
    }

    // ====================================
    // PASSWORD CHANGE CHECK
    //
    // If password was changed after
    // token was issued, reject old JWT.
    // ====================================

    if (
      admin.changedPasswordAfter(
        decoded.iat
      )
    ) {
      clearAdminAuthCookie(
        res
      );

      return res
        .status(401)
        .json({
          success: false,

          code:
            "PASSWORD_CHANGED",

          message:
            "Your password was changed after this session was created. Please sign in again.",
        });
    }

    // ====================================
    // ATTACH ADMIN TO REQUEST
    // ====================================

    req.admin = admin;

    req.adminAuth = {
      adminId:
        admin._id.toString(),

      role:
        admin.role,

      tokenIssuedAt:
        decoded.iat,

      tokenExpiresAt:
        decoded.exp,
    };

    return next();
  } catch (error) {
    console.error(
      "Admin Authentication Middleware Error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Unable to verify administrator authentication.",
      });
  }
};

// ========================================
// REQUIRE SPECIFIC ADMIN ROLES
//
// Example:
//
// router.get(
//   "/something",
//   protectAdmin,
//   requireAdminRoles(
//     "super-admin"
//   ),
//   controller
// );
//
// ========================================

const requireAdminRoles =
  (...allowedRoles) =>
  (
    req,
    res,
    next
  ) => {
    try {
      if (
        !req.admin
      ) {
        return res
          .status(401)
          .json({
            success: false,

            message:
              "Administrator authentication is required.",
          });
      }

      // ==================================
      // REMOVE DUPLICATES / INVALID VALUES
      // ==================================

      const roles =
        allowedRoles
          .flat()
          .filter(Boolean);

      if (
        roles.length ===
        0
      ) {
        return res
          .status(500)
          .json({
            success: false,

            message:
              "Administrator route permissions are not configured correctly.",
          });
      }

      // ==================================
      // ROLE CHECK
      // ==================================

      if (
        !roles.includes(
          req.admin.role
        )
      ) {
        return res
          .status(403)
          .json({
            success: false,

            code:
              "ADMIN_PERMISSION_DENIED",

            message:
              "You do not have permission to perform this action.",
          });
      }

      return next();
    } catch (error) {
      console.error(
        "Admin Role Middleware Error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to verify administrator permissions.",
        });
    }
  };

// ========================================
// SUPER ADMIN ONLY
// ========================================

const requireSuperAdmin =
  requireAdminRoles(
    "super-admin"
  );

// ========================================
// ADMIN OR SUPER ADMIN
// ========================================

const requireAnyAdmin =
  requireAdminRoles(
    "admin",
    "super-admin"
  );

// ========================================
// OPTIONAL ADMIN AUTHENTICATION
//
// Does not reject unauthenticated users.
// Useful only if a route can work both
// publicly and for signed-in admins.
// ========================================

const optionalAdminAuth =
  async (
    req,
    res,
    next
  ) => {
    try {
      const token =
        getTokenFromRequest(
          req
        );

      if (!token) {
        req.admin = null;

        return next();
      }

      let decoded;

      try {
        decoded =
          verifyAdminToken(
            token
          );
      } catch {
        req.admin = null;

        clearAdminAuthCookie(
          res
        );

        return next();
      }

      if (
        decoded?.type !==
          "admin-auth" ||
        !decoded?.sub
      ) {
        req.admin = null;

        return next();
      }

      const admin =
        await Admin.findById(
          decoded.sub
        );

      if (
        !admin ||
        admin.isActive ===
          false ||
        admin.changedPasswordAfter(
          decoded.iat
        )
      ) {
        req.admin = null;

        clearAdminAuthCookie(
          res
        );

        return next();
      }

      req.admin = admin;

      req.adminAuth = {
        adminId:
          admin._id.toString(),

        role:
          admin.role,

        tokenIssuedAt:
          decoded.iat,

        tokenExpiresAt:
          decoded.exp,
      };

      return next();
    } catch (error) {
      console.error(
        "Optional Admin Authentication Error:",
        error
      );

      req.admin = null;

      return next();
    }
  };

// ========================================
// EXPORTS
// ========================================

module.exports = {
  protectAdmin,

  requireAdminRoles,

  requireSuperAdmin,

  requireAnyAdmin,

  optionalAdminAuth,

  getTokenFromRequest,
};