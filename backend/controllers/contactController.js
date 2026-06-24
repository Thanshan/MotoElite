const { validationResult } = require('express-validator');
const ContactMessage = require('../models/ContactMessage');

/**
 * @route  POST /api/contact
 * @desc   Submit a contact message / enquiry
 * @access Public
 */
exports.submitContact = async (req, res, next) => {
  try {
    // Validate incoming fields
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        success: false,
        message: errors.array()[0].msg,
        errors: errors.array(),
      });
    }

    const { name, email, phone, subject, message, bikeInterest } = req.body;

    const contactMsg = await ContactMessage.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      bikeInterest: bikeInterest || null,
    });

    res.status(201).json({
      success: true,
      message: 'Thank you for reaching out! We will get back to you within 2–4 business hours.',
      data: {
        id: contactMsg._id,
        name: contactMsg.name,
        email: contactMsg.email,
        subject: contactMsg.subject,
        createdAt: contactMsg.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/contact
 * @desc   Get all contact messages (admin only)
 * @access Admin
 */
exports.getAllMessages = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, isRead, isReplied } = req.query;
    const query = {};

    if (isRead !== undefined) query.isRead = isRead === 'true';
    if (isReplied !== undefined) query.isReplied = isReplied === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [messages, total] = await Promise.all([
      ContactMessage.find(query)
        .populate('bikeInterest', 'brand modelName')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      ContactMessage.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: messages.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/contact/:id/read
 * @desc   Mark message as read (admin only)
 * @access Admin
 */
exports.markAsRead = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Marked as read', data: msg });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/contact/:id/replied
 * @desc   Mark message as replied (admin only)
 * @access Admin
 */
exports.markAsReplied = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { isReplied: true, isRead: true },
      { new: true }
    );
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Marked as replied', data: msg });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  DELETE /api/contact/:id
 * @desc   Delete a contact message (admin only)
 * @access Admin
 */
exports.deleteMessage = async (req, res, next) => {
  try {
    const msg = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!msg) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    res.status(200).json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    next(error);
  }
};
