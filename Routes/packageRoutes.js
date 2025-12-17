import express from "express";
import multer from "multer";
import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
} from "../Controllers/packageController.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp folder

// Create
router.post("/", upload.single("image"), createPackage);

// Read
router.get("/", getPackages);
router.get("/:id", getPackageById);

// Update
router.put("/:id", upload.single("image"), updatePackage);

// Delete
router.delete("/:id", deletePackage);

export default router;
