import 'dotenv/config';
import mongoose from 'mongoose';
import NavMenuItem from '../models/NavMenuItem.js';

const APPLY = process.argv.includes('--apply');
await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

const REMOVE = ['acad-regsyllabus', 'acad-examinations', 'acad-examcal'];
const FINAL = [
  ['acad-methodology', 'Methodology', '/academics/methodology'],
  ['acad-admission', 'Admission', '/academics/admission'],
  ['acad-programmes-offered', 'Programmes Offered', '/academics/programmes-offered'],
  ['acad-downloads', 'Downloadable Documents', '/academics/downloads'],
  ['acad-affiliated', 'Affiliated Colleges', '/academics/affiliated-colleges'],
];

console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);
for (const k of REMOVE) {
  const found = await NavMenuItem.findOne({ key: k }).lean();
  console.log(`${APPLY ? 'REMOVE' : 'WOULD REMOVE'}: ${k} ${found ? '(' + found.label + ')' : '(not present)'}`);
  if (APPLY) await NavMenuItem.deleteOne({ key: k });
}
FINAL.forEach(([key, label, to], order) => {
  console.log(`${APPLY ? 'SET' : 'WOULD SET'}: ${order}. ${label}  ${to}`);
});
if (APPLY) {
  for (const [i, [key, label, to]] of FINAL.entries()) {
    await NavMenuItem.updateOne({ key }, { $set: { parentKey: 'academics', label, to, order: i, isActive: true } }, { upsert: true });
  }
}
const now = await NavMenuItem.find({ parentKey: 'academics' }).sort({ order: 1 }).lean();
console.log('\nAcademics menu now:', now.map((r) => r.label).join(' | '));
await mongoose.disconnect();
