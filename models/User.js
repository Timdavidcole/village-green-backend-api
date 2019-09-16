var mongoose = require('mongoose');

var UserSchema = new mongoose.Schema({
    username: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/^[a-zA-Z0-9]+$/, 'is invalid'], index: true},
    name: String,
    email: {type: String, lowercase: true, required: [true, "can't be blank"], match: [/\S+@\S+\.\S+/, 'is invalid'], index: true},
    address: String,
    dob: String,
    image: String,
    hash: String,
    salt: String
}, {timestamps: true});

mongoose.model('User', UserSchema);