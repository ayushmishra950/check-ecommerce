const Wishlist = require("../../models/wishlist.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const Cart = require("../../models/cart.model");
const ShopBlockedUser = require("../../models/blockUser.model");

/**
 * @desc    Get logged-in user's wishlist
 * @route   GET /api/wishlist
 * @access  Private (User)
 */
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user.id })
      .populate({path:"product",populate:{path:"category"}, populate:{path:"rating"}});

    res.status(200).json({
      success: true,
      count: wishlist.length,
      data: wishlist,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc    Add product to wishlist
 * @route   POST /api/wishlist/:productId
 * @access  Private (User)
 *//**
 * @desc    Toggle product in wishlist (Add / Remove)
 * @route   POST /api/wishlist/toggle/:productId
 * @access  Private (User)
 */

const toggleWishlist = async (req, res) => {
  const { productId } = req.body;
  try {
    const userId = req.user?.id;

    // 1️⃣ Check user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Check product
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

     const isBlocked = await ShopBlockedUser.findOne({user:userId, shop:product?.shopId, isBlocked:true});
        if(isBlocked) return res.status(403).json({message:"you are blocked. please contact to admin."})
    

    // 3️⃣ Check existing wishlist item
    const existingItem = await Wishlist.findOne({
      user: userId,
      product: productId,
    });

    // =========================
    // 🔴 REMOVE CASE
    // =========================
    if (existingItem) {
      await existingItem.deleteOne();

      user.wishlist.pull(existingItem._id);
      await user.save();

      return res.status(200).json({
        success: true,
        action: "removed",
        message: "Product removed from wishlist",
      });
    }

    // =========================
    // 🟢 ADD CASE
    // =========================
    const wishlistItem = await Wishlist.create({
      user: userId,
      product: productId,
    });

    user.wishlist.push(wishlistItem._id);
    await user.save();

    return res.status(201).json({
      success: true,
      action: "added",
      message: "Product added to wishlist",
      data: wishlistItem,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to toggle wishlist",
      error: error.message,
    });
  }
};

/**
 * @desc    Clear wishlist
 * @route   DELETE /api/wishlist
 * @access  Private (User)
 */
const clearWishlist = async (req, res) => {
    const {userId} = req.query;
  try {
    await Wishlist.deleteMany({ user: userId });

    const user = await User.findById(userId);
    if(user){
    user.wishlist = [];
    await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Wishlist cleared successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to clear wishlist",
      error: error.message,
    });
  }
};


const moveToCart = async (req, res) => {
  try {
    const { productId, userId } = req.body;
    if (!productId || !userId) {
      return res.status(400).json({ message: "ProductId and UserId are required" });
    }
     const wishlistItem = await Wishlist.findOne({ user:userId, product:productId });

    if (!wishlistItem) {
      return res.status(404).json({ message: "Product not found in wishlist" });
    }
    const product = await Product.findOne({_id:productId});

     const isBlocked = await ShopBlockedUser.findOne({user:userId, shop:product?.shopId, isBlocked:true});
        if(isBlocked) return res.status(403).json({message:"you are blocked. please contact to admin."})
    

    // 1️⃣ Find Cart of User
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      // Agar cart exist nahi karta to naya cart banao
      cart = await Cart.create({
        user: userId,
        items: [],
      });
    }

    // 2️⃣ Check if product already exists in items array
    const existingItemIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Product already cart me hai → quantity increase
      cart.items[existingItemIndex].quantity += 1;
    } else {
      // Product cart me nahi hai → push new item
      cart.items.push({
        product: productId,
        quantity: 1,
        price: 500, // ⚠️ yaha dynamic price dalna better hoga (Product model se fetch karke)
      });
    }

    // 3️⃣ Recalculate totalPrice
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    await cart.save();

    // 4️⃣ Remove product from wishlist
   const wishListProduct = await Wishlist.findOneAndDelete({ user: userId, product: productId });
    const user = await User.findById(userId);
     if(user){
      user?.wishlist.pull(wishListProduct?._id);
     await user.save();
     }

    res.status(200).json({
      message: "Product moved to cart successfully",
      cart,
    });

  } catch (err) {
    res.status(500).json({ message: `Server Error :- ${err?.message}` });
  }
};
const allProductMoveToCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "UserId is required" });
    }

    // 1️⃣ Get all wishlist products
    const wishListProducts = await Wishlist.find({ user: userId });

    if (wishListProducts.length === 0) {
      return res.status(404).json({ message: "Wishlist items not found." });
    }

    // 2️⃣ Find user's cart
    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = await Cart.create({
        user: userId,
        items: [],
        totalPrice: 0,
      });
    }

    // 3️⃣ Loop through wishlist products
    for (let wishItem of wishListProducts) {

      const productId = wishItem.product;
       const product = await Product.findOne({_id:productId});

     const isBlocked = await ShopBlockedUser.findOne({user:userId, shop:product?.shopId, isBlocked:true});
        if(isBlocked) return res.status(403).json({message:"you are blocked. please contact to admin."})
    
      const price = wishItem.price; // assuming wishlist me price stored hai

      const existingItemIndex = cart.items.findIndex(
        (item) => item.product.toString() === productId.toString()
      );

      if (existingItemIndex > -1) {
        // Product already in cart → increase quantity
        cart.items[existingItemIndex].quantity += 1;
      } else {
        // Add new product to cart
        cart.items.push({
          product: productId,
          quantity: 1,
          price: price,
        });
      }
    }

    // 4️⃣ Recalculate total price
    cart.totalPrice = cart.items.reduce(
      (acc, item) => acc + item.quantity * item.price,
      0
    );

    await cart.save();

    // 5️⃣ Delete all wishlist items of user (empty wishlist)
    await Wishlist.deleteMany({ user: userId });
  const user = await User.findById(userId);
  if(user){
    user.wishlist = []
    await user.save();
  }

    res.status(200).json({
      success: true,
      message: "All wishlist products moved to cart successfully",
      cart,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Server Error:- ${err?.message}`,
    });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  clearWishlist,
  moveToCart,
  allProductMoveToCart
};
