import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { popupBannersQuery } from '../api/queries.js';

// Homepage popup banner managed from admin. Shows the first active banner on every
// page load/refresh of the homepage. Closing it keeps it hidden while the visitor
// navigates around the site, until the next full page load. Closes via the X
// button, the Esc key, or a click outside the card.
let dismissedThisLoad = false;   // module-level: resets on a full reload, survives in-app navigation

export default function PopupBanner() {
  const { pathname } = useLocation();
  const { data = [] } = useQuery({ ...popupBannersQuery(), enabled: pathname === '/' });
  const banner = data[0];
  const [open, setOpen] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    if (!banner || pathname !== '/') return;
    if (dismissedThisLoad) return;
    setOpen(true);
  }, [banner, pathname]);

  const close = () => {
    dismissedThisLoad = true;
    setOpen(false);
  };

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (!open || !banner) return null;
  const external = /^https?:\/\//i.test(banner.linkUrl || '');

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4" onClick={close}>
      <div role="dialog" aria-modal="true" aria-label={banner.title} onClick={(e) => e.stopPropagation()}
           className="relative w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-lift">
        <button ref={closeRef} type="button" onClick={close} aria-label="Close popup"
                className="absolute right-2 top-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80">
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        {banner.image && <img src={banner.image} alt={banner.title} className="max-h-[60vh] w-full bg-slate-100 object-contain" />}
        <div className="p-5 text-center">
          <h2 className="font-display text-xl font-bold text-navy">{banner.title}</h2>
          {banner.message && <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{banner.message}</p>}
          {banner.linkUrl && (
            <a href={banner.linkUrl} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} className="mt-4 inline-block rounded-md bg-navy px-5 py-2 text-sm font-semibold text-white hover:bg-navy/90">{banner.linkLabel || 'Learn more'}</a>
          )}
        </div>
      </div>
    </div>
  );
}
