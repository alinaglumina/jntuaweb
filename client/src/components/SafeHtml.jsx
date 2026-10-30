import { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
// Renders admin/Quill HTML (news, directorate about, page bodies) after
// client-side sanitization — defence-in-depth on top of the server sanitizer.
// Iframes are allowed ONLY from trusted video-embed domains (YouTube), so
// legitimate embeds (e.g. the JNTUA Anthem video) render, while arbitrary
// iframe sources remain blocked for security.
const TRUSTED_IFRAME_HOSTS = ['www.youtube.com', 'youtube.com', 'player.vimeo.com'];

DOMPurify.addHook('uponSanitizeElement', (node, data) => {
  if (data.tagName !== 'iframe') return;
  const src = node.getAttribute('src') || '';
  try {
    const host = new URL(src, window.location.origin).hostname;
    if (!TRUSTED_IFRAME_HOSTS.includes(host)) node.remove();
  } catch {
    node.remove();
  }
});

// Paragraphs whose entire text is one short bold element (e.g. "Our Vision") are
// really headings typed as bold text. Tag them so CSS can style them as headings.
function markHeadingLines(html) {
  if (typeof document === 'undefined') return html;
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  tpl.content.querySelectorAll('p').forEach((p) => {
    const text = p.textContent.trim();
    if (!text || text.length > 90 || p.children.length !== 1) return;
    const el = p.children[0];
    const bold = el.tagName === 'STRONG' || el.tagName === 'B'
      || /font-weight:\s*(bold|bolder|[6-9]00)/i.test(el.getAttribute('style') || '');
    if (bold && el.textContent.trim() === text) p.classList.add('heading-line');
  });
  return tpl.innerHTML;
}

const PAGE_ROWS = 25;
const BTN = 'grid h-8 min-w-8 place-items-center rounded px-2 text-sm';

// Splits any table with more than PAGE_ROWS body rows into pages of PAGE_ROWS,
// adding a pager under it. Returns a cleanup that restores the table.
function paginateTables(root) {
  const cleanups = [];
  root.querySelectorAll('table').forEach((table) => {
    const body = table.tBodies[0];
    if (!body) return;
    const rows = Array.from(body.rows).filter((r) => !(r.cells.length && Array.from(r.cells).every((c) => c.tagName === 'TH')));
    if (rows.length <= PAGE_ROWS) return;
    const pages = Math.ceil(rows.length / PAGE_ROWS);
    let page = 1;
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Pagination');
    nav.className = 'mt-4 flex flex-wrap items-center justify-center gap-1';

    const button = (label, target, { active = false, disabled = false, edge = false, aria = '' } = {}) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.disabled = disabled;
      b.className = `${BTN} ${active ? 'bg-navy text-white' : edge ? 'border border-line disabled:opacity-40' : 'hover:bg-navy/5'}`;
      if (aria) b.setAttribute('aria-label', aria);
      b.addEventListener('click', () => {
        page = target;
        render();
        const top = table.getBoundingClientRect().top;
        if (top < 90) window.scrollBy({ top: top - 110, behavior: 'smooth' });
      });
      return b;
    };
    const dots = () => { const d = document.createElement('span'); d.className = 'px-1 text-slate-400'; d.textContent = '…'; return d; };

    function render() {
      rows.forEach((r, i) => { r.style.display = i < (page - 1) * PAGE_ROWS || i >= page * PAGE_ROWS ? 'none' : ''; });
      nav.textContent = '';
      const from = Math.max(1, page - 2);
      const to = Math.min(pages, page + 2);
      nav.appendChild(button('‹', page - 1, { disabled: page <= 1, edge: true, aria: 'Previous' }));
      if (from > 1) { nav.appendChild(button('1', 1)); nav.appendChild(dots()); }
      for (let p = from; p <= to; p++) nav.appendChild(button(String(p), p, { active: p === page }));
      if (to < pages) { nav.appendChild(dots()); nav.appendChild(button(String(pages), pages)); }
      nav.appendChild(button('›', page + 1, { disabled: page >= pages, edge: true, aria: 'Next' }));
    }
    render();
    table.after(nav);
    cleanups.push(() => { nav.remove(); rows.forEach((r) => { r.style.display = ''; }); });
  });
  return () => cleanups.forEach((fn) => fn());
}

export default function SafeHtml({ html, className = '', markHeadings = false }) {
  const ref = useRef(null);
  const clean = html ? DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'title'],
  }) : '';
  const out = markHeadings && clean ? markHeadingLines(clean) : clean;
  useEffect(() => {
    if (!ref.current || !out) return undefined;
    return paginateTables(ref.current);
  }, [out]);
  if (!html) return null;
  return <div ref={ref} className={`prose-jntua max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: out }} />;
}
