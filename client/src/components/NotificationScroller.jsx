import NoticeCard from './NoticeCard.jsx';

const MAX_ROWS = 20;         // latest N notifications go into the scroller
const VISIBLE_ROWS = 8;      // rows visible at once; this many or fewer = no scrolling
const ROW_PX = 45;           // approximate height of one row
const SECONDS_PER_ROW = 3;   // scroll speed: higher = slower

// Notifications table that scrolls upward continuously inside a fixed window.
// The header row stays put; the body rows are duplicated so the loop is seamless.
export default function NotificationScroller({ items }) {
  const list = items.slice(0, MAX_ROWS);
  const scrolls = list.length > VISIBLE_ROWS;

  const cols = (
    <colgroup>
      <col style={{ width: '4rem' }} />
      <col style={{ width: '8rem' }} />
      <col />
    </colgroup>
  );
  const rows = (suffix) => list.map((n, i) => (
    <NoticeCard key={`${n._id}${suffix}`} id={n._id} title={n.title} date={n.publishedAt || n.createdAt} directorateKey={n.directorateKey} sNo={i + 1} />
  ));

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-card">
      <table className="w-full table-fixed text-left text-sm">
        {cols}
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3">S.No</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Notification</th>
          </tr>
        </thead>
      </table>
      <div className={scrolls ? 'notif-viewport' : ''} style={scrolls ? { height: VISIBLE_ROWS * ROW_PX } : undefined}>
        <table
          className={`w-full table-fixed text-left text-sm ${scrolls ? 'notif-scroll' : ''}`}
          style={scrolls ? { animationDuration: `${list.length * SECONDS_PER_ROW}s` } : undefined}
        >
          {cols}
          <tbody className="divide-y divide-slate-100">{rows('')}</tbody>
          {scrolls && <tbody className="notif-dup divide-y divide-slate-100" aria-hidden="true">{rows('-dup')}</tbody>}
        </table>
      </div>
      <style>{`
        .notif-viewport { overflow: hidden; }
        .notif-scroll { animation: notif-scroll 40s linear infinite; }
        .notif-viewport:hover .notif-scroll,
        .notif-viewport:focus-within .notif-scroll { animation-play-state: paused; }
        @keyframes notif-scroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }
        @media (prefers-reduced-motion: reduce) {
          .notif-scroll { animation: none; }
          .notif-dup { display: none; }
          .notif-viewport { overflow-y: auto; }
        }
      `}</style>
    </div>
  );
}
