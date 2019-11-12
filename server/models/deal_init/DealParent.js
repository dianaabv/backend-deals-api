const mongoose = require('mongoose');

const DealParentSchema = new mongoose.Schema({
    side1: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    side2: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    lawname: String,
    lawid: String,
    duedate: Date,
    status: ''
});


module.exports = mongoose.model('DealParent', DealParentSchema);
