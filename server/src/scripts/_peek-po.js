import 'dotenv/config';
import mongoose from 'mongoose';
await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const db = mongoose.connection.db;
const items = await db.collection('directoratemenuitems')
  .find({ directorateKey: 'otpri', label: /programs?\s*organi[sz]ed/i }).toArray();
console.log('MENU ITEMS:', items.map(i => ({ menuKey: i.menuKey, parentKey: i.parentKey, label: i.label, type: i.type })));
for (const it of items) {
  const kids = await db.collection('directoratemenuitems')
    .find({ directorateKey: 'otpri', parentKey: it.menuKey, isActive: { $ne: false } }).sort({ sortOrder: 1 }).toArray();
  console.log('CHILDREN of', it.menuKey, kids.length);
  console.log(kids.slice(0, 3).map(k => ({ menuKey: k.menuKey, label: k.label, type: k.type, attachment1: k.attachment1, externalUrl: k.externalUrl, createdAt: k.createdAt })));
}
const dl = await db.collection('downloads').find({ section: /programm?e?s?-?\s*organi/i }).toArray();
console.log('DOWNLOADS in main DB:', dl.length, dl.slice(0, 2));
await mongoose.disconnect();
