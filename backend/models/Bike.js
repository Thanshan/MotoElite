const mongoose = require('mongoose');

const bikeSchema = new mongoose.Schema(
  {
    modelName: {
      type: String,
      required: [true, 'Model name is required'],
      trim: true,
    },
    brand: {
      type: String,
      required: [true, 'Brand is required'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    engineCapacity: {
      type: String,
      required: [true, 'Engine capacity is required'],
    },
    image: {
      type: String,
      default: 'default-bike.jpg',
    },
    images: [{ type: String }], // Gallery images
    specifications: {
      engine: String,
      power: String,
      torque: String,
      transmission: String,
      fuelCapacity: String,
      weight: String,
      topSpeed: String,
      brakes: String,
      suspension: String,
      tyres: String,
    },
    features: [{ type: String }],
    availability: {
      type: Boolean,
      default: true,
    },
    comingSoon: {
      type: Boolean,
      default: false,
    },
    expectedLaunchDate: {
      type: Date,
    },
    color: {
      type: String,
      default: 'Midnight Black',
    },
    category: {
      type: String,
      enum: ['Sport', 'Cruiser', 'Adventure', 'Naked', 'Scooter', 'Touring'],
      default: 'Sport',
    },
    description: {
      type: String,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
  },
  { timestamps: true }
);

// Text index for search
bikeSchema.index({ modelName: 'text', brand: 'text', category: 'text' });

module.exports = mongoose.model('Bike', bikeSchema);
