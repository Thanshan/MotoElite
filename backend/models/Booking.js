const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^[0-9+\-\s]{7,15}$/, 'Please provide a valid phone number'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    address: {
      type: String,
      required: [true, 'Address is required'],
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    bikeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Bike',
      required: [true, 'Bike selection is required'],
    },
    bikeName: {
      type: String, // Denormalized for quick display
    },
    preferredDate: {
      type: Date,
      required: [true, 'Preferred visit date is required'],
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
