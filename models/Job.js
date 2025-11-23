import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true
  },
  company: {
    type: String,
    required: [true, 'Please provide company name']
  },
  description: {
    type: String,
    required: [true, 'Please provide job description']
  },
  requirements: {
    type: String,
    required: [true, 'Please provide job requirements']
  },
  location: {
    type: String,
    required: [true, 'Please provide job location']
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  skills: [String],
  employer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  applicationCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.models.Job || mongoose.model('Job', JobSchema);