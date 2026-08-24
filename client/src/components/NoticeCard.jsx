import Badge from './ui/Badge.jsx';
// Notification/notice row with category badge(s), date and optional attachment link(s).
const TONE = { exam: 'crimson', admission: 'gold', tenders: 'slate', news: 'navy', 'live-news': 'crimson', research: 'navy', placement: 'green', sports: 'gold' };
export default function NoticeCard({ title, category, date, href, attachments }) {
  const categories = Array.isArray(category) ? category : (category ? [category] : []);
  const files = Array.isArray(attachments) ? attachments : (href ? [href] : []);
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-navy/5">
      <div className="flex items-center gap-3">
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => <Badge key={c} tone={TONE[c] || 'navy'}>{c}</Badge>)}
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          {date && <p className="text-xs text-muted">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        </div>
      </div>
      {files.length > 0 && (
        <div className="flex shrink-0 gap-2">
          {files.map((f, i) => (
            <a key={i} href={f} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-crimson" aria-label={`View attachment ${i + 1}`}>
              <i className="fa-solid fa-file-pdf mr-1" aria-hidden="true" />{files.length > 1 ? `View ${i + 1}` : 'View'}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
