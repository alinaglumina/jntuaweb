import 'dotenv/config';
import mongoose from 'mongoose';
import DirectorateMenuItem from '../models/DirectorateMenuItem.js';
import NewsletterIssue from '../models/NewsletterIssue.js';
import Notification from '../models/Notification.js';

const APPLY = process.argv.includes('--apply');
const DK = 'foreign-affairs-alumni';
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const anchors = (html) => [...(html || '').matchAll(/<a href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => ({ url: unesc(m[1]), title: unesc(m[2]).trim() }));
const extOf = (u) => (u.split('?')[0].match(/\.[a-z0-9]+$/i) || ['.pdf'])[0];

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const bodyOf = async (k) => (await DirectorateMenuItem.findOne({ directorateKey: DK, menuKey: k }).lean())?.body || '';
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'}\n`);

// ---- Newsletter -> NewsletterIssue
const haveNl = new Set((await NewsletterIssue.find({ directorateKey: DK }).lean()).map((x) => x.title));
const nl = anchors(await bodyOf('newsletter'));
console.log(`Newsletter links found in page body: ${nl.length}`);
for (const [i, a] of nl.entries()) {
  if (haveNl.has(a.title)) { console.log('  SKIP (exists):', a.title); continue; }
  console.log(`  ${APPLY ? 'ADD' : 'WOULD ADD'} newsletter: ${a.title}`);
  if (APPLY) await NewsletterIssue.create({ directorateKey: DK, title: a.title, attachment: a.url, sortOrder: i, isActive: true });
}

// ---- Notifications -> Notification (dates from the old API)
const old = await (await fetch('https://app.jntua.ac.in/api/dfaam-notifications-files?populate=*', { headers: { 'User-Agent': 'Mozilla/5.0' } })).json();
const dateBy = Object.fromEntries((old.data || []).map((d) => [(d.attributes.Title || '').trim(), d.attributes.publishedAt || d.attributes.createdAt]));
const haveN = new Set((await Notification.find({ directorateKey: DK }).lean()).map((x) => x.title));
const nt = anchors(await bodyOf('notifications'));
console.log(`\nNotification links found in page body: ${nt.length}`);
for (const a of nt) {
  if (haveN.has(a.title)) { console.log('  SKIP (exists):', a.title); continue; }
  const publishedAt = dateBy[a.title] ? new Date(dateBy[a.title]) : new Date();
  console.log(`  ${APPLY ? 'ADD' : 'WOULD ADD'} notification: [${publishedAt.toISOString().slice(0, 10)}] ${a.title}`);
  if (APPLY) await Notification.create({ directorateKey: DK, title: a.title, publishedAt, category: ['news'], attachments: [a.url], attachmentsNames: [a.title + extOf(a.url)], isActive: true });
}
await mongoose.disconnect();
