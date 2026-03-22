const Category = require("../../models/category.model");
const Admin = require("../../models/admin.model");

/**
 * ============================
 * COMMON ADMIN ROLE CHECK
 * ============================
 */
const checkAdminRole = async (userId) => {
  const admin = await Admin.findById(userId);

  if (!admin) {
    return { allowed: false, message: "User not found" };
  }

  if (admin.role !== "admin" && admin.role !== "superadmin") {
    return { allowed: false, message: "Access denied" };
  }

  return { allowed: true, admin };
};

/**
 * ============================
 * CREATE CATEGORY
 * ============================
 */
const createCategory = async (req, res) => {
  try {
    const { userId, name, description, status, shopId } = req.body;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const exists = await Category.findOne({ name, shopId });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    const category = await Category.create({
      name,
      description,
      isActive: status==="active"?true : false,
      shopId
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Category creation failed",
      error: error.message,
    });
  }
};

/**
 * ============================
 * GET ALL CATEGORIES
 * ============================
 */
const getAllCategories = async (req, res) => {
  try {
    const { userId, shopId } = req.query;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const categories = await Category.find({shopId}).sort({createdAt:-1});

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};

/**
 * ============================
 * GET SINGLE CATEGORY
 * ============================
 */
const getCategoryById = async (req, res) => {
  try {
    const { userId, shopId, id } = req.query;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const category = await Category.find({_id : id, shopId});

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message,
    });
  }
};

/**
 * ============================
 * UPDATE CATEGORY
 * ============================
 */
const updateCategory = async (req, res) => {
  try {
    const { userId, name, description, status, shopId, id } = req.body;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const category = await Category.findOneAndUpdate(
      {_id : id, shopId},
      {name, description, isActive:(status==="active"?true : false)},
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Category update failed",
      error: error.message,
    });
  }
};

/**
 * ============================
 * DELETE CATEGORY
 * ============================
 */
const deleteCategory = async (req, res) => {
  try {
    const { userId, shopId, id } = req.query;

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const category = await Category.findOne({_id: id, shopId});

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    await category.deleteOne();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Category deletion failed",
      error: error.message,
    });
  }
};

/**
 * ============================
 * TOGGLE CATEGORY STATUS
 * ============================
 */
const toggleCategoryStatus = async (req, res) => {
  try {
    const { userId, shopId, id, status } = req.body;
    console.log(req.body)

    const roleCheck = await checkAdminRole(userId);
    if (!roleCheck.allowed) {
      return res.status(403).json({
        success: false,
        message: roleCheck.message,
      });
    }

    const category = await Category.findOne({_id:id, shopId});
    console.log(category)

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = status;
    await category.save();

    res.status(200).json({
      success: true,
      message: "Category status updated",
      isActive: category.isActive,
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
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
};
