const Admin = require("../../models/admin.model");
const User = require("../../models/user.model");
const Shop = require("../../models/shop.model");
const Order = require("../../models/order.model");
const Product = require("../../models/product.model");
const mongoose = require("mongoose");

const getDashboardSummary = async (req, res) => {
  try {

    const user = await Admin.findOne({_id: req.user?.id});
    if(!user) return res.status(400).json({ message: "User not found" });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // TOTAL COUNTS
    const totalOrders = await Order.countDocuments({ shop: user?.shopId });
    const totalProducts = await Product.countDocuments({ shopId: user?.shopId });

    // TOTAL UNIQUE CUSTOMERS
    const totalCustomersArr = await Order.distinct("user", { shop: user?.shopId });
    const totalCustomers = totalCustomersArr.length;

    // CURRENT MONTH COUNTS
    const currentMonthOrders = await Order.countDocuments({
      shop: user?.shopId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const currentMonthProducts = await Product.countDocuments({
      shopId: user?.shopId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    const currentMonthCustomersArr = await Order.distinct("user", {
      shop: user?.shopId,
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });
    const currentMonthCustomers = currentMonthCustomersArr.length;

    // TOTAL REVENUE
    const totalRevenueAgg = await Order.aggregate([
      { $match: { shop: user?.shopId } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;

    // CURRENT MONTH REVENUE
    const currentMonthRevenueAgg = await Order.aggregate([
      {
        $match: {
          shop: user?.shopId,
          createdAt: { $gte: startOfMonth, $lte: endOfMonth }
        }
      },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const currentMonthRevenue = currentMonthRevenueAgg[0]?.total || 0;

    // RESPONSE
    res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          currentMonth: currentMonthOrders
        },
        products: {
          total: totalProducts,
          currentMonth: currentMonthProducts
        },
        customers: {
          total: totalCustomers,
          currentMonth: currentMonthCustomers
        },
        revenue: {
          total: totalRevenue,
          currentMonth: currentMonthRevenue
        }
      }
    });

  } catch (err) {
    res.status(500).json({
      message: err?.message,
      success: false
    });
  }
};

const handleGetOverview = async (req, res) => {
  try {
   const user = await Admin.findOne({_id:req.user?.id});
   if(!user) return res.status(400).json({message:"user not Found"});


    const result = await Order.aggregate([
      {
        $match: {
          shop: user?.shopId
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          revenue: { $sum: "$totalAmount" }
        }
      },
      {
        $sort: { "_id": 1 }
      }
    ]);

    const months = [
      "Jan","Feb","Mar","Apr","May","Jun",
      "Jul","Aug","Sep","Oct","Nov","Dec"
    ];

    const formatted = months.map((month, index) => {
      const found = result.find(r => r._id === index + 1);
      return {
        month,
        sales: found ? found.revenue : 0
      };
    });

    res.status(200).json({
      success: true,
      data: formatted
    });

  } catch (err) {
    res.status(500).json({
      message: err?.message,
      success: false
    });
  }
};
module.exports = { getDashboardSummary, handleGetOverview };