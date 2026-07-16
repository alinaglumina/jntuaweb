import {
  Notification, News, GalleryItem, Mou, EMagazine, Slide, Faculty,
  Administration, DirectorateContent, HonorisCausa, SenateDoc, Regulation,
  DacpFile, DafaDoc, PageContent,
  Event, Department, Student, Circular, Download, Menu,
  Admission, Examination, Result, ContentBlock,
  Video, SeoMeta,
} from '../models/index.js';

// Each entry: model + upload config + which roles may write + list search fields.
// `uploadField`/`uploadSubdir` enable file uploads on create/update.
// `sectionField` marks resources a director can only edit within their scope.
export const RESOURCES = {
  notifications:       { model: Notification,       upload: ['attachment', 'documents'], searchable: ['title'], roles: ['admin', 'director'] },
  news:                { model: News,               upload: ['attachment', 'documents'], searchable: ['title'], roles: ['admin', 'director'] },
  gallery:             { model: GalleryItem,        upload: ['filename', 'gallery'],     searchable: ['caption'], roles: ['admin', 'director'] },
  mous:                { model: Mou,                upload: ['document', 'mous'],         searchable: ['orgName'], roles: ['admin', 'director'] },
  emagazines:          { model: EMagazine,          upload: ['filename', 'magazines'],   searchable: ['monthYear'], roles: ['admin', 'director'] },
  slides:              { model: Slide,              upload: ['image', 'slider'],         roles: ['admin'] },
  faculty:             { model: Faculty,            upload: ['photo', 'images'],         searchable: ['name', 'department'], roles: ['admin', 'director'] },
  administration:      { model: Administration,     upload: ['photo', 'images'],         roles: ['admin'] },
  'directorate-content': { model: DirectorateContent, upload: ['directorPhoto', 'images'], searchable: ['directorName'], roles: ['admin', 'director'], sectionField: 'directorateKey' },
  honoris:             { model: HonorisCausa,       searchable: ['name'], roles: ['admin'] },
  senate:              { model: SenateDoc,          upload: ['filename', 'senate'],      searchable: ['title'], roles: ['admin', 'director'] },
  regulations:         { model: Regulation,         roles: ['admin'] },
  dacp:                { model: DacpFile,           upload: ['filename', 'dacp'],        searchable: ['title', 'section'], roles: ['admin', 'director'], sectionField: 'section' },
  'dafa-docs':         { model: DafaDoc,            upload: ['filename', 'dafa-docs'],   searchable: ['title', 'section'], roles: ['admin', 'director'], sectionField: 'section' },
  'page-content':      { model: PageContent,        searchable: ['key', 'heading'],      roles: ['admin', 'director'], sectionField: 'key' },

  events:              { model: Event,            upload: ['banner', 'events'],        searchable: ['title', 'category'], roles: ['admin', 'director'] },
  circulars:           { model: Circular,         upload: ['attachment', 'circulars'], searchable: ['title', 'refNo'], roles: ['admin', 'director'] },
  downloads:           { model: Download,         upload: ['attachment', 'downloads'], searchable: ['title', 'category'], roles: ['admin', 'director'], sectionField: 'section' },
  departments:         { model: Department,       searchable: ['name', 'code'], roles: ['admin'] },
  students:            { model: Student,          upload: ['photo', 'images'], searchable: ['name', 'rollNo'], roles: ['admin', 'director'], sectionField: 'category' },
  menus:               { model: Menu,             searchable: ['label'], roles: ['admin'] },

  admissions:          { model: Admission,        upload: ['attachment', 'admissions'], searchable: ['title', 'programme'], roles: ['admin', 'director'] },
  examinations:        { model: Examination,      upload: ['attachment', 'exams'],      searchable: ['title', 'regulation'], roles: ['admin', 'director'] },
  results:             { model: Result,           upload: ['attachment', 'results'],    searchable: ['title', 'programme'], roles: ['admin', 'director'] },
  'content-blocks':    { model: ContentBlock,      searchable: ['key', 'title'], roles: ['admin'] },

  videos:              { model: Video,            upload: ['thumbnail', 'videos'], searchable: ['title', 'category'], roles: ['admin', 'director'] },
  seo:                 { model: SeoMeta,          upload: ['ogImage', 'seo'],      searchable: ['path', 'title'], roles: ['admin'] },
};
