import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import PrefetchLink from '../ui/PrefetchLink.jsx';
import { NAV } from '../../content/nav.js';

export default function MegaNav() {
  const [openMobile, setOpenMobile] = useState(false);
  const [mobileGroup, setMobileGroup] = useState(null);
  const { pathname } = useLocation();

  return (
    <nav className="sticky top-0 z-40 bg-navy text-white shadow-md">
      <div className="container flex items-center justify-between">
        {/* Desktop */}
        <ul className="hidden items-stretch md:flex">
          {NAV.map((item) => (
            <li key={item.label} className="group relative">
              {item.children ? (
                <>
                  <button className="flex h-full items-center gap-1 px-4 py-3 text-sm font-semibold hover:bg-navy-700">
                    {item.label} <i className="fa-solid fa-chevron-down text-[10px]" aria-hidden="true" />
                  </button>
                  <div className={`invisible absolute left-0 top-full ${item.wide ? 'w-80' : 'w-64'} rounded-b-lg bg-surface py-2 text-ink opacity-0 shadow-lift transition group-hover:visible group-hover:opacity-100`}>
                    {item.children.map((c) => (
                      <PrefetchLink key={c.to} to={c.to}
                        className={`block px-4 py-2 text-sm hover:bg-navy/5 ${pathname === c.to ? 'font-semibold text-crimson' : 'text-ink'}`}>
                        {c.label}
                      </PrefetchLink>
                    ))}
                  </div>
                </>
              ) : (
                <PrefetchLink to={item.to} className={`flex h-full items-center gap-1 px-4 py-3 text-sm font-semibold hover:bg-navy-700 ${pathname === item.to ? 'bg-navy-700' : ''}`}>
                  <i className="fa-solid fa-house text-xs" aria-hidden="true" /> {item.label}
                </PrefetchLink>
              )}
            </li>
          ))}
        </ul>

        {/* Mobile toggle */}
        <button className="flex items-center gap-2 px-2 py-3 text-sm font-semibold md:hidden" onClick={() => setOpenMobile((v) => !v)}>
          <i className={`fa-solid ${openMobile ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" /> Menu
        </button>
        <Link to="/login" className="my-2 mr-1 rounded border border-white/30 px-3 py-1.5 text-xs font-semibold hover:bg-surface hover:text-navy md:hidden">
          Admin
        </Link>
      </div>

      {/* Mobile drawer */}
      {openMobile && (
        <div className="border-t border-white/10 bg-navy-700 md:hidden">
          {NAV.map((item) => (
            <div key={item.label} className="border-b border-white/10">
              {item.children ? (
                <>
                  <button className="flex w-full items-center justify-between px-4 py-3 text-sm font-semibold"
                    onClick={() => setMobileGroup((g) => (g === item.label ? null : item.label))}>
                    {item.label}
                    <i className={`fa-solid fa-chevron-${mobileGroup === item.label ? 'up' : 'down'} text-[10px]`} aria-hidden="true" />
                  </button>
                  {mobileGroup === item.label && (
                    <div className="bg-navy-900/40 pb-2">
                      {item.children.map((c) => (
                        <Link key={c.to} to={c.to} onClick={() => setOpenMobile(false)}
                          className="block px-6 py-2 text-sm text-white/90 hover:text-gold">{c.label}</Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link to={item.to} onClick={() => setOpenMobile(false)} className="block px-4 py-3 text-sm font-semibold">{item.label}</Link>
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
