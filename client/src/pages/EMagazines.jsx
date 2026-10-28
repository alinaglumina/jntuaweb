import PageShell from '../components/PageShell.jsx';
import { Loading, ErrorState, EmptyState } from '../components/AsyncState.jsx';
import { useEMagazines } from '../api/public.js';
import { usePagination } from '../hooks/usePagination.js';
import Pagination from '../components/ui/Pagination.jsx';

export default function EMagazines() {
  const { data = [], isLoading, isError, error } = useEMagazines();
  const pg = usePagination(data);
  return (
    <PageShell title="E-Magazines" subtitle="University newsletters and magazine issues.">
      {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : data.length === 0 ? (
        <EmptyState label="Issues will appear here." />
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy/5 text-navy">
              <tr><th className="px-4 py-3 w-16">S.No</th><th className="px-4 py-3">Month/Year</th><th className="px-4 py-3 w-24 text-center">View</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pg.rows.map((e, i) => (
                <tr key={e._id} className="hover:bg-navy/5">
                  <td className="px-4 py-3 text-slate-500">{String(pg.offset + i + 1).padStart(2, '0')}.</td>
                  <td className="px-4 py-3 font-medium">{e.monthYear}</td>
                  <td className="px-4 py-3 text-center">
                    {e.filename ? (
                      <a href={e.filename} target="_blank" rel="noopener noreferrer" aria-label={`View ${e.monthYear} issue`}
                         className="inline-grid h-8 w-8 place-items-center rounded bg-accent/10 text-accent hover:bg-accent hover:text-white">
                        <i className="fa-solid fa-book-open" aria-hidden="true" />
                      </a>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
      <div className="pb-3"><Pagination page={pg.page} total={pg.total} pageSize={pg.pageSize} onPage={pg.setPage} /></div>
        </div>
      )}
    </PageShell>
  );
}
