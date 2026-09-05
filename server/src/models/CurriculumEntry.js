import mongoose from 'mongoose';

// Curriculum & Syllabus (Academic & Planning): entries are grouped by
// courseName on the public page, each course showing a table of its
// regulation-year batches with Regulations/Course Structure/Syllabus PDFs.
const schema = new mongoose.Schema({
  courseName:      { type: String, required: true, trim: true, index: true },
  level:           { type: String, enum: ['ug', 'pg'], required: true, index: true },
  regulationYear:  { type: String, default: '' },   // e.g. "R19", "R23"
  regulations:               { type: String, default: '' },   // attachment URL
  isActive:        { type: Boolean, default: true },
  sortOrder:       { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('CurriculumEntry', schema);
