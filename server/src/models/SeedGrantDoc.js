import mongoose from 'mongoose';

// IR, Placements & Sponsored Research "Research Seed Grant" page: S.No / Title / Download.
const schema = new mongoose.Schema({
  title:      { type: String, required: true, trim: true },
  attachment: { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  sortOrder:  { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('SeedGrantDoc', schema);
