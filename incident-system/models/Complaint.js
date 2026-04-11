/**
 * Infrastructure complaint submitted by a citizen.
 * Admin assigns to a department; department updates status and notes.
 */
const mongoose = require('mongoose');

const CATEGORIES = ['roads', 'water', 'electricity', 'waste'];
const STATUSES = ['pending', 'assigned', 'in_progress', 'resolved'];

const complaintSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: CATEGORIES,
      required: true,
    },
    /** Free-text address or landmark */
    location: { type: String, required: true, trim: true },
    /** Optional file path under /uploads after Multer upload */
    image: { type: String, default: null },
    status: {
      type: String,
      enum: STATUSES,
      default: 'pending',
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedDepartment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },
    resolutionNotes: { type: String, default: '', trim: true },
  },
  { timestamps: true }
);

complaintSchema.statics.CATEGORIES = CATEGORIES;
complaintSchema.statics.STATUSES = STATUSES;

module.exports = mongoose.model('Complaint', complaintSchema);
