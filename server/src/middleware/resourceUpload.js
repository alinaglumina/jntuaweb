import path from 'path';
import { uploader, publicUrl } from './upload.js';
import fs from 'fs';
import { optimizeImage } from '../services/imageOptimize.js';
import { validateFileContent } from './fileValidation.js';
import ApiError from '../utils/ApiError.js';

// Runs multer for `field`, compresses images, and sets req.body[field] to the
// public URL so the controller persists it.
export function resourceUpload(field, subdir) {
  const mw = uploader(subdir).single(field);
  return (req, res, next) => mw(req, res, async (err) => {
    if (err) return next(err);
    if (req.file) {
      const check = validateFileContent(req.file.path);
      if (!check.ok) { try { fs.unlinkSync(req.file.path); } catch {} return next(ApiError.badRequest('File content does not match its extension')); }
      await optimizeImage(req.file.path);
      req.body[field] = publicUrl(subdir, req.file.filename);
    }
    next();
  });
}
