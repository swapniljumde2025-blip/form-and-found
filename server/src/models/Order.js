import mongoose from 'mongoose';
const orderSchema = new mongoose.Schema({
  items: [{ productId: String, name: String, image: String, price: Number, quantity: Number, color: String }],
  customer: { name: String, email: String, phone: String },
  shippingAddress: { line1: String, line2: String, city: String, state: String, postalCode: String, country: { type: String, default: 'India' } },
  subtotal: Number, shipping: { type: Number, default: 0 }, total: Number,
  paymentMethod: { type: String, enum: ['cod', 'manual'], default: 'cod' },
  paymentStatus: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
  status: { type: String, enum: ['placed', 'confirmed', 'printing', 'shipped', 'delivered', 'cancelled'], default: 'placed' },
  notes: String
}, { timestamps: true });
export default mongoose.model('Order', orderSchema);
