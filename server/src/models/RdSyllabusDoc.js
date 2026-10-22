import mongoose from 'mongoose';

// R&D "Syllabus" page: one table row per document (S.No / Regulation / Title / Download).
const schema = new mongoose.Schema({
  regulation: { type: String, default: '', trim: true },
  title:      { type: String, required: true, trim: true },
  attachment: { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('RdSyllabusDoc', schema);
