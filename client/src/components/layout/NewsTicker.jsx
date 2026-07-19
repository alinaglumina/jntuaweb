import { Link } from 'react-router-dom';
import { useNotifications } from '../../api/public.js';

// Scrolling "LIVE NEWS" ticker — shows the latest notifications in a
// continuously moving marquee, matching the legacy site's ribbon.
export default function NewsTicker() {
  const { data = [] } = useNotifications();
  const items = data.slice(0, 12);

  if (items.length === 0) return null;

  // Duplicate the list so the CSS animation loops seamlessly.
  const loopItems = [...items, ...items];

  return (
    <div className="overflow-hidden border-b border-gold/40 bg-gold/10">
      <div className="container flex items-center gap-3 py-1.5">
        <span className="flex shrink-0 items-center gap-1.5 rounded bg-crimson px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-white">
          <i className="fa-solid fa-tower-broadcast" aria-hidden="true" /> Live News
        </span>
        <div className="relative flex-1 overflow-hidden">
          <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
            {loopItems.map((n, i) => (
              <Link
                key={`${n._id}-${i}`}
                to={n.attachment || '/notifications'}
                className="text-xs font-medium text-navy hover:text-crimson"
              >
                {n.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        .ticker-track {
          animation: ticker-scroll 40s linear infinite;
        }
        .ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
