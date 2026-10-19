import mongoose from 'mongoose';

// Directorate "Newsletter" page: one table row per newsletter, scoped to the
// directorate that published it (same scoping as Notification).
const schema = new mongoose.Schema({
  directorateKey: { type: String, default: '', index: true },
  title:          { type: String, required: true, trim: true },
  attachment:     { type: String, default: '' },   // optional
  isActive:       { type: Boolean, default: true },
  sortOrder:      { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('NewsletterIssue', schema);
