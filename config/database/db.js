// const mongoose = require("mongoose")
// const connectDB = async () => {
//    try {
//       await mongoose.connect(process.env.MONGO_URL)
//    console.log("mongoDB connected successfully")
//    } catch (error) {
//       console.log("mongodb connection failed",error)
//    }
// }
// module.exports=connectDB

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully...");
  } catch (error) {
    console.error("❌ MongoDB connection failed:", error.message);
    process.exit(1); // Stop the server if DB fails
  }
};

module.exports = connectDB;
