import connectDB from '../config/db.js';
import { DirectorateMenuItem } from '../models/index.js';
import mongoose from 'mongoose';
await connectDB();
const parents = await DirectorateMenuItem.find({ directorateKey: 'rd', label: /research\s*cent/i }).lean();
for (const p of parents) {
  console.log('PARENT:', p.label, '| menuKey:', p.menuKey, '| type:', p.type);
  const kids = await DirectorateMenuItem.find({ directorateKey: 'rd', parentKey: p.menuKey }).sort({ sortOrder: 1 }).lean();
  kids.forEach(k => console.log('  child:', k.sortOrder, '|', k.label, '| menuKey:', k.menuKey, '| type:', k.type, '| active:', k.isActive));
}
await mongoose.disconnect();
