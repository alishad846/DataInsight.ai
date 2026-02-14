import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI is not set in environment variables");
      console.log("⚠️  Server will continue but database operations will fail");
      return;
    }
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.log("⚠️  Server will continue but database operations will fail");
    // Don't exit - allow server to run for debugging
    // process.exit(1);
  }
};

export default connectDB;
