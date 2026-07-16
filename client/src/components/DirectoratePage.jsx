import { useState } from 'react';
import { useParams } from 'react-router-dom';
import PageShell from './PageShell.jsx';
import ContentPage from './ContentPage.jsx';
import directorates from '../content/directorates.json';

function Avatar({ name, role }) {
  const source = name || role || '?';
  const initials = source
    .replace(/^(Prof\.|Dr\.|Mr\.|Mrs\.|Ms\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <div className="flex h-28 w-28 items-center justify-center rounded-full bg-navy text-3xl font-bold text-white">
      {initials}
    </div>
  );
}

function Blocks({ blocks }) {
  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.type === 'heading') {
          const Tag = `h${Math.min(b.level + 1, 4)}`;
          return <Tag key={i} className="mt-4 font-display text-navy">{b.text}</Tag>;
        }
        if (b.type === 'list') {
          return (
            <ul key={i} className="list-disc space-y-1 pl-6 text-slate-700">
              {b.items.map((it, j) => <li key={j}>{it}</li>)}
            </ul>
          );
        }
        return <p key={i} className="leading-relaxed text-slate-700">{b.text}</p>;
      })}
    </div>
  );
}

export default function DirectoratePage({ resolveKey }) {
  const params = useParams();
  const key = resolveKey ? resolveKey(params) : params.key;
  const data = directorates[key];
  const [activeTab, setActiveTab] = useState(0);

  // Fallback: no rich data yet for this directorate → use the generic renderer.
  if (!data) return <ContentPage resolveId={() => `dir-${key}`} />;

  const { title, director, notifications = [], quickLinks = [], tabs = [] } = data;

  return (
    <PageShell title={title}>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6">
          <div className="flex flex-col items-center rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
  {director.photo ? (
    <img
      src={director.photo}
      alt={director.name || director.role}
      className="h-28 w-28 rounded-full object-cover"
    />
  ) : (
    <Avatar name={director.name} role={director.role} />
  )}
  <p className="mt-4 font-display font-semibold text-navy">{director.name || director.role}</p>
  {director.name && <p className="text-sm text-slate-600">{director.role}</p>}
</div>

          {quickLinks.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <h4 className="mb-2 font-display font-semibold text-navy">Quick Links</h4>
              <ul className="space-y-1">
                {quickLinks.map((l, i) => (
                  <li key={i}>
                    <a href={l.to} className="text-sm text-slate-700 hover:text-navy hover:underline">{l.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Main content */}
        <div>
          {notifications.length > 0 && (
            <div className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <h4 className="font-display font-semibold text-navy">Recent Notifications</h4>
                <span className="rounded bg-red-600 px-2 py-0.5 text-xs font-bold text-white">NEW</span>
              </div>
              <ul className="divide-y divide-slate-100">
                {notifications.map((n, i) => (
                  <li key={i} className="flex items-center justify-between py-2 text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                      {n.text}
                      {n.isNew && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-600">NEW</span>}
                    </span>
                    <span className="whitespace-nowrap text-xs text-slate-400">{n.date}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tabs.length > 0 && (
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap gap-1 border-b border-slate-200 px-3 pt-3">
                {tabs.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTab(i)}
                    className={`rounded-t-md px-4 py-2 text-sm font-medium transition ${
                      activeTab === i
                        ? 'border-b-2 border-navy text-navy'
                        : 'text-slate-500 hover:text-navy'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="p-6">
                {tabs[activeTab].blocks.length > 0
  ? <Blocks blocks={tabs[activeTab].blocks} />
  : <p className="text-slate-500">Details will be published soon.</p>}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
