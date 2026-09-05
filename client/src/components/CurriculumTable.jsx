import { useState, Fragment } from 'react';
import { useQuery } from '@tanstack/react-query';
import { curriculumByLevelQuery, curriculumFilesQuery } from '../api/queries.js';

// Nested sub-table shown when "View" is clicked: S.No / Branch / Download,
// for the specific (courseName, level, regulationYear) combination.
function BranchFilesTable({ courseName, level, regulationYear }) {
  const { data = [], isLoading } = useQuery(curriculumFilesQuery(courseName, level, regulationYear));

  if (isLoading) return <div className="skeleton h-24 w-full rounded-lg" />;
  if (data.length === 0) return <p className="p-4 text-sm text-slate-500">No branch files listed yet.</p>;

  return (
    <table className="w-full text-left text-sm">
      <thead className="bg-navy/[0.03] text-navy">
        <tr>
          <th className="px-4 py-2 w-16">S.No</th>
          <th className="px-4 py-2">Branch/Specialization</th>
          <th className="px-4 py-2 w-28 text-center">Download</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-line">
        {data.map((f, i) => (
          <tr key={f._id}>
            <td className="px-4 py-2 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
            <td className="px-4 py-2 text-slate-700">{f.branch}</td>
            <td className="px-4 py-2 text-center">
              {f.attachment ? (
                <a href={f.attachment} target="_blank" rel="noopener noreferrer" aria-label={`Download ${f.branch}`}
                   className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
                  <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                </a>
              ) : <span className="text-slate-300">—</span>}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Curriculum & Syllabus (UG or PG): one section per course, with the course
// name as a heading and a table of its regulation-year batches below —
// S.No, Regulation Year, Regulations, and a "View" button that expands a
// nested branch-files table for Course Structure and Syllabus.
export default function CurriculumTable({ level }) {
  const { data = [], isLoading } = useQuery(curriculumByLevelQuery(level));
  const [openRow, setOpenRow] = useState(null);

  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No curriculum entries listed yet.</p>;

  const groups = {};
  data.forEach((it) => { (groups[it.courseName] ||= []).push(it); });
  const courseNames = Object.keys(groups);

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
                {groups[courseName].map((row, i) => {
                  const rowKey = row._id;
                  const isOpen = openRow === rowKey;
                  return (
                    <Fragment key={rowKey}>
                      <tr className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
                        <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
                        <td className="px-4 py-3 text-slate-700">{row.regulationYear || '—'}</td>
                        <td className="px-4 py-3 text-center">
                          {row.regulations ? (
                            <a href={row.regulations} target="_blank" rel="noopener noreferrer" aria-label={`Regulations for ${courseName}`}
                               className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
                              <i className="fa-solid fa-file-pdf" aria-hidden="true" />
                            </a>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button type="button" onClick={() => setOpenRow(isOpen ? null : rowKey)}
                                  className="rounded-md bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy/90">
                            {isOpen ? 'Hide' : 'View'}
                          </button>
                        </td>
                      </tr>
                      {isOpen && (
                        <tr>
                          <td colSpan={4} className="bg-navy/[0.02] p-0">
                            <BranchFilesTable courseName={courseName} level={level} regulationYear={row.regulationYear} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
