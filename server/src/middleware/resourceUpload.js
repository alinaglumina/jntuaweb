import path from 'path';
import { uploader } from './upload.js';
import fs from 'fs';
import { optimizeImage } from '../services/imageOptimize.js';
import { validateFileContent } from './fileValidation.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
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
