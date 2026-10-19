import { useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { NoticeCard, Card, SkeletonList, ErrorState, EmptyState, Spinner } from '../components/index.js';
import { useInfiniteNotifications } from '../api/public.js';
import { DIRECTORATE_ABBR } from '../content/directorateAbbr.js';

const DIRECTORATES = Object.entries(DIRECTORATE_ABBR);   // [slug, short code]

// Left sidebar: one "<CODE> Notifications" link per directorate.
function NotificationSidebar({ activeDir }) {
  return (
    <nav aria-label="Notification Center" className="overflow-hidden rounded-lg border border-line bg-white shadow-card">
      <h3 className="bg-crimson px-4 py-3 font-display text-lg font-bold text-white">Notification Center</h3>
      <ul className="py-1">
        {DIRECTORATES.map(([slug, code]) => (
          <li key={slug}>
            <Link to={`/notifications?dir=${slug}`} aria-current={activeDir === slug ? 'page' : undefined} className={`block px-4 py-2 text-sm transition ${activeDir === slug ? 'bg-navy/5 font-semibold text-crimson' : 'text-slate-700 hover:bg-navy/5 hover:text-navy'}`}>{code} Notifications</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

export default function NotificationCentre() {
  const [searchParams] = useSearchParams();
  const rawDir = searchParams.get('dir');
  const dir = rawDir && DIRECTORATE_ABBR[rawDir] ? rawDir : null;   // ignore unknown values
  // No directorate picked = Latest News; otherwise all of that directorate's notifications.
  const filters = dir ? { directorateKey: dir } : { category: 'news' };
  const { data, isLoading, isError, error, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteNotifications(filters);

  // IntersectionObserver sentinel: load the next page when it scrolls into view.
  const sentinel = useRef(null);
  const onIntersect = useCallback((entries) => {
    if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  useEffect(() => {
    const el = sentinel.current; if (!el) return;
    const obs = new IntersectionObserver(onIntersect, { rootMargin: '200px' });
    obs.observe(el); return () => obs.disconnect();
  }, [onIntersect]);

  const items = data?.pages.flatMap((p) => p.items || []) || [];

  return (
    <PageShell title="Notification Centre" subtitle="University news, notices and announcements." sidebar={<NotificationSidebar activeDir={dir} />}>
      <div className="mb-6 flex flex-wrap gap-2">
        <Link to="/notifications" className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${!dir ? 'bg-navy text-white' : 'bg-surface text-brand hover:bg-navy/5'}`}>Latest News</Link>
      </div>
      {dir && <h2 className="mb-3 font-display text-xl font-semibold text-navy">{DIRECTORATE_ABBR[dir]} Notifications</h2>}

      {isLoading ? <SkeletonList items={8} /> : isError ? <ErrorState error={error} /> : items.length === 0 ? (
        <EmptyState label={dir ? 'No notifications from this directorate yet.' : 'No news yet.'} icon="fa-bell" />
      ) : (
        <>
          <Card><div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/5 text-navy">
                <tr>
                  <th className="px-4 py-3 w-16">S.No</th>
                  <th className="px-4 py-3 w-32">Date</th>
                  <th className="px-4 py-3">Notification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((n, i) => <NoticeCard key={n._id} id={n._id} title={n.title} date={n.publishedAt || n.createdAt} directorateKey={n.directorateKey} sNo={i + 1} />)}
              </tbody>
            </table>
          </div></Card>
          {/* Infinite-scroll sentinel */}
          <div ref={sentinel} className="grid place-items-center py-6">
            {isFetchingNextPage ? <Spinner /> : hasNextPage ? <span className="text-xs text-muted">Scroll for more…</span> : <span className="text-xs text-muted">— End —</span>}
          </div>
        </>
      )}
    </PageShell>
  );
}
