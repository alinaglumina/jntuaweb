import { useQuery } from '@tanstack/react-query';
import { iccMembersQuery } from '../api/queries.js';
import SafeHtml from './SafeHtml.jsx';

// Internal Complaint Committee: intro text (from the menu item) + S.No / Name & Designation / Chairperson/ Member.
export default function IccMembersTable({ intro }) {
  const { data = [], isLoading } = useQuery(iccMembersQuery());
  return (
    <div className="space-y-4">
      {intro ? <SafeHtml html={intro} /> : null}
      {isLoading ? <div className="skeleton h-40 w-full rounded-lg" /> : data.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Details will be published soon.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-line shadow-card">
          <table className="w-full text-left text-sm">
            <thead className="bg-white text-slate-900">
              <tr>
                <th className="border-b border-line px-4 py-3 w-20">S.No</th>
                <th className="border-b border-line px-4 py-3">Name &amp; Designation</th>
                <th className="border-b border-line px-4 py-3 w-48">Chairperson/ Member</th>
              </tr>
            </thead>
            <tbody>
              {data.map((m, i) => (
                <tr key={m._id} className={i % 2 === 0 ? 'bg-blue-50' : 'bg-white'}>
                  <td className="px-4 py-2.5 text-slate-700">{String(i + 1).padStart(2, '0')}.</td>
                  <td className="px-4 py-2.5 text-slate-800">{m.name}</td>
                  <td className="px-4 py-2.5 text-slate-800">{m.role || 'Member'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
