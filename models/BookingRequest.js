const mongoose = require('mongoose');

// An offer made by an organizer on a client's custom booking request.
const offerSchema = new mongoose.Schema({
  organizerName:  { type: String, required: true },
  organizerEmail: { type: String, required: true },
  price:          { type: Number, required: true },
  createdAt:      { type: Date,   default: Date.now }
}, { _id: false });

// A custom party/event request a client broadcasts to ALL organizers.
// Organizers reply with offers (a price); the client accepts one and it is
// assigned to that organizer.
const bookingRequestSchema = new mongoose.Schema({
  clientName:  { type: String, required: true },
  clientEmail: { type: String, required: true },
  phone:       { type: String, required: true },
  eventType:   { type: String, required: true },
  eventDate:   { type: Date,   default: null },
  guests:      { type: Number, default: 0 },
  notes:       { type: String, default: '' },

  // 'Open'      -> waiting for / collecting offers
  // 'Confirmed' -> client accepted an organizer's offer
  // 'Cancelled' -> client cancelled the request
  status:      { type: String, default: 'Open' },

  offers:      { type: [offerSchema], default: [] },

  acceptedOrganizerName:  { type: String, default: '' },
  acceptedOrganizerEmail: { type: String, default: '' },
  acceptedPrice:          { type: Number, default: 0 },

  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
