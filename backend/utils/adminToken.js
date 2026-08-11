const jwt = require("jsonwebtoken");

// ========================================
// GET JWT SECRET
// ========================================

const getJwtSecret = () => {
  const secret =
    process.env.JWT_SECRET;

  if (!secret) {
    throw new Error(
      "JWT_SECRET is not configured."
    );
  }

  return secret;
};

// ========================================
// JWT EXPIRATION
// ========================================

const getJwtExpiresIn = () => {
  return (
    process.env.JWT_EXPIRES_IN ||
    "12h"
  );
};

// ========================================
// COOKIE NAME
// ========================================

const getAdminCookieName =
  () => {
    return (
      process.env
        .ADMIN_COOKIE_NAME ||
      "page17_admin_token"
    );
  };

// ========================================
// CREATE ADMIN JWT
// ========================================

const createAdminToken = (
  admin
) => {
  if (!admin?._id) {
    throw new Error(
      "Admin ID is required to create token."
    );
  }

  return jwt.sign(
    {
      // Admin ID
      sub: admin._id.toString(),

      // Used later for role checks
      role: admin.role,

      // Token purpose
      type: "admin-auth",
    },
    getJwtSecret(),
    {
      expiresIn:
        getJwtExpiresIn(),

      issuer: "page17-api",

      audience:
        "page17-admin",
    }
  );
};

// ========================================
// VERIFY ADMIN JWT
// ========================================

const verifyAdminToken = (
  token
) => {
  if (!token) {
    throw new Error(
      "Authentication token is required."
    );
  }

  return jwt.verify(
    token,
    getJwtSecret(),
    {
      issuer: "page17-api",

      audience:
        "page17-admin",
    }
  );
};

// ========================================
// COOKIE SETTINGS
// ========================================

const getCookieOptions =
  () => {
    const isProduction =
      process.env.NODE_ENV ===
      "production";

    const secure =
      process.env
        .COOKIE_SECURE !==
      undefined
        ? process.env
            .COOKIE_SECURE ===
          "true"
        : isProduction;

    let sameSite =
      (
        process.env
          .COOKIE_SAME_SITE ||
        (isProduction
          ? "none"
          : "lax")
      ).toLowerCase();

    // Only valid values
    if (
      ![
        "lax",
        "strict",
        "none",
      ].includes(sameSite)
    ) {
      sameSite = "lax";
    }

    // SameSite=None requires
    // Secure cookies.
    if (
      sameSite === "none" &&
      !secure
    ) {
      sameSite = "lax";
    }

    const options = {
      httpOnly: true,

      secure,

      sameSite,

      path: "/",
    };

    // Optional production
    // cookie domain.
    if (
      process.env
        .ADMIN_COOKIE_DOMAIN
    ) {
      options.domain =
        process.env
          .ADMIN_COOKIE_DOMAIN;
    }

    return options;
  };

// ========================================
// CALCULATE COOKIE MAX AGE
// FROM JWT EXPIRATION
// ========================================

const getTokenMaxAge = (
  token
) => {
  try {
    const decoded =
      jwt.decode(token);

    if (
      !decoded?.exp ||
      !decoded?.iat
    ) {
      return undefined;
    }

    const milliseconds =
      (decoded.exp -
        decoded.iat) *
      1000;

    if (
      milliseconds <= 0
    ) {
      return undefined;
    }

    return milliseconds;
  } catch {
    return undefined;
  }
};

// ========================================
// SET AUTH COOKIE
// ========================================

const setAdminAuthCookie = (
  res,
  token
) => {
  if (!res) {
    throw new Error(
      "Response object is required."
    );
  }

  if (!token) {
    throw new Error(
      "Authentication token is required."
    );
  }

  const options =
    getCookieOptions();

  const maxAge =
    getTokenMaxAge(token);

  if (maxAge) {
    options.maxAge = maxAge;
  }

  res.cookie(
    getAdminCookieName(),
    token,
    options
  );
};

// ========================================
// CLEAR AUTH COOKIE
// ========================================

const clearAdminAuthCookie =
  (res) => {
    if (!res) {
      throw new Error(
        "Response object is required."
      );
    }

    const options =
      getCookieOptions();

    // maxAge should not be used
    // while clearing cookie.
    delete options.maxAge;

    res.clearCookie(
      getAdminCookieName(),
      options
    );
  };

// ========================================
// EXPORTS
// ========================================

module.exports = {
  createAdminToken,

  verifyAdminToken,

  setAdminAuthCookie,

  clearAdminAuthCookie,

  getAdminCookieName,

  getCookieOptions,
};