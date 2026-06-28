const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  isbn: {
    type: String,
    required: [true, 'ISBN is required'],
    unique: true,
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Fiction', 'Non-Fiction', 'Science', 'Technology', 'History', 'Biography', 'Children', 'Academic', 'Reference', 'Other'],
    default: 'Other'
  },
  description: {
    type: String,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  publisher: {
    type: String,
    trim: true
  },
  publishedYear: {
    type: Number,
    min: [1000, 'Year must be valid'],
    max: [new Date().getFullYear(), 'Year cannot be in the future']
  },
  totalCopies: {
    type: Number,
    required: [true, 'Total copies required'],
    min: [1, 'At least 1 copy required'],
    default: 1
  },
  availableCopies: {
    type: Number,
    default: function () { return this.totalCopies; }
  },
  location: {
    type: String,
    trim: true,
    default: 'General'
  },
  coverImage: {
    type: String,
    default: null
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Text index for search
BookSchema.index({ title: 'text', author: 'text', isbn: 'text', description: 'text' });

module.exports = mongoose.model('Book', BookSchema);
