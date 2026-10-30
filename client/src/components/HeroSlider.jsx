import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Reusable auto-advancing hero carousel. slides: [{ image?, title }].
// Heading renders as a full-width bar flush at the bottom of the slide,
// styled like the site's top ribbon (slim, dark bar, full width).
export default function HeroSlider({ slides = [], interval = 6000, height = 'min-h-[624px]' }) {
  const items = slides.length ? slides : [{ _id: 'd', title: 'Welcome to JNTUA' }];
  const [i, setI] = useState(0);
  const go = useCallback((d) => setI((p) => (p + d + items.length) % items.length), [items.length]);
  useEffect(() => { if (items.length < 2) return; const t = setInterval(() => go(1), interval); return () => clearInterval(t); }, [go, interval, items.length]);
  const s = items[i % items.length];
  return (
    <section className={`relative overflow-hidden bg-white text-navy ${height}`}>
      <AnimatePresence mode="sync">
        {s.image && (
          <motion.img key={s._id || i} src={s.image} alt=""
            initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            style={{ filter: 'brightness(1.1) contrast(1.08) saturate(1.15)' }}
            className="absolute inset-0 h-full w-full object-cover" />
        )}
      </AnimatePresence>


      {items.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-navy shadow-md transition hover:bg-white">‹</button>
          <button onClick={() => go(1)} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/85 px-3 py-2 text-navy shadow-md transition hover:bg-white">›</button>
        </>
      )}

      {/* Full-width heading bar flush at the bottom, matching the top ribbon's style */}
      <div className="absolute inset-x-0 bottom-0 border-t-2 border-gold bg-white text-navy">
        <div className="container relative flex items-center justify-center py-2.5">
          <AnimatePresence mode="wait">
            <motion.h2 key={s._id || i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="text-center font-display text-sm font-semibold text-navy md:text-base">
              {s.title}
            </motion.h2>
          </AnimatePresence>
          {items.length > 1 && (
            <div className="absolute right-0 flex shrink-0 gap-2">
              {items.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 w-2 rounded-full ${k === i % items.length ? 'bg-gold' : 'bg-navy/20'}`} />)}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
