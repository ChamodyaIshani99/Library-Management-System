const mongoose = require('mongoose');

const MemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Member name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  membershipId: {
    type: String,
    unique: true
  },
  membershipType: {
    type: String,
    enum: ['Standard', 'Premium', 'Student', 'Senior'],
    default: 'Standard'
  },
  membershipStart: {
    type: Date,
    default: Date.now
  },
  membershipEnd: {
    type: Date,
    default: () => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
  },
  borrowingLimit: {
    type: Number,
    default: 3
  },
  currentBorrows: {
    type: Number,
    default: 0
  },
  totalBorrows: {
    type: Number,
    default: 0
  },
  fineBalance: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Auto-generate membership ID
MemberSchema.pre('save', async function (next) {
  if (!this.membershipId) {
    const count = await mongoose.model('Member').countDocuments();
    this.membershipId = `LIB-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

// Text index for search
MemberSchema.index({ name: 'text', email: 'text', membershipId: 'text' });

module.exports = mongoose.model('Member', MemberSchema);
