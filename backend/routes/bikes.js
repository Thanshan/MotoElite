const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getAllBikes,
  getBikeById,
  getBrands,
  createBike,
  updateBike,
  deleteBike,
} = require('../controllers/bikeController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');

const bikeValidation = [
  body('modelName').trim().notEmpty().withMessage('Model name is required'),
  body('brand').trim().notEmpty().withMessage('Brand is required'),
  body('price').isNumeric().withMessage('Price must be a number'),
];

// Public routes
router.get('/', getAllBikes);
router.get('/brands', getBrands);
router.get('/:id', getBikeById);

// Admin routes — allow up to 10 images per upload
router.post('/', protect, adminOnly, upload.array('images', 10), bikeValidation, createBike);
router.put('/:id', protect, adminOnly, upload.array('images', 10), updateBike);
router.delete('/:id', protect, adminOnly, deleteBike);

module.exports = router;
