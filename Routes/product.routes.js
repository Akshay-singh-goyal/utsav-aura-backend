import express from "express";
import multer from "multer";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductsGroupedByCategory,
} from "../Controllers/ProductController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // or Cloudinary config

// ✅ Add product (with image upload)
router.post("/add", upload.single("image"), addProduct);


// ✅ Get all products
router.get("/", getProducts);

// ✅ Get products grouped by category
router.get("/grouped", getProductsGroupedByCategory);

// ✅ Get single product by ID
router.get("/:id", getProductById);

// ✅ Update product (with optional image upload)
router.put("/:id", upload.single("image"), updateProduct);

// ✅ Delete product
router.delete("/:id", deleteProduct);

// GET /api/products/search?q=keyword
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim() === "") return res.status(400).json({ success: false, message: "Query is required" });

  try {
    const products = await Product.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } }
      ]
    }).limit(50); // limit for performance

    res.json({ success: true, products });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});
export default router;
