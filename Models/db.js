const mongoose = require("mongoose");

const mongoURL = process.env.MONGO_URI;

if (!mongoURL) {
  console.error("❌ MONGO_URI is not defined");
  process.exit(1);
}

mongoose
  .connect(mongoURL)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB connection failed ❌", err));
