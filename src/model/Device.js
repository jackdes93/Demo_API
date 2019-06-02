const mongoose = require('mongoose');

const DeviceSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    ip_address: {
        type: String,
        default: '0.0.0.0',
        match: [/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/, 
        'Ip address format error (Ex: 127.0.1.1)'],
        trim: true
    },
    phone_number: {
        type: String,
        trim: true,
        required: [true, 'Phone number is required'],
        minlength: [10, 'Phone number is only 10 characters'],
        maxlength: [10, 'Phone number is only 10 characters']        
    },
    sensor_status : {
        type: String,
        trim: true,
        enum: ['NORMAL', 'ERROR_1', 'ERROR_2'],
        default: 'NORMAL'
    },
    fslim_status : {
        type: String,
        trim: true,
        enum: ['CONNECT', 'DISCONNECT', 'ALARM'],
        default: 'DISCONNECT'
    }
});

module.exports = mongoose.model("Device", DeviceSchema);