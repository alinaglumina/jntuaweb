// Single source of truth for the public site map. Drives BOTH the mega-menu
// and the router. `content` = renders ContentPage from pages.json by that id.
// `dynamic` = a custom data-driven component (see router.jsx).

export const DIRECTORATES = [
  ['dir-academic', 'Academic & Planning', 'academic'],
  ['dir-audit', 'Academic Audit', 'audit'],
  ['dir-admissions', 'Admissions, Foreign Affairs & Alumni', 'admissions'],
  ['dir-evaluation', 'Evaluation', 'evaluation'],
  ['dir-rd', 'Research & Development', 'rd'],
  ['dir-placements', 'IR, Placements & Sponsored Research', 'placements'],
  ['dir-consultancy', 'Industrial Consultancy Services', 'consultancy'],
  ['dir-faculty', 'Faculty Development & Women Empowerment', 'faculty'],
  ['dir-iqac', 'Internal Quality Assurance Cell', 'iqac'],
  ['dir-skill', 'Skill, Software Development & Incubation Centre', 'skill'],
  ['dir-ipr', 'Intellectual Property Rights', 'ipr'],
  ['dir-otpri', 'Oil Technological & Pharmaceutical Research Institute', 'otpri'],
  ['dir-sms', 'School of Management Studies', 'sms'],
];

export const UNITS = [
  ['unit-nss', 'NSS Cell', 'nss'],
  ['unit-scst', 'SC/ST Cell', 'scst'],
  ['unit-anti-ragging', 'Anti-Ragging Cell', 'anti-ragging'],
  ['unit-pro', 'Public Relations Office', 'public-relations'],
  ['unit-sports', 'Sports Council', 'sports'],
];

export const ACADEMICS = [
  ['acad-methodology', 'Methodology', 'methodology'],
  ['acad-admission', 'Admission', 'admission'],
  ['acad-regsyllabus', 'Regulations & Syllabus', 'regulations-syllabus'],
  ['acad-examinations', 'Examinations', 'examinations'],
  ['acad-downloads', 'Downloadable Documents', 'downloads'],
  ['acad-examcal', 'Exam Calendars', 'exam-calendars'],
  ['acad-affiliated', 'Affiliated Colleges', 'affiliated-colleges'],
];

// Mega-menu structure. leaf: { label, to, kind } kind: content|dynamic|external
export const NAV = [
  { label: 'Home', to: '/' },
  {
    label: 'About',
    children: [
      { label: 'Genesis-JNTUA', to: '/about/genesis', kind: 'content', id: 'genesis' },
      { label: 'Vision & Mission', to: '/about/vision-mission', kind: 'content', id: 'vision-mission' },
      { label: 'University Goals', to: '/about/goals', kind: 'content', id: 'goals' },
      { label: 'JNTUA Policies', to: '/about/policies', kind: 'content', id: 'policies' },
      { label: 'Honoris Causa', to: '/about/honoris', kind: 'dynamic' },
      { label: 'JNTUA Gallery', to: '/about/gallery', kind: 'dynamic' },
      { label: "Tie Up's & MOU's", to: '/about/mous', kind: 'dynamic' },
      { label: 'E-Magazines', to: '/about/e-magazines', kind: 'dynamic' },
      { label: 'JNTUA Anthem', to: '/about/anthem', kind: 'content', id: 'anthem' },
    ],
  },
  {
    label: 'Administration',
    children: [
      { label: 'Chancellor', to: '/administration/chancellor', kind: 'content', id: 'chancellor' },
      { label: 'Vice-Chancellor', to: '/administration/vice-chancellor', kind: 'content', id: 'vice-chancellor' },
      { label: 'Rector', to: '/administration/rector', kind: 'content', id: 'rector' },
      { label: 'Registrar', to: '/administration/registrar', kind: 'content', id: 'registrar' },
      { label: 'Executive Council', to: '/administration/executive-council', kind: 'content', id: 'exec-council' },
      { label: 'Former Vice-Chancellors', to: '/administration/former-vice-chancellors', kind: 'content', id: 'former-vcs' },
    ],
  },
  {
    label: 'Directorates',
    wide: true,
    children: DIRECTORATES.map(([id, label, slug]) => ({
      label, to: `/directorates/${slug}`, kind: 'content', id,
    })),
  },
  {
    label: 'Academics',
    children: ACADEMICS.map(([id, label, slug]) => ({
      label, to: `/academics/${slug}`, kind: 'dynamic', id,
    })),
  },
  {
    label: 'Important Units',
    children: UNITS.map(([id, label, slug]) => ({
      label, to: `/units/${slug}`, kind: 'content', id,
    })),
  },
];

export const RIBBON_LINKS = [
  { label: 'Notification Centre', to: '/notifications', icon: 'fa-bell' },
  { label: 'Alumni', to: '/alumni', icon: 'fa-user-graduate' },
];

export const SOCIALS = [
  ['facebook-f', 'https://facebook.com/jntua'],
  ['x-twitter', 'https://twitter.com/jntua'],
  ['linkedin-in', 'https://linkedin.com/school/jntua'],
  ['youtube', 'https://youtube.com/jntua'],
  ['instagram', 'https://instagram.com/jntua'],
];
