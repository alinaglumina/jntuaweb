import { useQuery } from '@tanstack/react-query';
import { coursesByProgrammeQuery } from '../api/queries.js';

// Renders a Courses Offered sub-table (UG / PG / Integrated Dual Degree):
// S.No, Degree, Course/Specialization, Category, Duration, Course Type.
export default function ProgrammesTable({ programmeType }) {
  const { data = [], isLoading } = useQuery(coursesByProgrammeQuery(programmeType));

  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No programmes listed yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3 w-16">S.No</th>
            <th className="px-4 py-3">Degree</th>
            <th className="px-4 py-3">Course/Specialization</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Duration</th>
            <th className="px-4 py-3">Course Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.map((c, i) => (
            <tr key={c._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
              <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
              <td className="px-4 py-3 font-medium text-slate-800">{c.degree || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{c.name}</td>
              <td className="px-4 py-3 text-slate-700">{c.category || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{c.duration || '—'}</td>
              <td className="px-4 py-3 text-slate-700">{c.courseType || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
