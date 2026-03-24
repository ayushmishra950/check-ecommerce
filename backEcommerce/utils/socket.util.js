const {Server} = require("socket.io");

let io ;
const initSocket = (server) => {
   io = new Server(server,{
    cors:{origin:"http://localhost:8080"}
   });
let users = {};
   
io.on("connection", (socket)=>{
    console.log("user connected", socket.id);
    socket.on("login",(userId)=>{
      users[userId] = socket.id;
    })
    socket.on("addCart", (userId)=>{
       let targetSocketId = users[userId];
       if (targetSocketId) {
            io.to(targetSocketId).emit("addCart", data);
        }
    })


    socket.on("disconnect", ()=>{
        console.log("user disconnected.", socket.id)
    })
})

   return io
};


function getIO() {
    if(!io) return { message:"socket not initialize."};
    return io;
}


module.exports = {initSocket, getIO}