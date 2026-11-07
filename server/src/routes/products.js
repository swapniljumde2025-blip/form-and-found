import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
const uploadDir = path.resolve('uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({ destination: uploadDir, filename: (_req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')) });
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, cb) => cb(null, /^image\/(jpeg|png|webp|gif)$/.test(file.mimetype)) });
router.get('/', async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.category && req.query.category !== 'All') filter.category = req.query.category;
    if (req.query.search) filter.$or = [{ name: new RegExp(req.query.search, 'i') }, { description: new RegExp(req.query.search, 'i') }];
    const products = await Product.find(filter).sort({ featured: -1, createdAt: -1 });
    res.json(products);
  } catch (e) { next(e); }
});
router.get('/admin/all', requireAdmin, async (_req, res, next) => { try { res.json(await Product.find().sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.post('/upload', requireAdmin, upload.array('images', 6), (req, res) => {
  const urls = (req.files || []).map(f => `/uploads/${f.filename}`);
  res.json({ images: urls });
});
router.post('/', requireAdmin, async (req, res, next) => {
  try { const p = await Product.create(req.body); res.status(201).json(p); } catch (e) { next(e); }
});
router.put('/:id', requireAdmin, async (req, res, next) => {
  try { const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); if (!p) return res.status(404).json({ message: 'Product not found' }); res.json(p); } catch (e) { next(e); }
});
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try { await Product.findByIdAndDelete(req.params.id); res.json({ ok: true }); } catch (e) { next(e); }
});
export default router;
