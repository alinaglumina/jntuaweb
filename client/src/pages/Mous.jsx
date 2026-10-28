import PageShell from '../components/PageShell.jsx';
import { Loading, ErrorState, EmptyState } from '../components/AsyncState.jsx';
import { useMous } from '../api/public.js';
import { usePagination } from '../hooks/usePagination.js';
import Pagination from '../components/ui/Pagination.jsx';

function MouTable({ title, rows }) {
  const pg = usePagination(rows);
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-navy">{title}</h2>
      <div className="overflow-hidden rounded-lg bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead className="bg-navy/5 text-navy">
            <tr><th className="px-4 py-3 w-16">S.No</th><th className="px-4 py-3">Date of MoU</th><th className="px-4 py-3">Name of the Organization</th><th className="px-4 py-3 w-28 text-center">Document</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {pg.rows.map((m, i) => (
              <tr key={m._id} className="hover:bg-navy/5">
                <td className="px-4 py-3 text-slate-500">{String(pg.offset + i + 1).padStart(2, '0')}.</td>
                <td className="px-4 py-3">{m.mouDate ? new Date(m.mouDate).toLocaleDateString('en-IN') : '—'}</td>
                <td className="px-4 py-3 font-medium">{m.orgName}</td>
                <td className="px-4 py-3 text-center">
                  {m.document ? (
                    <a href={m.document} target="_blank" rel="noopener noreferrer" aria-label={`Document for ${m.orgName}`}
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
    </section>
  );
}

export default function Mous() {
  const { data = [], isLoading, isError, error } = useMous();
  const national = data.filter((m) => m.mouType !== 'International');
  const international = data.filter((m) => m.mouType === 'International');
  return (
    <PageShell title="Tie-Ups & MOUs" subtitle="National and international collaborations.">
      {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : data.length === 0 ? (
        <EmptyState label="MOUs will be listed here." />
      ) : (
        <div className="space-y-10">
          {national.length > 0 && <MouTable title="National MoU’s" rows={national} />}
          {international.length > 0 && <MouTable title="International MoU’s" rows={international} />}
        </div>
      )}
    </PageShell>
  );
}
