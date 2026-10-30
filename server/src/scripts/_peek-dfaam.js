import 'dotenv/config';
import mongoose from 'mongoose';
import DirectorateMenuItem from '../models/DirectorateMenuItem.js';
await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const rows = await DirectorateMenuItem.find({ directorateKey: /foreign|dfaam|alumni/i }).sort({ parentKey: 1, sortOrder: 1 }).lean();
console.log('directorateKeys:', [...new Set(rows.map(r => r.directorateKey))]);
for (const r of rows) console.log([r.menuKey, '| parent:', r.parentKey || '-', '|', r.label, '|', r.type, '| body:', (r.body || '').length, '| att:', r.attachment1 ? 'Y' : '-', '| ext:', r.externalUrl || '-', '| active:', r.isActive].join(' '));
await mongoose.disconnect();
