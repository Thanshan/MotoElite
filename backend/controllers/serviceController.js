const { validationResult } = require('express-validator');
const Service = require('../models/Service');

/**
 * @route  GET /api/services
 * @desc   Get all active services
 * @access Public
 */
exports.getAllServices = async (req, res, next) => {
  try {
    const query = req.query.all === 'true' ? {} : { isActive: true };
    const services = await Service.find(query).sort('category');
    res.status(200).json({ success: true, count: services.length, services });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /api/services
 * @desc   Create service (admin)
 * @access Admin
 */
exports.createService = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const service = await Service.create(req.body);
    res.status(201).json({ success: true, message: 'Service created successfully', service });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/services/:id
 * @desc   Update service (admin)
 * @access Admin
 */
exports.updateService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }

    res.status(200).json({ success: true, message: 'Service updated successfully', service });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  DELETE /api/services/:id
 * @desc   Delete service (admin)
 * @access Admin
 */
exports.deleteService = async (req, res, next) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) {
      return res.status(404).json({ success: false, message: 'Service not found' });
    }
    res.status(200).json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    next(error);
  }
};
