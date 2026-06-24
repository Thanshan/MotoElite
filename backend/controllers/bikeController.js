const { validationResult } = require('express-validator');
const Bike = require('../models/Bike');
const fs = require('fs');
const path = require('path');

/**
 * @route  GET /api/bikes
 * @desc   Get all bikes with search & filter
 * @access Public
 */
exports.getAllBikes = async (req, res, next) => {
  try {
    const { search, brand, category, available, comingSoon, minPrice, maxPrice, page = 1, limit = 12 } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { modelName: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
      ];
    }

    if (brand) query.brand = { $regex: brand, $options: 'i' };
    if (category) query.category = category;
    if (available !== undefined) query.availability = available === 'true';
    if (comingSoon !== undefined) query.comingSoon = comingSoon === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [bikes, total] = await Promise.all([
      Bike.find(query).sort('-createdAt').skip(skip).limit(Number(limit)),
      Bike.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: bikes.length,
      total,
      pages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      bikes,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/bikes/brands
 * @desc   Get distinct bike brands
 * @access Public
 */
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await Bike.distinct('brand');
    res.status(200).json({ success: true, brands });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  GET /api/bikes/:id
 * @desc   Get single bike by ID
 * @access Public
 */
exports.getBikeById = async (req, res, next) => {
  try {
    const bike = await Bike.findById(req.params.id);
    if (!bike) {
      return res.status(404).json({ success: false, message: 'Bike not found' });
    }
    // Get related bikes (same brand or category, exclude current)
    const related = await Bike.find({
      _id: { $ne: bike._id },
      $or: [{ brand: bike.brand }, { category: bike.category }],
      comingSoon: false,
    }).limit(4);

    res.status(200).json({ success: true, bike, related });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  POST /api/bikes
 * @desc   Create a new bike (admin)
 * @access Admin
 */
exports.createBike = async (req, res, next) => {
  try {
    const bikeData = { ...req.body };

    // Handle multiple uploaded images
    if (req.files && req.files.length > 0) {
      bikeData.image  = req.files[0].filename; // first image = main image
      bikeData.images = req.files.slice(1).map(f => f.filename);
    } else if (req.file) {
      bikeData.image = req.file.filename;
    }

    // Parse nested JSON fields sent as strings via FormData
    if (typeof bikeData.specifications === 'string') {
      try { bikeData.specifications = JSON.parse(bikeData.specifications); } catch (e) {}
    }
    if (typeof bikeData.features === 'string') {
      try { bikeData.features = JSON.parse(bikeData.features); } catch (e) {}
    }

    // Coerce boolean strings
    if (bikeData.availability === 'true') bikeData.availability = true;
    if (bikeData.availability === 'false') bikeData.availability = false;
    if (bikeData.comingSoon === 'true') bikeData.comingSoon = true;
    if (bikeData.comingSoon === 'false') bikeData.comingSoon = false;

    const bike = await Bike.create(bikeData);
    res.status(201).json({ success: true, message: 'Bike added successfully', bike });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  PUT /api/bikes/:id
 * @desc   Update bike (admin)
 * @access Admin
 */
exports.updateBike = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // Parse nested JSON fields
    if (typeof updateData.specifications === 'string') {
      try { updateData.specifications = JSON.parse(updateData.specifications); } catch (e) {}
    }
    if (typeof updateData.features === 'string') {
      try { updateData.features = JSON.parse(updateData.features); } catch (e) {}
    }

    // Coerce boolean strings
    if (updateData.availability === 'true') updateData.availability = true;
    if (updateData.availability === 'false') updateData.availability = false;
    if (updateData.comingSoon === 'true') updateData.comingSoon = true;
    if (updateData.comingSoon === 'false') updateData.comingSoon = false;

    // Parse existing images to retain
    let existingImages = [];
    if (updateData.existingImages) {
      try { existingImages = JSON.parse(updateData.existingImages); } catch (e) {}
      delete updateData.existingImages;
    }

    // Handle newly uploaded images
    const newFilenames = req.files ? req.files.map(f => f.filename) : (req.file ? [req.file.filename] : []);

    // Combine: existing + new
    const allImages = [...existingImages, ...newFilenames];

    if (allImages.length > 0) {
      updateData.image  = allImages[0];
      updateData.images = allImages.slice(1);
    }

    const bike = await Bike.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!bike) {
      return res.status(404).json({ success: false, message: 'Bike not found' });
    }

    res.status(200).json({ success: true, message: 'Bike updated successfully', bike });
  } catch (error) {
    next(error);
  }
};

/**
 * @route  DELETE /api/bikes/:id
 * @desc   Delete bike (admin)
 * @access Admin
 */
exports.deleteBike = async (req, res, next) => {
  try {
    const bike = await Bike.findByIdAndDelete(req.params.id);
    if (!bike) {
      return res.status(404).json({ success: false, message: 'Bike not found' });
    }
    res.status(200).json({ success: true, message: 'Bike deleted successfully' });
  } catch (error) {
    next(error);
  }
};
