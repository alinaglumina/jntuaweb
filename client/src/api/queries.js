// Shared query definitions — the SINGLE source of truth for cache keys + fetchers.
// Both the React Query hooks AND the router loaders import these, so a loader's
// prefetch and a component's useQuery always hit the exact same cache entry.
import api from '../lib/axios.js';

const list = (path, params) => () => api.get(path, { params }).then((d) => d.items ?? d ?? []);

export const slidesQuery      = () => ({ queryKey: ['slides'],      queryFn: list('/slides') });
export const galleryQuery     = () => ({ queryKey: ['gallery'],     queryFn: list('/gallery') });
export const mousQuery        = () => ({ queryKey: ['mous'],        queryFn: list('/mous') });
export const emagazinesQuery  = () => ({ queryKey: ['emagazines'],  queryFn: list('/emagazines') });
export const honorisQuery     = () => ({ queryKey: ['honoris'],     queryFn: list('/honoris') });
export const facultyQuery     = () => ({ queryKey: ['faculty'],     queryFn: list('/faculty') });
export const directorateMenuQuery = (key) => ({
  queryKey: ['directorate-menu-public', key],
  queryFn: () => api.get(`/directorate-menu/${key}`).catch(() => []),
  retry: false,
});
export const newsQuery        = () => ({ queryKey: ['news'],        queryFn: list('/news') });
export const settingsQuery    = () => ({ queryKey: ['settings'],    queryFn: () => api.get('/settings') });

export const notificationsQuery = (category) => ({
  queryKey: ['notifications', category],
  queryFn: list('/notifications'),
  select: category ? (items) => items.filter((n) => n.category === category) : undefined,
});

export const pageContentQuery = (id) => ({
  queryKey: ['page-content', id],
  queryFn: () => api.get(`/page-content/key/${id}`).catch(() => null),
  retry: false,
});

export const adminListQuery = (resource, params) => ({
  queryKey: ['admin', resource, params],
  queryFn: list(`/admin/${resource}`, params),
});

// Paginated admin list — returns the full { items, total, page, limit } envelope.
export const adminPageQuery = (resource, params = {}) => ({
  queryKey: ['admin', resource, 'page', params],
  queryFn: () => api.get(`/admin/${resource}`, { params }),
});
export const administrationQuery = (roleKey) => ({
  queryKey: ['administration', roleKey],
  queryFn: list('/administration'),
  select: roleKey ? (items) => items.find((a) => a.roleKey === roleKey) ?? null : undefined,
  enabled: !!roleKey,
});
