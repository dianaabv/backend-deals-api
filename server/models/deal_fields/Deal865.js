const mongoose = require('mongoose');

const Deal865FieldSchema = new mongoose.Schema({
    deal_name: String,
    lawid: String,
    agent: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    principal: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent',
        unique: true
    },
    instructionprincipal: String,
    sizeaward: String,
    order: String,
    payday: String,
    additional: String,
    duedate: Date
});


module.exports = mongoose.model('Deal865', Deal865FieldSchema);
