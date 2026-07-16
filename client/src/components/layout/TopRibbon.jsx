import { Link } from 'react-router-dom';
import { RIBBON_LINKS, SOCIALS } from '../../content/nav.js';

export default function TopRibbon() {
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return (
    <div className="bg-navy-900 text-white/90">
      <div className="container flex flex-wrap items-center justify-between gap-2 py-1.5 text-xs">
        <span className="flex items-center gap-2"><i className="fa-solid fa-calendar-days text-gold" aria-hidden="true" />{today}</span>
        <div className="flex flex-wrap items-center gap-3">
          {RIBBON_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center gap-1 text-white/90 hover:text-gold">
              <i className={`fa-solid ${l.icon}`} aria-hidden="true" />{l.label}
            </Link>
          ))}
          <a href="https://jntuaebranchpayment.in/" target="_blank" rel="noopener noreferrer"
             className="rounded bg-crimson px-2 py-0.5 font-semibold text-white hover:bg-crimson-700">
            <i className="fa-solid fa-file-pen" aria-hidden="true" /> Apply Online OD
          </a>
        </div>
        <div className="flex items-center gap-2">
          {SOCIALS.map(([icon, url]) => (
            <a key={icon} href={url} target="_blank" rel="noopener noreferrer" aria-label={icon}
               className="grid h-6 w-6 place-items-center rounded-full bg-surface/10 hover:bg-gold hover:text-navy-900">
              <i className={`fab fa-${icon} text-[11px]`} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
