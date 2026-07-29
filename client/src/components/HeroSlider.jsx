import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Reusable auto-advancing hero carousel. slides: [{ image?, title }].
export default function HeroSlider({ slides = [], interval = 6000, height = 'min-h-[480px]' }) {
  const items = slides.length ? slides : [{ _id: 'd', title: 'Welcome to JNTUA' }];
  const [i, setI] = useState(0);
  const go = useCallback((d) => setI((p) => (p + d + items.length) % items.length), [items.length]);
  useEffect(() => { if (items.length < 2) return; const t = setInterval(() => go(1), interval); return () => clearInterval(t); }, [go, interval, items.length]);
  const s = items[i % items.length];
  return (
    <section className="relative overflow-hidden bg-white text-navy">
      {s.image && <img src={s.image} alt="" className="absolute inset-0 h-full w-full object-cover" />}
      <div className={`container relative grid ${height} items-end justify-center pt-8 pb-20`}>
        <AnimatePresence mode="wait">
          <motion.div key={s._id || i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="max-w-2xl rounded-2xl bg-white/85 px-8 py-6 text-center shadow-lift backdrop-blur-sm">
            <h2 className="font-display text-3xl font-bold text-navy md:text-5xl">{s.title}</h2>
          </motion.div>
        </AnimatePresence>
      </div>
      {items.length > 1 && (
        <>
          <button onClick={() => go(-1)} aria-label="Previous" className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-navy/10 px-3 py-2 text-navy hover:bg-navy/20">‹</button>
          <button onClick={() => go(1)} aria-label="Next" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-navy/10 px-3 py-2 text-navy hover:bg-navy/20">›</button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {items.map((_, k) => <button key={k} onClick={() => setI(k)} aria-label={`Slide ${k + 1}`} className={`h-2 w-2 rounded-full ${k === i % items.length ? 'bg-gold' : 'bg-navy/20'}`} />)}
          </div>
        </>
      )}
    </section>
  );
}
