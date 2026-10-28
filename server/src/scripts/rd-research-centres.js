import connectDB from '../config/db.js';
import { DirectorateMenuItem } from '../models/index.js';
import { uploadToR2 } from '../config/cloudflareR2.js';
import mongoose from 'mongoose';
import fs from 'fs';

const apply = process.argv.includes('--apply');
const DL = '/mnt/chromeos/MyFiles/Downloads/';
const NEW = [
  { menuKey: 'research-centre-guidelines', label: 'Guidelines', file: 'Research_Centre_Guidelines_e7c1e04137.pdf', sortOrder: 0 },
  { menuKey: 'application-for-recognition-of-research-centre', label: 'Application for Recognition of Research Centre', file: 'Application_for_Recognition_of_Research_Centre_4ec5acf731.pdf', sortOrder: 1 },
];
const btn = (url) => `<p><a href="${url}" target="_blank" rel="noopener noreferrer" style="display:inline-block;padding:12px 22px;border-radius:8px;background:#0F4A3C;color:#fff;font-weight:600;text-decoration:none">View / Download PDF</a></p>`;

await connectDB();
const parent = await DirectorateMenuItem.findOne({ directorateKey: 'rd', menuKey: 'research-centres' });
if (!parent) { console.log('Parent "research-centres" not found. Stopping.'); process.exit(1); }
for (const n of NEW) if (!fs.existsSync(DL + n.file)) { console.log('MISSING FILE:', DL + n.file); await mongoose.disconnect(); process.exit(1); }

const keep = new Set(NEW.map((n) => n.menuKey));
const kids = await DirectorateMenuItem.find({ directorateKey: 'rd', parentKey: 'research-centres' });
const toRemove = kids.filter((k) => !keep.has(k.menuKey));
console.log('Children now:', kids.length);
toRemove.forEach((k) => console.log('  will move to Trash:', k.label));
NEW.forEach((n) => console.log('  will add/update:', n.label, '<-', n.file));
if (!apply) { console.log('DRY RUN. Re-run with --apply to make the changes.'); await mongoose.disconnect(); process.exit(0); }

for (const n of NEW) {
  const { url } = await uploadToR2(DL + n.file, 'rd');
  const data = { directorateKey: 'rd', parentKey: 'research-centres', menuKey: n.menuKey, label: n.label, type: 'page', body: btn(url), attachment1: url, sortOrder: n.sortOrder, isActive: true };
  const ex = kids.find((k) => k.menuKey === n.menuKey);
  if (ex) { Object.assign(ex, data); await ex.save(); } else { await DirectorateMenuItem.create(data); }
  console.log('saved:', n.label, url);
}
for (const k of toRemove) { await k.deleteOne(); console.log('trashed:', k.label); }
await mongoose.disconnect();
