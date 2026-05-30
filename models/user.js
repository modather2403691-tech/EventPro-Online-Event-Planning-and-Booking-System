const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    dob: { type: Date, required: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['Client', 'Organizer', 'client', 'organizer'], 
        default: 'Client' // دي معناها لو مبعتش حاجة، هيحطه Client
    }
});

module.exports = mongoose.model('User', userSchema);