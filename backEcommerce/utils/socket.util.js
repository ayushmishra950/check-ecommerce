// const { Server } = require("socket.io");
// const jwt = require("jsonwebtoken");

// let io;
// const initSocket = (server) => {
//     io = new Server(server, {
//         cors: { origin: "http://localhost:8080" }
//     });


//     io.use((socket, next) => {
//         try {
//             const token = socket.handshake.auth?.accessToken;
//             if (!token) {
//                 return next(new Error("Unauthorized"));
//             }

//             const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
//             socket.user = decoded;
//             console.log("decoded:", decoded);
//             socket.userId = decoded.id;

//             socket.join(socket.userId);

//             next();
//         } catch (error) {
//             console.log("Socket Authentication Error:", error.message);
//             return next(new Error("Invalid or expired token"));
//         }
//     });


//     io.on("connection", (socket) => {
//         console.log("connected successfully.", socket.id)
//         // socket.on("joinRoom", (userId) => {
//         //     socket.userId = userId;
//         //     socket.join(userId);

//         // })
//         socket.on("addCart", (product) => {
//             if (socket.userId) {
//                 io.to(socket.userId).emit("addCart", product);
//             }
//         }),
//             socket.on("order", () => {
//                 console.log("hiii...")
//                 if (socket.user.role === "admin") {
//                     console.log("hiii...", socket.userId);
//                     io.to(socket.userId).emit("order");
//                 }
//             })

//         socket.on("addAndRemovewishList", (product) => {
//             console.log("product", product)
//             if (socket.userId) {
//                 io.to(socket.userId).emit("addAndRemovewishList", product)
//             }
//         })


//         socket.on("disconnect", () => {
//             console.log("user disconnected.", socket.id)
//         })
//     })

//     return io
// };


// function getIO() {
//     if (!io) return { message: "socket not initialize." };
//     return io;
// }


// module.exports = { initSocket, getIO }













const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Product = require("../models/product.model"); // ✅ real model import

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "http://localhost:8080" }
    });

    // 🔐 Auth Middleware
    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.accessToken;

            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

            socket.user = decoded;
            socket.userId = decoded.id;
            socket.role = decoded.role;     // user | admin
            socket.shopId = decoded.shopId; // only admin

            console.log("decoded:", decoded);

            // 👤 user room
            socket.join(`user_${socket.userId}`);

            // 👑 admin room
            if (socket.role === "admin" && socket.shopId) {
                socket.join(`admin_${socket.shopId}`);
                console.log(`Admin joined: admin_${socket.shopId}`);
            }

            next();
        } catch (error) {
            console.log("Socket Auth Error:", error.message);
            return next(new Error("Invalid token"));
        }
    });

    // 🔌 Connection
    io.on("connection", (socket) => {
        console.log("✅ Connected:", socket.id, socket.userId);

        // 🛒 Cart
        socket.on("addCart", (product) => {
            io.to(`user_${socket.userId}`).emit("addCart", product);
        });

        // ❤️ Wishlist
        socket.on("addAndRemovewishList", (product) => {
            io.to(`user_${socket.userId}`).emit("addAndRemovewishList", product);
        });

        // 📦 ORDER (USER → ADMIN)
    socket.on("order", async (data) => {
    try {
        const { cartItems } = data;

        console.log("📦 Order from:", socket.userId);

        // 👉 loop through cart
        for (let item of cartItems) {

            const productId = item.product._id;
            const qty = item.quantity;

            // 🔥 DB se fresh product lo (security)
            const product = await Product.findById(productId);

            if (!product) {
                console.log("❌ Product not found:", productId);
                continue;
            }

            const shopId = product.shopId;

            console.log("➡️ भेज रहे:", `admin_${shopId}`);

            // 👑 Admin ko emit
            io.to(`admin_${shopId}`).emit("order", { product });
        }

    } catch (err) {
        console.log("❌ Order error:", err.message);
    }
});

        // 📦 ADMIN → USER
        socket.on("orderStatusUpdate", (data) => {
            const { userId, status } = data;

            console.log("🔄 Status update:", userId, status);

            io.to(`user_${userId}`).emit("orderStatusUpdate", {
                status
            });
        });

        // ❌ Disconnect
        socket.on("disconnect", () => {
            console.log("❌ Disconnected:", socket.id);
        });
    });

    return io;
};

function getIO() {
    if (!io) throw new Error("Socket not initialized");
    return io;
}

module.exports = { initSocket, getIO };