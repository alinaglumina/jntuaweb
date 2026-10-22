import mongoose from 'mongoose';

// Faculty Development & Women Empowerment Cell > Internal Complaint Committee members.
const schema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },   // "Name & Designation"
  role:      { type: String, default: 'Member', trim: true }, // Chairperson / Member
  isActive:  { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('IccMember', schema);
