import { useQuery } from '@tanstack/react-query';
import { evalApplicationFormsQuery } from '../api/queries.js';

// "Application Forms" page (Evaluation): S.No / Title / Download.
// The attachment is optional - a row without one shows a dash.
export default function EvalApplicationFormsTable() {
  const { data = [], isLoading } = useQuery(evalApplicationFormsQuery());
  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No forms yet.</p>;

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
          {data.map((d, i) => (
            <tr key={d._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
              <td className="px-4 py-3 text-slate-700">{d.title}</td>
              <td className="px-4 py-3 text-center">
                {d.attachment ? (
                  <a href={d.attachment} target="_blank" rel="noopener noreferrer" aria-label={`Download ${d.title}`}
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
  );
}
