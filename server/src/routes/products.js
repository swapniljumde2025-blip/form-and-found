
import { Router } from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'node:stream';

import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';

const router = Router();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer stores images temporarily in memory
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (/^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, WEBP and GIF images are allowed.'));
    }
  },
});

// Upload image buffer to Cloudinary
const uploadToCloudinary = (file) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'form-and-found/products',
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
};

// Get active products
router.get('/', async (req, res, next) => {
  try {
    const filter = { active: true };

    if (req.query.category && req.query.category !== 'All') {
      filter.category = req.query.category;
    }

    if (req.query.search) {
      filter.$or = [
        { name: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
      ];
    }

    const products = await Product.find(filter).sort({
      featured: -1,
      createdAt: -1,
    });

    res.json(products);
  } catch (e) {
    next(e);
  }
});

// Get all products for admin
router.get('/admin/all', requireAdmin, async (_req, res, next) => {
  try {
    res.json(await Product.find().sort({ createdAt: -1 }));
  } catch (e) {
    next(e);
  }
});

// Upload product images to Cloudinary
router.post(
  '/upload',
  requireAdmin,
  upload.array('images', 6),
  async (req, res, next) => {
    try {
      if (!req.files?.length) {
        return res.status(400).json({
          message: 'Please select at least one image.',
        });
      }

      const results = await Promise.all(
        req.files.map(uploadToCloudinary)
      );

      const urls = results.map((image) => image.secure_url);

      res.json({ images: urls });
    } catch (e) {
      next(e);
    }
  }
);

// Create product
router.post('/', requireAdmin, async (req, res, next) => {
  try {
    const p = await Product.create(req.body);
    res.status(201).json(p);
  } catch (e) {
    next(e);
  }
});

// Update product
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const p = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!p) {
      return res.status(404).json({
        message: 'Product not found',
      });
    }

    res.json(p);
  } catch (e) {
    next(e);
  }
});

// Delete product
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

export default router;
