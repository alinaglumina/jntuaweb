import mongoose from 'mongoose';

// IQAC "Committee" page: one table row per document (S.No / Title / Download).
const schema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  attachment: { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('IqacCommitteeDoc', schema);
