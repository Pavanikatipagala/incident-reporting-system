/**
 * Department staff: view assigned complaints, update status, add notes, history.
 */
const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const createError = require('../utils/httpError');

function ensureDeptUser(req) {
  if (req.user.role !== 'department' || !req.user.department) {
    throw createError(403, 'Department profile incomplete');
  }
  return req.user.department;
}

/** GET — active workload: assigned to this department, not resolved */
exports.listAssigned = async (req, res, next) => {
  try {
    const deptId = ensureDeptUser(req);
    const complaints = await Complaint.find({
      assignedDepartment: deptId,
      status: { $ne: 'resolved' },
    })
      .populate('citizen', 'name email')
      .sort({ updatedAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

/** GET — resolved complaints handled by this department (history) */
exports.history = async (req, res, next) => {
  try {
    const deptId = ensureDeptUser(req);
    const complaints = await Complaint.find({
      assignedDepartment: deptId,
      status: 'resolved',
    })
      .populate('citizen', 'name email')
      .sort({ updatedAt: -1 })
      .limit(200);
    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

/** PATCH /:id — update status to in_progress or resolved + resolution notes */
exports.updateComplaint = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const deptId = ensureDeptUser(req);
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw createError(404, 'Complaint not found');
    if (!complaint.assignedDepartment || complaint.assignedDepartment.toString() !== deptId.toString()) {
      throw createError(403, 'This complaint is not assigned to your department');
    }
    const { status, resolutionNotes } = req.body;
    // Department can only set in_progress or resolved
    if (!['in_progress', 'resolved'].includes(status)) {
      throw createError(400, 'Department can only set status to in_progress or resolved');
    }
    complaint.status = status;
    if (resolutionNotes != null) {
      complaint.resolutionNotes = resolutionNotes;
    }
    await complaint.save();
    await complaint.populate('citizen', 'name email');
    await complaint.populate('assignedDepartment', 'name code');
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

/** GET — small dashboard for department */
exports.dashboard = async (req, res, next) => {
  try {
    const deptId = ensureDeptUser(req);
    const [openCount, resolvedCount] = await Promise.all([
      Complaint.countDocuments({
        assignedDepartment: deptId,
        status: { $ne: 'resolved' },
      }),
      Complaint.countDocuments({
        assignedDepartment: deptId,
        status: 'resolved',
      }),
    ]);
    res.json({
      success: true,
      stats: { open: openCount, resolved: resolvedCount },
    });
  } catch (err) {
    next(err);
  }
};
