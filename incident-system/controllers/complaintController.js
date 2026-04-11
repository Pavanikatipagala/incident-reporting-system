/**
 * Complaint CRUD for citizens (create, list own, update/delete own with rules).
 */
const { validationResult } = require('express-validator');
const Complaint = require('../models/Complaint');
const createError = require('../utils/httpError');

/** POST — create (multipart optional image handled in route) */
exports.create = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { title, description, category, location } = req.body;
    let image = null;
    if (req.file) {
      image = `/uploads/${req.file.filename}`;
    }
    const complaint = await Complaint.create({
      title,
      description,
      category,
      location,
      image,
      citizen: req.user._id,
    });
    await complaint.populate('citizen', 'name email');
    res.status(201).json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

/** GET — list logged-in citizen's complaints */
exports.listMine = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ citizen: req.user._id })
      .populate('assignedDepartment', 'name code')
      .sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (err) {
    next(err);
  }
};

/** GET /:id — single complaint if owner */
exports.getOneCitizen = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate('assignedDepartment', 'name code');
    if (!complaint) throw createError(404, 'Complaint not found');
    if (complaint.citizen.toString() !== req.user._id.toString()) {
      throw createError(403, 'Not allowed to view this complaint');
    }
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

/** PUT /:id — citizen updates own if not resolved */
exports.updateMine = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw createError(404, 'Complaint not found');
    if (complaint.citizen.toString() !== req.user._id.toString()) {
      throw createError(403, 'Not allowed');
    }
    if (complaint.status === 'resolved') {
      throw createError(400, 'Cannot edit a resolved complaint');
    }
    const { title, description, category, location } = req.body;
    if (title != null) complaint.title = title;
    if (description != null) complaint.description = description;
    if (category != null) complaint.category = category;
    if (location != null) complaint.location = location;
    if (req.file) {
      complaint.image = `/uploads/${req.file.filename}`;
    }
    await complaint.save();
    await complaint.populate('assignedDepartment', 'name code');
    res.json({ success: true, complaint });
  } catch (err) {
    next(err);
  }
};

/** DELETE /:id — citizen deletes own if still pending */
exports.deleteMine = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) throw createError(404, 'Complaint not found');
    if (complaint.citizen.toString() !== req.user._id.toString()) {
      throw createError(403, 'Not allowed');
    }
    if (complaint.status !== 'pending') {
      throw createError(400, 'Only complaints in Pending status can be deleted by citizens');
    }
    await complaint.deleteOne();
    res.json({ success: true, message: 'Complaint deleted' });
  } catch (err) {
    next(err);
  }
};
