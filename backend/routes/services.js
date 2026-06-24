const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { getAllServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { protect, adminOnly } = require('../middleware/auth');

const serviceValidation = [
  body('serviceName').trim().notEmpty().withMessage('Service name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
];

router.get('/', getAllServices);
router.post('/', protect, adminOnly, serviceValidation, createService);
router.put('/:id', protect, adminOnly, updateService);
router.delete('/:id', protect, adminOnly, deleteService);

module.exports = router;
