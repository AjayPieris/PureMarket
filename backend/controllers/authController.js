import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// 🔸 Generate JWT
const generateToken = (user) => { 
  return jwt.sign(                         // 🔒 Create (sign) a new JWT token
    { id: user._id, role: user.role },     // 📦 Put user data (id and role) inside the token
    process.env.JWT_SECRET,                // 🔐 Use secret key from .env to secure the token
    { expiresIn: "7d" }                    // ⏰ Token will expire in 7 days
  );
};

// 🔹 Register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Check existing
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = new User({
      name,
      email,
      password,
      role,
      isApproved: role === "vendor" ? false : true, // vendors need approval
    });

    await user.save();

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    if (user.role === "vendor" && !user.isApproved) {
      return res.status(403).json({ message: "Vendor account not yet approved by admin" });
    }

    const token = generateToken(user);

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
