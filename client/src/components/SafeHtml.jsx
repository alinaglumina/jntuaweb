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

export default function SafeHtml({ html, className = '' }) {
  if (!html) return null;
  const clean = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'title'],
  });
  return <div className={`prose-jntua max-w-none ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
