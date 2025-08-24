import Product from "../Models/Product.js";
import cloudinary from "../cloudinary.js"; // Cloudinary config
import fs from "fs";

// ✅ Add a new product
export const addProduct = async (req, res) => {
  try {
    console.log("REQ.BODY:", req.body);
    console.log("REQ.FILE:", req.file);

    const { name, description, price, category } = req.body;

    if (!req.file || !name || !description || !price || !category) {
      return res.status(400).json({ error: "All fields including image and category are required" });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });

    // Delete local file
    fs.unlinkSync(req.file.path);

    const product = new Product({
      name,
      description,
      price,
      category,
      image: result.secure_url, // Cloudinary URL
    });

    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error("Add product error:", err);
    res.status(500).json({ error: "Failed to add product" });
  }
};

// ✅ Update product
export const updateProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;
    const updateData = { name, description, price, category };

    if (req.file) {
      // Upload new image to Cloudinary
      const result = await cloudinary.uploader.upload(req.file.path, { folder: "products" });
      fs.unlinkSync(req.file.path); // Delete local file
      updateData.image = result.secure_url;
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
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
    const products = await Product.find();
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
