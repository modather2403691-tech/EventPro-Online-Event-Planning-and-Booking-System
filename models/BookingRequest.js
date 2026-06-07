const mongoose = require('mongoose');


const offerSchema = new mongoose.Schema({
  organizerName:  { type: String, required: true },
  organizerEmail: { type: String, required: true },
  price:          { type: Number, required: true },
  createdAt:      { type: Date,   default: Date.now }
}, { _id: false });



const bookingRequestSchema = new mongoose.Schema({
  clientName:  { type: String, required: true },
  clientEmail: { type: String, required: true },
  phone:       { type: String, required: true },
  eventType:   { type: String, required: true },
  eventDate:   { type: Date,   default: null },
  guests:      { type: Number, default: 0 },
  notes:       { type: String, default: '' },


  status:      { type: String, default: 'Open' },

  offers:      { type: [offerSchema], default: [] },

  acceptedOrganizerName:  { type: String, default: '' },
  acceptedOrganizerEmail: { type: String, default: '' },
  acceptedPrice:          { type: Number, default: 0 },

  createdAt:   { type: Date, default: Date.now }
});

module.exports = mongoose.model('BookingRequest', bookingRequestSchema);
