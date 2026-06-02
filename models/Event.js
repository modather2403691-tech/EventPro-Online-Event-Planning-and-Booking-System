const mongoose = require('mongoose');

// An event created by an organizer. Shown on the home pages and bookable by clients.
const eventSchema = new mongoose.Schema({
  title:          { type: String, required: true },
  image:          { type: String, default: '' }, // base64 data URL or empty
  date:           { type: Date,   default: null },
  capacity:       { type: Number, default: 0 },
  location:       { type: String, default: '' },
  rules:          { type: String, default: '' },
  price:          { type: Number, default: 0 },
  category:       { type: String, default: 'party' }, // party | corporate | wedding | birthday | other
  organizerName:  { type: String, default: 'Organizer' },
  organizerEmail: { type: String, default: '' },
  createdAt:      { type: Date,   default: Date.now }
});

module.exports = mongoose.model('Event', eventSchema);
