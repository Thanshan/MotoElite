const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema(
  {
    serviceName: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
    },
    duration: {
      type: String,
      default: '1-2 hours',
    },
    category: {
      type: String,
      enum: ['Maintenance', 'Repair', 'Inspection', 'Electrical'],
      default: 'Maintenance',
    },
    icon: {
      type: String,
      default: 'wrench',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Service', serviceSchema);
