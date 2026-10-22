import mongoose from 'mongoose';

// Evaluation > Officers > "Additional Controller of Examinations": S.No / Name / Designation.
const schema = new mongoose.Schema({
  name:        { type: String, required: true, trim: true },
  designation: { type: String, default: '', trim: true },
  isActive:    { type: Boolean, default: true },
  sortOrder:   { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model('EvalAddlController', schema);
