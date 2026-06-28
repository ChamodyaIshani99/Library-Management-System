const mongoose = require('mongoose');

const BorrowSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: [true, 'Book reference is required']
  },
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    required: [true, 'Member reference is required']
  },
  borrowDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    default: () => new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days
  },
  returnDate: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['borrowed', 'returned', 'overdue', 'lost'],
    default: 'borrowed'
  },
  fineAmount: {
    type: Number,
    default: 0
  },
  finePaid: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  issuedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  returnedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, { timestamps: true });

// Calculate fine on return
BorrowSchema.methods.calculateFine = function () {
  if (this.returnDate && this.returnDate > this.dueDate) {
    const overdueDays = Math.ceil((this.returnDate - this.dueDate) / (1000 * 60 * 60 * 24));
    this.fineAmount = overdueDays * 10; // LKR 10 per day
  }
  return this.fineAmount;
};

module.exports = mongoose.model('Borrow', BorrowSchema);
