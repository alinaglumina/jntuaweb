import { useQuery } from '@tanstack/react-query';
import { curriculumByLevelQuery } from '../api/queries.js';

// Curriculum & Syllabus (UG or PG): one section per course, with the course
// name as a heading and a table of its regulation-year batches below —
// S.No, Regulation Year, Regulations, Course Structure, Syllabus.
export default function CurriculumTable({ level }) {
  const { data = [], isLoading } = useQuery(curriculumByLevelQuery(level));

  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No curriculum entries listed yet.</p>;

  const groups = {};
  data.forEach((it) => { (groups[it.courseName] ||= []).push(it); });
  const courseNames = Object.keys(groups);

  const fileLink = (url, label) => url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={label}
       className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
      <i className="fa-solid fa-file-pdf" aria-hidden="true" />
    </a>
  ) : <span className="text-slate-300">—</span>;

  return (
    <div className="space-y-8">
      {courseNames.map((courseName) => (
        <div key={courseName}>
          <h3 className="mb-3 font-display text-xl font-semibold text-navy">{courseName}</h3>
          <div className="overflow-x-auto rounded-lg border border-line shadow-card">
            <table className="w-full text-left text-sm">
              <thead className="bg-navy/5 text-navy">
                <tr>
                  <th className="px-4 py-3 w-16">S.No</th>
                  <th className="px-4 py-3">Regulation Year</th>
                  <th className="px-4 py-3 w-28 text-center">Regulations</th>
                  <th className="px-4 py-3 w-40 text-center">Course Structure and Syllabus</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {groups[courseName].map((row, i) => (
                  <tr key={row._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
                    <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
                    <td className="px-4 py-3 text-slate-700">{row.regulationYear || '—'}</td>
                    <td className="px-4 py-3 text-center">{fileLink(row.regulations, `Regulations for ${courseName}`)}</td>
                    <td className="px-4 py-3 text-center">{fileLink(row.courseStructureAndSyllabus, `Course Structure and Syllabus for ${courseName}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
