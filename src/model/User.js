const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required:[true, 'email can not empty.'],
        unique: [true, 'email is have in system'],
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill correct email address']
    },
    user_name: {
        type: String,
        required: [true, 'user_name can not be empty.']
    },
    pwd: {
        type: String,
        required: [true, 'password can not be empty.'],
        minlength: [6, 'password is least 6 characters'],
        trim: true
    },
    rules: {
        type: String,
        enum : ['BASIC', 'ADMIN', 'DEV'],
        default: 'BASIC'
    },
    created_on: {
        type: Date,
        default: Date.now
    },
    updated_on: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('User', UserSchema);