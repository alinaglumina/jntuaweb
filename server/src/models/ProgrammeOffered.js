import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  institution: { type: String, required: true, trim: true, index: true },   // 'JNTUA CEA'
  department:  { type: String, default: '', trim: true },
  level:       { type: String, default: 'UG', trim: true, index: true },    // UG / PG / Ph.D.
  programme:   { type: String, required: true, trim: true },
  sortOrder:   { type: Number, default: 0 },
  isActive:    { type: Boolean, default: true },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('ProgrammeOffered', schema);
