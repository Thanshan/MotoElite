const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBookingStatus,
  deleteBooking,
  getBookingStats,
} = require('../controllers/bookingController');
const { protect, adminOnly } = require('../middleware/auth');

const bookingValidation = [
  body('customerName').trim().notEmpty().withMessage('Full name is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('bikeId').notEmpty().withMessage('Bike selection is required'),
  body('preferredDate').isISO8601().withMessage('Valid date is required').toDate(),
];

// Public
router.post('/', bookingValidation, createBooking);

// Admin only
router.get('/', protect, adminOnly, getAllBookings);
router.get('/stats', protect, adminOnly, getBookingStats);
router.get('/:id', protect, adminOnly, getBookingById);
router.put('/:id/status', protect, adminOnly, updateBookingStatus);
router.delete('/:id', protect, adminOnly, deleteBooking);

module.exports = router;
