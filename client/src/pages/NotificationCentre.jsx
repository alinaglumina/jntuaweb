import { useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { NoticeCard, Card, SkeletonList, ErrorState, EmptyState } from '../components/index.js';
import { useNotificationsPage } from '../api/public.js';
import { DIRECTORATE_ABBR } from '../content/directorateAbbr.js';

const PAGE_SIZE = 25;
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

// 1 … 4 5 6 … 20 style page list.
function pageList(current, last) {
  const set = new Set([1, last, current - 1, current, current + 1]);
  const nums = [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
  const out = [];
  nums.forEach((n, i) => { if (i && n - nums[i - 1] > 1) out.push('…'); out.push(n); });
  return out;
}

function Pager({ page, pages, onGo }) {
  if (pages <= 1) return null;
  const btn = 'min-w-9 rounded-md px-3 py-1.5 text-sm font-semibold transition';
  const idle = 'bg-surface text-brand hover:bg-navy/5';
  return (
    <nav aria-label="Pagination" className="mt-4 flex flex-wrap items-center justify-center gap-1">
      <button type="button" disabled={page <= 1} onClick={() => onGo(page - 1)} className={`${btn} ${idle} disabled:cursor-not-allowed disabled:opacity-40`}>Previous</button>
      {pageList(page, pages).map((p, i) => (p === '…'
        ? <span key={`gap-${i}`} className="px-1 text-slate-400">…</span>
        : <button key={p} type="button" onClick={() => onGo(p)} aria-current={p === page ? 'page' : undefined} className={`${btn} ${p === page ? 'bg-navy text-white' : idle}`}>{p}</button>))}
      <button type="button" disabled={page >= pages} onClick={() => onGo(page + 1)} className={`${btn} ${idle} disabled:cursor-not-allowed disabled:opacity-40`}>Next</button>
    </nav>
  );
}

export default function NotificationCentre() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawDir = searchParams.get('dir');
  const dir = rawDir && DIRECTORATE_ABBR[rawDir] ? rawDir : null;   // ignore unknown values
  const pageParam = parseInt(searchParams.get('page'), 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  // No directorate picked = Latest News; otherwise all of that directorate's notifications.
  const filters = dir ? { directorateKey: dir } : { category: 'news' };
  const { data, isLoading, isError, error, isPlaceholderData } = useNotificationsPage({ ...filters, page, limit: PAGE_SIZE });

  const items = data?.items || [];
  const total = data?.total || 0;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const first = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const last = Math.min(page * PAGE_SIZE, total);

  const goTo = (p, replace = false) => {
    const next = new URLSearchParams(searchParams);
    if (p > 1) next.set('page', String(p)); else next.delete('page');
    setSearchParams(next, { replace });
  };

  // If the URL asks for a page past the end (e.g. edited by hand), jump to the last page.
  useEffect(() => { if (data && page > pages) goTo(pages, true); }, [data, page, pages]);   // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [page, dir]);

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
          <Card><div className={`overflow-x-auto transition-opacity ${isPlaceholderData ? 'opacity-60' : ''}`}>
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/5 text-navy">
                <tr>
                  <th className="px-4 py-3 w-16">S.No</th>
                  <th className="px-4 py-3 w-32">Date</th>
                  <th className="px-4 py-3">Notification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((n, i) => <NoticeCard key={n._id} id={n._id} title={n.title} date={n.publishedAt || n.createdAt} directorateKey={n.directorateKey} sNo={(page - 1) * PAGE_SIZE + i + 1} />)}
              </tbody>
            </table>
          </div></Card>
          <p className="mt-3 text-center text-xs text-muted">Showing {first}–{last} of {total}</p>
          <Pager page={page} pages={pages} onGo={goTo} />
        </>
      )}
    </PageShell>
  );
}
