import { Link } from 'react-router-dom';
import { DIRECTORATE_PREFIX } from '../content/directorateAbbr.js';
// Notification/notice row: directorate prefix, date, and title (in that
// order). Attachments are hidden here — clicking the title opens the full
// file table instead of showing "View" links inline in the list.
export default function NoticeCard({ id, title, date, directorateKey }) {
  const prefix = directorateKey && DIRECTORATE_PREFIX[directorateKey];
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-navy/5">
      <div className="flex items-center gap-3">
        <div>
          {prefix && <p className="text-xs font-semibold text-crimson">{prefix}</p>}
          {date && <p className="text-xs text-muted">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
          {id ? (
            <Link to={`/notifications/${id}`} className="text-sm font-medium text-ink hover:text-crimson hover:underline">{title}</Link>
          ) : (
            <p className="text-sm font-medium text-ink">{title}</p>
          )}
        </div>
      </div>
    </div>
  );
}
