import mongoose from 'mongoose';

// Branch-specific Course Structure & Syllabus files for a given
// (courseName, level, regulationYear) combination — one row per branch.
const schema = new mongoose.Schema({
  courseName:     { type: String, required: true, index: true },
  level:          { type: String, enum: ['ug', 'pg'], required: true, index: true },
  regulationYear: { type: String, default: '', index: true },
  branch:         { type: String, required: true, trim: true },
  attachment:     { type: String, default: '' },
  isActive:       { type: Boolean, default: true },
  sortOrder:      { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('CurriculumFile', schema);
