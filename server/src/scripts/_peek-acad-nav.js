import 'dotenv/config';
import mongoose from 'mongoose';
import NavMenuItem from '../models/NavMenuItem.js';
await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const rows = await NavMenuItem.find({ $or: [{ parentKey: /acad/i }, { key: /acad/i }, { to: /^\/academics/ }] }).sort({ order: 1 }).lean();
console.log(rows.map(r => ({ key: r.key, parentKey: r.parentKey, label: r.label, to: r.to, order: r.order, isActive: r.isActive, deleted: r.deleted })));
await mongoose.disconnect();
