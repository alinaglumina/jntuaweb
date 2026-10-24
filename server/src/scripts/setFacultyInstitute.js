import connectDB from '../config/db.js';
import { Faculty } from '../models/index.js';
import mongoose from 'mongoose';

const apply = process.argv.includes('--apply');
const VALUE = 'JNTUA CEA';
await connectDB();
const filter = { $or: [{ institute: '' }, { institute: null }, { institute: { $exists: false } }] };
const total = await Faculty.countDocuments({});
const groups = await Faculty.aggregate([{ $group: { _id: '$directorateKey', n: { $sum: 1 } } }]);
const toSet = await Faculty.countDocuments(filter);
console.log('total faculty:', total, '| with empty institute:', toSet);
console.log('by directorateKey:', JSON.stringify(groups));
if (!apply) console.log('DRY RUN. Re-run with --apply to set institute to', VALUE);
else {
  const r = await Faculty.updateMany(filter, { $set: { institute: VALUE } });
  console.log('updated:', r.modifiedCount);
}
await mongoose.disconnect();
