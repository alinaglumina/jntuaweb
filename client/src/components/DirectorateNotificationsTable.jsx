import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { notificationsByDirectorateQuery } from '../api/queries.js';

// Embedded live table of a directorate's own notifications, shown on their
// own page (e.g. under "University Notifications" / "Notifications" tab) —
// so anything a director adds automatically reflects here.
export default function DirectorateNotificationsTable({ directorateKey }) {
  const { data = [], isLoading } = useQuery(notificationsByDirectorateQuery(directorateKey));

  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No notifications yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3 w-16">S.No</th>
            <th className="px-4 py-3 w-32">Date</th>
            <th className="px-4 py-3">Title</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.map((n, i) => (
            <tr key={n._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
              <td className="px-4 py-3 whitespace-nowrap text-slate-700">
                {(n.publishedAt || n.createdAt) ? new Date(n.publishedAt || n.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
              </td>
              <td className="px-4 py-3">
                <Link to={`/notifications/${n._id}`} className="font-medium text-ink hover:text-crimson hover:underline">{n.title}</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
