const mongoose = require('mongoose');


const User = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('User', User);