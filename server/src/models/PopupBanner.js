import mongoose from 'mongoose';

// Homepage popup banner, managed from admin. Shown to visitors only while
// isActive is true and today falls between startDate and endDate (both optional).
const schema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  message:   { type: String, default: '' },
  image:     { type: String, default: '' },
  linkUrl:   { type: String, default: '' },
  linkLabel: { type: String, default: 'Learn more' },
  startDate: { type: Date, default: null },
  endDate:   { type: Date, default: null },
  isActive:  { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('PopupBanner', schema);
