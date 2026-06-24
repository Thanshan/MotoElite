const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  submitContact,
  getAllMessages,
  markAsRead,
  markAsReplied,
  deleteMessage,
} = require('../controllers/contactController');
const { protect, adminOnly } = require('../middleware/auth');

// ─── Validation Rules ─────────────────────────────────────────────
const contactValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),

  body('message')
    .trim()
    .notEmpty()
    .withMessage('Message is required')
    .isLength({ min: 10 })
    .withMessage('Message must be at least 10 characters')
    .isLength({ max: 2000 })
    .withMessage('Message cannot exceed 2000 characters'),
];

// ─── Public Routes ────────────────────────────────────────────────
// POST /api/contact — Submit a contact enquiry
router.post('/', contactValidation, submitContact);

// ─── Admin Routes ─────────────────────────────────────────────────
// GET /api/contact — Get all messages (admin only)
router.get('/', protect, adminOnly, getAllMessages);

// PUT /api/contact/:id/read — Mark as read
router.put('/:id/read', protect, adminOnly, markAsRead);

// PUT /api/contact/:id/replied — Mark as replied
router.put('/:id/replied', protect, adminOnly, markAsReplied);

// DELETE /api/contact/:id — Delete a message
router.delete('/:id', protect, adminOnly, deleteMessage);

module.exports = router;
