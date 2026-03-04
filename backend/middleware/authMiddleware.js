// 🛡️ Middleware: "protect"
// ----------------------------------------------------
// This middleware checks if the user has a valid JWT token before
// allowing access to protected routes (like profile, orders, etc.)
// If the token is valid → user can continue.
// If not → send “Not authorized” response.
// ----------------------------------------------------

import jwt from "jsonwebtoken";          // 🔐 Import JWT to verify tokens
import User from "../models/User.js";    // 👤 Import User model from MongoDB

export const protect = async (req, res, next) => {
  let token;                             // 🧾 Variable to hold the token value

  // ✅ Check if request header has "Authorization: Bearer <token>"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];   // ✂️ Extract the token part after "Bearer"
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // 🔍 Verify token using secret key

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) {
        return res.status(401).json({ message: "Account not found. Please log in again." });
      }
      if (req.user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked by the admin.", blocked: true });
      }
      next();
    } catch (err) {
      res.status(401).json({ message: "Not authorized, token failed" }); // ❌ Token invalid or expired
    }
  } else {
    res.status(401).json({ message: "No token provided" });  // ❌ Token missing in headers
  }
};
