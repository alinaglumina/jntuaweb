import 'dotenv/config';
import mongoose from 'mongoose';
import ProgrammeOffered from '../models/ProgrammeOffered.js';

const APPLY = process.argv.includes('--apply');
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const text = (blocks) => (blocks || []).map((b) => (b.children || []).map((c) => c.text || '').join('')).join(' ').replace(/\s+/g, ' ').trim();

const rows = [];
for (let page = 1; ; page++) {
  const r = await fetch(`https://app.jntua.ac.in/api/programmes-offereds?pagination[pageSize]=100&pagination[page]=${page}`, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!r.ok) throw new Error('Old API HTTP ' + r.status);
  const d = await r.json();
  rows.push(...d.data.map((x) => x.attributes));
  if (page >= d.meta.pagination.pageCount) break;
}

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const existing = await ProgrammeOffered.find({}).lean();
const have = new Set(existing.map((e) => [e.institution, e.department, e.level, e.programme].map(norm).join('|')));
console.log(`Old API rows: ${rows.length} | Already in DB: ${existing.length} | Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);

let added = 0, skipped = 0;
for (const a of rows) {
  const doc = {
    institution: (a.Category || '').trim(),
    department: (a.Department || '').trim(),
    level: (a.Type || '').trim(),
    programme: text(a.Programme),
  };
  if (!doc.institution || !doc.programme) { console.log('SKIP (incomplete):', doc); skipped++; continue; }
  const key = [doc.institution, doc.department, doc.level, doc.programme].map(norm).join('|');
  if (have.has(key)) { console.log('SKIP (exists):', doc.programme); skipped++; continue; }
  console.log(`${APPLY ? 'ADD' : 'WOULD ADD'}: [${doc.institution}] [${doc.level}] ${doc.department}  ->  ${doc.programme}`);
  if (APPLY) await ProgrammeOffered.create({ ...doc, sortOrder: added });
  have.add(key);
  added++;
}
console.log(`\nDone. ${APPLY ? 'Added' : 'Would add'}: ${added} | Skipped: ${skipped}`);
await mongoose.disconnect();
