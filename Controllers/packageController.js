import Package from "../Models/Package.js";
import { v2 as cloudinary } from "cloudinary";

// ------------------ CREATE ------------------

import { uploadOnCloudinary } from "../cloudinary.js";

export const createPackage = async (req, res) => {
  try {
    const { name, description, price, duration, days } = req.body;
    // ✅ Ensure required fields exist
    if (!name || !description || !price || !duration || !days) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // ✅ Handle image
    let imageUrl = "";
    if (req.file) {
      const uploadResult = await uploadOnCloudinary(req.file.path);
      imageUrl = uploadResult.secure_url;
    }

    // ✅ Parse days (if coming as stringified JSON)
    let parsedDays = [];
    try {
      parsedDays = typeof days === "string" ? JSON.parse(days) : days;
    } catch (err) {
      return res.status(400).json({ error: "Invalid days format" });
    }

    const newPackage = new Package({
      name,
      description,
      price,
      duration,
      days: parsedDays,
      image: imageUrl,
    });

    await newPackage.save();
    res.status(201).json(newPackage);
  } catch (error) {
    console.error("❌ Package creation failed:", error);
    res.status(500).json({ error: error.message || "Failed to create package" });
  }
};

// ------------------ GET ALL ------------------
export const getPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 });
    res.status(200).json(packages);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch packages" });
  }
};

// ------------------ GET BY ID ------------------
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found ❌" });
    res.status(200).json(pkg);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch package" });
  }
};

// ------------------ UPDATE ------------------
export const updatePackage = async (req, res) => {
  try {
    const { name, type, description, price, duration, days } = req.body;

    const parsedDays = days
      ? typeof days === "string"
        ? JSON.parse(days)
        : days
      : [];

    let updatedFields = {
      name,
      type,
      description,
      price,
      duration,
      days: parsedDays,
    };

    if (req.file) {
      const uploaded = await cloudinary.uploader.upload(req.file.path, {
        folder: "packages",
      });
      updatedFields.image = uploaded.secure_url;
    }

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    );

    if (!updatedPackage) {
      return res.status(404).json({ error: "Package not found ❌" });
    }

    res.status(200).json(updatedPackage);
  } catch (err) {
    console.error("❌ Update package error:", err);
    res.status(500).json({ error: "Failed to update package" });
  }
};

// ------------------ DELETE ------------------
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findByIdAndDelete(req.params.id);
    if (!pkg) return res.status(404).json({ error: "Package not found ❌" });

    res.status(200).json({ message: "✅ Package deleted successfully" });
  } catch (err) {
    console.error("❌ Delete package error:", err);
    res.status(500).json({ error: "Failed to delete package" });
  }
};
