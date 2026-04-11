const express = require('express');
const { body } = require('express-validator');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const complaintController = require('../controllers/complaintController');

const router = express.Router();
const Complaint = require('../models/Complaint');

const categoryValues = Complaint.CATEGORIES;
const createRules = [
  body('title').trim().notEmpty(),
  body('description').trim().notEmpty(),
  body('category').isIn(categoryValues).withMessage(`category must be one of: ${categoryValues.join(', ')}`),
  body('location').trim().notEmpty(),
];

const updateRules = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().trim().notEmpty(),
  body('category').optional().isIn(categoryValues),
  body('location').optional().trim().notEmpty(),
];

// All complaint citizen routes require login + citizen role
router.use(authenticate, authorize('citizen'));

router.post('/', upload.single('image'), createRules, complaintController.create);
router.get('/my', complaintController.listMine);
router.get('/:id', complaintController.getOneCitizen);
router.put('/:id', upload.single('image'), updateRules, complaintController.updateMine);
router.delete('/:id', complaintController.deleteMine);

module.exports = router;
