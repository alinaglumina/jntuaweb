import { useQuery } from '@tanstack/react-query';
import { academicMousQuery } from '../api/queries.js';

// "Mou's List" page (Academic & Planning): four tables, one per category.
const TABLES = [
  ['national-mou', "National MoU's"],
  ['international-mou', "International MoU's"],
  ['national-company', 'National Companies List'],
  ['international-company', 'International Companies List'],
];

export default function AcademicMousTables() {
  const { data = [], isLoading } = useQuery(academicMousQuery());
  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;

  return (
    <div className="space-y-10">
      {TABLES.map(([key, title]) => {
        const rows = data.filter((r) => r.category === key);
        return (
          <section key={key}>
            <h3 className="mb-3 font-display text-xl font-semibold text-navy">{title}</h3>
            {rows.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">No entries yet.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-line shadow-card">
                <table className="w-full text-left text-sm">
                  <thead className="bg-navy/5 text-navy">
                    <tr>
                      <th className="px-4 py-3 w-16">S.No</th>
                      <th className="px-4 py-3">Name of the Organization</th>
                      <th className="px-4 py-3 w-44">MoU Starting Date</th>
                      <th className="px-4 py-3 w-44">Period of MoU (Years)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {rows.map((r, i) => (
                      <tr key={r._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
                        <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
                        <td className="px-4 py-3 font-medium text-slate-800">{r.orgName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-slate-700">{r.startDate ? new Date(r.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</td>
                        <td className="px-4 py-3 text-slate-700">{r.period || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
