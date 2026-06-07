const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
userId:   { type: String, trim: true, unique: true, sparse: true }, 
    // Defaults to Active, so existing pages don't need to know about it
    status:   { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
    lastActiveAt: { type: Date, default: null },

    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    dob:      { type: Date, required: true },
    password: { type: String, required: true },
    phone:    { type: String, required: true },
    photo:    { type: String, default: '' }, // base64 data URL or empty
    active:   { type: Boolean, default: true },
    role: {
        type: String,
        enum: ['Client', 'Organizer', 'Admin', 'client', 'organizer', 'admin'],
        default: 'Client'
    }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);