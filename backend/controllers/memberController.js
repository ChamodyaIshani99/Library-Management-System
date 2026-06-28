const Member = require('../models/Member');
const Borrow = require('../models/Borrow');

// @desc    Get all members with search + pagination
// @route   GET /api/members
// @access  Private
exports.getMembers = async (req, res) => {
  try {
    const { search, page = 1, limit = 10, membershipType, isActive } = req.query;
    const query = {};

    if (isActive !== undefined) query.isActive = isActive === 'true';
    else query.isActive = true;

    if (search) query.$text = { $search: search };
    if (membershipType) query.membershipType = membershipType;

    const total = await Member.countDocuments(query);
    const members = await Member.find(query)
      .populate('addedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      count: members.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: members
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single member
// @route   GET /api/members/:id
// @access  Private
exports.getMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id).populate('addedBy', 'name');
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    const borrowHistory = await Borrow.find({ member: req.params.id })
      .populate('book', 'title author isbn')
      .populate('issuedBy', 'name')
      .sort({ borrowDate: -1 })
      .limit(10);

    res.status(200).json({ success: true, data: { ...member.toObject(), borrowHistory } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Register new member
// @route   POST /api/members
// @access  Private
exports.createMember = async (req, res) => {
  try {
    req.body.addedBy = req.user.id;

    const existingMember = await Member.findOne({ email: req.body.email });
    if (existingMember) {
      return res.status(400).json({ success: false, message: 'Member with this email already exists' });
    }

    const member = await Member.create(req.body);
    res.status(201).json({ success: true, data: member, message: 'Member registered successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update member
// @route   PUT /api/members/:id
// @access  Private
exports.updateMember = async (req, res) => {
  try {
    const member = await Member.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    res.status(200).json({ success: true, data: member, message: 'Member updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete (deactivate) member
// @route   DELETE /api/members/:id
// @access  Private (Admin)
exports.deleteMember = async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) return res.status(404).json({ success: false, message: 'Member not found' });

    if (member.currentBorrows > 0) {
      return res.status(400).json({ success: false, message: 'Member has active borrows. Return all books first.' });
    }

    member.isActive = false;
    await member.save();

    res.status(200).json({ success: true, message: 'Member deactivated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
