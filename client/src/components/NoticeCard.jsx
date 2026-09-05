import Badge from './ui/Badge.jsx';
import { Link } from 'react-router-dom';
// Notification/notice row with category badge(s) and date. Attachments are
// hidden here — clicking the title opens the full file table instead of
// showing "View" links inline in the list.
const TONE = { exam: 'crimson', admission: 'gold', tenders: 'slate', news: 'navy', 'live-news': 'crimson', research: 'navy', placement: 'green', sports: 'gold' };
export default function NoticeCard({ id, title, category, date }) {
  const categories = Array.isArray(category) ? category : (category ? [category] : []);
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-navy/5">
      <div className="flex items-center gap-3">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => <Badge key={c} tone={TONE[c] || 'navy'}>{c}</Badge>)}
          </div>
        )}
        <div>
          {id ? (
            <Link to={`/notifications/${id}`} className="text-sm font-medium text-ink hover:text-crimson hover:underline">{title}</Link>
          ) : (
            <p className="text-sm font-medium text-ink">{title}</p>
          )}
          {date && <p className="text-xs text-muted">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        </div>
      </div>
    </div>
  );
}
