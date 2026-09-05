import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  code:          { type: String, default: '' },
  degree:        { type: String, default: '' },
  name:          { type: String, required: true },   // Course/Specialization
  programme:     { type: String, default: '' },
  category:      { type: String, default: '' },
  duration:      { type: String, default: '' },
  courseType:    { type: String, default: '' },
  // Which "Courses Offered" sub-page this row belongs to: ug/pg/integrated.
  programmeType: { type: String, enum: ['ug', 'pg', 'integrated'], required: true, index: true },
  isActive:      { type: Boolean, default: true },
  sortOrder:     { type: Number, default: 0 },
  meta:          { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
export default mongoose.model('Course', schema);
