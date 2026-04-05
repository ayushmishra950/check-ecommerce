// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     email: {
//       type: String,
//       required: true,
//       unique: true,
//       lowercase: true,
//     },

//     password: {
//       type: String,
//       required: true,
//       minlength: 6,
//     },

//     role: {
//       type: String,
//       enum: ["user"],
//       default: "user",
//     },

//     phone: String,

//     avatar: String,

//     isVerified: {
//       type: Boolean,
//       default: false,
//     },
//      refreshToken :{
//       type:String, default:null
//     },

//     addresses: [
//       {
//         fullName: String,
//         phone: String,
//         street: String,
//         city: String,
//         state: String,
//         postalCode: String,
//         country: String,
//         isDefault: {
//           type: Boolean,
//           default: false,
//         },
//       },
//     ],

//     cart: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//         },
//       },
//     ],

//     wishlist: [
//       {
//         product: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: "Product",
//         },
//       },
//     ],

//     resetPasswordToken: String,
//     resetPasswordExpire: Date,

//     lastLogin: Date,
//   },
//   { timestamps: true }
// );


// module.exports = mongoose.model("User", userSchema);






const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      minlength: 6,
      required: function () {
        return this.authProvider === "local";
      },
    },

    // 🔥 NEW FIELDS FOR GOOGLE LOGIN
    googleId: {
      type: String,
      default: null,
    },

    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },

    role: {
      type: String,
      enum: ["user"],
      default: "user",
    },

    phone: String,

    // ✅ Profile Image (merged avatar + google photo)
    profileImage: {
      type: String,
      default: null,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    addresses: [
      {
        fullName: String,
        phone: String,
        street: String,
        city: String,
        state: String,
        postalCode: String,
        country: String,
        isDefault: {
          type: Boolean,
          default: false,
        },
      },
    ],

    cart: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    wishlist: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
        },
      },
    ],

    resetPasswordToken: String,
    resetPasswordExpire: Date,

    lastLogin: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);