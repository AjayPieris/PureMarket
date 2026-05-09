// config/db.js
import mongoose from "mongoose";

let isConnected = false;

const connectDB = async () => {
  mongoose.set("strictQuery", true);
  if (isConnected) {
    console.log("=> using existing database connection");
    return;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = conn.connections[0].readyState;
    console.log(`🗃️ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ Error: ${err.message}`);
    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

export default connectDB;
