const express = require("express");
const http = require("http");
const setupSwagger = require("./swagger/swagger");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./config/db");
const { protect } = require("./middlewares/auth.middleware");
const {initSocket} = require("./utils/socket.util");
const session = require('express-session');
const passport = require('./validations/auth.validation');
const path = require("path");
const {generateAccessToken} = require("./utils/jwt.util");


// user k liye
const userAuthRoutes = require("./routes/user/auth.route");
const profileRoutes = require("./routes/user/profile.route");
const cartRoutes = require("./routes/user/cart.route");
const orderRoutes = require("./routes/user/order.route");
const paymentRoutes = require("./routes/user/payment.route");
const productRoutes = require("./routes/user/product.route");
const wishlistRoutes = require("./routes/user/wishlist.route");
const ratingRoutes = require("./routes/user/rating.route");
const shopRoutes = require("./routes/user/shop.route");

// Admin k liye
const adminAuthRoutes = require("./routes/admin/auth.route");
const adminProductRoutes = require("./routes/admin/product.route");
const adminOrderRoutes = require("./routes/admin/order.route");
const adminCouponRoutes = require("./routes/admin/coupon.route");
const adminCategoryRoutes = require("./routes/admin/category.route");
const adminUserRoutes = require("./routes/admin/user.route");
const adminBlockRoutes = require("./routes/admin/blockUser.route");
const adminDashboardRoutes = require("./routes/admin/dashboard.route");
const adminBannerRoutes = require("./routes/admin/banner.route");


//  Super admin k liye
const superAdminShopRoute = require("./routes/super-admin/shop-route");


const app = express();
connectDB();

 

// Body parser
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: ["http://localhost:8080", "http://localhost:8081", "http://localhost:8082"], credentials: true }));
app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());
setupSwagger(app);

// User Routes
app.use("/api/user/auth", userAuthRoutes);
app.use("/api/user/profile", protect, profileRoutes);
app.use("/api/user/cart", protect, cartRoutes);
app.use("/api/user/order", protect, orderRoutes);
app.use("/api/user/payment", protect, paymentRoutes);
app.use("/api/user/product", protect, productRoutes);
app.use("/api/user/wishlist", protect, wishlistRoutes);
app.use("/api/user/rating", protect, ratingRoutes);
app.use("/api/user/shop", shopRoutes);

//  Admin Routes
app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/admin/product", protect, adminProductRoutes);
app.use("/api/admin/order", protect, adminOrderRoutes);
app.use("/api/admin/coupon", protect, adminCouponRoutes);
app.use("/api/admin/category", protect, adminCategoryRoutes);
app.use("/api/admin/user", protect, adminUserRoutes);
app.use("/api/admin/block", protect, adminBlockRoutes);
app.use("/api/admin/dashboard", protect, adminDashboardRoutes);
app.use("/api/admin/banner", protect, adminBannerRoutes);

// Super Admin Routes
app.use("/api/superadmin/shop", superAdminShopRoute);



// app.use(express.static(path.join(__dirname, "build")));

// // ⚡ SPA fallback (MOST IMPORTANT)
// app.get("/*", (req, res) => {
//   res.sendFile(path.join(__dirname, "build", "index.html"));
// });


// Default route
app.get("/server", (req, res) => {
  res.send("API is running");
});


app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// app.get('/auth/google/callback',
//     passport.authenticate('google', { failureRedirect: '/login' }),
//     (req, res) => {
//         res.redirect(`http://localhost:8080/login-success?token=${token}`); // login ke baad
//     }
// );



app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        const user = req.user; 
        
        // Structure the payload for JWT
        const payload = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            profileImage: user.profileImage
        };

        const token = generateAccessToken(payload); 

        res.redirect(`http://localhost:8080/login-success?token=${token}`);
    }
);


// Test route
// app.get('/dashboard', (req, res) => {
//     if (req.isAuthenticated()) {
//          res.sendFile(path.join(__dirname, "build", "index.html"));
//     } else {
//         res.redirect('/login');
//     }
// });


// ✅ Static
app.use(express.static(path.join(__dirname, "build")));

// ✅ FINAL fallback (last line before error handler)
app.use((req, res, next) => {
  if (req.path.startsWith("/api") || req.path.startsWith("/auth")) {
    return next();
  }

  res.sendFile(path.join(__dirname, "build", "index.html"));
});



// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});




const startServer = async () => {
  try {
    await connectDB(); // ✅ wait karega

    const server = http.createServer(app);
    initSocket(server);

     return server;
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

 


module.exports = startServer;
