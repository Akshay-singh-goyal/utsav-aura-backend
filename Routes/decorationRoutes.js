import express from 'express';
import multer from 'multer';
import path from 'path';

import {
  getAllDecorations,
  getDecorationById,     // <-- new import
  addDecorations,
  deleteDecoration,
  toggleFeatured,
} from '../Controllers/decorationController.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/', getAllDecorations);
router.get('/:id', getDecorationById); // <-- new route
router.post('/add', upload.array('images'), addDecorations);
router.delete('/:id', deleteDecoration);
router.patch('/feature/:id', toggleFeatured);

export default router;
