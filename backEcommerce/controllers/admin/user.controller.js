const User = require("../../models/user.model");
const Admin = require("../../models/admin.model");
const Order = require("../../models/order.model");

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

  if (!onlySuperAdmin && !["admin", "superadmin"].includes(admin.role)) {
    return { allowed: false, message: "Access denied" };
  }

  return { allowed: true, admin };
};

/**
 * ============================
 * GET ALL USERS
 * Admin & SuperAdmin
 * ============================
 */
const getAllUsers = async (req, res) => {
  try {
    const userId = req.user?.id;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const users = await Order.find({shop:roleCheck?.admin?.shopId}).select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

/**
 * ============================
 * GET SINGLE USER
 * Admin & SuperAdmin
 * ============================
 */
const getUserById = async (req, res) => {
  try {
    const { userId } = req.query;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

/**
 * ============================
 * UPDATE USER
 * Admin & SuperAdmin
 * ============================
 */
const updateUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    // Admin cannot change role
    if (
      roleCheck.admin.role === "admin" &&
      req.body.role
    ) {
      return res.status(403).json({
        success: false,
        message: "Admin cannot change user role",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User update failed",
      error: error.message,
    });
  }
};

/**
 * ============================
 * DELETE USER
 * SuperAdmin only
 * ============================
 */
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.body;

    const roleCheck = await checkAdminRole(userId, true);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "User deletion failed",
      error: error.message,
    });
  }
};

/**
 * ============================
 * TOGGLE USER STATUS
 * SuperAdmin only
 * ============================
 */
const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.body;

    const roleCheck = await checkAdminRole(userId, true);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: "User status updated",
      isActive: user.isActive,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Status update failed",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserStatus,
};
