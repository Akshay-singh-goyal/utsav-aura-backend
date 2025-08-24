const mongoose = require('mongoose');

const mongo_url = process.env.MONGO_CONN;
if (!mongo_url) {
  console.error('❌ MONGO_CONN is not defined in .env');
  process.exit(1);
}


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.log("MongoDB connection failed ❌", err));


