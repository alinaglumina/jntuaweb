import mongoose from 'mongoose';

// R&D Syllabus > R18 "Part 1 & Part 2 Subjects" sub-table: S.No / Title / Download.
const schema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  attachment: { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('RdSyllabusPartDoc', schema);
