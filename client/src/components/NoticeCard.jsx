import { Link } from 'react-router-dom';
import { DIRECTORATE_ABBR } from '../content/directorateAbbr.js';
// One row of the notifications table: S.No / Date / "CODE-Title" (clickable,
// opens the full file table). sNo is 1-based index within the current list.
export default function NoticeCard({ id, title, date, directorateKey, sNo }) {
  const abbr = directorateKey && DIRECTORATE_ABBR[directorateKey];
  const displayTitle = abbr ? `${abbr}-${title}` : title;
  return (
    <tr className={sNo % 2 === 0 ? 'bg-navy/[0.02]' : 'bg-white'}>
      <td className="px-4 py-3 text-slate-500">{String(sNo).padStart(2, '0')}.</td>
      <td className="px-4 py-3 whitespace-nowrap text-slate-700">{date ? new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
      <td className="px-4 py-3">
        {id ? (
          <Link to={`/notifications/${id}`} className="text-sm font-medium text-ink hover:text-crimson hover:underline">{displayTitle}</Link>
        ) : (
          <p className="text-sm font-medium text-ink">{displayTitle}</p>
        )}
      </td>
    </tr>
  );
}
