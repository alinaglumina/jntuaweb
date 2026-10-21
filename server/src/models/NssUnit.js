import mongoose from 'mongoose';

// NSS Cell "NSS Units under JNTUA" page: one row per college, grouped by district.
const schema = new mongoose.Schema({
  district:    { type: String, required: true, trim: true, index: true },
  collegeName: { type: String, required: true, trim: true },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('NssUnit', schema);
