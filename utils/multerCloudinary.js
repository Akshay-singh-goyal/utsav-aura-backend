// utils/multerCloudinary.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinary.js'; // ensure this path is correct

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'incrediblefest', // folder name in Cloudinary
    format: async (req, file) => 'png', // or use file.originalname extension
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});

export const upload = multer({ storage });
