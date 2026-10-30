import 'dotenv/config';
import fs from 'fs';
import os from 'os';
import path from 'path';
import mongoose from 'mongoose';
import DirectorateMenuItem from '../models/DirectorateMenuItem.js';
import { uploadToR2 } from '../config/cloudflareR2.js';

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');
const DK = 'foreign-affairs-alumni';
const BASE = 'https://app.jntua.ac.in';
const HEAD = { 'User-Agent': 'Mozilla/5.0' };

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const plain = (h) => (h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const dmy = (d) => (d && /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(8, 10) + '-' + d.slice(5, 7) + '-' + d.slice(0, 4) : d || '');

async function all(p) {
  const out = [];
  for (let page = 1; ; page++) {
    const r = await fetch(`${BASE}/api${p}${p.includes('?') ? '&' : '?'}pagination[pageSize]=100&pagination[page]=${page}`, { headers: HEAD });
    if (!r.ok) throw new Error(`${p} HTTP ${r.status}`);
    const d = await r.json();
    out.push(...(Array.isArray(d.data) ? d.data : d.data ? [d.data] : []).map((x) => x.attributes));
    const pc = d.meta?.pagination?.pageCount;
    if (!pc || page >= pc) break;
  }
  return out;
}
const filesOf = (x) => {
  const f = x?.data;
  return (Array.isArray(f) ? f : f ? [f] : []).map((a) => a.attributes).filter((a) => a?.url)
    .map((a) => ({ url: a.url.startsWith('http') ? a.url : BASE + a.url, name: a.name || '' }));
};
async function up(url, sub) {
  if (!APPLY) return url;
  console.log('    copying', url.split('/').pop());
  const r = await fetch(url, { headers: HEAD, signal: AbortSignal.timeout(180000) });
  if (!r.ok) throw new Error(`file HTTP ${r.status}: ${url}`);
  const ext = (url.split('?')[0].match(/\.[a-z0-9]+$/i) || ['.pdf'])[0];
  const tmp = path.join(os.tmpdir(), `dfaam_${Date.now()}_${Math.random().toString(16).slice(2)}${ext}`);
  fs.writeFileSync(tmp, Buffer.from(await r.arrayBuffer()));
  const { url: out } = await Promise.race([uploadToR2(tmp, sub), new Promise((_, rej) => setTimeout(() => rej(new Error('R2 upload timeout')), 180000))]);
  fs.unlinkSync(tmp);
  return out;
}

// Strapi rich-text blocks -> HTML
const inline = (n) => {
  if (n.type === 'link') return `<a href="${esc(n.url)}" target="_blank" rel="noopener noreferrer">${(n.children || []).map(inline).join('')}</a>`;
  let t = esc(n.text);
  if (n.bold) t = `<strong>${t}</strong>`;
  if (n.italic) t = `<em>${t}</em>`;
  if (n.underline) t = `<u>${t}</u>`;
  return t;
};
const blocksHtml = (blocks) => (blocks || []).map((b) => {
  const kids = (b.children || []).map(inline).join('');
  if (b.type === 'heading') { const l = Math.min(Math.max(b.level || 3, 2), 4); return `<h${l}>${kids}</h${l}>`; }
  if (b.type === 'list') {
    const tag = b.format === 'ordered' ? 'ol' : 'ul';
    return `<${tag}>${(b.children || []).map((li) => `<li>${(li.children || []).map(inline).join('')}</li>`).join('')}</${tag}>`;
  }
  return plain(kids) ? `<p>${kids}</p>` : '';
}).join('');
const table = (head, rows, nw = []) => `<table><thead><tr>${['S.No', ...head].map((h) => `<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r, i) => `<tr><td style="white-space:nowrap">${String(i + 1).padStart(2, '0')}.</td>${r.map((c, j) => `<td${nw.includes(j) ? ' style="white-space:nowrap"' : ''}>${esc(c)}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
async function linkList(path_, sub) {
  const items = []; let files = 0;
  for (const rec of await all(path_)) for (const f of filesOf(rec.File)) {
    items.push(`<li><a href="${esc(await up(f.url, sub))}" target="_blank" rel="noopener noreferrer">${esc(rec.Title || f.name)}</a></li>`); files++;
  }
  return { html: `<ul>${items.join('')}</ul>`, files };
}

const SUB = 'foreign-affairs-alumni';
const TARGETS = [
  { key: 'sponsored-gold-medals-scholarships-donations', build: async () => ({ html: blocksHtml((await all('/dfaam-sponsored-gold-medal?populate=*'))[0]?.Body) }) },
  { key: 'emeritus', build: async () => {
      const f = filesOf((await all('/dfaam-emratuses?populate=*'))[0]?.File)[0];
      const url = await up(f.url, SUB);
      return { html: `<p><a href="${esc(url)}" target="_blank" rel="noopener noreferrer">Alumni – Emeritus (PDF)</a></p>`, attachment1: url, files: 1 };
  } },
  { key: 'mou-s-collaborations', build: async () => {
      const recs = (await all('/dfaam-international-mo-u-s?populate=*')).sort((a, b) => (b.Date || '').localeCompare(a.Date || ''));
      return { html: table(['Name of the Organization', 'Date', 'Purpose'], recs.map((r) => [r.Name, dmy(r.Date), r.Purpose]), [1]) };
  } },
  { key: 'list-of-foreign-students', build: async () => {
      const recs = await all('/list-of-foreign-students?populate=*&sort=createdAt:asc');
      return { html: table(['Name', 'Country', 'Course', 'Year of Admission', 'College'], recs.map((r) => [r.Name, r.Country, r.Course, r.Year_of_Admission, r.College]), [1, 2, 3]) };
  } },
  { key: '12-b-and-2-f-certificates', build: () => linkList('/dfaam-12-b-and-2-f-certificates?populate=*', SUB) },
  { key: 'newsletter', build: () => linkList('/dfaam-newsletters?populate=*&sort=createdAt:asc', SUB) },
  { key: 'notifications', create: true, label: 'Notifications', pos: (m) => (m['ugc-matters']?.sortOrder ?? 0) + 0.5,
    build: () => linkList('/dfaam-notifications-files?populate=*', SUB) },
  { key: 'gallery', create: true, label: 'Gallery', pos: (m) => (m['contact-us']?.sortOrder ?? 99) - 0.5, build: async () => {
      const imgs = [];
      for (const rec of await all('/dfaam-galleries?populate=*')) for (const f of filesOf(rec.Images)) {
        imgs.push(`<img src="${esc(await up(f.url, SUB + '/gallery'))}" alt="${esc(rec.Gallery_Title || 'Gallery')}" width="300">`);
      }
      return { html: `<p>${imgs.join(' ')}</p>`, files: imgs.length };
  } },
];

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const existing = await DirectorateMenuItem.find({ directorateKey: DK }).lean();
const byKey = Object.fromEntries(existing.map((i) => [i.menuKey, i]));
console.log(`Mode: ${APPLY ? 'APPLY' : 'DRY RUN'} | menu items in ${DK}: ${existing.length}\n`);

const ONLY = (process.argv.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
for (const t of TARGETS) {
  if (ONLY.length && !ONLY.includes(t.key)) continue;
  const ex = byKey[t.key];
  if (ex && plain(ex.body).length >= 200 && !FORCE) { console.log(`SKIP (already has content): ${t.key}`); continue; }
  if (!ex && !t.create) { console.log(`SKIP (no such menu item): ${t.key}`); continue; }
  let out;
  try { out = await t.build(); } catch (e) { console.log(`FAILED ${t.key}: ${e.message}`); continue; }
  console.log(`${APPLY ? 'WRITE' : 'WOULD WRITE'} ${ex ? 'update' : 'CREATE'} ${t.key}: files ${out.files ?? 0}, html ${out.html.length} chars${ex && plain(ex.body) ? ', replacing: "' + plain(ex.body).slice(0, 70) + '"' : ''}`);
  console.log('    ' + plain(out.html).slice(0, 150));
  if (!APPLY) continue;
  if (ex) {
    await DirectorateMenuItem.updateOne({ _id: ex._id }, { $set: { body: out.html, ...(out.attachment1 ? { attachment1: out.attachment1 } : {}) } });
  } else {
    await DirectorateMenuItem.create({ directorateKey: DK, menuKey: t.key, parentKey: byKey['contact-us']?.parentKey ?? null,
      label: t.label, type: 'page', body: out.html, sortOrder: t.pos(byKey), isActive: true });
  }
}
await mongoose.disconnect();
