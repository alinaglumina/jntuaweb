import { NavLink } from 'react-router-dom';
import { prefetchPath } from '../lib/prefetch.js';
// Reusable vertical nav. groups: [{ label, items: [{ to, label, icon }] }].
export default function Sidebar({ header, groups = [], footer, className = '' }) {
  const link = ({ isActive }) => `flex items-center gap-2 px-4 py-2 text-sm ${isActive ? 'bg-white/10 font-semibold text-gold' : 'text-white/80 hover:bg-white/5'}`;
  return (
    <nav className={`flex h-full flex-col bg-navy-900 text-white ${className}`}>
      {header && <div className="border-b border-white/10 px-4 py-4">{header}</div>}
      <div className="flex-1 overflow-y-auto py-2">
        {groups.map((g) => (
          <div key={g.label} className="mb-2">
            <p className="px-4 py-1 text-[11px] font-semibold uppercase tracking-wide text-white/40">{g.label}</p>
            {g.items.map((it) => (
              <NavLink key={it.to} to={it.to} end={it.end} className={link} onClick={it.onClick}
                onMouseEnter={() => prefetchPath(it.to)} onFocus={() => prefetchPath(it.to)}>
                <i className={`fa-solid ${it.icon} w-4 text-center`} aria-hidden="true" /> {it.label}
              </NavLink>
            ))}
          </div>
        ))}
      </div>
      {footer && <div className="border-t border-white/10 p-4">{footer}</div>}
    </nav>
  );
}
