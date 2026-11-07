import dotenv from 'dotenv'; import mongoose from 'mongoose'; import bcrypt from 'bcryptjs'; import Admin from './models/Admin.js';
dotenv.config();
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.MONGODB_URI) throw new Error('Set MONGODB_URI, ADMIN_EMAIL and ADMIN_PASSWORD in .env first');
await mongoose.connect(process.env.MONGODB_URI);
const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);
await Admin.findOneAndUpdate({ email: process.env.ADMIN_EMAIL.toLowerCase() }, { email: process.env.ADMIN_EMAIL.toLowerCase(), passwordHash }, { upsert: true, new: true });
console.log('Admin account created/updated.'); await mongoose.disconnect();
