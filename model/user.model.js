const mongoose = require('mongoose');
const db=require('../config/db');


const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['patient', 'doctor'],
        required: true
    }
});



const User = mongoose.model('User', userSchema);

module.exports = User;