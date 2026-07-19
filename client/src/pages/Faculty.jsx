import PageShell from '../components/PageShell.jsx';
import { SkeletonCard, ErrorState, EmptyState } from '../components/index.js';
import { useFaculty } from '../api/public.js';

export default function Faculty() {
  const { data = [], isLoading, isError, error } = useFaculty();

  return (
    <PageShell title="Faculty" subtitle="Meet the faculty members of JNTUA.">
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : isError ? (
        <ErrorState error={error} />
      ) : data.length === 0 ? (
        <EmptyState label="Faculty profiles will appear here once added." icon="fa-chalkboard-user" />
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
          {data.map((f) => (
            <div key={f._id} className="card overflow-hidden p-4 text-center">
              {f.photo ? (
                <img src={f.photo} alt={f.name} className="mx-auto h-28 w-28 rounded-full object-cover shadow-card" />
              ) : (
                <div className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-navy/5 text-navy">
                  <i className="fa-solid fa-user text-2xl" aria-hidden="true" />
                </div>
              )}
              <p className="mt-3 font-display text-base font-bold text-navy">{f.name}</p>
              {f.designation && <p className="text-sm text-slate-600">{f.designation}</p>}
              {f.department && <p className="text-xs text-slate-500">{f.department}</p>}
              {f.qualification && <p className="mt-1 text-xs text-slate-500">{f.qualification}</p>}
              {f.email && (
                <a href={`mailto:${f.email}`} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-crimson">
                  <i className="fa-solid fa-envelope" aria-hidden="true" /> {f.email}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
