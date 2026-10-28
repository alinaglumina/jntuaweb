import { useQuery } from '@tanstack/react-query';
import { iqacSsrMinutesQuery } from '../api/queries.js';
import { usePagination } from '../hooks/usePagination.js';
import Pagination from './ui/Pagination.jsx';

// "SSR / Minutes" page (IQAC): S.No / Title / Download.
// The attachment is optional - a row without one shows a dash.
export default function IqacSsrMinutesTable() {
  const { data = [], isLoading } = useQuery(iqacSsrMinutesQuery());
  const pg = usePagination(data);
  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No documents yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3 w-16">S.No</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3 w-28 text-center">Download</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {pg.rows.map((d, i) => (
            <tr key={d._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 text-slate-500">{String(pg.offset + i + 1).padStart(2, '0')}.</td>
              <td className="px-4 py-3 text-slate-700">{d.title}</td>
              <td className="px-4 py-3 text-center">
                {d.attachment ? (
                  <a href={d.attachment} target="_blank" rel="noopener noreferrer" aria-label={`Download ${d.title}`}
                     className="inline-grid h-8 w-8 place-items-center rounded bg-accent/10 text-accent hover:bg-accent hover:text-white">
                    <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                  </a>
                ) : <span className="text-slate-300">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pb-3"><Pagination page={pg.page} total={pg.total} pageSize={pg.pageSize} onPage={pg.setPage} /></div>
    </div>
  );
}
