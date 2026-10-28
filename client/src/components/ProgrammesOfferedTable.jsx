import { useMemo, useState } from 'react';
import { useProgrammesOffered } from '../api/public.js';
import { Loading, ErrorState, EmptyState } from './AsyncState.jsx';
import { usePagination } from '../hooks/usePagination.js';
import Pagination from './ui/Pagination.jsx';

const ORDER = ['JNTUA CEA', 'JNTUA CEP', 'JNTUA CEK', 'JNTUA OTPRI', 'JNTUA SMS', 'JNTUA Research Programs'];
const LEVELS = ['UG', 'PG', 'Ph.D.'];

function InstitutionTable({ rows }) {
  const pg = usePagination(rows);
  return (
    <div className="overflow-x-auto rounded-lg border border-line bg-white shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr><th className="px-4 py-3 w-16">S.No</th><th className="px-4 py-3">Department</th><th className="px-4 py-3">Programme</th><th className="px-4 py-3 w-24">Level</th></tr>
        </thead>
        <tbody className="divide-y divide-line">
          {pg.rows.map((r, i) => (
            <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 text-slate-500">{String(pg.offset + i + 1).padStart(2, '0')}.</td>
              <td className="px-4 py-3 text-slate-700">{r.department || '—'}</td>
              <td className="px-4 py-3 font-medium">{r.programme}</td>
              <td className="px-4 py-3 text-slate-600">{r.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pb-3"><Pagination page={pg.page} total={pg.total} pageSize={pg.pageSize} onPage={pg.setPage} /></div>
    </div>
  );
}

// Programmes Offered: one tab per institution, a table of its programmes.
export default function ProgrammesOfferedTable() {
  const { data = [], isLoading, isError, error } = useProgrammesOffered();
  const [active, setActive] = useState(null);
  const institutions = useMemo(() => {
    const list = [...new Set(data.map((d) => d.institution))];
    return list.sort((a, b) => {
      const ia = ORDER.indexOf(a), ib = ORDER.indexOf(b);
      return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib) || a.localeCompare(b);
    });
  }, [data]);
  const current = active && institutions.includes(active) ? active : institutions[0];
  const rows = useMemo(() => data
    .filter((d) => d.institution === current)
    .sort((a, b) => (a.department || '').localeCompare(b.department || '')
      || LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)
      || a.programme.localeCompare(b.programme)), [data, current]);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorState error={error} />;
  if (data.length === 0) return <EmptyState label="Programmes will be listed here." />;
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Institution">
        {institutions.map((inst) => (
          <button key={inst} type="button" role="tab" aria-selected={inst === current} onClick={() => setActive(inst)}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${inst === current ? 'border-accent bg-accent text-white' : 'border-line text-slate-700 hover:bg-slate-100'}`}>
            {inst}
          </button>
        ))}
      </div>
      <InstitutionTable key={current} rows={rows} />
    </div>
  );
}
