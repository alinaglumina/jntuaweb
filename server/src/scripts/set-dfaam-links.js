import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import mongoose from 'mongoose';
import DirectorateMenuItem from '../models/DirectorateMenuItem.js';
import { uploadToR2 } from '../config/cloudflareR2.js';

const DK = 'foreign-affairs-alumni';
const PDFS = [
  ['distinguished-alumni', 'Distinguished Alumni (PDF)', 'https://app.jntua.ac.in/uploads/Distinguished_Alumni_JNTA_05_12_2023_5225e49fc1.pdf'],
  ['bth-students-list', 'BTH Students List (PDF)', 'https://app.jntua.ac.in/uploads/BTH_Students_Year_vise_List_c36b0e5d71.pdf'],
];
await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);

for (const [key, label, src] of PDFS) {
  const ex = await DirectorateMenuItem.findOne({ directorateKey: DK, menuKey: key });
  if (!ex) { console.log('no menu item:', key); continue; }
  if ((ex.body || '').includes('href=')) { console.log('SKIP (already set):', key); continue; }
  const r = await fetch(src, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(180000) });
  if (!r.ok) { console.log('FAILED download', key, r.status); continue; }
  const tmp = path.join(os.tmpdir(), `dfaam_${Date.now()}.pdf`);
  fs.writeFileSync(tmp, Buffer.from(await r.arrayBuffer()));
  const { url } = await uploadToR2(tmp, 'foreign-affairs-alumni');
  fs.unlinkSync(tmp);
  ex.body = `<p><a href="${url}" target="_blank" rel="noopener noreferrer">${label}</a></p>`;
  ex.attachment1 = url;
  await ex.save();
  console.log('SET', key, '->', url);
}

const reg = await DirectorateMenuItem.findOne({ directorateKey: DK, menuKey: 'registrations' });
if (reg) {
  reg.type = 'link';
  reg.externalUrl = 'https://alumni.jntua.ac.in/register.php';
  await reg.save();
  console.log('SET registrations -> link to alumni.jntua.ac.in/register.php');
}
await mongoose.disconnect();
