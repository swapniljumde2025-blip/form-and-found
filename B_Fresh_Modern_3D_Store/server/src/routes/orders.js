import { Router } from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { requireAdmin } from '../middleware/auth.js';
const router = Router();
router.post('/', async (req, res, next) => {
  try {
    const { items, customer, shippingAddress, notes } = req.body;
    if (!Array.isArray(items) || !items.length || !customer?.name || !customer?.phone || !shippingAddress?.line1 || !shippingAddress?.postalCode) return res.status(400).json({ message: 'Please complete the required checkout details.' });
    let subtotal = 0; const safeItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.active) return res.status(400).json({ message: 'A selected product is no longer available.' });
      const quantity = Math.max(1, Math.min(20, Number(item.quantity) || 1));
      if (!product.madeToOrder && product.stock < quantity) return res.status(400).json({ message: `${product.name} has insufficient stock.` });
      subtotal += product.price * quantity;
      safeItems.push({ productId: String(product._id), name: product.name, image: product.images[0] || '', price: product.price, quantity, color: item.color || '' });
      if (!product.madeToOrder) { product.stock -= quantity; await product.save(); }
    }
    const shipping = subtotal >= 1499 ? 0 : 79;
    const order = await Order.create({ items: safeItems, customer, shippingAddress, subtotal, shipping, total: subtotal + shipping, notes });
    res.status(201).json({ message: 'Order received', orderNumber: order._id, total: order.total });
  } catch (e) { next(e); }
});
router.get('/', requireAdmin, async (_req, res, next) => { try { res.json(await Order.find().sort({ createdAt: -1 })); } catch (e) { next(e); } });
router.patch('/:id/status', requireAdmin, async (req, res, next) => {
  try { const allowed = ['placed','confirmed','printing','shipped','delivered','cancelled']; if (!allowed.includes(req.body.status)) return res.status(400).json({ message: 'Invalid status' }); const order = await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true }); res.json(order); } catch (e) { next(e); }
});
export default router;
