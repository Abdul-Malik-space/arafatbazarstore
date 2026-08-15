const Order = require("../models/Order");
const CustomerProfile = require("../models/CustomerProfile");
const {
  normalizePhoneKey,
} = require("../utils/customerIdentity");

// ========================================
// CUSTOMER PROFILE COLLECTION
//
// IMPORTANT:
// MongoDB $lookup needs the real collection
// name, not a Mongoose model property.
// Keeping this explicit avoids
// CustomerProfile.collection being undefined
// in some Mongoose/runtime situations.
// ========================================

const CUSTOMER_PROFILE_COLLECTION =
  "customerprofiles";

// ========================================
// HELPERS
// ========================================

const escapeRegex = (value) =>
  String(value || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPhoneKeyExpression = () => ({
  $let: {
    vars: {
      cleaned: {
        $replaceAll: {
          input: {
            $replaceAll: {
              input: {
                $replaceAll: {
                  input: {
                    $replaceAll: {
                      input: {
                        $replaceAll: {
                          input: {
                            $replaceAll: {
                              input: {
                                $ifNull: ["$customer.phone", ""],
                              },
                              find: " ",
                              replacement: "",
                            },
                          },
                          find: "-",
                          replacement: "",
                        },
                      },
                      find: "+",
                      replacement: "",
                    },
                  },
                  find: "(",
                  replacement: "",
                },
              },
              find: ")",
              replacement: "",
            },
          },
          find: ".",
          replacement: "",
        },
      },
    },
    in: {
      $switch: {
        branches: [
          {
            case: {
              $and: [
                {
                  $eq: [
                    { $substrCP: ["$$cleaned", 0, 2] },
                    "92",
                  ],
                },
                {
                  $eq: [{ $strLenCP: "$$cleaned" }, 12],
                },
              ],
            },
            then: {
              $concat: [
                "0",
                { $substrCP: ["$$cleaned", 2, 10] },
              ],
            },
          },
          {
            case: {
              $and: [
                {
                  $eq: [
                    { $substrCP: ["$$cleaned", 0, 1] },
                    "3",
                  ],
                },
                {
                  $eq: [{ $strLenCP: "$$cleaned" }, 10],
                },
              ],
            },
            then: {
              $concat: ["0", "$$cleaned"],
            },
          },
        ],
        default: "$$cleaned",
      },
    },
  },
});

const getCustomerBasePipeline = () => [
  {
    $sort: {
      createdAt: -1,
    },
  },
  {
    $addFields: {
      __phoneKey: getPhoneKeyExpression(),
      __itemQuantity: {
        $sum: {
          $map: {
            input: { $ifNull: ["$items", []] },
            as: "item",
            in: { $ifNull: ["$$item.quantity", 0] },
          },
        },
      },
    },
  },
  {
    $match: {
      __phoneKey: {
        $nin: ["", null],
      },
    },
  },
  {
    $group: {
      _id: "$__phoneKey",

      customer: {
        $first: "$customer",
      },

      shippingAddress: {
        $first: "$shippingAddress",
      },

      firstOrderAt: {
        $min: "$createdAt",
      },

      lastOrderAt: {
        $max: "$createdAt",
      },

      lastOrderId: {
        $first: "$_id",
      },

      lastOrderNumber: {
        $first: "$orderNumber",
      },

      totalOrders: {
        $sum: 1,
      },

      deliveredOrders: {
        $sum: {
          $cond: [
            { $eq: ["$orderStatus", "delivered"] },
            1,
            0,
          ],
        },
      },

      cancelledOrders: {
        $sum: {
          $cond: [
            { $eq: ["$orderStatus", "cancelled"] },
            1,
            0,
          ],
        },
      },

      openOrders: {
        $sum: {
          $cond: [
            {
              $in: [
                "$orderStatus",
                ["pending", "confirmed", "processing", "shipped"],
              ],
            },
            1,
            0,
          ],
        },
      },

      totalItems: {
        $sum: "$__itemQuantity",
      },

      totalOrderValue: {
        $sum: {
          $cond: [
            { $ne: ["$orderStatus", "cancelled"] },
            { $ifNull: ["$totalAmount", 0] },
            0,
          ],
        },
      },

      deliveredValue: {
        $sum: {
          $cond: [
            { $eq: ["$orderStatus", "delivered"] },
            { $ifNull: ["$totalAmount", 0] },
            0,
          ],
        },
      },
    },
  },
  {
    $lookup: {
      from: CUSTOMER_PROFILE_COLLECTION,
      localField: "_id",
      foreignField: "phoneKey",
      as: "profile",
    },
  },
  {
    $addFields: {
      profile: {
        $ifNull: [
          { $arrayElemAt: ["$profile", 0] },
          {},
        ],
      },
    },
  },
  {
    $addFields: {
      phoneKey: "$_id",
      status: {
        $ifNull: ["$profile.status", "active"],
      },
      tags: {
        $ifNull: ["$profile.tags", []],
      },
      internalNote: {
        $ifNull: ["$profile.internalNote", ""],
      },
      blockedReason: {
        $ifNull: ["$profile.blockedReason", ""],
      },
    },
  },
];

const getSortStage = (sort) => {
  switch (sort) {
    case "oldest":
      return { firstOrderAt: 1 };

    case "orders-high":
      return { totalOrders: -1, lastOrderAt: -1 };

    case "spend-high":
      return { deliveredValue: -1, lastOrderAt: -1 };

    case "name":
      return {
        "customer.firstName": 1,
        "customer.lastName": 1,
      };

    case "recent":
    default:
      return { lastOrderAt: -1 };
  }
};

const buildListMatchStages = ({
  search,
  status,
  repeatOnly,
}) => {
  const stages = [];

  if (status && ["active", "vip", "blocked"].includes(status)) {
    stages.push({
      $match: {
        status,
      },
    });
  }

  if (String(repeatOnly) === "true") {
    stages.push({
      $match: {
        totalOrders: { $gte: 2 },
      },
    });
  }

  const searchText = String(search || "").trim();

  if (searchText) {
    const regex = new RegExp(escapeRegex(searchText), "i");

    stages.push({
      $match: {
        $or: [
          { "customer.firstName": regex },
          { "customer.lastName": regex },
          { "customer.phone": regex },
          { "customer.alternatePhone": regex },
          { "customer.email": regex },
          { "shippingAddress.city": regex },
          { "shippingAddress.area": regex },
          { phoneKey: regex },
          { tags: regex },
        ],
      },
    });
  }

  return stages;
};

const buildCustomerResponse = ({
  phoneKey,
  profile,
  orders,
}) => {
  const latestOrder = orders[0] || null;

  const deliveredOrders = orders.filter(
    (order) => order.orderStatus === "delivered"
  );

  const cancelledOrders = orders.filter(
    (order) => order.orderStatus === "cancelled"
  );

  const openOrders = orders.filter((order) =>
    ["pending", "confirmed", "processing", "shipped"].includes(
      order.orderStatus
    )
  );

  const totalOrderValue = orders.reduce((sum, order) => {
    if (order.orderStatus === "cancelled") {
      return sum;
    }

    return sum + Number(order.totalAmount || 0);
  }, 0);

  const deliveredValue = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount || 0),
    0
  );

  return {
    phoneKey,
    customer: latestOrder?.customer || null,
    shippingAddress: latestOrder?.shippingAddress || null,
    profile: {
      status: profile?.status || "active",
      tags: profile?.tags || [],
      internalNote: profile?.internalNote || "",
      blockedReason: profile?.blockedReason || "",
      updatedAt: profile?.updatedAt || null,
    },
    stats: {
      totalOrders: orders.length,
      deliveredOrders: deliveredOrders.length,
      cancelledOrders: cancelledOrders.length,
      openOrders: openOrders.length,
      totalOrderValue,
      deliveredValue,
      firstOrderAt:
        orders.length > 0
          ? orders[orders.length - 1].createdAt
          : null,
      lastOrderAt: latestOrder?.createdAt || null,
    },
    orders,
  };
};

// ========================================
// GET CUSTOMERS
// GET /api/admin/customers
// ========================================

const getCustomers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      repeatOnly = "false",
      sort = "recent",
    } = req.query;

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(
      Math.max(Number(limit) || 20, 1),
      100
    );
    const skip = (currentPage - 1) * pageLimit;

    const listStages = buildListMatchStages({
      search,
      status,
      repeatOnly,
    });

    const [result] = await Order.aggregate([
      ...getCustomerBasePipeline(),
      {
        $facet: {
          summary: [
            {
              $group: {
                _id: null,
                totalCustomers: { $sum: 1 },
                activeCustomers: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "active"] }, 1, 0],
                  },
                },
                vipCustomers: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "vip"] }, 1, 0],
                  },
                },
                blockedCustomers: {
                  $sum: {
                    $cond: [{ $eq: ["$status", "blocked"] }, 1, 0],
                  },
                },
                repeatCustomers: {
                  $sum: {
                    $cond: [{ $gte: ["$totalOrders", 2] }, 1, 0],
                  },
                },
                deliveredValue: { $sum: "$deliveredValue" },
              },
            },
          ],
          customers: [
            ...listStages,
            { $sort: getSortStage(sort) },
            { $skip: skip },
            { $limit: pageLimit },
            {
              $project: {
                _id: 0,
                phoneKey: 1,
                customer: 1,
                shippingAddress: 1,
                firstOrderAt: 1,
                lastOrderAt: 1,
                lastOrderId: 1,
                lastOrderNumber: 1,
                totalOrders: 1,
                deliveredOrders: 1,
                cancelledOrders: 1,
                openOrders: 1,
                totalItems: 1,
                totalOrderValue: 1,
                deliveredValue: 1,
                status: 1,
                tags: 1,
                internalNote: 1,
              },
            },
          ],
          filteredCount: [
            ...listStages,
            { $count: "count" },
          ],
        },
      },
    ]);

    const summary = result?.summary?.[0] || {
      totalCustomers: 0,
      activeCustomers: 0,
      vipCustomers: 0,
      blockedCustomers: 0,
      repeatCustomers: 0,
      deliveredValue: 0,
    };

    const total = result?.filteredCount?.[0]?.count || 0;

    return res.status(200).json({
      success: true,
      customers: result?.customers || [],
      summary,
      total,
      page: currentPage,
      pages: Math.max(Math.ceil(total / pageLimit), 1),
      limit: pageLimit,
    });
  } catch (error) {
    console.error("Get Customers Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error.message,
    });
  }
};

// ========================================
// GET CUSTOMER DETAILS
// GET /api/admin/customers/:phoneKey
// ========================================

const getCustomerByPhoneKey = async (req, res) => {
  try {
    const phoneKey = normalizePhoneKey(req.params.phoneKey);

    if (!phoneKey) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer phone identifier",
      });
    }

    const orders = await Order.aggregate([
      {
        $addFields: {
          __phoneKey: getPhoneKeyExpression(),
        },
      },
      {
        $match: {
          __phoneKey: phoneKey,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $project: {
          __phoneKey: 0,
        },
      },
    ]);

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const profile = await CustomerProfile.findOne({
      phoneKey,
    }).lean();

    return res.status(200).json({
      success: true,
      customer: buildCustomerResponse({
        phoneKey,
        profile,
        orders,
      }),
    });
  } catch (error) {
    console.error("Get Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error.message,
    });
  }
};

// ========================================
// UPDATE CUSTOMER CRM PROFILE
// PATCH /api/admin/customers/:phoneKey
// ========================================

const updateCustomerProfile = async (req, res) => {
  try {
    const phoneKey = normalizePhoneKey(req.params.phoneKey);

    if (!phoneKey) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer phone identifier",
      });
    }

    const customerExists = await Order.exists({
      "customer.phone": { $exists: true },
    });

    if (!customerExists) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Verify this normalized phone actually has at least one order.
    const [matchingOrder] = await Order.aggregate([
      {
        $addFields: {
          __phoneKey: getPhoneKeyExpression(),
        },
      },
      {
        $match: {
          __phoneKey: phoneKey,
        },
      },
      { $limit: 1 },
      { $project: { _id: 1 } },
    ]);

    if (!matchingOrder) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const allowedStatuses = ["active", "vip", "blocked"];

    const status = String(req.body.status || "active").trim();

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer status",
      });
    }

    const tags = Array.isArray(req.body.tags)
      ? [
          ...new Set(
            req.body.tags
              .map((tag) => String(tag || "").trim())
              .filter(Boolean)
          ),
        ].slice(0, 12)
      : [];

    const internalNote = String(
      req.body.internalNote || ""
    ).trim();

    const blockedReason =
      status === "blocked"
        ? String(req.body.blockedReason || "").trim()
        : "";

    if (internalNote.length > 3000) {
      return res.status(400).json({
        success: false,
        message: "Internal note is too long",
      });
    }

    if (blockedReason.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Blocked reason is too long",
      });
    }

    const profile = await CustomerProfile.findOneAndUpdate(
      { phoneKey },
      {
        $set: {
          status,
          tags,
          internalNote,
          blockedReason,
          updatedBy: req.admin?._id || null,
        },
        $setOnInsert: {
          phoneKey,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    ).lean();

    return res.status(200).json({
      success: true,
      message: "Customer profile updated successfully",
      profile,
    });
  } catch (error) {
    console.error("Update Customer Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update customer profile",
      error: error.message,
    });
  }
};

module.exports = {
  getCustomers,
  getCustomerByPhoneKey,
  updateCustomerProfile,
};
