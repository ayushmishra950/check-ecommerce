// const Cart = require("../../models/cart.model");
// const Product = require("../../models/product.model");
// const User = require("../../models/user.model");

// /**
//  * ✅ Get User Cart
//  */
// const getCart = async (req, res) => {
//   try {
//     const cart = await Cart.find({ user: req.user.id }).populate(
//       "items.product"
//     );

//     console.log(cart)
//     if (!cart) {
//       return res.status(200).json({
//         success: true,
//         cart: { items: [], totalPrice: 0 },
//       });
//     }

//     res.status(200).json({
//       success: true,
//       cart,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * ✅ Add To Cart
//  */
// const addToCart = async (req, res) => {
//   try {
//     const { productId, quantity } = req.body;
//     const qty = Number(quantity) || 1;

//     if (qty <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid quantity",
//       });
//     }

//     const product = await Product.findById(productId);
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: "Product not found",
//       });
//     }

//     if (product.stock < qty) {
//       return res.status(400).json({
//         success: false,
//         message: "Not enough stock available",
//       });
//     }

//     let cart = await Cart.findOne({ user: req.user.id });

//     if (!cart) {
//       cart = new Cart({
//         user: req.user.id,
//         items: [],
//       });
//     }

//     const itemIndex = cart.items.findIndex(
//       (item) => item.product.toString() === productId
//     );

//     if (itemIndex > -1) {
//       const newQty = cart.items[itemIndex].quantity + qty;

//       if (newQty > product.stock) {
//         return res.status(400).json({
//           success: false,
//           message: "Stock limit exceeded",
//         });
//       }

//       cart.items[itemIndex].quantity = newQty;
//     } else {
//       cart.items.push({
//         product: productId,
//         quantity: qty,
//         price: product.price,
//       });
//     }

//     const user = await User.findById(req.user.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     cart.calculateTotal();
//     await cart.save();

//     const alreadyExists = user.cart.some(
//       id => id?._id.toString() === cart._id.toString()
//     );
//     console.log(alreadyExists)
//     if (!alreadyExists) {
//       user.cart.push(cart._id);
//       await user.save();
//     }

//     res.status(201).json({
//       success: true,
//       message: "Item added to cart",
//       cart,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * ✅ Update Cart Item Quantity
//  */const updateCartItem = async (req, res) => {
//   try {
//     const { productId, type } = req.body;

//     if (!productId || !type) {
//       return res.status(400).json({
//         success: false,
//         message: "ProductId and type are required",
//       });
//     }

//     const cart = await Cart.findOne({ user: req.user.id });

//     if (!cart) {
//       return res.status(404).json({
//         success: false,
//         message: "Cart not found",
//       });
//     }

//     const item = cart.items.find((item) =>
//       item.product.equals(productId)
//     );

//     if (!item) {
//       return res.status(404).json({
//         success: false,
//         message: "Item not found in cart",
//       });
//     }

//     // 🔥 Quantity Logic
//     if (type === "increase") {
//       item.quantity += 1;
//     }
//     else if (type === "decrease") {
//       if (item.quantity > 1) {
//         item.quantity -= 1;
//       } else {
//         return res.status(400).json({
//           success: false,
//           message: "Quantity cannot be less than 1",
//         });
//       }
//     }
//     else {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid type. Use increase or decrease",
//       });
//     }

//     cart.calculateTotal(); // Make sure this recalculates totalPrice
//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: "Cart updated successfully",
//       cart,
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// /**
//  * ✅ Remove Item From Cart
//  */
// const removeFromCart = async (req, res) => {
//   try {
//     const { productId } = req.params;

//     const cart = await Cart.findOne({ user: req.user.id });
//     if (!cart) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Cart not found" });
//     }

//     cart.items = cart.items.filter(
//       (item) => item.product.toString() !== productId
//     );

//     cart.calculateTotal();
//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: "Item removed from cart",
//       cart,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /**
//  * ✅ Clear Cart
//  */
// const clearCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id });

//     if (!cart) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Cart not found" });
//     }

//     cart.items = [];
//     cart.totalPrice = 0;
//     await cart.save();

//     res.status(200).json({
//       success: true,
//       message: "All items removed from cart.",
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// module.exports = {
//   getCart,
//   addToCart,
//   updateCartItem,
//   removeFromCart,
//   clearCart,
// };

















const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const User = require("../../models/user.model");
const Shop = require("../../models/shop.model");

/**
 * ✅ Get User Cart
//  */
// const getCart = async (req, res) => {
//   try {
//     const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

//     if (!cart) {
//       return res.status(200).json({
//         success: true,
//         cart: { items: [], subtotal: 0, tax: 0, totalPrice: 0 },
//       });
//     }

//     res.status(200).json({
//       success: true,
//       cart,
//     });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

const getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          subtotal: 0,
          totalDiscount: 0,
          tax: 0,
          shipping: 0,
          totalPrice: 0,
          taxBreakdown: [],
        },
      });
    }

    let subtotal = 0;       // sum of original prices
    let totalDiscount = 0;  // sum of discounts
    let totalTax = 0;
    let totalShipping = 0;

    const shopMap = {};

    // Step 1: Process each item
    for (const item of cart.items) {
      const product = item.product;
      const qty = item.quantity;
      const shopId = product.shopId.toString();

      let discountAmount = 0;
      if (product.discount > 0) {
        if (product.discountType === "percentage") {
          discountAmount = (product.price * product.discount) / 100;
        } else {
          discountAmount = product.discount;
        }

      }
      discountAmount = Math.max(0, discountAmount);
      const itemSubtotal = product.price * qty; // original price
      const itemDiscount = discountAmount * qty; // total discount
      const itemFinalPrice = itemSubtotal - itemDiscount; // price after discount

      subtotal += itemSubtotal;       // original price sum
      totalDiscount += itemDiscount;  // discount sum

      if (!shopMap[shopId]) shopMap[shopId] = { discountedSubtotal: 0 };
      shopMap[shopId].discountedSubtotal += itemFinalPrice;
    }

    const taxBreakdown = [];
    const shopIds = Object.keys(shopMap);
    const shops = await Shop.find({ _id: { $in: shopIds } });

    for (const shop of shops) {
      const shopDiscountedSubtotal = shopMap[shop._id.toString()].discountedSubtotal;

      const shopTax = (shopDiscountedSubtotal * shop.taxPercentage) / 100;
      const shopShipping =
        shopDiscountedSubtotal >= shop.freeShippingAbove ? 0 : shop.shippingCharge;

      totalTax += shopTax;
      totalShipping += shopShipping;

      taxBreakdown.push({
        shopId: shop._id,
        shopName: shop.name,
        taxPercentage: shop.taxPercentage,
        taxAmount: shopTax,
      });
    }

    // 🔹 Final total price = subtotal - totalDiscount + tax + shipping
    const totalPrice = (subtotal + totalTax + totalShipping) - totalDiscount;
    res.status(200).json({
      success: true,
      cart: {
        items: cart.items,
        subtotal,
        totalDiscount,
        tax: totalTax,
        shipping: totalShipping,
        totalPrice,
        taxBreakdown,
      },
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Add Item to Cart
 */
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const qty = Number(quantity) || 1;

    if (qty <= 0) return res.status(400).json({ success: false, message: "Invalid quantity" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });
    if (product.stock < qty) return res.status(400).json({ success: false, message: "Not enough stock" });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) cart = new Cart({ user: req.user.id, items: [] });

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex > -1) {
      const newQty = cart.items[itemIndex].quantity + qty;
      if (newQty > product.stock) return res.status(400).json({ success: false, message: "Stock limit exceeded" });
      cart.items[itemIndex].quantity = newQty;
    } else {
      cart.items.push({ product: productId, quantity: qty, price: product.price });
    }

    cart.calculateTotal();
    await cart.save();

    // Add cart reference to user if not exists
    const user = await User.findById(req.user.id);
    if (user && !user.cart.some(id => id.toString() === cart._id.toString())) {
      user.cart.push(cart._id);
      await user.save();
    }

    res.status(201).json({ success: true, message: "Item added to cart", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ Update Cart Item Quantity
 */
const updateCartItem = async (req, res) => {
  try {
    const { productId, type } = req.body;
    if (!productId || !type) return res.status(400).json({ success: false, message: "ProductId and type required" });

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    const item = cart.items.find(i => i.product.equals(productId));
    if (!item) return res.status(404).json({ success: false, message: "Item not in cart" });

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "Product not found" });

    if (type === "increase") {
      if (item.quantity + 1 > product.stock) return res.status(400).json({ success: false, message: "Stock limit exceeded" });
      item.quantity += 1;
    } else if (type === "decrease") {
      if (item.quantity > 1) item.quantity -= 1;
      else return res.status(400).json({ success: false, message: "Quantity cannot be <1" });
    } else {
      return res.status(400).json({ success: false, message: "Invalid type" });
    }

    cart.calculateTotal();
    await cart.save();

    res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ Remove Item From Cart
 */
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    cart.calculateTotal();
    await cart.save();

    res.status(200).json({ success: true, message: "Item removed", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * ✅ Clear Cart
 */
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = [];
    cart.subtotal = 0;
    cart.tax = 0;
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({ success: true, message: "All items removed" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};