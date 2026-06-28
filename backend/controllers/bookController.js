const Book = require('../models/Book');

// @desc    Get all books with search, filter, pagination
// @route   GET /api/books
// @access  Private
exports.getBooks = async (req, res) => {
  try {
    const {
      search, category, page = 1, limit = 10,
      sortBy = 'createdAt', sortOrder = 'desc', available
    } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$text = { $search: search };
    }
    if (category) query.category = category;
    if (available === 'true') query.availableCopies = { $gt: 0 };

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .populate('addedBy', 'name email')
      .sort({ [sortBy]: sortOrder === 'asc' ? 1 : -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: books
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single book
// @route   GET /api/books/:id
// @access  Private
exports.getBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('addedBy', 'name email');
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    res.status(200).json({ success: true, data: book });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add new book
// @route   POST /api/books
// @access  Private
exports.createBook = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;
    req.body.availableCopies = req.body.totalCopies;

    const existingBook = await Book.findOne({ isbn: req.body.isbn });
    if (existingBook) {
      return res.status(400).json({ success: false, message: 'Book with this ISBN already exists' });
    }

    const book = await Book.create(req.body);
    res.status(201).json({ success: true, data: book, message: 'Book added successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update book
// @route   PUT /api/books/:id
// @access  Private
exports.updateBook = async (req, res) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    // Adjust available copies if totalCopies changes
    if (req.body.totalCopies !== undefined) {
      const diff = req.body.totalCopies - book.totalCopies;
      req.body.availableCopies = Math.max(0, book.availableCopies + diff);
    }

    book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('addedBy', 'name email');

    res.status(200).json({ success: true, data: book, message: 'Book updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete book (soft delete)
// @route   DELETE /api/books/:id
// @access  Private (Admin only)
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    book.isActive = false;
    await book.save();

    res.status(200).json({ success: true, message: 'Book removed from catalog' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get book categories summary
// @route   GET /api/books/stats
// @access  Private
exports.getBookStats = async (req, res) => {
  try {
    const stats = await Book.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalCopies: { $sum: '$totalCopies' },
          availableCopies: { $sum: '$availableCopies' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const total = await Book.countDocuments({ isActive: true });
    const available = await Book.countDocuments({ isActive: true, availableCopies: { $gt: 0 } });

    res.status(200).json({
      success: true,
      data: { total, available, categories: stats }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
