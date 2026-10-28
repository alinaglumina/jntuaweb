import { ASSESSMENT_ACCREDITATION, NAAC_ITEMS } from './nav.js';

// Shape matches <Sidebar groups={...}> : [{ label, items: [{ to, label, icon }] }]

// IQAC / AISHE / NIRF only: shown on /assessment/* pages.
export const ASSESSMENT_ONLY_GROUPS = ASSESSMENT_ACCREDITATION.map((group) => ({
  label: group.label,
  items: group.children.map(([, label, slug]) => ({ to: `/assessment/${slug}`, label, icon: 'fa-circle-dot' })),
}));

// NAAC items only: shown on /naac/* pages.
export const NAAC_SIDEBAR_GROUPS = [{
  label: 'Sections',
  items: NAAC_ITEMS.map(([, label, slug]) => ({
    to: `/naac/${slug}`, label, icon: slug === 'ssr' ? 'fa-file-lines' : 'fa-circle-dot',
  })),
}];

// Kept for any other importer: everything together.
export const ASSESSMENT_SIDEBAR_GROUPS = [...ASSESSMENT_ONLY_GROUPS, ...NAAC_SIDEBAR_GROUPS];
