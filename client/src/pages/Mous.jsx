import PageShell from '../components/PageShell.jsx';
import { Loading, ErrorState, EmptyState } from '../components/AsyncState.jsx';
import { useMous } from '../api/public.js';

export default function Mous() {
  const { data = [], isLoading, isError, error } = useMous();
  return (
    <PageShell title="Tie-Ups & MOUs" subtitle="National and international collaborations.">
      {isLoading ? <Loading /> : isError ? <ErrorState error={error} /> : data.length === 0 ? (
        <EmptyState label="MOUs will be listed here." />
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-navy/5 text-navy">
              <tr><th className="px-4 py-3 w-16">S.No</th><th className="px-4 py-3">Date of MoU</th><th className="px-4 py-3">Name of the Organization</th><th className="px-4 py-3 w-28 text-center">Document</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map((m, i) => (
                <tr key={m._id} className="hover:bg-navy/5">
                  <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
                  <td className="px-4 py-3">{m.mouDate ? new Date(m.mouDate).toLocaleDateString('en-IN') : '—'}</td>
                  <td className="px-4 py-3 font-medium">{m.orgName}</td>
                  <td className="px-4 py-3 text-center">
                    {m.document ? (
                      <a href={m.document} target="_blank" rel="noopener noreferrer" aria-label={`Document for ${m.orgName}`}
                         className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
                        <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                      </a>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
