/**
 * Admin: view all complaints, assign departments, update status, delete, dashboard stats.
 */
const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const Department = require('../models/Department');
const createError = require('../utils/httpError');

/** GET — all complaints with optional status filter */
exports.listAll = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) {
      filter.status = req.query.status;
    }
    const complaints = await Complaint.find(filter)
      .populate('citizen', 'name email')
      .populate('assignedDepartment', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

/** GET — dashboard counts */
exports.dashboard = async (req, res, next) => {
  try {
    const [total, pending, assigned, inProgress, resolved] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'assigned' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
    ]);
    res.json({
      success: true,
      stats: {
        total,
        pending,
        assigned,
        inProgress,
        resolved,
      },
    });
  } catch (err) {
    next(err);
  }
};

/** PATCH — assign department (sets status to assigned if was pending) */
exports.assignDepartment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw createError(404, 'Complaint not found');
    const dept = await Department.findById(req.body.departmentId);
    if (!dept) throw createError(404, 'Department not found');
    complaint.assignedDepartment = dept._id;
    if (complaint.status === 'pending') {
      complaint.status = 'assigned';
    }
    await complaint.save();
    await complaint.populate('citizen', 'name email');
    await complaint.populate('assignedDepartment', 'name code');
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

/** PATCH — update status (admin) */
exports.updateStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw createError(404, 'Complaint not found');
    complaint.status = req.body.status;
    if (req.body.resolutionNotes != null) {
      complaint.resolutionNotes = req.body.resolutionNotes;
    }
    await complaint.save();
    await complaint.populate('citizen', 'name email');
    await complaint.populate('assignedDepartment', 'name code');
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

/** DELETE — admin removes any complaint */
exports.remove = async (req, res, next) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) throw createError(404, 'Complaint not found');
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    next(err);
  }
};

/** GET — list departments (for admin assign dropdown) */
exports.listDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find().sort({ name: 1 });
    res.json({ success: true, departments });
  } catch (err) {
    next(err);
  }
};







