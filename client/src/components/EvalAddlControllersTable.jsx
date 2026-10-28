import { useQuery } from '@tanstack/react-query';
import { evalAddlControllersQuery } from '../api/queries.js';
import { usePagination } from '../hooks/usePagination.js';
import Pagination from './ui/Pagination.jsx';

// Evaluation > Officers > "Additional Controller of Examinations": S.No / Name / Designation.
export default function EvalAddlControllersTable() {
  const { data = [], isLoading } = useQuery(evalAddlControllersQuery());
  const pg = usePagination(data);
  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Details will be published soon.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3 w-16">S.No</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Designation</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {pg.rows.map((d, i) => (
            <tr key={d._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 text-slate-500">{String(pg.offset + i + 1).padStart(2, '0')}.</td>
              <td className="px-4 py-3 font-medium text-slate-700">{d.name}</td>
              <td className="px-4 py-3 text-slate-700">{d.designation || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pb-3"><Pagination page={pg.page} total={pg.total} pageSize={pg.pageSize} onPage={pg.setPage} /></div>
    </div>
  );
}
