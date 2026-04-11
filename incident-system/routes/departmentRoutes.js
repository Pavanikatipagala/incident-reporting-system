const express = require('express');
const { body, param } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const departmentController = require('../controllers/departmentController');

const router = express.Router();

router.use(authenticate, authorize('department'));

router.get('/dashboard', departmentController.dashboard);
router.get('/complaints', departmentController.listAssigned);
router.get('/history', departmentController.history);

router.patch(
  '/complaints/:id',
  [
    param('id').isMongoId(),
    body('status').isIn(['in_progress', 'resolved']),
    body('resolutionNotes').optional().trim(),
  ],
  departmentController.updateComplaint
);

module.exports = router;
