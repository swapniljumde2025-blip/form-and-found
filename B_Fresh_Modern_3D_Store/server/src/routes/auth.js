import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email: String(email || '').toLowerCase().trim() });
    if (!admin || !await bcrypt.compare(password || '', admin.passwordHash)) return res.status(401).json({ message: 'Invalid email or password' });
    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, email: admin.email });
  } catch (e) { next(e); }
});
router.get('/me', requireAdmin, (req, res) => res.json({ email: req.admin.email }));
export default router;
