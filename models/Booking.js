const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userName:   { type: String, required: true },
  userEmail:  { type: String, required: true },
  phone:      { type: String, required: true },
  eventType:  { type: String, required: true },
  eventDate:  { type: Date, default: null },
  guests:     { type: Number, default: 0 },
  price:      { type: Number, default: 0 },
  source:     { type: String, default: 'unknown' },
  status:     { type: String, default: 'Pending' },
  createdAt:  { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
