import Decoration from '../Models/Decoration.js';
import cloudinary from '../cloudinary.js';

// Get all decorations
export const getAllDecorations = async (req, res) => {
  try {
    const decorations = await Decoration.find();
    res.json(decorations);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};

// Add new decorations with Cloudinary upload
export const addDecorations = async (req, res) => {
  try {
    const { names, descriptions, priceBuys, priceRents } = req.body;
    const files = req.files; // from multer

    const namesArr = Array.isArray(names) ? names : [names];
    const descriptionsArr = Array.isArray(descriptions) ? descriptions : [descriptions];
    const priceBuysArr = Array.isArray(priceBuys) ? priceBuys : [priceBuys];
    const priceRentsArr = Array.isArray(priceRents) ? priceRents : [priceRents];

    const items = [];

    for (let i = 0; i < namesArr.length; i++) {
      let imageUrl = null;
      if (files && files[i]) {
        const result = await cloudinary.uploader.upload(files[i].path, {
          folder: "decorations",
        });
        imageUrl = result.secure_url;
      }

      const decoration = new Decoration({
        name: namesArr[i],
        description: descriptionsArr[i],
        priceBuy: priceBuysArr[i],
        priceRent: priceRentsArr[i],
        image: imageUrl,
      });

      await decoration.save();
      items.push(decoration);
    }

    res.status(201).json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add decorations' });
  }
};

// Delete a decoration by ID
export const deleteDecoration = async (req, res) => {
  try {
    const id = req.params.id;
    const decoration = await Decoration.findById(id);
    if (!decoration) return res.status(404).json({ error: 'Decoration not found' });

    // Delete image from Cloudinary if exists
    if (decoration.image) {
      const publicId = decoration.image.split("/").pop().split(".")[0]; // extract publicId
      await cloudinary.uploader.destroy(`decorations/${publicId}`);
    }

    await Decoration.findByIdAndDelete(id);
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete decoration' });
  }
};

// Toggle featured
export const toggleFeatured = async (req, res) => {
  try {
    const decoration = await Decoration.findById(req.params.id);
    if (!decoration) return res.status(404).json({ error: 'Decoration not found' });

    decoration.featured = !decoration.featured;
    await decoration.save();

    res.json({ message: 'Featured status toggled', featured: decoration.featured });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle featured status' });
  }
};

// Get decoration by ID
export const getDecorationById = async (req, res) => {
  try {
    const decoration = await Decoration.findById(req.params.id);
    if (!decoration) return res.status(404).json({ error: 'Decoration not found' });

    res.json(decoration);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};
