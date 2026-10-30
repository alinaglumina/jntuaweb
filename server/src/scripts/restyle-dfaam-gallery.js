import 'dotenv/config';
import mongoose from 'mongoose';
import DirectorateMenuItem from '../models/DirectorateMenuItem.js';

const DK = 'foreign-affairs-alumni';
const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = (s) => s.replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI);
const g = await DirectorateMenuItem.findOne({ directorateKey: DK, menuKey: 'gallery' });
if (!g) throw new Error('gallery menu item not found');

const imgs = [...(g.body || '').matchAll(/<img[^>]*?src="([^"]+)"[^>]*?alt="([^"]*)"/g)].map((m) => ({ src: unesc(m[1]), alt: unesc(m[2]) }));
console.log('images found in current body:', imgs.length);
if (!imgs.length) throw new Error('no images found, nothing to rebuild');

// group consecutive images that share a title
const groups = [];
for (const im of imgs) {
  const last = groups[groups.length - 1];
  if (last && last.title === im.alt) last.items.push(im); else groups.push({ title: im.alt || 'Gallery', items: [im] });
}
g.body = groups.map((gr) =>
  `<h3>${esc(gr.title)}</h3><div class="photo-grid">${gr.items.map((im) =>
    `<a href="${esc(im.src)}" target="_blank" rel="noopener noreferrer"><img src="${esc(im.src)}" alt="${esc(gr.title)}" loading="lazy"></a>`).join('')}</div>`
).join('');
await g.save();
console.log('groups:', groups.map((x) => `${x.title} (${x.items.length})`).join(' | '));
await mongoose.disconnect();
