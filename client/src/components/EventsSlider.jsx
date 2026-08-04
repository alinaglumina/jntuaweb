import { useState } from 'react';

// TODO: replace with real data once an events API/hook exists
const EVENTS = [
  { name: 'Annual Tech Fest 2026', image: '/events/techfest.jpg' },
  { name: 'Convocation Ceremony', image: '/events/XIV Convocation.jpg' },
  { name: 'National Conference on AI & Robotics', image: '/events/conference.jpg' },
  { name: 'Sports Meet 2026', image: '/events/sportsmeet.jpg' },
];

export default function EventsSlider({ events = EVENTS }) {
  const [index, setIndex] = useState(0);
  const total = events.length;

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  if (total === 0) {
    return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No events to show yet.</p>;
  }

  const current = events[index];

  return (
    <div className="relative overflow-hidden rounded-lg shadow-card">
      <div className="relative h-64 w-full sm:h-72">
        <img src={current.image} alt={current.name} className="h-full w-full object-cover" />
        {/* Event name banner, overlaid on top of the slide */}
        <div className="absolute inset-x-0 top-0 bg-gradient-to-b from-black/70 to-transparent px-4 py-3">
          <h4 className="text-base font-semibold text-white drop-shadow sm:text-lg">{current.name}</h4>
        </div>
      </div>

      {/* Prev / Next arrows */}
      <button onClick={prev} aria-label="Previous event"
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
        <i className="fa-solid fa-chevron-left" aria-hidden="true" />
      </button>
      <button onClick={next} aria-label="Next event"
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60">
        <i className="fa-solid fa-chevron-right" aria-hidden="true" />
      </button>

      {/* Dot indicators */}
      <div className="absolute inset-x-0 bottom-2 flex justify-center gap-1.5">
        {events.map((_, i) => (
          <button key={i} onClick={() => setIndex(i)} aria-label={`Go to slide ${i + 1}`}
            className={`h-2 w-2 rounded-full transition-colors ${i === index ? 'bg-white' : 'bg-white/50'}`} />
        ))}
      </div>
    </div>
  );
}
