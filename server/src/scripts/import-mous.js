import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import mongoose from 'mongoose';
import Mou from '../models/Mou.js';
import { uploadToR2 } from '../config/cloudflareR2.js';

const APPLY = process.argv.includes('--apply');
const BASE = 'https://app.jntua.ac.in';
const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

const res = await fetch(`${BASE}/api/tie-ups-and-mous?populate=*&sort=Date_of_MOU:desc&pagination[pageSize]=100`, {
  headers: { 'User-Agent': 'Mozilla/5.0' },
});
if (!res.ok) throw new Error('Old API HTTP ' + res.status);
const items = (await res.json()).data.map((d) => d.attributes);

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const existing = await Mou.find({}).lean();
const have = new Set(existing.map((m) => `${norm(m.orgName)}|${m.mouType}`));
console.log(`Old API MoUs: ${items.length} | Already in DB: ${existing.length} | Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);

let added = 0, skipped = 0, failed = 0;
for (let i = 0; i < items.length; i++) {
  const it = items[i];
  const orgName = (it.Name || '').trim();
  const mouType = /international/i.test(it.Type || '') ? 'International' : 'National';
  const dm = (it.Date_of_MOU || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  const mouDate = dm ? new Date(Date.UTC(+dm[1], +dm[2] - 1, +dm[3])) : null;
  const rel = it.Document?.data?.attributes?.url || '';
  const src = rel ? (rel.startsWith('http') ? rel : BASE + rel) : '';
  const key = `${norm(orgName)}|${mouType}`;
  if (!orgName) { console.log('SKIP (no name)'); skipped++; continue; }
  if (have.has(key)) { console.log(`SKIP (exists): ${orgName}`); skipped++; continue; }
  console.log(`${APPLY ? 'ADD' : 'WOULD ADD'}: [${mouType}] [${mouDate ? mouDate.toISOString().slice(0, 10) : 'no date'}] ${orgName}  ${src ? '' : '(no document)'}`);
  if (!APPLY) { added++; continue; }
  try {
    let document = '';
    if (src) {
      const r = await fetch(src);
      if (!r.ok) throw new Error('file HTTP ' + r.status);
      const ext = (src.split('?')[0].match(/\.[a-z0-9]+$/i) || ['.pdf'])[0];
      const tmp = path.join(os.tmpdir(), `mou_${Date.now()}_${i}${ext}`);
      fs.writeFileSync(tmp, Buffer.from(await r.arrayBuffer()));
      ({ url: document } = await uploadToR2(tmp, 'mous'));
      fs.unlinkSync(tmp);
    }
    await Mou.create({ directorateKey: '', orgName, mouType, document, mouDate, isActive: true });
    added++;
  } catch (e) {
    console.log('  FAILED:', orgName, '-', e.message);
    failed++;
  }
}
console.log(`\nDone. ${APPLY ? 'Added' : 'Would add'}: ${added} | Skipped: ${skipped} | Failed: ${failed}`);
await mongoose.disconnect();
