import mongoose from 'mongoose';

// Academic & Planning "Mou's List" page: four tables (National MoU's, International MoU's,
// National Companies List, International Companies List), one row per organization.
const schema = new mongoose.Schema({
  category:  { type: String, enum: ['national-mou', 'international-mou', 'national-company', 'international-company'], required: true, index: true },
  orgName:   { type: String, required: true, trim: true },
  startDate: { type: Date, default: null },     // MoU starting date
  period:    { type: String, default: '' },     // period of the MoU, in years (e.g. "3")
  isActive:  { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('AcademicMou', schema);
