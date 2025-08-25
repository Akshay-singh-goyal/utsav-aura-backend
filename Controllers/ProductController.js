// controllers/productController.js
import Product from "../Models/Product.js";
import cloudinary from "../cloudinary.js"; // Cloudinary config
import fs from "fs";

// ✅ Add a new product
export const addProduct = async (req, res) => {
  try {
    const { name, originalPrice, discountPrice, description, category, quantity, color, soldBy } = req.body;

    if (!name || !originalPrice || !category) {
      return res.status(400).json({ error: "Name, originalPrice, and category are required" });
    }

    let imageUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });
      imageUrl = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const product = new Product({
      name,
      originalPrice: Number(originalPrice),
      discountPrice: Number(discountPrice) || Number(originalPrice),
      description,
      category,
      quantity: Number(quantity) || 0,
      color,
      soldBy,
      image: imageUrl,
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
};

// ✅ Update a product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (updates.originalPrice) updates.originalPrice = Number(updates.originalPrice);
    if (updates.discountPrice) updates.discountPrice = Number(updates.discountPrice);
    if (updates.quantity) updates.quantity = Number(updates.quantity);

    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });
      updates.image = result.secure_url;
      fs.unlinkSync(req.file.path);
    }

    const updated = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!updated) return res.status(404).json({ error: "Product not found" });

    res.json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ error: "Failed to update product" });
  }
};

// ✅ Get all products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ✅ Get products grouped by category
export const getProductsGroupedByCategory = async (req, res) => {
  try {
    const products = await Product.find();
    const grouped = products.reduce((acc, product) => {
      if (!acc[product.category]) acc[product.category] = [];
      acc[product.category].push(product);
      return acc;
    }, {});
    res.json(grouped);
  } catch (err) {
    console.error("Get products grouped by category error:", err);
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

// ✅ Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error("Get product by ID error:", err);
    res.status(500).json({ error: "Failed to fetch product" });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Failed to delete product" });
  }
};
