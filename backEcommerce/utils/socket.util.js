const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const initSocket = (server) => {
    io = new Server(server, {
        cors: { origin: "http://localhost:8080" }
    });


    io.use((socket, next) => {
        try {
            const token = socket.handshake.auth?.accessToken;
            if (!token) {
                return next(new Error("Unauthorized"));
            }

            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            socket.user = decoded;
            socket.userId = decoded.id;

            socket.join(socket.userId);

            next();
        } catch (error) {
            console.log("Socket Authentication Error:", error.message);
            return next(new Error("Invalid or expired token"));
        }
    });


    io.on("connection", (socket) => {
        console.log("connected successfully.", socket.id)
        socket.on("joinRoom", (userId) => {
            socket.userId = userId;
            socket.join(userId);

        })
        socket.on("addCart", (product) => {
            if (socket.userId) {
                io.to(socket.userId).emit("addCart", product);
            }
        }),
            socket.on("order", () => {
                if (socket.userId) {
                    io.to(socket.userId).emit("order");
                }
            })

        socket.on("addAndRemovewishList", (product) => {
            console.log("product", product)
            if (socket.userId) {
                io.to(socket.userId).emit("addAndRemovewishList", product)
            }
        })


        socket.on("disconnect", () => {
            console.log("user disconnected.", socket.id)
        })
    })

    return io
};


function getIO() {
    if (!io) return { message: "socket not initialize." };
    return io;
}


module.exports = { initSocket, getIO }