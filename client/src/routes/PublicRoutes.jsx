import DirectoratePage from '../components/DirectoratePage.jsx';
import { lazy } from 'react';
import ContentPage from '../components/ContentPage.jsx';
import { NAV, DIRECTORATES, UNITS, ACADEMICS } from '../content/nav.js';
import { S } from './lazy.jsx';
import { homeLoader, notificationsLoader, galleryLoader, mousLoader, emagazinesLoader, honorisLoader, contentLoader } from './loaders.js';

const Home              = lazy(() => import('../pages/Home.jsx'));
const NotificationCentre= lazy(() => import('../pages/NotificationCentre.jsx'));
const SearchResults     = lazy(() => import('../pages/SearchResults.jsx'));
const Gallery           = lazy(() => import('../pages/Gallery.jsx'));
const Mous              = lazy(() => import('../pages/Mous.jsx'));
const EMagazines        = lazy(() => import('../pages/EMagazines.jsx'));
const Honoris           = lazy(() => import('../pages/Honoris.jsx'));
const AcademicDocs      = lazy(() => import('../pages/AcademicDocs.jsx'));
const UIKit             = lazy(() => import('../pages/UIKit.jsx'));

// slug (URL param) → content-manifest id, for DYNAMIC routes.
const dirId  = ({ key }) => (DIRECTORATES.find(([, , s]) => s === key) || [])[0];
const unitId = ({ key }) => (UNITS.find(([, , s]) => s === key) || [])[0];
import { NAV, DIRECTORATES, UNITS, ACADEMICS, NAAC_ITEMS } from '../content/nav.js';
// ...
const naacId    = ({ key }) => (NAAC_ITEMS.find(([, , s]) => s === key) || [])[0];
const naacLabel = (key) => (NAAC_ITEMS.find(([, , s]) => s === key) || [, key])[1];
// slug → human label, for breadcrumbs.
const dirLabel  = (key) => (DIRECTORATES.find(([, , s]) => s === key) || [, key])[1];
const unitLabel = (key) => (UNITS.find(([, , s]) => s === key) || [, key])[1];
const acadLabel = (slug) => (ACADEMICS.find(([, , s]) => s === slug) || [, slug])[1];

// Build a `crumb` handle: an array of { label, to? }. Non-link group + current leaf.
const crumb = (arr) => ({ crumb: () => arr });

// Fixed content leaves (not directorates/units/academics), tagged with their group.
const fixedContent = NAV.flatMap((group) =>
  (group.children || [])
    .filter((l) => l.kind === 'content' && !l.to.startsWith('/directorates/') && !l.to.startsWith('/units/'))
    .map((l) => ({
      path: l.to, element: S(<ContentPage pageId={l.id} />),
      loader: contentLoader(() => l.id),
      handle: crumb([{ label: group.label }, { label: l.label, to: l.to }]),
    }))
);

const dynamicPages = {
  '/about/gallery': [<Gallery />, galleryLoader], '/about/mous': [<Mous />, mousLoader],
  '/about/e-magazines': [<EMagazines />, emagazinesLoader], '/about/honoris': [<Honoris />, honorisLoader],
};
const dynamicRoutes = NAV.flatMap((group) =>
  (group.children || [])
    .filter((l) => dynamicPages[l.to])
    .map((l) => ({
      path: l.to, element: S(dynamicPages[l.to][0]), loader: dynamicPages[l.to][1],
      handle: crumb([{ label: group.label }, { label: l.label, to: l.to }]),
    }))
);

export const publicRoutes = [
  { index: true, element: S(<Home />), loader: homeLoader },
  { path: 'notifications', element: S(<NotificationCentre />), loader: notificationsLoader, handle: crumb([{ label: 'Notification Centre' }]) },
  { path: 'search', element: S(<SearchResults />), handle: crumb([{ label: 'Search' }]) },
  { path: 'alumni', element: S(<ContentPage pageId="alumni" />), loader: contentLoader(() => 'alumni'), handle: crumb([{ label: 'Alumni' }]) },
  { path: 'ui-kit', element: S(<UIKit />), handle: crumb([{ label: 'UI Kit' }]) },

  // DYNAMIC routes — crumb derives the label from the URL param.
  { path: 'directorates/:key', element: S(<DirectoratePage resolveKey={(p) => p.key} />), loader: contentLoader(dirId),
    handle: { crumb: (m) => [{ label: 'Directorates' }, { label: dirLabel(m.params.key), to: `/directorates/${m.params.key}` }] } },
  { path: 'units/:key', element: S(<DirectoratePage resolveKey={(p) => p.key} />), loader: contentLoader(unitId),
    handle: { crumb: (m) => [{ label: 'Important Units' }, { label: unitLabel(m.params.key), to: `/units/${m.params.key}` }] } },
  { path: 'naac/:key', element: S(<ContentPage resolveId={naacId} />), loader: contentLoader(naacId),
  handle: { crumb: (m) => [{ label: 'NAAC' }, { label: naacLabel(m.params.key), to: `/naac/${m.params.key}` }] } },
  { path: 'academics/:slug', element: S(<AcademicDocs />),
    handle: { crumb: (m) => [{ label: 'Academics' }, { label: acadLabel(m.params.slug), to: `/academics/${m.params.slug}` }] } },

  ...fixedContent,
  ...dynamicRoutes,
];
