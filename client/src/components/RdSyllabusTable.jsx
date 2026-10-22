import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { rdSyllabusQuery, rdSyllabusPartsQuery } from '../api/queries.js';

// "Syllabus" page (R&D): S.No / Regulation / Title / Download.
// A row flagged hasSubTable opens an inline S.No / Title / Download sub-table.
function DownloadIcon({ url, title }) {
  return url ? (
    <a href={url} target="_blank" rel="noopener noreferrer" aria-label={`Download ${title}`}
       className="inline-grid h-8 w-8 place-items-center rounded bg-crimson/10 text-crimson hover:bg-crimson hover:text-white">
      <i className="fa-solid fa-file-pdf" aria-hidden="true" />
    </a>
  ) : <span className="text-slate-300">—</span>;
}

export default function RdSyllabusTable() {
  const { data = [], isLoading } = useQuery(rdSyllabusQuery());
  const { data: parts = [] } = useQuery(rdSyllabusPartsQuery());
  const [open, setOpen] = useState({});
  if (isLoading) return <div className="skeleton h-40 w-full rounded-lg" />;
  if (data.length === 0) return <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">No documents yet.</p>;

  return (
    <div className="overflow-x-auto rounded-lg border border-line shadow-card">
      <table className="w-full text-left text-sm">
        <thead className="bg-navy/5 text-navy">
          <tr>
            <th className="px-4 py-3 w-16">S.No</th>
            <th className="px-4 py-3 w-28">Regulation</th>
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3 w-32 text-center">Download</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {data.map((d, i) => (
            <>
              <tr key={d._id} className={i % 2 === 0 ? 'bg-white' : 'bg-navy/[0.02]'}>
                <td className="px-4 py-3 text-slate-500">{String(i + 1).padStart(2, '0')}.</td>
                <td className="px-4 py-3 font-medium text-slate-700">{d.regulation || '—'}</td>
                <td className="px-4 py-3 text-slate-700">{d.title}</td>
                <td className="px-4 py-3 text-center">
                  {d.hasSubTable ? (
                    <button type="button" onClick={() => setOpen((o) => ({ ...o, [d._id]: !o[d._id] }))}
                      aria-expanded={!!open[d._id]}
                      className="inline-flex items-center gap-1 rounded bg-navy px-3 py-1.5 text-xs font-semibold text-white hover:bg-navy/90">
                      {open[d._id] ? 'Hide' : 'View'}
                      <i className={`fa-solid fa-chevron-${open[d._id] ? 'up' : 'down'}`} aria-hidden="true" />
                    </button>
                  ) : <DownloadIcon url={d.attachment} title={d.title} />}
                </td>
              </tr>
              {d.hasSubTable && open[d._id] && (
                <tr key={`${d._id}-sub`}>
                  <td colSpan={4} className="bg-slate-50 px-4 py-4">
                    {parts.length === 0 ? <p className="text-sm text-slate-500">No documents yet.</p> : (
                      <table className="w-full text-left text-sm">
                        <thead className="bg-navy/5 text-navy">
                          <tr>
                            <th className="px-3 py-2 w-16">S.No</th>
                            <th className="px-3 py-2">Title</th>
                            <th className="px-3 py-2 w-28 text-center">Download</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line bg-white">
                          {parts.map((p, k) => (
                            <tr key={p._id}>
                              <td className="px-3 py-2 text-slate-500">{String(k + 1).padStart(2, '0')}.</td>
                              <td className="px-3 py-2 text-slate-700">{p.title}</td>
                              <td className="px-3 py-2 text-center"><DownloadIcon url={p.attachment} title={p.title} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </td>
                </tr>
              )}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
