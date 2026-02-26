import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "vendor", "customer"],
      default: "customer",
    },
    isApproved: {
      type: Boolean,
      default: false, // for vendors (admin must approve)
    },
    profileImage: {
      type: String,
      default: "",
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

// 🔐 Before saving a user, this function runs automatically
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // 👉 If password not changed, skip hashing

  this.password = await bcrypt.hash(this.password, 10); // 🔄 Hash the password with bcrypt (10 = salt rounds)
  next(); // ✅ Move to the next step (save user)
});

// 🔍 Add a method to compare entered password with stored hashed password
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password); // ✅ Returns true if match, false if not
};

const User = mongoose.model("User", userSchema);
export default User;
