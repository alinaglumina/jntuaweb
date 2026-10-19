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

export default function SafeHtml({ html, className = '', markHeadings = false }) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'title'],
  });
  const out = markHeadings ? markHeadingLines(clean) : clean;
  return <div className={`prose-jntua max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: out }} />;
}
