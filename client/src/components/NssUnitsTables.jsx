import { useQuery } from '@tanstack/react-query';
import { nssUnitsQuery } from '../api/queries.js';

// NSS Cell "NSS Units under JNTUA": one table per district (in the order the
// districts first appear), each with S.No / Name of the College.
export default function NssUnitsTables() {
  const { data = [], isLoading } = useQuery(nssUnitsQuery());
  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No NSS units listed yet.</p>;

  const groups = [];
  data.forEach((r) => {
    let g = groups.find((x) => x.district === r.district);
    if (!g) { g = { district: r.district, rows: [] }; groups.push(g); }
    g.rows.push(r);
  });

  return (
    <div className="space-y-10">
      {groups.map((g) => (
        <section key={g.district}>
          <h3 className="mb-3 font-display text-xl font-semibold text-navy">{g.district}</h3>
          <div className="overflow-x-auto rounded-lg border border-line shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/5 text-navy">
                <tr>
                  <th className="px-4 py-3 w-16">S.No</th>
                  <th className="px-4 py-3">Name of the College</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {g.rows.map((r, i) => (
                  <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
                    <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
                    <td className="px-4 py-3 text-slate-700">{r.collegeName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
