const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    dob:      { type: Date, required: true },
    password: { type: String, required: true },
    phone:    { type: String, required: true },
    photo:    { type: String, default: '' }, // base64 data URL or empty
    role: {
        type: String,
        enum: ['Client', 'Organizer', 'client', 'organizer'],
        default: 'Client'
    }
});

module.exports = mongoose.model('User', userSchema);