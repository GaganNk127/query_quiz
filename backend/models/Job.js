import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  experience: {
    type: String,
    required: true,
    enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead/Manager']
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  type: {
    type: String,
    required: true,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote']
  },
  department: {
    type: String,
    trim: true
  },
  requirements: [{
    type: String,
    trim: true
  }],
  responsibilities: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    default: 'active',
    enum: ['active', 'closed', 'draft']
  },
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicants: [{
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      default: 'pending',
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired']
    }
  }]
}, {
  timestamps: true
});

// Text search index
jobSchema.index({ title: 'text', description: 'text', skills: 'text' });

export default mongoose.model('Job', jobSchema);
