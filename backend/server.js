const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const path = require("path");

require("dotenv").config();

// ========================================
// ROUTES
// ========================================

const categoryRoutes = require(
  "./routes/categoryRoutes"
);

const productRoutes = require(
  "./routes/productRoutes"
);

const uploadRoutes = require(
  "./routes/uploadRoutes"
);

const orderRoutes = require(
  "./routes/orderRoutes"
);

const siteSettingsRoutes = require(
  "./routes/siteSettingsRoutes"
);

const pageContentRoutes = require(
  "./routes/pageContentRoutes"
);

const adminAuthRoutes = require(
  "./routes/adminAuthRoutes"
);

const adminDashboardRoutes = require(
  "./routes/adminDashboardRoutes"
);

// ========================================
// APP
// ========================================

const app = express();

const PORT =
  Number(process.env.PORT) ||
  5000;

// ========================================
// EXPRESS SECURITY SETTINGS
// ========================================

// Hide Express signature.
app.disable("x-powered-by");

// Needed when deployed behind
// reverse proxy such as cPanel,
// Nginx, Render, Railway, etc.
if (
  process.env.NODE_ENV ===
  "production"
) {
  app.set(
    "trust proxy",
    1
  );
}

// ========================================
// HELMET
// ========================================

app.use(
  helmet({
    // Product / banner images are
    // requested by frontend from
    // another origin during development.
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  })
);

// ========================================
// BODY PARSERS
// ========================================

app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

// ========================================
// COOKIE PARSER
//
// Must come before adminAuth middleware.
// ========================================

app.use(
  cookieParser()
);

// ========================================
// CORS
// ========================================

const allowedOrigins = [
  "http://localhost:5173",

  process.env.CLIENT_URL,

  ...(
    process.env
      .ALLOWED_ORIGINS ||
    ""
  ).split(","),
]
  .map((origin) =>
    String(
      origin || ""
    ).trim()
  )
  .filter(Boolean);

// Remove duplicates.
const uniqueAllowedOrigins = [
  ...new Set(
    allowedOrigins
  ),
];

const corsOptions = {
  origin(
    origin,
    callback
  ) {
    // Postman, Thunder Client,
    // curl and server-to-server
    // requests may have no Origin.
    if (!origin) {
      return callback(
        null,
        true
      );
    }

    if (
      uniqueAllowedOrigins.includes(
        origin
      )
    ) {
      return callback(
        null,
        true
      );
    }

    console.error(
      "CORS rejected origin:",
      origin
    );

    const error =
      new Error(
        "Origin is not allowed by CORS."
      );

    error.statusCode = 403;

    return callback(
      error
    );
  },

  // REQUIRED for HttpOnly
  // authentication cookies.
  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "Accept",
  ],
};

app.use(
  cors(corsOptions)
);

// ========================================
// STATIC UPLOADS
//
// Product images,
// category images,
// logo,
// banners etc.
// ========================================

app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "uploads"
    )
  )
);

// ========================================
// MONGODB CONNECTION
// ========================================

let databaseConnectionPromise =
  null;

const connectDB =
  async () => {
    // 0 = disconnected
    // 1 = connected
    // 2 = connecting
    // 3 = disconnecting

    if (
      mongoose.connection
        .readyState === 1
    ) {
      return mongoose.connection;
    }

    if (
      !process.env.MONGO_URI
    ) {
      throw new Error(
        "MONGO_URI is missing from environment variables."
      );
    }

    // Reuse same connection promise
    // if multiple requests arrive
    // while MongoDB is connecting.
    if (
      !databaseConnectionPromise
    ) {
      databaseConnectionPromise =
        mongoose
          .connect(
            process.env.MONGO_URI,
            {
              serverSelectionTimeoutMS:
                30000,

              connectTimeoutMS:
                30000,

              socketTimeoutMS:
                45000,
            }
          )
          .then(
            (
              connection
            ) => {
              console.log(
                "MongoDB Connected"
              );

              return connection;
            }
          )
          .catch(
            (error) => {
              databaseConnectionPromise =
                null;

              throw error;
            }
          );
    }

    return databaseConnectionPromise;
  };

// ========================================
// ROOT ROUTE
// ========================================

app.get(
  "/",
  (req, res) => {
    return res
      .status(200)
      .json({
        success: true,

        message:
          "Page17 General Store API is running",

        environment:
          process.env
            .NODE_ENV ||
          "development",
      });
  }
);

// ========================================
// HEALTH CHECK
// ========================================

app.get(
  "/api/health",
  (req, res) => {
    return res
      .status(200)
      .json({
        success: true,

        message:
          "Page17 General Store API is running",

        databaseState:
          mongoose.connection
            .readyState,
      });
  }
);

// ========================================
// DATABASE MIDDLEWARE
//
// All /api routes need MongoDB.
// Health endpoint above remains
// available even if DB has issues.
// ========================================

app.use(
  "/api",
  async (
    req,
    res,
    next
  ) => {
    try {
      await connectDB();

      return next();
    } catch (error) {
      console.error(
        "Database connection middleware error:",
        error.message
      );

      return res
        .status(503)
        .json({
          success: false,

          message:
            "Database connection is currently unavailable. Please try again.",

          ...(
            process.env
              .NODE_ENV !==
              "production" && {
              error:
                error.message,
            }
          ),
        });
    }
  }
);

// ========================================
// ADMIN AUTHENTICATION
//
// POST  /api/admin/auth/login
// POST  /api/admin/auth/logout
// GET   /api/admin/auth/me
// PATCH /api/admin/auth/change-password
// ========================================

app.use(
  "/api/admin/auth",
  adminAuthRoutes
);

app.use(
  "/api/admin/dashboard",
  adminDashboardRoutes
);

// ========================================
// STORE / WEBSITE ROUTES
// ========================================

// Categories
app.use(
  "/api/categories",
  categoryRoutes
);

// Products
app.use(
  "/api/products",
  productRoutes
);

// Uploads
app.use(
  "/api/uploads",
  uploadRoutes
);

// Orders
app.use(
  "/api/orders",
  orderRoutes
);

// Site Settings
app.use(
  "/api/site-settings",
  siteSettingsRoutes
);

// ========================================
// PAGE CONTENT / PAGES CMS
//
// Public:
//
// GET /api/page-content/header
// GET /api/page-content/public/:slug
// GET /api/page-content/system/:systemKey
//
// Admin:
//
// GET    /api/page-content
// GET    /api/page-content/:id
// POST   /api/page-content
// PUT    /api/page-content/:id
// DELETE /api/page-content/:id
//
// Admin security for protected routes
// is handled inside pageContentRoutes.
// ========================================

app.use(
  "/api/page-content",
  pageContentRoutes
);

// ========================================
// 404
// ========================================

app.use(
  (req, res) => {
    return res
      .status(404)
      .json({
        success: false,

        message:
          "Route not found.",

        path:
          req.originalUrl,
      });
  }
);

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled Server Error:",
      error.stack ||
        error.message
    );

    const statusCode =
      Number(
        error.statusCode ||
          error.status
      ) || 500;

    return res
      .status(statusCode)
      .json({
        success: false,

        message:
          statusCode === 500 &&
          process.env
            .NODE_ENV ===
            "production"
            ? "Internal server error."
            : error.message ||
              "Internal server error.",
      });
  }
);

// ========================================
// START SERVER
// ========================================

const startServer =
  async () => {
    try {
      await connectDB();

      app.listen(
        PORT,
        () => {
          console.log(
            `Server running on http://localhost:${PORT}`
          );

          console.log(
            `Environment: ${
              process.env
                .NODE_ENV ||
              "development"
            }`
          );

          console.log(
            "Admin authentication routes enabled"
          );

          console.log(
            "Page content routes enabled"
          );
        }
      );
    } catch (error) {
      console.error(
        "Server startup failed:",
        error.message
      );

      process.exit(1);
    }
  };

// ========================================
// RUN
// ========================================

if (
  require.main === module
) {
  startServer();
}

// ========================================
// EXPORT
// ========================================

module.exports = app;