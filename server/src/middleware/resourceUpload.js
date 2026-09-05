import path from 'path';
import { uploader } from './upload.js';
import fs from 'fs';
import { optimizeImage } from '../services/imageOptimize.js';
import { validateFileContent } from './fileValidation.js';
import { uploadToR2 as uploadToCloudinary } from '../config/cloudflareR2.js';
import { categorize } from '../utils/fileType.js';
import { MediaFile } from '../models/index.js';
import ApiError from '../utils/ApiError.js';

// Runs multer for `field` (temp local disk), compresses images, uploads the
// result to Cloudinary (so it survives Render's ephemeral filesystem across
// redeploys), sets req.body[field] to the permanent Cloudinary URL, registers
// the file in the Media Library for centralized tracking, then cleans up the
// local temp file.
export function resourceUpload(field, subdir) {
  const mw = uploader(subdir).single(field);
  return (req, res, next) => mw(req, res, async (err) => {
    if (err) return next(err);
    if (req.file) {
      const check = validateFileContent(req.file.path);
      if (!check.ok) { try { fs.unlinkSync(req.file.path); } catch {} return next(ApiError.badRequest('File content does not match its extension')); }
      await optimizeImage(req.file.path);
      try {
        const { url, publicId } = await uploadToCloudinary(req.file.path, subdir);
        req.body[field] = url;
        const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
        MediaFile.create({
          folderId: null,
          originalName: req.file.originalname,
          storedName: req.file.filename,
          ext,
          mimeType: req.file.mimetype,
          fileType: categorize(ext, req.file.mimetype),
          size: req.file.size,
          description: `Uploaded via ${subdir}`,
          url,
          cloudinaryId: publicId,
          uploadedBy: req.user?.username || '',
        }).catch(() => {}); // best-effort — don't block the actual save if this fails
      } catch (e) {
        return next(ApiError.badRequest('File upload to storage failed: ' + e.message));
      } finally {
        try { fs.unlinkSync(req.file.path); } catch {}
      }
    }
    next();
  });
}

// Multi-file variant: runs multer for `field` (up to `maxCount` files), processes
// each the same way as resourceUpload (optimize, upload to Cloudinary, register
// in Media Library), then sets req.body[field] to an ARRAY of permanent URLs.
export function resourceUploadMulti(field, subdir, maxCount = 8) {
  const mw = uploader(subdir).array(field, maxCount);
  return (req, res, next) => mw(req, res, async (err) => {
    if (err) return next(err);
    const files = req.files || [];
    if (files.length === 0) return next();
    try {
      const urls = [];
      const names = [];
      for (const file of files) {
        const check = validateFileContent(file.path);
        if (!check.ok) { try { fs.unlinkSync(file.path); } catch {} continue; }
        await optimizeImage(file.path);
        const { url, publicId } = await uploadToCloudinary(file.path, subdir);
        urls.push(url);
        names.push(file.originalname);
        const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
        MediaFile.create({
          folderId: null,
          originalName: file.originalname,
          storedName: file.filename,
          ext,
          mimeType: file.mimetype,
          fileType: categorize(ext, file.mimetype),
          size: file.size,
          description: `Uploaded via ${subdir}`,
          url,
          cloudinaryId: publicId,
          uploadedBy: req.user?.username || '',
        }).catch(() => {});
        try { fs.unlinkSync(file.path); } catch {}
      }
      req.body[field] = urls;
      // Also expose original filenames under `<field>Names`, e.g. `attachmentsNames`,
      // so resources that store this field can display real names instead of
      // generic "File 1", "File 2" placeholders. Harmless for schemas that don't
      // define a matching field — Mongoose silently drops unknown keys.
      req.body[`${field}Names`] = names;
      next();
    } catch (e) {
      files.forEach((f) => { try { fs.unlinkSync(f.path); } catch {} });
      return next(ApiError.badRequest('File upload to storage failed: ' + e.message));
    }
  });
}

// Multi-NAMED-field variant: handles several independent single-file fields
// in one request (e.g. `regulations` + `courseStructureAndSyllabus`), each
// going to its own subdir. Unlike resourceUploadMulti (one field, many files
// → array), each field here gets exactly one file → a single URL string,
// matching schemas where each field is `String`, not `[String]`.
// fieldsConfig: [[fieldName, subdir], ...]
export function resourceUploadFields(fieldsConfig) {
  const multerFields = fieldsConfig.map(([field]) => ({ name: field, maxCount: 1 }));
  const mw = uploader('_uploads').fields(multerFields);
  return (req, res, next) => mw(req, res, async (err) => {
    if (err) return next(err);
    const filesByField = req.files || {};
    const fieldNames = Object.keys(filesByField);
    if (fieldNames.length === 0) return next();
    try {
      for (const [field, subdir] of fieldsConfig) {
        const file = filesByField[field]?.[0];
        if (!file) continue;
        const check = validateFileContent(file.path);
        if (!check.ok) { try { fs.unlinkSync(file.path); } catch {} continue; }
        await optimizeImage(file.path);
        const { url, publicId } = await uploadToCloudinary(file.path, subdir);
        req.body[field] = url;
        const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
        MediaFile.create({
          folderId: null,
          originalName: file.originalname,
          storedName: file.filename,
          ext,
          mimeType: file.mimetype,
          fileType: categorize(ext, file.mimetype),
          size: file.size,
          description: `Uploaded via ${subdir}`,
          url,
          cloudinaryId: publicId,
          uploadedBy: req.user?.username || '',
        }).catch(() => {});
        try { fs.unlinkSync(file.path); } catch {}
      }
      next();
    } catch (e) {
      Object.values(filesByField).flat().forEach((f) => { try { fs.unlinkSync(f.path); } catch {} });
      return next(ApiError.badRequest('File upload to storage failed: ' + e.message));
    }
  });
}

// Combined single+multi upload in ONE multer instance — required whenever a
// resource needs both a single-file field (e.g. `banner`) and a multi-file
// field (e.g. `images`) together. Two separate multer middlewares chained on
// the same route can't both parse the same multipart body — the second one
// receives an already-consumed stream and fails. This handles both in one
// pass: singleField produces a URL string, multiField produces a URL array.
export function resourceUploadCombined(singleField, singleSubdir, multiField, multiSubdir, multiMax = 8) {
  const mw = uploader('_uploads').fields([
    { name: singleField, maxCount: 1 },
    { name: multiField, maxCount: multiMax },
  ]);
  return (req, res, next) => mw(req, res, async (err) => {
    if (err) return next(err);
    const filesByField = req.files || {};
    if (Object.keys(filesByField).length === 0) return next();
    try {
      const singleFile = filesByField[singleField]?.[0];
      if (singleFile) {
        const check = validateFileContent(singleFile.path);
        if (check.ok) {
          await optimizeImage(singleFile.path);
          const { url, publicId } = await uploadToCloudinary(singleFile.path, singleSubdir);
          req.body[singleField] = url;
          const ext = path.extname(singleFile.originalname).replace('.', '').toLowerCase();
          MediaFile.create({
            folderId: null, originalName: singleFile.originalname, storedName: singleFile.filename,
            ext, mimeType: singleFile.mimetype, fileType: categorize(ext, singleFile.mimetype),
            size: singleFile.size, description: `Uploaded via ${singleSubdir}`, url,
            cloudinaryId: publicId, uploadedBy: req.user?.username || '',
          }).catch(() => {});
        }
        try { fs.unlinkSync(singleFile.path); } catch {}
      }

      const multiFiles = filesByField[multiField] || [];
      if (multiFiles.length > 0) {
        const urls = [];
        for (const file of multiFiles) {
          const check = validateFileContent(file.path);
          if (!check.ok) { try { fs.unlinkSync(file.path); } catch {} continue; }
          await optimizeImage(file.path);
          const { url, publicId } = await uploadToCloudinary(file.path, multiSubdir);
          urls.push(url);
          const ext = path.extname(file.originalname).replace('.', '').toLowerCase();
          MediaFile.create({
            folderId: null, originalName: file.originalname, storedName: file.filename,
            ext, mimeType: file.mimetype, fileType: categorize(ext, file.mimetype),
            size: file.size, description: `Uploaded via ${multiSubdir}`, url,
            cloudinaryId: publicId, uploadedBy: req.user?.username || '',
          }).catch(() => {});
          try { fs.unlinkSync(file.path); } catch {}
        }
        req.body[multiField] = urls;
      }
      next();
    } catch (e) {
      Object.values(filesByField).flat().forEach((f) => { try { fs.unlinkSync(f.path); } catch {} });
      return next(ApiError.badRequest('File upload to storage failed: ' + e.message));
    }
  });
}
