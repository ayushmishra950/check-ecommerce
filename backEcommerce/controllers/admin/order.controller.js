const Order = require("../../models/order.model");
const Admin = require("../../models/admin.model");

/**
 * ============================
 * COMMON ADMIN ROLE CHECK
 * ============================
 */
const checkAdminRole = async (userId, onlySuperAdmin = false) => {
  const admin = await Admin.findById(userId);

  if (!admin) {
    return { allowed: false, message: "Admin not found" };
  }

  if (onlySuperAdmin && admin.role !== "superadmin") {
    return { allowed: false, message: "Only super admin allowed" };
  }

  if (!["admin", "superadmin"].includes(admin.role)) {
    return { allowed: false, message: "Access denied" };
  }

  return { allowed: true, admin };
};

/**
 * ============================
 * GET ALL ORDERS
 * Admin & SuperAdmin
 * ============================
 */
const getAllOrders = async (req, res) => {
  try {
    const userId = req?.user?.id;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }
    const orders = await Order.find({shop:roleCheck?.admin?.shopId})
      .populate("user", "name email")
      .populate("orderItems.product", "name price").sort({createdAt:-1});

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};

/**
 * ============================
 * GET SINGLE ORDER
 * Admin & SuperAdmin
 * ============================
 */
const getOrderById = async (req, res) => {
  try {
    const { userId } = req.query;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.product", "name price");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * ============================
 * UPDATE ORDER STATUS
 * Admin & SuperAdmin
 * ============================
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { userId, orderStatus, paymentStatus } = req.body;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (orderStatus) order.orderStatus = orderStatus;
    if (paymentStatus) order.paymentStatus = paymentStatus;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order update failed",
      error: error.message,
    });
  }
};

/**
 * ============================
 * DELETE ORDER
 * SuperAdmin only
 * ============================
 */
const deleteOrder = async (req, res) => {
  try {
    const { userId } = req.body;

    const roleCheck = await checkAdminRole(userId, true);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.deleteOne();

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Order deletion failed",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
};
