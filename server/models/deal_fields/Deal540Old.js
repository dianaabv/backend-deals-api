const mongoose = require('mongoose');

const Deal540OldSchema = new mongoose.Schema({
    deal_name: String,
    lawid: String,
    employee: {
	    type: mongoose.Schema.Types.ObjectId,
	    ref: 'User'
    },
    employer: {
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
    payday: String,
    deadline: String,

    additional: String,
    duedate: Date,
});


module.exports = mongoose.model('Deal540Old', Deal540OldSchema);
