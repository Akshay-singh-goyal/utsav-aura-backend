// Routes/categoryRoute.js
import express from 'express';
import { createCategory } from '../Controllers/categoryController.js';

const router = express.Router();

// POST /api/admin/categories
router.post('/categories', createCategory);

export default router;
