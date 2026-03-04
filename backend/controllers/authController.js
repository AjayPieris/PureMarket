import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import nodemailer from "nodemailer";

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
    const { name, email, password, role, profileImage } = req.body;

    // Check existing
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });

    const user = new User({
      name,
      email,
      password,
      role,
      isApproved: role === "vendor" ? false : true, // vendors need approval
      profileImage: profileImage || "",
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
        profileImage: user.profileImage,
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

    // Vendors CAN log in even if not approved — they just can't add products
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account has been blocked by the admin.", blocked: true });
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
        profileImage: user.profileImage || "",
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Get current user profile (for navbar / app init)
export const getMe = async (req, res) => {
  try {
    const user = req.user;
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isApproved: user.isApproved,
      isBlocked: user.isBlocked || false,
      profileImage: user.profileImage || "",
      storeLink: user.storeLink || "",
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Vendor submits their store link for admin review
export const updateStoreLink = async (req, res) => {
  try {
    const { storeLink } = req.body;
    if (!storeLink) return res.status(400).json({ message: "Store link is required." });

    const user = await User.findById(req.user._id);
    user.storeLink = storeLink;
    await user.save();

    res.json({ message: "Store link submitted successfully.", storeLink });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Forgot Password — send reset email
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether email exists
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }

    // Generate a random token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    // Build reset URL
    const frontendBase = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendBase}/reset-password/${rawToken}`;

    // Send email via Gmail SMTP
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"PureMarket" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your PureMarket password",
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:auto;">
          <h2 style="color:#6d28d9;">Reset your password</h2>
          <p>We received a request to reset the password for your account.</p>
          <p>Click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.</p>
          <a href="${resetUrl}"
             style="display:inline-block;margin:16px 0;padding:12px 28px;background:linear-gradient(90deg,#7C3AED,#6D28D9);color:#fff;text-decoration:none;border-radius:8px;font-weight:700;">
            Reset Password
          </a>
          <p style="color:#6b7280;font-size:13px;">If you didn't request this, you can safely ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;"/>
          <p style="color:#9ca3af;font-size:12px;">PureMarket · Marketplace Platform</p>
        </div>
      `,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 🔹 Reset Password — validate token and save new password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or has expired." });
    }

    user.password = password; // pre-save hook hashes it automatically
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password reset successful. You can now sign in." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

