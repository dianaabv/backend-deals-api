const mongoose = require('mongoose');

const DeviceSchema = new mongoose.Schema({
    userid: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    device: String,
    devicePlatform:String
});


module.exports = mongoose.model('Device', DeviceSchema);
