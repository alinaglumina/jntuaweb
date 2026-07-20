import mongoose from 'mongoose';
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:      { type: String, required: true, trim: true },
  publishedAt: { type: Date, default: Date.now },
  category:   { type: String, enum: ['news','exam','admission','research','placement','sports','tenders'], default: 'news', index: true },
  attachment: { type: String, default: '' },
  isActive:   { type: Boolean, default: true },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
export default mongoose.model('Notification', schema);
