const mongoose = require("mongoose");

const connectDatabase = async () => {
  const dbUri = process.env.DATABASE_URL;

  if (!dbUri) {
    throw new Error("DATABASE_URL is not configured");
  }

  await mongoose.connect(dbUri);
  console.log("MongoDB connected");
};

module.exports = connectDatabase;