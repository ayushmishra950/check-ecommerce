// import {io} from "socket.io-client";
// const accessToken = localStorage.getItem("accessToken");
// const socket = io(import.meta.env.VITE_BACKEND_URL, {
//     auth:{
//         accessToken: accessToken
//     }
// });

// export default socket;








import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  autoConnect: false, // 🔥 important
});

export const connectSocket = (token) => {
  if (socket.connected) {
    socket.disconnect();
  }
  socket.auth = { accessToken: token };
  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

export default socket;