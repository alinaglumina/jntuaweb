import Badge from './ui/Badge.jsx';
// Notification/notice row with category badge, date and optional attachment.
const TONE = { exam: 'crimson', admission: 'gold', tenders: 'slate', news: 'navy', research: 'navy', placement: 'green', sports: 'gold' };
export default function NoticeCard({ title, category, date, href }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3 hover:bg-navy/5">
      <div className="flex items-center gap-3">
        {category && <Badge tone={TONE[category] || 'navy'}>{category}</Badge>}
        <div>
          <p className="text-sm font-medium text-ink">{title}</p>
          {date && <p className="text-xs text-muted">{new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        </div>
      </div>
      {href && <a href={href} target="_blank" rel="noopener noreferrer" className="shrink-0 text-xs font-semibold text-crimson"><i className="fa-solid fa-file-pdf mr-1" aria-hidden="true" />View</a>}
    </div>
  );
}
