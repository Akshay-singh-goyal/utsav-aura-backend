const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const registerRoutes = require("./routes/registerRoutes"); // ✅ require
const sendMail = require("../backend/utils/sendOtp");


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes")); // assuming CommonJS
app.use("/api/register", registerRoutes); // ✅ must be a router

app.get("/", (req, res) => {
  res.send("Server running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
 