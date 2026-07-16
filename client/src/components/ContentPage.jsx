import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageShell from './PageShell.jsx';
import SafeHtml from './SafeHtml.jsx';
import { pageContentQuery } from '../api/queries.js';
import pages from '../content/pages.json';

// Renders a static page from the content manifest. If an admin has published an
// editable PageContent override under the same key, that HTML wins.
export default function ContentPage({ pageId, resolveId }) {
  const params = useParams();
  const id = pageId || (resolveId ? resolveId(params) : null);
  const page = id && pages[id];

  const { data: override } = useQuery({ ...pageContentQuery(id), enabled: !!id });

  if (override?.body) {
    return <PageShell title={override.heading || page?.title || 'Page'}><SafeHtml html={override.body} className="mx-auto max-w-3xl" /></PageShell>;
  }
  if (!page) return <PageShell title="Page not found"><p className="text-slate-600">This page has no content yet.</p></PageShell>;

  return (
    <PageShell title={page.title}>
      <article className="prose-jntua mx-auto max-w-3xl space-y-4">
        {page.blocks.map((b, i) => {
          if (b.type === 'heading') { const Tag = `h${Math.min(b.level + 1, 4)}`; return <Tag key={i} className="mt-6 font-display text-navy">{b.text}</Tag>; }
          if (b.type === 'list') return <ul key={i} className="list-disc space-y-1 pl-6 text-slate-700">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>;
          return <p key={i} className="leading-relaxed text-slate-700">{b.text}</p>;
        })}
        {page.blocks.length === 0 && <p className="text-slate-500">Content coming soon.</p>}
      </article>
    </PageShell>
  );
}
