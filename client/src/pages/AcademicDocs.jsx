import { useParams } from 'react-router-dom';
import PageShell from '../components/PageShell.jsx';
import { EmptyState } from '../components/AsyncState.jsx';
import { ACADEMICS } from '../content/nav.js';

// Academics document pages (regulations, syllabi, exam calendars, downloads).
// These render the university's document tables, which are migrated in Phase 4
// (dacp_* / dap_regulations) and wired to their read endpoints in Phase 5.
export default function AcademicDocs() {
  const { slug } = useParams();
  const entry = ACADEMICS.find(([, , s]) => s === slug);
  const title = entry ? entry[1] : 'Academics';
  return (
    <PageShell title={title} subtitle="Academic documents and downloads.">
      <EmptyState label="Document listings are migrated with the ETL (Phase 4) and connected here in Phase 5." />
    </PageShell>
  );
}
