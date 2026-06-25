const app = require("../src/app");
const connectDatabase = require("../src/config/database");

let isConnected = false;

module.exports = async (req, res) => {
  try {
    if (!isConnected) {
      await connectDatabase();
      isConnected = true;
      console.log("✅ Database connected");
    }

    return app(req, res);
  } catch (error) {
    console.error("❌ Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};