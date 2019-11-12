const mongoose = require('mongoose');

const Deal604FieldSchema = new mongoose.Schema({
    deal_name: String,
    lawid: String,
    lender: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    borrower: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    deal_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DealParent',
        unique: true
    },
    itemdata: String,
    keepcondition: String,
    usecondition: String,
    giveawaydeadline: String,
    additional: String,
    duedate: Date,
    usedeadline: Date,

});


module.exports = mongoose.model('Deal604', Deal604FieldSchema);
