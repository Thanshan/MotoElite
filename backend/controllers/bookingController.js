const { validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const Bike = require('../models/Bike');

/**
 * @route  POST /api/bookings
 * @desc   Create new booking (public)
 * @access Public
 */
exports.createBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { customerName, phone, email, address, bikeId, preferredDate, notes } = req.body;

    // Verify bike exists
    const bike = await Bike.findById(bikeId);
    if (!bike) {
      return res.status(404).json({ success: false, message: 'Selected bike not found' });
    }

    const booking = await Booking.create({
      customerName,
      phone,
      email,
      address,
      bikeId,
      bikeName: `${bike.brand} ${bike.modelName}`,
      preferredDate,
      notes,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Booking submitted successfully! We will contact you shortly.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/bookings
 * @desc   Get all bookings with optional status filter (admin)
 * @access Admin
 */
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status && ['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bookings, total] = await Promise.all([
      Booking.find(query)
        .populate('bikeId', 'modelName brand image price')
        .sort('-createdAt')
        .skip(skip)
        .limit(Number(limit)),
      Booking.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bookings.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/bookings/stats
 * @desc   Booking statistics (admin dashboard)
 * @access Admin
 */
exports.getBookingStats = async (req, res, next) => {
  try {
    const [total, pending, confirmed, completed, cancelled] = await Promise.all([
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'pending' }),
      Booking.countDocuments({ status: 'confirmed' }),
      Booking.countDocuments({ status: 'completed' }),
      Booking.countDocuments({ status: 'cancelled' }),
    ]);

    res.status(200).json({
      success: true,
      stats: { total, pending, confirmed, completed, cancelled },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/bookings/:id
 * @desc   Get single booking (admin)
 * @access Admin
 */
exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('bikeId');
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/bookings/:id/status
 * @desc   Update booking status (admin)
 * @access Admin
 */
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('bikeId', 'modelName brand');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.status(200).json({
      success: true,
      message: `Booking marked as ${status}`,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  DELETE /api/bookings/:id
 * @desc   Delete booking (admin)
 * @access Admin
 */
exports.deleteBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }
    res.status(200).json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    next(error);
  }
};
