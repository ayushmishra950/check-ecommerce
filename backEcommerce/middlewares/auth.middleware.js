const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer "))
      return res.status(401).json({ message: "Unauthorized" });

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(403).json({ message: "Invalid token" });
  }

};

module.exports = { protect };











// const jwt = require("jsonwebtoken");

// const protect = (req, res, next) => {
//   try {
//     let token;

//     // 🔥 1. Try cookie
//     if (req.cookies?.accessToken) {
//       token = req.cookies.accessToken;
//     }

//     // 🔥 2. Fallback to header
//     else if (
//       req.headers.authorization &&
//       req.headers.authorization.startsWith("Bearer ")
//     ) {
//       token = req.headers.authorization.split(" ")[1];
//     }

//     if (!token) {
//       return res.status(401).json({ message: "Not authorized, no token" });
//     }

//     const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

//     req.user = decoded;

//     next();
//   } catch (error) {
//     console.error("Auth Error:", error.message);

//     if (error.name === "TokenExpiredError") {
//       return res.status(401).json({ message: "Token expired" });
//     }

//     return res.status(403).json({ message: "Invalid token" });
//   }
// };

// module.exports = { protect };