const express = require('express');
const router = express.Router();
const {
  getMembers, getMember, createMember, updateMember, deleteMember
} = require('../controllers/memberController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/').get(getMembers).post(createMember);
router.route('/:id')
  .get(getMember)
  .put(updateMember)
  .delete(authorize('admin'), deleteMember);

module.exports = router;
