import 'dotenv/config';
import mongoose from 'mongoose';
import NavMenuItem from '../models/NavMenuItem.js';

const APPLY = process.argv.includes('--apply');
await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const parent = await NavMenuItem.findOne({ parentKey: null, label: /important units/i }).lean();
if (!parent) throw new Error('Important Units group not found in the menu database');
const kids = await NavMenuItem.find({ parentKey: parent.key }).sort({ order: 1, createdAt: 1 }).lean();
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'} | group key: ${parent.key}\n\nCURRENT:`);
kids.forEach((k, i) => console.log(`  ${i}. [order ${k.order}] ${k.label}`));

const isMoved = (k) => /SC\/ST|anti[ -]?ragging/i.test(k.label);
const moved = kids.filter(isMoved);
const rest = kids.filter((k) => !isMoved(k));
const ipr = rest.findIndex((k) => /intellectual property/i.test(k.label));
if (moved.length !== 2) throw new Error('expected 2 items to move, found ' + moved.length);
if (ipr < 0) throw new Error('IPR item not found');
rest.splice(ipr + 1, 0, ...moved);

console.log('\nNEW ORDER:');
rest.forEach((k, i) => console.log(`  ${i}. ${k.label}`));
if (APPLY) {
  for (const [i, k] of rest.entries()) await NavMenuItem.updateOne({ _id: k._id }, { $set: { order: i } });
  console.log('\nUpdated.');
}
await mongoose.disconnect();
