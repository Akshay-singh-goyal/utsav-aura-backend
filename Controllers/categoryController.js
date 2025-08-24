// controllers/adminController.js
// Controllers/categoryController.js
import Category from '../Models/Category.js'; // ✅ Default import matches default export

export const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category exists
    const existing = await Category.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    // Create and save new category
    const category = new Category({ name: name.trim() });
    await category.save();

    return res.status(201).json({ name: category.name });
  } catch (err) {
    console.error('Error creating category:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};
