const express = require('express');
const router = express.Router();
const {
  getBorrows, borrowBook, returnBook, getBorrowStats, deleteBorrow
} = require('../controllers/borrowController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/stats', getBorrowStats);
router.route('/').get(getBorrows).post(borrowBook);
router.put('/:id/return', returnBook);
router.delete('/:id', authorize('admin'), deleteBorrow);

module.exports = router;
