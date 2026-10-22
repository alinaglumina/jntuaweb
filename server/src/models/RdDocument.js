import mongoose from 'mongoose';

// R&D document tables: Ph.D Vacancies / Regulations / Downloads (S.No / Title / Download).
const schema = new mongoose.Schema({
  section:    { type: String, required: true, enum: ['vacancies', 'regulations', 'downloads'], index: true },
  title:      { type: String, required: true, trim: true },
  attachment: { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('RdDocument', schema);
