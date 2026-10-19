import mongoose from 'mongoose';

// Academic & Planning "Academic Senate" page: one table row per document.
const schema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  attachment: { type: String, default: '' },   // optional
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('AcademicSenateDoc', schema);
