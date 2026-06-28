const Borrow = require('../models/Borrow');
const Book = require('../models/Book');
const Member = require('../models/Member');

// @desc    Get all borrows with filters
// @route   GET /api/borrows
// @access  Private
exports.getBorrows = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, memberId, bookId } = req.query;
    const query = {};

    if (status) query.status = status;
    if (memberId) query.member = memberId;
    if (bookId) query.book = bookId;

    const total = await Borrow.countDocuments(query);
    const borrows = await Borrow.find(query)
      .populate('book', 'title author isbn')
      .populate('member', 'name membershipId email')
      .populate('issuedBy', 'name')
      .populate('returnedTo', 'name')
      .sort({ borrowDate: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: borrows.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: borrows
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Borrow a book
// @route   POST /api/borrows
// @access  Private
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, memberId, dueDate, notes } = req.body;

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    if (book.availableCopies <= 0) {
      return res.status(400).json({ success: false, message: 'No copies available for borrowing' });
    }

    const member = await Member.findById(memberId);
    if (!member || !member.isActive) {
      return res.status(404).json({ success: false, message: 'Member not found or inactive' });
    }
    if (member.currentBorrows >= member.borrowingLimit) {
      return res.status(400).json({ success: false, message: `Member has reached borrowing limit of ${member.borrowingLimit}` });
    }

    // Check if member already has this book
    const existing = await Borrow.findOne({ book: bookId, member: memberId, status: 'borrowed' });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Member already has this book borrowed' });
    }

    const borrow = await Borrow.create({
      book: bookId,
      member: memberId,
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notes,
      issuedBy: req.user.id
    });

    // Update book and member
    await Book.findByIdAndUpdate(bookId, { $inc: { availableCopies: -1 } });
    await Member.findByIdAndUpdate(memberId, {
      $inc: { currentBorrows: 1, totalBorrows: 1 }
    });

    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name membershipId')
      .populate('issuedBy', 'name');

    res.status(201).json({ success: true, data: populatedBorrow, message: 'Book issued successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Return a book
// @route   PUT /api/borrows/:id/return
// @access  Private
exports.returnBook = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) {
      return res.status(404).json({ success: false, message: 'Borrow record not found' });
    }
    if (borrow.status === 'returned') {
      return res.status(400).json({ success: false, message: 'Book already returned' });
    }

    borrow.returnDate = new Date();
    borrow.status = 'returned';
    borrow.returnedTo = req.user.id;
    borrow.fineAmount = borrow.calculateFine();

    await borrow.save();

    // Update book and member
    await Book.findByIdAndUpdate(borrow.book, { $inc: { availableCopies: 1 } });
    await Member.findByIdAndUpdate(borrow.member, {
      $inc: {
        currentBorrows: -1,
        fineBalance: borrow.fineAmount
      }
    });

    const populatedBorrow = await Borrow.findById(borrow._id)
      .populate('book', 'title author isbn')
      .populate('member', 'name membershipId')
      .populate('returnedTo', 'name');

    res.status(200).json({
      success: true,
      data: populatedBorrow,
      message: `Book returned. Fine: LKR ${borrow.fineAmount}`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get borrow stats / dashboard data
// @route   GET /api/borrows/stats
// @access  Private
exports.getBorrowStats = async (req, res) => {
  try {
    const totalBorrows = await Borrow.countDocuments();
    const activeBorrows = await Borrow.countDocuments({ status: 'borrowed' });
    const overdueBorrows = await Borrow.countDocuments({
      status: 'borrowed',
      dueDate: { $lt: new Date() }
    });
    const returnedToday = await Borrow.countDocuments({
      status: 'returned',
      returnDate: {
        $gte: new Date(new Date().setHours(0, 0, 0, 0)),
        $lte: new Date(new Date().setHours(23, 59, 59, 999))
      }
    });

    // Monthly borrow trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrend = await Borrow.aggregate([
      { $match: { borrowDate: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$borrowDate' }, month: { $month: '$borrowDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: { totalBorrows, activeBorrows, overdueBorrows, returnedToday, monthlyTrend }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete borrow record
// @route   DELETE /api/borrows/:id
// @access  Private (Admin)
exports.deleteBorrow = async (req, res) => {
  try {
    const borrow = await Borrow.findById(req.params.id);
    if (!borrow) return res.status(404).json({ success: false, message: 'Record not found' });
    if (borrow.status === 'borrowed') {
      return res.status(400).json({ success: false, message: 'Cannot delete an active borrow record' });
    }
    await borrow.deleteOne();
    res.status(200).json({ success: true, message: 'Borrow record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
