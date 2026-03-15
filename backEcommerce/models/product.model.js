const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // 🔐 Admin / Seller reference
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      required: true,
    },

    // 🏷️ Product basic info
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    brand:{
     type:String,
     required:[true, "Brand name is required"],
     trim:true
    },

    description: {
      type: String,
      required: [true, "Product description is required"],
      trim:true
    },

    // 💰 Pricing
    price: {
      type: Number,
      required: [true, "Product price is required"],
    },

    discount: {
      type: Number,
      default: 0,
    },
    discountType: {
  type: String,
  enum: ["percentage", "fixed"],
  default: "percentage"
},

    // 📦 Stock
    stock: {
      type: Number,
      required: true,
      default: 1,
    },

    // 🗂️ Category
    category: {
     type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },

    // 🖼️ Images
    images: [
      {
        type: String, // Cloudinary / S3 / URL
      },
    ],

    // ⭐ Ratings
    rating: [{
     type : mongoose.Schema.Types.ObjectId,
     ref:"Rating"
    }],

    numReviews: {
      type: Number,
      default: 0,
    },

    // 👀 Visibility
    isActive: {
      type: Boolean,
      default: true,
    },
    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
      required: true
    }
  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

 // ✅ Unique index: same name cannot exist in the same shop
productSchema.index({ name: 1, shopId: 1 }, { unique: true });

module.exports = mongoose.model("Product", productSchema);
