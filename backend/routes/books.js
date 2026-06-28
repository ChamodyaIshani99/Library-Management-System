const express = require('express');
const router = express.Router();
const {
  getBooks, getBook, createBook, updateBook, deleteBook, getBookStats
} = require('../controllers/bookController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect); // All routes require auth

router.get('/stats', getBookStats);
router.route('/').get(getBooks).post(createBook);
router.route('/:id').get(getBook).put(updateBook).delete(authorize('admin'), deleteBook);

module.exports = router;
