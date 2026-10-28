import 'dotenv/config';
import mongoose from 'mongoose';
import EMagazine from '../models/EMagazine.js';

const APPLY = process.argv.includes('--apply');
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const res = await fetch('https://app.jntua.ac.in/api/e-magazines?populate=*&sort=Date:desc&pagination[pageSize]=200', {
  headers: { 'User-Agent': 'Mozilla/5.0' },
});
if (!res.ok) throw new Error('Old API HTTP ' + res.status);
const items = (await res.json()).data.map((d) => d.attributes);

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const existing = await EMagazine.find({}).lean();
const haveLinks = new Set(existing.map((e) => (e.filename || '').trim()));
console.log(`Old API issues: ${items.length} | Already in DB: ${existing.length} | Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}`);

let added = 0, skipped = 0, nolink = 0;
for (const it of items) {
  const link = (it.Link || '').trim();
  const m = (it.Date || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) { console.log('SKIP (bad date):', it); skipped++; continue; }
  if (!link) { console.log('SKIP (no link):', it.Date); nolink++; continue; }
  if (haveLinks.has(link)) { console.log('SKIP (exists):', it.Date); skipped++; continue; }
  const monthYear = `${MONTHS[+m[2] - 1]} ${m[1]}`;
  const issueDate = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  console.log(`${APPLY ? 'ADD' : 'WOULD ADD'}: ${monthYear}  ${link}`);
  if (APPLY) await EMagazine.create({ directorateKey: '', monthYear, issueDate, filename: link });
  haveLinks.add(link);
  added++;
}
console.log(`\nDone. ${APPLY ? 'Added' : 'Would add'}: ${added} | Skipped: ${skipped} | No link: ${nolink}`);
await mongoose.disconnect();
