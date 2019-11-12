const mongoose = require('mongoose');

const TestFieldSchema = new mongoose.Schema({
    to: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    from: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    encrypted: String,
    signed: String,
});


module.exports = mongoose.model('Test', TestFieldSchema);
