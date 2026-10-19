import { Link } from 'react-router-dom';
import { useNotifications } from '../../api/public.js';
const MAX_ITEMS = 15;
const NEW_DAYS = 14;   // items published within this many days get a NEW badge
const isNew = (n) => (Date.now() - new Date(n.publishedAt || n.createdAt).getTime()) <= NEW_DAYS * 24 * 60 * 60 * 1000;
// Scrolling "LIVE NEWS" ticker — pulls from Notifications tagged with the
// "live-news" category, sorted by most recent, into a continuously moving marquee.
export default function NewsTicker() {
  const { data: items = [] } = useNotifications('live-news');
  const merged = [...items]
    .sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt))
    .slice(0, MAX_ITEMS);
  const loopItems = merged.length > 0 ? [...merged, ...merged] : [];
  return (
    <div className="overflow-hidden border-b border-gold/40 bg-gold/10">
      <div className="container flex items-center gap-3 py-1.5">
        <span className="flex shrink-0 items-center gap-1.5 rounded bg-gold px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-navy">
          <i className="fa-solid fa-tower-broadcast" aria-hidden="true" /> Live News
        </span>
        <div className="relative flex-1 overflow-hidden">
          {merged.length === 0 ? (
            <span className="text-xs font-medium text-slate-500">No live updates at the moment.</span>
          ) : (
            <div className="ticker-track flex w-max gap-10 whitespace-nowrap">
              {loopItems.map((n, i) => (
                <Link
                  key={`${n._id}-${i}`}
                  to={`/notifications/${n._id}`}
                  className="text-sm font-medium text-navy hover:text-crimson"
                >
                  <span className="mr-1.5 font-semibold text-slate-500">{(i % merged.length) + 1}.</span>{isNew(n) && <span className="mr-2 inline-block animate-pulse rounded bg-crimson px-1.5 py-0.5 align-middle text-[10px] font-bold uppercase tracking-wide text-white">New</span>}{n.title}
                </Link>
              ))}
            </div>
          )}
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
