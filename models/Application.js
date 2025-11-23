import mongoose from 'mongoose';

const ApplicationSchema = new mongoose.Schema({
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  coverLetter: {
    type: String,
    required: [true, 'Please provide a cover letter']
  },
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'accepted', 'rejected'],
    default: 'pending'
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Prevent duplicate applications
ApplicationSchema.index({ job: 1, seeker: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
