import 'dotenv/config';
import mongoose from 'mongoose';
import HonorisCausa from '../models/HonorisCausa.js';

const APPLY = process.argv.includes('--apply');
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');
const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

function parseDate(t) {
  const m = (t || '').match(/held on\s+(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+),?\s+(\d{4})/i);
  if (!m) return null;
  const mo = MON[m[2].slice(0, 3).toLowerCase()];
  return mo === undefined ? null : new Date(Date.UTC(+m[3], mo, +m[1]));
}

const res = await fetch('https://app.jntua.ac.in/api/honoris-causas?populate=*&sort=createdAt:asc&pagination[pageSize]=100', {
  headers: { 'User-Agent': 'Mozilla/5.0' },
});
if (!res.ok) throw new Error('Old API HTTP ' + res.status);
const items = (await res.json()).data.map((d) => d.attributes);

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const existing = await HonorisCausa.find({}).lean();
const have = new Set(existing.map((h) => norm(h.honorDegree) + '|' + norm(h.name)));
console.log(`Old API rows: ${items.length} | Already in DB: ${existing.length} | Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);

let added = 0, skipped = 0;
for (const it of items) {
  const honorDegree = (it.Title || '').replace(/\s+/g, ' ').replace(/DEcember/i, 'December').trim();
  const name = (it.Description || '').trim() || '-';
  const convocationDate = parseDate(honorDegree);
  if (!honorDegree) { console.log('SKIP (no title)'); skipped++; continue; }
  if (have.has(norm(honorDegree) + '|' + norm(name))) { console.log('SKIP (exists):', honorDegree); skipped++; continue; }
  console.log(`${APPLY ? 'ADD' : 'WOULD ADD'}: [${convocationDate ? convocationDate.toISOString().slice(0, 10) : 'no date'}] ${honorDegree}  =>  ${name.replace(/\s+/g, ' ').slice(0, 70)}`);
  if (APPLY) await HonorisCausa.create({ honorDegree, name, convocationDate });
  added++;
}
console.log(`\nDone. ${APPLY ? 'Added' : 'Would add'}: ${added} | Skipped: ${skipped}`);
await mongoose.disconnect();
