// const Order = require("../../models/order.model");
// const Cart = require("../../models/cart.model");

// /**
//  * ✅ Place Order (From Cart)
//  */
// const placeOrder = async (req, res) => {
//   try {
//     const { shippingAddress, paymentMethod } = req.body;

//     // 1️⃣ Get user cart
//     const cart = await Cart.findOne({ user: req.user._id }).populate(
//       "items.product"
//     );

//     if (!cart || cart.items.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Cart is empty",
//       });
//     }

//     // 2️⃣ Prepare order items
//     const orderItems = cart.items.map((item) => ({
//       product: item.product._id,
//       quantity: item.quantity,
//       price: item.price,
//     }));

//     // 3️⃣ Create order
//     const order = await Order.create({
//       user: req.user._id,
//       orderItems,
//       shippingAddress,
//       paymentMethod,
//       totalAmount: cart.totalPrice,
//       paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
//     });

//     // 4️⃣ Clear cart after order placed
//     cart.items = [];
//     cart.totalPrice = 0;
//     await cart.save();

//     res.status(201).json({
//       success: true,
//       message: "Order placed successfully",
//       order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * ✅ Get Logged-in User Orders
//  */
// const getMyOrders = async (req, res) => {
//   try {
//     const orders = await Order.find({ user: req.user._id })
//       .populate("orderItems.product")
//       .sort({ createdAt: -1 });

//     res.status(200).json({
//       success: true,
//       count: orders.length,
//       orders,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * ✅ Get Single Order Details
//  */
// const getOrderById = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     }).populate("orderItems.product");

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     res.status(200).json({
//       success: true,
//       order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// /**
//  * ✅ Cancel Order (Only if not shipped)
//  */
// const cancelOrder = async (req, res) => {
//   try {
//     const order = await Order.findOne({
//       _id: req.params.id,
//       user: req.user._id,
//     });

//     if (!order) {
//       return res.status(404).json({
//         success: false,
//         message: "Order not found",
//       });
//     }

//     if (["shipped", "delivered"].includes(order.orderStatus)) {
//       return res.status(400).json({
//         success: false,
//         message: "Order cannot be cancelled",
//       });
//     }

//     order.orderStatus = "cancelled";
//     await order.save();

//     res.status(200).json({
//       success: true,
//       message: "Order cancelled successfully",
//       order,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// module.exports = {
//   placeOrder,
//   getMyOrders,
//   getOrderById,
//   cancelOrder,
// };






const Order = require("../../models/order.model");
const Cart = require("../../models/cart.model");
const Product = require("../../models/product.model");
const Shop = require("../../models/shop.model");

/**
 * ✅ Place Order
 */
const placeOrder = async (req, res) => {
  try {
    const { shippingAddress, paymentMethod } = req.body;

    // 🔹 Basic validation
    if (!shippingAddress?.address || !shippingAddress?.city ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address required",
      });
    }

    const allowedMethods = ["COD", "CARD", "UPI"];
    if (!allowedMethods.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // 🔹 Get cart
    const cart = await Cart.findOne({ user: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    let subtotal = 0;
    let totalDiscount = 0;
    let totalTax = 0;
    let totalShipping = 0;

    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;

      if (product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock`,
        });
      }

      // 🔹 Discount calculation
      let discountAmount = 0;

      if (product.discount > 0) {
        if (product.discountType === "percentage") {
          discountAmount = (product.price * product.discount) / 100;
        } else {
          discountAmount = product.discount;
        }
      }

      const finalPrice = product.price - discountAmount;
      const itemTotal = finalPrice * item.quantity;

      subtotal += itemTotal;
      totalDiscount += discountAmount * item.quantity;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        discount: product.discount,
        discountType: product.discountType,
        finalPrice,
      });

      // 🔹 Reduce stock
      product.stock -= item.quantity;
      await product.save();
    }

    // 🔹 Single shop logic
    const shop = await Shop.findById(cart.items[0].product.shopId);

    if (!shop) {
      return res.status(400).json({
        success: false,
        message: "Shop not found",
      });
    }

    // 🔹 Tax & Shipping
    totalTax = (subtotal * shop.taxPercentage) / 100;

    totalShipping =
      subtotal >= shop.freeShippingAbove
        ? 0
        : shop.shippingCharge;

    const totalAmount = subtotal + totalTax + totalShipping;

    // 🔹 Create Order
    const order = await Order.create({
      shop: shop._id,
      user: req.user.id,
      orderItems,
      shippingAddress,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "pending" : "paid",
      subtotal,
      tax: totalTax,
      shippingCharge: totalShipping,
      totalDiscount,
      totalAmount,
      orderStatus: "placed",
    });

    // 🔹 Clear cart
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Get My Orders
 */

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate("orderItems.product")
      .sort({ createdAt: -1 });

    const updatedOrders = await Promise.all(
      orders.map(async (order) => {
        let shopTax = 0;

        if (order.orderItems.length > 0) {
          const shopId = order.orderItems[0].product.shopId;

          const shop = await Shop.findById(shopId).select("taxPercentage");

          shopTax = shop?.taxPercentage || 0;
        }

        return {
          ...order.toObject(),
          shopTax,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: updatedOrders.length,
      updatedOrders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Get Single Order
 */
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      user: req.user.id,
    }).populate("orderItems.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      shippingAddress: order?.shippingAddress,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/**
 * ✅ Cancel Order
 */
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (["shipped", "delivered"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled",
      });
    }

    // 🔹 Restore stock
    for (const item of order.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.orderStatus = "cancelled";
    order.cancelledAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
};