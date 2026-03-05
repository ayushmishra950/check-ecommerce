const Admin = require("../../models/admin.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Shop = require("../../models/shop.model");
const User = require("../../models/user.model");
const {generateAccessToken, generateRefreshToken} = require("../../utils/jwt.util");


// JWT secret
const JWT_SECRET = process.env.JWT_SECRET;

const validateUser = async(userId, shopId) =>{
    const shop = await Shop.findOne({_id:shopId});
    if(!shop) return {success:false, message:"Shop Not Found."};

    const admin = await Admin.findOne({_id:userId, shopId:shopId});
    if(!admin) return {success:false, message:"Admin Not Found."};

    return {success:true, admin, shop};
}

// =================== REGISTER ADMIN ===================
exports.registerAdmin = async (req, res) => {
  try {
    const { name, email, password, role, shopId, userId } = req.body;

    // 1️⃣ Validate user making request
    const superadmin = await Admin.findOne({_id: userId, role : "superadmin"});
    if(!superadmin){
      res.status(404).json({message: "You Are Not Authorized."})
    }

    // 2️⃣ Check if shop exists
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ message: "Shop not found." });
    }

    // 4️⃣ Check if email already exists for this shop
    const emailTaken = await Admin.findOne({ email, shopId });
    if (emailTaken) {
      return res.status(400).json({ message: "Admin with this email already exists for this shop." });
    }

    // 5️⃣ Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6️⃣ Create admin
    const newAdmin = await Admin.create({
      name,
      email,
      password: hashedPassword,
      role: role || "admin",
      shopId,
      createdBy: superadmin._id,
    });

    // Remove password from response
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
      message: "Admin created successfully",
      admin: adminResponse,
    });
  } catch (error) {
    console.error("Register Admin Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// =================== LOGIN ADMIN ===================
exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(req.body)
    if(!email || !password) return res.status(400).json({ success: false, message: "Email and password are required."});

    let admin = await Admin.findOne({ email });
    if(!admin){
      admin = await User.findOne({email});
      if (!admin) return res.status(400).json({ message: "Invalid email." });
    }
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password." });
    }

    const payload = {
  id: admin._id,
  role: admin.role,
};

if(admin?.role==="admin"){
  payload.shopId = admin?.shopId;
}

const accessToken = generateAccessToken(payload);
const refreshToken = generateRefreshToken(payload);
  console.log(accessToken, refreshToken)

    // Save refresh token in DB (Recommended)
    admin.refreshToken = refreshToken;

    if(admin.role === "admin"){
      admin.lastLogin = new Date();
    }
    await admin.save();
    console.log("admin", admin)
    // 🔐 Store Refresh Token in HttpOnly Cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // https only in prod
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ message: "Login successful", accessToken, admin });
  } catch (error) {
  console.error(error); // Console me full error dekhne ke liye
  res.status(500).json({ message: "Server error", error: error.message});
}

};

// =================== GET ALL ADMINS ===================
exports.getAdmins = async (req, res) => {
  try {
    const admins = await Admin.find().select("-password");
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// exports.refreshToken = async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;

//     if (!refreshToken)
//       return res.status(401).json({ message: "No refresh token" });

//     let decoded;

//     try {
//       decoded = jwt.verify(
//         refreshToken,
//         process.env.REFRESH_TOKEN_SECRET
//       );
//     } catch (err) {
//       return res.status(403).json({ message: "Invalid refresh token" });
//     }

//     let user = await Admin.findById(decoded.id);
//     if (!user) user = await User.findById(decoded.id);

//     if (!user || user.refreshToken !== refreshToken)
//       return res.status(403).json({ message: "Unauthorized" });

//     const newAccessToken = generateAccessToken({
//       id: user._id,
//       role: user.role,
//     });

//     res.status(200).json({
//       accessToken: newAccessToken,
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };



exports.refreshToken = async (req, res) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken;
    console.log(oldRefreshToken)

    if (!oldRefreshToken)
      return res.status(401).json({ message: "No refresh token" });

    let decoded;

    try {
      decoded = jwt.verify(
        oldRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    let user = await Admin.findById(decoded.id);
    if (!user) user = await User.findById(decoded.id);

    if (!user || user.refreshToken !== oldRefreshToken)
      return res.status(403).json({ message: "Unauthorized" });

    // 🔥 ROTATE TOKENS
    const newAccessToken = generateAccessToken({
      id: user._id,
      role: user.role,
    });

    const newRefreshToken = generateRefreshToken({
      id: user._id,
      role: user.role,
    });

    // Save new refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    // Update cookie
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });


    res.status(200).json({
      accessToken: newAccessToken,
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



exports.logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      let decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET
      );

      let user = await Admin.findById(decoded.id);
      if (!user) user = await User.findById(decoded.id);

      if (user) {
        user.refreshToken = null;
        await user.save();
      }
    }

    // Clear cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


// =================== GET SINGLE ADMIN ===================
exports.getAdminById = async (req, res) => {
    const {id, shopId} = req.query;
      if(!id || !shopId) return res.status(404).json({message:"required data missing from userId and shopId."});
  try {
     const shop = await Shop.findOne({_id:shopId});
     if (!shop) return res.status(404).json({ message: "Shop not found." });

    const admin = await Admin.findOne({_id:id, shopId:shopId})
    .populate("shopId", "name email phone currency taxPercentage shippingCharge freeShippingAbove")
    .select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// =================== UPDATE ADMIN ===================
exports.updateAdmin = async (req, res) => {
  try {
    const {
      id,
      shopId,
      storeSettings,
      profile,
      security,
      notifications
    } = req.body;

    if (!id || !shopId) {
      return res.status(400).json({ message: "id and shopId required" });
    }

    // validate user + shop relation
    const validation = await validateUser(id, shopId);

    if (!validation) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const { admin, shop } = validation;

    /* =========================
       UPDATE STORE SETTINGS
    ========================== */
    if (storeSettings) {
      if (storeSettings.storeName)
        shop.name = storeSettings.storeName;

      if (storeSettings.storeEmail)
        shop.email = storeSettings.storeEmail;

      if (storeSettings.currency)
        shop.currency = storeSettings.currency;

      if (storeSettings.taxPercentage)
        shop.taxPercentage = storeSettings.taxPercentage;

      if (storeSettings.shippingCharge)
        shop.shippingCharge = storeSettings.shippingCharge;

      if (storeSettings.freeShippingAbove)
        shop.freeShippingAbove = storeSettings.freeShippingAbove;

      await shop.save();
    }

    /* =========================
       UPDATE ADMIN PROFILE
    ========================== */
    if (profile) {
      if (profile.name)
        admin.name = profile.name;

      if (profile.email)
        admin.email = profile.email;
    }

    /* =========================
       UPDATE SECURITY
    ========================== */
    if (security) {
      if (typeof security.twoFactorAuth === "boolean") {
        admin.twoFactorAuth = security.twoFactorAuth;
      }
    }

    /* =========================
       UPDATE NOTIFICATIONS
    ========================== */
    if (notifications) {
      admin.notifications = {
        orderUpdates: notifications.orderUpdates ?? admin.notifications?.orderUpdates,
        newCustomers: notifications.newCustomers ?? admin.notifications?.newCustomers,
        lowStock: notifications.lowStock ?? admin.notifications?.lowStock,
      };
    }

    await admin.save();

    return res.status(200).json({
      message: "Settings updated successfully",
      data: {
        admin,
        shop
      }
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server error",
      error: error.message
    });
  }
};

// =================== DELETE ADMIN ===================
exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id);
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    await admin.remove();
    res.status(200).json({ message: "Admin deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
