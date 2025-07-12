import mongoose from 'mongoose';

const swapSchema = new mongoose.Schema({
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestedSkill: {
    type: String,
    required: [true, 'Requested skill is required'],
    trim: true
  },
  offeredSkill: {
    type: String,
    required: [true, 'Offered skill is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'completed', 'cancelled'],
    default: 'pending'
  },
  message: {
    type: String,
    maxlength: [1000, 'Message cannot be more than 1000 characters'],
    default: ''
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  location: {
    type: String,
    trim: true,
    default: null
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  isRemote: {
    type: Boolean,
    default: false
  },
  requesterRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  providerRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  requesterReview: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters'],
    default: null
  },
  providerReview: {
    type: String,
    maxlength: [500, 'Review cannot be more than 500 characters'],
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot be more than 200 characters'],
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for swap duration in hours
swapSchema.virtual('durationHours').get(function() {
  return this.duration ? (this.duration / 60).toFixed(1) : 1;
});

// Index for queries
swapSchema.index({ requester: 1, status: 1 });
swapSchema.index({ provider: 1, status: 1 });
swapSchema.index({ status: 1, createdAt: -1 });

// Method to accept swap
swapSchema.methods.accept = function() {
  this.status = 'accepted';
  return this.save();
};

// Method to reject swap
swapSchema.methods.reject = function() {
  this.status = 'rejected';
  return this.save();
};

// Method to complete swap
swapSchema.methods.complete = function() {
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to cancel swap
swapSchema.methods.cancel = function(userId, reason = null) {
  this.status = 'cancelled';
  this.cancelledAt = new Date();
  this.cancelledBy = userId;
  this.cancellationReason = reason;
  return this.save();
};

// Method to add rating
swapSchema.methods.addRating = function(rating, review, isRequester) {
  if (isRequester) {
    this.requesterRating = rating;
    this.requesterReview = review;
  } else {
    this.providerRating = rating;
    this.providerReview = review;
  }
  return this.save();
};

// Static method to get user's swap history
swapSchema.statics.getUserSwaps = function(userId, status = null) {
  const query = {
    $or: [{ requester: userId }, { provider: userId }]
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .populate('requester', 'name avatar location')
    .populate('provider', 'name avatar location')
    .sort({ createdAt: -1 });
};

// Static method to get pending swaps for user
swapSchema.statics.getPendingSwaps = function(userId) {
  return this.find({
    $or: [{ requester: userId }, { provider: userId }],
    status: 'pending'
  })
  .populate('requester', 'name avatar location')
  .populate('provider', 'name avatar location')
  .sort({ createdAt: -1 });
};

export default mongoose.model('Swap', swapSchema); 