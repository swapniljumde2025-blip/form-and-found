import mongoose from 'mongoose';
const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  slug: { type: String, unique: true },
  description: { type: String, required: true, maxlength: 3000 },
  price: { type: Number, required: true, min: 0 },
  compareAtPrice: { type: Number, min: 0 },
  category: { type: String, required: true, trim: true },
  images: [{ type: String }],
  material: { type: String, default: 'PLA' },
  dimensions: { type: String, default: '' },
  colorOptions: [{ type: String }],
  stock: { type: Number, default: 0, min: 0 },
  featured: { type: Boolean, default: false },
  active: { type: Boolean, default: true },
  madeToOrder: { type: Boolean, default: false },
}, { timestamps: true });
productSchema.pre('save', function(next) {
  if (!this.slug) this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
  next();
});
export default mongoose.model('Product', productSchema);
