const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const registerRoutes = require("./routes/registerRoutes");

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/register", registerRoutes);

app.get("/", (req, res) => {
  res.send("Server running...");
});

// // ❌ Remove this line for Vercel
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ✅ Export the app for Vercel
module.exports = app;
