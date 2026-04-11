const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const adminController = require('../controllers/adminController');
const Complaint = require('../models/Complaint');

const router = express.Router();
const statusValues = Complaint.STATUSES;

router.use(authenticate, authorize('admin'));

router.get('/dashboard', adminController.dashboard);
router.get('/departments', adminController.listDepartments);
router.get('/complaints', adminController.listAll);

router.patch(
  '/complaints/:id/assign',
  [param('id').isMongoId(), body('departmentId').isMongoId()],
  adminController.assignDepartment
);

router.patch(
  '/complaints/:id/status',
  [
    param('id').isMongoId(),
    body('status').isIn(statusValues),
    body('resolutionNotes').optional().trim(),
  ],
  adminController.updateStatus
);

router.delete('/complaints/:id', [param('id').isMongoId()], adminController.remove);

module.exports = router;
