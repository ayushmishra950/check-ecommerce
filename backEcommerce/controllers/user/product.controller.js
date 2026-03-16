const Product = require("../../models/product.model");
const Category = require("../../models/category.model");
/**
 * @desc    Get all products
 * @route   GET /api/products
 * @access  Public (User)
 */

const getAllCategory = async(req,res) => {
  try{
    const category = await Category.find({isActive:true});

    res.status(200).json({data:category, message:"All Category Found Successfully."})
  }
  catch(err){
   return res.status(500).json({message:`Error:= ${err.message}`})
  }
} 
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({ isActive: true }).populate("rating");

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message,
    });
  }
};

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Public (User)
 */
const getProductById = async (req, res) => {
  const {id} = req?.params;
  console.log(id)
  try {
    const product = await Product.findById(id).populate("category").populate({
      path:"rating",
      populate : {
        path:"userId",
        select:"name"
      }
    });

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Invalid product ID",
      error: error.message,
    });
  }
};

/**
 * @desc    Search / filter products
 * @route   GET /api/products/search
 * @access  Public (User)
 * @query   keyword, minPrice, maxPrice
 */
const searchProducts = async (req, res) => {
  try {
    const { keyword, minPrice, maxPrice } = req.query;

    let filter = { isActive: true };

    if (keyword) {
      filter.name = { $regex: keyword, $options: "i" };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    const products = await Product.find(filter);

    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Search failed",
      error: error.message,
    });
  }
};

/**
 * @desc    Get products by category
 * @route   GET /api/products/category/:category
 * @access  Public (User)
 */
const getProductsByCategory = async (req, res) => {
  const {category} = req.params;
  if(!category) return res.status(404).json({success: false, message:"Category Id Not Found."})
  try {
    const products = await Product.find({
      category: category,
      isActive: true,
    }).populate("category","name description").populate("rating");
 
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch category products",
      error: error.message,
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getAllCategory,
};
